import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'fs';
import express from 'express';
import db, { initDB } from '../src/utils/db';
import { signToken } from '../src/utils/jwt';
import { setUserSites } from '../src/utils/userSites';
import postRoutes from '../src/routes/posts';
import pageRoutes from '../src/routes/pages';
import menuRoutes from '../src/routes/menus';
import linkRoutes from '../src/routes/links';

// A user assigned to specific sites must not be able to *reach* another site's
// rows by id. Posts/pages/links/menus validated only the site a row was being
// moved TO — the row's current site was never checked — and the menus list was
// unscoped. These pin both directions.
const DB_FILE = process.env.MORTAR_DB_PATH || '/tmp/mortar-vitest-site-write.db';
let server: any;
let base = '';

beforeAll(async () => {
  initDB();
  db.prepare("INSERT OR REPLACE INTO User (id, username, email, password, role, tokenVersion) VALUES ('ed','ed','ed@example.dev','x','editor',0)").run();
  db.prepare("INSERT INTO Site (id, name, slug, domain, isPrimary, active) VALUES ('s1','One','one','one.test',1,1)").run();
  db.prepare("INSERT INTO Site (id, name, slug, domain, isPrimary, active) VALUES ('s2','Two','two','two.test',0,1)").run();
  setUserSites('ed', ['s1']);

  const post = (id: string, type: string, siteId: string | null) =>
    db.prepare('INSERT INTO Post (id, title, slug, content, status, type, authorId, siteId, publishedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .run(id, id, id, 'b', 'published', type, 'ed', siteId, new Date().toISOString());
  post('p1', 'post', 's1'); post('p2', 'post', 's2');
  post('g1', 'page', 's1'); post('g2', 'page', 's2');
  db.prepare("INSERT INTO Category (id, name, slug) VALUES ('cat','Cat','cat')").run();
  db.prepare("INSERT INTO PostCategory (postId, categoryId) VALUES ('p1','cat'), ('p2','cat')").run();
  const menu = (id: string, siteId: string | null) =>
    db.prepare("INSERT INTO Menu (id, name, location, items, siteId) VALUES (?, ?, 'primary', '[]', ?)").run(id, id, siteId);
  menu('m1', 's1'); menu('m2', 's2'); menu('mg', null);
  // A link's site is its category's (Link.siteId was dropped in migration 7).
  db.prepare("INSERT INTO LinkCategory (id, name, slug, siteId) VALUES ('lc1','C1','c1','s1')").run();
  db.prepare("INSERT INTO LinkCategory (id, name, slug, siteId) VALUES ('lc2','C2','c2','s2')").run();
  const link = (id: string, categoryId: string | null) =>
    db.prepare("INSERT INTO Link (id, name, url, categoryId) VALUES (?, ?, 'https://x.test', ?)").run(id, id, categoryId);
  link('l1', 'lc1'); link('l2', 'lc2'); link('lg', null);

  const app = express();
  app.use(express.json());
  // Test-only site context (resolveSite itself is covered by siteResolve.test.ts):
  // lets these tests drive the public lists' site scope without a Host header.
  app.use((req: any, _res: any, next: any) => { if (req.headers['x-test-site']) req.siteId = req.headers['x-test-site']; next(); });
  app.use('/api/posts', postRoutes);
  app.use('/api/pages', pageRoutes);
  app.use('/api/menus', menuRoutes);
  app.use('/api/links', linkRoutes);
  server = app.listen(0);
  await new Promise((r) => server.on('listening', r));
  base = 'http://127.0.0.1:' + server.address().port + '/api';
});

afterAll(() => {
  server?.close();
  for (const s of ['', '-wal', '-shm']) { try { fs.unlinkSync(DB_FILE + s); } catch {} }
});

const asEditor = { authorization: 'Bearer ' + signToken({ userId: 'ed', role: 'editor', v: 0 }), 'content-type': 'application/json' };
const site = (id: string) => ({ ...asEditor, 'x-test-site': id });

describe('by-id writes check the row\'s own site', () => {
  it('refuses editing or trashing another site\'s post', async () => {
    expect((await fetch(base + '/posts/p1', { method: 'PUT', headers: asEditor, body: JSON.stringify({ title: 'mine' }) })).status).toBe(200);
    expect((await fetch(base + '/posts/p2', { method: 'PUT', headers: asEditor, body: JSON.stringify({ title: 'theirs' }) })).status).toBe(403);
    expect((await fetch(base + '/posts/p2', { method: 'DELETE', headers: asEditor })).status).toBe(403);
    expect((db.prepare("SELECT status FROM Post WHERE id = 'p2'").get() as any).status).toBe('published');
  });

  it('refuses editing or deleting another site\'s page', async () => {
    expect((await fetch(base + '/pages/g1', { method: 'PUT', headers: asEditor, body: JSON.stringify({ title: 'mine' }) })).status).toBe(200);
    expect((await fetch(base + '/pages/g2', { method: 'PUT', headers: asEditor, body: JSON.stringify({ title: 'theirs' }) })).status).toBe(403);
    expect((await fetch(base + '/pages/g2', { method: 'DELETE', headers: asEditor })).status).toBe(403);
    expect((db.prepare("SELECT COUNT(*) c FROM Post WHERE id = 'g2'").get() as any).c).toBe(1);
  });

  it('scopes the menu list and refuses another site\'s menu', async () => {
    const list = await (await fetch(base + '/menus', { headers: asEditor })).json();
    expect(list.map((m: any) => m.id).sort()).toEqual(['m1', 'mg']);
    expect((await fetch(base + '/menus/m2', { method: 'DELETE', headers: asEditor })).status).toBe(403);
    expect((await fetch(base + '/menus/m2', { method: 'PUT', headers: asEditor, body: JSON.stringify({ name: 'x' }) })).status).toBe(403);
    expect((db.prepare("SELECT COUNT(*) c FROM Menu WHERE id = 'm2'").get() as any).c).toBe(1);
  });

  it('refuses another site\'s link (via its category) and link category', async () => {
    expect((await fetch(base + '/links/l2', { method: 'DELETE', headers: asEditor })).status).toBe(403);
    expect((await fetch(base + '/links/categories/lc2', { method: 'DELETE', headers: asEditor })).status).toBe(403);
    // moving own link into another site's category is a write there
    expect((await fetch(base + '/links/l1', { method: 'PUT', headers: asEditor, body: JSON.stringify({ categoryId: 'lc2' }) })).status).toBe(403);
    // a shared link and its own category stay editable
    expect((await fetch(base + '/links/l1', { method: 'PUT', headers: asEditor, body: JSON.stringify({ name: 'mine' }) })).status).toBe(200);
    expect((await fetch(base + '/links/lg', { method: 'PUT', headers: asEditor, body: JSON.stringify({ name: 'shared' }) })).status).toBe(200);
  });
});

describe('public lists follow the resolved site', () => {
  it('suggest, archives, monthly archive and author pages', async () => {
    const suggest = await (await fetch(base + '/posts/suggest?q=p', { headers: site('s2') })).json();
    expect(suggest.suggestions.map((s: any) => s.slug)).toEqual(['p2']);
    const months = await (await fetch(base + '/posts/archives', { headers: site('s2') })).json();
    expect(months.length).toBe(1);                       // only site two's post is dated
    const archive = await (await fetch(base + '/posts/archive/' + new Date().getFullYear() + '/' + (new Date().getMonth() + 1), { headers: site('s1') })).json();
    expect(archive.posts.map((p: any) => p.slug)).toEqual(['p1']);
    const author = await (await fetch(base + '/posts/author/ed', { headers: site('s1') })).json();
    expect(author.posts.map((p: any) => p.slug)).toEqual(['p1']);
    const related = await (await fetch(base + '/posts/p1/related', { headers: site('s1') })).json();
    expect(related.map((p: any) => p.slug)).not.toContain('p2');
  });
});
