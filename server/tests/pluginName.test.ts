import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'fs';
import express from 'express';
import db, { initDB } from '../src/utils/db';
import { signToken } from '../src/utils/jwt';
import pluginRoutes from '../src/routes/plugins';

// Plugin names are directory components and the uninstall path calls fs.rmSync
// recursively, so a name that resolves outside plugins/ must never get there.
// Express decodes route params, so "..%2f..%2fuploads" arrived verbatim before.
const DB_FILE = process.env.MORTAR_DB_PATH || '/tmp/mortar-vitest-plugin-name.db';
let server: any;
let base = '';

beforeAll(async () => {
  initDB();
  db.prepare("INSERT OR REPLACE INTO User (id, username, email, password, role, tokenVersion) VALUES ('ad','ad','ad@example.dev','x','admin',0)").run();
  const app = express();
  app.use(express.json());
  app.use('/api/plugins', pluginRoutes);
  server = app.listen(0);
  await new Promise((r) => server.on('listening', r));
  base = 'http://127.0.0.1:' + server.address().port + '/api/plugins';
});

afterAll(() => {
  server?.close();
  for (const s of ['', '-wal', '-shm']) { try { fs.unlinkSync(DB_FILE + s); } catch {} }
});

const asAdmin = { authorization: 'Bearer ' + signToken({ userId: 'ad', role: 'admin', v: 0 }), 'content-type': 'application/json' };

describe('plugin names never reach the filesystem unvalidated', () => {
  it('refuses a traversal name', async () => {
    const del = await fetch(base + '/..%2f..%2fuploads', { method: 'DELETE', headers: asAdmin });
    expect(del.status).toBeGreaterThanOrEqual(400);
    expect(del.status).toBeLessThan(500);
    const install = await fetch(base + '/..%2f..%2fuploads/install', { method: 'POST', headers: asAdmin });
    expect(install.status).toBeGreaterThanOrEqual(400);
    expect(install.status).toBeLessThan(500);
  });

  it('still lists real plugins', async () => {
    const r = await fetch(base, { headers: asAdmin });
    expect(r.status).toBe(200);
    const names = ((await r.json()).plugins || []).map((p: any) => p.name);
    expect(names).toContain('comment-email-notify');
  });
});
