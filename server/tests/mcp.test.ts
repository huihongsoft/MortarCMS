import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import fs from 'fs';
import crypto from 'crypto';
import express from 'express';
import db, { initDB } from '../src/utils/db';
import mcpRoutes from '../src/routes/mcp';
import { appPasswordAuth } from '../src/middleware/auth';
import { registerTool } from '../src/utils/aiTools';

// The MCP endpoint is a transport over the existing tool registry. What has to
// hold is that it is not a way AROUND anything: the same per-tool permissions,
// the same refusal of risky calls, and a read-only credential that really cannot
// write — even though every MCP call is a POST.

const DB_FILE = process.env.MORTAR_DB_PATH || '/tmp/mortar-vitest-mcp.db';

let server: any;
let base = '';

function addUser(id: string, role: string) {
  db.prepare("INSERT OR REPLACE INTO User (id, username, email, password, role, tokenVersion) VALUES (?, ?, ?, 'x', ?, 0)").run(id, id, id + '@example.dev', role);
}
function addAppPassword(userId: string, token: string, scope: string) {
  db.prepare('INSERT OR REPLACE INTO AppPassword (id, userId, name, hash, scope, token_version) VALUES (?, ?, ?, ?, ?, 0)')
    .run('ap-' + token, userId, 'test', crypto.createHash('sha256').update(token).digest('hex'), scope);
}
const as = (token: string) => ({ authorization: 'App ' + token, 'content-type': 'application/json' });
const rpc = (token: string, body: any) =>
  fetch(base + '/mcp', { method: 'POST', headers: as(token), body: JSON.stringify(body) }).then(async r => ({ status: r.status, body: await r.json().catch(() => null) }));

beforeAll(async () => {
  initDB();
  addUser('mcp-admin', 'admin');
  addUser('mcp-sub', 'subscriber');
  addAppPassword('mcp-admin', 'full-token', 'full');
  addAppPassword('mcp-admin', 'read-token', 'read');
  addAppPassword('mcp-sub', 'sub-token', 'full');
  const app = express();
  app.use(express.json());
  // The same order index.ts uses: the App password is resolved before the router.
  app.use('/api', appPasswordAuth);
  app.use('/api/mcp', mcpRoutes);
  server = app.listen(0);
  await new Promise(r => server.on('listening', r));
  base = 'http://127.0.0.1:' + server.address().port + '/api';
});

afterAll(() => {
  server?.close();
  for (const s of ['', '-wal', '-shm']) { try { fs.unlinkSync(DB_FILE + s); } catch {} }
});

beforeEach(() => { db.prepare('DELETE FROM Post').run(); db.prepare('DELETE FROM AiAudit').run(); });

describe('the MCP handshake', () => {
  it('refuses an unauthenticated call', async () => {
    const r = await fetch(base + '/mcp', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/list' }) });
    expect(r.status).toBe(401);
  });

  it('answers initialize with the client\'s protocol version and its capabilities', async () => {
    const { body } = await rpc('full-token', { jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2025-03-26' } });
    expect(body.result.protocolVersion).toBe('2025-03-26');
    expect(body.result.capabilities.tools).toBeTruthy();
    expect(body.result.serverInfo.name).toBe('mortar-cms');
  });

  it('falls back to its own version for one it does not know', async () => {
    const { body } = await rpc('full-token', { jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '1999-01-01' } });
    expect(body.result.protocolVersion).toBe('2025-06-18');
  });

  it('does not answer a notification', async () => {
    const r = await fetch(base + '/mcp', { method: 'POST', headers: as('full-token'), body: JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }) });
    expect(r.status).toBe(202);
  });

  it('reports an unknown method as a JSON-RPC error', async () => {
    const { body } = await rpc('full-token', { jsonrpc: '2.0', id: 7, method: 'tools/nope' });
    expect(body.error.code).toBe(-32601);
    expect(body.id).toBe(7);
  });
});

describe('tools/list', () => {
  it('exposes the registry with JSON Schemas, under the tool permissions', async () => {
    const { body } = await rpc('full-token', { jsonrpc: '2.0', id: 1, method: 'tools/list' });
    const names = body.result.tools.map((t: any) => t.name);
    expect(names).toContain('get_site_stats');
    expect(names).toContain('write_post');
    const stats = body.result.tools.find((t: any) => t.name === 'get_site_stats');
    expect(stats.inputSchema).toBeTruthy();
    expect(typeof stats.description).toBe('string');
  });

  it('gives a role with no ai_use an empty list, not an error', async () => {
    const { body } = await rpc('sub-token', { jsonrpc: '2.0', id: 1, method: 'tools/list' });
    expect(body.result.tools).toEqual([]);
  });
});

describe('tools/call', () => {
  it('runs a tool and returns its output as text', async () => {
    const { body } = await rpc('full-token', { jsonrpc: '2.0', id: 2, method: 'tools/call', params: { name: 'get_site_stats', arguments: {} } });
    expect(body.result.isError).toBeFalsy();
    expect(body.result.content[0].type).toBe('text');
    expect(() => JSON.parse(body.result.content[0].text)).not.toThrow();
  });

  it('writes a draft through the same tool the assistant uses', async () => {
    const { body } = await rpc('full-token', { jsonrpc: '2.0', id: 3, method: 'tools/call', params: { name: 'write_post', arguments: { title: 'From MCP', content: '<p>x</p>' } } });
    expect(body.result.isError).toBeFalsy();
    expect((db.prepare("SELECT COUNT(*) as c FROM Post WHERE title = 'From MCP'").get() as any).c).toBe(1);
  });

  it('refuses a risky call, exactly as an unattended caller', async () => {
    // The assistant asks a human for these. An MCP client is an external agent
    // we cannot verify a human is watching, so it gets the unattended rule: the
    // operator opts in with ai_allow_unattended_risky.
    const { body } = await rpc('full-token', { jsonrpc: '2.0', id: 4, method: 'tools/call', params: { name: 'write_post', arguments: { title: 'Published from MCP', status: 'published' } } });
    expect(body.result.isError).toBe(true);
    expect(body.result.content[0].text).toContain('人工确认');
    expect((db.prepare("SELECT COUNT(*) as c FROM Post WHERE title = 'Published from MCP'").get() as any).c).toBe(0);
  });

  it('reports an unknown tool as a tool error, not a protocol error', async () => {
    const { body } = await rpc('full-token', { jsonrpc: '2.0', id: 5, method: 'tools/call', params: { name: 'no_such_tool', arguments: {} } });
    expect(body.result.isError).toBe(true);
    expect(body.error).toBeUndefined();
  });

  it('denies a plugin tool that was not classified as read-only', async () => {
    // Default-deny: a plugin's tool is not on the read-only list, so a read
    // credential cannot reach it.
    registerTool('plugin_mutate', 'test', { type: 'object', properties: {} }, async () => ({ ok: true }));
    const { body } = await rpc('read-token', { jsonrpc: '2.0', id: 6, method: 'tools/call', params: { name: 'plugin_mutate', arguments: {} } });
    expect(body.result.isError).toBe(true);
    expect(body.result.content[0].text).toContain('只读');
  });
});

describe('a read-only credential', () => {
  it('can list tools and call a read-only one', async () => {
    const list = await rpc('read-token', { jsonrpc: '2.0', id: 1, method: 'tools/list' });
    expect(list.body.result.tools.length).toBeGreaterThan(0);
    const call = await rpc('read-token', { jsonrpc: '2.0', id: 2, method: 'tools/call', params: { name: 'list_posts', arguments: {} } });
    expect(call.body.result.isError).toBeFalsy();
  });

  it('cannot call a tool that writes, even though the call is a POST', async () => {
    const { body } = await rpc('read-token', { jsonrpc: '2.0', id: 3, method: 'tools/call', params: { name: 'write_post', arguments: { title: 'Nope' } } });
    expect(body.result.isError).toBe(true);
    expect((db.prepare("SELECT COUNT(*) as c FROM Post WHERE title = 'Nope'").get() as any).c).toBe(0);
  });
});
