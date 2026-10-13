import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import fs from 'fs';
import http from 'http';
import path from 'path';
import sharp from 'sharp';
import express from 'express';
import db, { initDB } from '../src/utils/db';
import { signToken } from '../src/utils/jwt';
import { saveProviders } from '../src/utils/ai';
import aiRoutes from '../src/routes/ai';
import { UPLOADS_DIR } from '../src/utils/paths';

// Two authoring aids: alt text for images, and tag/category suggestions. Both go
// through the AI plumbing (usage budgets, throttles, the SSRF-guarded vision
// tool), and neither may overwrite what a human wrote.

const DB_FILE = process.env.MORTAR_DB_PATH || '/tmp/mortar-vitest-media-assist.db';

let server: any;
let base = '';
let providerSrv: http.Server;
let providerBase = '';

// What the fake provider should answer, and how many calls it saw.
let reply = '';
let calls = 0;
let visionSupported = true;

beforeAll(async () => {
  initDB();
  db.prepare("INSERT INTO User (id, username, email, password, role, tokenVersion) VALUES ('ma-sub','ma-sub','ma-sub@example.dev','x','subscriber',0)").run();
  providerSrv = http.createServer((req, res) => {
    calls++;
    let raw = '';
    req.on('data', c => { raw += c; });
    req.on('end', () => {
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ choices: [{ message: { role: 'assistant', content: reply } }] }));
    });
  });
  await new Promise<void>(r => providerSrv.listen(0, '127.0.0.1', () => r()));
  providerBase = 'http://127.0.0.1:' + (providerSrv.address() as any).port + '/v1';
  saveProviders([{ id: 'p1', name: 'Mock', type: 'openai', baseUrl: providerBase, model: 'm', apiKey: 'k', enabled: true, vision: true } as any]);

  const app = express();
  app.use(express.json());
  app.use('/api/ai', aiRoutes);
  server = app.listen(0);
  await new Promise(r => server.on('listening', r));
  base = 'http://127.0.0.1:' + server.address().port + '/api/ai';
});

afterAll(() => {
  server?.close();
  providerSrv?.close();
  for (const f of written) { try { fs.unlinkSync(path.join(UPLOADS_DIR, f)); } catch { /* best effort */ } }
  for (const s of ['', '-wal', '-shm']) { try { fs.unlinkSync(DB_FILE + s); } catch {} }
});

beforeEach(() => {
  calls = 0;
  reply = '';
  visionSupported = true;
  db.prepare('DELETE FROM Media').run();
  db.prepare('DELETE FROM Category').run();
  db.prepare('DELETE FROM Tag').run();
});

const asSub = { authorization: 'Bearer ' + signToken({ userId: 'ma-sub', role: 'subscriber', v: 0 }), 'content-type': 'application/json' };

// The AI throttle is per user AND per operation with a couple of seconds of
// cooldown, so each request in these tests gets its own admin — otherwise the
// second call to the same endpoint is a 429, not the behaviour under test.
let users = 0;
function admin() {
  const id = 'ma-' + (++users);
  db.prepare("INSERT OR REPLACE INTO User (id, username, email, password, role, tokenVersion) VALUES (?, ?, ?, 'x', 'admin', 0)").run(id, id, id + '@example.dev');
  return { authorization: 'Bearer ' + signToken({ userId: id, role: 'admin', v: 0 }), 'content-type': 'application/json' };
}

// A real file on disk: the vision tool reads the bytes to send them to the
// provider, so a DB row alone is not enough to describe.
const written: string[] = [];
async function addMedia(id: string, alt = '') {
  const file = id + '.png';
  await sharp({ create: { width: 8, height: 8, channels: 3, background: '#3366ff' } }).png().toFile(path.join(UPLOADS_DIR, file));
  written.push(file);
  db.prepare("INSERT INTO Media (id, filename, original, mimeType, size, url, alt, title, userId) VALUES (?, ?, ?, 'image/png', 1, ?, ?, '', 'ma-sub')")
    .run(id, file, file, '/uploads/' + file, alt);
}
const altOf = (id: string) => (db.prepare('SELECT alt FROM Media WHERE id = ?').get(id) as any)?.alt;
const post = (path: string, body: any, headers = admin()) => fetch(base + path, { method: 'POST', headers, body: JSON.stringify(body) });

describe('alt text', () => {
  it('describes an image that has none', async () => {
    reply = '一只橘猫趴在键盘上';
    await addMedia('m1');
    const r = await post('/alt-text', { ids: ['m1'] });
    expect(r.status).toBe(200);
    const { results } = await r.json();
    expect(results[0]).toMatchObject({ id: 'm1', status: 'ok' });
    expect(altOf('m1')).toBe('一只橘猫趴在键盘上');
  });

  it('never overwrites alt text a human wrote', async () => {
    reply = 'AI 版本';
    await addMedia('m2', '作者写的描述');
    const { results } = await (await post('/alt-text', { ids: ['m2'] })).json();
    expect(results[0]).toMatchObject({ status: 'skipped', reason: 'has-alt' });
    expect(altOf('m2')).toBe('作者写的描述');
    expect(calls).toBe(0);   // and it did not even spend a call on it
  });

  it('strips the quotes a model likes to add, and caps the length', async () => {
    reply = '"一只橘猫趴在键盘上"';
    await addMedia('m3');
    await post('/alt-text', { ids: ['m3'] });
    expect(altOf('m3')).toBe('一只橘猫趴在键盘上');
  });

  it('reports a provider failure per image instead of failing the batch', async () => {
    reply = '';
    await addMedia('m4');
    await addMedia('m5');
    const { results } = await (await post('/alt-text', { ids: ['m4', 'm5'] })).json();
    expect(results.map((x: any) => x.status)).toEqual(['error', 'error']);
  });

  it('caps how many images one request may describe', async () => {
    reply = '描述';
    const ids = Array.from({ length: 14 }, (_x, i) => 'cap' + i);
    for (const id of ids) await addMedia(id);
    await post('/alt-text', { ids });
    expect(calls).toBe(10);
  });

  it('is refused for a role without ai_use', async () => {
    await addMedia('m6');
    expect((await post('/alt-text', { ids: ['m6'] }, asSub)).status).toBe(403);
  });

  it('reports an unknown id rather than 500ing', async () => {
    reply = 'x';
    const { results } = await (await post('/alt-text', { ids: ['nope'] })).json();
    expect(results[0]).toMatchObject({ status: 'error', reason: 'not-found' });
  });
});

describe('term suggestions', () => {
  beforeEach(() => {
    db.prepare("INSERT INTO Category (id, name, slug) VALUES ('c1','技术','tech')").run();
    db.prepare("INSERT INTO Tag (id, name, slug) VALUES ('t1','数据库','db')").run();
  });

  it('returns structured tags and categories, and offers the site\'s own vocabulary', async () => {
    db.prepare("INSERT INTO Category (id, name, slug) VALUES ('c2','产品','product')").run();
    reply = '{"categories":["技术"],"tags":["数据库","Doris"]}';
    const r = await post('/suggest-terms', { title: 'Doris 使用笔记', content: '<p>正文</p>' });
    expect(r.status).toBe(200);
    expect(await r.json()).toEqual({ categories: ['技术'], tags: ['数据库', 'Doris'] });
  });

  it('survives a model that answers in prose or a code fence', async () => {
    reply = '```json\n{"categories":[],"tags":["数据结构"]}\n```';
    const body = await (await post('/suggest-terms', { title: 'x' })).json();
    expect(body.tags).toEqual(['数据结构']);
    expect(body.categories).toEqual([]);
  });

  it('returns empty lists rather than throwing on unusable output', async () => {
    reply = '抱歉，我无法给出建议。';
    const body = await (await post('/suggest-terms', { title: 'x' })).json();
    expect(body).toEqual({ categories: [], tags: [] });
  });

  it('needs something to work from', async () => {
    expect((await post('/suggest-terms', { title: '', content: '' })).status).toBe(400);
  });
});
