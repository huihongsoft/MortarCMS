import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import fs from 'fs';
import express from 'express';
import db, { initDB } from '../src/utils/db';
import { signToken } from '../src/utils/jwt';
import categoryRoutes from '../src/routes/categories';
import tagRoutes from '../src/routes/tags';

// Deleting was the only way to get rid of a duplicate category or tag, and it
// silently unfiled every post attached to it. Merging moves the posts first.
const DB_FILE = process.env.MORTAR_DB_PATH || '/tmp/mortar-vitest-merge.db';
let server: any;
let base = '';

const token = (id: string, role: string) => ({ Authorization: 'Bearer ' + signToken({ userId: id, role, v: 0 }), 'content-type': 'application/json' });

function post(id: string) {
  db.prepare("INSERT INTO Post (id, title, slug, content, excerpt, status, type, authorId, publishedAt) VALUES (?, ?, ?, '', '', 'published', 'post', 'u1', ?)")
    .run(id, id, id, new Date().toISOString());
}

beforeAll(async () => {
  initDB();
  db.prepare("INSERT INTO User (id, username, email, password, role, tokenVersion) VALUES ('u1','u1','u1@test.dev','x','admin',0)").run();
  const app = express();
  app.use(express.json());
  app.use('/api/categories', categoryRoutes);
  app.use('/api/tags', tagRoutes);
  server = app.listen(0);
  await new Promise((r) => server.on('listening', r));
  base = 'http://127.0.0.1:' + server.address().port;
});

afterAll(() => {
  server?.close();
  for (const s of ['', '-wal', '-shm']) { try { fs.unlinkSync(DB_FILE + s); } catch {} }
});

beforeEach(() => {
  db.prepare('DELETE FROM PostCategory').run();
  db.prepare('DELETE FROM PostTag').run();
  db.prepare('DELETE FROM Category').run();
  db.prepare('DELETE FROM Tag').run();
  db.prepare('DELETE FROM Post').run();
});

function addCategory(id: string, name: string) {
  db.prepare('INSERT INTO Category (id, name, slug) VALUES (?, ?, ?)').run(id, name, id);
}
function addTag(id: string, name: string) {
  db.prepare('INSERT INTO Tag (id, name, slug) VALUES (?, ?, ?)').run(id, name, id);
}

describe('merging categories', () => {
  it('moves the posts and removes the source', async () => {
    post('p1'); post('p2');
    addCategory('c1', 'News');
    addCategory('c2', 'News ');
    db.prepare('INSERT INTO PostCategory (postId, categoryId) VALUES (?, ?)').run('p1', 'c1');
    db.prepare('INSERT INTO PostCategory (postId, categoryId) VALUES (?, ?)').run('p2', 'c1');

    const r = await fetch(base + '/api/categories/c1/merge', {
      method: 'POST', headers: token('u1', 'admin'), body: JSON.stringify({ intoId: 'c2' }),
    });
    expect(r.status).toBe(200);
    const body = await r.json();
    expect(body.moved).toBe(2);
    expect(body.into.name).toBe('News ');

    // The source is gone and its posts are filed under the target.
    expect(db.prepare('SELECT 1 FROM Category WHERE id = ?').get('c1')).toBeUndefined();
    expect((db.prepare('SELECT COUNT(*) c FROM PostCategory WHERE categoryId = ?').get('c2') as any).c).toBe(2);
    // No join rows left pointing at the deleted category.
    expect((db.prepare('SELECT COUNT(*) c FROM PostCategory WHERE categoryId = ?').get('c1') as any).c).toBe(0);
  });

  it('does not duplicate a post that is already in both', async () => {
    post('p1');
    addCategory('c1', 'A');
    addCategory('c2', 'B');
    db.prepare('INSERT INTO PostCategory (postId, categoryId) VALUES (?, ?)').run('p1', 'c1');
    db.prepare('INSERT INTO PostCategory (postId, categoryId) VALUES (?, ?)').run('p1', 'c2');

    const body = await (await fetch(base + '/api/categories/c1/merge', { method: 'POST', headers: token('u1', 'admin'), body: JSON.stringify({ intoId: 'c2' }) })).json();
    expect(body.moved).toBe(0);   // nothing new to add
    expect((db.prepare('SELECT COUNT(*) c FROM PostCategory WHERE postId = ?').get('p1') as any).c).toBe(1);
    expect(db.prepare('SELECT 1 FROM Category WHERE id = ?').get('c1')).toBeUndefined();
  });

  it('refuses a self-merge, a missing target, and a missing source', async () => {
    addCategory('c1', 'A');
    const self = await fetch(base + '/api/categories/c1/merge', { method: 'POST', headers: token('u1', 'admin'), body: JSON.stringify({ intoId: 'c1' }) });
    expect(self.status).toBe(400);
    const missingTarget = await fetch(base + '/api/categories/c1/merge', { method: 'POST', headers: token('u1', 'admin'), body: JSON.stringify({ intoId: 'nope' }) });
    expect(missingTarget.status).toBe(404);
    const missingSource = await fetch(base + '/api/categories/nope/merge', { method: 'POST', headers: token('u1', 'admin'), body: JSON.stringify({ intoId: 'c1' }) });
    expect(missingSource.status).toBe(404);
    // Nothing was deleted by any of the refusals.
    expect(db.prepare('SELECT COUNT(*) c FROM Category').get()).toBeTruthy();
    expect((db.prepare('SELECT COUNT(*) c FROM Category').get() as any).c).toBe(1);
  });
});

describe('merging tags', () => {
  it('moves the posts and removes the source', async () => {
    post('p1');
    addTag('t1', 'javascript');
    addTag('t2', 'JavaScript');
    db.prepare('INSERT INTO PostTag (postId, tagId) VALUES (?, ?)').run('p1', 't1');

    const r = await fetch(base + '/api/tags/t1/merge', { method: 'POST', headers: token('u1', 'admin'), body: JSON.stringify({ intoId: 't2' }) });
    expect(r.status).toBe(200);
    expect((db.prepare('SELECT COUNT(*) c FROM PostTag WHERE tagId = ?').get('t2') as any).c).toBe(1);
    expect(db.prepare('SELECT 1 FROM Tag WHERE id = ?').get('t1')).toBeUndefined();
  });

  it('requires the manage_tags capability', async () => {
    addTag('t1', 'a');
    addTag('t2', 'b');
    db.prepare("INSERT INTO User (id, username, email, password, role, tokenVersion) VALUES ('a1','a1','a1@test.dev','x','author',0)").run();
    const r = await fetch(base + '/api/tags/t1/merge', { method: 'POST', headers: token('a1', 'author'), body: JSON.stringify({ intoId: 't2' }) });
    expect(r.status).toBe(403);
  });
});
