import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'fs';
import express from 'express';
import db, { initDB } from '../src/utils/db';
import { signToken } from '../src/utils/jwt';
import postRoutes from '../src/routes/posts';
import postTypeRoutes from '../src/routes/customPostTypes';

// A registered custom post type used to be a label with nowhere to put content:
// POST /posts ignored `type`, the admin list was hardcoded to 'post' and the
// slug route only resolved 'post', so /type/<slug> on the site could never show
// anything.
const DB_FILE = process.env.MORTAR_DB_PATH || '/tmp/mortar-vitest-cpt.db';
let server: any;
let base = '';

const admin = { authorization: 'Bearer ' + signToken({ userId: 'a1', role: 'admin', v: 0 }), 'content-type': 'application/json' };

beforeAll(async () => {
  initDB();
  db.prepare("INSERT INTO User (id, username, email, password, role, tokenVersion) VALUES ('a1','a1','a1@test.dev','x','admin',0)").run();
  const app = express();
  app.use(express.json());
  app.use('/api/posts', postRoutes);
  app.use('/api/post-types', postTypeRoutes);
  server = app.listen(0);
  await new Promise(r => server.on('listening', r));
  base = 'http://127.0.0.1:' + server.address().port + '/api';
});

afterAll(() => {
  server?.close();
  for (const s of ['', '-wal', '-shm']) { try { fs.unlinkSync(DB_FILE + s); } catch {} }
});

const create = (body: any) => fetch(base + '/posts', { method: 'POST', headers: admin, body: JSON.stringify(body) });

describe('custom post type content', () => {
  it('lists the built-ins and registers a new type', async () => {
    const builtins = await (await fetch(base + '/post-types')).json();
    expect(builtins.map((t: any) => t.slug)).toEqual(['post', 'page']);
    const r = await fetch(base + '/post-types', { method: 'POST', headers: admin, body: JSON.stringify({ slug: 'book', label: 'Books', supports: ['title', 'editor'] }) });
    expect(r.status).toBe(201);
  });

  it('edits a registered type but never the built-ins', async () => {
    const r = await fetch(base + '/post-types/book', { method: 'PUT', headers: admin, body: JSON.stringify({ label: '图书' }) });
    expect(r.status).toBe(200);
    expect((await r.json()).type.label).toBe('图书');
    expect((await fetch(base + '/post-types/post', { method: 'PUT', headers: admin, body: JSON.stringify({ label: 'x' }) })).status).toBe(400);
    expect((await fetch(base + '/post-types/nope', { method: 'PUT', headers: admin, body: JSON.stringify({ label: 'x' }) })).status).toBe(404);
  });

  it('refuses an unregistered type and the page type', async () => {
    expect((await create({ title: 'Nope', type: 'not-a-type' })).status).toBe(400);
    expect((await create({ title: 'Sneaky page', type: 'page' })).status).toBe(400);
  });

  it('creates an entry of the custom type and lists it under that type', async () => {
    const r = await create({ title: 'Dune', type: 'book', status: 'published' });
    expect(r.status).toBe(201);
    const book = await r.json();
    expect(book.type).toBe('book');

    const byType = await (await fetch(base + '/posts/admin?type=book', { headers: admin })).json();
    expect(byType.posts.map((p: any) => p.id)).toContain(book.id);
    // the default list is still plain posts
    const defaults = await (await fetch(base + '/posts/admin', { headers: admin })).json();
    expect(defaults.posts.map((p: any) => p.id)).not.toContain(book.id);
  });

  it('serves the entry on the public list and by slug', async () => {
    const list = await (await fetch(base + '/posts?type=book')).json();
    expect(list.posts.map((p: any) => p.title)).toContain('Dune');

    const single = await (await fetch(base + '/posts/slug/' + (await (await fetch(base + '/posts/admin?type=book', { headers: admin })).json()).posts[0].slug));
    expect(single.status).toBe(200);
    expect((await single.json()).type).toBe('book');
  });

  it('keeps slugs unique across content types', async () => {
    const a = await (await create({ title: 'Same Title', type: 'book' })).json();
    const b = await (await create({ title: 'Same Title', type: 'post' })).json();
    expect(a.slug).not.toBe(b.slug);
  });
});
