import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'fs';
import express from 'express';
import bcrypt from 'bcryptjs';
import db, { initDB } from '../src/utils/db';
import { signToken } from '../src/utils/jwt';
import { invalidateRoleCache } from '../src/middleware/auth';
import roleRoutes from '../src/routes/roles';
import authRoutes from '../src/routes/auth';

const DB_FILE = process.env.MORTAR_DB_PATH || '/tmp/mortar-vitest-authz.db';
let server: any;
let base = '';

beforeAll(async () => {
  initDB();
  await bcrypt.hash('x', 4); // warm up
  db.prepare("INSERT OR REPLACE INTO User (id, username, email, password, role, tokenVersion) VALUES ('ad','ad','ad@example.dev','x','admin',0)").run();
  db.prepare("INSERT OR REPLACE INTO User (id, username, email, password, role, tokenVersion) VALUES ('mg','mg','mg@example.dev','x','manager',0)").run();
  db.prepare("INSERT OR REPLACE INTO Role (id, slug, name, capabilities, isSystem, createdAt) VALUES ('r-mgr','manager','Manager',?,0,'2024-01-01')")
    .run(JSON.stringify(['manage_roles', 'manage_links']));
  invalidateRoleCache();

  const app = express();
  app.use(express.json());
  app.use('/api/roles', roleRoutes);
  app.use('/api/auth', authRoutes);
  server = app.listen(0);
  await new Promise((r) => server.on('listening', r));
  base = 'http://127.0.0.1:' + server.address().port + '/api';
});

afterAll(() => {
  server?.close();
  for (const s of ['', '-wal', '-shm']) { try { fs.unlinkSync(DB_FILE + s); } catch {} }
});

const asAdmin = { authorization: 'Bearer ' + signToken({ userId: 'ad', role: 'admin', v: 0 }), 'content-type': 'application/json' };
const asManager = { authorization: 'Bearer ' + signToken({ userId: 'mg', role: 'manager', v: 0 }), 'content-type': 'application/json' };

// A role holding manage_roles must not be able to grant more than it holds:
// otherwise it writes capabilities: ['*'] onto the role it already has and
// becomes a full admin on the next request (requireCap reads live capabilities).
describe('capability grants are bounded by the granter', () => {
  it('refuses a self-escalation to * via the role it already holds', async () => {
    const r = await fetch(base + '/roles/manager', { method: 'PUT', headers: asManager, body: JSON.stringify({ capabilities: ['*'] }) });
    expect(r.status).toBe(403);
    const caps = JSON.parse((db.prepare("SELECT capabilities FROM Role WHERE slug = 'manager'").get() as any).capabilities);
    expect(caps).not.toContain('*');
  });

  it('refuses granting a capability the granter does not hold', async () => {
    const r = await fetch(base + '/roles/manager', { method: 'PUT', headers: asManager, body: JSON.stringify({ capabilities: ['manage_roles', 'delete_others_posts'] }) });
    expect(r.status).toBe(403);
  });

  it('allows a change within the granter own capabilities', async () => {
    // Both of these are held by 'manager', so the change is within its own set.
    const r = await fetch(base + '/roles/manager', { method: 'PUT', headers: asManager, body: JSON.stringify({ capabilities: ['manage_roles', 'manage_links'] }) });
    expect(r.status).toBe(200);
  });

  it('refuses creating a role above the granter', async () => {
    const r = await fetch(base + '/roles', { method: 'POST', headers: asManager, body: JSON.stringify({ name: 'Super', capabilities: ['*'] }) });
    expect(r.status).toBe(403);
  });

  it('still lets an admin grant anything', async () => {
    const r = await fetch(base + '/roles/manager', { method: 'PUT', headers: asAdmin, body: JSON.stringify({ capabilities: ['*'] }) });
    expect(r.status).toBe(200);
    expect(JSON.parse((db.prepare("SELECT capabilities FROM Role WHERE slug = 'manager'").get() as any).capabilities)).toContain('*');
  });
});

// The login route returned immediately for an unknown account, making it
// measurably faster than a wrong password even though the response body matched.
describe('login timing does not reveal whether an account exists', () => {
  it('spends comparable time on an unknown account', async () => {
    const start = Date.now();
    const r = await fetch(base + '/auth/login', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'nobody-' + Date.now() + '@example.dev', password: 'whatever123' }),
    });
    const elapsed = Date.now() - start;
    expect(r.status).toBe(401);
    expect((await r.json()).error).toBe('Invalid credentials');
    // Lower bound only (bcrypt cost 12 is ~200ms+): without the dummy compare this
    // path returns in a couple of milliseconds.
    expect(elapsed).toBeGreaterThan(25);
  });
});
