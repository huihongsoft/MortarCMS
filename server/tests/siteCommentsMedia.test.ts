import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'fs';
import express from 'express';
import db, { initDB } from '../src/utils/db';
import { signToken } from '../src/utils/jwt';
import { setUserSites } from '../src/utils/userSites';
import commentRoutes from '../src/routes/comments';
import mediaRoutes from '../src/routes/media';
import { resolveSite } from '../src/middleware/site';
import http from 'http';

// Comments and media carry a site (Comment inherits its post's site; Media has its
// own), but their admin routes only checked the capability — a moderator assigned
// to one site could list and moderate every site's comments, and the media library
// showed every site's files. These pin the site rule now shared with posts/pages.
const DB_FILE = process.env.MORTAR_DB_PATH || '/tmp/mortar-vitest-site-comments.db';
let server: any;
let base = '';

beforeAll(async () => {
  initDB();
  db.prepare("INSERT OR REPLACE INTO User (id, username, email, password, role, tokenVersion) VALUES ('ed','ed','ed@example.dev','x','editor',0)").run();
  db.prepare("INSERT INTO Site (id, name, slug, domain, isPrimary, active) VALUES ('s1','One','one','one.test',1,1)").run();
  db.prepare("INSERT INTO Site (id, name, slug, domain, isPrimary, active) VALUES ('s2','Two','two','two.test',0,1)").run();
  setUserSites('ed', ['s1']);                       // editor is confined to site one
  const post = (id: string, siteId: string | null) =>
    db.prepare('INSERT INTO Post (id, title, slug, content, status, type, authorId, siteId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(id, id, id, 'b', 'published', 'post', 'ed', siteId);
  post('p1', 's1'); post('p2', 's2'); post('pg', null);
  const comment = (id: string, postId: string, siteId: string | null) =>
    db.prepare('INSERT INTO Comment (id, content, author, postId, status, siteId) VALUES (?, ?, ?, ?, ?, ?)').run(id, id, 'a', postId, 'pending', siteId);
  comment('c1', 'p1', null);   // site one, via its post
  comment('c2', 'p2', null);   // site two, via its post
  comment('cg', 'pg', null);   // shared post
  comment('c3', 'pg', 's2');   // explicitly assigned to site two

  const app = express();
  app.use(express.json());
  // The public endpoints scope by the Host-resolved site, so the middleware is
  // part of what is under test here.
  app.use(resolveSite);
  app.use('/api/comments', commentRoutes);
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
const ids = (r: any) => r.comments.map((c: any) => c.id).sort();

describe('a site-confined moderator sees only their own comments', () => {
  it('lists their sites plus the shared ones', async () => {
    const r = await (await fetch(base + '/comments/admin', { headers: asEditor })).json();
    expect(ids(r)).toEqual(['c1', 'cg']);
  });

  it('refuses to filter by another site', async () => {
    const r = await fetch(base + '/comments/admin?siteId=s2', { headers: asEditor });
    expect(r.status).toBe(403);
  });

  it('moderates its own, refuses another site\'s', async () => {
    const ok = await fetch(base + '/comments/c1', { method: 'PUT', headers: asEditor, body: JSON.stringify({ status: 'approved' }) });
    expect(ok.status).toBe(200);
    const other = await fetch(base + '/comments/c2', { method: 'PUT', headers: asEditor, body: JSON.stringify({ status: 'approved' }) });
    expect(other.status).toBe(403);
    const assignedAway = await fetch(base + '/comments/c3', { method: 'DELETE', headers: asEditor });
    expect(assignedAway.status).toBe(403);
  });

  it('refuses a bulk batch that reaches another site', async () => {
    const r = await fetch(base + '/comments/bulk-action', { method: 'POST', headers: asEditor, body: JSON.stringify({ ids: ['c1', 'c2'], action: 'spam' }) });
    expect(r.status).toBe(403);
    // …and nothing was applied
    expect((db.prepare("SELECT status FROM Comment WHERE id = 'c1'").get() as any).status).toBe('approved');
  });
});

describe('the public recent-comments list follows the resolved site', () => {
  // node's fetch cannot set a Host header, so this one goes through http.
  const recent = (host: string) => new Promise<any[]>((res) => {
    const url = new URL(base + '/comments/recent');
    http.get({ host: url.hostname, port: url.port, path: url.pathname, headers: { host } }, (r) => {
      let d = ''; r.on('data', (c) => d += c); r.on('end', () => res(JSON.parse(d)));
    });
  });

  it('returns that site\'s comments plus the shared ones', async () => {
    db.prepare("UPDATE Comment SET status = 'approved'").run();
    expect((await recent('one.test')).map((c: any) => c.id).sort()).toEqual(['c1', 'cg']);
    expect((await recent('two.test')).map((c: any) => c.id).sort()).toEqual(['c2', 'c3', 'cg']);
  });
});

describe('a site-confined user does not browse another site\'s media', () => {
  beforeAll(() => {
    const ins = (id: string, siteId: string | null) =>
      db.prepare('INSERT INTO Media (id, filename, original, mimeType, size, url, siteId) VALUES (?, ?, ?, ?, ?, ?, ?)').run(id, id + '.png', id + '.png', 'image/png', 1, '/uploads/' + id + '.png', siteId);
    ins('m1', 's1'); ins('m2', 's2'); ins('mg', null);
  });

  it('lists their own + shared files', async () => {
    const r = await (await fetch(base + '/media', { headers: asEditor })).json();
    expect(r.media.map((m: any) => m.id).sort()).toEqual(['m1', 'mg']);
  });

  it('refuses to edit or delete another site\'s file', async () => {
    const put = await fetch(base + '/media/m2', { method: 'PUT', headers: asEditor, body: JSON.stringify({ title: 'x' }) });
    expect(put.status).toBe(403);
    const del = await fetch(base + '/media/m2', { method: 'DELETE', headers: asEditor });
    expect(del.status).toBe(403);
    const bulk = await fetch(base + '/media/bulk-delete', { method: 'POST', headers: asEditor, body: JSON.stringify({ ids: ['m1', 'm2'] }) });
    expect(bulk.status).toBe(403);
  });

  it('still edits their own', async () => {
    const r = await fetch(base + '/media/m1', { method: 'PUT', headers: asEditor, body: JSON.stringify({ title: 'mine' }) });
    expect(r.status).toBe(200);
  });
});
