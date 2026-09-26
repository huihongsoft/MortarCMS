import db, { withTransaction } from './db';
import { escapeLike } from './sqlLike';
import { logger } from './logger';

// State that has to be visible to more than one process: the scheduler's leader
// lock, the page-cache generation, and (optionally) whatever else needs to agree
// across instances.
//
// Two backends behind one interface:
//   * the database (default — no extra service, and every deployment has one)
//   * Redis, when `REDIS_URL` is set and the optional `redis` package is
//     installed
//
// The interface is async even though better-sqlite3 is synchronous, because a
// Redis client cannot be made synchronous without blocking the event loop that
// the whole server shares. Callers therefore await this; the page cache's hot
// path does not use it at all (it keeps a local Map and polls the generation —
// see utils/cache.ts).
//
// Keys are namespaced by the caller ('lock:scheduler:x', 'cache:generation').

export interface SharedStore {
  readonly kind: 'db' | 'redis';
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlMs: number): Promise<void>;
  del(key: string): Promise<void>;
  /** Delete every key starting with `prefix`; returns how many went. */
  delPrefix(prefix: string): Promise<number>;
  /** Increment and return the new value, (re)starting the TTL. */
  incr(key: string, ttlMs: number): Promise<number>;
  /**
   * Try to take an exclusive lock. Resolves to a release function when this
   * caller got it, or null when another process holds it.
   */
  acquireLock(key: string, ttlMs: number): Promise<(() => Promise<void>) | null>;
  /** Drop expired rows/keys. Returns how many were removed. */
  prune(): Promise<number>;
}

const nowIso = () => new Date().toISOString();

// ---- Database backend ----

export class DbSharedStore implements SharedStore {
  readonly kind = 'db' as const;

  async get(key: string): Promise<string | null> {
    try {
      const row = db.prepare('SELECT value, expiresAt FROM SharedCache WHERE key = ?').get(key) as any;
      if (!row) return null;
      if (row.expiresAt && row.expiresAt <= nowIso()) { await this.del(key); return null; }
      return String(row.value);
    } catch { return null; }
  }

  async set(key: string, value: string, ttlMs: number): Promise<void> {
    try {
      db.prepare(
        'INSERT INTO SharedCache (key, value, expiresAt) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, expiresAt = excluded.expiresAt'
      ).run(key, value, new Date(Date.now() + ttlMs).toISOString());
    } catch (err: any) { logger.warn({ err: err?.message, key }, 'shared store write failed'); }
  }

  async del(key: string): Promise<void> {
    try { db.prepare('DELETE FROM SharedCache WHERE key = ?').run(key); } catch { /* best effort */ }
  }

  async delPrefix(prefix: string): Promise<number> {
    try {
      const r = db.prepare("DELETE FROM SharedCache WHERE key LIKE ? ESCAPE '\\'").run(escapeLike(prefix) + '%');
      return r.changes || 0;
    } catch { return 0; }
  }

  async incr(key: string, ttlMs: number): Promise<number> {
    // Read-and-write inside a transaction: two processes incrementing the
    // generation at once must not read the same value.
    try {
      return withTransaction(() => {
        const row = db.prepare('SELECT value, expiresAt FROM SharedCache WHERE key = ?').get(key) as any;
        const alive = row && (!row.expiresAt || row.expiresAt > nowIso());
        const next = (alive ? Number(row.value) || 0 : 0) + 1;
        db.prepare(
          'INSERT INTO SharedCache (key, value, expiresAt) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, expiresAt = excluded.expiresAt'
        ).run(key, String(next), new Date(Date.now() + ttlMs).toISOString());
        return next;
      });
    } catch { return 0; }
  }

  async acquireLock(key: string, ttlMs: number): Promise<(() => Promise<void>) | null> {
    const token = Math.random().toString(36).slice(2) + Date.now().toString(36);
    const expiresAt = new Date(Date.now() + ttlMs).toISOString();
    try {
      // Clear a stale lock first — a holder that died must not block the task
      // forever — then claim it. The INSERT is what makes it atomic: the primary
      // key means only one process can win, and the loser's insert throws.
      db.prepare('DELETE FROM SharedCache WHERE key = ? AND expiresAt <= ?').run(key, nowIso());
      db.prepare('INSERT INTO SharedCache (key, value, expiresAt) VALUES (?, ?, ?)').run(key, token, expiresAt);
    } catch {
      return null; // held by someone else (or the table is unavailable)
    }
    return async () => {
      try { db.prepare('DELETE FROM SharedCache WHERE key = ? AND value = ?').run(key, token); } catch { /* best effort */ }
    };
  }

  async prune(): Promise<number> {
    try {
      const r = db.prepare('DELETE FROM SharedCache WHERE expiresAt IS NOT NULL AND expiresAt <= ?').run(nowIso());
      return r.changes || 0;
    } catch { return 0; }
  }
}

// ---- Redis backend ----

/**
 * The slice of a Redis client this store needs. Declared structurally so the
 * optional `redis` package is not a build-time dependency, and so the adapter can
 * be tested against a stub.
 */
export interface RedisLikeClient {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, options?: { PX?: number; NX?: boolean }): Promise<unknown>;
  del(keys: string | string[]): Promise<unknown>;
  incr(key: string): Promise<number>;
  pExpire(key: string, ms: number): Promise<unknown>;
  scan(cursor: string | number, options?: { MATCH?: string; COUNT?: number }): Promise<{ cursor: string | number; keys: string[] }>;
}

export class RedisSharedStore implements SharedStore {
  readonly kind = 'redis' as const;
  private client: RedisLikeClient;
  private prefix: string;

  constructor(client: RedisLikeClient, prefix = 'mortar:') {
    this.client = client;
    this.prefix = prefix;
  }

  private k(key: string): string { return this.prefix + key; }

  async get(key: string): Promise<string | null> {
    try { return await this.client.get(this.k(key)); } catch { return null; }
  }

  async set(key: string, value: string, ttlMs: number): Promise<void> {
    try { await this.client.set(this.k(key), value, { PX: Math.max(1, Math.round(ttlMs)) }); }
    catch (err: any) { logger.warn({ err: err?.message, key }, 'shared store write failed'); }
  }

  async del(key: string): Promise<void> {
    try { await this.client.del(this.k(key)); } catch { /* best effort */ }
  }

  async delPrefix(prefix: string): Promise<number> {
    // SCAN, not KEYS: this runs while the server is serving requests.
    let cursor: string | number = 0;
    let removed = 0;
    try {
      do {
        const page = await this.client.scan(cursor, { MATCH: this.k(prefix) + '*', COUNT: 200 });
        cursor = page.cursor;
        if (page.keys.length) { await this.client.del(page.keys); removed += page.keys.length; }
      } while (String(cursor) !== '0');
      return removed;
    } catch { return removed; }
  }

  async incr(key: string, ttlMs: number): Promise<number> {
    try {
      const value = await this.client.incr(this.k(key));
      await this.client.pExpire(this.k(key), Math.max(1, Math.round(ttlMs)));
      return value;
    } catch { return 0; }
  }

  async acquireLock(key: string, ttlMs: number): Promise<(() => Promise<void>) | null> {
    const token = Math.random().toString(36).slice(2) + Date.now().toString(36);
    try {
      // SET NX PX is the atomic primitive; the TTL is what stops a crashed
      // holder from blocking the task forever.
      const res = await this.client.set(this.k(key), token, { NX: true, PX: Math.max(1, Math.round(ttlMs)) });
      if (res === null || res === undefined) return null;
    } catch { return null; }
    return async () => {
      try {
        // Only release our own lock: the TTL may have expired and another
        // process may already hold it.
        const current = await this.client.get(this.k(key));
        if (current === token) await this.client.del(this.k(key));
      } catch { /* best effort */ }
    };
  }

  async prune(): Promise<number> {
    // Redis expires keys itself.
    return 0;
  }
}

// ---- Factory ----

let cached: SharedStore | null | undefined;

/**
 * The configured shared store, or the database one by default.
 *
 * Redis is used only when `REDIS_URL` is set *and* the optional client loads —
 * a missing `npm i redis` logs a warning and falls back rather than refusing to
 * start, because the database path is always available.
 */
export async function sharedStore(): Promise<SharedStore> {
  if (cached !== undefined && cached !== null) return cached;
  const url = process.env.REDIS_URL;
  if (url) {
    try {
      // Optional dependency: absent unless the deployment asked for Redis.
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const mod = require('redis');
      const client = mod.createClient({ url });
      client.on?.('error', (err: any) => logger.warn({ err: err?.message }, 'redis client error'));
      await client.connect?.();
      cached = new RedisSharedStore(client as RedisLikeClient, process.env.REDIS_PREFIX || 'mortar:');
      logger.info('shared store: redis');
      return cached;
    } catch (err: any) {
      logger.warn({ err: err?.message }, 'REDIS_URL is set but the redis client is unavailable — falling back to the database');
    }
  }
  cached = new DbSharedStore();
  return cached;
}

/**
 * The shared store only when the deployment asked for shared state, otherwise
 * null. Used by callers that must not add cross-process traffic on a
 * single-instance install (the page-cache generation poller).
 */
export async function sharedStoreIfConfigured(): Promise<SharedStore | null> {
  if (process.env.REDIS_URL || process.env.SHARED_CACHE === '1') return sharedStore();
  return null;
}

/** Test seam: forget the cached instance. */
export function resetSharedStore(): void { cached = undefined; }
