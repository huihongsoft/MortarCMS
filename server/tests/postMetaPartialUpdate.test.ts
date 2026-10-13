import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'fs';
import express from 'express';
import db, { initDB } from '../src/utils/db';
import postsRouter from '../src/routes/posts';
import pagesRouter from '../src/routes/pages';

// The editor PUTs `meta` as the set of keys its own panels manage (SEO fields,
// per-post CSS, custom key/value rows). The route used to DELETE every PostMeta
// row for the post and re-insert only what the payload carried — so any key the
// caller does not know about was silently destroyed on every save. The worst
// case is `_members_only`, written by the post-expiry plugin to gate a post from
// anonymous visitors: opening that post in the admin and saving re-published it.
//
// New contract: a payload only touches the keys it names. An empty string still
// means "remove this key" (the editor clears a field by sending '').

const DB_FILE = process.env.MORTAR_DB_PATH || '/tmp/mortar-vitest-post-meta.db';

let server: any;
let base = '';

const metaOf = (postId: string, key: string) =>
  db.prepare('SELECT value FROM PostMeta WHERE postId = ? AND key = ?').get(postId, key) as any;
const metaKeys = (postId: string) =>
  (db.prepare('SELECT key FROM PostMeta WHERE postId = ? ORDER BY key').all(postId) as any[]).map(r => r.key);

beforeAll(async () => {
  initDB();
  db.prepare("INSERT INTO User (id, username, email, password, role) VALUES ('u-admin', 'admin', 'admin@test.dev', 'x', 'admin')").run();
  const app = express();
  app.use(express.json());
  app.use('/api/posts', (req: any, _res: any, next: any) => { req.user = { userId: 'u-admin', role: 'admin' }; next(); }, postsRouter);
  server = app.listen(0);
  await new Promise(r => server.on('listening', r));
  base = 'http://127.0.0.1:' + server.address().port + '/api/posts';
});

afterAll(() => {
  server?.close();
  for (const s of ['', '-wal', '-shm']) { try { fs.unlinkSync(DB_FILE + s); } catch {} }
});

const put = (id: string, body: any) =>
  fetch(base + '/' + id, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

async function makePost(title: string): Promise<string> {
  const r = await fetch(base, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title }) });
  return (await r.json()).id;
}

describe('a meta payload only touches the keys it names', () => {
  it('leaves a key the caller never sent alone (the _members_only gate)', async () => {
    const id = await makePost('Gated post');
    // What the post-expiry plugin writes when a post becomes members-only.
    db.prepare("INSERT INTO PostMeta (id, postId, key, value) VALUES ('m-gate', ?, '_members_only', '1')").run(id);

    // A save from the editor: it sends its own panel keys and nothing else.
    const r = await put(id, { title: 'Gated post', meta: { _seo_title: 'Gated', _seo_noindex: '' } });
    expect(r.status).toBe(200);

    expect(metaOf(id, '_members_only')?.value).toBe('1');
    expect(metaOf(id, '_seo_title')?.value).toBe('Gated');
  });

  it('still removes a key the caller clears with an empty string', async () => {
    const id = await makePost('Cleared post');
    await put(id, { title: 'Cleared post', meta: { _seo_desc: 'old description' } });
    expect(metaOf(id, '_seo_desc')?.value).toBe('old description');

    await put(id, { title: 'Cleared post', meta: { _seo_desc: '' } });
    expect(metaOf(id, '_seo_desc')).toBeUndefined();
  });

  it('updates an existing key in place instead of tripping the unique index', async () => {
    const id = await makePost('Updated post');
    await put(id, { title: 'Updated post', meta: { _seo_title: 'first' } });
    const r = await put(id, { title: 'Updated post', meta: { _seo_title: 'second', extra: 'kept' } });
    expect(r.status, JSON.stringify(await r.clone().json())).toBe(200);
    expect(metaOf(id, '_seo_title')?.value).toBe('second');
    expect(metaOf(id, 'extra')?.value).toBe('kept');
    expect(metaKeys(id).filter(k => k === '_seo_title')).toHaveLength(1);
  });

  it('keeps keys written by other paths (AI, plugins) across a save', async () => {
    const id = await makePost('Mixed post');
    db.prepare("INSERT INTO PostMeta (id, postId, key, value) VALUES ('m-ai', ?, 'ai_summary', 'written by the assistant')").run(id);
    await put(id, { title: 'Mixed post', meta: { _seo_title: 'Mixed' } });
    expect(metaOf(id, 'ai_summary')?.value).toBe('written by the assistant');
  });
});

// Pages carried the same delete-all-then-insert (routes/pages.ts) — both the
// create and the update handler. They share the fix, but the wiring is separate,
// so it gets its own check.
describe('pages share the contract', () => {
  let pageBase = '';
  let pageServer: any;

  beforeAll(async () => {
    const app = express();
    app.use(express.json());
    app.use('/api/pages', (req: any, _res: any, next: any) => { req.user = { userId: 'u-admin', role: 'admin' }; next(); }, pagesRouter);
    pageServer = app.listen(0);
    await new Promise(r => pageServer.on('listening', r));
    pageBase = 'http://127.0.0.1:' + pageServer.address().port + '/api/pages';
  });

  afterAll(() => { pageServer?.close(); });

  it('does not wipe a key the page editor never sends', async () => {
    const created = await fetch(pageBase, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: 'Gated page' }) });
    const id = (await created.json()).id;
    db.prepare("INSERT INTO PostMeta (id, postId, key, value) VALUES ('pm-gate', ?, '_members_only', '1')").run(id);

    const r = await fetch(pageBase + '/' + id, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: 'Gated page', meta: { _seo_title: 'Gated' } }) });
    expect(r.status).toBe(200);

    expect(metaOf(id, '_members_only')?.value).toBe('1');
    expect(metaOf(id, '_seo_title')?.value).toBe('Gated');
  });

  it('removes a key the page editor clears', async () => {
    const created = await fetch(pageBase, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: 'Cleared page', meta: { _seo_desc: 'old' } }) });
    const id = (await created.json()).id;
    expect(metaOf(id, '_seo_desc')?.value).toBe('old');

    await fetch(pageBase + '/' + id, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: 'Cleared page', meta: { _seo_desc: '' } }) });
    expect(metaOf(id, '_seo_desc')).toBeUndefined();
  });
});
