import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'fs';
import http from 'node:http';
import express from 'express';
import db, { initDB } from '../src/utils/db';
import { resolveSite } from '../src/middleware/site';
import sitemapRoutes from '../src/routes/sitemap';
import feedRoutes from '../src/routes/feed';

// The server-side generators must follow the per-site site_url, not the global
// one: a secondary domain's sitemap/feed advertising the primary domain is both
// wrong for crawlers and inconsistent with the SEO meta the HTML shell carries.
// fetch() refuses to set Host (undici forbids it), so drive node:http directly —
// this is what nginx's `proxy_set_header Host $host` reproduces.
const DB_FILE = process.env.MORTAR_DB_PATH || '/tmp/mortar-vitest-seo-persite.db';
let server: any;
let port = 0;

const setSetting = (k: string, v: string) =>
  db.prepare("INSERT INTO Setting (id, key, value) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").run(k, k, v);

function get(host: string, path: string): Promise<{ status: number; body: string }> {
  return new Promise((resolve, reject) => {
    const req = http.request({ hostname: '127.0.0.1', port, path, headers: { Host: host } }, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => resolve({ status: res.statusCode || 0, body: data }));
    });
    req.on('error', reject);
    req.end();
  });
}

beforeAll(async () => {
  initDB();
  db.prepare("INSERT OR REPLACE INTO User (id, username, email, password, role, tokenVersion) VALUES ('u1','alice','a@b.dev','x','author',0)").run();
  setSetting('site_title', 'Primary Site');
  setSetting('site_url', 'https://primary.test');

  db.prepare("INSERT OR REPLACE INTO Site (id, name, slug, domain, description, active, isPrimary) VALUES ('s1','Main','main','primary.test','',1,1)").run();
  db.prepare("INSERT OR REPLACE INTO Site (id, name, slug, domain, description, active, isPrimary) VALUES ('s2','Other','other','other.test','',1,0)").run();
  const ss = (k: string, v: string) => db.prepare('INSERT INTO SiteSetting (siteId, key, value) VALUES (?, ?, ?) ON CONFLICT(siteId,key) DO UPDATE SET value = excluded.value').run('s2', k, v);
  ss('site_title', 'Other Site');
  ss('site_url', 'https://other.test');

  const now = new Date().toISOString();
  const post = (id: string, slug: string, siteId: string | null) =>
    db.prepare("INSERT INTO Post (id, title, slug, content, excerpt, status, type, authorId, publishedAt, siteId) VALUES (?, ?, ?, '<p>b</p>', 'exc', 'published', 'post', 'u1', ?, ?)").run(id, id, slug, now, siteId);
  post('pG', 'global-post', null);
  post('pS', 'other-post', 's2');

  // Posts a crawler must not be told about.
  const now2 = new Date().toISOString();
  db.prepare("INSERT INTO Post (id,title,slug,content,excerpt,status,type,authorId,publishedAt,password) VALUES ('pP','Locked','locked','<p>b</p>','e','published','post','u1',?,'pw')").run(now2);
  db.prepare("INSERT INTO Post (id,title,slug,content,excerpt,status,type,authorId,publishedAt) VALUES ('pM','Members','members','<p>b</p>','e','published','post','u1',?)").run(now2);
  db.prepare("INSERT INTO Post (id,title,slug,content,excerpt,status,type,authorId,publishedAt) VALUES ('pN','NoIndex','noindex','<p>b</p>','e','published','post','u1',?)").run(now2);
  db.prepare("INSERT INTO PostMeta (id,postId,key,value) VALUES ('mM','pM','_members_only','1')").run();
  db.prepare("INSERT INTO PostMeta (id,postId,key,value) VALUES ('mN','pN','_seo_noindex','1')").run();

  db.prepare("INSERT INTO Comment (id, content, author, status, postId) VALUES ('cG','global comment','A','approved','pG')").run();
  db.prepare("INSERT INTO Comment (id, content, author, status, postId) VALUES ('cS','other comment','B','approved','pS')").run();
  db.prepare("INSERT INTO Comment (id, content, author, status, postId) VALUES ('cM','members comment','C','approved','pM')").run();

  const app = express();
  app.use(resolveSite);
  app.use('/api', sitemapRoutes);
  app.use('/api/feed', feedRoutes);
  server = app.listen(0);
  await new Promise((r) => server.on('listening', r));
  port = server.address().port;
});

afterAll(() => {
  server?.close();
  for (const s of ['', '-wal', '-shm']) { try { fs.unlinkSync(DB_FILE + s); } catch {} }
});

describe('sitemap follows the site', () => {
  it('advertises the secondary site domain for its own host', async () => {
    const r = await get('other.test', '/api/sitemap.xml');
    expect(r.status).toBe(200);
    expect(r.body).toContain('<loc>https://other.test</loc>');
    expect(r.body).toContain('https://other.test/post/other-post');
    expect(r.body).not.toContain('https://primary.test');
  });

  it('still uses the primary url for the primary host', async () => {
    const r = await get('primary.test', '/api/sitemap.xml');
    expect(r.body).toContain('<loc>https://primary.test</loc>');
    expect(r.body).not.toContain('https://other.test');
  });

  it('lists the site own content plus global content, not another site\'s', async () => {
    const r = await get('other.test', '/api/sitemap.xml');
    expect(r.body).toContain('other-post');
    expect(r.body).toContain('global-post');
  });
});

describe('gated and excluded posts are not advertised', () => {
  it('keeps password, members-only and noindex posts out of the sitemap', async () => {
    const r = await get('other.test', '/api/sitemap.xml');
    expect(r.body).toContain('/post/other-post');
    expect(r.body).not.toContain('/post/locked');
    expect(r.body).not.toContain('/post/members');
    expect(r.body).not.toContain('/post/noindex');
  });

  it('keeps them out of the RSS feed too', async () => {
    const r = await get('other.test', '/api/feed/rss');
    expect(r.body).toContain('/post/other-post');
    expect(r.body).not.toContain('/post/locked');
    expect(r.body).not.toContain('/post/members');
    expect(r.body).not.toContain('/post/noindex');
  });

  it('keeps comments on gated posts out of the comments feed', async () => {
    const r = await get('other.test', '/api/feed/comments');
    expect(r.body).toContain('global comment');
    expect(r.body).not.toContain('members comment');
  });
});

describe('feeds follow the site', () => {
  it('carries the secondary site title and url', async () => {
    const r = await get('other.test', '/api/feed/rss');
    expect(r.status).toBe(200);
    expect(r.body).toContain('<title>Other Site</title>');
    expect(r.body).toContain('<link>https://other.test</link>');
    expect(r.body).toContain('https://other.test/post/other-post');
    expect(r.body).not.toContain('https://primary.test');
  });

  it('scopes the comments feed to the site instead of returning every site', async () => {
    const secondary = await get('other.test', '/api/feed/comments');
    expect(secondary.body).toContain('other comment');
    expect(secondary.body).toContain('global comment');
    expect(secondary.body).not.toContain('https://primary.test');

    const primary = await get('primary.test', '/api/feed/comments');
    expect(primary.body).toContain('global comment');
    expect(primary.body).not.toContain('other comment');
  });
});
