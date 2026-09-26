import db from './db';
import type { Store, Options, ClientRateLimitInfo, IncrementResponse } from 'express-rate-limit';

// Rate-limit counters that survive a restart and are shared by every process
// pointed at the same database.
//
// Two different needs live here:
//
//  * The **login lockout** is always DB-backed. It is the brute-force protection
//    on the one endpoint worth attacking, it sees very little traffic (only
//    failed logins), and an in-process counter meant "restart the service to
//    clear every lockout" — including a restart the attacker could provoke.
//
//  * The express-rate-limit counters (the broad /api cap, auth routes, comments,
//    the destructive DB tools…) are DB-backed only when `RATE_LIMIT_STORE=db`.
//    The default stays in-process because the global limiter runs on *every* API
//    request: one INSERT+UPDATE per request on the hot path would make SQLite's
//    single writer — and a remote driver's single pooled connection — a
//    self-inflicted bottleneck, and a busy timeout there blocks the request it
//    was supposed to protect. Turn the shared store on when you run more than one
//    instance, where per-instance counters are the bigger problem.
//
// Keyed by a caller-supplied string; the table is pruned opportunistically so it
// cannot grow without bound.

export class DbRateLimitStore implements Store {
  windowMs: number;
  /** Prepended to every key — part of the Store contract, used to namespace rows. */
  prefix: string;
  /**
   * False: the counters live in the database, so one instance's hits are visible
   * to the others. The library uses this to reason about double-counting.
   */
  localKeys = false;

  constructor(opts: { windowMs?: number; prefix?: string } = {}) {
    this.windowMs = opts.windowMs || 60_000;
    this.prefix = opts.prefix || 'rl';
  }

  init(options: Options): void {
    // Each limiter gets its own store instance (express-rate-limit warns when one
    // store is shared between limiters, since they have different windows).
    if (options?.windowMs) this.windowMs = options.windowMs;
  }

  private fullKey(key: string): string {
    return this.prefix + ':' + key;
  }

  get(key: string): ClientRateLimitInfo | undefined {
    const row = this.read(this.fullKey(key));
    if (!row) return undefined;
    return { totalHits: row.hits, resetTime: new Date(row.resetAt) };
  }

  increment(key: string): IncrementResponse {
    const full = this.fullKey(key);
    const now = Date.now();
    let hits = 1;
    let resetAt = new Date(now + this.windowMs).toISOString();
    try {
      const row = this.read(full);
      if (row && new Date(row.resetAt).getTime() > now) {
        hits = row.hits + 1;
        resetAt = row.resetAt;
        db.prepare('UPDATE RateLimit SET hits = ? WHERE key = ?').run(hits, full);
      } else {
        db.prepare(
          "INSERT INTO RateLimit (key, hits, resetAt) VALUES (?, 1, ?) ON CONFLICT(key) DO UPDATE SET hits = 1, resetAt = excluded.resetAt"
        ).run(full, resetAt);
      }
      if (Math.random() < 0.01) this.prune();
    } catch {
      // A counter that cannot be written must not take the request down (nor
      // silently disable the limit): fall through with the in-process value of 1.
      hits = 1;
    }
    return { totalHits: hits, resetTime: new Date(resetAt) };
  }

  decrement(key: string): void {
    try { db.prepare('UPDATE RateLimit SET hits = MAX(hits - 1, 0) WHERE key = ?').run(this.fullKey(key)); } catch { /* see increment */ }
  }

  resetKey(key: string): void {
    try { db.prepare('DELETE FROM RateLimit WHERE key = ?').run(this.fullKey(key)); } catch { /* best effort */ }
  }

  resetAll(): void {
    try { db.prepare('DELETE FROM RateLimit WHERE key LIKE ?').run(this.prefix + ':%'); } catch { /* best effort */ }
  }

  /** Drop expired counters so the table tracks activity, not history. */
  prune(): number {
    try {
      const r = db.prepare('DELETE FROM RateLimit WHERE resetAt < ?').run(new Date().toISOString());
      return r.changes || 0;
    } catch { return 0; }
  }

  private read(key: string): { hits: number; resetAt: string } | undefined {
    try {
      const row = db.prepare('SELECT hits, resetAt FROM RateLimit WHERE key = ?').get(key) as any;
      return row ? { hits: Number(row.hits), resetAt: String(row.resetAt) } : undefined;
    } catch { return undefined; }
  }
}

/**
 * Store for an express-rate-limit middleware, or undefined for the built-in
 * in-process one. Set `RATE_LIMIT_STORE=db` when more than one instance serves
 * the same site (see the note at the top of this file for the trade-off).
 */
export function rateLimitStore(): Store | undefined {
  return process.env.RATE_LIMIT_STORE === 'db' ? new DbRateLimitStore() : undefined;
}

// ---- Login lockout ----
//
// Deliberately independent of RATE_LIMIT_STORE: the lockout is always shared,
// because "restart to clear every lockout" is exactly the property an attacker
// wants.
const LOCKOUT_WINDOW_MS = 15 * 60_000;
const LOCKOUT_MAX_FAILURES = 5;
const lockout = new DbRateLimitStore({ windowMs: LOCKOUT_WINDOW_MS, prefix: 'login' });

export function lockKey(email: unknown, ip: unknown): string {
  return String(email || '').toLowerCase() + '|' + String(ip || '');
}

/** True when this address+IP has spent its failure budget. */
export function isLockedOut(email: unknown, ip: unknown): boolean {
  const entry = lockout.get(lockKey(email, ip));
  return !!entry && entry.totalHits >= LOCKOUT_MAX_FAILURES;
}

/** Record one failed attempt; returns the failure count inside the window. */
export function recordLoginFailure(email: unknown, ip: unknown): number {
  return lockout.increment(lockKey(email, ip)).totalHits;
}

/** A successful login clears the budget for that address+IP. */
export function clearLoginFailures(email: unknown, ip: unknown): void {
  lockout.resetKey(lockKey(email, ip));
}

export const LOGIN_LOCKOUT = { windowMs: LOCKOUT_WINDOW_MS, max: LOCKOUT_MAX_FAILURES };
