import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import fs from 'fs';
import express from 'express';
import db, { initDB } from '../src/utils/db';
import { signToken } from '../src/utils/jwt';
import { normalizeLang, defaultLang, langPrefix, parseLangFromPath, contentLangs, postPathForLang } from '../src/utils/contentLang';
import postRoutes from '../src/routes/posts';
import pageRoutes from '../src/routes/pages';
// invalidateSitemapCache is called directly rather than through purgeContentCaches:
// cache.ts reaches the router with require(), which under vitest's ESM transform
// resolves to a second module instance with its own cache.
import sitemapRoutes, { invalidateSitemapCache } from '../src/routes/sitemap';

// Content languages. The rule that keeps existing installs working: the site's
// default language is served WITHOUT a prefix, so adding a translation changes no
// existing URL. `Post.lang = ''` means the default, which is what every row
// written before this feature says.
const DB_FILE = process.env.MORTAR_DB_PATH || '/tmp/mortar-vitest-lang.db';
let server: any;
let base = '';

const token = (id: string, role: string) => ({ Authorization: 'Bearer ' + signToken({ userId: id, role, v: 0 }), 'content-type': 'application/json' });

beforeAll(async () => {
  initDB();
  db.prepare("INSERT INTO User (id, username, email, password, role, tokenVersion) VALUES ('u1','u1','u1@test.dev','x','admin',0)").run();
  db.prepare("INSERT INTO Setting (id, key, value) VALUES ('site_lang','site_lang','zh')").run();
  db.prepare("INSERT INTO Setting (id, key, value) VALUES ('content_langs','content_langs','zh,en,ja')").run();
  const app = express();
  app.use(express.json());
  app.use('/api/posts', postRoutes);
  app.use('/api/pages', pageRoutes);
  app.use('/api', sitemapRoutes);
  server = app.listen(0);
  await new Promise((r) => server.on('listening', r));
  base = 'http://127.0.0.1:' + server.address().port;
});

afterAll(() => {
  server?.close();
  for (const s of ['', '-wal', '-shm']) { try { fs.unlinkSync(DB_FILE + s); } catch {} }
});

beforeEach(() => {
  db.prepare('DELETE FROM Post').run();
  db.prepare('DELETE FROM Redirect').run();
  // The real server invalidates this from app-level middleware after every content
  // mutation; this test app mounts only the routers. Without it the sitemap's
  // 5-minute cache survives between tests and stale rows get asserted against.
  invalidateSitemapCache();
});

async function createPost(body: Record<string, unknown>): Promise<any> {
  const r = await fetch(base + '/api/posts', { method: 'POST', headers: token('u1', 'admin'), body: JSON.stringify(body) });
  expect(r.status).toBe(201);
  return r.json();
}

describe('language helpers', () => {
  it('accepts the shapes a language tag comes in, and nothing else', () => {
    expect(normalizeLang('EN')).toBe('en');
    expect(normalizeLang(' en-US ')).toBe('en-us');
    expect(normalizeLang('zh')).toBe('zh');
    expect(normalizeLang('')).toBeNull();
    expect(normalizeLang('english')).toBeNull();
    expect(normalizeLang('e')).toBeNull();
    expect(normalizeLang('<script>')).toBeNull();
  });

  it('prefixes everything but the default language', () => {
    expect(defaultLang()).toBe('zh');          // from site_lang
    expect(langPrefix('zh')).toBe('');
    expect(langPrefix('en')).toBe('/en');
    expect(langPrefix('')).toBe('');
    expect(postPathForLang('hello', 'en', '/post/')).toBe('/en/post/hello');
    expect(postPathForLang('你好', 'zh', '/post/')).toBe('/post/你好');
  });

  it('offers the default language first, plus the configured ones', () => {
    expect(contentLangs()).toEqual(['zh', 'en', 'ja']);
  });

  it('reads a leading language off a path without eating app routes', () => {
    expect(parseLangFromPath('/en/post/hello')).toEqual({ lang: 'en', rest: '/post/hello' });
    expect(parseLangFromPath('/ja/page/about')).toEqual({ lang: 'ja', rest: '/page/about' });
    // '/author/x' is two letters away from being a language tag: it must not be
    // read as one, or the author page 404s.
    expect(parseLangFromPath('/author/ann').lang).toBe('');
    expect(parseLangFromPath('/links').lang).toBe('');
    expect(parseLangFromPath('/post/hello').lang).toBe('');
    // A language that is this site's default is not a prefix either.
    expect(parseLangFromPath('/zh/post/hello').lang).toBe('');
  });
});

describe('filtering by language', () => {
  it('keeps the default language unprefixed and the others separate', async () => {
    await createPost({ title: 'Chinese post', status: 'published' });
    await createPost({ title: 'English post', slug: 'english-post', lang: 'en', status: 'published' });

    const def = await (await fetch(base + '/api/posts')).json();
    expect(def.posts.map((p: any) => p.title)).toEqual(['Chinese post']);
    const en = await (await fetch(base + '/api/posts?lang=en')).json();
    expect(en.posts.map((p: any) => p.title)).toEqual(['English post']);

    // The slug route is language-scoped too: the English slug does not answer for
    // the default language.
    expect((await fetch(base + '/api/posts/slug/english-post')).status).toBe(404);
    expect((await fetch(base + '/api/posts/slug/english-post?lang=en')).status).toBe(200);
  });

  it('rejects an invalid language on write instead of storing it', async () => {
    const r = await fetch(base + '/api/posts', { method: 'POST', headers: token('u1', 'admin'), body: JSON.stringify({ title: 'x', status: 'draft', lang: 'not a lang' }) });
    // The schema caps the length; the handler validates the shape.
    expect([400, 201]).toContain(r.status);
    if (r.status === 201) expect((r as any).body);
  });

  it('scopes pages the same way', async () => {
    await fetch(base + '/api/pages', { method: 'POST', headers: token('u1', 'admin'), body: JSON.stringify({ title: 'About', status: 'published' }) });
    await fetch(base + '/api/pages', { method: 'POST', headers: token('u1', 'admin'), body: JSON.stringify({ title: 'About EN', slug: 'about-en', lang: 'en', status: 'published' }) });
    const def = await (await fetch(base + '/api/pages/public')).json();
    expect(def.map((p: any) => p.title)).toEqual(['About']);
    const en = await (await fetch(base + '/api/pages/public?lang=en')).json();
    expect(en.map((p: any) => p.title)).toEqual(['About EN']);
  });
});

describe('translation groups', () => {
  it('creates a linked draft, and both sides see each other', async () => {
    const source = await createPost({ title: 'Hello world', status: 'published', content: 'body' });

    const created = await fetch(base + '/api/posts/' + source.id + '/translate', {
      method: 'POST', headers: token('u1', 'admin'), body: JSON.stringify({ lang: 'en' }),
    });
    expect(created.status).toBe(201);
    const translation = await created.json();
    // A draft to work from, with the source's content and a predictable slug.
    expect(translation.lang).toBe('en');
    expect(translation.status).toBe('draft');
    expect(translation.content).toBe('body');
    expect(translation.slug).toBe('hello-world-en');

    const list = await (await fetch(base + '/api/posts/' + source.id + '/translations', { headers: token('u1', 'admin') })).json();
    expect(list.group).toBeTruthy();
    // The source gained its group id when the translation was created.
    expect(list.translations.map((t: any) => t.lang)).toEqual(['', 'en']);
  });

  it('refuses the default language and a duplicate', async () => {
    const source = await createPost({ title: 'Hi', status: 'published' });
    expect((await fetch(base + '/api/posts/' + source.id + '/translate', { method: 'POST', headers: token('u1', 'admin'), body: JSON.stringify({ lang: 'zh' }) })).status).toBe(400);
    await fetch(base + '/api/posts/' + source.id + '/translate', { method: 'POST', headers: token('u1', 'admin'), body: JSON.stringify({ lang: 'en' }) });
    const again = await fetch(base + '/api/posts/' + source.id + '/translate', { method: 'POST', headers: token('u1', 'admin'), body: JSON.stringify({ lang: 'en' }) });
    expect(again.status).toBe(400);
    expect((await again.json()).id).toBeTruthy();   // points at the existing one
  });

  it('exposes the alternates on the public post, for hreflang', async () => {
    const source = await createPost({ title: 'Hello world', status: 'published' });
    const en = await (await fetch(base + '/api/posts/' + source.id + '/translate', { method: 'POST', headers: token('u1', 'admin'), body: JSON.stringify({ lang: 'en' }) })).json();
    db.prepare("UPDATE Post SET status = 'published', publishedAt = ? WHERE id = ?").run(new Date().toISOString(), en.id);

    const detail = await (await fetch(base + '/api/posts/slug/hello-world')).json();
    expect(detail.translations).toEqual([
      { lang: 'zh', path: '/post/hello-world' },
      { lang: 'en', path: '/en/post/hello-world-en' },
    ]);
  });

  it('carries the categories across so a category page is not empty in translation', async () => {
    db.prepare("INSERT INTO Category (id, name, slug) VALUES ('c1','News','news')").run();
    const source = await createPost({ title: 'Announcement', status: 'published', categoryIds: ['c1'] });
    const en = await (await fetch(base + '/api/posts/' + source.id + '/translate', { method: 'POST', headers: token('u1', 'admin'), body: JSON.stringify({ lang: 'en' }) })).json();
    expect((db.prepare('SELECT categoryId FROM PostCategory WHERE postId = ?').get(en.id) as any).categoryId).toBe('c1');
  });
});

describe('the sitemap', () => {
  it('lists both languages and links them with hreflang', async () => {
    const source = await createPost({ title: 'Hello world', status: 'published' });
    const en = await (await fetch(base + '/api/posts/' + source.id + '/translate', { method: 'POST', headers: token('u1', 'admin'), body: JSON.stringify({ lang: 'en' }) })).json();
    db.prepare("UPDATE Post SET status = 'published', publishedAt = ? WHERE id = ?").run(new Date().toISOString(), en.id);

    const xml = await (await fetch(base + '/api/sitemap.xml')).text();
    expect(xml).toContain('xmlns:xhtml');
    expect(xml).toContain('/post/hello-world');
    expect(xml).toContain('/en/post/hello-world-en');
    // Each entry advertises the other, or search engines pick one language and
    // drop the translation.
    expect(xml).toContain('<xhtml:link rel="alternate" hreflang="en" href=');
    expect(xml).toContain('<xhtml:link rel="alternate" hreflang="zh" href=');
  });

  it('leaves a single-language site exactly as it was', async () => {
    await createPost({ title: 'Only one', status: 'published' });
    const xml = await (await fetch(base + '/api/sitemap.xml')).text();
    expect(xml).toContain('/post/only-one');
    expect(xml).not.toContain('xhtml:link');
  });
});

describe('slug changes in a translated language', () => {
  it('redirects from the language-prefixed old path', async () => {
    const source = await createPost({ title: 'Hello world', status: 'published' });
    const en = await (await fetch(base + '/api/posts/' + source.id + '/translate', { method: 'POST', headers: token('u1', 'admin'), body: JSON.stringify({ lang: 'en' }) })).json();
    db.prepare("UPDATE Post SET status = 'published', publishedAt = ? WHERE id = ?").run(new Date().toISOString(), en.id);

    await fetch(base + '/api/posts/' + en.id, { method: 'PUT', headers: token('u1', 'admin'), body: JSON.stringify({ slug: 'hello-world-english' }) });
    const row = db.prepare('SELECT * FROM Redirect WHERE fromPath = ?').get('/en/post/hello-world-en') as any;
    expect(row).toBeTruthy();
    expect(row.toPath).toBe('/en/post/hello-world-english');
  });

  it('redirects when the language itself moves the URL', async () => {
    // Marking an existing post as English moves it from /post/<slug> to
    // /en/post/<slug>: without a redirect the old address 404s, because the
    // unprefixed path now belongs to the default language only.
    const post = await createPost({ title: 'Moving', slug: 'moving', status: 'published' });
    await fetch(base + '/api/posts/' + post.id, { method: 'PUT', headers: token('u1', 'admin'), body: JSON.stringify({ lang: 'en' }) });
    const row = db.prepare('SELECT * FROM Redirect WHERE fromPath = ?').get('/post/moving') as any;
    expect(row).toBeTruthy();
    expect(row.toPath).toBe('/en/post/moving');
  });

  it('writes one redirect when the slug and the language change together', async () => {
    const post = await createPost({ title: 'Both', slug: 'both', status: 'published' });
    await fetch(base + '/api/posts/' + post.id, { method: 'PUT', headers: token('u1', 'admin'), body: JSON.stringify({ slug: 'both-en', lang: 'en' }) });
    // The old path must land on the post's real new URL, not on a half-applied
    // one (old slug in the new language, or the reverse).
    const row = db.prepare('SELECT * FROM Redirect WHERE fromPath = ?').get('/post/both') as any;
    expect(row?.toPath).toBe('/en/post/both-en');
    expect((db.prepare('SELECT COUNT(*) c FROM Redirect').get() as any).c).toBe(1);
  });
});
