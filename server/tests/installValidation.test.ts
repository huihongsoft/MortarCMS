import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'fs';
import express from 'express';
import { initDB } from '../src/utils/db';
import installRoutes from '../src/routes/install';

const DB_FILE = process.env.MORTAR_DB_PATH || '/tmp/mortar-vitest-install.db';
let server: any;
let base = '';

beforeAll(async () => {
  initDB();
  const app = express();
  app.use(express.json());
  app.use('/api/install', installRoutes);
  server = app.listen(0);
  await new Promise((r) => server.on('listening', r));
  base = 'http://127.0.0.1:' + server.address().port + '/api/install';
});

afterAll(() => {
  server?.close();
  for (const s of ['', '-wal', '-shm']) { try { fs.unlinkSync(DB_FILE + s); } catch {} }
});

function post(body: any) {
  return fetch(base, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
}

describe('install validation (rejects before touching the database)', () => {
  const basePayload = { dbType: 'sqlite', siteTitle: 'T', adminUsername: 'admin' };

  it('rejects a password without a digit', async () => {
    const r = await post({ ...basePayload, adminEmail: 'a@b.dev', adminPassword: 'onlyletters' });
    expect(r.status).toBe(400);
    expect((await r.json()).error).toMatch(/password/i);
  });

  it('rejects a password without a letter', async () => {
    const r = await post({ ...basePayload, adminEmail: 'a@b.dev', adminPassword: '12345678' });
    expect(r.status).toBe(400);
  });

  it('rejects a malformed admin email', async () => {
    const r = await post({ ...basePayload, adminEmail: 'not-an-email', adminPassword: 'Passw0rd1' });
    expect(r.status).toBe(400);
    expect((await r.json()).error).toMatch(/email/i);
  });

  it('rejects missing required fields', async () => {
    const r = await post({ dbType: 'sqlite', siteTitle: 'T' });
    expect(r.status).toBe(400);
  });
});
