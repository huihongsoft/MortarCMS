import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'fs';
import express from 'express';
import { initDB } from '../src/utils/db';
import { saveProviders } from '../src/utils/ai';
import aiRoutes from '../src/routes/ai';

const DB_FILE = process.env.MORTAR_DB_PATH || '/tmp/mortar-vitest-ai.db';
let server: any;
let base = '';

beforeAll(async () => {
  initDB();
  // A provider with a real (fake) key, as if saved in the admin UI.
  saveProviders([{ id: 'p1', name: 'Test', type: 'openai', baseUrl: 'http://127.0.0.1:1', apiKey: 'sk-secret-key-1234', model: 'gpt-test', enabled: true } as any]);
  const app = express();
  app.use(express.json());
  // Authenticated as admin (requireCap resolves the seeded admin role).
  app.use('/api/ai', (req: any, _res: any, next: any) => { req.user = { userId: 'u-admin', role: 'admin' }; next(); }, aiRoutes);
  server = app.listen(0);
  await new Promise((r) => server.on('listening', r));
  base = 'http://127.0.0.1:' + server.address().port + '/api/ai';
});

afterAll(() => {
  server?.close();
  for (const s of ['', '-wal', '-shm']) { try { fs.unlinkSync(DB_FILE + s); } catch {} }
});

describe('AI provider settings', () => {
  it('never returns the key itself — only hasKey and a hint', async () => {
    const r = await fetch(base + '/settings');
    expect(r.status).toBe(200);
    const p = (await r.json()).providers.find((x: any) => x.id === 'p1');
    expect(p.apiKey).toBe('');
    expect(p.hasKey).toBe(true);
    expect(p.keyHint).toMatch(/1234$/);
    expect(p.keyHint).not.toMatch(/secret/);
  });

  it('rejects a masked/placeholder key with a clear message instead of crashing', async () => {
    const r = await fetch(base + '/test', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ provider: { type: 'openai', baseUrl: 'http://127.0.0.1:1', apiKey: '••••1234', model: 'gpt-test' } }) });
    expect(r.status).toBe(200);
    const body = await r.json();
    expect(body.ok).toBe(false);
    expect(body.message).not.toMatch(/ByteString/i);
  });

  it('tests a saved provider by id without re-sending the key', async () => {
    const r = await fetch(base + '/test', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ providerId: 'p1' }) });
    expect(r.status).toBe(200); // reached testProvider using the stored key (fails to connect, but not a 400)
    expect(typeof (await r.json()).ok).toBe('boolean');
  });
});
