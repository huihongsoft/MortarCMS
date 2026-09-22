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

  it('centres the placeholder label in the cover image', () => {
    importDemoData();
    const dir = process.env.UPLOADS_DIR as string;
    const svg = fs.readFileSync(dir + '/demo-obs.svg', 'utf8');
    const font = Number(/font-size="(\d+)"/.exec(svg)?.[1]);
    const y = Number(/<text[^>]*y="(\d+)"/.exec(svg)?.[1]);
    // `y` is the baseline, so the caps' visual centre is baseline - capHeight/2.
    // The canvas is 300 tall; the label must land on its middle.
    const capHeight = font * 0.72; // all-caps acronym, Arial/Helvetica/DejaVu
    expect(Math.abs((y - capHeight / 2) - 150)).toBeLessThanOrEqual(1.5);
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
    // The uploads directory itself survives the reset (only its contents are
    // cleared). This used to read `existsSync(...) || true`, which can never fail.
    expect(fsMod.existsSync(dir)).toBe(true);
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

// Menu items are rendered into a tree by matching `child.parentId === parent.id`,
// so an item without an id makes every parentless entry look like a child of
// every other one — the demo menu listed all of its items under each top-level
// entry. The shape is now part of the data.
describe('demo menu items', () => {
  it('carry stable ids and an explicit parentId', () => {
    importDemoData();
    const menu = db.prepare("SELECT items FROM Menu WHERE location = 'primary'").get() as any;
    const items = JSON.parse(menu.items || '[]');
    expect(items.length).toBeGreaterThan(0);
    for (const it of items) {
      expect(typeof it.id).toBe('string');
      expect(it.id.length).toBeGreaterThan(0);
      expect(it.parentId).toBeNull();
    }
    expect(new Set(items.map((i: any) => i.id)).size).toBe(items.length); // ids are unique
  });

  it('heals a menu stored without ids when it is read back', async () => {
    const menuRoutes = (await import('../src/routes/menus')).default;
    const expressMod = (await import('express')).default;
    const app = expressMod();
    app.use(expressMod.json());
    app.use('/api/menus', menuRoutes);
    const srv = app.listen(0);
    await new Promise(r => srv.on('listening', r));
    const url = 'http://127.0.0.1:' + (srv.address() as any).port + '/api/menus';

    // an install that imported the demo menu before the fix: items with no id
    db.prepare("INSERT INTO Menu (id, name, location, items) VALUES ('legacy-menu','Legacy','secondary', ?)")
      .run(JSON.stringify([{ label: '首页', url: '/' }, { label: '关于', url: '/page/about' }]));

    const first = await (await fetch(url + '/location/secondary')).json();
    expect(first.items.every((i: any) => typeof i.id === 'string' && i.id)).toBe(true);
    expect(first.items.every((i: any) => i.parentId === null)).toBe(true);

    // and it is persisted, so ids do not change between loads
    const second = await (await fetch(url + '/location/secondary')).json();
    expect(second.items.map((i: any) => i.id)).toEqual(first.items.map((i: any) => i.id));
    srv.close();
  });
});
