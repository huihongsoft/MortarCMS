import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'fs';
import express from 'express';
import db, { initDB } from '../src/utils/db';
import commentRoutes from '../src/routes/comments';

// Comment replies: the read route used to return roots plus exactly one level of
// children (a reply to a reply was stored but invisible), and nothing bounded
// how deep a thread could go.
const DB_FILE = process.env.MORTAR_DB_PATH || '/tmp/mortar-vitest-commentthread.db';
let server: any;
let base = '';

const post = (id: string) => db.prepare('INSERT INTO Post (id, title, slug, content, status, type, authorId) VALUES (?, ?, ?, ?, ?, ?, ?)')
  .run(id, id, id, 'b', 'published', 'post', 'a1');
const comment = (id: string, parentId: string | null, postId: string, status = 'approved') =>
  db.prepare('INSERT INTO Comment (id, content, author, postId, parentId, status, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(id, 'c-' + id, id, postId, parentId, status, new Date(Date.now() + Number(id.replace(/\D/g, '') || 0)).toISOString());

beforeAll(async () => {
  initDB();
  db.prepare("INSERT INTO User (id, username, email, password, role, tokenVersion) VALUES ('a1','a1','a1@test.dev','x','admin',0)").run();
  post('p1'); post('p2');
  const app = express();
  app.use(express.json());
  app.use('/api/comments', commentRoutes);
  server = app.listen(0);
  await new Promise(r => server.on('listening', r));
  base = 'http://127.0.0.1:' + server.address().port + '/api';
});

afterAll(() => {
  server?.close();
  for (const s of ['', '-wal', '-shm']) { try { fs.unlinkSync(DB_FILE + s); } catch {} }
});

describe('comment threads', () => {
  it('returns the whole thread, not just two levels', async () => {
    comment('r1', null, 'p1');
    comment('r2', 'r1', 'p1');
    comment('r3', 'r2', 'p1');
    comment('r4', 'r3', 'p1');       // deep row, inserted directly
    const tree = await (await fetch(base + '/comments/post/p1')).json();
    expect(tree.length).toBe(1);
    expect(tree[0].id).toBe('r1');
    expect(tree[0].children[0].id).toBe('r2');
    expect(tree[0].children[0].children[0].id).toBe('r3');
    expect(tree[0].children[0].children[0].children[0].id).toBe('r4');
  });

  it('keeps replies to unapproved parents visible', async () => {
    comment('h1', null, 'p2', 'pending');
    comment('h2', 'h1', 'p2', 'approved');
    const tree = await (await fetch(base + '/comments/post/p2')).json();
    expect(tree.map((c: any) => c.id)).toContain('h2');   // promoted, not lost
  });

  it('clamps a reply aimed deeper than the limit to the deepest allowed parent', async () => {
    comment('d1', null, 'p1');      // depth 1
    comment('d2', 'd1', 'p1');      // depth 2
    comment('d3', 'd2', 'p1');      // depth 3 — the limit
    const r = await fetch(base + '/comments', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ postId: 'p1', author: 'Deep', email: 'd@test.dev', content: 'too deep', parentId: 'd3' }),
    });
    expect(r.status).toBe(201);
    const created = await r.json();
    const row = db.prepare('SELECT parentId FROM Comment WHERE id = ?').get(created.id) as any;
    // Hanging it off d1 would make it a 4th level; d2 keeps it at the limit as
    // d3's sibling, and it stays visible in the thread.
    expect(row.parentId).toBe('d2');
  });

  it('refuses a parent from another post', async () => {
    const r = await fetch(base + '/comments', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ postId: 'p2', author: 'X', email: 'x@test.dev', content: 'cross-post', parentId: 'r1' }),
    });
    expect(r.status).toBe(400);
  });
});
