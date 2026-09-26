import { Router, Response } from 'express';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import db, { cuid, withTransaction } from '../utils/db';
import { authenticate, requireCap, resolveOptionalUser, userCan, AuthRequest } from '../middleware/auth';
import { verifyToken } from '../utils/jwt';
import { contentUnlockMatches, contentUnlockToken, verifyContentPassword, hashContentPassword } from '../utils/contentPassword';
import { SiteRequest } from '../middleware/site';
import { slugify, uniqueSlug, postUrl } from '../utils/slug';
import { likeContains } from '../utils/sqlLike';
import { recordMovedPath } from '../utils/redirects';
import { rateLimitStore } from '../utils/rateLimitStore';
import { PUBLIC_POST_CONDITIONS } from '../utils/publicPosts';
import { applyFilters, doAction } from '../utils/hooks';
import { applyShortcodes, renderCmsBlocks } from '../utils/shortcodes';
import { sanitizeCssText } from '../utils/sanitize';
import { normalizeSeoField } from '../utils/seoFields';
import { siteScopeForFilter, mayWriteSite, userMayAccessSite, assignedSites } from '../utils/userSites';
import { trackView } from '../utils/views';
import { loadCustomTypes } from './customPostTypes';

const router = Router();
// Protected-post password guessing is brute-forced per IP
const passwordLimiter = rateLimit({ windowMs: 60 * 1000, max: 20, standardHeaders: true, store: rateLimitStore(), message: { error: 'Too many attempts, slow down' } });

// Lightweight "is this visitor logged in?" check for public routes that don't
// mount the full authenticate middleware (members-only filtering). Delegates to
// resolveOptionalUser so a blacklisted, stale or 2FA-partial token cannot count
// as a session — a bare verifyToken here would let an incomplete 2FA login read
// members-only content.
function isLoggedIn(req: AuthRequest): boolean {
  return !!resolveOptionalUser(req);
}

// Members-only posts (PostMeta _members_only='1') are hidden from anonymous
// visitors — used by the post-expiry plugin and settable manually.
function isMembersOnly(postId: string): boolean {
  return !!db.prepare("SELECT 1 FROM PostMeta WHERE postId = ? AND key = '_members_only' AND value = '1'").get(postId);
}
const MEMBERS_ONLY_EXCLUDE = " AND NOT EXISTS (SELECT 1 FROM PostMeta pm WHERE pm.postId = p.id AND pm.key = '_members_only' AND pm.value = '1')";

// Public payload shape for the list endpoints.
//
// They returned the selected row verbatim, which shipped two things it should
// not: the content-protection hash (offline-crackable, and never needed by a
// client — the editor reads it from the admin endpoints) and the full body of a
// password-protected post. GET /slug/:slug refuses that body until the cookie
// unlocks it; the lists bypassed the gate by returning `p.*`. Admins/editors may
// read protected bodies (the single-post route lets them through), so they keep
// `content`; everyone else loses it until they unlock the post.
function publicShape(posts: any[], canBypass: boolean): any[] {
  return (posts || []).map((p: any) => {
    const { password, ...rest } = p;
    if (!canBypass && password) delete rest.content;
    // enrichPosts embeds the author row it fetched (id, username, email, avatar).
    // The email is not public data and was shipping to anonymous visitors.
    if (rest.author && typeof rest.author === 'object' && !canBypass) {
      const { email, ...author } = rest.author;
      rest.author = author;
    }
    return rest;
  });
}

// Who may read a protected body without unlocking it (mirrors /slug/:slug).
// These list routes are public, so they never run `authenticate` and `req.user`
// is empty — the caller has to be resolved the same way isLoggedIn does it, or
// every editor would be treated as anonymous.
function mayBypassProtection(req: AuthRequest): boolean {
  const user = req.user || resolveOptionalUser(req);
  return !!user && userCan(user, 'edit_others_posts');
}

// Which content type a post may be created as. Custom types come from the
// registry (routes/customPostTypes.ts); accepting any string here would create
// rows that no list, template or sitemap can ever show. Pages have their own
// route (parent/menu order/etc.), so they are not creatable through /posts.
function validPostType(raw: unknown): string | null {
  const t = String(raw ?? '').trim().toLowerCase();
  if (!t) return null;
  if (t === 'post') return 'post';
  if (t === 'page') return null;
  return loadCustomTypes().some(x => x.slug === t) ? t : null;
}

// Visual-editor CSS is rendered into a <style> tag on the public site, so
// dangerous primitives are stripped at write time (defense in depth with the
// frontend render guard). @import can pull external resources, expression() is
// an XSS vector in old engines, behavior: is an IE active-content vector.
// Delegates to the shared CSS guard so the server-side rules stay in sync
// with the render-time sanitizer (comments, quoted/whitespace schemes, svg).
function sanitizeVisualCss(css: string): string {
  return sanitizeCssText(css);
}
const postSchema = z.object({ title: z.string().min(1), slug: z.string().max(200).optional(), content: z.string().optional(), excerpt: z.string().optional(), status: z.enum(['draft', 'published', 'scheduled', 'private', 'trash']).optional(), featured: z.string().optional(), password: z.string().optional(), categoryIds: z.array(z.string()).optional(), tagIds: z.array(z.string()).optional(), tagNames: z.array(z.string()).optional(), parentId: z.string().nullable().optional(), menuOrder: z.number().int().optional(), siteId: z.string().nullable().optional(), authorId: z.string().optional(), publishedAt: z.string().optional(), meta: z.record(z.string(), z.string()).optional(), type: z.string().optional() });

// ---- Bulk operations: the same checks the single-row routes apply -------------
// The bulk endpoints act on ids the client chose, so every row has to pass the
// checks the single-row PUT/DELETE already make: the row's own site (an editor
// assigned to site A could otherwise rewrite site B by id) and, for the roles
// that only own their own posts, ownership. Ids the caller may not touch are
// skipped and reported rather than aborting the whole batch.
function loadBulkPosts(ids: unknown): any[] {
  if (!Array.isArray(ids)) return [];
  const uniq = [...new Set(ids.filter((i): i is string => typeof i === 'string' && i.length > 0))];
  if (uniq.length === 0) return [];
  const rows: any[] = [];
  // Stay under SQLite's bound-variable limit for large selections.
  for (let i = 0; i < uniq.length; i += 400) {
    const chunk = uniq.slice(i, i + 400);
    rows.push(...db.prepare('SELECT id, siteId, status, previousStatus, authorId, publishedAt, type FROM Post WHERE id IN (' + chunk.map(() => '?').join(',') + ')').all(...chunk) as any[]);
  }
  return rows;
}

function mayTouchPost(user: { userId: string; role: string }, row: any): boolean {
  if (!userMayAccessSite(user.userId, user.role, row.siteId || undefined)) return false;
  // A caller who cannot touch other people's posts is limited to their own.
  if (!userCan(user, 'edit_others_posts') && row.authorId !== user.userId) return false;
  return true;
}

// Trash keeps the status it had, so restore can put the post back online
// instead of silently downgrading it to a draft. Returns whether anything
// changed: trashing an already-trashed row must NOT overwrite the memory (it
// would come back as a draft) or fire the hook twice for one post.
function trashPost(row: any): boolean {
  if (row.status === 'trash') return false;
  const now = new Date().toISOString();
  db.prepare('UPDATE Post SET status = ?, previousStatus = ?, updatedAt = ? WHERE id = ?')
    .run('trash', row.status || null, now, row.id);
  doAction('delete_post', row.id);
  return true;
}

function restorePost(row: any): void {
  const now = new Date().toISOString();
  const back = row.previousStatus && row.previousStatus !== 'trash' ? row.previousStatus : 'draft';
  // A restored "published" post must not resurrect a future publish date.
  const publishedAt = back === 'published'
    ? (row.publishedAt && row.publishedAt <= now ? row.publishedAt : now)
    : null;
  db.prepare('UPDATE Post SET status = ?, previousStatus = NULL, publishedAt = COALESCE(?, publishedAt), updatedAt = ? WHERE id = ?')
    .run(back, publishedAt, now, row.id);
  doAction('post_restored', row.id, back);
}

// Batch enrichment: one query per relation for the whole list instead of one
// per post (a 10-post page used to run ~70 queries). Chunked so a huge
// user-supplied limit can never exceed SQLite's variable bound.
function enrichPost(p: any) { return enrichPosts(p ? [p] : [])[0]; }

function enrichPosts(posts: any[]): any[] {
  if (!posts || posts.length === 0) return posts || [];
  if (posts.length > 500) {
    const out: any[] = [];
    for (let i = 0; i < posts.length; i += 500) out.push(...enrichPosts(posts.slice(i, i + 500)));
    return out;
  }
  const ids = posts.map((p: any) => p.id);
  const qmarks = ids.map(() => '?').join(',');

  // Authors (one query for all posts)
  const authors = new Map<string, any>();
  const authorIds = [...new Set(posts.map((p: any) => p.authorId).filter(Boolean))] as string[];
  if (authorIds.length) {
    (db.prepare('SELECT id, username, email, avatar FROM User WHERE id IN (' + authorIds.map(() => '?').join(',') + ')').all(...authorIds) as any[])
      .forEach((u: any) => authors.set(u.id, u));
  }

  // Categories / tags per post
  const cats = new Map<string, any[]>();
  const tags = new Map<string, any[]>();
  (db.prepare('SELECT pc.postId, c.id as categoryId, c.name, c.slug FROM PostCategory pc JOIN Category c ON c.id = pc.categoryId WHERE pc.postId IN (' + qmarks + ')').all(...ids) as any[])
    .forEach((r: any) => { if (!cats.has(r.postId)) cats.set(r.postId, []); cats.get(r.postId)!.push({ categoryId: r.categoryId, name: r.name, slug: r.slug }); });
  (db.prepare('SELECT pt.postId, t.id as tagId, t.name, t.slug FROM PostTag pt JOIN Tag t ON t.id = pt.tagId WHERE pt.postId IN (' + qmarks + ')').all(...ids) as any[])
    .forEach((r: any) => { if (!tags.has(r.postId)) tags.set(r.postId, []); tags.get(r.postId)!.push({ tagId: r.tagId, name: r.name, slug: r.slug }); });

  // Comment + revision counts
  const comments = new Map<string, number>();
  const revisions = new Map<string, number>();
  // Public comment count: approved only (same口径 as the page view count)
  (db.prepare("SELECT postId, COUNT(*) as cnt FROM Comment WHERE postId IN (" + qmarks + ") AND status = 'approved' GROUP BY postId").all(...ids) as any[])
    .forEach((r: any) => comments.set(r.postId, r.cnt));
  (db.prepare('SELECT postId, COUNT(*) as cnt FROM Revision WHERE postId IN (' + qmarks + ') GROUP BY postId').all(...ids) as any[])
    .forEach((r: any) => revisions.set(r.postId, r.cnt));

  // Meta fields
  const meta = new Map<string, Record<string, string>>();
  (db.prepare('SELECT postId, key, value FROM PostMeta WHERE postId IN (' + qmarks + ')').all(...ids) as any[])
    .forEach((r: any) => { if (!meta.has(r.postId)) meta.set(r.postId, {}); meta.get(r.postId)![r.key] = r.value; });

  // Featured image srcset (only for /uploads/ featured images)
  const featuredUrls = [...new Set(posts.map((p: any) => p.featured).filter((f: any) => f && f.startsWith('/uploads/')))] as string[];
  const srcsets = new Map<string, string>();
  if (featuredUrls.length) {
    (db.prepare('SELECT url, srcset FROM Media WHERE url IN (' + featuredUrls.map(() => '?').join(',') + ')').all(...featuredUrls) as any[])
      .forEach((m: any) => srcsets.set(m.url, m.srcset));
  }

  for (const p of posts) {
    p.author = authors.get(p.authorId);
    p.categories = cats.get(p.id) || [];
    p.tags = tags.get(p.id) || [];
    p.commentCount = comments.get(p.id) || 0;
    p.revisionCount = revisions.get(p.id) || 0;
    p.meta = meta.get(p.id) || {};
    const ss = p.featured ? srcsets.get(p.featured) : undefined;
    if (ss) { try { p.srcset = JSON.parse(ss); } catch {} }
  }
  return posts;
}

router.get('/', (req: AuthRequest & SiteRequest, res: Response) => {
  try {
    // Clamp pagination: negative/zero limits would return the whole table
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));
    // Escape LIKE wildcards so user input ("100%", "a_b") matches literally
    const search = (req.query.search as string) || '';
    const category = req.query.category as string;
    const tag = req.query.tag as string;
    const type = (req.query.type as string) || 'post';
    let sql = 'SELECT DISTINCT p.* FROM Post p';
    const params: any[] = [];
    if (category) { sql += ' JOIN PostCategory pc ON pc.postId = p.id JOIN Category c ON c.id = pc.categoryId'; }
    if (tag) { sql += ' JOIN PostTag pt ON pt.postId = p.id JOIN Tag t ON t.id = pt.tagId'; }
    const now = new Date().toISOString();
    sql += ' WHERE p.type = ? AND p.status = ? AND (p.publishedAt IS NULL OR p.publishedAt <= ?)';
    params.push(type, 'published', now);
    if (req.siteId) { sql += ' AND (p.siteId IS NULL OR p.siteId = ?)'; params.push(req.siteId); }
    if (!isLoggedIn(req)) sql += MEMBERS_ONLY_EXCLUDE;
    if (search) {
      const sp = likeContains(search);
      sql += " AND (p.title LIKE ? ESCAPE '\\' OR p.content LIKE ? ESCAPE '\\' OR p.excerpt LIKE ? ESCAPE '\\')";
      params.push(sp, sp, sp);
    }
    if (category) { sql += ' AND c.slug = ?'; params.push(category); }
    if (tag) { sql += ' AND t.slug = ?'; params.push(tag); }
    // Relevance: title matches rank above body matches
    if (search) {
      const sp = likeContains(search);
      sql += " ORDER BY p.sticky DESC, CASE WHEN p.title LIKE ? ESCAPE '\\' THEN 0 ELSE 1 END, p.publishedAt DESC LIMIT ? OFFSET ?";
      params.push(sp, limit, (page - 1) * limit);
    } else {
      sql += ' ORDER BY p.sticky DESC, p.publishedAt DESC LIMIT ? OFFSET ?';
      params.push(limit, (page - 1) * limit);
    }
    const postsData = db.prepare(sql).all(...params) as any[];
    const countSql = 'SELECT COUNT(DISTINCT p.id) as cnt FROM Post p' + (category ? ' JOIN PostCategory pc ON pc.postId = p.id JOIN Category c ON c.id = pc.categoryId' : '') + (tag ? ' JOIN PostTag pt ON pt.postId = p.id JOIN Tag t ON t.id = pt.tagId' : '') + ' WHERE p.type = ? AND p.status = ? AND (p.publishedAt IS NULL OR p.publishedAt <= ?)' + (req.siteId ? ' AND (p.siteId IS NULL OR p.siteId = ?)' : '') + (!isLoggedIn(req) ? MEMBERS_ONLY_EXCLUDE : '') + (search ? " AND (p.title LIKE ? ESCAPE '\\' OR p.content LIKE ? ESCAPE '\\' OR p.excerpt LIKE ? ESCAPE '\\')" : '') + (category ? ' AND c.slug = ?' : '') + (tag ? ' AND t.slug = ?' : '');
    const countParams: any[] = [type, 'published', now];
    if (req.siteId) countParams.push(req.siteId);
    if (search) { const sp = likeContains(search); countParams.push(sp, sp, sp); }
    if (category) countParams.push(category);
    if (tag) countParams.push(tag);
    const total = (db.prepare(countSql).get(...countParams) as any)?.cnt || 0;
    const posts = enrichPosts(postsData);
    posts.forEach((p: any) => { p.content = renderCmsBlocks(applyShortcodes(applyFilters('post_content', p.content || '', p), p), { siteId: req.siteId }); });
    res.json({ posts: publicShape(posts, mayBypassProtection(req)), total, page, totalPages: Math.ceil(total / limit) });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Search suggestions for the search widget autocomplete (lightweight, no content)
// Search logging: anonymous visitors' search terms feed the admin hot-search
// report. No visitor identity is stored, only the query text.
router.post('/search-log', (req: AuthRequest & SiteRequest, res: Response) => {
  try {
    const q = String(req.body?.q || '').trim().slice(0, 100);
    // Recorded with the site the search ran on: the hot-search report is scoped.
    if (q) db.prepare('INSERT INTO SearchLog (id, query, createdAt, siteId) VALUES (?, ?, ?, ?)').run(cuid(), q.toLowerCase(), new Date().toISOString(), req.siteId || null);
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: hot search terms (top 20 over the last 30 days)
router.get('/search-stats', authenticate, requireCap('manage_options'), (req: AuthRequest, res: Response) => {
  try {
    const since = new Date(Date.now() - 30 * 86_400_000).toISOString();
    // Site-scoped: the log records the site a search ran on (migration 13).
    const assigned = assignedSites(req.user!.userId, req.user!.role);
    const siteClause = assigned ? ' AND (siteId IS NULL OR siteId IN (' + assigned.map(() => '?').join(',') + '))' : '';
    const siteArgs = assigned || [];
    const rows = db.prepare('SELECT query, COUNT(*) as cnt FROM SearchLog WHERE createdAt >= ?' + siteClause + ' GROUP BY query ORDER BY cnt DESC LIMIT 20').all(since, ...siteArgs) as any[];
    const total = (db.prepare('SELECT COUNT(*) as c FROM SearchLog WHERE createdAt >= ?' + siteClause).get(since, ...siteArgs) as any).c || 0;
    res.json({ terms: rows, total });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.get('/suggest', (req: AuthRequest & SiteRequest, res: Response) => {
  try {
    const q = String(req.query.q || '').trim().slice(0, 60);
    if (!q) { res.json({ suggestions: [] }); return; }
    const like = likeContains(q);
    const now = new Date().toISOString();
    // Same visibility as the public list: never suggest scheduled posts, and no
    // titles of gated/unlisted ones (this dropdown is a plain public list too).
    // PUBLIC_POST_CONDITIONS expects the Post table aliased as `p`.
    // Site-scoped like the public lists it mirrors: the dropdown must not offer a
    // title that belongs to another site.
    const siteClause = req.siteId ? ' AND (p.siteId IS NULL OR p.siteId = ?)' : '';
    const args: any[] = [now, like, like];
    if (req.siteId) args.push(req.siteId);
    args.push(like);
    const rows = db.prepare("SELECT p.id, p.title, p.slug, p.type, p.publishedAt FROM Post p WHERE p.type IN ('post','page') AND p.status = 'published' AND (p.publishedAt IS NULL OR p.publishedAt <= ?) AND (p.title LIKE ? ESCAPE '\\' OR p.slug LIKE ? ESCAPE '\\')" + siteClause + (isLoggedIn(req) ? '' : PUBLIC_POST_CONDITIONS) + " ORDER BY CASE WHEN p.title LIKE ? ESCAPE '\\' THEN 0 ELSE 1 END, p.publishedAt DESC LIMIT 6").all(...args) as any[];
    res.json({ suggestions: rows.map((p: any) => ({ id: p.id, title: p.title, slug: p.slug, type: p.type, date: p.publishedAt })) });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.get('/slug/:slug', (req: AuthRequest & SiteRequest, res: Response) => {
  try {
    const post = (req.siteId
      // Any public content type resolves here; pages have their own route.
      ? db.prepare("SELECT * FROM Post WHERE slug = ? AND type <> 'page' AND (siteId IS NULL OR siteId = ?)").get(req.params.slug, req.siteId)
      : db.prepare("SELECT * FROM Post WHERE slug = ? AND type <> 'page'").get(req.params.slug)) as any;
    if (!post) { res.status(404).json({ error: 'Post not found' }); return; }
    // Scheduled posts (published but publishedAt in the future) are invisible
    // to anonymous visitors, matching the public lists; logged-in users may
    // still reach them for preview.
    if (post.status === 'published' && post.publishedAt && post.publishedAt > new Date().toISOString() && !req.user) {
      res.status(404).json({ error: 'Post not found' }); return;
    }
    // WordPress-style password protection: cookie (hashed) unlocks the post.
    // Callers who may edit other people's posts bypass.
    if (post.password && (!req.user || !userCan(req.user, 'edit_others_posts'))) {
      const raw = String(req.headers.cookie || '');
      const m = raw.match(new RegExp('mortar_post_pass_' + post.id + '=([^;]+)'));
      const cookieVal = m ? decodeURIComponent(m[1]) : null;
      if (!contentUnlockMatches(cookieVal, post.id, post.password)) {
        const safe = { id: post.id, title: post.title, slug: post.slug, status: post.status, protected: true };
        res.json(safe);
        return;
      }
    }
    if (post.status !== 'published') {
      // Non-published posts (draft/private/trash) are only visible to callers
      // who can edit other people's posts, or to the author themselves — never
      // to other logged-in users or anonymous visitors.
      const canView = req.user && (userCan(req.user, 'edit_others_posts') || (req.user.userId && req.user.userId === post.authorId));
      if (!canView) { res.status(404).json({ error: 'Post not found' }); return; }
    }
    // Members-only posts: anonymous visitors get a 403 so the frontend can
    // show a "log in to view" screen (title/slug only, no content leak)
    if (post.status === 'published' && isMembersOnly(post.id) && !isLoggedIn(req)) {
      res.status(403).json({ private: true, membersOnly: true, title: post.title, slug: post.slug });
      return;
    }
    // batched in memory, flushed periodically; the visitor key keeps one reader
    // (or one crawler) from inflating the count by reloading
    trackView(post.id, (req.ip || '') + '|' + String(req.headers['user-agent'] || '').slice(0, 80));
    const enriched = enrichPost(post);
    // Never expose the protection password to the public API
    enriched.hasPassword = !!post.password;
    delete enriched.password;
    enriched.content = renderCmsBlocks(applyShortcodes(applyFilters('post_content', enriched.content || '', enriched), enriched), { siteId: req.siteId });
    res.json(enriched);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Verify a password for a protected post; on success set an httpOnly cookie
// (WordPress-style wp-postpass behaviour, matching the page flow).
router.post('/slug/:slug/password', passwordLimiter, async (req: AuthRequest, res: Response) => {
  try {
    const post = db.prepare("SELECT id, password FROM Post WHERE slug = ? AND type <> 'page'").get(req.params.slug) as any;
    if (!post || !post.password) { res.status(404).json({ error: 'Post not found' }); return; }
    const submitted = String((req.body || {}).password || '');
    const check = await verifyContentPassword(submitted, post.password);
    if (!check.ok) { res.status(401).json({ error: 'wrong_password' }); return; }
    // Legacy plaintext: replace it with a hash now that we know the plaintext.
    if (check.upgraded) db.prepare('UPDATE Post SET password = ? WHERE id = ?').run(check.upgraded, post.id);
    const hash = contentUnlockToken(post.id, check.upgraded || post.password);
    res.cookie('mortar_post_pass_' + post.id, hash, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'lax',
      path: '/',
      // Only sent over HTTPS in production (deployments are expected to use TLS)
      secure: process.env.NODE_ENV === 'production',
    });
    res.json({ ok: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});


// Public: popular posts by views. `category` scopes the ranking to one
// category, which is what a theme's per-category "hot" rail needs — ranking the
// ten newest posts of the category instead would not be a popularity ranking at
// all.
router.get('/popular', (req: AuthRequest & SiteRequest, res: Response) => {
  try {
    // Clamped: an unbounded limit lets an anonymous caller ask for the whole table.
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 5));
    const category = String(req.query.category || '').trim();
    const now = new Date().toISOString();
    let sql = 'SELECT DISTINCT p.* FROM Post p';
    const params: any[] = ['post', 'published', now];
    if (category) { sql += ' JOIN PostCategory pc ON pc.postId = p.id JOIN Category c ON c.id = pc.categoryId'; }
    sql += ' WHERE p.type = ? AND p.status = ? AND (p.publishedAt IS NULL OR p.publishedAt <= ?)';
    if (category) { sql += ' AND c.slug = ?'; params.push(category); }
    if (req.siteId) { sql += ' AND (p.siteId IS NULL OR p.siteId = ?)'; params.push(req.siteId); }
    // Same visibility rule as the public list: an anonymous visitor must not be
    // shown gated or unlisted posts here either (the route only stripped their
    // bodies, so their titles and excerpts were still advertised).
    if (!isLoggedIn(req)) sql += PUBLIC_POST_CONDITIONS;
    sql += ' ORDER BY p.views DESC, p.publishedAt DESC LIMIT ?';
    params.push(limit);
    const posts = db.prepare(sql).all(...params) as any[];
    res.json(publicShape(enrichPosts(posts), mayBypassProtection(req)));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Public: posts by author

// Public: yearly archive. `?month=` narrows it, which is how the archive page
// offers "2026" and then the months inside it without a second endpoint.
router.get('/archive/:year', (req: AuthRequest & SiteRequest, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));
    const y = String(req.params.year);
    if (!/^\d{4}$/.test(y)) { res.status(400).json({ error: 'Invalid year' }); return; }
    const now = new Date().toISOString();
    // strftime with a single-quoted format (see the note in the month route).
    let where = "p.type = ? AND p.status = ? AND strftime('%Y', p.publishedAt) = ? AND (p.publishedAt IS NULL OR p.publishedAt <= ?)";
    const scopeArgs: any[] = [];
    if (req.siteId) { where += ' AND (p.siteId IS NULL OR p.siteId = ?)'; scopeArgs.push(req.siteId); }
    const posts = db.prepare('SELECT DISTINCT p.* FROM Post p WHERE ' + where + ' ORDER BY p.sticky DESC, p.publishedAt DESC LIMIT ? OFFSET ?').all('post', 'published', y, now, ...scopeArgs, limit, (page - 1) * limit) as any[];
    const total = (db.prepare('SELECT COUNT(DISTINCT p.id) as cnt FROM Post p WHERE ' + where).get('post', 'published', y, now, ...scopeArgs) as any)?.cnt || 0;
    // Month breakdown so the page can offer the months that actually have posts
    const months = req.siteId
      ? db.prepare("SELECT strftime('%m', publishedAt) as month, COUNT(*) as count FROM Post WHERE type = 'post' AND status = 'published' AND strftime('%Y', publishedAt) = ? AND (publishedAt IS NULL OR publishedAt <= ?) AND (siteId IS NULL OR siteId = ?) GROUP BY month ORDER BY month").all(y, now, req.siteId)
      : db.prepare("SELECT strftime('%m', publishedAt) as month, COUNT(*) as count FROM Post WHERE type = 'post' AND status = 'published' AND strftime('%Y', publishedAt) = ? AND (publishedAt IS NULL OR publishedAt <= ?) GROUP BY month ORDER BY month").all(y, now);
    res.json({ posts: publicShape(enrichPosts(posts), mayBypassProtection(req)), total, page, totalPages: Math.ceil(total / limit), archive: { year: y, month: null }, months });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Public: monthly archive
router.get('/archive/:year/:month', (req: AuthRequest & SiteRequest, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));
    const y = req.params.year;
    const m = req.params.month.padStart(2, '0');
    const now = new Date().toISOString();
    // Single quotes: this build reports DQS=0, so a double-quoted "%Y-%m" is
    // parsed as an identifier and the whole (public) archive month route 500s
    // with "no such column". It was the only double-quoted literal in the repo.
    let where = "p.type = ? AND p.status = ? AND strftime('%Y-%m', p.publishedAt) = ? AND (p.publishedAt IS NULL OR p.publishedAt <= ?)";
    const ym = y + '-' + m;
    // Site-scoped: a monthly archive on one site must not list another site's posts.
    const scopeArgs: any[] = [];
    if (req.siteId) { where += ' AND (p.siteId IS NULL OR p.siteId = ?)'; scopeArgs.push(req.siteId); }
    const posts = db.prepare('SELECT DISTINCT p.* FROM Post p WHERE ' + where + ' ORDER BY p.sticky DESC, p.publishedAt DESC LIMIT ? OFFSET ?').all('post', 'published', ym, now, ...scopeArgs, limit, (page - 1) * limit) as any[];
    const total = (db.prepare('SELECT COUNT(DISTINCT p.id) as cnt FROM Post p WHERE ' + where).get('post', 'published', ym, now, ...scopeArgs) as any)?.cnt || 0;
    res.json({ posts: publicShape(enrichPosts(posts), mayBypassProtection(req)), total, page, totalPages: Math.ceil(total / limit), archive: { year: y, month: m } });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Public: archive months list
router.get('/archives', (req: AuthRequest & SiteRequest, res: Response) => {
  try {
    const args: any[] = [new Date().toISOString()];
    let sql = "SELECT strftime('%Y-%m', publishedAt) as month, COUNT(*) as count FROM Post WHERE type = 'post' AND status = 'published' AND publishedAt IS NOT NULL AND publishedAt <= ?";
    if (req.siteId) { sql += ' AND (siteId IS NULL OR siteId = ?)'; args.push(req.siteId); }
    const months = db.prepare(sql + ' GROUP BY month ORDER BY month DESC LIMIT 24').all(...args) as any[];
    res.json(months);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.get('/author/:username', (req: AuthRequest & SiteRequest, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));
    const author = db.prepare('SELECT id FROM User WHERE username = ?').get(req.params.username) as any;
    if (!author) { res.status(404).json({ error: 'Author not found' }); return; }
    let where = 'p.type = ? AND p.status = ? AND p.authorId = ? AND (p.publishedAt IS NULL OR p.publishedAt <= ?)';
    const scopeArgs: any[] = [];
    if (req.siteId) { where += ' AND (p.siteId IS NULL OR p.siteId = ?)'; scopeArgs.push(req.siteId); }
    const posts = db.prepare('SELECT DISTINCT p.* FROM Post p WHERE ' + where + ' ORDER BY p.sticky DESC, p.publishedAt DESC LIMIT ? OFFSET ?').all('post', 'published', author.id, new Date().toISOString(), ...scopeArgs, limit, (page - 1) * limit) as any[];
    const total = (db.prepare('SELECT COUNT(DISTINCT p.id) as cnt FROM Post p WHERE ' + where).get('post', 'published', author.id, new Date().toISOString(), ...scopeArgs) as any)?.cnt || 0;
    const profile = db.prepare('SELECT username, bio, avatar FROM User WHERE id = ?').get(author.id) as any;
    res.json({
      posts: publicShape(enrichPosts(posts), mayBypassProtection(req)), total, page, totalPages: Math.ceil(total / limit),
      author: { username: profile?.username || req.params.username, bio: profile?.bio || '', avatar: profile?.avatar || '' },
    });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.get('/admin', authenticate, requireCap('edit_posts'), (req: AuthRequest, res: Response) => {
  try {
    // Clamp like the public list: an unclamped ?limit= let a caller ask for the
    // whole table in one response.
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const status = req.query.status as string;
    const search = (req.query.search as string) || '';
    // Sort columns are whitelisted (never concatenate raw query input into SQL)
    const sortCols: Record<string, string> = { title: 'title', createdAt: 'createdAt', views: 'views', status: 'status' };
    const sortCol = sortCols[(req.query.sortBy as string) || 'createdAt'] || 'createdAt';
    const sortDir = req.query.sortDir === 'asc' ? 'ASC' : 'DESC';
    // Content type filter: the posts list shows one type at a time (a custom
    // type's entries live there too). Unregistered names fall back to 'post'.
    const listType = req.query.type === undefined ? 'post' : (validPostType(req.query.type) || 'post');
    let sql = 'SELECT * FROM Post WHERE type = ?';
    const params: any[] = [listType];
    // Callers who cannot edit other people's posts only see their own.
    if (!userCan(req.user!, 'edit_others_posts')) { sql += ' AND authorId = ?'; params.push(req.user!.userId); }
    if (status) { sql += ' AND status = ?'; params.push(status); }
    // Fuzzy search across the fields an editor recognises an article by.
    // Escaped like the public list: an unescaped "100%" here matched every post,
    // and "%%%" degenerated into a full table scan.
    const searchLike = search ? likeContains(search) : '';
    const searchClause = search ? " AND (title LIKE ? ESCAPE '\\' OR excerpt LIKE ? ESCAPE '\\' OR content LIKE ? ESCAPE '\\')" : '';
    if (search) { sql += searchClause; params.push(searchLike, searchLike, searchLike); }
    // Optional admin site filter (all / global / a specific site)
    // Site filter validated against the caller's assignments: an editor assigned
    // to one site cannot widen the list to another by naming it here.
    const sf = siteScopeForFilter(req.user!.userId, req.user!.role, req.query.siteId);
    if (sf.denied) { res.status(403).json({ error: '无权访问该站点' }); return; }
    sql += sf.clause; params.push(...sf.params);
    sql += ' ORDER BY sticky DESC, ' + sortCol + ' ' + sortDir + ' LIMIT ? OFFSET ?';
    params.push(limit, (page - 1) * limit);
    const postsData = db.prepare(sql).all(...params) as any[];
    const cntSql = 'SELECT COUNT(*) as cnt FROM Post WHERE type = ?' + (!userCan(req.user!, 'edit_others_posts') ? ' AND authorId = ?' : '') + (status ? ' AND status = ?' : '') + searchClause + sf.clause;
    // Must match the list query above, including the content-type filter.
    const cntParams: any[] = [listType];
    if (!userCan(req.user!, 'edit_others_posts')) cntParams.push(req.user!.userId);
    if (status) cntParams.push(status);
    if (search) cntParams.push(searchLike, searchLike, searchLike);
    cntParams.push(...sf.params);
    const total = (db.prepare(cntSql).get(...cntParams) as any)?.cnt || 0;
    res.json({ posts: enrichPosts(postsData), total, page, totalPages: Math.ceil(total / limit) });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.post('/', authenticate, requireCap('edit_posts'), async (req: AuthRequest, res: Response) => {
  try {
    const data = postSchema.parse(req.body);
    // A caller who cannot publish may only submit drafts (an editor publishes
    // later), like WP contributors.
    const status = !userCan(req.user!, 'publish_posts') ? 'draft' : (data.status || 'draft');
    // Post.slug is UNIQUE across every type, so uniqueness has to be checked globally —
    // a custom-type entry titled like an existing post would otherwise collide.
    const allSlugs = (db.prepare('SELECT slug FROM Post').all() as any[]).map((s: any) => s.slug);
    // An explicit slug is honoured (the editor lets an author set one — it used to
    // send it and have it silently dropped, because the schema did not list it).
    const slug = data.slug ? uniqueSlug(data.slug, allSlugs) : uniqueSlug(data.title, allSlugs);
    const id = cuid();
    const now = new Date().toISOString();
    // Callers who may edit other people's posts can assign an author; everyone
    // else writes as themselves. A supplied publish date drives scheduled
    // publishing; otherwise publish now.
    const authorId = data.authorId && userCan(req.user!, 'edit_others_posts') ? data.authorId : req.user!.userId;
    // Same rule as authorId: only admin/editor may target another site. An author
    // assigning their own post to a different site would inject content into
    // that site's frontend.
    // Role gate (admin/editor) as before, plus the assignment check.
    if (data.siteId !== undefined && !mayWriteSite(req.user!.userId, req.user!.role, data.siteId)) {
      res.status(403).json({ error: '无权在该站点创建内容' }); return;
    }
    const siteId = data.siteId && userCan(req.user!, 'edit_others_posts') ? data.siteId : null;
    const publishedAt = data.publishedAt || (status === 'published' ? now : null);
    // A custom type must be registered; pages keep their own route. Validated
    // before the transaction so a refusal never half-writes.
    const postType = data.type !== undefined ? validPostType(data.type) : 'post';
    if (postType === null) { res.status(400).json({ error: '未知的内容类型: ' + data.type }); return; }
    // Store a hash, never the plaintext (see utils/contentPassword).
    const password = data.password ? await hashContentPassword(data.password) : '';
    // The post row and its category/tag/meta rows must land together — a
    // half-written post would show up with missing relations.
    withTransaction(() => {
      db.prepare('INSERT INTO Post (id, title, slug, content, excerpt, status, featured, password, authorId, parentId, menuOrder, publishedAt, siteId, type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(id, data.title, slug, data.content || '', data.excerpt || '', status, data.featured || null, password, authorId, data.parentId || null, data.menuOrder || 0, publishedAt, siteId, postType);
      if (data.categoryIds) for (const cid of data.categoryIds) db.prepare('INSERT OR IGNORE INTO PostCategory (postId, categoryId) VALUES (?, ?)').run(id, cid);
      if (data.tagIds) for (const tid of data.tagIds) db.prepare('INSERT OR IGNORE INTO PostTag (postId, tagId) VALUES (?, ?)').run(id, tid);
      if (data.tagNames) for (const name of data.tagNames) {
        const tagSlug = slugify(name);
        let tag: any = db.prepare('SELECT id FROM Tag WHERE slug = ?').get(tagSlug);
        if (!tag) { const tid = cuid(); db.prepare('INSERT INTO Tag (id, name, slug) VALUES (?, ?, ?)').run(tid, name, tagSlug); tag = { id: tid }; }
        db.prepare('INSERT OR IGNORE INTO PostTag (postId, tagId) VALUES (?, ?)').run(id, tag.id);
      }
      if (data.meta) {
        for (const [key, value] of Object.entries(data.meta)) {
          db.prepare('INSERT INTO PostMeta (id, postId, key, value) VALUES (?, ?, ?, ?)').run(cuid(), id, key, key === '_visual_css' ? sanitizeVisualCss(value) : normalizeSeoField(key, value));
        }
      }
    });
    const post = db.prepare('SELECT * FROM Post WHERE id = ?').get(id) as any;
    doAction('post_created', id, status);
    if (status === 'published') doAction('post_published', id);
    res.status(201).json(enrichPost(post));
  } catch (err: any) { if (err instanceof z.ZodError) { res.status(400).json({ error: err.errors }); return; } res.status(500).json({ error: err.message }); }
});

router.put('/:id', authenticate, requireCap('edit_posts'), async (req: AuthRequest, res: Response) => {
  try {
    const existing = db.prepare('SELECT * FROM Post WHERE id = ?').get(req.params.id) as any;
    if (!existing) { res.status(404).json({ error: 'Post not found' }); return; }
    // The row itself must be in this user's sites: validating only the *new*
    // siteId let an editor assigned to site A rewrite a site B post.
    if (!userMayAccessSite(req.user!.userId, req.user!.role, existing.siteId || undefined)) { res.status(403).json({ error: '无权操作该站点的内容' }); return; }
    if (!userCan(req.user!, 'edit_others_posts') && existing.authorId !== req.user!.userId) { res.status(403).json({ error: 'Cannot edit another user\'s post' }); return; }
    const data = postSchema.partial().parse(req.body);
    // A caller who cannot publish may never publish (or unpublish) their drafts
    if (!userCan(req.user!, 'publish_posts') && data.status !== undefined && data.status !== 'draft') { res.status(403).json({ error: 'Contributors can only keep posts as drafts' }); return; }
    const sets: string[] = []; const vals: any[] = [];
    if (data.title !== undefined) { sets.push('title = ?'); vals.push(data.title); }
    // Slug edits are honoured, and a published post keeps its old URL working:
    // changing the slug used to be impossible through the API (the editor sent it
    // and Zod dropped it), and once it is possible, silently breaking every
    // existing link — including search-engine results — would be the obvious way
    // to lose traffic.
    if (data.slug !== undefined && String(data.slug).trim()) {
      const others = (db.prepare('SELECT slug FROM Post WHERE id <> ?').all(req.params.id) as any[]).map((s: any) => s.slug);
      const nextSlug = uniqueSlug(String(data.slug), others);
      if (nextSlug !== existing.slug) {
        sets.push('slug = ?'); vals.push(nextSlug);
        // Only a plain post: a custom type's public URL has its own shape, and a
        // redirect written from the post prefix would point nowhere.
        if (existing.type === 'post' && (existing.status === 'published' || existing.status === 'private')) {
          recordMovedPath(postUrl(existing.slug), postUrl(nextSlug), existing.siteId || null);
        }
      }
    }
    if (data.content !== undefined) { sets.push('content = ?'); vals.push(data.content); }
    if (data.excerpt !== undefined) { sets.push('excerpt = ?'); vals.push(data.excerpt); }
    if (data.status !== undefined) {
      sets.push('status = ?'); vals.push(data.status);
      if (data.status === 'published') {
        // Publishing must not keep a FUTURE publishedAt: the post would be
        // status=published yet invisible to the public lists (publishedAt<=now)
        // while still reachable by slug — inconsistent visibility.
        const future = existing.publishedAt && existing.publishedAt > new Date().toISOString();
        if (!existing.publishedAt || future) { sets.push('publishedAt = ?'); vals.push(new Date().toISOString()); }
      }
    }
    if (data.featured !== undefined) { sets.push('featured = ?'); vals.push(data.featured); }
    if (data.menuOrder !== undefined) { sets.push('menuOrder = ?'); vals.push(data.menuOrder); }
    // The admin editor round-trips the stored value on every save, so an
    // unchanged value must be left alone — re-hashing it would hash the hash and
    // silently break the password. Only a genuinely new value is (re)hashed;
    // sending '' clears the protection.
    if (data.password !== undefined && data.password !== existing.password) {
      sets.push('password = ?');
      vals.push(data.password ? await hashContentPassword(data.password) : '');
    }
    // Only callers who may edit other people's posts may move a post between
    // sites (mirrors the authorId rule).
    if (data.siteId !== undefined && userCan(req.user!, 'edit_others_posts')) {
      if (!mayWriteSite(req.user!.userId, req.user!.role, data.siteId)) { res.status(403).json({ error: '无权移到该站点' }); return; }
      sets.push('siteId = ?'); vals.push(data.siteId || null);
    }
    if (data.authorId !== undefined && userCan(req.user!, 'edit_others_posts')) { sets.push('authorId = ?'); vals.push(data.authorId); }
    if (data.publishedAt !== undefined) { sets.push('publishedAt = ?'); vals.push(data.publishedAt); }
    // Relation rewrites (delete-then-insert), the pre-save revision and the
    // Post row itself are one unit: a failure mid-way must not leave a post
    // without categories/tags/meta or strand a revision.
    withTransaction(() => {
      if (data.categoryIds) { db.prepare('DELETE FROM PostCategory WHERE postId = ?').run(req.params.id); for (const cid of data.categoryIds) db.prepare('INSERT OR IGNORE INTO PostCategory (postId, categoryId) VALUES (?, ?)').run(req.params.id, cid); }
      if (data.tagIds) { db.prepare('DELETE FROM PostTag WHERE postId = ?').run(req.params.id); for (const tid of data.tagIds) db.prepare('INSERT OR IGNORE INTO PostTag (postId, tagId) VALUES (?, ?)').run(req.params.id, tid); }
      if (data.meta) {
        db.prepare('DELETE FROM PostMeta WHERE postId = ?').run(req.params.id);
        for (const [key, value] of Object.entries(data.meta)) {
          db.prepare('INSERT INTO PostMeta (id, postId, key, value) VALUES (?, ?, ?, ?)').run(cuid(), req.params.id, key, key === '_visual_css' ? sanitizeVisualCss(value) : normalizeSeoField(key, value));
        }
      }
      if (sets.length > 0) {
        const changed = (data.title !== undefined && data.title !== existing.title) || (data.content !== undefined && (data.content || '') !== (existing.content || '')) || (data.excerpt !== undefined && data.excerpt !== (existing.excerpt || ''));
        if (changed) {
          // Keep a revision of the state before this save
          db.prepare('INSERT INTO Revision (id, postId, title, content, excerpt, createdAt) VALUES (?, ?, ?, ?, ?, ?)').run(
            cuid(), existing.id, existing.title, existing.content || '', existing.excerpt || '', new Date().toISOString()
          );
        }
        sets.push('updatedAt = ?'); vals.push(new Date().toISOString()); vals.push(req.params.id); db.prepare('UPDATE Post SET ' + sets.join(', ') + ' WHERE id = ?').run(...vals);
      }
    });
    const post = db.prepare('SELECT * FROM Post WHERE id = ?').get(req.params.id) as any;
    doAction('post_updated', req.params.id);
    if (data.status === 'published' && existing.status !== 'published') doAction('post_published', req.params.id);
    res.json(enrichPost(post));
  } catch (err: any) { if (err instanceof z.ZodError) { res.status(400).json({ error: err.errors }); return; } res.status(500).json({ error: err.message }); }
});

// Single delete goes to the trash too (same flow as bulk-trash) so nothing
// is ever destroyed without the recovery path — restore is /:id/restore.
router.delete('/:id', authenticate, requireCap('delete_posts'), (req: AuthRequest, res: Response) => {
  try {
    const existing = db.prepare('SELECT * FROM Post WHERE id = ?').get(req.params.id) as any;
    if (!existing) { res.status(404).json({ error: 'Post not found' }); return; }
    if (!userMayAccessSite(req.user!.userId, req.user!.role, existing.siteId || undefined)) { res.status(403).json({ error: '无权操作该站点的内容' }); return; }
    if (!userCan(req.user!, 'delete_others_posts') && existing.authorId !== req.user!.userId) { res.status(403).json({ error: 'Cannot delete another author\'s post' }); return; }
    trashPost(existing);
    res.json({ success: true, trashed: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: restore from trash
router.put('/:id/restore', authenticate, requireCap('edit_others_posts'), (req: AuthRequest, res: Response) => {
  try {
    const existing = db.prepare('SELECT * FROM Post WHERE id = ?').get(req.params.id) as any;
    if (!existing) { res.status(404).json({ error: 'Post not found' }); return; }
    if (!userMayAccessSite(req.user!.userId, req.user!.role, existing.siteId || undefined)) { res.status(403).json({ error: '无权操作该站点的内容' }); return; }
    restorePost(existing);
    res.json({ success: true, status: db.prepare('SELECT status FROM Post WHERE id = ?').get(req.params.id) });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: bulk trash
router.post('/bulk-trash', authenticate, requireCap('delete_others_posts'), (req: AuthRequest, res: Response) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) { res.status(400).json({ error: 'ids array required' }); return; }
    const rows = loadBulkPosts(ids);
    const allowed = rows.filter((r) => mayTouchPost(req.user!, r));
    let count = 0;
    withTransaction(() => { for (const r of allowed) { if (trashPost(r)) count++; } });
    res.json({ success: true, count, skipped: new Set(ids).size - allowed.length });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: bulk restore trashed posts
router.post('/bulk-restore', authenticate, requireCap('edit_others_posts'), (req: AuthRequest, res: Response) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) { res.status(400).json({ error: 'ids array required' }); return; }
    const rows = loadBulkPosts(ids).filter((r) => mayTouchPost(req.user!, r));
    let restored = 0;
    withTransaction(() => {
      for (const r of rows) { if (r.status === 'trash') { restorePost(r); restored++; } }
    });
    res.json({ success: true, restored, skipped: new Set(ids).size - rows.length });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: bulk change status (e.g. publish / draft a selection at once)
router.post('/bulk-status', authenticate, requireCap('edit_others_posts'), (req: AuthRequest, res: Response) => {
  try {
    const { ids, status } = req.body || {};
    if (!ids || !Array.isArray(ids) || ids.length === 0 || !status) { res.status(400).json({ error: 'ids and status required' }); return; }
    const valid = ['draft', 'published', 'private', 'pending', 'trash'];
    if (!valid.includes(status)) { res.status(400).json({ error: 'invalid status' }); return; }
    const rows = loadBulkPosts(ids).filter((r) => mayTouchPost(req.user!, r));
    const now = new Date().toISOString();
    let updated = 0;
    withTransaction(() => {
      for (const r of rows) {
        if (status === 'trash') { if (trashPost(r)) updated++; continue; }
        if (r.status === status) continue;
        // An explicit status wins over the trash memory; publishing must not
        // keep a FUTURE publishedAt (same rule as PUT /:id — the post would be
        // status=published yet missing from every public list).
        const sets = ['status = ?', 'previousStatus = NULL', 'updatedAt = ?'];
        const vals: any[] = [status, now];
        if (status === 'published' && (!r.publishedAt || r.publishedAt > now)) { sets.push('publishedAt = ?'); vals.push(now); }
        vals.push(r.id);
        updated += db.prepare('UPDATE Post SET ' + sets.join(', ') + ' WHERE id = ?').run(...vals).changes;
        // The type travels with the hook (see the single-row route): a page
        // announced as a post would get a /post/<slug> URL in listeners.
        doAction('post_updated', r.id, r.type);
        if (status === 'published') doAction('post_published', r.id, r.type);
      }
    });
    res.json({ success: true, updated, skipped: new Set(ids).size - rows.length });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: bulk permanently delete trashed posts
router.post('/bulk-delete', authenticate, requireCap('delete_others_posts'), (req: AuthRequest, res: Response) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) { res.status(400).json({ error: 'ids array required' }); return; }
    const rows = loadBulkPosts(ids).filter((r) => mayTouchPost(req.user!, r));
    const stmt = db.prepare("DELETE FROM Post WHERE id = ? AND status = 'trash'");
    let deleted = 0;
    withTransaction(() => {
      for (const r of rows) {
        if (r.status !== 'trash') continue;
        // Related rows (categories, tags, meta, revisions, comments) go with it
        // through the ON DELETE CASCADE declared in the schema. No hook here:
        // delete_post already fired when the post entered the trash, and firing
        // it again would send listeners (webhooks) two events for one deletion.
        if (stmt.run(r.id).changes > 0) deleted++;
      }
    });
    res.json({ success: true, deleted, skipped: new Set(ids).size - rows.length });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: toggle sticky
router.put('/:id/sticky', authenticate, requireCap('edit_others_posts'), (req: AuthRequest, res: Response) => {
  try {
    const existing = db.prepare('SELECT id, sticky, siteId FROM Post WHERE id = ?').get(req.params.id) as any;
    if (!existing) { res.status(404).json({ error: 'Post not found' }); return; }
    if (!userMayAccessSite(req.user!.userId, req.user!.role, existing.siteId || undefined)) { res.status(403).json({ error: '无权操作该站点的内容' }); return; }
    const newSticky = existing.sticky ? 0 : 1;
    db.prepare('UPDATE Post SET sticky = ? WHERE id = ?').run(newSticky, req.params.id);
    res.json({ sticky: newSticky });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: get revisions for a post
router.get('/:id/revisions', authenticate, requireCap('edit_posts'), (req: AuthRequest, res: Response) => {
  try {
    const existing = db.prepare('SELECT authorId FROM Post WHERE id = ?').get(req.params.id) as any;
    if (!existing) { res.status(404).json({ error: 'Post not found' }); return; }
    if (!userCan(req.user!, 'edit_others_posts') && existing.authorId !== req.user!.userId) { res.status(403).json({ error: 'Cannot view another author\'s revisions' }); return; }
    const revisions = db.prepare('SELECT id, title, content, excerpt, createdAt FROM Revision WHERE postId = ? ORDER BY createdAt DESC LIMIT 20').all(req.params.id) as any[];
    res.json(revisions);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: restore a revision (writes back to post, keeps a new revision of the overwritten state)
router.put('/:id/revisions/:revId/restore', authenticate, requireCap('edit_posts'), (req: AuthRequest, res: Response) => {
  try {
    const rev = db.prepare('SELECT * FROM Revision WHERE id = ? AND postId = ?').get(req.params.revId, req.params.id) as any;
    if (!rev) { res.status(404).json({ error: 'Revision not found' }); return; }
    const post = db.prepare('SELECT * FROM Post WHERE id = ?').get(req.params.id) as any;
    if (!post) { res.status(404).json({ error: 'Post not found' }); return; }
    if (!userCan(req.user!, 'edit_others_posts') && post.authorId !== req.user!.userId) { res.status(403).json({ error: 'Cannot restore another author\'s revisions' }); return; }
    const now = new Date().toISOString();
    // Keep a revision of the current state before overwriting (restore itself leaves a trace)
    db.prepare('INSERT INTO Revision (id, postId, title, content, excerpt, createdAt) VALUES (?, ?, ?, ?, ?, ?)').run(
      cuid(), post.id, post.title, post.content || '', post.excerpt || '', now
    );
    db.prepare('UPDATE Post SET title = ?, content = ?, excerpt = ?, updatedAt = ? WHERE id = ?').run(
      rev.title, rev.content, rev.excerpt, now, post.id
    );
    const updated = db.prepare('SELECT * FROM Post WHERE id = ?').get(post.id) as any;
    res.json({ post: enrichPost(updated) });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Public: related posts (same category)
router.get('/:id/related', (req: AuthRequest & SiteRequest, res: Response) => {
  try {
    const catIds = (db.prepare('SELECT categoryId FROM PostCategory WHERE postId = ?').all(req.params.id) as any[]).map((r: any) => r.categoryId);
    if (catIds.length === 0) { res.json([]); return; }
    const placeholders = catIds.map(() => '?').join(',');
    const now = new Date().toISOString();
    // Categories are shared, so without this a site A post listed site B's posts.
    const scopeClause = req.siteId ? ' AND (p.siteId IS NULL OR p.siteId = ?)' : '';
    const scopeArgs: any[] = req.siteId ? [req.siteId] : [];
    const posts = db.prepare(
      'SELECT DISTINCT p.* FROM Post p JOIN PostCategory pc ON pc.postId = p.id WHERE pc.categoryId IN (' + placeholders + ') AND p.id != ? AND p.type = ? AND p.status = ? AND (p.publishedAt IS NULL OR p.publishedAt <= ?)' + scopeClause + ' ORDER BY p.publishedAt DESC LIMIT 4'
    ).all(...catIds, req.params.id, 'post', 'published', now, ...scopeArgs) as any[];
    res.json(publicShape(enrichPosts(posts), mayBypassProtection(req)));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: lock post for editing
router.post('/:id/lock', authenticate, requireCap('edit_posts'), (req: AuthRequest, res: Response) => {
  try {
    const existing = db.prepare('SELECT id, lockedAt, lockedBy, authorId FROM Post WHERE id = ?').get(req.params.id) as any;
    if (!existing) { res.status(404).json({ error: 'Post not found' }); return; }
    // A caller who cannot edit other people's posts may only lock their own;
    // otherwise anyone could block another author's editing for 5 minutes.
    if (!userCan(req.user!, 'edit_others_posts') && existing.authorId !== req.user!.userId) {
      res.status(403).json({ error: 'Cannot lock another user\'s post' });
      return;
    }
    const now = new Date().toISOString();
    if (existing.lockedAt) {
      const lockTime = new Date(existing.lockedAt).getTime();
      if (Date.now() - lockTime < 300000 && existing.lockedBy !== req.user!.userId) {
        res.json({ locked: true, lockedBy: existing.lockedBy || 'another user' });
        return;
      }
    }
    db.prepare('UPDATE Post SET lockedAt = ?, lockedBy = ? WHERE id = ?').run(now, req.user!.userId, req.params.id);
    res.json({ locked: false });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: unlock post
router.post('/:id/unlock', authenticate, requireCap('edit_others_posts'), (req: AuthRequest, res: Response) => {
  try {
    db.prepare('UPDATE Post SET lockedAt = ?, lockedBy = ? WHERE id = ?').run('', '', req.params.id);
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: clone/duplicate a post
router.post('/:id/clone', authenticate, requireCap('edit_posts'), (req: AuthRequest, res: Response) => {
  try {
    const existing = db.prepare('SELECT * FROM Post WHERE id = ?').get(req.params.id) as any;
    if (!existing) { res.status(404).json({ error: 'Post not found' }); return; }
    if (!userCan(req.user!, 'edit_others_posts') && existing.authorId !== req.user!.userId) { res.status(403).json({ error: 'Cannot clone another author\'s post' }); return; }
    const id = cuid();
    const now = new Date().toISOString();
    withTransaction(() => {
      db.prepare('INSERT INTO Post (id, title, slug, content, excerpt, status, type, featured, password, format, authorId, parentId, menuOrder, sticky) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(
        id, existing.title + ' (Copy)', existing.slug + '-copy', existing.content, existing.excerpt, 'draft', existing.type, existing.featured, '', existing.format || 'standard', req.user!.userId, null, existing.menuOrder, 0
      );
      // Copy categories
      const cats = db.prepare('SELECT categoryId FROM PostCategory WHERE postId = ?').all(req.params.id) as any[];
      for (const c of cats) db.prepare('INSERT OR IGNORE INTO PostCategory (postId, categoryId) VALUES (?, ?)').run(id, c.categoryId);
      // Copy tags
      const tags = db.prepare('SELECT tagId FROM PostTag WHERE postId = ?').all(req.params.id) as any[];
      for (const t of tags) db.prepare('INSERT OR IGNORE INTO PostTag (postId, tagId) VALUES (?, ?)').run(id, t.tagId);
    });
    res.status(201).json(db.prepare('SELECT * FROM Post WHERE id = ?').get(id));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// ---- Frontend submission + review workflow ----
// Registered users with submit_posts (default: subscriber) can submit content
// from the public site; it enters the moderation queue as 'pending' until an
// editor approves or rejects it via /:id/review.

router.post('/frontend/submit-post', authenticate, requireCap('submit_posts'), (req: AuthRequest & SiteRequest, res: Response) => {
  try {
    const title = String(req.body?.title || '').trim();
    const content = String(req.body?.content || '').trim();
    if (!title) { res.status(400).json({ error: 'Post title is required' }); return; }
    if (!content) { res.status(400).json({ error: 'Post content is required' }); return; }
    const excerpt = String(req.body?.excerpt || '').trim().slice(0, 300);
    const id = cuid();
    const allSlugs = (db.prepare("SELECT slug FROM Post WHERE type = 'post'").all() as any[]).map((s: any) => s.slug);
    const slug = uniqueSlug(title, allSlugs);
    withTransaction(() => {
      db.prepare("INSERT INTO Post (id, title, slug, content, excerpt, status, featured, authorId, siteId) VALUES (?, ?, ?, ?, ?, 'pending', NULL, ?, ?)")
        .run(id, title, slug, content, excerpt, req.user!.userId, (req as any).siteId || null);
      if (Array.isArray(req.body?.categoryIds)) {
        for (const cid of req.body.categoryIds) db.prepare('INSERT OR IGNORE INTO PostCategory (postId, categoryId) VALUES (?, ?)').run(id, cid);
      }
    });
    try { doAction('post_submitted', id); } catch {}
    res.status(201).json({ id, slug });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// The submitter's own submissions with their review status
router.get('/mine', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const posts = db.prepare("SELECT id, title, slug, status, excerpt, createdAt FROM Post WHERE authorId = ? AND type = 'post' ORDER BY createdAt DESC").all(req.user!.userId) as any[];
    res.json({ posts });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Editor review: approve (publish) or reject (back to draft + notify author)
router.post('/:id/review', authenticate, requireCap('review_posts'), (req: AuthRequest, res: Response) => {
  try {
    const action = req.body?.action;
    if (action !== 'approve' && action !== 'reject') { res.status(400).json({ error: 'action must be approve or reject' }); return; }
    const post = db.prepare('SELECT * FROM Post WHERE id = ?').get(req.params.id) as any;
    if (!post) { res.status(404).json({ error: 'Post not found' }); return; }
    if (post.status !== 'pending') { res.status(400).json({ error: 'Post is not pending review' }); return; }
    const now = new Date().toISOString();
    if (action === 'approve') {
      db.prepare("UPDATE Post SET status = 'published', publishedAt = ?, updatedAt = ? WHERE id = ?").run(now, now, post.id);
      try { doAction('post_published', post.id); } catch {}
    } else {
      const reason = String(req.body?.reason || '').trim().slice(0, 500);
      db.prepare("UPDATE Post SET status = 'draft', updatedAt = ? WHERE id = ?").run(now, post.id);
      // In-app notification for the author (reuses the AiNotification table —
      // userId/message/read are generic enough to double as a notification box)
      if (post.authorId) {
        const msg = reason
          ? '您的投稿《' + post.title + '》未通过审核：' + reason
          : '您的投稿《' + post.title + '》未通过审核，请修改后重新提交';
        try { db.prepare('INSERT INTO AiNotification (id, userId, message, read, createdAt) VALUES (?, ?, ?, 0, ?)').run(cuid(), post.authorId, msg, now); } catch {}
      }
    }
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;
