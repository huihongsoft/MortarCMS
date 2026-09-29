import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import db, { initDB } from '../src/utils/db';
import { buildSeoMeta, injectSeoMeta, isKnownRoute, buildRobotsTxt, buildCrawlerFallback } from '../src/utils/seoMeta';
import { normalizeSeoField } from '../src/utils/seoFields';

const DB_FILE = process.env.MORTAR_DB_PATH || '/tmp/mortar-vitest-seo-meta.db';

// Mirrors the shape of frontend/index.html (the parts injectSeoMeta rewrites).
const shell = '<!doctype html><html><head><meta charset="utf-8" />'
  + '<meta name="description" content="Mortar CMS" />'
  + '<title id="site-title">Mortar CMS</title>'
  + '<script type="importmap">{}</script></head><body><div id="root"></div></body></html>';

const setSetting = (k: string, v: string) =>
  db.prepare("INSERT INTO Setting (id, key, value) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").run(k, k, v);

function addPost(id: string, slug: string, type: 'post' | 'page', extra: { title?: string; excerpt?: string; featured?: string; password?: string; publishedAt?: string; siteId?: string } = {}) {
  db.prepare("INSERT INTO Post (id, title, slug, content, excerpt, status, type, authorId, publishedAt, featured, password, siteId) VALUES (?, ?, ?, '<p>b</p>', ?, 'published', ?, 'u1', ?, ?, ?, ?)")
    .run(id, extra.title || id, slug, extra.excerpt || 'Excerpt for ' + slug, type, extra.publishedAt || new Date().toISOString(), extra.featured || null, extra.password || '', extra.siteId || null);
}
const addMeta = (postId: string, key: string, value: string) =>
  db.prepare('INSERT INTO PostMeta (id, postId, key, value) VALUES (?, ?, ?, ?) ON CONFLICT(postId, key) DO UPDATE SET value = excluded.value').run(postId + key, postId, key, value);

beforeAll(() => {
  initDB();
  db.prepare("INSERT OR REPLACE INTO User (id, username, email, password, role, tokenVersion) VALUES ('u1','alice','a@b.dev','x','author',0)").run();
  setSetting('site_title', 'MySite');
  setSetting('site_description', 'Site description');
  setSetting('site_url', 'https://example.com');
  // A second content language, so the language-prefixed routes below are live.
  setSetting('site_lang', 'zh');
  setSetting('content_langs', 'zh,en');

  addPost('p1', 'hello', 'post', { title: 'Hello World', excerpt: 'An excerpt', featured: '/uploads/pic.jpg' });
  addMeta('p1', '_seo_og_image', '/uploads/og.jpg');
  addPost('p2', 'secret', 'post', { title: 'Secret', password: 'pw' });
  addPost('p3', 'hidden', 'post', { title: 'Hidden' });
  addMeta('p3', '_seo_noindex', '1');
  addPost('p4', 'overridden', 'post', { title: 'Plain Title' });
  addMeta('p4', '_seo_title', 'Custom SEO Title');
  addMeta('p4', '_seo_canonical', 'https://canonical.example/elsewhere');
  // Scheduled for the future: must not be exposed (regression guard — an ISO
  // publishedAt compared against sqlite's datetime('now') looked "in the future"
  // for every row, so this also covers the ordinary published case).
  addPost('p5', 'later', 'post', { title: 'Later', publishedAt: new Date(Date.now() + 86_400_000).toISOString() });
  addPost('pg1', 'about', 'page', { title: 'About Us', excerpt: 'About the company' });
  // Shared classification fixtures (used by several describes).
  db.prepare("INSERT OR IGNORE INTO Category (id, name, slug) VALUES ('c1','News','news')").run();
  db.prepare("INSERT OR IGNORE INTO Category (id, name, slug) VALUES ('cA','Alpha','alpha')").run();
  db.prepare("INSERT OR IGNORE INTO Category (id, name, slug) VALUES ('cZ','Zeta','zeta')").run();
});

afterAll(() => {
  for (const s of ['', '-wal', '-shm']) { try { fs.unlinkSync(DB_FILE + s); } catch {} }
});

const build = (path: string, siteId?: string) => buildSeoMeta(path, { siteId, origin: 'http://fallback.test' });

describe('per-path meta', () => {
  it('uses site title and a trailing-slash canonical for the homepage', () => {
    const m = build('/');
    expect(m.title).toBe('MySite');
    expect(m.canonical).toBe('https://example.com/');
    expect(m.noindex).toBe(false);
  });

  it('exposes a published post with excerpt, absolute og:image and canonical', () => {
    const m = build('/post/hello');
    expect(m.title).toBe('Hello World - MySite');
    expect(m.description).toBe('An excerpt');
    // _seo_og_image wins over featured, and is made absolute
    expect(m.ogImage).toBe('https://example.com/uploads/og.jpg');
    expect(m.canonical).toBe('https://example.com/post/hello');
    expect(m.ogType).toBe('article');
    expect(m.noindex).toBe(false);
  });

  it('does not expose a future-dated post', () => {
    expect(build('/post/later').noindex).toBe(true);
  });

  it('keeps the title but noindexes a password-protected post, without a description', () => {
    const m = build('/post/secret');
    expect(m.title).toBe('Secret - MySite');
    expect(m.description).toBe('');
    expect(m.noindex).toBe(true);
  });

  it('honours the per-post noindex flag', () => {
    expect(build('/post/hidden').noindex).toBe(true);
  });

  it('honours _seo_title and _seo_canonical overrides', () => {
    const m = build('/post/overridden');
    expect(m.title).toBe('Custom SEO Title - MySite');
    expect(m.canonical).toBe('https://canonical.example/elsewhere');
  });

  it('exposes a published page', () => {
    const m = build('/page/about');
    expect(m.title).toBe('About Us - MySite');
    expect(m.description).toBe('About the company');
    expect(m.canonical).toBe('https://example.com/page/about');
  });

  it('noindexes unknown content and the UI-only routes', () => {
    expect(build('/post/does-not-exist').noindex).toBe(true);
    expect(build('/page/does-not-exist').noindex).toBe(true);
    for (const p of ['/search', '/404', '/share/ai/abc']) {
      expect(build(p).noindex).toBe(true);
    }
  });

  it('flags a valid-shaped path with no content as missing (so it answers 404)', () => {
    expect(build('/post/does-not-exist').notFound).toBe(true);
    expect(build('/page/does-not-exist').notFound).toBe(true);
    // A real page is not "missing" even though /search is noindex.
    expect(build('/post/hello').notFound).toBeUndefined();
    expect(build('/page/about').notFound).toBeUndefined();
    expect(build('/search').notFound).toBeUndefined();
  });

  it('keeps archive/author/link pages indexable with a canonical', () => {
    expect(build('/category/news').canonical).toBe('https://example.com/category/news');
    expect(build('/author/alice').title).toBe('alice - MySite');
    expect(build('/links').noindex).toBe(false);
  });
});

describe('site scoping and overrides', () => {
  it('prefers the per-site title and url over the global ones', () => {
    db.prepare("INSERT OR REPLACE INTO Site (id, name, slug, domain, description, active, isPrimary) VALUES ('s2','Other','other','other.test','',1,0)").run();
    const ss = (k: string, v: string) => db.prepare('INSERT INTO SiteSetting (siteId, key, value) VALUES (?, ?, ?) ON CONFLICT(siteId,key) DO UPDATE SET value = excluded.value').run('s2', k, v);
    ss('site_title', 'Other Site');
    ss('site_url', 'https://other.test');

    const m = build('/post/hello', 's2');
    expect(m.title).toBe('Hello World - Other Site');
    expect(m.canonical).toBe('https://other.test/post/hello');
  });

  it('does not resolve a post that belongs to another site', () => {
    addPost('p9', 'elsewhere', 'post', { title: 'Elsewhere', siteId: 's2' });
    db.prepare("INSERT OR REPLACE INTO Site (id, name, slug, domain, description, active, isPrimary) VALUES ('s1','Main','main','main.test','',1,0)").run();
    expect(build('/post/elsewhere', 's1').noindex).toBe(true);
    expect(build('/post/elsewhere', 's2').title).toBe('Elsewhere - Other Site');
  });
});

describe('article section follows the primary category', () => {
  it('uses the category named by _seo_primary_category', () => {
    addPost('pSection', 'sectioned', 'post', { title: 'Sectioned' });
    // Assigned two categories: alphabetically 'Alpha' would win without the pick.
    db.prepare("INSERT INTO PostCategory (postId, categoryId) VALUES ('pSection','cA')").run();
    db.prepare("INSERT INTO PostCategory (postId, categoryId) VALUES ('pSection','c1')").run();
    addMeta('pSection', '_seo_primary_category', 'c1');
    expect(build('/post/sectioned').article?.section).toBe('News');
    // A slug is accepted too.
    addMeta('pSection', '_seo_primary_category', 'news');
    expect(build('/post/sectioned').article?.section).toBe('News');
  });

  it('falls back to the first assigned category when unset', () => {
    addPost('pFallback', 'no-primary', 'post', { title: 'No Primary' });
    db.prepare("INSERT INTO PostCategory (postId, categoryId) VALUES ('pFallback','cA')").run();
    expect(build('/post/no-primary').article?.section).toBe('Alpha');
  });

  it('ignores a primary category the post is not assigned to', () => {
    addPost('pOther', 'other-cat', 'post', { title: 'Other Cat' });
    db.prepare("INSERT INTO PostCategory (postId, categoryId) VALUES ('pOther','cA')").run();
    addMeta('pOther', '_seo_primary_category', 'cZ');
    // Falls back rather than reporting a category the post is not in.
    expect(build('/post/other-cat').article?.section).toBe('Alpha');
  });
});

describe('listing fallbacks match the page they are on', () => {
  it('lists only the author posts on an author page', () => {
    db.prepare("INSERT OR REPLACE INTO User (id, username, email, password, role, tokenVersion) VALUES ('u2','bob','b@b.dev','x','author',0)").run();
    addPost('pBob', 'bobs-post', 'post', { title: "Bob's Post" });
    db.prepare("UPDATE Post SET authorId = 'u2' WHERE id = 'pBob'").run();
    const html = buildCrawlerFallback('/author/bob', undefined)!;
    expect(html).toContain('bobs-post');
    // alice's posts must not appear on bob's page
    expect(html).not.toContain('/post/hello');
  });

  it('filters a category page to that category and keeps the excerpt', () => {
    addPost('pCat', 'in-news', 'post', { title: 'In News', excerpt: 'News excerpt' });
    db.prepare("INSERT INTO PostCategory (postId, categoryId) VALUES ('pCat','c1')").run();
    const html = buildCrawlerFallback('/category/news', undefined)!;
    expect(html).toContain('<h1>News</h1>');
    expect(html).toContain('in-news');
    expect(html).toContain('News excerpt');
    expect(html).not.toContain('/post/bobs-post');
  });

  it('returns nothing for a category that does not exist', () => {
    expect(buildCrawlerFallback('/category/nope', undefined)).toBeNull();
  });

  it('filters an archive page to that month', () => {
    const now = new Date();
    const y = String(now.getUTCFullYear());
    const m = String(now.getUTCMonth() + 1).padStart(2, '0');
    const html = buildCrawlerFallback('/archive/' + y + '/' + m, undefined)!;
    expect(html).toContain('/post/hello');
    expect(buildCrawlerFallback('/archive/1999/01', undefined)).toBeNull();
  });
});

describe('share-card detail', () => {
  it('declares the image dimensions and alt from the media row', () => {
    db.prepare("INSERT INTO Media (id, filename, original, mimeType, size, url, alt, width, height) VALUES ('m1','pic.jpg','pic.jpg','image/jpeg',10,'/uploads/pic.jpg','A picture',1200,630)").run();
    addPost('p7', 'with-image', 'post', { title: 'With Image', featured: '/uploads/pic.jpg' });
    const m = build('/post/with-image');
    expect(m.ogImage).toBe('https://example.com/uploads/pic.jpg');
    expect(m.imageMeta).toEqual({ width: 1200, height: 630, alt: 'A picture' });
  });

  it('falls back to the post title for alt when the image has no media row', () => {
    // p1's og:image comes from _seo_og_image, which has no Media row: dimensions
    // are unknown (they would need fetching the image) but the card keeps alt.
    const m = build('/post/hello');
    expect(m.ogImage).toBe('https://example.com/uploads/og.jpg');
    expect(m.imageMeta).toEqual({ alt: 'Hello World' });
  });

  it('does the same for an external image', () => {
    addPost('pE', 'external', 'post', { title: 'External', featured: 'https://cdn.other.test/x.jpg' });
    const m = build('/post/external');
    expect(m.ogImage).toBe('https://cdn.other.test/x.jpg');
    expect(m.imageMeta).toEqual({ alt: 'External' });
  });

  it('omits the image entirely when the page has none', () => {
    const p = build('/page/about');
    expect(p.ogImage).toBeUndefined();
    expect(p.imageMeta).toBeUndefined();
  });

  it('carries article timestamps, author and section', () => {
    addPost('p6', 'with-meta', 'post', { title: 'Meta Post' });
    db.prepare("INSERT INTO PostCategory (postId, categoryId) VALUES ('p6','c1')").run();
    db.prepare("INSERT INTO PostCategory (postId, categoryId) VALUES ('p7','c1')").run();
    const m = build('/post/with-meta');
    expect(m.article?.authorName).toBe('alice');
    expect(m.article?.section).toBe('News');
    // Timestamps must be ISO 8601 even when sqlite's CURRENT_TIMESTAMP default
    // produced 'YYYY-MM-DD HH:MM:SS'.
    expect(m.article?.publishedTime).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(m.article?.modifiedTime).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('maps the site language to an og:locale tag', () => {
    setSetting('site_lang', 'zh');
    expect(build('/').locale).toBe('zh_CN');
    setSetting('site_lang', 'en');
    expect(build('/').locale).toBe('en_US');
    setSetting('site_lang', '');
    expect(build('/').locale).toBeUndefined();
  });
});

describe('the server route table mirrors the SPA', () => {
  it('treats every route declared in App.tsx as a known route', () => {
    const src = fs.readFileSync(path.join(__dirname, '../../frontend/src/App.tsx'), 'utf8');
    const patterns = [...src.matchAll(/path: '([^']+)'/g)].map((m) => m[1]);
    expect(patterns.length).toBeGreaterThan(10);
    // ':lang' samples as a language this site publishes: the prefixed routes only
    // exist for a translated site, and content_langs below makes 'en' one.
    const sample = (p: string) => p
      .replace(':lang', 'en').replace(':year', '2026').replace(':month', '09').replace(/:[^/]+/g, 'x');
    for (const p of patterns) {
      if (p === '*') continue; // the catch-all renders NotFound: deliberately not "known"
      expect(isKnownRoute(sample(p)), p + ' should be known').toBe(true);
    }
    // langRoute() wraps the path, so the literal never reaches a `path:` — the
    // same routes registered in a translation are checked here.
    const prefixed = [...src.matchAll(/langRoute\('([^']+)'/g)].map((m) => m[1]);
    expect(prefixed.length).toBeGreaterThan(5);
    for (const p of prefixed) {
      expect(isKnownRoute(sample('/:lang' + p)), p + ' should be known in a language').toBe(true);
    }
  });

  it('keeps the per-user pages out of the index, and out of the prerenderer', () => {
    // noindex is what turns server rendering off for these (index.ts's wantsSsr
    // reads meta.noindex), and it has to: the server has no token, so prerendering
    // them drew the signed-out state while a signed-in visitor's first render drew
    // the signed-in one — a hydration mismatch on every visit.
    for (const p of ['/my-posts', '/profile', '/submit-post', '/login', '/register', '/install', '/search', '/newsletter/confirm']) {
      expect(build(p).noindex, p + ' must not be indexed').toBe(true);
    }
    // …while the pages that earn their crawl stay eligible.
    for (const p of ['/', '/post/hello', '/page/about', '/category/news']) {
      expect(build(p).noindex, p).toBeFalsy();
    }
  });

  it('rejects paths the SPA has no route for', () => {
    for (const p of ['/nope', '/post/a/b', '/admin-ish', '/assets/missing.js', '/favicon.ico']) {
      expect(isKnownRoute(p), p).toBe(false);
    }
    expect(isKnownRoute('/admin/anything')).toBe(true);
    expect(isKnownRoute('/404')).toBe(true);
  });
});

describe('language-prefixed URLs', () => {
  it('resolves a translation under its prefix, and only for a language the site publishes', () => {
    db.prepare("INSERT INTO Post (id,title,slug,content,excerpt,status,type,authorId,publishedAt,lang) VALUES ('pLang','Hello (EN)','hello-en','<p>hi</p>','An excerpt','published','post','u1',?,'en')").run(new Date().toISOString());
    const m = build('/en/post/hello-en');
    expect(m.title).toBe('Hello (EN) - MySite');
    expect(m.notFound).toBeFalsy();
    // The canonical is the prefixed URL, not the unprefixed one it could also be
    // reached by.
    expect(m.canonical).toBe('https://example.com/en/post/hello-en');
    // A language the settings do not list is not a prefix: the path stays unknown
    // and the shell answers 404.
    setSetting('content_langs', 'zh,en');
    expect(isKnownRoute('/ja/post/hello-en')).toBe(false);
    expect(isKnownRoute('/en/post/hello-en')).toBe(true);
  });

  it('does not resolve the default language under a prefix', () => {
    // 'zh' is the default here, so /zh/post/hello is not a real page — the
    // unprefixed URL is the canonical one and adding the prefix must not create
    // a second copy of it.
    expect(isKnownRoute('/zh/post/hello')).toBe(false);
  });

  it('lists the crawler fallback in the requested language', () => {
    const html = buildCrawlerFallback('/en/', undefined);
    // The English homepage lists the English posts, linked under /en/.
    expect(html).toContain('Hello (EN)');
    expect(html).toContain('/en/post/hello-en');
    expect(html).not.toContain('/post/hello"');
  });

  it('strips the prefix in front of the app routes, but keeps them unprefixed-only for real pages', () => {
    // /en/links is not a page the server advertises: the app routes have no
    // language dimension, so a prefixed one must not become a soft 200.
    expect(isKnownRoute('/en/links')).toBe(true); // route shape exists (LangGate renders it)
    expect(isKnownRoute('/en/nope')).toBe(false);
  });
});

describe('robots.txt follows the site', () => {
  it('points the Sitemap at the site URL and honours a per-site block', () => {
    setSetting('site_url', 'https://example.com');
    expect(buildRobotsTxt(undefined)).toContain('Sitemap: https://example.com/api/sitemap.xml');
    expect(buildRobotsTxt(undefined)).toContain('Disallow: /admin/');

    db.prepare("INSERT OR REPLACE INTO SiteSetting (siteId, key, value) VALUES ('s2','blog_public','0')").run();
    expect(buildRobotsTxt('s2')).toBe('User-agent: *\nDisallow: /\n');

    db.prepare("INSERT OR REPLACE INTO SiteSetting (siteId, key, value) VALUES ('s2','blog_public','1')").run();
    db.prepare("INSERT OR REPLACE INTO SiteSetting (siteId, key, value) VALUES ('s2','site_url','https://other.test')").run();
    expect(buildRobotsTxt('s2')).toContain('Sitemap: https://other.test/api/sitemap.xml');
  });
});

describe('crawler fallback content', () => {
  it('renders a post as plain text inside an article', () => {
    db.prepare("INSERT INTO Post (id,title,slug,content,excerpt,status,type,authorId,publishedAt) VALUES ('pF','Fallback Post','fallback','<p>Hello</p><script>alert(1)</script><p>World</p>','Lead para','published','post','u1',?)").run(new Date().toISOString());
    const html = buildCrawlerFallback('/post/fallback', undefined);
    expect(html).toContain('<h1>Fallback Post</h1>');
    expect(html).toContain('Lead para');
    expect(html).toContain('Hello World');
    // The stored content HTML must never be emitted verbatim: the frontend
    // sanitizes it at render time, so a script would run before that here.
    expect(html).not.toContain('<script');
    expect(html).not.toContain('<p>Hello</p>');
  });

  it('escapes content that contains markup characters', () => {
    db.prepare("INSERT INTO Post (id,title,slug,content,excerpt,status,type,authorId,publishedAt) VALUES ('pX','T','esc','<p>&lt;img src=x onerror=alert(1)&gt; &amp; more</p>','','published','post','u1',?)").run(new Date().toISOString());
    const html = buildCrawlerFallback('/post/esc', undefined)!;
    expect(html).not.toContain('onerror=alert(1)>');
    expect(html).toContain('&lt;img');
  });

  it('gives no fallback for gated or missing content', () => {
    expect(buildCrawlerFallback('/post/secret', undefined)).toBeNull();
    expect(buildCrawlerFallback('/post/does-not-exist', undefined)).toBeNull();
    expect(buildCrawlerFallback('/search', undefined)).toBeNull();
    expect(buildCrawlerFallback('/share/ai/x', undefined)).toBeNull();
  });

  it('lists recent posts for the homepage so it is not an empty shell', () => {
    const html = buildCrawlerFallback('/', undefined)!;
    expect(html).toContain('<h1>MySite</h1>');
    expect(html).toContain('href="/post/hello"');
    // Never links a post a visitor cannot read.
    expect(html).not.toContain('/post/secret');
  });
});

describe('a title containing replacement patterns', () => {
  it('does not duplicate the title tag or inline the rest of the document', () => {
    // "$&" and "$'" are special inside a replacement STRING: the first re-inserts
    // the matched tag, the second everything that followed it. A post titled "$&"
    // produced two <title> elements with the page tail inlined into the first.
    addPost('p-dollar', 'dollar-post', 'post', { title: '$& <b>' });
    const out = injectSeoMeta(shell, build('/post/dollar-post'));
    // exactly one title element, holding the ESCAPED title — before the fix the
    // "$&" expanded to the matched tag and "$'" pulled the rest of the page in
    const titles = out.match(/<title id="site-title">[\s\S]*?<\/title>/g) || [];
    expect(titles).toHaveLength(1);
    expect(titles[0]).toContain('$&amp; &lt;b&gt;');
    expect(titles[0]).not.toContain('</head>');
    expect(out.match(/<meta name="description"/g)).toHaveLength(1);
  });
});

describe('twitter handle', () => {
  it('normalises the setting into an @handle and reaches every page', () => {
    setSetting('seo_twitter_handle', 'yoursite');
    expect(build('/').twitterSite).toBe('@yoursite');
    expect(build('/post/hello').twitterSite).toBe('@yoursite');
    setSetting('seo_twitter_handle', '@withat');
    expect(build('/').twitterSite).toBe('@withat');
    const out = injectSeoMeta(shell, build('/'));
    expect(out).toContain('<meta name="twitter:site" content="@withat" />');
  });

  it('omits the tag when unset', () => {
    setSetting('seo_twitter_handle', '');
    expect(build('/').twitterSite).toBeUndefined();
    expect(injectSeoMeta(shell, build('/'))).not.toContain('twitter:site');
  });
});

describe('seo meta field limits', () => {
  it('clamps the fields the editor also caps', () => {
    expect(normalizeSeoField('_seo_title', 'x'.repeat(100)).length).toBe(70);
    expect(normalizeSeoField('_seo_desc', 'x'.repeat(200)).length).toBe(160);
    expect(normalizeSeoField('_seo_canonical', 'x'.repeat(600)).length).toBe(500);
    expect(normalizeSeoField('_seo_og_image', 'x'.repeat(600)).length).toBe(500);
    expect(normalizeSeoField('_seo_title', 'short')).toBe('short');
  });

  it('normalises the noindex flag and leaves other meta alone', () => {
    expect(normalizeSeoField('_seo_noindex', '1')).toBe('1');
    expect(normalizeSeoField('_seo_noindex', 'true')).toBe('');
    expect(normalizeSeoField('_seo_noindex', '0')).toBe('');
    expect(normalizeSeoField('custom_field', 'x'.repeat(2000)).length).toBe(2000);
  });
});

describe('html injection', () => {
  it('places the crawler fallback inside #root, where React replaces it', () => {
    const out = injectSeoMeta(shell, build('/post/hello'), buildCrawlerFallback('/post/hello', undefined));
    expect(out).toContain('<div id="root"><article>');
    expect(out.indexOf('<div id="root">')).toBeLessThan(out.indexOf('</body>'));
    // No fallback requested -> the shell keeps its empty root.
    expect(injectSeoMeta(shell, build('/'), null)).toContain('<div id="root"></div>');
  });

  it('replaces the placeholder title and description and adds the social tags', () => {
    const out = injectSeoMeta(shell, build('/post/hello'));
    expect(out).toContain('<title id="site-title">Hello World - MySite</title>');
    expect(out).not.toContain('content="Mortar CMS"');
    expect(out).toContain('<meta property="og:title" content="Hello World - MySite" />');
    expect(out).toContain('<meta property="og:image" content="https://example.com/uploads/og.jpg" />');
    expect(out).toContain('<link rel="canonical" href="https://example.com/post/hello" />');
    // Injected inside <head>, and the rest of the shell is untouched.
    expect(out.indexOf('<meta property="og:title"')).toBeLessThan(out.indexOf('</head>'));
    expect(out).toContain('<script type="importmap">');
  });

  it('escapes values so content cannot inject markup into the head', () => {
    const m = { ...build('/'), title: 'Evil <script>alert(1)</script> "quoted"', description: 'a "b" & <c>' };
    const out = injectSeoMeta(shell, m);
    expect(out).not.toContain('<script>alert(1)</script>');
    expect(out).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(out).toContain('&quot;quoted&quot;');
    expect(out).toContain('a &quot;b&quot; &amp; &lt;c&gt;');
  });

  it('emits the card detail tags for an article', () => {
    const m = {
      ...build('/post/with-image'),
      imageMeta: { width: 1200, height: 630, alt: 'A picture' },
    };
    const out = injectSeoMeta(shell, m);
    expect(out).toContain('<meta property="og:image:width" content="1200" />');
    expect(out).toContain('<meta property="og:image:height" content="630" />');
    expect(out).toContain('<meta property="og:image:alt" content="A picture" />');
    expect(out).toContain('<meta property="article:published_time"');
    expect(out).toContain('<meta property="article:author" content="alice" />');
    expect(out).toContain('<meta property="article:section" content="News" />');
  });

  it('leaves out the detail tags when there is no image or article data', () => {
    const out = injectSeoMeta(shell, build('/'));
    expect(out).not.toContain('og:image');
    expect(out).not.toContain('article:published_time');
  });

  it('omits og:image and canonical when there is none, and survives a redesigned shell', () => {
    const out = injectSeoMeta('<head></head>', { title: 'T', description: 'D', ogType: 'website', siteName: 'S', noindex: false });
    expect(out).not.toContain('og:image');
    expect(out).not.toContain('rel="canonical"');
    expect(out).toContain('og:title');
  });
});
