import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import express from 'express';
import fs from 'fs';
import db, { initDB } from '../src/utils/db';
import { signToken } from '../src/utils/jwt';
import { normalizePermalinkStructure, permalinkStructureError, getPermalinkPrefix, postUrl } from '../src/utils/slug';
import { buildSeoMeta, isKnownRoute, injectSeoMeta } from '../src/utils/seoMeta';
import sitemapRoutes, { invalidateSitemapCache } from '../src/routes/sitemap';
import feedRoutes from '../src/routes/feed';
import settingsRoutes from '../src/routes/settings';
import sitesRoutes from '../src/routes/sites';

// The permalink structure is a prefix setting: `/post/%slug%` by default, and
// anything else that keeps a single trailing %slug% with a non-empty, non-reserved
// prefix. Links, the crawler route table and SEO resolution all read it.
const DB_FILE = process.env.MORTAR_DB_PATH || '/tmp/mortar-vitest-permalink.db';
let server: any;
let base = '';

const setSetting = (key: string, value: string) =>
  db.prepare("INSERT INTO Setting (id, key, value) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").run(key, key, value);

const clearSetting = (key: string) => db.prepare('DELETE FROM Setting WHERE key = ?').run(key);

beforeAll(async () => {
  initDB();
  db.prepare("INSERT OR REPLACE INTO User (id, username, email, password, role, tokenVersion) VALUES ('ad','ad','ad@example.dev','x','admin',0)").run();
  db.prepare("INSERT INTO Site (id, name, slug, domain, isPrimary, active) VALUES ('s1','Site','site','localhost',1,1)").run();
  db.prepare("INSERT INTO Post (id, title, slug, content, excerpt, status, type, authorId, publishedAt) VALUES ('p1','Hello World','hello-world','<p>body</p>','ex','published','post','ad', ?)")
    .run(new Date().toISOString());
  clearSetting('permalink_structure');

  const app = express();
  app.use(express.json());
  app.use('/api', sitemapRoutes);   // the router owns /sitemap.xml itself
  app.use('/api/feed', feedRoutes);
  app.use('/api/settings', settingsRoutes);
  app.use('/api/sites', sitesRoutes);
  server = app.listen(0);
  await new Promise(r => server.on('listening', r));
  base = 'http://127.0.0.1:' + server.address().port + '/api';
});

afterAll(() => {
  server?.close();
  for (const s of ['', '-wal', '-shm']) { try { fs.unlinkSync(DB_FILE + s); } catch {} }
});

const asAdmin = { authorization: 'Bearer ' + signToken({ userId: 'ad', role: 'admin', v: 0 }), 'content-type': 'application/json' };

describe('structure validation', () => {
  it('accepts only a single trailing %slug% behind a usable prefix', () => {
    expect(normalizePermalinkStructure('/post/%slug%')).toBe('/post/%slug%');
    expect(normalizePermalinkStructure('/blog/%slug%')).toBe('/blog/%slug%');
    expect(normalizePermalinkStructure('/p/%slug%')).toBe('/p/%slug%');
    expect(normalizePermalinkStructure('/news/archive/%slug%')).toBe('/news/archive/%slug%');
    // refused: no token, token not last, two tokens, root level, reserved prefix,
    // uppercase, protocol, traversal
    for (const bad of ['/%slug%/', 'blog/%slug%', '/blog/%slug%/extra', '/%slug%/%slug%', '/%slug%', '/category/%slug%', '/admin/%slug%', '/Blog/%slug%', 'https://x/%slug%', '/blog/../%slug%', '', '/post/slug']) {
      expect(normalizePermalinkStructure(bad), bad).toBeNull();
    }
    // 'page' and 'type' are app routes of their own (/page/:slug, /type/:slug),
    // so neither may become the post prefix.
    for (const bad of ['/page/%slug%', '/type/%slug%']) {
      expect(normalizePermalinkStructure(bad), bad).toBeNull();
      expect(permalinkStructureError(bad), bad).toMatch(/冲突/);
    }
  });

  it('refuses a structure that is not a usable prefix', () => {
    expect(normalizePermalinkStructure('/blog%slug%')).toBeNull(); // no '/' before the token
    expect(normalizePermalinkStructure('/' + 'a'.repeat(200) + '/%slug%')).toBeNull();
  });

  it('explains why a structure was refused', () => {
    expect(permalinkStructureError('/blog/%slug%')).toBeNull();
    expect(permalinkStructureError('')).toBeNull(); // empty = default
    expect(permalinkStructureError('/blog/')).toMatch(/%slug%/);
    expect(permalinkStructureError('/%slug%')).toMatch(/根路径/);
    expect(permalinkStructureError('/category/%slug%')).toMatch(/冲突/);
    expect(permalinkStructureError('/Blog/%slug%')).toMatch(/小写字母/);
    // A vague "invalid" gave no clue which part was wrong.
    expect(permalinkStructureError('/blog%slug%')).toMatch(/前缀必须以 \/ 结尾/);
    expect(permalinkStructureError('/' + 'a'.repeat(200) + '/%slug%')).toMatch(/过长/);
    // traversal has its own reason instead of the misleading charset one
    expect(permalinkStructureError('/blog/../%slug%')).toMatch(/\.\./);
    // …and a string with no token is never reported as a length/charset problem
    expect(permalinkStructureError('/' + 'a'.repeat(200))).toMatch(/%slug%/);
  });

  it('falls back to the default when unset or unusable', () => {
    clearSetting('permalink_structure');
    expect(getPermalinkPrefix()).toBe('/post/');
    expect(postUrl('hello-world')).toBe('/post/hello-world');
    setSetting('permalink_structure', 'garbage');
    expect(getPermalinkPrefix()).toBe('/post/'); // stored junk cannot break links
    setSetting('permalink_structure', '/blog/%slug%');
    expect(getPermalinkPrefix()).toBe('/blog/');
    expect(postUrl('hello-world')).toBe('/blog/hello-world');
    clearSetting('permalink_structure');
  });
});

describe('the settings endpoint refuses an unusable structure', () => {
  it('rejects it with the reason instead of storing it', async () => {
    const bad = await fetch(base + '/settings', { method: 'PUT', headers: asAdmin, body: JSON.stringify({ permalink_structure: '/%slug%' }) });
    expect(bad.status).toBe(400);
    expect((await bad.json()).error).toMatch(/根路径/);
    expect(getPermalinkPrefix()).toBe('/post/');
  });

  it('stores a valid one in normalized form', async () => {
    const ok = await fetch(base + '/settings', { method: 'PUT', headers: asAdmin, body: JSON.stringify({ permalink_structure: '/blog/%slug%' }) });
    expect(ok.status).toBe(200);
    expect(getPermalinkPrefix()).toBe('/blog/');
    clearSetting('permalink_structure');
  });
});

describe('the settings read reports only what is in effect', () => {
  it('never shows a stored value that was refused by the current rules', async () => {
    // /page/ was accepted before page/:slug was noticed as a conflicting route.
    setSetting('permalink_structure', '/page/%slug%');
    const r = await fetch(base + '/settings');
    const body = await r.json();
    // The UI shows the effective value ('' = the default), not a dead one.
    expect(body.permalink_structure).toBe('');
    expect(getPermalinkPrefix()).toBe('/post/');
    clearSetting('permalink_structure');
  });
});

describe('the prefix reaches the generated URLs', () => {
  it('sitemap and feed publish under the configured prefix', async () => {
    // through the endpoint, like the settings page: the write purges the caches,
    // including the sitemap's own (which content purges do not touch)
    await fetch(base + '/settings', { method: 'PUT', headers: asAdmin, body: JSON.stringify({ permalink_structure: '/blog/%slug%' }) });
    const sitemap = await (await fetch(base + '/sitemap.xml')).text();
    expect(sitemap).toContain('/blog/hello-world');
    expect(sitemap).not.toContain('/post/hello-world');
    const feed = await (await fetch(base + '/feed/rss')).text();
    expect(feed).toContain('/blog/hello-world');
    await fetch(base + '/settings', { method: 'PUT', headers: asAdmin, body: JSON.stringify({ permalink_structure: '' }) });
    // The settings write purges through a lazy require() of this module (to avoid
    // an import cycle); vitest resolves that to a second instance, so the test
    // purges through the instance it actually imported. The real build shares one
    // module instance, which the same check under tsx confirms.
    invalidateSitemapCache();
  });

  it('keeps the default shape when unset', async () => {
    expect(getPermalinkPrefix(), 'setting should be back to the default').toBe('/post/');
    const r = await fetch(base + '/sitemap.xml');
    const body = await r.text();
    expect(r.status, body.slice(0, 120)).toBe(200);
    expect(body).toContain('/post/hello-world');
  });
});

describe('the crawler route table follows the prefix', () => {
  it('accepts the configured shape and still accepts the legacy one', () => {
    setSetting('permalink_structure', '/blog/%slug%');
    expect(isKnownRoute('/blog/hello-world')).toBe(true);
    expect(isKnownRoute('/post/hello-world')).toBe(true); // old links keep working
    expect(isKnownRoute('/blog/hello-world/extra')).toBe(false);
    expect(isKnownRoute('/nope/hello-world')).toBe(false);
    clearSetting('permalink_structure');
  });

  it('resolves post meta from the configured path', () => {
    setSetting('permalink_structure', '/blog/%slug%');
    setSetting('site_url', 'https://example.com');
    const meta = buildSeoMeta('/blog/hello-world', {});
    expect(meta?.title).toContain('Hello World');
    // and the legacy path still resolves to the same post
    expect(buildSeoMeta('/post/hello-world', {})?.title).toContain('Hello World');
    clearSetting('permalink_structure');
    clearSetting('site_url');
  });

  it('canonicalizes the legacy path to the configured one', () => {
    setSetting('permalink_structure', '/blog/%slug%');
    setSetting('site_url', 'https://example.com');
    // The legacy /post/<slug> shape stays reachable, but it is an alias: pointing
    // the canonical at it would ask search engines to index the post twice.
    expect(buildSeoMeta('/post/hello-world', {}).canonical).toBe('https://example.com/blog/hello-world');
    expect(buildSeoMeta('/blog/hello-world', {}).canonical).toBe('https://example.com/blog/hello-world');
    clearSetting('permalink_structure');
    clearSetting('site_url');
  });
});

describe('the client learns the prefix from the shell', () => {
  it('carries the structure in a meta tag, before the settings request', () => {
    // The client's route table is built at module load from this tag, so a direct
    // visit to /blog/<slug> resolves on the first render.
    const shell = '<html><head><title id="site-title">t</title><meta name="description" content="" /></head><body><div id="root"></div></body></html>';
    setSetting('permalink_structure', '/blog/%slug%');
    const html = injectSeoMeta(shell, buildSeoMeta('/blog/hello-world', { origin: 'https://example.com' }));
    expect(html).toContain('<meta name="mortar-permalink" content="/blog/%slug%" />');
    clearSetting('permalink_structure');
    // Unset: the client falls back to the default on its own, and no tag is sent.
    expect(injectSeoMeta(shell, buildSeoMeta('/', { origin: 'https://example.com' }))).not.toContain('mortar-permalink');
  });
});

describe('the permalink structure is global-only', () => {
  it('refuses a per-site override instead of storing one that would be ignored', async () => {
    const r = await fetch(base + '/sites/s1/settings', { method: 'PUT', headers: asAdmin, body: JSON.stringify({ permalink_structure: '/blog/%slug%' }) });
    expect(r.status).toBe(400);
    expect((await r.json()).error).toMatch(/全局设置/);
    const row = db.prepare("SELECT COUNT(*) as c FROM SiteSetting WHERE siteId = 's1' AND key = 'permalink_structure'").get() as any;
    expect(row.c).toBe(0);
  });
});
