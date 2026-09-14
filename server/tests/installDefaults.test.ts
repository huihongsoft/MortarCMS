import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'fs';
import express from 'express';
import db, { initDB } from '../src/utils/db';
import installRoutes from '../src/routes/install';

// A blank site URL (the wizard field is optional) must keep the pre-existing
// behaviour: no site_url setting and the localhost default domain.
const DB_FILE = process.env.MORTAR_DB_PATH || '/tmp/mortar-vitest-install-defaults.db';
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

describe('install without a site URL', () => {
  it('falls back to the legacy localhost domain and writes no site_url', async () => {
    const r = await fetch(base, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        dbType: 'sqlite', siteTitle: 'T', adminUsername: 'admin',
        adminEmail: 'a@b.dev', adminPassword: 'Passw0rd1', sampleData: false,
        siteUrl: '   ', // whitespace must behave like blank
      }),
    });
    expect(r.status).toBe(200);

    expect(db.prepare("SELECT value FROM Setting WHERE key = 'site_url'").get()).toBeUndefined();
    const site = db.prepare('SELECT * FROM Site WHERE isPrimary = 1').get() as any;
    expect(site.domain).toBe('localhost:3001');
  });
});
