import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'fs';
import express from 'express';
import db, { initDB } from '../src/utils/db';
import postRoutes from '../src/routes/posts';
import pageRoutes from '../src/routes/pages';
import { setUserSites } from '../src/utils/userSites';

const DB_FILE = process.env.MORTAR_DB_PATH || '/tmp/mortar-vitest-site.db';
let server: any;
let base = '';

function ins(kind: 'post' | 'page', id: string, siteId: string | null) {
  db.prepare('INSERT INTO Post (id, title, slug, status, type, authorId, siteId) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(id, id, id, 'published', kind, 'u-admin', siteId);
}

beforeAll(async () => {
  initDB();
  db.prepare("INSERT INTO User (id, username, email, password, role) VALUES ('u-admin','admin','a@b.dev','x','admin')").run();
  db.prepare("INSERT INTO Site (id, name, slug, domain, isPrimary, active) VALUES ('s1','Site One','one','one.test',1,1)").run();
  db.prepare("INSERT INTO Site (id, name, slug, domain, isPrimary, active) VALUES ('s2','Site Two','two','two.test',0,1)").run();
  ins('post', 'pg', null);      // global post
  ins('post', 'p1', 's1');      // site-one post
  ins('post', 'p2', 's2');      // site-two post
  ins('page', 'gp', null);      // global page
  ins('page', 'pp2', 's2');     // site-two page

  const app = express();
  app.use(express.json());
  app.use((req: any, _res: any, next: any) => { req.user = { userId: 'u-admin', role: 'admin' }; next(); });
  app.use('/api/posts', postRoutes);
  app.use('/api/pages', pageRoutes);
  server = app.listen(0);
  await new Promise((r) => server.on('listening', r));
  base = 'http://127.0.0.1:' + server.address().port + '/api';
});

afterAll(() => {
  server?.close();
  for (const s of ['', '-wal', '-shm']) { try { fs.unlinkSync(DB_FILE + s); } catch {} }
});

const titles = async (url: string) => (await (await fetch(url)).json()).posts.map((p: any) => p.id).sort();

describe('admin list site filter', () => {
  it('returns every site by default', async () => {
    expect(await titles(base + '/posts/admin')).toEqual(['p1', 'p2', 'pg']);
  });

  it('filters to global content only', async () => {
    expect(await titles(base + '/posts/admin?siteId=global')).toEqual(['pg']);
  });

  it('filters to a specific site', async () => {
    expect(await titles(base + '/posts/admin?siteId=s2')).toEqual(['p2']);
  });

  it('pages list honours the same filter', async () => {
    const all = await (await fetch(base + '/pages')).json();
    expect(all.map((p: any) => p.id).sort()).toEqual(['gp', 'pp2']);
    const s2 = await (await fetch(base + '/pages?siteId=s2')).json();
    expect(s2.map((p: any) => p.id)).toEqual(['pp2']);
    const global = await (await fetch(base + '/pages?siteId=global')).json();
    expect(global.map((p: any) => p.id)).toEqual(['gp']);
  });
});

// Site assignments (utils/userSites.ts) turn the client-controlled Host header
// from authority into appearance: an editor assigned to specific sites can no
// longer reach another site's content by naming it, and cannot write into one.
describe('site assignments confine a non-admin to their own sites', () => {
  let srv2: any;
  let b2 = '';

  beforeAll(async () => {
    db.prepare("INSERT OR REPLACE INTO User (id, username, email, password, role, tokenVersion) VALUES ('u-ed','ed','e@b.dev','x','editor',0)").run();
    const app = express();
    app.use(express.json());
    // test-only: the caller picks the identity with a header
    app.use((req: any, _res: any, next: any) => {
      req.user = req.headers['x-test-user'] === 'ed' ? { userId: 'u-ed', role: 'editor' } : { userId: 'u-admin', role: 'admin' };
      next();
    });
    app.use('/api/posts', postRoutes);
    app.use('/api/pages', pageRoutes);
    srv2 = app.listen(0);
    await new Promise((r) => srv2.on('listening', r));
    b2 = 'http://127.0.0.1:' + srv2.address().port + '/api';
  });

  afterAll(() => { srv2?.close(); });

  const asEditor = { 'x-test-user': 'ed', 'content-type': 'application/json' };
  // The shared titles() helper sends no identity header, and this app defaults
  // that to admin — so ask as the editor explicitly.
  const listAsEditor = async (url: string) =>
    (await (await fetch(url, { headers: { 'x-test-user': 'ed' } })).json()).posts.map((p: any) => p.id).sort();

  it('an unassigned editor keeps the previous behaviour', async () => {
    expect(await listAsEditor(b2 + '/posts/admin')).toEqual(['p1', 'p2', 'pg']);
  });

  it('after assignment: their site plus shared content, nothing else', async () => {
    setUserSites('u-ed', ['s1']);
    expect(await listAsEditor(b2 + '/posts/admin')).toEqual(['p1', 'pg']);
    expect(await listAsEditor(b2 + '/posts/admin?siteId=s1')).toEqual(['p1']);
    expect(await listAsEditor(b2 + '/posts/admin?siteId=global')).toEqual(['pg']);
  });

  it('naming another site is refused, not quietly widened', async () => {
    const r = await fetch(b2 + '/posts/admin?siteId=s2', { headers: { 'x-test-user': 'ed' } });
    expect(r.status).toBe(403);
    const p = await fetch(b2 + '/pages?siteId=s2', { headers: { 'x-test-user': 'ed' } });
    expect(p.status).toBe(403);
  });

  it('cannot create or move content into another site', async () => {
    const create = await fetch(b2 + '/posts', { method: 'POST', headers: asEditor, body: JSON.stringify({ title: 'x', content: 'y', siteId: 's2' }) });
    expect(create.status).toBe(403);
    const move = await fetch(b2 + '/posts/p1', { method: 'PUT', headers: asEditor, body: JSON.stringify({ siteId: 's2' }) });
    expect(move.status).toBe(403);
    const page = await fetch(b2 + '/pages', { method: 'POST', headers: asEditor, body: JSON.stringify({ title: 'p', content: 'y', siteId: 's2' }) });
    expect(page.status).toBe(403);
    // their own site still works
    const ok = await fetch(b2 + '/posts', { method: 'POST', headers: asEditor, body: JSON.stringify({ title: 'ok', content: 'y', siteId: 's1' }) });
    expect(ok.status, JSON.stringify(await ok.clone().json())).toBe(201);
  });
});
