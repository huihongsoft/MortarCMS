import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'fs';
import express from 'express';
import db, { initDB } from '../src/utils/db';
import { signToken } from '../src/utils/jwt';
import { addAction, addFilter, listHooks, removeAction, removeHooksBySource, withHookSource } from '../src/utils/hooks';
import { addShortcode, listShortcodes, removeShortcodesBySource } from '../src/utils/shortcodes';
import { setPluginContext } from '../src/utils/pluginApi';
import postRoutes from '../src/routes/posts';
import userRoutes from '../src/routes/users';
import themeRoutes from '../src/routes/themes';
import postTypeRoutes from '../src/routes/customPostTypes';
import formRoutes from '../src/routes/forms';

// Regressions found while reviewing the change set. Each one was a real defect.
const DB_FILE = process.env.MORTAR_DB_PATH || '/tmp/mortar-vitest-review.db';
let server: any;
let base = '';

const admin = { authorization: 'Bearer ' + signToken({ userId: 'a1', role: 'admin', v: 0 }), 'content-type': 'application/json' };

beforeAll(async () => {
  initDB();
  db.prepare("INSERT INTO User (id, username, email, password, role, tokenVersion) VALUES ('a1','a1','a1@test.dev','x','admin',0)").run();
  // A separate target for the password-change test: changing a password bumps
  // that user's tokenVersion, which would invalidate the token the other cases use.
  db.prepare("INSERT INTO User (id, username, email, password, role, tokenVersion) VALUES ('a2','a2','a2@test.dev','x','editor',0)").run();
  const app = express();
  app.use(express.json());
  app.use('/api/posts', postRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/themes', themeRoutes);
  app.use('/api/post-types', postTypeRoutes);
  app.use('/api', formRoutes);
  server = app.listen(0);
  await new Promise(r => server.on('listening', r));
  base = 'http://127.0.0.1:' + server.address().port + '/api';
});

afterAll(() => {
  server?.close();
  for (const s of ['', '-wal', '-shm']) { try { fs.unlinkSync(DB_FILE + s); } catch {} }
});

describe('review fixes', () => {
  it('the admin list total follows the content-type filter', async () => {
    await fetch(base + '/post-types', { method: 'POST', headers: admin, body: JSON.stringify({ slug: 'book', label: 'Books' }) });
    await fetch(base + '/posts', { method: 'POST', headers: admin, body: JSON.stringify({ title: 'A book', type: 'book' }) });
    await fetch(base + '/posts', { method: 'POST', headers: admin, body: JSON.stringify({ title: 'A post' }) });

    const books = await (await fetch(base + '/posts/admin?type=book', { headers: admin })).json();
    expect(books.posts.length).toBe(1);
    expect(books.total).toBe(1);          // used to report the 'post' count
    const posts = await (await fetch(base + '/posts/admin', { headers: admin })).json();
    expect(posts.total).toBe(1);
  });

  it('the user_updated hook never carries the new password', async () => {
    let seen: any = null;
    const listener = (_id: string, payload: any) => { seen = payload; };
    addAction('user_updated', listener);
    try {
      await fetch(base + '/users/a2', { method: 'PUT', headers: admin, body: JSON.stringify({ bio: 'hi', password: 'secret123' }) });
    } finally { removeAction('user_updated', listener); }
    expect(seen).toBeTruthy();
    expect(seen.password).toBeUndefined();
    expect(seen.bio).toBe('hi');
  });

  it('switching themes fires theme_deactivated for the previous one', async () => {
    const seen: string[] = [];
    const listener = (name: string) => { seen.push(name); };
    addAction('theme_deactivated', listener);
    try {
      const a = await fetch(base + '/themes/default/activate', { method: 'POST', headers: admin });
      expect(a.status, await a.clone().text()).toBe(200);
      const b = await fetch(base + '/themes/softstore/activate', { method: 'POST', headers: admin });
      expect(b.status, await b.clone().text()).toBe(200);
    } finally { removeAction('theme_deactivated', listener); }
    expect(seen).toContain('default');
  });

  it('deactivating a plugin removes its hooks and shortcodes', () => {
    const fn = () => {};
    withHookSource('plugin:demo', () => addAction('post_created', fn));
    setPluginContext('demo');
    addShortcode('demo-tag', () => 'x');
    setPluginContext(null);

    expect(listHooks().actions.find(h => h.name === 'post_created')!.listeners.some(l => l.source === 'plugin:demo')).toBe(true);
    expect(listShortcodes().some(s => s.name === 'demo-tag')).toBe(true);

    removeHooksBySource('plugin:demo');
    removeShortcodesBySource('demo');
    expect(listHooks().actions.find(h => h.name === 'post_created')!.listeners.some(l => l.source === 'plugin:demo')).toBe(false);
    expect(listShortcodes().some(s => s.name === 'demo-tag')).toBe(false);
  });

  it('a form field named __proto__ survives submission', async () => {
    const created = await (await fetch(base + '/admin/forms', {
      method: 'POST', headers: admin,
      body: JSON.stringify({ name: 'Proto', fields: [{ name: '__proto__', label: 'Weird', type: 'text', required: true }], enabled: true }),
    })).json();
    expect(created.slug, JSON.stringify(created)).toBeTruthy();
    const r = await fetch(base + '/forms/' + created.slug + '/submit', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      // A literal { __proto__: ... } in JS sets the prototype, not a key — send
      // the raw JSON the browser handler would produce.
      body: '{"__proto__":"value-kept"}',
    });
    expect(r.status, await r.clone().text()).toBe(200);
    const row = db.prepare("SELECT data FROM FormSubmission ORDER BY rowid DESC LIMIT 1").get() as any;
    expect(JSON.parse(row.data)).toHaveProperty('__proto__', 'value-kept');
  });
});
