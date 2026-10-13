import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import fs from 'fs';
import express from 'express';
import db, { initDB } from '../src/utils/db';
import postsRouter from '../src/routes/posts';
import fieldGroupRoutes from '../src/routes/fieldGroups';
import { signToken } from '../src/utils/jwt';

// Custom fields: a group defines typed fields for one content type; the values
// land in PostMeta keyed by the field's key. What has to hold is that a value is
// checked against its definition before it is stored, and that the underscore
// namespace (the app's own flags) cannot be written from a request.

const DB_FILE = process.env.MORTAR_DB_PATH || '/tmp/mortar-vitest-fieldgroups.db';

let server: any;
let base = '';

const asAdmin = { authorization: 'Bearer ' + signToken({ userId: 'fg-admin', role: 'admin', v: 0 }), 'content-type': 'application/json' };
const asAuthor = { authorization: 'Bearer ' + signToken({ userId: 'fg-au', role: 'author', v: 0 }), 'content-type': 'application/json' };

beforeAll(async () => {
  initDB();
  db.prepare("INSERT INTO User (id, username, email, password, role, tokenVersion) VALUES ('fg-admin','fg-admin','fg-admin@example.dev','x','admin',0)").run();
  db.prepare("INSERT INTO User (id, username, email, password, role, tokenVersion) VALUES ('fg-au','fg-au','fg-au@example.dev','x','author',0)").run();
  const app = express();
  app.use(express.json());
  app.use('/api/posts', postsRouter);
  app.use('/api/field-groups', fieldGroupRoutes);
  server = app.listen(0);
  await new Promise(r => server.on('listening', r));
  base = 'http://127.0.0.1:' + server.address().port + '/api';
});

afterAll(() => {
  server?.close();
  for (const s of ['', '-wal', '-shm']) { try { fs.unlinkSync(DB_FILE + s); } catch {} }
});

beforeEach(() => {
  db.prepare('DELETE FROM FieldGroup').run();
  db.prepare('DELETE FROM Post').run();
  db.prepare('DELETE FROM PostMeta').run();
});

const post = (url: string, body: any, headers = asAdmin) => fetch(base + url, { method: 'POST', headers, body: JSON.stringify(body) });
const put = (url: string, body: any, headers = asAdmin) => fetch(base + url, { method: 'PUT', headers, body: JSON.stringify(body) });

const FIELDS = [
  { key: 'price', label: '价格', type: 'number' },
  { key: 'level', label: '级别', type: 'select', options: ['a', 'b'] },
  { key: 'active', label: '启用', type: 'boolean' },
  { key: 'launch', label: '上线日', type: 'date' },
];

async function makeGroup(fields: any[] = FIELDS, typeSlug = 'post') {
  const r = await post('/field-groups', { typeSlug, name: '产品信息', fields });
  return { status: r.status, body: await r.json() };
}

describe('defining fields', () => {
  it('stores a group and serves the flat field list for its type', async () => {
    const { status, body } = await makeGroup();
    expect(status).toBe(201);
    expect(body.group.fields.map((f: any) => f.key)).toEqual(['price', 'level', 'active', 'launch']);

    const forType = await (await fetch(base + '/field-groups/for/post', { headers: asAdmin })).json();
    expect(forType.fields.map((f: any) => f.key)).toEqual(['price', 'level', 'active', 'launch']);
    // ...and nothing leaks onto another type.
    const other = await (await fetch(base + '/field-groups/for/page', { headers: asAdmin })).json();
    expect(other.fields).toEqual([]);
  });

  it('refuses a key that would land in the application\'s namespace', async () => {
    const { status, body } = await makeGroup([{ key: '_members_only', label: 'x', type: 'text' }]);
    expect(status).toBe(400);
    expect(body.error).toContain('下划线');
  });

  it('refuses the same key twice in one type, even across groups', async () => {
    await makeGroup([{ key: 'price', label: '价格', type: 'number' }]);
    const { status } = await makeGroup([{ key: 'price', label: '价格 2', type: 'text' }]);
    expect(status).toBe(400);
  });

  it('refuses a group bound to a type nobody registered', async () => {
    const { status } = await makeGroup(FIELDS, 'nope');
    expect(status).toBe(400);
  });

  it('is an admin action', async () => {
    const r = await post('/field-groups', { typeSlug: 'post', name: 'x', fields: [] }, asAuthor);
    expect(r.status).toBe(403);
  });
});

describe('values are validated against their definition', () => {
  it('accepts and normalises each type', async () => {
    await makeGroup();
    const created = await post('/posts', { title: 'Typed', meta: { price: '19.5', level: 'a', active: 'true', launch: '2030-01-02' } });
    expect(created.status, JSON.stringify(await created.clone().json())).toBe(201);
    const id = (await created.json()).id;
    const meta = Object.fromEntries((db.prepare('SELECT key, value FROM PostMeta WHERE postId = ?').all(id) as any[]).map(r => [r.key, r.value]));
    expect(meta.price).toBe('19.5');
    expect(meta.level).toBe('a');
    expect(meta.active).toBe('1');                                   // stored as the flag the app reads
    expect(meta.launch).toBe(new Date('2030-01-02').toISOString());  // stored as ISO
  });

  it('rejects a value the definition does not allow, without creating the post', async () => {
    await makeGroup();
    const bad = await post('/posts', { title: 'Bad', meta: { price: 'cheap' } });
    expect(bad.status).toBe(400);
    expect((await bad.json()).error).toContain('价格');
    expect((db.prepare("SELECT COUNT(*) as c FROM Post WHERE title = 'Bad'").get() as any).c).toBe(0);

    const offList = await post('/posts', { title: 'Bad2', meta: { level: 'z' } });
    expect(offList.status).toBe(400);
    expect((db.prepare("SELECT COUNT(*) as c FROM Post WHERE title = 'Bad2'").get() as any).c).toBe(0);
  });

  it('enforces a required field', async () => {
    await makeGroup([{ key: 'sku', label: 'SKU', type: 'text', required: true }]);
    const missing = await post('/posts', { title: 'No SKU', meta: { other: 'x' } });
    expect(missing.status).toBe(400);
    expect((await missing.json()).error).toContain('SKU');
  });

  it('will not let a request write an application flag', async () => {
    await makeGroup();
    const r = await post('/posts', { title: 'Gated', meta: { _members_only: '1' } });
    expect(r.status).toBe(400);
    expect((await r.json()).error).toContain('_members_only');
    expect((db.prepare('SELECT COUNT(*) as c FROM Post WHERE title = ?').get('Gated') as any).c).toBe(0);
  });

  it('still accepts the SEO keys the editor owns', async () => {
    const created = await post('/posts', { title: 'SEO ok', meta: { _seo_title: 'Custom', _seo_noindex: '1' } });
    expect(created.status).toBe(201);
    const id = (await created.json()).id;
    expect((db.prepare("SELECT value FROM PostMeta WHERE postId = ? AND key = '_seo_title'").get(id) as any)?.value).toBe('Custom');
  });

  it('fills a defined default when the payload is silent about the field', async () => {
    await makeGroup([{ key: 'status_label', label: '状态', type: 'text', default: '待定' }]);
    const created = await post('/posts', { title: 'Defaulted', meta: { other: 'x' } });
    expect(created.status).toBe(201);
    const id = (await created.json()).id;
    expect((db.prepare("SELECT value FROM PostMeta WHERE postId = ? AND key = 'status_label'").get(id) as any)?.value).toBe('待定');

    // ...but an explicitly cleared field stays cleared, or a later save would
    // resurrect a value the author deleted on purpose.
    await put('/posts/' + id, { title: 'Defaulted', meta: { status_label: '' } });
    expect(db.prepare("SELECT value FROM PostMeta WHERE postId = ? AND key = 'status_label'").get(id)).toBeUndefined();
  });

  it('keeps accepting an undefined field as a plain value (free-form rows still work)', async () => {
    await makeGroup();
    const created = await post('/posts', { title: 'Free', meta: { some_legacy_key: 'kept' } });
    expect(created.status).toBe(201);
    const id = (await created.json()).id;
    expect((db.prepare("SELECT value FROM PostMeta WHERE postId = ? AND key = 'some_legacy_key'").get(id) as any)?.value).toBe('kept');
  });

  it('validates on update too, and leaves the stored value alone when it refuses', async () => {
    await makeGroup();
    const created = await post('/posts', { title: 'Editable', meta: { price: '5' } });
    const id = (await created.json()).id;

    const bad = await put('/posts/' + id, { title: 'Editable', meta: { price: 'free' } });
    expect(bad.status).toBe(400);
    expect((db.prepare("SELECT value FROM PostMeta WHERE postId = ? AND key = 'price'").get(id) as any)?.value).toBe('5');

    expect((await put('/posts/' + id, { title: 'Editable', meta: { price: '7.25' } })).status).toBe(200);
    expect((db.prepare("SELECT value FROM PostMeta WHERE postId = ? AND key = 'price'").get(id) as any)?.value).toBe('7.25');
  });
});

describe('removing a definition', () => {
  it('deletes the definitions but keeps the stored values', async () => {
    const { body } = await makeGroup();
    const created = await post('/posts', { title: 'Keep values', meta: { price: '9' } });
    const id = (await created.json()).id;

    expect((await fetch(base + '/field-groups/' + body.group.id, { method: 'DELETE', headers: asAdmin })).status).toBe(200);
    expect((await (await fetch(base + '/field-groups', { headers: asAdmin })).json()).groups).toEqual([]);
    // Re-creating the field must find the content still there.
    expect((db.prepare("SELECT value FROM PostMeta WHERE postId = ? AND key = 'price'").get(id) as any)?.value).toBe('9');
  });
});
