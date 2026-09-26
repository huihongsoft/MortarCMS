import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'fs';
import express from 'express';
import bcrypt from 'bcryptjs';
import db, { initDB } from '../src/utils/db';
import { signToken } from '../src/utils/jwt';
import authRoutes from '../src/routes/auth';
import securityRoutes from '../src/routes/security';

// Failed logins used to be invisible: the route only fired a `login_failed`
// hook, and the activity log that does record successful logins is behind
// developer mode. These pin the recording and the access rule.
//
// The audit is gated by `manage_system`, not `manage_security`: the editor role
// holds the latter (for the audit score and the broken-link report), and the
// attempted addresses and source IPs in here are not an editor's business.
const DB_FILE = process.env.MORTAR_DB_PATH || '/tmp/mortar-vitest-loginaudit.db';
const PW = 'Passw0rd1';
let pwHash = '';
let server: any;
let base = '';

const token = (id: string, role: string) => ({ Authorization: 'Bearer ' + signToken({ userId: id, role, v: 0 }), 'content-type': 'application/json' });

beforeAll(async () => {
  initDB();
  pwHash = bcrypt.hashSync(PW, 4);
  for (const [id, role] of [['a1', 'admin'], ['e1', 'editor']] as const) {
    db.prepare('INSERT INTO User (id, username, email, password, role, tokenVersion) VALUES (?, ?, ?, ?, ?, 0)')
      .run(id, id, id + '@test.dev', pwHash, role);
  }
  const app = express();
  app.use(express.json());
  app.use('/api/auth', authRoutes);
  app.use('/api/security', securityRoutes);
  server = app.listen(0);
  await new Promise((r) => server.on('listening', r));
  base = 'http://127.0.0.1:' + server.address().port + '/api';
});

afterAll(() => {
  server?.close();
  for (const s of ['', '-wal', '-shm']) { try { fs.unlinkSync(DB_FILE + s); } catch {} }
});

async function attemptLogin(email: string, password: string): Promise<number> {
  const r = await fetch(base + '/auth/login', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return r.status;
}

describe('failed logins are recorded', () => {
  // Each assertion looks its row up by content: Activity.createdAt is a
  // second-resolution timestamp, so "newest row" is not a well-defined thing for
  // events written within the same second (the endpoints tie-break on id).
  it('stores a wrong password against the account it targeted', async () => {
    expect(await attemptLogin('a1@test.dev', 'nope-wrong')).toBe(401);
    const row = db.prepare("SELECT * FROM Activity WHERE action = 'login_failed' AND detail LIKE ?").get('%email=a1@test.dev%') as any;
    expect(row).toBeTruthy();
    expect(row.userId).toBe('a1');
    expect(row.detail).toContain('reason=wrong_password');
  });

  it('stores an attempt against an account that does not exist', async () => {
    expect(await attemptLogin('ghost@test.dev', 'nope-wrong')).toBe(401);
    const row = db.prepare("SELECT * FROM Activity WHERE action = 'login_failed' AND detail LIKE ?").get('%email=ghost@test.dev%') as any;
    // No user row to attribute it to — the attempted address is the signal.
    expect(row).toBeTruthy();
    expect(row.userId).toBe('');
    expect(row.detail).toContain('reason=no_such_user');
  });

  it('does not record the successful login as a failure', async () => {
    const before = (db.prepare("SELECT COUNT(*) c FROM Activity WHERE action = 'login_failed'").get() as any).c;
    expect(await attemptLogin('a1@test.dev', PW)).toBe(200);
    const after = (db.prepare("SELECT COUNT(*) c FROM Activity WHERE action = 'login_failed'").get() as any).c;
    expect(after).toBe(before);
    expect(db.prepare("SELECT COUNT(*) c FROM Activity WHERE action = 'login'").get()).toBeTruthy();
  });
});

describe('the audit endpoint', () => {
  it('refuses an editor, who holds manage_security but not manage_system', async () => {
    const r = await fetch(base + '/security/auth-log', { headers: token('e1', 'editor') });
    expect(r.status).toBe(403);
  });

  it('serves admins the events and the 24h failure summary', async () => {
    const r = await fetch(base + '/security/auth-log', { headers: token('a1', 'admin') });
    expect(r.status).toBe(200);
    const body = await r.json();
    expect(Array.isArray(body.events)).toBe(true);
    expect(body.events.length).toBeGreaterThan(0);
    expect(body.events.every((e: any) => typeof e.action === 'string')).toBe(true);
    expect(Array.isArray(body.recentFailures)).toBe(true);
    expect(body.recentFailures.some((f: any) => String(f.detail).includes('email='))).toBe(true);
  });

  it('filters by kind and searches the detail', async () => {
    const failures = await fetch(base + '/security/auth-log?kind=login_failed', { headers: token('a1', 'admin') });
    const body = await failures.json();
    expect(body.events.every((e: any) => e.action === 'login_failed')).toBe(true);

    const search = await fetch(base + '/security/auth-log?q=ghost', { headers: token('a1', 'admin') });
    const found = await search.json();
    expect(found.events.some((e: any) => String(e.detail).includes('ghost@test.dev'))).toBe(true);
  });

  it('ignores an unknown kind instead of matching nothing silently', async () => {
    const r = await fetch(base + '/security/auth-log?kind=not-a-kind', { headers: token('a1', 'admin') });
    expect(r.status).toBe(200);
    const body = await r.json();
    // Falls back to "all auth events" rather than an empty result the operator
    // would read as "no events".
    expect(body.events.length).toBeGreaterThan(0);
  });
});
