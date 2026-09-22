import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'fs';
import express from 'express';
import db, { initDB } from '../src/utils/db';
import { signToken } from '../src/utils/jwt';
import { setUserSites } from '../src/utils/userSites';
import statsRoutes from '../src/routes/stats';
import formRoutes from '../src/routes/forms';
import brokenLinkRoutes from '../src/routes/brokenLinks';
import postRoutes from '../src/routes/posts';
import mediaRoutes from '../src/routes/media';

// Visit / SearchLog / Form / BrokenLink carried no site until migration 13, so
// their admin views (analytics, hot searches, form submissions — names, emails,
// IPs — and the broken-link report with post titles) always mixed every site.
// These pin the per-site scoping that the columns now make possible.
const DB_FILE = process.env.MORTAR_DB_PATH || '/tmp/mortar-vitest-site-analytics.db';
let server: any;
let base = '';

beforeAll(async () => {
  initDB();
  db.prepare("INSERT OR REPLACE INTO User (id, username, email, password, role, tokenVersion) VALUES ('ed','ed','ed@example.dev','x','editor',0)").run();
  db.prepare("INSERT INTO Site (id, name, slug, domain, isPrimary, active) VALUES ('s1','One','one','one.test',1,1)").run();
  db.prepare("INSERT INTO Site (id, name, slug, domain, isPrimary, active) VALUES ('s2','Two','two','two.test',0,1)").run();
  setUserSites('ed', ['s1']);

  const post = (id: string, siteId: string | null) =>
    db.prepare('INSERT INTO Post (id, title, slug, content, status, type, authorId, siteId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(id, id, id, 'b', 'published', 'post', 'ed', siteId);
  post('p1', 's1'); post('p2', 's2'); post('pg', null);
  const day = new Date().toISOString().slice(0, 10);
  const visit = (id: string, siteId: string | null) =>
    db.prepare('INSERT INTO Visit (id, date, ip, path, siteId) VALUES (?, ?, ?, ?, ?)').run(id, day, 'ip-' + id, '/', siteId);
  visit('v1', 's1'); visit('v2', 's2'); visit('vg', null);
  const search = (id: string, q: string, siteId: string | null) =>
    db.prepare('INSERT INTO SearchLog (id, query, createdAt, siteId) VALUES (?, ?, ?, ?)').run(id, q, new Date().toISOString(), siteId);
  search('q1', 'mine-term', 's1'); search('q2', 'theirs-term', 's2');
  const form = (id: string, siteId: string | null) =>
    db.prepare("INSERT INTO Form (id, name, slug, fields, siteId) VALUES (?, ?, ?, '[]', ?)").run(id, id, id, siteId);
  form('f1', 's1'); form('f2', 's2'); form('fg', null);
  db.prepare("INSERT INTO FormSubmission (id, formId, data, ip, status) VALUES ('sub1','f1','{}','1.1.1.1','new'), ('sub2','f2','{}','2.2.2.2','new')").run();
  const bl = (id: string, siteId: string | null, status = 'broken') =>
    db.prepare("INSERT INTO BrokenLink (id, postId, postTitle, url, status, checkedAt, siteId) VALUES (?, 'p1', ?, 'https://x.test', ?, ?, ?)").run(id, id, status, new Date().toISOString(), siteId);
  bl('b1', 's1'); bl('b2', 's2');
  db.prepare("INSERT INTO Media (id, filename, original, mimeType, size, url, siteId) VALUES ('m1','m1.png','m1.png','image/png',1,'/uploads/m1.png','s1'), ('m2','m2.png','m2.png','image/png',1,'/uploads/m2.png','s2')").run();

  const app = express();
  app.use(express.json());
  app.use('/api/stats', statsRoutes);
  app.use('/api', formRoutes);
  app.use('/api', brokenLinkRoutes);
  app.use('/api/posts', postRoutes);
  app.use('/api/media', mediaRoutes);
  server = app.listen(0);
  await new Promise((r) => server.on('listening', r));
  base = 'http://127.0.0.1:' + server.address().port + '/api';
});

afterAll(() => {
  server?.close();
  for (const s of ['', '-wal', '-shm']) { try { fs.unlinkSync(DB_FILE + s); } catch {} }
});

const asEditor = { authorization: 'Bearer ' + signToken({ userId: 'ed', role: 'editor', v: 0 }), 'content-type': 'application/json' };
const json = async (p: string) => (await fetch(base + p, { headers: asEditor })).json();

describe('analytics and reports are scoped to the caller\'s sites', () => {
  it('visit stats count only their sites', async () => {
    const r = await json('/stats?range=7d');
    // total.pv = the site's own visit + the shared one, not site two's
    expect(r.total.pv).toBe(2);                     // s1 + shared, not s2's visit
    expect(r.top.map((x: any) => x.slug).sort()).toEqual(['p1', 'pg']);
  });

  it('the dashboard counts and recents are scoped', async () => {
    const r = await json('/stats/dashboard');
    expect(r.counts.posts).toBe(2);                  // p1 + shared pg
    expect(r.recent.posts.map((x: any) => x.id).sort()).toEqual(['p1', 'pg']);
  });

  it('hot searches are scoped', async () => {
    const r = await json('/posts/search-stats');
    expect(r.terms.map((t: any) => t.query)).toEqual(['mine-term']);
  });

  it('the broken-link report is scoped, and another site\'s row cannot be deleted', async () => {
    const r = await json('/admin/broken-links');
    expect(r.links.map((l: any) => l.id)).toEqual(['b1']);
    expect((await fetch(base + '/admin/broken-links/b2', { method: 'DELETE', headers: asEditor })).status).toBe(403);
    expect((await fetch(base + '/admin/broken-links/b1', { method: 'DELETE', headers: asEditor })).status).toBe(200);
  });
});

describe('forms and their submissions are scoped', () => {
  it('lists only their sites\' forms', async () => {
    const r = await json('/admin/forms');
    expect(r.forms.map((f: any) => f.id).sort()).toEqual(['f1', 'fg']);
  });

  it('refuses another site\'s form, its submissions and its CSV export', async () => {
    expect((await fetch(base + '/admin/forms/f2', { headers: asEditor })).status).toBe(403);
    expect((await fetch(base + '/admin/forms/f2/submissions', { headers: asEditor })).status).toBe(403);
    expect((await fetch(base + '/admin/forms/f2/submissions/export', { headers: asEditor })).status).toBe(403);
    expect((await fetch(base + '/admin/forms/f2', { method: 'PUT', headers: asEditor, body: JSON.stringify({ name: 'x', fields: [] }) })).status).toBe(403);
    expect((await fetch(base + '/admin/forms/f2', { method: 'DELETE', headers: asEditor })).status).toBe(403);
  });

  it('still serves their own form submissions', async () => {
    const r = await json('/admin/forms/f1/submissions');
    expect(r.total).toBe(1);
  });
});

describe('media metadata is not public', () => {
  it('requires a session and respects the site', async () => {
    expect((await fetch(base + '/media/m1')).status).toBe(401);
    expect((await fetch(base + '/media/m2', { headers: asEditor })).status).toBe(403);
    expect((await fetch(base + '/media/m1', { headers: asEditor })).status).toBe(200);
  });
});
