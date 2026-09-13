import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'fs';
import express from 'express';
import db, { initDB } from '../src/utils/db';
import postRoutes from '../src/routes/posts';
import pageRoutes from '../src/routes/pages';

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
