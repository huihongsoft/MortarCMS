import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'fs';
import http from 'http';
import express from 'express';
import db, { initDB } from '../src/utils/db';
import { signToken } from '../src/utils/jwt';
import { saveProviders } from '../src/utils/ai';
import aiRoutes from '../src/routes/ai';

// The interactive assistant runs a bounded number of tool-call rounds. When the
// cap is reached the calls in that last round have ALREADY run, so the turn used
// to end on a bare "limit reached" line — hiding whatever landed and leaving the
// user nothing to act on. It now spends one final tools-free round summarising.
// The provider is faked so the loop, not a real model, is what is under test.

const DB_FILE = process.env.MORTAR_DB_PATH || '/tmp/mortar-vitest-ai-assistant-budget.db';
let server: any;
let base = '';
let providerSrv: http.Server;
let providerBase = '';

// Every request the route makes, so the test can inspect the rounds.
const providerCalls: any[] = [];

const toolCallResponse = (stream: boolean) => stream
  ? 'data: ' + JSON.stringify({ choices: [{ delta: { tool_calls: [{ index: 0, id: 'call_1', function: { name: 'get_site_settings', arguments: '{}' } }] } }] }) + '\n\ndata: [DONE]\n\n'
  : JSON.stringify({ choices: [{ message: { content: '', tool_calls: [{ id: 'call_1', type: 'function', function: { name: 'get_site_settings', arguments: '{}' } }] } }] });

const textResponse = (text: string, stream: boolean) => stream
  ? 'data: ' + JSON.stringify({ choices: [{ delta: { content: text } }] }) + '\n\ndata: [DONE]\n\n'
  : JSON.stringify({ choices: [{ message: { content: text } }] });

const SUMMARY = '已完成：站点设置已读取；未完成：未做任何写入。';

beforeAll(async () => {
  initDB();
  db.prepare("INSERT OR REPLACE INTO User (id, username, email, password, role, tokenVersion) VALUES ('abd','abd','abd@example.dev','x','admin',0)").run();

  // Fake OpenAI-compatible provider: tools present → keep calling a tool; no
  // tools in the body (the wrap-up round) → answer in prose.
  providerSrv = http.createServer((req, res) => {
    let raw = '';
    req.on('data', (c) => { raw += c; });
    req.on('end', () => {
      let body: any = {};
      try { body = JSON.parse(raw); } catch {}
      providerCalls.push(body);
      const streaming = body.stream === true;
      const payload = body.tools
        ? toolCallResponse(streaming)
        : textResponse(SUMMARY, streaming);
      res.writeHead(200, { 'content-type': streaming ? 'text/event-stream' : 'application/json' });
      res.end(payload);
    });
  });
  await new Promise<void>((r) => providerSrv.listen(0, '127.0.0.1', () => r()));
  providerBase = 'http://127.0.0.1:' + (providerSrv.address() as any).port + '/v1';
  saveProviders([{ id: 'p1', name: 'Mock', type: 'openai', baseUrl: providerBase, model: 'm', apiKey: 'k', enabled: true } as any]);

  const app = express();
  app.use(express.json());
  app.use('/api/ai', aiRoutes);
  server = app.listen(0);
  await new Promise((r) => server.on('listening', r));
  base = 'http://127.0.0.1:' + server.address().port + '/api/ai';
});

afterAll(() => {
  server?.close();
  providerSrv?.close();
  for (const s of ['', '-wal', '-shm']) { try { fs.unlinkSync(DB_FILE + s); } catch {} }
});

describe('the assistant caps tool rounds without losing the turn', () => {
  it('spends a final tools-free round to summarise, instead of a bare limit line', async () => {
    const headers = { authorization: 'Bearer ' + signToken({ userId: 'abd', role: 'admin', v: 0 }), 'content-type': 'application/json' };
    const r = await fetch(base + '/assistant', { method: 'POST', headers, body: JSON.stringify({ message: '写一篇长文' }) });
    const text = await r.text();

    const events = text.split('\n\n').filter(Boolean).map(l => JSON.parse(l.replace(/^data: /, '')));
    const done = events.find(e => e.type === 'done');
    expect(done?.content).toBe(SUMMARY);

    // The cap-sized run is what forced the wrap-up: one round per iteration plus
    // the summary round, and the old dead-end line is gone.
    expect(text).not.toContain('已达到工具调用次数上限，请简化问题重试。');
    expect(providerCalls).toHaveLength(11);
    expect(events.filter(e => e.type === 'tool_result')).toHaveLength(10);

    // The prompt states the budget up front, so the model plans for it...
    expect(providerCalls[0].messages[0].content).toContain('最多可进行 10 轮工具调用');
    // ...and the wrap-up round withholds the tools, so the model cannot burn
    // another call instead of answering.
    expect(providerCalls[10].tools).toBeUndefined();
    expect(providerCalls[0].tools).toBeTruthy();
  }, 30000);

  it('gives a bound bot the same summary instead of a bare limit line', async () => {
    const headers = { authorization: 'Bearer ' + signToken({ userId: 'abd', role: 'admin', v: 0 }), 'content-type': 'application/json' };
    const created = await fetch(base + '/bindings', { method: 'POST', headers, body: JSON.stringify({ platform: 'wechat', userId: 'abd', label: 'bot' }) });
    const token = (await created.json()).binding?.token;
    expect(token).toBeTruthy();

    providerCalls.length = 0;
    const r = await fetch(base + '/webhook/' + token, { method: 'POST', headers, body: JSON.stringify({ message: '写一篇长文' }) });
    const { reply } = await r.json();

    expect(reply).toBe(SUMMARY);
    expect(reply).not.toContain('已达到工具调用次数上限');
    expect(providerCalls).toHaveLength(11);
    expect(providerCalls[10].tools).toBeUndefined();
  }, 30000);
});
