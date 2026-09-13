import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'fs';
import crypto from 'crypto';
import express from 'express';
import bcrypt from 'bcryptjs';
import db, { initDB, cuid } from '../src/utils/db';
import { signToken } from '../src/utils/jwt';
import { appPasswordAuth, resolveOptionalUser } from '../src/middleware/auth';
import authRoutes from '../src/routes/auth';
import postRoutes from '../src/routes/posts';
import userRoutes from '../src/routes/users';
import editorTemplatesRoutes from '../src/routes/editorTemplates';

// MORTAR_DB_PATH is set by vitest.config.ts, so db.ts opens a throwaway file.
const DB_FILE = process.env.MORTAR_DB_PATH || '/tmp/mortar-vitest.db';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-0123456789abcdef0123456789abcdef';

const PW = 'Passw0rd1';
let pwHash = '';
let server: any;
let base = '';
const tokens: Record<string, string> = {};

function appToken(raw: string) { return { Authorization: 'App ' + raw }; }
function bearer(t: string) { return { Authorization: 'Bearer ' + t }; }
function appPwHash(raw: string) { return crypto.createHash('sha256').update(raw).digest('hex'); }

function insUser(id: string, username: string, role: string) {
  db.prepare('INSERT INTO User (id, username, email, password, role, tokenVersion) VALUES (?, ?, ?, ?, ?, 0)')
    .run(id, username, username + '@test.dev', pwHash, role);
}

function insAppPw(id: string, userId: string, raw: string, opts: { scope?: string; expires?: string; revoked?: number; tv?: number } = {}) {
  db.prepare(`INSERT INTO AppPassword (id, userId, name, hash, scope, expires_at, revoked, last_used_at, token_version, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, '', ?, ?)`)
    .run(id, userId, 'test', appPwHash(raw), opts.scope || 'full', opts.expires || '', opts.revoked || 0, opts.tv ?? 0, new Date().toISOString());
}

beforeAll(async () => {
  initDB();
  pwHash = bcrypt.hashSync(PW, 12);

  insUser('u-adm', 'admin1', 'admin');
  insUser('u-aut', 'author1', 'author');
  insUser('u-sub', 'sub1', 'subscriber');
  insUser('u-adm2', 'admin2', 'admin');
  insUser('u-2fa', 'twofa', 'author');
  db.prepare("UPDATE User SET two_factor_enabled = 1, two_factor_secret = '' WHERE id = 'u-2fa'").run();
  insUser('u-2fa2', 'twofa2', 'admin');
  db.prepare("UPDATE User SET two_factor_enabled = 1 WHERE id = 'u-2fa2'").run();

  // A second author's post, used for the cross-author edit check.
  db.prepare("INSERT INTO Post (id, title, slug, status, authorId) VALUES ('p-other', 'Other', 'other', 'published', 'u-adm2')").run();

  tokens.admin = signToken({ userId: 'u-adm', role: 'admin', v: 0 });
  tokens.author = signToken({ userId: 'u-aut', role: 'author', v: 0 });
  tokens.subscriber = signToken({ userId: 'u-sub', role: 'subscriber', v: 0 });
  tokens.twofa = signToken({ userId: 'u-2fa', role: 'author', v: 0 });

  const RAW_FULL = 'fulltoken-abcdef';
  const RAW_READ = 'readtoken-abcdef';
  const RAW_REVOKED = 'revoked-abcdef';
  const RAW_EXPIRED = 'expired-abcdef';
  const RAW_STALE = 'staletoken-abcdef';
  insAppPw('ap-full', 'u-adm', RAW_FULL, { scope: 'full' });
  insAppPw('ap-read', 'u-adm', RAW_READ, { scope: 'read' });
  insAppPw('ap-revoked', 'u-adm', RAW_REVOKED, { revoked: 1 });
  insAppPw('ap-expired', 'u-adm', RAW_EXPIRED, { expires: '2020-01-01T00:00:00.000Z' });
  insAppPw('ap-stale', 'u-adm', RAW_STALE, { tv: 0 });
  Object.assign(tokens, { RAW_FULL, RAW_READ, RAW_REVOKED, RAW_EXPIRED, RAW_STALE });

  const app = express();
  app.use(express.json());
  app.use('/api', appPasswordAuth);
  app.use('/api/auth', authRoutes);
  app.use('/api/posts', postRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/editor', editorTemplatesRoutes);
  // Stubs standing in for the real mutating-GET endpoints (db maintenance).
  app.get('/api/db/optimize', (_req, res) => { res.json({ ok: true }); });
  app.get('/api/plain', (_req, res) => { res.json({ ok: true }); });
  server = app.listen(0);
  await new Promise((r) => server.on('listening', r));
  base = 'http://127.0.0.1:' + server.address().port + '/api';
});

afterAll(async () => {
  server?.close();
  for (const suffix of ['', '-wal', '-shm']) { try { fs.unlinkSync(DB_FILE + suffix); } catch {} }
});

describe('authentication', () => {
  it('rejects a protected write without a token', async () => {
    const r = await fetch(base + '/posts', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ title: 'x' }) });
    expect(r.status).toBe(401);
  });

  it('accepts a valid bearer token', async () => {
    const r = await fetch(base + '/auth/me', { headers: bearer(tokens.author) });
    expect(r.status).toBe(200);
    expect((await r.json()).username).toBe('author1');
  });

  it('rejects a token whose session version is stale (logout everywhere)', async () => {
    db.prepare('UPDATE User SET tokenVersion = 1 WHERE id = ?').run('u-adm');
    try {
      const r = await fetch(base + '/auth/me', { headers: bearer(tokens.admin) });
      expect(r.status).toBe(401);
    } finally {
      db.prepare('UPDATE User SET tokenVersion = 0 WHERE id = ?').run('u-adm');
    }
  });

  it('does not accept a 2FA challenge token as a session (2FA bypass)', async () => {
    const login = await fetch(base + '/auth/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: 'twofa2@test.dev', password: PW }) });
    const body = await login.json();
    expect(body.twoFactorRequired).toBe(true);
    expect(typeof body.tempToken).toBe('string');
    // The temp token must not authenticate anywhere.
    const me = await fetch(base + '/auth/me', { headers: bearer(body.tempToken) });
    expect(me.status).toBe(401);
    // …and must not be usable to create an admin account either.
    const reg = await fetch(base + '/auth/register', { method: 'POST', headers: { ...bearer(body.tempToken), 'content-type': 'application/json' }, body: JSON.stringify({ username: 'bypass', email: 'bypass@test.dev', password: PW, role: 'admin' }) });
    expect(reg.status).toBe(201);
    expect((await reg.json()).user.role).not.toBe('admin');
  });
});

describe('authorization', () => {
  it('lets an author create a post', async () => {
    const r = await fetch(base + '/posts', { method: 'POST', headers: { ...bearer(tokens.author), 'content-type': 'application/json' }, body: JSON.stringify({ title: 'Hello' }) });
    expect(r.status).toBe(201);
    expect((await r.json()).title).toBe('Hello');
  });

  it('forbids a subscriber from creating a post (403)', async () => {
    const r = await fetch(base + '/posts', { method: 'POST', headers: { ...bearer(tokens.subscriber), 'content-type': 'application/json' }, body: JSON.stringify({ title: 'nope' }) });
    expect(r.status).toBe(403);
  });

  it("forbids an author from editing another author's post (403)", async () => {
    const r = await fetch(base + '/posts/p-other', { method: 'PUT', headers: { ...bearer(tokens.author), 'content-type': 'application/json' }, body: JSON.stringify({ title: 'hijack' }) });
    expect(r.status).toBe(403);
  });
});

describe('admin post search', () => {
  it('fuzzy-matches a title substring', async () => {
    const r = await fetch(base + '/posts/admin?search=Hello', { headers: bearer(tokens.admin) });
    expect(r.status).toBe(200);
    const body = await r.json();
    expect(body.posts.some((p: any) => p.title === 'Hello')).toBe(true);
    expect(body.total).toBeGreaterThanOrEqual(1);
  });

  it('returns no results for a non-matching query', async () => {
    const r = await fetch(base + '/posts/admin?search=zzzznomatch', { headers: bearer(tokens.admin) });
    expect(r.status).toBe(200);
    expect((await r.json()).total).toBe(0);
  });
});

describe('app passwords', () => {
  it('authenticates a full-scope app password', async () => {
    const r = await fetch(base + '/auth/me', { headers: appToken(tokens.RAW_FULL) });
    expect(r.status).toBe(200);
  });

  it('allows reads but blocks writes for a read-only app password', async () => {
    const read = await fetch(base + '/auth/me', { headers: appToken(tokens.RAW_READ) });
    expect(read.status).toBe(200);
    const write = await fetch(base + '/posts', { method: 'POST', headers: { ...appToken(tokens.RAW_READ), 'content-type': 'application/json' }, body: JSON.stringify({ title: 'blocked' }) });
    expect(write.status).toBe(403);
  });

  it('blocks read-only credentials from mutating GET endpoints', async () => {
    const plain = await fetch(base + '/plain', { headers: appToken(tokens.RAW_READ) });
    expect(plain.status).toBe(200);
    const optimize = await fetch(base + '/db/optimize', { headers: appToken(tokens.RAW_READ) });
    expect(optimize.status).toBe(403);
    // A full-scope credential is unaffected.
    const full = await fetch(base + '/db/optimize', { headers: appToken(tokens.RAW_FULL) });
    expect(full.status).toBe(200);
  });

  it('rejects a revoked app password', async () => {
    const r = await fetch(base + '/auth/me', { headers: appToken(tokens.RAW_REVOKED) });
    expect(r.status).toBe(401);
  });

  it('rejects an expired app password', async () => {
    const r = await fetch(base + '/auth/me', { headers: appToken(tokens.RAW_EXPIRED) });
    expect(r.status).toBe(401);
  });

  it('rejects an app password issued before the last logout-everywhere', async () => {
    db.prepare('UPDATE User SET tokenVersion = 2 WHERE id = ?').run('u-adm');
    try {
      const r = await fetch(base + '/auth/me', { headers: appToken(tokens.RAW_STALE) });
      expect(r.status).toBe(401);
    } finally {
      db.prepare('UPDATE User SET tokenVersion = 0 WHERE id = ?').run('u-adm');
    }
  });
});

describe('privilege escalation guards', () => {
  it('does not let a demoted admin token create an admin account', async () => {
    const demoted = signToken({ userId: 'u-adm2', role: 'admin', v: 0 });
    db.prepare("UPDATE User SET role = 'subscriber' WHERE id = 'u-adm2'").run();
    try {
      const r = await fetch(base + '/auth/register', { method: 'POST', headers: { ...bearer(demoted), 'content-type': 'application/json' }, body: JSON.stringify({ username: 'sneaky', email: 'sneaky@test.dev', password: PW, role: 'admin' }) });
      expect(r.status).toBe(201);
      expect((await r.json()).user.role).not.toBe('admin');
    } finally {
      db.prepare("UPDATE User SET role = 'admin' WHERE id = 'u-adm2'").run();
    }
  });

  it('does let a current admin assign a role', async () => {
    const r = await fetch(base + '/auth/register', { method: 'POST', headers: { ...bearer(tokens.admin), 'content-type': 'application/json' }, body: JSON.stringify({ username: 'byadmin', email: 'byadmin@test.dev', password: PW, role: 'editor' }) });
    expect(r.status).toBe(201);
    expect((await r.json()).user.role).toBe('editor');
  });
});

describe('global custom templates are admin-only', () => {
  it('forbids an author from creating a template', async () => {
    const r = await fetch(base + '/editor/templates', { method: 'POST', headers: { ...bearer(tokens.author), 'content-type': 'application/json' }, body: JSON.stringify({ name: 'x', html: '<p>hi</p>' }) });
    expect(r.status).toBe(403);
  });

  it('lets an admin create one, stripped of active content', async () => {
    const r = await fetch(base + '/editor/templates', { method: 'POST', headers: { ...bearer(tokens.admin), 'content-type': 'application/json' }, body: JSON.stringify({ name: 'tpl', html: '<p onclick="x()">hi</p><script>alert(1)</script>' }) });
    expect(r.status).toBe(201);
    const body = await r.json();
    expect(body.html).not.toContain('<script');
    expect(body.html).not.toContain('onclick');
  });
});

describe('resolveOptionalUser', () => {
  const fake = (authorization?: string) => ({ headers: authorization ? { authorization } : {} } as any);

  it('resolves a valid session token', () => {
    expect(resolveOptionalUser(fake('Bearer ' + tokens.author))?.role).toBe('author');
  });

  it('rejects partial (2FA challenge) tokens', () => {
    const partial = signToken({ userId: 'u-aut', role: 'author', type: '2fa' }, '5m');
    expect(resolveOptionalUser(fake('Bearer ' + partial))).toBeUndefined();
  });

  it('rejects a token with a stale session version', () => {
    db.prepare('UPDATE User SET tokenVersion = 7 WHERE id = ?').run('u-aut');
    try {
      expect(resolveOptionalUser(fake('Bearer ' + tokens.author))).toBeUndefined();
    } finally {
      db.prepare('UPDATE User SET tokenVersion = 0 WHERE id = ?').run('u-aut');
    }
  });

  it('returns undefined without a bearer token', () => {
    expect(resolveOptionalUser(fake())).toBeUndefined();
  });
});

describe('user deletion cleans up user-scoped rows', () => {
  it('removes AI session/audit rows along with the user', async () => {
    const now = new Date().toISOString();
    insUser('u-del', 'deleter', 'author');
    db.prepare("INSERT INTO AiSession (id, userId, title, messages, createdAt, updatedAt) VALUES ('s1', 'u-del', 't', '[]', ?, ?)").run(now, now);
    db.prepare("INSERT INTO AiAudit (id, userId, tool, createdAt) VALUES ('a1', 'u-del', 'x', ?)").run(now);
    const r = await fetch(base + '/users/u-del', { method: 'DELETE', headers: bearer(tokens.admin) });
    expect(r.status).toBe(200);
    expect((db.prepare("SELECT COUNT(*) AS c FROM AiSession WHERE userId = 'u-del'").get() as any).c).toBe(0);
    expect((db.prepare("SELECT COUNT(*) AS c FROM AiAudit WHERE userId = 'u-del'").get() as any).c).toBe(0);
    expect(db.prepare('SELECT id FROM User WHERE id = ?').get('u-del')).toBeFalsy();
  });
});

describe('2FA disable requires re-authentication', () => {
  it('rejects disabling without credentials', async () => {
    const r = await fetch(base + '/auth/2fa/disable', { method: 'POST', headers: { ...bearer(tokens.twofa), 'content-type': 'application/json' }, body: JSON.stringify({}) });
    expect(r.status).toBe(400);
  });

  it('rejects a wrong password', async () => {
    const r = await fetch(base + '/auth/2fa/disable', { method: 'POST', headers: { ...bearer(tokens.twofa), 'content-type': 'application/json' }, body: JSON.stringify({ password: 'WrongPass1' }) });
    expect(r.status).toBe(400);
  });

  it('disables with the correct password', async () => {
    const r = await fetch(base + '/auth/2fa/disable', { method: 'POST', headers: { ...bearer(tokens.twofa), 'content-type': 'application/json' }, body: JSON.stringify({ password: PW }) });
    expect(r.status).toBe(200);
    expect((db.prepare('SELECT two_factor_enabled AS e FROM User WHERE id = ?').get('u-2fa') as any).e).toBe(0);
  });
});
