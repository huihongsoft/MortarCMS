import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import { initDB } from '../src/utils/db';
import db from '../src/utils/db';
import {
  DbRateLimitStore, rateLimitStore, lockKey,
  isLockedOut, recordLoginFailure, clearLoginFailures, LOGIN_LOCKOUT,
} from '../src/utils/rateLimitStore';

// The login lockout used to be a Map in the auth module: restarting the process
// cleared every lockout, and the map's size cap evicted entries under load — so
// an attacker could flush the brute-force protection by generating enough
// distinct addresses, or by waiting for a deploy. These pin the shared behaviour.
beforeAll(() => { initDB(); });
beforeEach(() => { db.prepare('DELETE FROM RateLimit').run(); });

describe('DbRateLimitStore', () => {
  it('counts hits inside the window', () => {
    const store = new DbRateLimitStore({ windowMs: 60_000, prefix: 't1' });
    expect(store.increment('a').totalHits).toBe(1);
    expect(store.increment('a').totalHits).toBe(2);
    expect(store.increment('b').totalHits).toBe(1);
    expect(store.get('a')?.totalHits).toBe(2);
  });

  it('starts a new window once the old one expired', () => {
    const store = new DbRateLimitStore({ windowMs: 1, prefix: 't2' });
    expect(store.increment('a').totalHits).toBe(1);
    // Force the stored window into the past rather than sleeping.
    db.prepare("UPDATE RateLimit SET resetAt = ? WHERE key = 't2:a'").run(new Date(Date.now() - 1000).toISOString());
    expect(store.increment('a').totalHits).toBe(1);
  });

  it('decrements, resets one key, and resets its own prefix only', () => {
    const store = new DbRateLimitStore({ windowMs: 60_000, prefix: 't3' });
    const other = new DbRateLimitStore({ windowMs: 60_000, prefix: 'other' });
    store.increment('a'); store.increment('a'); other.increment('a');

    store.decrement('a');
    expect(store.get('a')?.totalHits).toBe(1);
    store.decrement('a'); store.decrement('a');       // never below zero
    expect(store.get('a')?.totalHits).toBe(0);

    store.increment('a');
    store.resetKey('a');
    expect(store.get('a')).toBeUndefined();

    store.increment('a'); other.increment('a');
    const otherBefore = other.get('a')!.totalHits;
    store.resetAll();
    expect(store.get('a')).toBeUndefined();
    expect(other.get('a')?.totalHits).toBe(otherBefore);   // another limiter is untouched
  });

  it('declares itself shared, so the library does not treat it as per-process', () => {
    expect(new DbRateLimitStore().localKeys).toBe(false);
  });

  it('prunes expired rows', () => {
    const store = new DbRateLimitStore({ windowMs: 1, prefix: 't4' });
    store.increment('a');
    db.prepare("UPDATE RateLimit SET resetAt = ? WHERE key = 't4:a'").run(new Date(Date.now() - 1000).toISOString());
    expect(store.prune()).toBe(1);
    expect(db.prepare('SELECT COUNT(*) c FROM RateLimit').get()).toBeTruthy();
  });

  it('is used only when the shared store is asked for', () => {
    delete process.env.RATE_LIMIT_STORE;
    expect(rateLimitStore()).toBeUndefined();          // in-process default
    process.env.RATE_LIMIT_STORE = 'db';
    expect(rateLimitStore()).toBeInstanceOf(DbRateLimitStore);
    delete process.env.RATE_LIMIT_STORE;
  });
});

describe('login lockout', () => {
  it('locks after the failure budget and clears on success', () => {
    const email = 'lock@test.dev';
    const ip = '10.0.0.1';
    for (let i = 0; i < LOGIN_LOCKOUT.max - 1; i++) recordLoginFailure(email, ip);
    expect(isLockedOut(email, ip)).toBe(false);
    recordLoginFailure(email, ip);
    expect(isLockedOut(email, ip)).toBe(true);

    clearLoginFailures(email, ip);
    expect(isLockedOut(email, ip)).toBe(false);
  });

  it('scopes the lock to the address *and* the IP, so a victim cannot be locked out', () => {
    const email = 'victim@test.dev';
    for (let i = 0; i < LOGIN_LOCKOUT.max; i++) recordLoginFailure(email, '203.0.113.9');
    expect(isLockedOut(email, '203.0.113.9')).toBe(true);
    // The same account from the legitimate user's own address is unaffected.
    expect(isLockedOut(email, '198.51.100.4')).toBe(false);
  });

  it('survives a process restart, which an in-process Map did not', () => {
    const email = 'restart@test.dev';
    for (let i = 0; i < LOGIN_LOCKOUT.max; i++) recordLoginFailure(email, '10.0.0.2');
    expect(isLockedOut(email, '10.0.0.2')).toBe(true);
    // A restart is exactly "the in-memory state is gone"; the row is not, and the
    // lockout state has no in-memory component to lose.
    expect(db.prepare('SELECT hits FROM RateLimit WHERE key = ?').get('login:' + lockKey(email, '10.0.0.2'))).toBeTruthy();
    expect(isLockedOut(email, '10.0.0.2')).toBe(true);
  });
});
