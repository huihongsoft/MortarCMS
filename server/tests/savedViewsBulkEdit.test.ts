import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'fs';
import express from 'express';
import db, { initDB } from '../src/utils/db';
import postsRouter from '../src/routes/posts';
import savedViewRoutes from '../src/routes/savedViews';
import { signToken } from '../src/utils/jwt';
import { setUserSites } from '../src/utils/userSites';

// Saved views remember a caller's own list filters; bulk edit applies one change
// to many posts. Both reach across rows the caller may not own, so the checks
// that matter are scoping (site + ownership) and per-change capabilities — and
// the fact that one bad row must not take the batch (or its neighbours) down.

const DB_FILE = process.env.MORTAR_DB_PATH || '/tmp/mortar-vitest-savedviews.db';

let server: any;
let base = '';

const token = (userId: string, role: string) => ({ authorization: 'Bearer ' + signToken({ userId, role, v: 0 }), 'content-type': 'application/json' });
const asAdmin = token('sv-admin', 'admin');
const asEditor = token('sv-ed', 'editor');
const asAuthor = token('sv-au', 'author');
const asLimited = token('sv-lim', 'limited');

beforeAll(async () => {
  initDB();
  // A role that may edit posts but NOT publish them: the capability split the
  // bulk endpoint has to honour.
  db.prepare("INSERT INTO Role (id, slug, name, capabilities, isSystem, createdAt) VALUES ('role-limited','limited','Limited','[\"edit_posts\",\"edit_others_posts\"]',0,'2024-01-01')").run();
  for (const [id, role] of [['sv-admin', 'admin'], ['sv-ed', 'editor'], ['sv-au', 'author'], ['sv-lim', 'limited']] as const) {
    db.prepare("INSERT INTO User (id, username, email, password, role, tokenVersion) VALUES (?, ?, ?, 'x', ?, 0)").run(id, id, id + '@example.dev', role);
  }
  // setUserSites only records sites that exist, so the fixtures have to be real.
  db.prepare("INSERT OR REPLACE INTO Site (id, name, slug, domain) VALUES ('site-a','A','s-a','a.test')").run();
  db.prepare("INSERT OR REPLACE INTO Site (id, name, slug, domain) VALUES ('site-b','B','s-b','b.test')").run();
  const app = express();
  app.use(express.json());
  app.use((req: any, _res: any, next: any) => { req.siteId = req.headers['x-site'] || undefined; next(); });
  app.use('/api/posts', postsRouter);
  app.use('/api/saved-views', savedViewRoutes);
  server = app.listen(0);
  await new Promise(r => server.on('listening', r));
  base = 'http://127.0.0.1:' + server.address().port + '/api';
});

afterAll(() => {
  server?.close();
  for (const s of ['', '-wal', '-shm']) { try { fs.unlinkSync(DB_FILE + s); } catch {} }
});

const post = (url: string, body: any, headers: any) => fetch(base + url, { method: 'POST', headers, body: JSON.stringify(body) });
const put = (url: string, body: any, headers: any) => fetch(base + url, { method: 'PUT', headers, body: JSON.stringify(body) });

function addPost(id: string, opts: { status?: string; authorId?: string; siteId?: string | null } = {}) {
  db.prepare('INSERT INTO Post (id, title, slug, content, status, type, authorId, siteId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    .run(id, 'T ' + id, id, '<p>x</p>', opts.status || 'draft', 'post', opts.authorId || 'sv-admin', opts.siteId ?? null);
}
const statusOf = (id: string) => (db.prepare('SELECT status FROM Post WHERE id = ?').get(id) as any)?.status;

describe('saved views', () => {
  it('saves a filter set and lists it back with unknown keys dropped', async () => {
    const r = await post('/saved-views', { name: 'My drafts', filters: { status: 'draft', sortBy: 'title', evil: 'DROP TABLE' } }, asAdmin);
    expect(r.status).toBe(201);
    const { view } = await r.json();
    expect(view.filters).toEqual({ status: 'draft', sortBy: 'title' });
    expect(view.mine).toBe(true);

    const list = await (await fetch(base + '/saved-views', { headers: asAdmin })).json();
    expect(list.views.map((v: any) => v.name)).toContain('My drafts');
  });

  it('shares a view with the role, not with the whole install', async () => {
    await post('/saved-views', { name: 'Editor triage', shared: true, filters: { status: 'pending' } }, asEditor);

    const sameRole = await (await fetch(base + '/saved-views', { headers: token('sv-ed', 'editor') })).json();
    expect(sameRole.views.map((v: any) => v.name)).toContain('Editor triage');

    const otherRole = await (await fetch(base + '/saved-views', { headers: asAuthor })).json();
    expect(otherRole.views.map((v: any) => v.name)).not.toContain('Editor triage');
  });

  it('will not let a role-mate rename or delete someone else\'s view', async () => {
    const created = await (await post('/saved-views', { name: 'Private', shared: true, filters: {} }, asEditor)).json();
    const other = token('sv-ed2', 'editor');
    db.prepare("INSERT INTO User (id, username, email, password, role, tokenVersion) VALUES ('sv-ed2','sv-ed2','sv-ed2@example.dev','x','editor',0)").run();

    expect((await put('/saved-views/' + created.view.id, { name: 'Hijacked' }, other)).status).toBe(403);
    expect((await fetch(base + '/saved-views/' + created.view.id, { method: 'DELETE', headers: other })).status).toBe(403);
    expect((await put('/saved-views/' + created.view.id, { name: 'Renamed' }, asEditor)).status).toBe(200);
  });
});

describe('bulk edit', () => {
  it('publishes a batch and reports what changed', async () => {
    addPost('b1'); addPost('b2');
    const r = await post('/posts/bulk-edit', { ids: ['b1', 'b2'], changes: { status: 'published' } }, asEditor);
    expect(r.status).toBe(200);
    const body = await r.json();
    expect(body.updated).toBe(2);
    expect(statusOf('b1')).toBe('published');
    expect(statusOf('b2')).toBe('published');
    expect(body.results.every((x: any) => x.status === 'ok')).toBe(true);
  });

  it('refuses to publish for a role without publish_posts', async () => {
    addPost('b3');
    const r = await post('/posts/bulk-edit', { ids: ['b3'], changes: { status: 'published' } }, asLimited);
    expect(r.status).toBe(403);
    expect(statusOf('b3')).toBe('draft');
  });

  it('blocks any non-draft status for a role without publish_posts, as the single save does', async () => {
    addPost('b3b');
    for (const status of ['private', 'pending', 'published']) {
      const r = await post('/posts/bulk-edit', { ids: ['b3b'], changes: { status } }, asLimited);
      expect(r.status, status).toBe(403);
    }
    expect(statusOf('b3b')).toBe('draft');
    // Draft is the one status that needs no publish capability.
    expect((await post('/posts/bulk-edit', { ids: ['b3b'], changes: { status: 'draft' } }, asLimited)).status).toBe(200);
  });

  it('skips a post outside the caller\'s sites instead of touching it', async () => {
    addPost('b4', { siteId: 'site-b' });
    setUserSites('sv-ed', ['site-a']);
    try {
      const r = await post('/posts/bulk-edit', { ids: ['b4'], changes: { status: 'published' } }, asEditor);
      const body = await r.json();
      expect(body.results[0].status).toBe('skipped');
      expect(body.updated).toBe(0);
      expect(statusOf('b4')).toBe('draft');
    } finally { setUserSites('sv-ed', []); }
  });

  it('a dry run reports the change and writes nothing', async () => {
    addPost('b5');
    const r = await post('/posts/bulk-edit', { ids: ['b5'], changes: { status: 'published' }, dryRun: true }, asEditor);
    const body = await r.json();
    expect(body.results[0].status).toBe('would-change');
    expect(body.results[0].to.status).toBe('published');
    expect(body.updated).toBe(0);
    expect(statusOf('b5')).toBe('draft');
  });

  it('adds tags and a meta value without disturbing other meta', async () => {
    addPost('b6');
    db.prepare("INSERT INTO PostMeta (id, postId, key, value) VALUES ('bm1','b6','_members_only','1')").run();
    const r = await post('/posts/bulk-edit', { ids: ['b6'], changes: { tagNames: ['urgent'], tagMode: 'add', meta: { _seo_noindex: '1' } } }, asEditor);
    expect(r.status).toBe(200);

    const tags = db.prepare('SELECT t.name FROM Tag t JOIN PostTag pt ON pt.tagId = t.id WHERE pt.postId = ?').all('b6') as any[];
    expect(tags.map(t => t.name)).toContain('urgent');
    expect((db.prepare("SELECT value FROM PostMeta WHERE postId='b6' AND key='_seo_noindex'").get() as any)?.value).toBe('1');
    // the bulk path goes through writePostMeta too, so unrelated keys survive
    expect((db.prepare("SELECT value FROM PostMeta WHERE postId='b6' AND key='_members_only'").get() as any)?.value).toBe('1');
  });

  it('cannot write the application\'s own meta namespace', async () => {
    addPost('b8');
    const r = await post('/posts/bulk-edit', { ids: ['b8'], changes: { meta: { _expiry_at: '2030-01-01' } } }, asEditor);
    const body = await r.json();
    expect(body.results[0]).toMatchObject({ status: 'error', reason: 'invalid-meta' });
    expect(body.updated).toBe(0);
    expect(db.prepare("SELECT COUNT(*) as c FROM PostMeta WHERE postId = 'b8' AND key = '_expiry_at'").get()).toEqual({ c: 0 });
  });

  it('sets one meta key without tripping a required field on the same type', async () => {
    // A bulk edit is partial by nature: sweeping required fields here would make
    // a type that has one impossible to batch-edit at all.
    db.prepare("INSERT INTO FieldGroup (id, typeSlug, name, fields, menuOrder, createdAt, updatedAt) VALUES ('fg-bulk','post','g',?,0,'2024-01-01','2024-01-01')")
      .run(JSON.stringify([{ key: 'sku', label: 'SKU', type: 'text', required: true }]));
    try {
      addPost('b9');
      const r = await post('/posts/bulk-edit', { ids: ['b9'], changes: { meta: { _seo_noindex: '1' } } }, asEditor);
      const body = await r.json();
      expect(body.updated).toBe(1);
      expect((db.prepare("SELECT value FROM PostMeta WHERE postId = 'b9' AND key = '_seo_noindex'").get() as any)?.value).toBe('1');
    } finally {
      db.prepare("DELETE FROM FieldGroup WHERE id = 'fg-bulk'").run();
    }
  });

  it('changes author only for a caller who may edit other people\'s posts', async () => {
    addPost('b7', { authorId: 'sv-au' });
    const denied = await post('/posts/bulk-edit', { ids: ['b7'], changes: { authorId: 'sv-ed' } }, asAuthor);
    expect(denied.status).toBe(403);

    const ok = await post('/posts/bulk-edit', { ids: ['b7'], changes: { authorId: 'sv-ed' } }, asEditor);
    expect(ok.status).toBe(200);
    expect((db.prepare('SELECT authorId FROM Post WHERE id = ?').get('b7') as any).authorId).toBe('sv-ed');
  });
});
