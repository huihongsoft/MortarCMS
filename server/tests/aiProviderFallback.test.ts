import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import fs from 'fs';
import http from 'http';
import express from 'express';
import db, { initDB } from '../src/utils/db';
import { signToken } from '../src/utils/jwt';
import { saveProviders } from '../src/utils/ai';
import aiRoutes from '../src/routes/ai';

// A second configured provider is a spare tyre: when the first fails for a
// reason ABOUT THE PROVIDER the request moves to the next one. A request the
// provider rejects on its merits (400) is not a provider failure — every
// provider would reject it the same way, so it is not retried.

const DB_FILE = process.env.MORTAR_DB_PATH || '/tmp/mortar-vitest-fallback.db';

let server: any;
let base = '';
let goodSrv: http.Server;
let goodBase = '';
let goodCalls = 0;
let goodReply = '来自备份服务商的摘要';
// Which model each request asked for, so routing is observable.
let askedModels: string[] = [];
// A provider that is emphatically not there.
const DEAD_BASE = 'http://127.0.0.1:9/v1';

// A provider that answers every request with a 400.
let badSrv: http.Server;
let badBase = '';
let badCalls = 0;

let users = 0;
function admin() {
  const id = 'fb-' + (++users);
  db.prepare("INSERT OR REPLACE INTO User (id, username, email, password, role, tokenVersion) VALUES (?, ?, ?, 'x', 'admin', 0)").run(id, id, id + '@example.dev');
  return { authorization: 'Bearer ' + signToken({ userId: id, role: 'admin', v: 0 }), 'content-type': 'application/json' };
}

beforeAll(async () => {
  initDB();
  goodSrv = http.createServer((req, res) => {
    goodCalls++;
    let raw = '';
    req.on('data', c => { raw += c; });
    req.on('end', () => {
    try { askedModels.push(String(JSON.parse(raw || '{}').model || '')); } catch { /* ignore */ }
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ choices: [{ message: { role: 'assistant', content: goodReply } }], model: 'good-model' }));
    });
  });
  await new Promise<void>(r => goodSrv.listen(0, '127.0.0.1', () => r()));
  goodBase = 'http://127.0.0.1:' + (goodSrv.address() as any).port + '/v1';

  badSrv = http.createServer((_req, res) => {
    badCalls++;
    res.writeHead(400, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ error: { message: 'bad request' } }));
  });
  await new Promise<void>(r => badSrv.listen(0, '127.0.0.1', () => r()));
  badBase = 'http://127.0.0.1:' + (badSrv.address() as any).port + '/v1';

  const app = express();
  app.use(express.json());
  app.use('/api/ai', aiRoutes);
  server = app.listen(0);
  await new Promise(r => server.on('listening', r));
  base = 'http://127.0.0.1:' + server.address().port + '/api/ai';
});

afterAll(() => {
  server?.close();
  goodSrv?.close();
  badSrv?.close();
  for (const s of ['', '-wal', '-shm']) { try { fs.unlinkSync(DB_FILE + s); } catch {} }
});

beforeEach(() => { goodCalls = 0; badCalls = 0; askedModels = []; goodReply = '来自备份服务商的摘要'; db.prepare('DELETE FROM AiUsage').run(); });

const summarize = (headers: any) => fetch(base + '/summarize', { method: 'POST', headers, body: JSON.stringify({ text: '这是一段需要压缩的对话内容' }) });

describe('provider fallback', () => {
  it('moves to the next provider when the first is unreachable', async () => {
    saveProviders([
      { id: 'dead', name: 'Dead', type: 'openai', baseUrl: DEAD_BASE, model: 'dead-model', apiKey: 'k', enabled: true } as any,
      { id: 'good', name: 'Good', type: 'openai', baseUrl: goodBase, model: 'good-model', apiKey: 'k', enabled: true } as any,
    ]);
    const r = await summarize(admin());
    expect(r.status, JSON.stringify(await r.clone().json())).toBe(200);
    expect((await r.json()).summary).toBe('来自备份服务商的摘要');
    expect(goodCalls).toBe(1);
    // The usage record names the model that actually ran.
    expect((db.prepare('SELECT model FROM AiUsage ORDER BY createdAt DESC LIMIT 1').get() as any)?.model).toBe('good-model');
  });

  it('does not retry a request the provider rejected on its merits', async () => {
    saveProviders([
      { id: 'bad', name: 'Bad', type: 'openai', baseUrl: badBase, model: 'bad-model', apiKey: 'k', enabled: true } as any,
      { id: 'good', name: 'Good', type: 'openai', baseUrl: goodBase, model: 'good-model', apiKey: 'k', enabled: true } as any,
    ]);
    const r = await summarize(admin());
    expect(r.status).toBe(500);          // surfaced as an AI error, not a crash
    expect(badCalls).toBe(1);
    expect(goodCalls).toBe(0);           // a 400 would fail there too
  });

  it('uses the only configured provider without any extra call', async () => {
    saveProviders([{ id: 'good', name: 'Good', type: 'openai', baseUrl: goodBase, model: 'good-model', apiKey: 'k', enabled: true } as any]);
    expect((await summarize(admin())).status).toBe(200);
    expect(goodCalls).toBe(1);
  });

  it('routes a mechanical operation to the fast model', async () => {
    saveProviders([{ id: 'good', name: 'Good', type: 'openai', baseUrl: goodBase, model: 'strong-model', fastModel: 'cheap-model', apiKey: 'k', enabled: true } as any]);
    await summarize(admin());                       // summarize is a 'fast' operation
    expect(askedModels).toEqual(['cheap-model']);
  });

  it('leaves the answer-bearing operations on the main model', async () => {
    saveProviders([{ id: 'good', name: 'Good', type: 'openai', baseUrl: goodBase, model: 'strong-model', fastModel: 'cheap-model', apiKey: 'k', enabled: true } as any]);
    // /chat is a user-facing answer, not a mechanical rewrite.
    await fetch(base + '/chat', { method: 'POST', headers: admin(), body: JSON.stringify({ messages: [{ role: 'user', content: 'hi' }] }) });
    expect(askedModels).toEqual(['strong-model']);
  });

  it('uses the main model when no fast model is configured', async () => {
    saveProviders([{ id: 'good', name: 'Good', type: 'openai', baseUrl: goodBase, model: 'strong-model', apiKey: 'k', enabled: true } as any]);
    await summarize(admin());
    expect(askedModels).toEqual(['strong-model']);
  });

  it('reports a dead chain instead of hanging', async () => {
    saveProviders([{ id: 'dead', name: 'Dead', type: 'openai', baseUrl: DEAD_BASE, model: 'dead-model', apiKey: 'k', enabled: true } as any]);
    const r = await summarize(admin());
    expect(r.status).toBe(500);
    expect(String((await r.json()).error)).toMatch(/无法连接|AI 请求失败/);
  });
});
