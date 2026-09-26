import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import fs from 'fs';
import express from 'express';
import db, { initDB } from '../src/utils/db';
import { signToken } from '../src/utils/jwt';

// The GDPR endpoints.
//
// Erasure is the one operation in the product that cannot be undone, so what is
// pinned here is not "it deletes things" but the *policy*: what goes, what is
// anonymized instead (the site owner's posts and form submissions stay), and what
// must survive for the database to remain consistent.

const DB_FILE = process.env.MORTAR_DB_PATH || '/tmp/mortar-vitest-gdpr.db';
let server: any;
let base = '';
const token = (id: string, role: string) => ({ Authorization: 'Bearer ' + signToken({ userId: id, role, v: 0 }), 'content-type': 'application/json' });

beforeAll(async () => {
  initDB();
  const app = express();
  app.use(express.json());
  app.use('/api/gdpr', (await import('../src/routes/gdpr')).default);
  server = app.listen(0);
  await new Promise((r) => server.on('listening', r));
  base = 'http://127.0.0.1:' + server.address().port;
});

afterAll(() => {
  server?.close();
  for (const s of ['', '-wal', '-shm']) { try { fs.unlinkSync(DB_FILE + s); } catch {} }
});

beforeEach(() => {
  db.prepare('DELETE FROM Comment').run();
  db.prepare('DELETE FROM Post').run();
  db.prepare('DELETE FROM Notification').run();
  db.prepare('DELETE FROM Activity').run();
  db.prepare('DELETE FROM AppPassword').run();
  db.prepare('DELETE FROM User').run();
});

function addUser(id: string, role = 'author', email = id + '@test.dev') {
  db.prepare('INSERT INTO User (id, username, email, password, role, tokenVersion) VALUES (?, ?, ?, ?, ?, 0)')
    .run(id, id, email, 'x', role);
}

function seedPersonalData(userId: string) {
  // The post first: Comment.postId is a foreign key.
  db.prepare("INSERT INTO Post (id, title, slug, content, excerpt, status, type, authorId, publishedAt) VALUES ('p1','Mine','mine','','','published','post',?,?)")
    .run(userId, new Date().toISOString());
  db.prepare("INSERT INTO Comment (id, postId, author, email, content, status, userId) VALUES ('c1','p1','Ann','ann@test.dev','hi','approved',?)").run(userId);
  db.prepare("INSERT INTO Notification (id, userId, kind, message, read, taskId, createdAt) VALUES ('n1',?,'test','hello',0,'task',?)")
    .run(userId, new Date().toISOString());
  db.prepare("INSERT INTO Activity (id, userId, action, detail) VALUES ('a1',?, 'post_created', 'x')").run(userId);
  db.prepare("INSERT INTO AppPassword (id, userId, name, hash) VALUES ('ap1',?,'cli','tok')").run(userId);
}

describe('export', () => {
  it('returns the personal data the user is entitled to see', async () => {
    addUser('u1');
    seedPersonalData('u1');
    const res = await fetch(base + '/api/gdpr/export', { headers: token('u1', 'author') });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.user.email).toBe('u1@test.dev');
    expect(body.comments).toHaveLength(1);
    expect(body.posts.map((p: any) => p.slug)).toEqual(['mine']);
    // The record of what was done to the account travels with it; an export that
    // omitted it would not be a complete answer to a subject-access request.
    expect(body.activity).toHaveLength(1);
    // Never the credential itself.
    expect(JSON.stringify(body)).not.toContain('"tok"');
  });
});

describe('erasure', () => {
  it('anonymizes authored content and clears the personal tables', async () => {
    addUser('u1');
    seedPersonalData('u1');

    const res = await fetch(base + '/api/gdpr/erase', { method: 'POST', headers: token('u1', 'author') });
    expect(res.status).toBe(200);

    // Comments are anonymized, not deleted: the conversation belongs to the post.
    const comment = db.prepare("SELECT author, email, userId FROM Comment WHERE id = 'c1'").get() as any;
    expect(comment).toEqual({ author: 'Anonymous', email: '', userId: null });

    // Personal-data tables are emptied.
    expect(db.prepare("SELECT COUNT(*) c FROM Notification WHERE userId = 'u1'").get()).toEqual({ c: 0 });
    expect(db.prepare("SELECT COUNT(*) c FROM Activity WHERE userId = 'u1'").get()).toEqual({ c: 0 });
    expect(db.prepare("SELECT COUNT(*) c FROM AppPassword WHERE userId = 'u1'").get()).toEqual({ c: 0 });

    // The post survives — it is the site's content — and its author now resolves
    // to the anonymized placeholder rather than to a person. (Post.authorId is
    // NOT NULL, so with no other admin to reassign to, the row has to stay.)
    const post = db.prepare("SELECT authorId FROM Post WHERE id = 'p1'").get() as any;
    expect(post).toBeTruthy();
    const author = db.prepare('SELECT username, email FROM User WHERE id = ?').get(post.authorId) as any;
    expect(author.username).not.toBe('u1');
    expect(author.email).toMatch(/@local\.invalid$/);
  });

  it('keeps an anonymized placeholder when there is no other admin to own the posts', async () => {
    addUser('u1');
    seedPersonalData('u1');

    await fetch(base + '/api/gdpr/erase', { method: 'POST', headers: token('u1', 'author') });

    // No other admin existed, so the row has to stay for the foreign key — but
    // nothing identifying may remain in it.
    const row = db.prepare("SELECT username, email, role, bio, avatar FROM User WHERE id = 'u1'").get() as any;
    expect(row).toBeTruthy();
    expect(row.username).not.toBe('u1');
    expect(row.email).toMatch(/@local\.invalid$/);
    expect(row.bio).toBe('');
    expect(row.avatar).toBe('');
  });

  it('removes the account outright when another admin can take the posts', async () => {
    addUser('boss', 'admin');
    addUser('u1');
    seedPersonalData('u1');

    await fetch(base + '/api/gdpr/erase', { method: 'POST', headers: token('u1', 'author') });

    expect(db.prepare("SELECT id FROM User WHERE id = 'u1'").get()).toBeUndefined();
    expect((db.prepare("SELECT authorId FROM Post WHERE id = 'p1'").get() as any).authorId).toBe('boss');
  });

  it('erases a newsletter subscription keyed by the same email', async () => {
    addUser('u1', 'author', 'shared@test.dev');
    db.prepare("INSERT INTO Subscriber (id, email, status) VALUES ('s1','shared@test.dev','subscribed')").run();
    const res = await fetch(base + '/api/gdpr/erase', { method: 'POST', headers: token('u1', 'author') });
    expect(res.status, await res.text()).toBe(200);
    // Consent ends with the account.
    expect(db.prepare("SELECT id FROM Subscriber WHERE id = 's1'").get()).toBeUndefined();
  });

  it('refuses the admin endpoint on your own account, pointing at the self-service one', async () => {
    addUser('boss', 'admin');
    const res = await fetch(base + '/api/gdpr/admin/erase/boss', { method: 'POST', headers: token('boss', 'admin') });
    expect(res.status).toBe(400);
    // Nothing happened.
    expect(db.prepare("SELECT id FROM User WHERE id = 'boss'").get()).toBeTruthy();
  });

  it('requires the capability for the admin endpoints', async () => {
    addUser('a1', 'author');
    const res = await fetch(base + '/api/gdpr/admin/export/a1', { headers: token('a1', 'author') });
    expect(res.status).toBe(403);
  });
});
