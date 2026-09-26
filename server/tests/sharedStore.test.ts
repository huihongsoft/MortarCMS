import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import db, { initDB } from '../src/utils/db';
import {
  DbSharedStore, RedisSharedStore, sharedStore, sharedStoreIfConfigured, resetSharedStore,
  type RedisLikeClient,
} from '../src/utils/sharedStore';
import { registerTask, runTaskNow } from '../src/utils/scheduler';
import { incCounter, countRequest, renderMetrics, readCounter, resetMetrics, setGauge } from '../src/utils/metrics';

// Cross-process state used to be a lie in this codebase: every cache, counter and
// scheduler flag lived in process memory, and a second instance would re-run
// every scheduled task. These pin the two things that fix that — the shared
// store, and the scheduler's use of it — plus the metrics the ops docs point at.

beforeAll(() => { initDB(); });
beforeEach(() => { db.prepare('DELETE FROM SharedCache').run(); resetSharedStore(); });

describe('DbSharedStore', () => {
  it('stores, reads and expires values', async () => {
    const store = new DbSharedStore();
    await store.set('a', 'one', 60_000);
    expect(await store.get('a')).toBe('one');
    await store.set('b', 'two', 1);
    db.prepare("UPDATE SharedCache SET expiresAt = ? WHERE key = 'b'").run(new Date(Date.now() - 1000).toISOString());
    expect(await store.get('b')).toBeNull();      // expired reads as absent
  });

  it('deletes by prefix without touching other keys', async () => {
    const store = new DbSharedStore();
    await store.set('page:1', 'x', 60_000);
    await store.set('page:2', 'x', 60_000);
    await store.set('other:1', 'x', 60_000);
    expect(await store.delPrefix('page:')).toBe(2);
    expect(await store.get('other:1')).toBe('x');
  });

  it('increments atomically and restarts the TTL', async () => {
    const store = new DbSharedStore();
    expect(await store.incr('gen', 60_000)).toBe(1);
    expect(await store.incr('gen', 60_000)).toBe(2);
    expect(await store.get('gen')).toBe('2');
  });

  it('grants a lock to one caller only, and releases it', async () => {
    const store = new DbSharedStore();
    const first = await store.acquireLock('lock:x', 60_000);
    expect(first).toBeTruthy();
    expect(await store.acquireLock('lock:x', 60_000)).toBeNull();
    await first!();
    const second = await store.acquireLock('lock:x', 60_000);
    expect(second).toBeTruthy();
    await second!();
  });

  it('lets a stale lock be stolen, so a crashed holder cannot block forever', async () => {
    const store = new DbSharedStore();
    expect(await store.acquireLock('lock:y', 60_000)).toBeTruthy();
    db.prepare("UPDATE SharedCache SET expiresAt = ? WHERE key = 'lock:y'").run(new Date(Date.now() - 1000).toISOString());
    // The TTL expired: a task must not be blocked by a process that died mid-run.
    expect(await store.acquireLock('lock:y', 60_000)).toBeTruthy();
  });

  it('releases only its own lock', async () => {
    const store = new DbSharedStore();
    const mine = await store.acquireLock('lock:z', 60_000);
    db.prepare("UPDATE SharedCache SET expiresAt = ? WHERE key = 'lock:z'").run(new Date(Date.now() - 1000).toISOString());
    const theirs = await store.acquireLock('lock:z', 60_000);   // stole it after the TTL
    await mine!();                                             // must not steal it back
    expect(await store.get('lock:z')).toBeTruthy();
    await theirs!();
  });

  it('prunes only expired rows', async () => {
    const store = new DbSharedStore();
    await store.set('live', 'x', 60_000);
    await store.set('dead', 'x', 1);
    db.prepare("UPDATE SharedCache SET expiresAt = ? WHERE key = 'dead'").run(new Date(Date.now() - 1000).toISOString());
    expect(await store.prune()).toBe(1);
    expect(await store.get('live')).toBe('x');
  });

  it('is the default, and only shared when asked for', async () => {
    delete process.env.REDIS_URL; delete process.env.SHARED_CACHE;
    expect(await sharedStore()).toBeInstanceOf(DbSharedStore);
    expect(await sharedStoreIfConfigured()).toBeNull();
    process.env.SHARED_CACHE = '1';
    resetSharedStore();
    expect(await sharedStoreIfConfigured()).toBeInstanceOf(DbSharedStore);
    delete process.env.SHARED_CACHE;
  });
});

// A stub with the semantics the adapter relies on: SET NX only sets an absent
// key, SCAN returns matching keys. That is enough to exercise the adapter's own
// logic (prefixing, TTL passing, release-only-own-lock) without a Redis server.
function stubClient(): RedisLikeClient & { data: Map<string, { value: string; expiresAt: number }> } {
  const data = new Map<string, { value: string; expiresAt: number }>();
  const alive = (k: string) => {
    const e = data.get(k);
    if (!e) return null;
    if (e.expiresAt && e.expiresAt <= Date.now()) { data.delete(k); return null; }
    return e;
  };
  return {
    data,
    async get(k) { return alive(k)?.value ?? null; },
    async set(k, v, opts) {
      if (opts?.NX && alive(k)) return null;
      data.set(k, { value: v, expiresAt: opts?.PX ? Date.now() + opts.PX : 0 });
      return 'OK';
    },
    async del(keys) { for (const k of Array.isArray(keys) ? keys : [keys]) data.delete(k); return 1; },
    async incr(k) { const cur = Number(alive(k)?.value || 0) + 1; data.set(k, { value: String(cur), expiresAt: 0 }); return cur; },
    async pExpire(k, ms) { const e = data.get(k); if (e) e.expiresAt = Date.now() + ms; return 1; },
    async scan(_cursor, opts) {
      const match = String(opts?.MATCH || '*').replace(/\*$/, '');
      return { cursor: '0', keys: [...data.keys()].filter((k) => k.startsWith(match)) };
    },
  };
}

describe('RedisSharedStore', () => {
  it('prefixes keys and honours the TTL', async () => {
    const client = stubClient();
    const store = new RedisSharedStore(client, 'test:');
    await store.set('k', 'v', 60_000);
    expect(client.data.has('test:k')).toBe(true);
    expect(await store.get('k')).toBe('v');
    await store.set('short', 'v', 1);
    await new Promise((r) => setTimeout(r, 5));
    expect(await store.get('short')).toBeNull();
  });

  it('deletes a prefix through SCAN', async () => {
    const client = stubClient();
    const store = new RedisSharedStore(client, 'test:');
    await store.set('page:1', 'x', 60_000);
    await store.set('page:2', 'x', 60_000);
    await store.set('other', 'x', 60_000);
    expect(await store.delPrefix('page:')).toBe(2);
    expect(await store.get('other')).toBe('x');
  });

  it('increments and only releases its own lock', async () => {
    const client = stubClient();
    const store = new RedisSharedStore(client, 'test:');
    expect(await store.incr('gen', 60_000)).toBe(1);
    expect(await store.incr('gen', 60_000)).toBe(2);

    const mine = await store.acquireLock('lock', 60_000);
    expect(mine).toBeTruthy();
    expect(await store.acquireLock('lock', 60_000)).toBeNull();   // NX is respected
    // Someone else overwritten the key (TTL expiry + a new holder): our release
    // must not remove their lock.
    await client.set('test:lock', 'someone-else');
    await mine!();
    expect(await store.get('lock')).toBe('someone-else');
  });
});

describe('scheduler uses the shared store', () => {
  function register(id: string, fn: () => Promise<void>, intervalMs = 60_000) {
    registerTask({ id, name: id, desc: 'test', intervalMs, fn });
  }

  it('runs a task once when two instances call it at the same moment', async () => {
    let runs = 0;
    register('test-concurrent', async () => { runs++; await new Promise((r) => setTimeout(r, 20)); });
    const [a, b] = await Promise.all([runTaskNow('test-concurrent'), runTaskNow('test-concurrent')]);
    expect(runs).toBe(1);
    const outcomes = [a, b].filter((r) => r.ok);
    expect(outcomes).toHaveLength(1);
    const skipped = [a, b].find((r) => !r.ok)!;
    expect(skipped.skipped).toBe(true);
    expect(skipped.error).toMatch(/already running|another instance/i);
  });

  it('remembers the last run across a restart', async () => {
    register('test-lastrun', async () => { /* no-op */ });
    await runTaskNow('test-lastrun');
    const stored = (db.prepare("SELECT value FROM Setting WHERE key = 'task_test-lastrun_last_run'").get() as any)?.value;
    expect(Number(stored)).toBeGreaterThan(0);
    // Re-registering is what a restart does; the persisted timestamp comes back
    // with it, so the task does not look due the moment the process boots.
    registerTask({ id: 'test-lastrun', name: 'test-lastrun', desc: 'test', intervalMs: 60_000, fn: async () => {} });
    const { listTasks } = await import('../src/utils/scheduler');
    const task = listTasks().find((t) => t.id === 'test-lastrun') as any;
    expect(task.lastRun).toBe(Number(stored));
  });

  it('frees the lock after the run so the next tick can take it', async () => {
    let runs = 0;
    register('test-relock', async () => { runs++; });
    await runTaskNow('test-relock');
    await runTaskNow('test-relock');
    expect(runs).toBe(2);
  });
});

describe('metrics exposition', () => {
  beforeEach(() => { resetMetrics(); });

  it('renders counters with HELP and TYPE lines', () => {
    incCounter('mortar_test_total', 'A counter', { label: 'a' }, 3);
    countRequest('GET', 200);
    countRequest('GET', 503);
    setGauge('mortar_test_gauge', 'A gauge', 7);
    const text = renderMetrics();
    expect(text).toContain('# TYPE mortar_test_total counter');
    expect(text).toContain('# HELP mortar_test_total A counter');
    expect(text).toContain('mortar_test_total{label="a"} 3');
    // Status classes, not exact codes, so the label set cannot grow unbounded.
    expect(text).toContain('mortar_http_requests_total{method="GET",status="2xx"} 1');
    expect(text).toContain('mortar_http_requests_total{method="GET",status="5xx"} 1');
    expect(text).toContain('mortar_test_gauge 7');
    expect(readCounter('mortar_test_total', { label: 'a' })).toBe(3);
  });

  it('escapes label values and never emits NaN', () => {
    incCounter('mortar_odd_total', 'Odd label', { path: 'a"b\\c' });
    setGauge('mortar_nan_gauge', 'Not a number', Number.NaN);
    const text = renderMetrics();
    expect(text).toContain('path="a\\"b\\\\c"');
    expect(text).not.toMatch(/NaN/);
  });
});
