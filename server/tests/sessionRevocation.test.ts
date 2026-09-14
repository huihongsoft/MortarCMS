import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'fs';
import express from 'express';
import bcrypt from 'bcryptjs';
import db, { initDB } from '../src/utils/db';
import { authenticate } from '../src/middleware/auth';
import { signToken } from '../src/utils/jwt';
import userRoutes from '../src/routes/users';
import authRoutes, { isTokenBlacklisted } from '../src/routes/auth';

// authenticate() trusts the role claim inside the JWT, so a privilege downgrade
// or a password change must revoke existing tokens (tokenVersion). These tests
// pin that: otherwise a demoted admin keeps admin rights for the token lifetime.
const DB_FILE = process.env.MORTAR_DB_PATH || '/tmp/mortar-vitest-session-revocation.db';
let server: any;
let base = '';

beforeAll(async () => {
  initDB();
  const app = express();
  app.use(express.json());
  app.use('/api/users', userRoutes);
  app.use('/api/auth', authRoutes);
  // Probe route: 200 only if authenticate accepts the token.
  app.get('/api/probe', authenticate, (_req, res) => res.json({ ok: true }));
  server = app.listen(0);
  await new Promise((r) => server.on('listening', r));
  base = 'http://127.0.0.1:' + server.address().port + '/api';
});

afterAll(() => {
  server?.close();
  for (const s of ['', '-wal', '-shm']) { try { fs.unlinkSync(DB_FILE + s); } catch {} }
});

async function seedUser(id: string, role: string, password = 'Passw0rd1') {
  const hash = await bcrypt.hash(password, 4);
  db.prepare('INSERT OR REPLACE INTO User (id, username, email, password, role, tokenVersion) VALUES (?, ?, ?, ?, ?, 0)')
    .run(id, 'u-' + id, id + '@example.dev', hash, role);
}

function tokenFor(id: string, role: string) { return signToken({ userId: id, role, v: 0 }); }

async function probe(token: string) {
  return fetch(base + '/probe', { headers: { authorization: 'Bearer ' + token } });
}

function auth(token: string) { return { authorization: 'Bearer ' + token, 'content-type': 'application/json' }; }

describe('session revocation', () => {
  it('accepts a fresh token', async () => {
    await seedUser('u1', 'admin');
    expect((await probe(tokenFor('u1', 'admin'))).status).toBe(200);
  });

  it('revokes tokens when the role changes', async () => {
    await seedUser('u2', 'admin');
    await seedUser('boss', 'admin');
    const target = tokenFor('u2', 'admin');
    expect((await probe(target)).status).toBe(200);

    const r = await fetch(base + '/users/u2', { method: 'PUT', headers: auth(tokenFor('boss', 'admin')), body: JSON.stringify({ role: 'subscriber' }) });
    expect(r.status, JSON.stringify(await r.clone().json())).toBe(200);

    // The demoted user's old token must no longer be honoured.
    expect((await probe(target)).status).toBe(401);
    expect(Number((db.prepare('SELECT tokenVersion FROM User WHERE id = ?').get('u2') as any).tokenVersion)).toBe(1);
  });

  it('revokes tokens when an admin sets a new password', async () => {
    await seedUser('u3', 'editor');
    await seedUser('boss2', 'admin');
    const target = tokenFor('u3', 'editor');

    const r = await fetch(base + '/users/u3', { method: 'PUT', headers: auth(tokenFor('boss2', 'admin')), body: JSON.stringify({ password: 'NewPassw0rd' }) });
    expect(r.status).toBe(200);
    expect((await probe(target)).status).toBe(401);
  });

  it('does NOT revoke tokens for a profile-only edit', async () => {
    await seedUser('u4', 'editor');
    await seedUser('boss3', 'admin');
    const target = tokenFor('u4', 'editor');

    const r = await fetch(base + '/users/u4', { method: 'PUT', headers: auth(tokenFor('boss3', 'admin')), body: JSON.stringify({ bio: 'hello', role: 'editor' }) });
    expect(r.status).toBe(200);
    // Same role + no password change => the session must survive.
    expect((await probe(target)).status).toBe(200);
  });

  it('revokes tokens on a self-service password change', async () => {
    await seedUser('u5', 'author', 'OldPassw0rd');
    const target = tokenFor('u5', 'author');

    const r = await fetch(base + '/auth/me/password', { method: 'PUT', headers: auth(target), body: JSON.stringify({ oldPassword: 'OldPassw0rd', newPassword: 'NewPassw0rd' }) });
    expect(r.status, JSON.stringify(await r.clone().json())).toBe(200);
    expect((await probe(target)).status).toBe(401);
  });

  it('revokes tokens on a password reset', async () => {
    await seedUser('u6', 'author');
    const target = tokenFor('u6', 'author');
    db.prepare("UPDATE User SET reset_token = 'tok6', reset_expires = ? WHERE id = 'u6'")
      .run(new Date(Date.now() + 3600_000).toISOString());

    const r = await fetch(base + '/auth/reset-password', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ token: 'tok6', password: 'ResetPassw0rd' }) });
    expect(r.status, JSON.stringify(await r.clone().json())).toBe(200);
    expect((await probe(target)).status).toBe(401);
  });
});

describe('logout revocation is persisted', () => {
  let token = '';

  it('stores a hash of the revoked token, never the token itself', async () => {
    await seedUser('lo1', 'author');
    token = tokenFor('lo1', 'author');
    expect((await probe(token)).status).toBe(200);

    const r = await fetch(base + '/auth/logout', { method: 'POST', headers: auth(token) });
    expect(r.status).toBe(200);

    // Persisted: the check reads the table, so a restart cannot resurrect it.
    expect(isTokenBlacklisted(token)).toBe(true);
    expect((await probe(token)).status).toBe(401);

    const rows = db.prepare('SELECT hash FROM RevokedToken').all() as any[];
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.some((r2) => r2.hash === token)).toBe(false);
  });

  it('requires a valid session (no unauthenticated table growth)', async () => {
    const before = (db.prepare('SELECT COUNT(*) as c FROM RevokedToken').get() as any).c;
    const r = await fetch(base + '/auth/logout', { method: 'POST', headers: { authorization: 'Bearer not-a-real-token' } });
    expect(r.status).toBe(401);
    expect((db.prepare('SELECT COUNT(*) as c FROM RevokedToken').get() as any).c).toBe(before);
  });

  it('purges rows for tokens that would already have expired', async () => {
    db.prepare("INSERT INTO RevokedToken (hash, expiresAt) VALUES ('expired-hash', '2000-01-01T00:00:00.000Z')").run();
    // Bump the session version so the new token differs from the one revoked
    // above — signToken is deterministic within a second, so without this the
    // "fresh" token would be byte-identical and already blacklisted.
    db.prepare("UPDATE User SET tokenVersion = tokenVersion + 1 WHERE id = 'lo1'").run();
    const v = Number((db.prepare("SELECT tokenVersion FROM User WHERE id = 'lo1'").get() as any).tokenVersion);
    const again = signToken({ userId: 'lo1', role: 'author', v });
    const r = await fetch(base + '/auth/logout', { method: 'POST', headers: auth(again) });
    expect(r.status, JSON.stringify(await r.clone().json())).toBe(200);
    expect(db.prepare("SELECT 1 FROM RevokedToken WHERE hash = 'expired-hash'").get()).toBeUndefined();
  });
});
