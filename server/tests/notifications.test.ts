import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import fs from 'fs';
import express from 'express';
import db, { initDB } from '../src/utils/db';
import { signToken } from '../src/utils/jwt';
import { notify, listFor, unreadCount, markRead, markAllRead, removeForTask, pruneRead } from '../src/utils/notifications';
import notificationRoutes from '../src/routes/notifications';
import postRoutes from '../src/routes/posts';

// The review flow wrote its "your submission was approved" into AiNotification —
// the AI assistant's table — so the bell mixed editorial workflow with chat task
// reports, and there was no email at all: a contributor who submitted through the
// public form heard nothing back unless they opened the admin and noticed.
// Migration 24 generalises the table and moves the rows; these pin the behaviour.
const DB_FILE = process.env.MORTAR_DB_PATH || '/tmp/mortar-vitest-notifications.db';
let server: any;
let base = '';

const token = (id: string, role: string) => ({ Authorization: 'Bearer ' + signToken({ userId: id, role, v: 0 }), 'content-type': 'application/json' });

function addUser(id: string, role = 'author') {
  db.prepare('INSERT INTO User (id, username, email, password, role, tokenVersion) VALUES (?, ?, ?, ?, ?, 0)')
    .run(id, id, id + '@test.dev', 'x', role);
}

beforeAll(async () => {
  initDB();
  addUser('author1');
  addUser('editor1', 'editor');
  const app = express();
  app.use(express.json());
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/posts', postRoutes);
  server = app.listen(0);
  await new Promise((r) => server.on('listening', r));
  base = 'http://127.0.0.1:' + server.address().port;
});

afterAll(() => {
  server?.close();
  for (const s of ['', '-wal', '-shm']) { try { fs.unlinkSync(DB_FILE + s); } catch {} }
});

beforeEach(() => { db.prepare('DELETE FROM Notification').run(); });

describe('the table', () => {
  it('replaced AiNotification and carried its rows over', () => {
    expect(db.prepare("SELECT 1 FROM sqlite_master WHERE name = 'Notification'").get()).toBeTruthy();
    expect(db.prepare("SELECT 1 FROM sqlite_master WHERE name = 'AiNotification'").get()).toBeUndefined();
  });

  it('stores, counts and lists per user', () => {
    notify({ userId: 'author1', kind: 'ai', message: 'first' });
    notify({ userId: 'author1', kind: 'review', message: 'second', link: '/posts/x/edit' });
    notify({ userId: 'editor1', kind: 'ai', message: 'theirs' });
    expect(unreadCount('author1')).toBe(2);
    const list = listFor('author1');
    expect(list).toHaveLength(2);
    expect(list.map((n) => n.message).sort()).toEqual(['first', 'second']);
    expect(list.find((n) => n.message === 'second')!.link).toBe('/posts/x/edit');
    // Nobody sees anyone else's.
    expect(listFor('editor1').map((n) => n.message)).toEqual(['theirs']);
  });

  it('lists newest first', () => {
    // Written a second apart: two notifications created in the same millisecond
    // have no meaningful order (createdAt is the sort, and it is the same value).
    const older = notify({ userId: 'author1', kind: 'ai', message: 'older' })!;
    db.prepare('UPDATE Notification SET createdAt = ? WHERE id = ?').run(new Date(Date.now() - 60_000).toISOString(), older);
    notify({ userId: 'author1', kind: 'ai', message: 'newer' });
    expect(listFor('author1').map((n) => n.message)).toEqual(['newer', 'older']);
  });

  it('marks read, scoped to the owner', () => {
    const id = notify({ userId: 'author1', kind: 'ai', message: 'mine' })!;
    // Another account's click does nothing.
    expect(markRead('editor1', id)).toBe(false);
    expect(unreadCount('author1')).toBe(1);
    expect(markRead('author1', id)).toBe(true);
    expect(unreadCount('author1')).toBe(0);
  });

  it('marks everything read and prunes only read rows', () => {
    const old = notify({ userId: 'author1', kind: 'ai', message: 'old' })!;
    notify({ userId: 'author1', kind: 'ai', message: 'new' });
    db.prepare('UPDATE Notification SET createdAt = ? WHERE id = ?').run(new Date(Date.now() - 90 * 86_400_000).toISOString(), old);
    // Unread and old: kept.
    expect(pruneRead(new Date(Date.now() - 30 * 86_400_000).toISOString())).toBe(0);

    expect(markAllRead('author1')).toBe(2);
    expect(pruneRead(new Date(Date.now() - 30 * 86_400_000).toISOString())).toBe(1);
    expect(listFor('author1').map((n) => n.message)).toEqual(['new']);
  });

  it('drops a task’s notifications together', () => {
    notify({ userId: 'author1', kind: 'ai_task', message: 'a', taskId: 'task-1' });
    notify({ userId: 'author1', kind: 'ai_task', message: 'b', taskId: 'task-1' });
    notify({ userId: 'author1', kind: 'ai', message: 'c' });
    removeForTask('task-1');
    expect(listFor('author1').map((n) => n.message)).toEqual(['c']);
  });
});

describe('the API', () => {
  it('serves the caller’s own list and unread count', async () => {
    notify({ userId: 'author1', kind: 'review', message: 'hello' });
    const r = await fetch(base + '/api/notifications', { headers: token('author1', 'author') });
    const body = await r.json();
    expect(body.unread).toBe(1);
    expect(body.notifications).toHaveLength(1);
  });

  it('marks one read and then all read', async () => {
    const id = notify({ userId: 'author1', kind: 'review', message: 'one' })!;
    notify({ userId: 'author1', kind: 'review', message: 'two' });
    expect((await fetch(base + '/api/notifications/' + id + '/read', { method: 'POST', headers: token('author1', 'author') })).status).toBe(200);
    expect((await (await fetch(base + '/api/notifications', { headers: token('author1', 'author') })).json()).unread).toBe(1);
    const all = await (await fetch(base + '/api/notifications/read-all', { method: 'POST', headers: token('author1', 'author') })).json();
    expect(all.marked).toBe(1);
    expect((await (await fetch(base + '/api/notifications', { headers: token('author1', 'author') })).json()).unread).toBe(0);
  });

  it('requires a session', async () => {
    expect((await fetch(base + '/api/notifications')).status).toBe(401);
  });
});

describe('reviewing a submission', () => {
  async function submit(): Promise<string> {
    const r = await fetch(base + '/api/posts', {
      method: 'POST', headers: token('author1', 'author'),
      body: JSON.stringify({ title: 'A contribution', content: 'body', status: 'draft' }),
    });
    const post = await r.json();
    db.prepare("UPDATE Post SET status = 'pending' WHERE id = ?").run(post.id);
    return post.id;
  }

  it('notifies the author and links to the post when it is rejected', async () => {
    const id = await submit();
    const r = await fetch(base + '/api/posts/' + id + '/review', {
      method: 'POST', headers: token('editor1', 'editor'),
      body: JSON.stringify({ action: 'reject', reason: 'Not our topic' }),
    });
    expect(r.status).toBe(200);

    // Back to draft, and the author has a notification that says why and where.
    expect((db.prepare('SELECT status FROM Post WHERE id = ?').get(id) as any).status).toBe('draft');
    const note = listFor('author1')[0];
    expect(note.kind).toBe('review');
    expect(note.message).toContain('A contribution');
    expect(note.message).toContain('Not our topic');
    expect(note.link).toBe('/posts/' + id + '/edit');
  });

  it('publishes and notifies on approval', async () => {
    const id = await submit();
    const r = await fetch(base + '/api/posts/' + id + '/review', {
      method: 'POST', headers: token('editor1', 'editor'), body: JSON.stringify({ action: 'approve' }),
    });
    expect(r.status).toBe(200);
    expect((db.prepare('SELECT status FROM Post WHERE id = ?').get(id) as any).status).toBe('published');
    expect(listFor('author1')[0].message).toContain('已通过审核');
  });

  it('refuses a submission that is not pending', async () => {
    const id = await submit();
    await fetch(base + '/api/posts/' + id + '/review', { method: 'POST', headers: token('editor1', 'editor'), body: JSON.stringify({ action: 'approve' }) });
    const again = await fetch(base + '/api/posts/' + id + '/review', { method: 'POST', headers: token('editor1', 'editor'), body: JSON.stringify({ action: 'approve' }) });
    expect(again.status).toBe(400);
  });
});
