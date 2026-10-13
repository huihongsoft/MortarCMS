import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import fs from 'fs';
import express from 'express';
import db, { initDB } from '../src/utils/db';
import postsRouter from '../src/routes/posts';
import postTypesRouter from '../src/routes/customPostTypes';
import exportRouter from '../src/routes/export';
import editorTemplatesRouter from '../src/routes/editorTemplates';
import pagesRouter from '../src/routes/pages';
import { signToken } from '../src/utils/jwt';

// Phase 3/4 of custom fields: the value has to reach a theme (and the [field]
// shortcode) without reaching someone who must not see it. "Private" is enforced
// on output, at every door a value can leave by — the list payload, the single
// post, the page payload, and the shortcode, which runs while the HTML is built.

const DB_FILE = process.env.MORTAR_DB_PATH || '/tmp/mortar-vitest-field-output.db';

let server: any;
let base = '';

const asAdmin = { authorization: 'Bearer ' + signToken({ userId: 'fo-admin', role: 'admin', v: 0 }), 'content-type': 'application/json' };

beforeAll(async () => {
  initDB();
  db.prepare("INSERT INTO User (id, username, email, password, role, tokenVersion) VALUES ('fo-admin','fo-admin','fo-admin@example.dev','x','admin',0)").run();
  const app = express();
  app.use(express.json());
  app.use('/api/posts', postsRouter);
  app.use('/api/post-types', postTypesRouter);
  app.use('/api/export', exportRouter);
  app.use('/api/editor', editorTemplatesRouter);
  app.use('/api/pages', pagesRouter);
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

const group = (fields: any[], typeSlug = 'post') =>
  db.prepare('INSERT INTO FieldGroup (id, typeSlug, name, fields, menuOrder, createdAt, updatedAt) VALUES (?,?,?,?,0,?,?)')
    .run('fg-' + typeSlug, typeSlug, 'g', JSON.stringify(fields), '2024-01-01', '2024-01-01');

function addPost(id: string, opts: { status?: string; content?: string; type?: string; meta?: Record<string, string> } = {}) {
  db.prepare('INSERT INTO Post (id, title, slug, content, status, type, authorId) VALUES (?,?,?,?,?,?,?)')
    .run(id, 'T ' + id, id, opts.content || '<p>body</p>', opts.status || 'published', opts.type || 'post', 'fo-admin');
  for (const [k, v] of Object.entries(opts.meta || {})) {
    db.prepare('INSERT INTO PostMeta (id, postId, key, value) VALUES (?,?,?,?)').run('m-' + id + '-' + k, id, k, v);
  }
}

const list = (headers: any = {}) => fetch(base + '/posts?limit=10', { headers }).then(r => r.json());
const slug = (s: string, headers: any = {}) => fetch(base + '/posts/slug/' + s, { headers });

describe('the [field] shortcode', () => {
  it('renders a value, escaped', async () => {
    group([{ key: 'price', label: '价格', type: 'text' }]);
    addPost('f1', { content: '<p>cost: [field name="price"]</p>', meta: { price: '<b>19.5</b>' } });
    const body = await (await slug('f1')).json();
    expect(body.content).toContain('cost: &lt;b&gt;19.5&lt;/b&gt;');
  });

  it('uses the fallback when the value is empty, and nothing when there is none', async () => {
    group([{ key: 'note', label: '备注', type: 'text' }]);
    addPost('f2', { content: '<p>[field name="note" fallback="—"]|[field name="missing"]</p>' });
    const body = await (await slug('f2')).json();
    expect(body.content).toContain('—|');
  });

  it('sanitises a richtext value on the way out, whatever wrote it', async () => {
    // Values reach PostMeta by several paths (editor, API, import), so the
    // guarantee has to live where the HTML is assembled.
    group([{ key: 'body', label: '正文', type: 'richtext' }]);
    addPost('f4', { content: '<p>[field name="body"]</p>', meta: { body: '<p>ok</p><img src=x onerror="alert(1)"><script>alert(2)</script>' } });
    const r = await (await slug('f4')).json();
    expect(r.content).toContain('<p>ok</p>');
    expect(r.content).not.toContain('onerror');
    expect(r.content).not.toContain('<script');
  });

  it('never emits a private field, not even as a shortcode', async () => {
    group([{ key: 'cost', label: '成本', type: 'text', private: true }]);
    addPost('f3', { content: '<p>[field name="cost" fallback="hidden"]</p>', meta: { cost: '42' } });
    const body = await (await slug('f3')).json();
    expect(body.content).toContain('hidden');
    expect(body.content).not.toContain('42');
  });
});

describe('private values stay out of public payloads', () => {
  beforeEach(() => {
    group([
      { key: 'price', label: '价格', type: 'text' },
      { key: 'cost', label: '成本', type: 'text', private: true },
    ]);
    addPost('p1', { meta: { price: '19.5', cost: '7', _seo_title: 'SEO', _internal_note: 'ops only' } });
  });

  it('drops the private field and the application\'s own meta keys from the list', async () => {
    const body = await list();
    const p = body.posts.find((x: any) => x.id === 'p1');
    expect(p.fields.map((f: any) => f.key)).toEqual(['price']);
    expect(p.meta.price).toBe('19.5');
    // The value is one property away if only `fields` were filtered.
    expect(p.meta.cost).toBeUndefined();
    // `_internal_note` is the key to assert on: it is writable and it does not
    // change visibility. `_members_only` cannot stand in for it here — setting it
    // removes the post from the public list altogether, so the assertion would
    // hold for any implementation.
    expect(p.meta._internal_note).toBeUndefined();
    // ...while the keys the frontend itself reads are kept.
    expect(p.meta._seo_title).toBe('SEO');
  });

  it('...and from the single-post route, which used to return the row verbatim', async () => {
    const body = await (await slug('p1')).json();
    expect(body.meta.cost).toBeUndefined();
    expect(body.meta._internal_note).toBeUndefined();
    expect(body.fields.map((f: any) => f.key)).toEqual(['price']);
  });

  it('still shows them to an editor', async () => {
    const body = await (await slug('p1', asAdmin)).json();
    expect(body.meta.cost).toBe('7');
    expect(body.fields.map((f: any) => f.key)).toEqual(['price', 'cost']);
  });
});

// The visual editor's block preview shows the block as the site would render it.
// A field block needs the entry it belongs to, and an id in a query string is not
// authority to read that entry.
describe('the CMS block preview', () => {
  const asAuthor = { authorization: 'Bearer ' + signToken({ userId: 'fo-au', role: 'author', v: 0 }) };
  const preview = (qs: string, headers: any = asAdmin) =>
    fetch(base + '/editor/preview-cms/field?' + qs, { headers }).then(r => r.json());

  beforeEach(() => {
    db.prepare("INSERT OR REPLACE INTO User (id, username, email, password, role, tokenVersion) VALUES ('fo-au','fo-au','fo-au@example.dev','x','author',0)").run();
    group([{ key: 'price', label: '价格', type: 'text' }, { key: 'cost', label: '成本', type: 'text', private: true }]);
    addPost('pv1', { status: 'draft', meta: { price: '19.5', cost: '7' } });
  });

  it('renders the real value of the entry being edited', async () => {
    expect((await preview('name=price&postId=pv1')).html).toBe('19.5');
  });

  it('renders nothing for a post the caller may not touch', async () => {
    // fo1 is authored by fo-admin; an author without edit_others_posts may not
    // read it, so the canvas keeps its placeholder instead of showing the value.
    expect((await preview('name=price&postId=pv1', asAuthor)).html).toBe('');
    expect((await preview('name=price&postId=does-not-exist')).html).toBe('');
  });

  it('never previews a private field', async () => {
    expect((await preview('name=cost&postId=pv1')).html).toBe('');
  });
});

// The page route applies the same filter through its own door; the header of
// this file claimed the page payload was covered, and it was not.
describe('a shortcode in a list payload', () => {
  it('resolves the field there too, where the block context is built separately', async () => {
    group([{ key: 'price', label: '价格', type: 'text' }]);
    addPost('l1', { content: '<p>cost: [field name="price"]</p>', meta: { price: '19.5' } });
    const body = await list();
    const p = body.posts.find((x: any) => x.id === 'l1');
    expect(p.content).toContain('cost: 19.5');
  });
});

describe('a page carries the same filter', () => {
  beforeEach(() => {
    group([{ key: 'note', label: '备注', type: 'text' }, { key: 'cost', label: '成本', type: 'text', private: true }], 'page');
    db.prepare("INSERT INTO Post (id, title, slug, content, status, type, authorId) VALUES ('pg1','A page','a-page','<p>hi</p>','published','page','fo-admin')").run();
    db.prepare("INSERT INTO PostMeta (id, postId, key, value) VALUES ('pm1','pg1','note','public note')").run();
    db.prepare("INSERT INTO PostMeta (id, postId, key, value) VALUES ('pm2','pg1','cost','9.99')").run();
  });

  it('hides a private field from an anonymous reader and shows it to an editor', async () => {
    const anon = await (await fetch(base + '/pages/slug/a-page')).json();
    expect(anon.fields.map((f: any) => f.key)).toEqual(['note']);
    expect(anon.meta.cost).toBeUndefined();
    expect(anon.meta.note).toBe('public note');

    const staff = await (await fetch(base + '/pages/slug/a-page', { headers: asAdmin })).json();
    expect(staff.meta.cost).toBe('9.99');
    expect(staff.fields.map((f: any) => f.key)).toEqual(['note', 'cost']);
  });
});

describe('the import preview', () => {
  it('counts the field definitions and values the file carries', async () => {
    const r = await fetch(base + '/export/import/preview', {
      method: 'POST', headers: asAdmin,
      body: JSON.stringify({ posts: [{ id: 'x' }], fieldGroups: [{ id: 'g' }, { id: 'g2' }], postMeta: [{ id: 'm', postId: 'x', key: 'k', value: 'v' }] }),
    });
    const body = await r.json();
    expect(body.counts.fieldGroups).toBe(2);
    expect(body.counts.postMeta).toBe(1);
  });
});

describe('the field schema endpoint', () => {
  it('describes the fields of a type, definitions only', async () => {
    group([{ key: 'cost', label: '成本', type: 'number', private: true }, { key: 'level', label: '级别', type: 'select', options: ['a', 'b'] }]);
    const body = await (await fetch(base + '/post-types/post/fields')).json();
    expect(body.fields).toEqual([
      { key: 'cost', label: '成本', type: 'number', required: false, private: true },
      { key: 'level', label: '级别', type: 'select', required: false, options: ['a', 'b'] },
    ]);
  });
});

describe('export and import carry field definitions and values', () => {
  it('exports them, and restores them', async () => {
    group([{ key: 'price', label: '价格', type: 'text' }]);
    addPost('e1', { meta: { price: '19.5' } });

    const dump = await (await fetch(base + '/export/export', { headers: asAdmin })).json();
    expect(dump.fieldGroups).toHaveLength(1);
    expect(dump.postMeta.some((m: any) => m.postId === 'e1' && m.key === 'price')).toBe(true);

    db.prepare('DELETE FROM FieldGroup').run();
    db.prepare('DELETE FROM PostMeta').run();

    const r = await fetch(base + '/export/import', { method: 'POST', headers: asAdmin, body: JSON.stringify(dump) });
    expect(r.status).toBe(200);
    expect((db.prepare("SELECT value FROM PostMeta WHERE postId = 'e1' AND key = 'price'").get() as any)?.value).toBe('19.5');
    expect((db.prepare('SELECT COUNT(*) as c FROM FieldGroup').get() as any).c).toBe(1);
  });

  it('restores the flags a plugin wrote, instead of silently dropping them', async () => {
    // `_members_only` and the expiry plugin's keys are content, not bookkeeping:
    // a restore that skipped them would re-publish gated posts.
    addPost('e2');
    const r = await fetch(base + '/export/import', {
      method: 'POST', headers: asAdmin,
      body: JSON.stringify({ postMeta: [
        { id: 'x1', postId: 'e2', key: '_members_only', value: '1' },
        { id: 'x2', postId: 'e2', key: '_expiry_at', value: '2030-01-01' },
        { id: 'x3', postId: '', key: 'orphan', value: 'x' },   // no post: skipped
      ] }),
    });
    expect(r.status).toBe(200);
    expect((db.prepare("SELECT value FROM PostMeta WHERE postId = 'e2' AND key = '_members_only'").get() as any)?.value).toBe('1');
    expect((db.prepare("SELECT value FROM PostMeta WHERE postId = 'e2' AND key = '_expiry_at'").get() as any)?.value).toBe('2030-01-01');
    expect((db.prepare("SELECT COUNT(*) as c FROM PostMeta WHERE key = 'orphan'").get() as any).c).toBe(0);
  });

  it('normalises a restored value instead of storing the file verbatim', async () => {
    // `_visual_css` is injected into a <style> on the public site, and `_seo_*`
    // is capped — a tampered file must not get to skip either.
    addPost('e3');
    const r = await fetch(base + '/export/import', {
      method: 'POST', headers: asAdmin,
      body: JSON.stringify({ postMeta: [
        { id: 'y1', postId: 'e3', key: '_visual_css', value: 'body{color:red} @import url(//evil.example/x.css);' },
        { id: 'y2', postId: 'e3', key: '_seo_title', value: 'x'.repeat(200) },
      ] }),
    });
    expect(r.status).toBe(200);
    const css = (db.prepare("SELECT value FROM PostMeta WHERE postId = 'e3' AND key = '_visual_css'").get() as any)?.value || '';
    expect(css).not.toContain('@import');
    expect(css.length).toBeLessThan(200);
    expect(((db.prepare("SELECT value FROM PostMeta WHERE postId = 'e3' AND key = '_seo_title'").get() as any)?.value || '').length).toBe(70);
  });
});
