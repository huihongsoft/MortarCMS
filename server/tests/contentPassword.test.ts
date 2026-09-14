import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'fs';
import express from 'express';
import db, { initDB } from '../src/utils/db';
import { signToken } from '../src/utils/jwt';
import pageRoutes from '../src/routes/pages';
import { verifyContentPassword, contentUnlockToken, contentUnlockMatches, hashContentPassword, isHashedContentPassword } from '../src/utils/contentPassword';

const DB_FILE = process.env.MORTAR_DB_PATH || '/tmp/mortar-vitest-content-password.db';
let server: any;
let base = '';

beforeAll(async () => {
  initDB();
  db.prepare("INSERT OR REPLACE INTO User (id, username, email, password, role, tokenVersion) VALUES ('admin1','admin1','a@b.dev','x','admin',0)").run();
  const app = express();
  app.use(express.json());
  app.use('/api/pages', pageRoutes);
  server = app.listen(0);
  await new Promise((r) => server.on('listening', r));
  base = 'http://127.0.0.1:' + server.address().port + '/api/pages';
});

afterAll(() => {
  server?.close();
  for (const s of ['', '-wal', '-shm']) { try { fs.unlinkSync(DB_FILE + s); } catch {} }
});

const auth = { authorization: 'Bearer ' + signToken({ userId: 'admin1', role: 'admin', v: 0 }), 'content-type': 'application/json' };

describe('content password primitives', () => {
  it('verifies a bcrypt hash and rejects a wrong password', async () => {
    const stored = await hashContentPassword('secret');
    expect(isHashedContentPassword(stored)).toBe(true);
    expect((await verifyContentPassword('secret', stored)).ok).toBe(true);
    expect((await verifyContentPassword('nope', stored)).ok).toBe(false);
  });

  it('accepts a legacy plaintext value and offers an upgrade', async () => {
    const r = await verifyContentPassword('legacy-pass', 'legacy-pass');
    expect(r.ok).toBe(true);
    expect(r.upgraded && isHashedContentPassword(r.upgraded)).toBe(true);
    expect((await verifyContentPassword('wrong', 'legacy-pass')).ok).toBe(false);
  });

  it('treats an empty stored value as locked', async () => {
    expect((await verifyContentPassword('anything', '')).ok).toBe(false);
  });

  it('unlock token is bound to the id and the stored value', () => {
    const stored = '$2b$10$abcdefghijklmnopqrstuv';
    const t = contentUnlockToken('p1', stored);
    expect(contentUnlockMatches(t, 'p1', stored)).toBe(true);
    expect(contentUnlockMatches(t, 'p2', stored)).toBe(false);
    expect(contentUnlockMatches(t, 'p1', stored + 'x')).toBe(false);
    expect(contentUnlockMatches('', 'p1', stored)).toBe(false);
    expect(contentUnlockMatches(null, 'p1', stored)).toBe(false);
  });

  it('does not derive the cookie from the raw password alone', () => {
    // sha256(id + ':' + password) — the old scheme — must not be accepted.
    const legacy = require('crypto').createHash('sha256').update('p1:secret').digest('hex');
    expect(contentUnlockMatches(legacy, 'p1', 'secret')).toBe(false);
  });
});

describe('protected page flow', () => {
  let pageId = '';
  let slug = '';

  it('stores a hash, never the plaintext', async () => {
    const r = await fetch(base, { method: 'POST', headers: auth, body: JSON.stringify({ title: 'Secret Page', status: 'password', password: 'secret', content: '<p>hidden body</p>' }) });
    const body = await r.json();
    expect(r.status, JSON.stringify(body)).toBe(201);
    pageId = body.id;
    slug = body.slug;
    const row = db.prepare('SELECT password FROM Post WHERE id = ?').get(pageId) as any;
    expect(row.password).not.toBe('secret');
    expect(isHashedContentPassword(row.password)).toBe(true);
  });

  it('hides the body until unlocked, then unlocks with a cookie', async () => {
    const locked = await (await fetch(base + '/slug/' + slug)).json();
    expect(locked.protected).toBe(true);
    expect(locked.content).toBeUndefined();

    const wrong = await fetch(base + '/slug/' + slug + '/password', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ password: 'nope' }) });
    expect(wrong.status).toBe(401);

    const ok = await fetch(base + '/slug/' + slug + '/password', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ password: 'secret' }) });
    expect(ok.status).toBe(200);
    const cookie = String(ok.headers.get('set-cookie') || '').split(';')[0];
    expect(cookie).toContain('mortar_page_pass_');

    const unlocked = await (await fetch(base + '/slug/' + slug, { headers: { cookie } })).json();
    expect(unlocked.protected).toBeUndefined();
    expect(unlocked.content).toContain('hidden body');
  });

  it('re-saving the echoed stored value does not break the password', async () => {
    // The admin editor loads the stored value into its password field and sends
    // it back on every save. Re-hashing it would store hash(hash) and lock the
    // owner out — the regression this guards.
    const stored = (db.prepare('SELECT password FROM Post WHERE id = ?').get(pageId) as any).password;
    const r = await fetch(base + '/' + pageId, { method: 'PUT', headers: auth, body: JSON.stringify({ title: 'Secret Page', status: 'password', password: stored }) });
    expect(r.status).toBe(200);
    expect((db.prepare('SELECT password FROM Post WHERE id = ?').get(pageId) as any).password).toBe(stored);

    const ok = await fetch(base + '/slug/' + slug + '/password', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ password: 'secret' }) });
    expect(ok.status, 'password must still be "secret"').toBe(200);
  });

  it('upgrades a legacy plaintext password on first successful unlock', async () => {
    const r = await fetch(base, { method: 'POST', headers: auth, body: JSON.stringify({ title: 'Legacy Page', status: 'password', password: 'placeholder', content: '<p>old</p>' }) });
    const created = await r.json();
    // Simulate a row written before hashing existed.
    db.prepare('UPDATE Post SET password = ? WHERE id = ?').run('legacy-pass', created.id);

    const ok = await fetch(base + '/slug/' + created.slug + '/password', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ password: 'legacy-pass' }) });
    expect(ok.status).toBe(200);
    expect(isHashedContentPassword((db.prepare('SELECT password FROM Post WHERE id = ?').get(created.id) as any).password)).toBe(true);
  });

  it('clears protection when the editor empties the field', async () => {
    const r = await fetch(base + '/' + pageId, { method: 'PUT', headers: auth, body: JSON.stringify({ status: 'published', password: '' }) });
    expect(r.status).toBe(200);
    const open = await (await fetch(base + '/slug/' + slug)).json();
    expect(open.protected).toBeUndefined();
    expect(open.content).toContain('hidden body');
  });
});
