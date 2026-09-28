import db from './db';
import { effectiveSetting } from './siteSettings';
import { defaultLang, contentLangs, requestLang, postPathForLang, pagePathForLang } from './contentLang';
import { PUBLIC_POST_CONDITIONS } from './publicPosts';
import { getPermalinkPrefix, getPermalinkStructure } from './slug';

// Server-side SEO meta for the SPA shell.
//
// The frontend is client-rendered, so the HTML the server hands out is an empty
// shell: crawlers that do not execute JavaScript (every social card scraper, and
// most bots other than Googlebot) would see the generic "Mortar CMS" title and no
// og:image at all. This module derives the real meta from the database for the
// requested path and injects it into the shell, so the very first response
// already carries a correct title/description/og image/canonical.
//
// The frontend's useSEO hook refreshes the same tags after hydration. It looks
// tags up by attribute (querySelector), so it updates these in place instead of
// adding duplicates.

export interface SeoMeta {
  title: string;
  description: string;
  ogImage?: string;
  canonical?: string;
  /** Other-language versions of this document, for hreflang. */
  alternates?: { lang: string; url: string }[];
  ogType: string;
  siteName: string;
  // True when the page must not be indexed. Signalled with an X-Robots-Tag
  // response header rather than a <meta> tag: the client hook removes a robots
  // meta it did not set, so a tag would only survive until hydration.
  noindex: boolean;
  // og:image:width/height/alt, read from the media row behind the image. Social
  // scrapers use the dimensions to pick the large card layout.
  imageMeta?: { width?: number; height?: number; alt?: string };
  // article:* — only meaningful for article-type pages.
  article?: { publishedTime?: string; modifiedTime?: string; authorName?: string; section?: string };
  locale?: string;
  // @handle for twitter:site (Setting: seo_twitter_handle).
  twitterSite?: string;
  // The normalized permalink structure ('/blog/%slug%'), carried into the shell
  // as <meta name="mortar-permalink">. The client reads it at module load to
  // build its route table, so a direct visit to a custom-prefix post URL
  // resolves on the first render instead of showing the 404 page until the
  // settings request comes back.
  permalinkStructure?: string;
  // The path had a valid shape (e.g. /post/<slug>) but no content behind it —
  // a deleted or renamed post. The caller answers 404 instead of 200 so search
  // engines drop the URL rather than indexing an empty shell.
  notFound?: boolean;
  // Comma-separated content languages, default first. Carried into the shell as
  // <meta name="mortar-langs"> for the client's route table and API calls.
  contentLangs?: string;
}

const HTML_ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const esc = (s: unknown) => String(s ?? '').replace(/[&<>"']/g, (c) => HTML_ESCAPES[c]);

// The frontend's route table (frontend/src/App.tsx). Mirrored here because the
// server has to know whether a path is a real page: anything else gets a 404
// instead of the SPA shell with status 200 (a "soft 404"). A test parses App.tsx
// and fails if a route is added there without updating this list.
const ROUTE_PATTERNS: RegExp[] = [
  /^\/$/,
  /^\/install\/?$/,
  /^\/post\/[^/]+$/,
  /^\/page\/[^/]+$/,
  /^\/archive\/\d{4}$/,
  /^\/archive\/\d{4}\/\d{1,2}$/,
  /^\/links\/?$/,
  /^\/author\/[^/]+$/,
  /^\/search\/?$/,
  /^\/register\/?$/,
  /^\/login\/?$/,
  /^\/submit-post\/?$/,
  /^\/my-posts\/?$/,
  /^\/profile\/?$/,
  /^\/newsletter\/(confirm|unsubscribe)\/?$/,
  /^\/share\/ai\/[^/]+$/,
  /^\/tag\/[^/]+$/,
  /^\/category\/[^/]+$/,
  /^\/type\/[^/]+$/,
  /^\/admin(\/.*)?$/,
  /^\/404\/?$/,
];

export function isKnownRoute(pathname: string): boolean {
  const raw = pathname && pathname !== '' ? pathname : '/';
  // A language prefix is part of the route on a translated site: /en/post/x is
  // as real as /post/x. On a site that does not publish that language the prefix
  // is not stripped, so the path stays unknown (and keeps answering 404).
  const path = requestLang(raw).rest;
  if (ROUTE_PATTERNS.some((re) => re.test(path))) return true;
  // The configured permalink prefix is a post route too. /post/ is already in the
  // table above, so this only adds the custom ones.
  const prefix = getPermalinkPrefix();
  return prefix !== '/post/' && path.startsWith(prefix) && /^[^/]+\/?$/.test(path.slice(prefix.length));
}

// Resolve a request path to the content behind it. The stored /post/<slug> shape
// is always accepted (old links, bookmarks, and the API's own URLs), plus the
// configured permalink prefix for posts.
function contentFromPath(path: string): { type: 'post' | 'page'; slug: string } | null {
  const legacy = path.match(/^\/(post|page)\/([^/]+)\/?$/);
  if (legacy) return { type: legacy[1] as 'post' | 'page', slug: decodeURIComponent(legacy[2]) };
  const prefix = getPermalinkPrefix();
  if (prefix !== '/post/' && path.startsWith(prefix)) {
    const rest = path.slice(prefix.length).replace(/\/$/, '');
    if (rest && !rest.includes('/')) return { type: 'post', slug: decodeURIComponent(rest) };
  }
  return null;
}

// Dimensions/alt for the media behind an og:image, so the card can be rendered in
// the large layout. Looked up by the stored (relative) URL, which is how
// Media.url is written.
//
// An absolute external image has no row here, and its dimensions cannot be known
// without fetching it — deliberately not done: this runs on the HTML request
// path, where an outbound fetch would add latency and an egress surface. The alt
// still comes from the post/page title so the card is never alt-less.
function imageMetaFor(url: string | undefined, altFallback?: string): { width?: number; height?: number; alt?: string } | undefined {
  const value = String(url || '').trim();
  if (!value) return undefined;
  const fallbackAlt = String(altFallback || '').trim() || undefined;
  if (!value.startsWith('/uploads/')) return fallbackAlt ? { alt: fallbackAlt } : undefined;
  try {
    const row = db.prepare('SELECT width, height, alt FROM Media WHERE url = ?').get(value) as any;
    const out: { width?: number; height?: number; alt?: string } = {};
    if (row && Number(row.width) > 0) out.width = Number(row.width);
    if (row && Number(row.height) > 0) out.height = Number(row.height);
    const alt = (row && row.alt) ? String(row.alt) : fallbackAlt;
    if (alt) out.alt = alt;
    return Object.keys(out).length ? out : undefined;
  } catch {
    return fallbackAlt ? { alt: fallbackAlt } : undefined;
  }
}

// The category to report as article:section. The schema has no ordering or
// "primary" flag on PostCategory, so the editor can name one via the
// _seo_primary_category meta (the SEO panel offers a picker); without it we fall
// back to the first category the post was assigned, by insertion order.
function sectionCategoryName(postId: string, meta: Record<string, string>): string | undefined {
  const chosen = String(meta._seo_primary_category || '').trim();
  if (chosen) {
    try {
      const row = db.prepare(
        'SELECT c.name FROM PostCategory pc JOIN Category c ON c.id = pc.categoryId WHERE pc.postId = ? AND (pc.categoryId = ? OR c.slug = ?)'
      ).get(postId, chosen, chosen) as any;
      if (row?.name) return String(row.name);
    } catch { /* fall through to the default */ }
  }
  return firstCategoryName(postId);
}

function firstCategoryName(postId: string): string | undefined {
  try {
    const row = db.prepare(
      'SELECT c.name FROM PostCategory pc JOIN Category c ON c.id = pc.categoryId WHERE pc.postId = ? ORDER BY c.name LIMIT 1'
    ).get(postId) as any;
    return row?.name ? String(row.name) : undefined;
  } catch {
    return undefined;
  }
}

// twitter:site wants an @handle; accept the setting with or without the '@'.
function twitterHandleFor(siteId: string | undefined): string | undefined {
  const raw = effectiveSetting(siteId, 'seo_twitter_handle').trim();
  if (!raw) return undefined;
  return raw.startsWith('@') ? raw : '@' + raw;
}

// og:locale expects a language_TERRITORY tag; the CMS stores a bare language.
function localeFor(siteId: string | undefined): string | undefined {
  const lang = effectiveSetting(siteId, 'site_lang').toLowerCase();
  if (lang.startsWith('zh')) return 'zh_CN';
  if (lang.startsWith('en')) return 'en_US';
  return undefined;
}

// og/article timestamps expect ISO 8601. A row created with sqlite's
// CURRENT_TIMESTAMP default is 'YYYY-MM-DD HH:MM:SS' (UTC, space separator),
// which scrapers do not parse — normalise it.
export function toIsoTimestamp(value: unknown): string | undefined {
  const s = String(value || '').trim();
  if (!s) return undefined;
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(s)) return s.replace(' ', 'T') + 'Z';
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?$/.test(s)) return s + 'Z';
  return s;
}

function readSeoMeta(postId: string): Record<string, string> {
  try {
    const rows = db.prepare(
      "SELECT key, value FROM PostMeta WHERE postId = ? AND key IN ('_seo_title','_seo_desc','_seo_noindex','_seo_canonical','_seo_og_image','_seo_primary_category')"
    ).all(postId) as any[];
    const out: Record<string, string> = {};
    for (const r of rows) out[r.key] = String(r.value);
    return out;
  } catch {
    return {};
  }
}

// Only content a visitor could actually reach: published, not scheduled for the
// future, and within the site (global content has siteId NULL).
// publishedAt is stored as an ISO-8601 string ('…T…Z'), which compares wrongly
// against sqlite's datetime('now') ('… …' with a space) — 'T' > ' ', so every row
// would look like it is in the future. Bind an ISO timestamp instead.
function findPublished(type: 'post' | 'page', slug: string, siteId: string | undefined, lang = ''): any {
  try {
    const scope = siteId ? ' AND (p.siteId IS NULL OR p.siteId = ?)' : '';
    const now = new Date().toISOString();
    const args: any[] = siteId ? [slug, type, lang, now, siteId] : [slug, type, lang, now];
    return db.prepare(
      `SELECT p.id, p.title, p.slug, p.lang, p.translationGroup, p.excerpt, p.content, p.featured, p.password, p.status,
              p.publishedAt, p.updatedAt, u.username as authorName
       FROM Post p LEFT JOIN User u ON u.id = p.authorId
       WHERE p.slug = ? AND p.type = ? AND p.lang = ? AND p.status = 'published' AND (p.publishedAt IS NULL OR p.publishedAt <= ?)${scope}`
    ).get(...args);
  } catch {
    return undefined;
  }
}

// og:image must be an absolute URL — social scrapers discard relative ones.
function absoluteUrl(value: string | undefined, siteUrl: string, cdnUrl: string): string | undefined {
  const v = String(value || '').trim();
  if (!v) return undefined;
  if (/^https?:\/\//i.test(v)) return v;
  if (!v.startsWith('/')) return undefined;
  const cdn = cdnUrl.replace(/\/$/, '');
  if (v.startsWith('/uploads/') && cdn) return cdn + v;
  return siteUrl + v;
}

export function buildSeoMeta(pathname: string, opts: { siteId?: string; origin: string }): SeoMeta {
  const siteId = opts.siteId;
  const setting = (key: string) => effectiveSetting(siteId, key);
  const siteName = setting('site_title') || 'Mortar CMS';
  const siteDescription = setting('site_description') || '';
  const siteUrl = (setting('site_url') || opts.origin).replace(/\/$/, '');
  const requested = pathname && pathname !== '' ? pathname : '/';
  // Which language this URL asks for, and the same path without the prefix. The
  // prefix decides which row is "the" page here (slug lookup below) and which
  // URL is canonical; everything else works on the stripped path.
  const { lang, rest: path } = requestLang(requested);
  const base: SeoMeta = {
    title: siteName,
    description: siteDescription,
    ogType: 'website',
    siteName,
    noindex: false,
    // Every branch spreads `base`, so the handle reaches every page.
    twitterSite: twitterHandleFor(siteId),
    permalinkStructure: getPermalinkStructure() || undefined,
    // The languages this site publishes, default first, carried into the shell as
    // <meta name="mortar-langs"> — the client reads it at module load to build its
    // route table and to decide which requests need ?lang=.
    contentLangs: contentLangs().join(',') || undefined,
  };

  // Pages that exist only as UI state and must never be indexed.
  if (/^\/search(\/|$)/.test(path) || /^\/404(\/|$)/.test(path) || /^\/share\//.test(path)) {
    return { ...base, noindex: true };
  }

  const postRoute = contentFromPath(path);
  if (postRoute?.type === 'post') {
    const post = findPublished('post', postRoute.slug, siteId, lang);
    if (!post) return { ...base, noindex: true, notFound: true };
    const meta = readSeoMeta(post.id);
    // A password-protected post is reachable but its body is not public, so keep
    // it out of the index (the title is already exposed by the API stub).
    if (post.password) return { ...base, title: post.title + ' - ' + siteName, description: '', ogType: 'article', noindex: true };
    const imageSource = meta._seo_og_image || post.featured;
    return {
      ...base,
      title: (meta._seo_title || post.title) + ' - ' + siteName,
      description: meta._seo_desc || post.excerpt || '',
      ogImage: absoluteUrl(imageSource, siteUrl, setting('cdn_url')),
      // Built from the slug and the post's own language, not from the requested
      // path: the stored /post/<slug> shape stays reachable for old links, but it
      // is an alias — pointing the canonical at it would ask search engines to
      // index the same post twice once a custom prefix is configured. A
      // translation canonicalizes to its own /<lang>/… URL, whichever shape was
      // used to reach it.
      canonical: meta._seo_canonical || siteUrl + postPathForLang(post.slug, post.lang, getPermalinkPrefix()),
      alternates: alternatesFor(post, siteUrl),
      ogType: 'article',
      noindex: meta._seo_noindex === '1',
      imageMeta: imageMetaFor(imageSource, post.title),
      article: {
        publishedTime: toIsoTimestamp(post.publishedAt),
        modifiedTime: toIsoTimestamp(post.updatedAt),
        authorName: post.authorName || undefined,
        section: sectionCategoryName(post.id, meta),
      },
      locale: localeFor(siteId),
    };
  }

  const pageMatch = path.match(/^\/page\/([^/]+)$/);
  if (pageMatch) {
    const page = findPublished('page', decodeURIComponent(pageMatch[1]), siteId, lang);
    if (!page || page.status === 'private') return { ...base, noindex: true, notFound: true };
    if (page.password) return { ...base, title: page.title + ' - ' + siteName, description: '', noindex: true };
    return {
      ...base,
      title: page.title + ' - ' + siteName,
      description: page.excerpt || '',
      ogImage: absoluteUrl(page.featured, siteUrl, setting('cdn_url')),
      // From the page's own language, so /en/page/about advertises itself rather
      // than the default-language path it was reached under.
      canonical: siteUrl + pagePathForLang(page.slug, page.lang),
      alternates: alternatesFor(page, siteUrl),
      ogType: 'article',
      noindex: false,
      imageMeta: imageMetaFor(page.featured, page.title),
      article: {
        publishedTime: toIsoTimestamp(page.publishedAt),
        modifiedTime: toIsoTimestamp(page.updatedAt),
        authorName: page.authorName || undefined,
      },
      locale: localeFor(siteId),
    };
  }

  const authorMatch = path.match(/^\/author\/([^/]+)$/);
  if (authorMatch) {
    const username = decodeURIComponent(authorMatch[1]);
    return { ...base, title: username + ' - ' + siteName, canonical: siteUrl + path, locale: localeFor(siteId) };
  }

  // Home, category/tag/type archives, archive by month, links.
  return { ...base, canonical: siteUrl + (path === '/' ? '/' : path), locale: localeFor(siteId) };
}

// Plain-text rendering of stored content HTML. Only text nodes survive: the
// stored HTML is sanitized by the frontend at render time (DOMPurify), so it must
// never be emitted verbatim into the shell where it would execute before that.
function toPlainText(html: unknown): string {
  return String(html || '')
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

// Fallback content for crawlers that do not execute JavaScript — the head meta is
// injected either way, but until now the body was an empty shell. It is placed
// inside #root, which React clears on the first render (main.tsx uses createRoot,
// NOT hydrateRoot — switching to hydration would make this a mismatch), so a
// visitor with JS sees the real app and never this. Same content, plain text:
// progressive enhancement, not cloaking.
export function buildCrawlerFallback(pathname: string, siteId: string | undefined): string | null {
  const raw = pathname && pathname !== '' ? pathname : '/';
  const { lang, rest: path } = requestLang(raw);
  const siteName = effectiveSetting(siteId, 'site_title') || 'Mortar CMS';

  const contentMatch = contentFromPath(path);
  if (contentMatch) {
    const post = findPublished(contentMatch.type, contentMatch.slug, siteId, lang);
    // Gated or missing content gets no fallback: the page is noindex/404 anyway.
    if (!post || post.password) return null;
    const body = toPlainText(post.content).slice(0, 1500);
    return '<article><h1>' + esc(post.title) + '</h1>'
      + (post.excerpt ? '<p>' + esc(toPlainText(post.excerpt)) + '</p>' : '')
      + (body ? '<p>' + esc(body) + '</p>' : '')
      + '</article>';
  }

  // Listing pages: the homepage, the archive by month, the taxonomy archives and
  // the author archive. Each is filtered to the posts that page actually shows —
  // an author page must not list every author's posts.
  const listing = listingFor(path, siteId, siteName, lang);
  if (!listing) return null;
  if (!listing.posts.length) return null;
  // One read for the whole list; see the note on langPrefix.
  const prefix = getPermalinkPrefix();
  const def = defaultLang();
  return '<main><h1>' + esc(listing.title) + '</h1><ul>'
    + listing.posts.map((p) => '<li><a href="' + esc(postPathForLang(p.slug, p.lang, prefix, def)) + '">' + esc(p.title) + '</a>'
        + (p.excerpt ? '<p>' + esc(toPlainText(p.excerpt).slice(0, 200)) + '</p>' : '')
        + '</li>').join('')
    + '</ul></main>';
}

interface ListingPost { slug: string; title: string; excerpt?: string; lang?: string }

function listingFor(path: string, siteId: string | undefined, siteName: string, lang = ''): { title: string; posts: ListingPost[] } | null {
  if (path === '/') return { title: siteName, posts: publicPosts(siteId, lang, '', []) };

  const category = path.match(/^\/category\/([^/]+)$/);
  if (category) {
    const slug = decodeURIComponent(category[1]);
    const row = db.prepare('SELECT name FROM Category WHERE slug = ?').get(slug) as any;
    if (!row) return null;
    return {
      title: row.name,
      posts: publicPosts(siteId, lang, ' AND EXISTS (SELECT 1 FROM PostCategory pc JOIN Category c ON c.id = pc.categoryId WHERE pc.postId = p.id AND c.slug = ?)', [slug]),
    };
  }

  const tag = path.match(/^\/tag\/([^/]+)$/);
  if (tag) {
    const slug = decodeURIComponent(tag[1]);
    const row = db.prepare('SELECT name FROM Tag WHERE slug = ?').get(slug) as any;
    if (!row) return null;
    return {
      title: row.name,
      posts: publicPosts(siteId, lang, ' AND EXISTS (SELECT 1 FROM PostTag pt JOIN Tag t ON t.id = pt.tagId WHERE pt.postId = p.id AND t.slug = ?)', [slug]),
    };
  }

  const type = path.match(/^\/type\/([^/]+)$/);
  if (type) {
    const slug = decodeURIComponent(type[1]);
    // Custom post types are a JSON list in Setting.custom_post_types (routes/customPostTypes.ts),
    // not a table; fall back to the slug when the type has no registered label.
    let label = slug;
    try {
      const row = db.prepare("SELECT value FROM Setting WHERE key = 'custom_post_types'").get() as any;
      const list = row ? JSON.parse(row.value) : [];
      const found = Array.isArray(list) ? list.find((t: any) => t?.slug === slug) : null;
      if (found?.label) label = String(found.label);
    } catch { /* fall back to the slug */ }
    return { title: label, posts: publicPosts(siteId, lang, ' AND p.type = ?', [slug]) };
  }

  const archive = path.match(/^\/archive\/(\d{4})\/(\d{1,2})$/);
  if (archive) {
    const ym = archive[1] + '-' + archive[2].padStart(2, '0');
    return { title: archive[1] + '-' + archive[2].padStart(2, '0'), posts: publicPosts(siteId, lang, " AND strftime('%Y-%m', p.publishedAt) = ?", [ym]) };
  }

  const author = path.match(/^\/author\/([^/]+)$/);
  if (author) {
    const username = decodeURIComponent(author[1]);
    const row = db.prepare('SELECT id, username FROM User WHERE username = ?').get(username) as any;
    if (!row) return null;
    return { title: row.username, posts: publicPosts(siteId, lang, ' AND p.authorId = ?', [row.id]) };
  }

  return null;
}

// Published posts, site-scoped, filtered to what a visitor can read, in one
// language, plus an optional extra condition. `p` is the Post alias the
// conditions expect.
function publicPosts(siteId: string | undefined, lang: string, extraClause: string, extraParams: any[], limit = 20): ListingPost[] {
  try {
    const scope = siteId ? ' AND (p.siteId IS NULL OR p.siteId = ?)' : '';
    const args: any[] = [lang, new Date().toISOString(), ...extraParams];
    if (siteId) args.push(siteId);
    return db.prepare(
      `SELECT p.slug, p.title, p.excerpt, p.lang FROM Post p
       WHERE p.type = 'post' AND p.lang = ? AND p.status = 'published' AND (p.publishedAt IS NULL OR p.publishedAt <= ?)${extraClause}${scope}${PUBLIC_POST_CONDITIONS}
       ORDER BY p.publishedAt DESC LIMIT ?`
    ).all(...args, limit) as any[];
  } catch {
    return [];
  }
}

function metaTag(attr: 'name' | 'property', key: string, content: string): string {
  return `<meta ${attr}="${key}" content="${esc(content)}" />`;
}

// robots.txt for one site: both the indexing switch and the Sitemap URL follow
// the per-site override, so a secondary domain is not told about the primary.
export function buildRobotsTxt(siteId: string | undefined): string {
  const allow = effectiveSetting(siteId, 'blog_public') !== '0';
  const siteUrl = (effectiveSetting(siteId, 'site_url') || 'http://localhost:3001').replace(/\/$/, '');
  if (!allow) return 'User-agent: *\nDisallow: /\n';
  return 'User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/\n\nSitemap: ' + siteUrl + '/api/sitemap.xml\n';
}

// Replace the shell's placeholder title/description and add the social tags.
// Every pattern is anchored on the template's own markup; if one stops matching
// (e.g. the template is redesigned) that single substitution is skipped rather
// than throwing, so the page still renders.
// `fallback` (see buildCrawlerFallback) goes inside #root, where React replaces
// it on the first render.
// The other languages of this content, as absolute URLs. Empty when the item has
// no translation group — in which case there is nothing to point at.
function alternatesFor(post: any, siteUrl: string): { lang: string; url: string }[] {
  if (!post?.translationGroup) return [];
  try {
    const prefix = getPermalinkPrefix();
    const def = defaultLang();
    const rows = db.prepare("SELECT slug, lang, type FROM Post WHERE translationGroup = ? AND status = 'published' ORDER BY lang").all(post.translationGroup) as any[];
    if (rows.length < 2) return [];
    return rows.map((r) => ({
      lang: r.lang || def,
      url: siteUrl + (r.type === 'page' ? pagePathForLang(r.slug, r.lang, def) : postPathForLang(r.slug, r.lang, prefix, def)),
    }));
  } catch { return []; }
}

export function injectSeoMeta(html: string, m: SeoMeta, fallback?: string | null): string {
  const tags: string[] = [
    metaTag('property', 'og:title', m.title),
    metaTag('property', 'og:description', m.description),
    metaTag('property', 'og:type', m.ogType),
    metaTag('property', 'og:site_name', m.siteName),
    metaTag('name', 'twitter:card', m.ogImage ? 'summary_large_image' : 'summary'),
    metaTag('name', 'twitter:title', m.title),
    metaTag('name', 'twitter:description', m.description),
  ];
  if (m.ogImage) {
    tags.push(metaTag('property', 'og:image', m.ogImage));
    // Scrapers pick the large card layout from the declared dimensions.
    if (m.imageMeta?.width) tags.push(metaTag('property', 'og:image:width', String(m.imageMeta.width)));
    if (m.imageMeta?.height) tags.push(metaTag('property', 'og:image:height', String(m.imageMeta.height)));
    if (m.imageMeta?.alt) tags.push(metaTag('property', 'og:image:alt', m.imageMeta.alt));
    tags.push(metaTag('name', 'twitter:image', m.ogImage));
  }
  if (m.article?.publishedTime) tags.push(metaTag('property', 'article:published_time', m.article.publishedTime));
  if (m.article?.modifiedTime) tags.push(metaTag('property', 'article:modified_time', m.article.modifiedTime));
  if (m.article?.authorName) tags.push(metaTag('property', 'article:author', m.article.authorName));
  if (m.article?.section) tags.push(metaTag('property', 'article:section', m.article.section));
  if (m.locale) tags.push(metaTag('property', 'og:locale', m.locale));
  if (m.twitterSite) tags.push(metaTag('name', 'twitter:site', m.twitterSite));
  // Not an SEO tag: the client's lib/permalink reads it synchronously (see the
  // field's comment). Kept out of the crawler fallback on purpose — the fallback
  // markup already links with the real prefix.
  if (m.permalinkStructure) tags.push(metaTag('name', 'mortar-permalink', m.permalinkStructure));
  // Same idea for the content languages: lib/contentLang reads it at module load,
  // so a direct visit to /en/post/<slug> resolves on the first render and the API
  // calls it fires already carry ?lang=en.
  if (m.contentLangs) tags.push(metaTag('name', 'mortar-langs', m.contentLangs));
  if (m.canonical) {
    tags.push(metaTag('property', 'og:url', m.canonical));
    tags.push(`<link rel="canonical" href="${esc(m.canonical)}" />`);
  }
  // hreflang: the same content in other languages, plus x-default pointing at the
  // default language's version. Without this a translated site competes with
  // itself in search results, and Google picks the wrong one.
  if (m.alternates && m.alternates.length > 0) {
    for (const alt of m.alternates) {
      tags.push(`<link rel="alternate" hreflang="${esc(alt.lang)}" href="${esc(alt.url)}" />`);
    }
    const fallback = m.alternates.find((a) => a.lang === defaultLang()) || m.alternates[0];
    tags.push(`<link rel="alternate" hreflang="x-default" href="${esc(fallback.url)}" />`);
  }

  let out = html;
  // Keep the id: the client updates this element after hydration.
  //
  // Function replacers, not replacement strings: a title containing "$&" (or
  // "$`" / "$'") is special in a replacement string — "$&" re-inserts the whole
  // matched tag and "$'" inserts everything after it. A post titled "$&" produced
  // a duplicated <title> tag plus the page's tail inlined into it.
  out = out.replace(/<title id="site-title">[\s\S]*?<\/title>/, () => `<title id="site-title">${esc(m.title)}</title>`);
  out = out.replace(/<meta name="description" content="[^"]*"\s*\/?>/, () => `<meta name="description" content="${esc(m.description)}" />`);
  // (the same "$" caveat applies to the fallback markup, so it goes through a
  // function replacer as well)
  if (fallback) out = injectRoot(out, fallback);
  // Function replacer: the tags carry user text (title/description), and a "$&"
  // in there would expand to the matched "</head>" — which is how a post titled
  // "$&" ended up inlining the rest of the document into its own meta tag.
  return out.replace('</head>', () => '    ' + tags.join('\n    ') + '\n  </head>');
}

// Function replacer, for the same "$" reason as above: the markup being inserted
// carries user content.
function injectRoot(html: string, inner: string): string {
  return html.replace(/(<div id="root">)\s*(<\/div>)/, (_m, open: string) => open + inner + '</div>');
}

/**
 * Put the server-rendered app into the shell, followed by the payload the client
 * needs to hydrate it.
 *
 * The payload is JSON inside a <script> tag, so `<` is escaped: a post containing
 * `</script>` would otherwise end the script element early and the rest of the
 * document would be parsed as markup — the classic JSON-in-HTML breakout.
 */
export function injectSsrRoot(html: string, appHtml: string, payload: unknown): string {
  const json = JSON.stringify(payload ?? null).replace(/</g, '\\u003c');
  return injectRoot(html, appHtml + '<script>window.__MORTAR_SSR__=' + json + '</script>');
}

/**
 * Put the theme's palette into the shell's <head>.
 *
 * It has to be the head, not the render payload inside #root: a <style> there
 * would be part of the markup React compares while hydrating, and the client
 * renders its own copy (App.tsx updates this same element by id).
 *
 * The CSS is generated from one hex colour by lib/themeColor.ts, so nothing
 * operator-supplied reaches it — but a `</style>` in the value would end the
 * element early, so it is refused rather than escaped.
 */
export function injectThemeCss(html: string, css: string | undefined): string {
  if (!css || /<\/style/i.test(css)) return html;
  return html.replace('</head>', () => '<style id="mortar-theme-vars">' + css + '</style>\n  </head>');
}

/**
 * Give every inline script in the document the response's CSP nonce.
 *
 * Both inline scripts a document can carry are written by us — the importmap in
 * the shell and the render payload — and without the nonce an enforcing policy
 * blocks them. A blocked importmap means no module resolution at all, so the app
 * never boots; a blocked payload means the prerendered markup is thrown away and
 * re-rendered on the client.
 *
 * External scripts are deliberately left alone: they are covered by `'self'`, and
 * stamping them would let a nonce leak past the host allowlist.
 */
export function stampInlineScripts(html: string, nonce: string): string {
  if (!nonce) return html;
  const attr = 'nonce="' + esc(nonce) + '"';
  return html.replace(/<script(?![^>]*\bsrc=)(?![^>]*\bnonce=)([^>]*)>/gi, (_m, attrs: string) => '<script ' + attr + attrs + '>');
}

// A document is built and cached with this placeholder where the nonce goes, and
// the real per-response nonce is substituted on the way out: a nonce has to be
// unique per response, so caching one and replaying it would defeat the point.
export const NONCE_PLACEHOLDER = '__MORTAR_CSP_NONCE__';

/** Substitute a response's nonce into a document built by stampInlineScripts. */
export function applyNonce(html: string, nonce: string): string {
  return nonce ? html.split('nonce="' + NONCE_PLACEHOLDER + '"').join('nonce="' + esc(nonce) + '"') : html;
}
