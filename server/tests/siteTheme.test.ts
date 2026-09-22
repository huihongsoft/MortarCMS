import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'fs';
import express from 'express';
import db, { initDB } from '../src/utils/db';
import { signToken } from '../src/utils/jwt';
import themeRoutes, { activeThemeName, themeOverrides, themeExists } from '../src/routes/themes';
import settingsRoutes from '../src/routes/settings';
import sitesRoutes from '../src/routes/sites';

// A theme can be chosen and restyled per site: the site's SiteSetting.theme_active
// and theme_<name>_<key> rows win over the install-wide ones. This is the layer
// that makes "one install, several designs" possible — and the reason the settings
// merge has to resolve the theme *for the site asking*, not globally.
const DB_FILE = process.env.MORTAR_DB_PATH || '/tmp/mortar-vitest-site-theme.db';
let server: any;
let base = '';

const setGlobal = (key: string, value: string) =>
  db.prepare('INSERT INTO Setting (id, key, value) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value').run(key, key, value);
const setSite = (siteId: string, key: string, value: string) =>
  db.prepare('INSERT INTO SiteSetting (siteId, key, value) VALUES (?, ?, ?) ON CONFLICT(siteId, key) DO UPDATE SET value = excluded.value').run(siteId, key, value);

beforeAll(async () => {
  initDB();
  db.prepare("INSERT OR REPLACE INTO User (id, username, email, password, role, tokenVersion) VALUES ('ad','ad','ad@example.dev','x','admin',0)").run();
  db.prepare("INSERT OR REPLACE INTO User (id, username, email, password, role, tokenVersion) VALUES ('sub','sub','sub@example.dev','x','subscriber',0)").run();
  db.prepare("INSERT INTO Site (id, name, slug, domain, isPrimary, active) VALUES ('s1','One','one','one.test',1,1)").run();
  db.prepare("INSERT INTO Site (id, name, slug, domain, isPrimary, active) VALUES ('s2','Two','two','two.test',0,1)").run();
  setGlobal('theme_active', 'softstore');

  const app = express();
  app.use(express.json());
  app.use('/api/themes', themeRoutes);
  app.use('/api/settings', settingsRoutes);
  app.use('/api/sites', sitesRoutes);
  server = app.listen(0);
  await new Promise((r) => server.on('listening', r));
  base = 'http://127.0.0.1:' + server.address().port + '/api';
});

afterAll(() => {
  server?.close();
  for (const s of ['', '-wal', '-shm']) { try { fs.unlinkSync(DB_FILE + s); } catch {} }
});

const asAdmin = { authorization: 'Bearer ' + signToken({ userId: 'ad', role: 'admin', v: 0 }), 'content-type': 'application/json' };
const asSub = { authorization: 'Bearer ' + signToken({ userId: 'sub', role: 'subscriber', v: 0 }), 'content-type': 'application/json' };

describe('theme selection is per site', () => {
  it('falls back to the install-wide theme', () => {
    expect(activeThemeName()).toBe('softstore');
    expect(activeThemeName('s1')).toBe('softstore');
  });

  it('lets one site run a different theme', async () => {
    setSite('s1', 'theme_active', 'aurora');
    expect(activeThemeName('s1')).toBe('aurora');
    // …without touching the other site or the install default
    expect(activeThemeName('s2')).toBe('softstore');
    expect(activeThemeName()).toBe('softstore');
    db.prepare("DELETE FROM SiteSetting WHERE siteId = 's1' AND key = 'theme_active'").run();
  });

  it('ignores a theme that is not installed', () => {
    setSite('s1', 'theme_active', 'not-a-theme');
    expect(activeThemeName('s1')).toBe('softstore');
    db.prepare("DELETE FROM SiteSetting WHERE siteId = 's1' AND key = 'theme_active'").run();
  });

  it('activates for a single site through the API', async () => {
    const r = await fetch(base + '/themes/aurora/activate', { method: 'POST', headers: asAdmin, body: JSON.stringify({ siteId: 's1' }) });
    expect(r.status).toBe(200);
    expect(activeThemeName('s1')).toBe('aurora');
    expect(activeThemeName()).toBe('softstore');   // the global default is untouched
    const bad = await fetch(base + '/themes/aurora/activate', { method: 'POST', headers: asAdmin, body: JSON.stringify({ siteId: 'nope' }) });
    expect(bad.status).toBe(404);
  });
});

describe('theme settings are per site', () => {
  it('layers the site over the install-wide value', () => {
    setGlobal('theme_softstore_primary_color', '#111111');
    setSite('s1', 'theme_softstore_primary_color', '#ff0000');
    expect(themeOverrides('softstore')['primary_color']).toBe('#111111');
    expect(themeOverrides('softstore', 's1')['primary_color']).toBe('#ff0000');
    // another theme name is unaffected by either row
    expect(themeOverrides('aurora', 's1')['primary_color']).toBeUndefined();
  });

  it('reaches the merged settings the frontend reads', async () => {
    // Both sites on the same theme, so this asserts the site layer rather than
    // the (separately tested) theme choice.
    setSite('s1', 'theme_active', 'softstore');
    setSite('s2', 'theme_active', 'softstore');
    const g = await (await fetch(base + '/settings?siteId=s2', { headers: asAdmin })).json();
    const s = await (await fetch(base + '/settings?siteId=s1', { headers: asAdmin })).json();
    expect(g.theme_name).toBe('softstore');
    expect(g.theme_primary_color).toBe('#111111');
    expect(s.theme_primary_color).toBe('#ff0000');
    // and the theme name itself follows the site
    setSite('s1', 'theme_active', 'aurora');
    const s2 = await (await fetch(base + '/settings?siteId=s1', { headers: asAdmin })).json();
    expect(s2.theme_name).toBe('aurora');
    setSite('s1', 'theme_active', 'softstore');
  });

  it('only lets an admin ask for another site', async () => {
    const r = await (await fetch(base + '/settings?siteId=s1', { headers: asSub })).json();
    // Exactly the install-wide value: the site's override must not leak.
    expect(r.theme_primary_color).toBe('#111111');
    // …and the theme list is scoped the same way
    const asAdminList = await (await fetch(base + '/themes?siteId=s1', { headers: asAdmin })).json();
    const asSubList = await (await fetch(base + '/themes?siteId=s1', { headers: asSub })).json();
    expect(asAdminList.siteId).toBe('s1');
    expect(asSubList.siteId).toBeNull();
  });

  it('keeps the theme_<name>_<key> namespace unambiguous', () => {
    // Settings are stored as theme_<name>_<key>, so an underscore in a theme name
    // would make one theme's panel read another's rows ("theme_a_b_x" could be
    // theme a + key b_x, or theme a_b + key x). Names are restricted instead.
    expect(themeExists('aurora')).toBe(true);
    expect(themeExists('a_b')).toBe(false);
    setGlobal('theme_a_b_primary_color', '#bbbbbb');
    setSite('s1', 'theme_active', 'a_b');
    expect(activeThemeName('s1')).toBe('softstore');   // ignored, not resolved
  });

  it('refuses a theme name that could escape the themes directory', () => {
    expect(themeExists('../default')).toBe(false);
    expect(themeExists('aurora/../default')).toBe(false);
    expect(themeExists('')).toBe(false);
    expect(themeExists('.')).toBe(false);
  });

  it('refuses the write routes to a non-admin', async () => {
    const activate = await fetch(base + '/themes/aurora/activate', { method: 'POST', headers: asSub, body: JSON.stringify({ siteId: 's1' }) });
    expect(activate.status).toBe(403);
    const write = await fetch(base + '/themes/aurora/settings?siteId=s1', { method: 'PUT', headers: asSub, body: JSON.stringify({ primary_color: '#000000' }) });
    expect(write.status).toBe(403);
    const siteWrite = await fetch(base + '/sites/s1/settings', { method: 'PUT', headers: asSub, body: JSON.stringify({ theme_active: 'aurora' }) });
    expect(siteWrite.status).toBe(403);
  });

  it('writes a site-scoped override without touching the global rows', async () => {
    const r = await fetch(base + '/themes/aurora/settings?siteId=s1', { method: 'PUT', headers: asAdmin, body: JSON.stringify({ primary_color: '#00ff00' }) });
    expect(r.status).toBe(200);
    expect(themeOverrides('aurora', 's1')['primary_color']).toBe('#00ff00');
    expect(themeOverrides('aurora')['primary_color']).toBeUndefined();
    const missing = await fetch(base + '/themes/aurora/settings?siteId=nope', { method: 'PUT', headers: asAdmin, body: JSON.stringify({ primary_color: '#00ff00' }) });
    expect(missing.status).toBe(404);
  });

  it('refuses a per-site theme that is not installed', async () => {
    const bad = await fetch(base + '/sites/s2/settings', { method: 'PUT', headers: asAdmin, body: JSON.stringify({ theme_active: 'not-a-theme' }) });
    expect(bad.status).toBe(400);
    const ok = await fetch(base + '/sites/s2/settings', { method: 'PUT', headers: asAdmin, body: JSON.stringify({ theme_active: 'default' }) });
    expect(ok.status).toBe(200);
    expect(activeThemeName('s2')).toBe('default');
  });
});

// fs.rmSync is recursive and the theme name is a directory component, so a name
// that resolves outside themesDir must never reach it (DELETE /api/themes/..%2f..)
describe('theme names never reach the filesystem unvalidated', () => {
  it('refuses a traversal name on delete and on the file browser', async () => {
    const del = await fetch(base + '/themes/..%2f..%2fuploads', { method: 'DELETE', headers: asAdmin });
    expect(del.status).toBe(400);
    const files = await fetch(base + '/themes/..%2f..%2fuploads/files', { headers: asAdmin });
    expect(files.status).toBe(404);
    const file = await fetch(base + '/themes/..%2f..%2fuploads/file?path=x.css', { headers: asAdmin });
    expect(file.status).toBe(404);
  });

  it('still serves a real theme', async () => {
    const files = await fetch(base + '/themes/aurora/files', { headers: asAdmin });
    expect(files.status).toBe(200);
  });
});
