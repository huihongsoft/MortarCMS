import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import fs from 'fs';
import db, { initDB } from '../src/utils/db';

// Scheduled-task bodies, run directly.
//
// The task list is the one surface where a broken job looks like a working one:
// the run endpoint answers `{ok:true}`, the screen says "task ran (0ms)", and the
// body's own failure is swallowed by its `catch {}`. So these call the tasks and
// assert on what they actually did.
//
// The first case is a real bug found this way: the newsletter digest's cursor
// (`newsletter_last_sent_at`) is written *after* a send, and the task returned
// early when the cursor was absent — so nothing ever set it and the digest could
// never send on any install. The comment above the guard described the opposite.

let sentTo: string[] = [];
// How the stub answers next: {ok:true} is the happy path.
let mailOk = true;
vi.mock('../src/utils/mailer', () => ({
  renderTemplate: (name: string) => ({ subject: 'subject of ' + name, html: '<p>body</p>' }),
  sendEmail: async (to: string) => { sentTo.push(to); return mailOk ? { ok: true } : { ok: false, error: 'SMTP not configured' }; },
}));

const DB_FILE = process.env.MORTAR_DB_PATH || '/tmp/mortar-vitest-tasks.db';
const { registerBuiltinTasks, runTaskNow, listTasks } = await import('../src/utils/scheduler');

function setting(key: string): string | undefined {
  return (db.prepare('SELECT value FROM Setting WHERE key = ?').get(key) as any)?.value;
}

function addPost(id: string, publishedAt = new Date().toISOString()) {
  db.prepare("INSERT OR REPLACE INTO Post (id, title, slug, content, excerpt, status, type, authorId, publishedAt) VALUES (?, ?, ?, '', 'excerpt', 'published', 'post', 'u1', ?)")
    .run(id, 'Title ' + id, id, publishedAt);
}

beforeAll(() => {
  initDB();
  db.prepare("INSERT OR REPLACE INTO User (id, username, email, password, role, tokenVersion) VALUES ('u1','u1','u1@test.dev','x','admin',0)").run();
  registerBuiltinTasks();
});

afterAll(() => {
  for (const s of ['', '-wal', '-shm']) { try { fs.unlinkSync(DB_FILE + s); } catch {} }
});

beforeEach(() => {
  sentTo = [];
  mailOk = true;
  db.prepare('DELETE FROM Subscriber').run();
  db.prepare('DELETE FROM Post').run();
  db.prepare("DELETE FROM Setting WHERE key IN ('newsletter_last_sent_at','newsletter_frequency')").run();
});

function addSubscriber(id: string, email: string) {
  db.prepare("INSERT INTO Subscriber (id, email, status, confirmed) VALUES (?, ?, 'subscribed', 1)").run(id, email);
}

describe('the newsletter digest task', () => {
  it('sends on the first run, then remembers when it sent', async () => {
    addSubscriber('s1', 'reader@test.dev');
    addPost('p1');

    const first = await runTaskNow('newsletter_digest');
    expect(first.ok, first.error).toBe(true);
    expect(sentTo).toEqual(['reader@test.dev']);
    // The cursor is what stops the next run repeating itself, so it has to exist
    // after the first send — it is also what the early return used to depend on,
    // which is why the task could never send at all.
    expect(setting('newsletter_last_sent_at')).toBeTruthy();

    // Second run: nothing published since the first, so nothing is sent.
    sentTo = [];
    const second = await runTaskNow('newsletter_digest');
    expect(second.ok, second.error).toBe(true);
    expect(sentTo).toEqual([]);
  });

  it('sends only what was published since the last digest', async () => {
    addSubscriber('s1', 'reader@test.dev');
    addPost('old', new Date(Date.now() - 3 * 86_400_000).toISOString());

    await runTaskNow('newsletter_digest');
    expect(sentTo).toHaveLength(1);

    // A post published after the cursor is the only thing the next digest carries.
    sentTo = [];
    addPost('fresh');
    await runTaskNow('newsletter_digest');
    expect(sentTo).toEqual(['reader@test.dev']);
  });

  it('does nothing when nobody has confirmed a subscription', async () => {
    addPost('p1');
    const r = await runTaskNow('newsletter_digest');
    expect(r.ok).toBe(true);
    expect(sentTo).toEqual([]);
    // No subscribers means no send, so the cursor must not advance either —
    // otherwise those posts would be skipped once readers do subscribe.
    expect(setting('newsletter_last_sent_at')).toBeFalsy();
  });

  it('does not consume the window when nothing could be delivered', async () => {
    // SMTP unconfigured or down: every send fails. Advancing the cursor here would
    // put these posts outside every later window, so the subscribers would never
    // see them — and the run reports success either way.
    addSubscriber('s1', 'reader@test.dev');
    addPost('p1');
    mailOk = false;

    const r = await runTaskNow('newsletter_digest');
    expect(r.ok).toBe(true);
    expect(sentTo).toEqual(['reader@test.dev']);   // it tried
    expect(setting('newsletter_last_sent_at')).toBeFalsy();  // but did not advance

    // Once mail works, the same posts go out.
    sentTo = [];
    mailOk = true;
    await runTaskNow('newsletter_digest');
    expect(sentTo).toEqual(['reader@test.dev']);
    expect(setting('newsletter_last_sent_at')).toBeTruthy();
  });

  it('honours the weekly frequency setting', async () => {
    addSubscriber('s1', 'reader@test.dev');
    db.prepare("INSERT INTO Setting (id, key, value) VALUES ('newsletter_frequency','newsletter_frequency','weekly') ON CONFLICT(key) DO UPDATE SET value='weekly'").run();
    addPost('p1');

    await runTaskNow('newsletter_digest');
    expect(sentTo).toHaveLength(1);

    // A week has not passed, so the next run is skipped.
    sentTo = [];
    addPost('p2');
    await runTaskNow('newsletter_digest');
    expect(sentTo).toEqual([]);
  });
});

describe('the task list', () => {
  it('reports every registered task with the fields the screen shows', async () => {
    const tasks = listTasks();
    expect(tasks.length).toBeGreaterThanOrEqual(10);
    for (const t of tasks) {
      expect(typeof t.id).toBe('string');
      expect(typeof t.name).toBe('string');
      expect(typeof t.desc).toBe('string');
      expect(typeof t.intervalMs).toBe('number');
      expect(typeof t.runCount).toBe('number');
    }
  });

  it('refuses an unknown task instead of pretending it ran', async () => {
    const r = await runTaskNow('no_such_task');
    expect(r.ok).toBe(false);
    expect(r.error).toBe('Unknown task');
  });
});

describe('run outcomes', () => {
  it('says what it did, not just that it ran', async () => {
    // The task list used to report only ok + duration, which is how a task that
    // did nothing and a task that silently failed looked identical.
    db.prepare("INSERT OR REPLACE INTO Post (id, title, slug, content, excerpt, status, type, authorId, publishedAt) VALUES ('s1','S','s','','','scheduled','post','u1',?)")
      .run(new Date(Date.now() - 60_000).toISOString());
    const r = await runTaskNow('publish_scheduled');
    expect(r.ok).toBe(true);
    expect(r.result).toEqual({ code: 'published scheduled posts', count: 1 });
    // And the list carries it, so the screen can show it without a second call.
    expect((listTasks().find((t: any) => t.id === 'publish_scheduled') || {}).lastResult).toEqual({ code: 'published scheduled posts', count: 1 });
  });

  it('distinguishes "nothing to do" from doing nothing silently', async () => {
    // Nothing is old enough to prune: an outcome the operator can act on, rather
    // than an empty success.
    const r = await runTaskNow('prune_activity');
    expect(r.ok).toBe(true);
    expect(r.result).toEqual({ code: 'nothing to do' });
  });

  it('clears the previous outcome when a run fails', async () => {
    // A stale "已清理 3 条" beside a failed run would be worse than no result.
    db.prepare("INSERT OR REPLACE INTO Post (id, title, slug, content, excerpt, status, type, authorId, publishedAt) VALUES ('s1','S','s','','','scheduled','post','u1',?)")
      .run(new Date(Date.now() - 60_000).toISOString());
    await runTaskNow('publish_scheduled');
    expect((listTasks().find((t: any) => t.id === 'publish_scheduled') || {}).lastResult).toBeTruthy();

    // Force a failure by making the task's table unavailable to it.
    const realPrepare = db.prepare.bind(db);
    (db as any).prepare = (sql: string) => {
      if (/FROM Post WHERE status = 'scheduled'/.test(sql)) throw new Error('boom');
      return realPrepare(sql);
    };
    try {
      const r = await runTaskNow('publish_scheduled');
      expect(r.ok).toBe(false);
      expect(r.result).toBeUndefined();
      expect((listTasks().find((t: any) => t.id === 'publish_scheduled') || {}).lastResult).toBeNull();
    } finally { (db as any).prepare = realPrepare; }
  });
});
