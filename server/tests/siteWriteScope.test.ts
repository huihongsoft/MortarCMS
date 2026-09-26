import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'fs';
import express from 'express';
import db, { initDB } from '../src/utils/db';
import { signToken } from '../src/utils/jwt';
import { setUserSites } from '../src/utils/userSites';
import postRoutes from '../src/routes/posts';
import { addAction, removeAction } from '../src/utils/hooks';
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

// The bulk endpoints take ids from the client, so they have to apply the same
// per-row checks the single-row routes do — they used to update any id handed
// to them, which let an editor assigned to one site rewrite another site's
// posts (the by-id tests above missed the bulk paths entirely).
describe('bulk post operations reuse the single-row rules', () => {
  const add = (id: string, siteId: string | null, status = 'published') =>
    db.prepare('INSERT OR REPLACE INTO Post (id, title, slug, content, status, type, authorId, siteId, publishedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .run(id, id, id, 'b', status, 'post', 'ed', siteId, new Date().toISOString());
  const statusOf = (id: string) => (db.prepare('SELECT status FROM Post WHERE id = ?').get(id) as any)?.status;
  const previousOf = (id: string) => (db.prepare('SELECT previousStatus FROM Post WHERE id = ?').get(id) as any)?.previousStatus;
  const bulk = (path: string, body: any) => fetch(base + path, { method: 'POST', headers: asEditor, body: JSON.stringify(body) });

  it('skips ids outside the caller\'s sites', async () => {
    add('b1', 's1'); add('b2', 's2');
    const r = await bulk('/posts/bulk-trash', { ids: ['b1', 'b2'] });
    expect(r.status).toBe(200);
    const body = await r.json();
    expect(body.count).toBe(1);      // own post
    expect(body.skipped).toBe(1);    // site two's post was left alone
    expect(statusOf('b1')).toBe('trash');
    expect(statusOf('b2')).toBe('published');

    // the same guard on the other two id-driven writes
    await bulk('/posts/bulk-status', { ids: ['b2'], status: 'draft' });
    expect(statusOf('b2')).toBe('published');
    expect((await fetch(base + '/posts/b2/sticky', { method: 'PUT', headers: asEditor })).status).toBe(403);
  });

  it('remembers the status a post had before the trash, and restores it', async () => {
    add('b3', 's1', 'published');
    await bulk('/posts/bulk-trash', { ids: ['b3'] });
    expect(previousOf('b3')).toBe('published');

    const r = await bulk('/posts/bulk-restore', { ids: ['b3'] });
    expect((await r.json()).restored).toBe(1);
    expect(statusOf('b3')).toBe('published');   // not silently downgraded to draft
    expect(previousOf('b3')).toBeNull();
  });

  it('single delete and restore use the same memory', async () => {
    add('b4', 's1', 'published');
    expect((await fetch(base + '/posts/b4', { method: 'DELETE', headers: asEditor })).status).toBe(200);
    expect(previousOf('b4')).toBe('published');
    expect((await fetch(base + '/posts/b4/restore', { method: 'PUT', headers: asEditor })).status).toBe(200);
    expect(statusOf('b4')).toBe('published');
  });

  it('trashing an already-trashed post keeps the remembered status', async () => {
    add('b8', 's1', 'published');
    await bulk('/posts/bulk-trash', { ids: ['b8'] });
    await bulk('/posts/bulk-trash', { ids: ['b8'] });   // second pass must not wipe it
    await bulk('/posts/bulk-status', { ids: ['b8'], status: 'trash' });
    expect(previousOf('b8')).toBe('published');
    await bulk('/posts/bulk-restore', { ids: ['b8'] });
    expect(statusOf('b8')).toBe('published');
  });

  it('bulk-status publishes with a fresh date instead of keeping a future one', async () => {
    const future = new Date(Date.now() + 86_400_000).toISOString();
    add('b5', 's1', 'draft');
    db.prepare('UPDATE Post SET publishedAt = ? WHERE id = ?').run(future, 'b5');
    await bulk('/posts/bulk-status', { ids: ['b5'], status: 'published' });
    const row = db.prepare('SELECT status, publishedAt FROM Post WHERE id = ?').get('b5') as any;
    expect(row.status).toBe('published');
    expect(row.publishedAt <= new Date().toISOString()).toBe(true);
  });

  it('bulk-delete only removes trashed rows and leaves the rest', async () => {
    add('b6', 's1', 'trash');
    add('b7', 's1', 'draft');
    const r = await bulk('/posts/bulk-delete', { ids: ['b6', 'b7'] });
    expect((await r.json()).deleted).toBe(1);
    expect(db.prepare('SELECT COUNT(*) c FROM Post WHERE id = ?').get('b6') as any).toEqual({ c: 0 });
    expect(statusOf('b7')).toBe('draft');
  });
});

// Every bulk path used to be silent: a plugin or webhook listening for
// post_updated / post_published / delete_post never saw a bulk action.
describe('bulk post operations fire lifecycle hooks', () => {
  it('fires delete_post, post_updated, post_published and post_restored', async () => {
    const seen: string[] = [];
    const listener = (name: string) => () => { seen.push(name); };
    const pairs: [string, any][] = [
      ['delete_post', listener('delete_post')],
      ['post_updated', listener('post_updated')],
      ['post_published', listener('post_published')],
      ['post_restored', listener('post_restored')],
    ];
    for (const [name, fn] of pairs) addAction(name, fn);

    db.prepare("INSERT OR REPLACE INTO Post (id, title, slug, content, status, type, authorId, siteId, publishedAt) VALUES ('h1','h1','h1','b','draft','post','ed','s1',NULL)").run();
    const bulk = (path: string, body: any) => fetch(base + path, { method: 'POST', headers: asEditor, body: JSON.stringify(body) });
    await bulk('/posts/bulk-status', { ids: ['h1'], status: 'published' });
    await bulk('/posts/bulk-trash', { ids: ['h1'] });
    await bulk('/posts/bulk-restore', { ids: ['h1'] });

    for (const [name, fn] of pairs) removeAction(name, fn);
    expect(seen).toContain('post_updated');
    expect(seen).toContain('post_published');
    expect(seen).toContain('delete_post');
    expect(seen).toContain('post_restored');
  });
});
