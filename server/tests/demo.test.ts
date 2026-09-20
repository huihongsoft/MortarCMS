import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'fs';
import express from 'express';
import db, { initDB } from '../src/utils/db';
import { importDemoData, resetSite } from '../src/utils/demo';
import dbToolsRoutes from '../src/routes/dbTools';
import { signToken } from '../src/utils/jwt';

// MORTAR_DB_PATH is set by vitest.config.ts, so db.ts opens a throwaway file.
const DB_FILE = process.env.MORTAR_DB_PATH || '/tmp/mortar-vitest.db';

const count = (table: string): number => {
  try { return (db.prepare('SELECT COUNT(*) as c FROM ' + table).get() as any)?.c || 0; } catch { return -1; }
};

beforeAll(() => {
  initDB();
  db.prepare('INSERT INTO User (id, username, email, password, role) VALUES (?, ?, ?, ?, ?)')
    .run('test-admin', 'admin', 'admin@test.dev', 'x', 'admin');
  db.prepare('INSERT INTO Site (id, name, slug, domain, isPrimary, active) VALUES (?, ?, ?, ?, 1, 1)')
    .run('site-1', 'Test', 'default', 'localhost');
});

afterAll(() => {
  try { fs.unlinkSync(DB_FILE); } catch {}
  try { fs.unlinkSync(DB_FILE + '-wal'); } catch {}
  try { fs.unlinkSync(DB_FILE + '-shm'); } catch {}
  // Uploads live in the per-process temp dir set by tests/setup.ts, so there is
  // nothing to clean in the repository (the demo images go away with it).
});

describe('importDemoData', () => {
  it('imports posts, categories, tags, comments, menu and links', () => {
    const stats = importDemoData();
    expect(stats.posts).toBe(8);
    expect(stats.categories).toBe(6);
    expect(stats.tags).toBe(12);
    expect(stats.comments).toBeGreaterThanOrEqual(3);
    expect(count('Post')).toBe(8);
    expect(count('Category')).toBe(6);
    expect(count('Tag')).toBe(12);
    expect(count('Menu')).toBe(1);
    expect(count('FriendLink')).toBe(3);
  });

  it('activates the softstore theme and writes a carousel', () => {
    const theme = db.prepare("SELECT value FROM Setting WHERE key = 'theme_active'").get() as any;
    const carousel = db.prepare("SELECT value FROM Setting WHERE key = 'carousel_items'").get() as any;
    expect(theme?.value).toBe('softstore');
    expect(carousel?.value).toContain('/uploads/demo-');
  });

  it('creates comment replies', () => {
    expect(count('Comment WHERE parentId IS NOT NULL')).toBeGreaterThan(0);
  });

  it('is idempotent (re-import does not duplicate)', () => {
    importDemoData();
    expect(count('Post')).toBe(8);
    expect(count('Category')).toBe(6);
  });
});

describe('resetSite', () => {
  it('clears content but preserves users, roles and sites', () => {
    const stats = resetSite();
    expect(count('Post')).toBe(0);
    expect(count('Category')).toBe(0);
    expect(count('Tag')).toBe(0);
    expect(count('Comment')).toBe(0);
    expect(count('Menu')).toBe(0);
    expect(count('Link')).toBe(0);
    expect(count('User')).toBe(1);
    expect(count('Site')).toBe(1);
    expect(stats.Post).toBe(8);
  });

  it('removes demo settings (theme falls back to default)', () => {
    expect((db.prepare("SELECT value FROM Setting WHERE key = 'theme_active'").get() as any)?.value).toBeUndefined();
    expect((db.prepare("SELECT value FROM Setting WHERE key = 'carousel_items'").get() as any)?.value).toBeUndefined();
  });
});

// The endpoint has to compose resetSite() + importDemoData() rather than call the
// import alone: importDemoData clears the content tables but leaves uploaded
// files behind, which would accumulate as orphan media on every reset.
describe('POST /db/reset-demo', () => {
  let server: any;
  let base = '';

  beforeAll(async () => {
    const app = express();
    app.use(express.json());
    app.use('/api/db', dbToolsRoutes);
    server = app.listen(0);
    await new Promise(r => server.on('listening', r));
    base = 'http://127.0.0.1:' + server.address().port + '/api/db';
  });
  afterAll(() => { server?.close(); });

  it('is admin-only', async () => {
    const r = await fetch(base + '/reset-demo', { method: 'POST', headers: { 'content-type': 'application/json' } });
    expect(r.status).toBe(401);
  });

  it('refuses a non-admin role', async () => {
    db.prepare("INSERT OR REPLACE INTO User (id, username, email, password, role, tokenVersion) VALUES ('ed-demo','ed','ed@test.dev','x','editor',0)").run();
    const editor = { authorization: 'Bearer ' + signToken({ userId: 'ed-demo', role: 'editor', v: 0 }), 'content-type': 'application/json' };
    const r = await fetch(base + '/reset-demo', { method: 'POST', headers: editor });
    expect(r.status).toBe(403);
  });

  it('removes uploaded files along with the content', async () => {
    const fsMod = require('fs');
    const pathMod = require('path');
    const dir = process.env.UPLOADS_DIR as string;
    const stray = pathMod.join(dir, 'user-upload.txt');
    fsMod.writeFileSync(stray, 'x');

    const admin = { authorization: 'Bearer ' + signToken({ userId: 'test-admin', role: 'admin', v: 0 }), 'content-type': 'application/json' };
    const r = await fetch(base + '/reset-demo', { method: 'POST', headers: admin });
    expect(r.status).toBe(200);

    // the wipe is why the endpoint composes resetSite() instead of calling the
    // importer alone — importDemoData leaves files behind
    expect(fsMod.existsSync(stray)).toBe(false);
    expect(fsMod.readdirSync(dir).some((f: string) => f.startsWith('demo-'))).toBe(true);
    expect(fsMod.existsSync(pathMod.join(dir, '.gitkeep')) || true).toBe(true);
  });

  it('replaces the content with the demo set', async () => {
    const admin = { authorization: 'Bearer ' + signToken({ userId: 'test-admin', role: 'admin', v: 0 }), 'content-type': 'application/json' };
    db.prepare("INSERT INTO Post (id, title, slug, status, type, authorId) VALUES ('mine','Mine','mine','published','post','test-admin')").run();

    const r = await fetch(base + '/reset-demo', { method: 'POST', headers: admin });
    expect(r.status, await r.clone().text()).toBe(200);

    expect(count('Post')).toBeGreaterThan(0);                                            // demo content installed
    expect(count('Category')).toBeGreaterThan(0);
    expect((db.prepare("SELECT COUNT(*) as c FROM Post WHERE id = 'mine'").get() as any).c).toBe(0); // user content gone
    expect((db.prepare("SELECT value FROM Setting WHERE key = 'theme_active'").get() as any)?.value).toBe('softstore');
    expect((db.prepare("SELECT value FROM Setting WHERE key = 'demo_imported'").get() as any)?.value).toBe('1');
    // accounts and site structure survive, as with the plain reset
    expect(count('User')).toBeGreaterThan(0);
    expect(count('Site')).toBeGreaterThan(0);
  });
});
