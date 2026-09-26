import db, { cuid } from './db';
import { logger } from './logger';

// Old paths that must keep working.
//
// The lookup sits in front of the public site, so it is cached: the whole table
// is small (an operator writes these by hand, plus one per published slug
// change), and reading it once per process per few seconds beats a query on every
// unknown path. Mutations invalidate the cache; on a multi-instance install a
// redirect added on one instance reaches the others within the TTL.

export interface RedirectRow {
  id: string;
  fromPath: string;
  toPath: string;
  status: number;
  siteId: string | null;
  hits: number;
  createdAt: string;
  /** 'slug-change' | 'import' | 'admin' — shown so the automatic ones are visible. */
  createdBy: string;
}

const CACHE_TTL_MS = 5000;
let cache: { at: number; byPath: Map<string, RedirectRow[]> } | null = null;

export function invalidateRedirectCache(): void { cache = null; }

/** Path → rows, so the lookup stays a hash hit rather than a table scan. */
function byPath(): Map<string, RedirectRow[]> {
  const now = Date.now();
  if (cache && now - cache.at < CACHE_TTL_MS) return cache.byPath;
  const map = new Map<string, RedirectRow[]>();
  try {
    for (const row of db.prepare('SELECT id, fromPath, toPath, status, siteId, hits, createdAt, createdBy FROM Redirect').all() as RedirectRow[]) {
      const list = map.get(row.fromPath);
      if (list) list.push(row); else map.set(row.fromPath, [row]);
    }
  } catch { /* the table arrives with migration 22 */ }
  cache = { at: now, byPath: map };
  return map;
}

/** Strip the query/hash, collapse a trailing slash, and require a leading one. */
export function normalizePath(raw: unknown): string {
  let p = String(raw ?? '').trim();
  const cut = p.search(/[?#]/);
  if (cut >= 0) p = p.slice(0, cut);
  if (!p) return '/';
  if (!p.startsWith('/')) p = '/' + p;
  if (p.length > 1 && p.endsWith('/')) p = p.replace(/\/+$/, '');
  return p || '/';
}

/**
 * A target is either a path on this site or an explicit http(s) URL — never
 * anything else. `javascript:` and `data:` in a Location header are an XSS
 * vector, and a scheme-relative `//evil.example` is an open redirect that reads
 * like a path.
 */
export function normalizeTarget(raw: unknown): string | null {
  const value = String(raw ?? '').trim();
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith('//')) return null;         // protocol-relative: not a path
  if (/^[a-z][a-z0-9+.-]*:/i.test(value)) return null;  // any other scheme
  return normalizePath(value);
}

/** The redirect for a path, most specific site first (site row beats global). */
export function resolveRedirect(rawPath: string, siteId?: string): RedirectRow | null {
  const path = normalizePath(rawPath);
  if (path === '/') return null;
  const rows = byPath().get(path);
  if (!rows || rows.length === 0) return null;
  if (siteId) {
    const own = rows.find((r) => r.siteId === siteId);
    if (own) return own;
  }
  return rows.find((r) => r.siteId === null) || null;
}

export function countHit(id: string): void {
  try {
    db.prepare('UPDATE Redirect SET hits = hits + 1 WHERE id = ?').run(id);
  } catch (err: any) { logger.warn({ err: err?.message }, 'redirect hit counter failed'); }
}

/**
 * Record that a published item moved, so the old URL keeps working.
 *
 * Called when a slug changes. Keyed on the old path: re-editing a slug twice must
 * leave one redirect pointing at the current URL, not a chain, so an existing row
 * for that path is repointed rather than duplicated.
 */
export function recordMovedPath(oldPath: string, newPath: string, siteId?: string | null): boolean {
  const from = normalizePath(oldPath);
  const to = normalizeTarget(newPath);
  if (!to || from === '/' || from === to) return false;
  try {
    const existing = db.prepare('SELECT id FROM Redirect WHERE fromPath = ? AND ' + (siteId ? 'siteId = ?' : 'siteId IS NULL'))
      .get(...(siteId ? [from, siteId] : [from])) as any;
    if (existing) {
      db.prepare('UPDATE Redirect SET toPath = ?, status = 301 WHERE id = ?').run(to, existing.id);
    } else {
      db.prepare('INSERT INTO Redirect (id, fromPath, toPath, status, siteId, hits, createdAt, createdBy) VALUES (?, ?, ?, 301, ?, 0, ?, ?)')
        .run(cuid(), from, to, siteId || null, new Date().toISOString(), 'slug-change');
    }
    invalidateRedirectCache();
    return true;
  } catch (err: any) {
    // Never fail the content save because the redirect could not be written.
    logger.warn({ err: err?.message, from, to }, 'could not record a moved path');
    return false;
  }
}
