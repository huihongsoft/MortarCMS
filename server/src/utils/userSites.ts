// Which sites a user may act on.
//
// Until this existed, "which site am I working on" came only from the request's
// Host header (middleware/site.ts) — a client-controlled value with no check
// that the caller has anything to do with that site. Any authenticated user
// could point Host at another site's domain and have the AI tools (and the admin
// API) scope their reads and writes to it.
//
// Semantics, chosen so an upgrade cannot lock anyone out:
//   * admins may act on any site;
//   * a user with NO assignments keeps the previous behaviour (any site) — this
//     is what every existing install looks like, so nothing changes for them
//     until an operator assigns sites;
//   * a user WITH assignments may only act on those sites; a request that
//     resolves elsewhere is treated as site-less (global content only) rather
//     than being silently served another site's data.
import db from './db';
import { siteFilterClause } from './siteFilter';

export function getUserSiteIds(userId: string): string[] {
  try {
    return (db.prepare('SELECT siteId FROM UserSite WHERE userId = ?').all(userId) as any[]).map(r => String(r.siteId));
  } catch {
    // No table yet (older database mid-migration): behave as "unrestricted".
    return [];
  }
}

export function setUserSites(userId: string, siteIds: string[]): void {
  try {
    db.prepare('DELETE FROM UserSite WHERE userId = ?').run(userId);
    const ins = db.prepare('INSERT OR IGNORE INTO UserSite (userId, siteId) VALUES (?, ?)');
    for (const id of siteIds) {
      const site = db.prepare('SELECT id FROM Site WHERE id = ?').get(id) as any;
      if (site) ins.run(userId, site.id);
    }
  } catch { /* assigning sites must not break user management */ }
}

// May this user act on this site? `siteId` undefined means "no site resolved"
// (single-site installs, or global scope) and is always allowed.
export function userMayAccessSite(userId: string, role: string, siteId?: string): boolean {
  if (!siteId) return true;
  if (role === 'admin') return true;
  const assigned = getUserSiteIds(userId);
  if (assigned.length === 0) return true; // opt-in: unassigned users are unrestricted
  return assigned.includes(siteId);
}

// This user's sites, or null when unrestricted (admin, or nobody assigned them —
// which is what every install looked like before this feature existed).
export function assignedSites(userId: string, role: string): string[] | null {
  if (role === 'admin') return null;
  const ids = getUserSiteIds(userId);
  return ids.length ? ids : null;
}

// The Host-resolved site, kept only when this user may act on it. Used by the
// admin routes, which scope their queries by `req.siteId` — the header is
// client-controlled, so it decides appearance, not authority.
export function clampResolvedSite(req: { siteId?: string }, userId: string, role: string): string | undefined {
  const siteId = req.siteId || undefined;
  if (!siteId) return undefined;
  return userMayAccessSite(userId, role, siteId) ? siteId : undefined;
}

// Admin list filters ("whose content am I looking at"), validated against the
// caller's assignments. An unrestricted caller keeps the old behaviour:
// absent/'all' = every site, 'global' = site-less content only, <id> = that site.
// An assigned caller is confined to their own sites plus the shared (site-less)
// content, and naming a site outside that set is reported as `denied` so the
// route can answer 403 instead of quietly widening the query.
export function siteScopeForFilter(
  userId: string, role: string, requested: unknown, column = 'siteId',
): { clause: string; params: any[]; denied: boolean } {
  const assigned = assignedSites(userId, role);
  const raw = requested === undefined || requested === null ? 'all' : String(requested);
  if (!assigned) return { ...siteFilterClause(raw, column), denied: false };
  if (raw === '' || raw === 'all') {
    return {
      clause: ` AND (${column} IS NULL OR ${column} IN (${assigned.map(() => '?').join(',')}))`,
      params: [...assigned],
      denied: false,
    };
  }
  if (raw === 'global') return { clause: ` AND ${column} IS NULL`, params: [], denied: false };
  if (!assigned.includes(raw)) return { clause: '', params: [], denied: true };
  return { clause: ` AND ${column} = ?`, params: [raw], denied: false };
}

// Body `siteId` on create/update. null/'' means "no site" (shared content) and is
// always allowed; naming a site requires that site to be one of the caller's.
export function mayWriteSite(userId: string, role: string, siteId: unknown): boolean {
  const assigned = assignedSites(userId, role);
  if (!assigned) return true;
  const v = siteId === undefined || siteId === null || siteId === '' ? null : String(siteId);
  return v === null || assigned.includes(v);
}
