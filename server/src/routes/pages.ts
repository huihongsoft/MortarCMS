import { Router, Response } from 'express';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import db, { cuid, withTransaction } from '../utils/db';
import { authenticate, requireCap, userCan, resolveOptionalUser, AuthRequest } from '../middleware/auth';
import { rateLimitStore } from '../utils/rateLimitStore';
import { SiteRequest } from '../middleware/site';
import { uniqueSlug } from '../utils/slug';
import { normalizeLang, translationsOf, pagePathForLang } from '../utils/contentLang';
import { recordMovedPath } from '../utils/redirects';
import { applyShortcodes, renderCmsBlocks } from '../utils/shortcodes';
import { writePostMeta } from '../utils/postMeta';
import { validateAndCoerceMeta, buildFields, stripPrivateMeta } from '../utils/fieldSchema';
import { siteScopeForFilter, mayWriteSite, userMayAccessSite } from '../utils/userSites';
import { contentUnlockMatches, contentUnlockToken, verifyContentPassword, hashContentPassword } from '../utils/contentPassword';
import { doAction } from '../utils/hooks';

const router = Router();
// Protected-page password guessing is brute-forced per IP
const passwordLimiter = rateLimit({ windowMs: 60 * 1000, max: 20, standardHeaders: true, store: rateLimitStore(), message: { error: 'Too many attempts, slow down' } });

const pageSchema = z.object({ title: z.string().min(1), slug: z.string().max(200).optional(), lang: z.string().max(10).optional(), content: z.string().optional(), excerpt: z.string().optional(), status: z.enum(['draft', 'published', 'private', 'password', 'trash']).optional(), password: z.string().optional(), featured: z.string().optional(), parentId: z.string().nullable().optional(), menuOrder: z.number().int().optional(), siteId: z.string().nullable().optional(), meta: z.record(z.string(), z.string()).optional() });

// 'password' status means "published but password protected" (WordPress style):
// store it as status='published' + a non-empty password field.
function normalizePage(data: any, existingPassword = ''): { status: string; password: string } {
  if (data.status === 'password') return { status: 'published', password: String(data.password || '') };
  const status = data.status || 'draft';
  const password = data.password !== undefined ? String(data.password || '') : existingPassword;
  return { status, password };
}


router.get('/public', (req: AuthRequest & SiteRequest, res: Response) => {
  try {
    const pages = (req.siteId
      ? db.prepare('SELECT id, title, slug, status, menuOrder, lang FROM Post WHERE type = ? AND status = ? AND lang = ? AND (siteId IS NULL OR siteId = ?) ORDER BY menuOrder ASC').all('page', 'published', normalizeLang(req.query.lang) || '', req.siteId)
      : db.prepare('SELECT id, title, slug, status, menuOrder, lang FROM Post WHERE type = ? AND status = ? AND lang = ? ORDER BY menuOrder ASC').all('page', 'published', normalizeLang(req.query.lang) || '')) as any[];
    res.json(pages);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Read the password-protection cookie value (WordPress-style wp-postpass).
function getPassCookie(req: any, pageId: string): string | null {
  const raw = String(req.headers.cookie || '');
  const m = raw.match(new RegExp('mortar_page_pass_' + pageId + '=([^;]+)'));
  return m ? decodeURIComponent(m[1]) : null;
}

// WordPress-style page access control:
//  - Password protected: the page has a `password` (status is effectively
//    published). Visitors must POST the correct password; a signed cookie
//    then unlocks the page for the session (7 days).
//  - Private: only logged-in admin/editor can view.
router.get('/slug/:slug', (req: AuthRequest & SiteRequest, res: Response) => {
  try {
    const page = (req.siteId
      ? db.prepare('SELECT * FROM Post WHERE slug = ? AND type = ? AND (siteId IS NULL OR siteId = ?)').get(req.params.slug, 'page', req.siteId)
      : db.prepare('SELECT * FROM Post WHERE slug = ? AND type = ?').get(req.params.slug, 'page')) as any;
    if (!page || page.status === 'trash') { res.status(404).json({ error: 'Page not found' }); return; }
    // This route is public, so it never runs `authenticate` and `req.user` is
    // empty — the caller has to be resolved the way the other public routes do
    // it, or the bypass is false for everyone and an editor cannot even view
    // the draft page they are working on.
    const viewer = req.user || resolveOptionalUser(req);
    // The same rule the post routes use, expressed as a capability rather than a
    // role name: matching on 'admin'|'editor' ignored capability changes, so an
    // editor stripped of edit_others_posts still bypassed a page's protection,
    // while a custom role granted it could not open its own drafts.
    const mayManage = !!viewer && (userCan(viewer, 'edit_others_posts') || page.authorId === viewer.userId);
    // The password gate uses the narrower rule the post route uses: knowing the
    // password is what unlocks a protected post, and being its author is not a
    // substitute there either. Draft/private visibility is the wider one above.
    const mayBypassPassword = !!viewer && userCan(viewer, 'edit_others_posts');
    // Draft pages are never public (WordPress behavior).
    if (page.status === 'draft' && !mayManage) { res.status(404).json({ error: 'Page not found' }); return; }
    // Password protection only applies to published pages (WordPress model).
    // A private page with a leftover password must still behave as private.
    const protectedPage = page.status === 'published' && page.password ? true : false;

    // Password protected — cookie must match, admins bypass.
    if (protectedPage && !mayBypassPassword) {
      const cookieVal = getPassCookie(req, page.id);
      if (!contentUnlockMatches(cookieVal, page.id, page.password)) {
        const safe = { id: page.id, title: page.title, slug: page.slug, status: 'published', protected: true };
        res.json(safe);
        return;
      }
    }

    // Truly private page — logged-in staff only.
    if (page.status === 'private' && !mayManage) {
      res.status(403).json({ error: 'This page is private', private: true, title: page.title, slug: page.slug });
      return;
    }

    page.author = db.prepare('SELECT id, username FROM User WHERE id = ?').get(page.authorId);
    // Load meta fields for visual CSS, etc.
    const metaRows = db.prepare('SELECT key, value FROM PostMeta WHERE postId = ?').all(page.id) as any[];
    page.meta = {};
    metaRows.forEach((r: any) => { page.meta[r.key] = r.value; });
    // Typed view of the same values, and the same public filter the post routes
    // apply: a private field, and the application's own `_` keys the frontend
    // does not read, stay out of an anonymous payload.
    page.fields = buildFields('page', page.meta);
    if (!mayManage) {
      page.fields = page.fields.filter((f: any) => !f.private);
      stripPrivateMeta(page.meta, 'page');
    }
    delete page.password;
    // Other languages of this page, so the client can offer a switcher and the
    // injected head can emit hreflang alternates.
    page.translations = translationsOf(page);
    page.content = renderCmsBlocks(applyShortcodes(page.content || '', { siteId: req.siteId, post: page }), { siteId: req.siteId, post: page });
    res.json(page);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Verify a password for a protected page. On success set an httpOnly cookie
// (hashed password, 7 days) so the visitor stays unlocked — like WordPress.
router.post('/slug/:slug/password', passwordLimiter, async (req: AuthRequest, res: Response) => {
  try {
    const page = db.prepare('SELECT id, password FROM Post WHERE slug = ? AND type = ?').get(req.params.slug, 'page') as any;
    if (!page || !page.password) { res.status(404).json({ error: 'Page not found' }); return; }
    const submitted = String((req.body || {}).password || '');
    const check = await verifyContentPassword(submitted, page.password);
    if (!check.ok) {
      res.status(401).json({ error: 'wrong_password' });
      return;
    }
    // Legacy plaintext: replace it with a hash now that we know the plaintext.
    if (check.upgraded) db.prepare('UPDATE Post SET password = ? WHERE id = ?').run(check.upgraded, page.id);
    const hash = contentUnlockToken(page.id, check.upgraded || page.password);
    res.cookie('mortar_page_pass_' + page.id, hash, {
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

router.get('/', authenticate, requireCap('edit_pages'), (req: AuthRequest, res: Response) => {
  try {
    const sf = siteScopeForFilter(req.user!.userId, req.user!.role, req.query.siteId, 'p.siteId');
    if (sf.denied) { res.status(403).json({ error: '无权访问该站点' }); return; }
    const pages = db.prepare(`
      SELECT p.*, (SELECT COUNT(*) FROM Comment c WHERE c.postId = p.id AND c.status = 'approved') AS commentCount
      FROM Post p WHERE p.type = ?${sf.clause} ORDER BY p.menuOrder ASC
    `).all('page', ...sf.params) as any[];
    // Batch author + meta lookup (one query each, not one per page)
    const ids = pages.map((p: any) => p.id);
    const qmarks = ids.map(() => '?').join(',');
    const authors = new Map<string, any>();
    const authorIds = [...new Set(pages.map((p: any) => p.authorId).filter(Boolean))] as string[];
    if (authorIds.length) {
      (db.prepare('SELECT id, username FROM User WHERE id IN (' + authorIds.map(() => '?').join(',') + ')').all(...authorIds) as any[])
        .forEach((u: any) => authors.set(u.id, u));
    }
    const meta = new Map<string, Record<string, string>>();
    if (ids.length) {
      (db.prepare('SELECT postId, key, value FROM PostMeta WHERE postId IN (' + qmarks + ')').all(...ids) as any[])
        .forEach((r: any) => { if (!meta.has(r.postId)) meta.set(r.postId, {}); meta.get(r.postId)![r.key] = r.value; });
    }
    pages.forEach((p: any) => { p.author = authors.get(p.authorId); p.meta = meta.get(p.id) || {}; });
    res.json(pages);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.post('/', authenticate, requireCap('edit_pages'), async (req: AuthRequest, res: Response) => {
  try {
    const data = pageSchema.parse(req.body);
    // Slug is unique across all content types (see the same note in posts.ts).
    const allSlugs = (db.prepare('SELECT slug FROM Post').all() as any[]).map((s: any) => s.slug);
    const slug = data.slug ? uniqueSlug(data.slug, allSlugs) : uniqueSlug(data.title, allSlugs);
    const id = cuid();
    const { status: storeStatus, password: rawPassword } = normalizePage(data);
    // Writing a page and putting it online are separate capabilities.
    if (storeStatus === 'published' && !userCan(req.user!, 'publish_pages')) { res.status(403).json({ error: '无权发布页面' }); return; }
    // Store a hash, never the plaintext (see utils/contentPassword).
    const storePassword = rawPassword ? await hashContentPassword(rawPassword) : '';
    if (data.siteId !== undefined && !mayWriteSite(req.user!.userId, req.user!.role, data.siteId)) {
      res.status(403).json({ error: '无权在该站点创建内容' }); return;
    }
    // Field values are validated before the transaction, like posts.
    const metaValues = validateAndCoerceMeta('page', data.meta, res);
    if (metaValues === null) return;
    withTransaction(() => {
      db.prepare('INSERT INTO Post (id, title, slug, content, excerpt, featured, status, password, type, authorId, parentId, menuOrder, publishedAt, siteId, lang) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(id, data.title, slug, data.content || '', data.excerpt || '', data.featured || null, storeStatus, storePassword, 'page', req.user!.userId, data.parentId || null, data.menuOrder || 0, storeStatus === 'published' ? new Date().toISOString() : null, data.siteId || null, normalizeLang(data.lang) || '');
      if (metaValues) writePostMeta(id, metaValues);
    });
    const page = db.prepare('SELECT * FROM Post WHERE id = ?').get(id) as any;
    // Pages are posts of type 'page'; the content type travels with the hook so
    // a listener can decide whether it applies (URLs differ: /page/ vs /post/).
    try {
      doAction('post_created', id, storeStatus, 'page');
      if (storeStatus === 'published') doAction('post_published', id, 'page');
    } catch {}
    res.status(201).json(page);
  } catch (err: any) { if (err instanceof z.ZodError) { res.status(400).json({ error: err.errors }); return; } res.status(500).json({ error: err.message }); }
});

router.put('/:id', authenticate, requireCap('edit_pages'), async (req: AuthRequest, res: Response) => {
  try {
    const existing = db.prepare('SELECT * FROM Post WHERE id = ? AND type = ?').get(req.params.id, 'page') as any;
    if (!existing) { res.status(404).json({ error: 'Page not found' }); return; }
    // Same as posts: the page must belong to one of this user's sites.
    if (!userMayAccessSite(req.user!.userId, req.user!.role, existing.siteId || undefined)) { res.status(403).json({ error: '无权操作该站点的内容' }); return; }
    const data = pageSchema.partial().parse(req.body);
    const sets: string[] = []; const vals: any[] = [];
    if (data.title !== undefined) { sets.push('title = ?'); vals.push(data.title); }
    // Pages live at /page/<slug>; the same rule as posts applies — a published
    // page's old URL keeps working after a slug edit or a language change, which
    // both move the path. Resolved first, written once (see the same note in
    // posts.ts).
    let nextSlug = existing.slug;
    if (data.slug !== undefined && String(data.slug).trim()) {
      const others = (db.prepare('SELECT slug FROM Post WHERE id <> ?').all(req.params.id) as any[]).map((s: any) => s.slug);
      nextSlug = uniqueSlug(String(data.slug), others);
      if (nextSlug !== existing.slug) { sets.push('slug = ?'); vals.push(nextSlug); }
    }
    let nextLang = existing.lang || '';
    if (data.lang !== undefined) {
      const l = normalizeLang(data.lang);
      if (l === null && String(data.lang).trim() !== '') { res.status(400).json({ error: '语言代码无效（应为 zh 或 en-US 这样的形式）' }); return; }
      nextLang = l || '';
      if (nextLang !== (existing.lang || '')) { sets.push('lang = ?'); vals.push(nextLang); }
    }
    if ((nextSlug !== existing.slug || nextLang !== (existing.lang || '')) && (existing.status === 'published' || existing.status === 'private')) {
      recordMovedPath(pagePathForLang(existing.slug, existing.lang), pagePathForLang(nextSlug, nextLang), existing.siteId || null);
    }
    if (data.content !== undefined) { sets.push('content = ?'); vals.push(data.content); }
    if (data.excerpt !== undefined) { sets.push('excerpt = ?'); vals.push(data.excerpt); }
    if (data.featured !== undefined) { sets.push('featured = ?'); vals.push(data.featured || null); }
    if (data.status !== undefined || data.password !== undefined) {
      const norm = normalizePage({ status: data.status, password: data.password }, existing.password || '');
      // Only the transition into published is a publish; re-saving an
      // already-published page must not require the capability.
      if (norm.status === 'published' && existing.status !== 'published' && !userCan(req.user!, 'publish_pages')) { res.status(403).json({ error: '无权发布页面' }); return; }
      sets.push('status = ?'); vals.push(norm.status);
      // Same unchanged-value rule as posts: the admin editor echoes the stored
      // value back on every save, so only a genuinely new value is re-hashed.
      if (norm.password !== existing.password) {
        sets.push('password = ?'); vals.push(norm.password ? await hashContentPassword(norm.password) : '');
      }
      if (norm.status === 'published' && !existing.publishedAt) { sets.push('publishedAt = ?'); vals.push(new Date().toISOString()); }
    }
    if (data.parentId !== undefined) { sets.push('parentId = ?'); vals.push(data.parentId); }
    if (data.menuOrder !== undefined) { sets.push('menuOrder = ?'); vals.push(data.menuOrder); }
    if (data.siteId !== undefined) {
      if (!mayWriteSite(req.user!.userId, req.user!.role, data.siteId)) { res.status(403).json({ error: '无权移到该站点' }); return; }
      sets.push('siteId = ?'); vals.push(data.siteId || null);
    }
    // Same as create: checked against the definitions before any write.
    const metaValues = validateAndCoerceMeta('page', data.meta, res);
    if (metaValues === null) return;
    withTransaction(() => {
      if (metaValues) writePostMeta(req.params.id, metaValues);
      if (sets.length > 0) {
        // Save a snapshot of the previous state as a revision (history system)
        const prevTitle = data.title !== undefined ? existing.title : existing.title;
        const prevContent = data.content !== undefined ? existing.content : existing.content;
        if ((data.title !== undefined && data.title !== existing.title) || (data.content !== undefined && data.content !== existing.content)) {
          db.prepare('INSERT INTO Revision (id, postId, title, content, excerpt, createdAt) VALUES (?, ?, ?, ?, ?, ?)').run(
            cuid(), req.params.id, prevTitle, prevContent || '', existing.excerpt || '', new Date().toISOString());
        }
        sets.push('updatedAt = ?'); vals.push(new Date().toISOString()); vals.push(req.params.id); db.prepare('UPDATE Post SET ' + sets.join(', ') + ' WHERE id = ?').run(...vals);
      }
    });
    const page = db.prepare('SELECT * FROM Post WHERE id = ?').get(req.params.id) as any;
    try {
      doAction('post_updated', req.params.id, 'page');
      if (page.status === 'published' && existing.status !== 'published') doAction('post_published', req.params.id, 'page');
    } catch {}
    res.json(page);
  } catch (err: any) { if (err instanceof z.ZodError) { res.status(400).json({ error: err.errors }); return; } res.status(500).json({ error: err.message }); }
});

// Admin: list revisions for a page (history)
router.get('/:id/revisions', authenticate, requireCap('edit_pages'), (req: AuthRequest, res: Response) => {
  try {
    // The page is loaded first: this read the Revision table by postId with no
    // check at all, so any editor could pull any page's revision bodies by id.
    const page = db.prepare('SELECT id, siteId FROM Post WHERE id = ? AND type = ?').get(req.params.id, 'page') as any;
    if (!page || !userMayAccessSite(req.user!.userId, req.user!.role, page.siteId || undefined)) { res.status(404).json({ error: 'Page not found' }); return; }
    const revisions = db.prepare('SELECT id, title, content, excerpt, createdAt FROM Revision WHERE postId = ? ORDER BY createdAt DESC LIMIT 20').all(req.params.id) as any[];
    res.json(revisions);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: restore a page revision (current state becomes a new revision first)
router.put('/:id/revisions/:revId/restore', authenticate, requireCap('edit_pages'), (req: AuthRequest, res: Response) => {
  try {
    const existing = db.prepare('SELECT * FROM Post WHERE id = ? AND type = ?').get(req.params.id, 'page') as any;
    const rev = db.prepare('SELECT * FROM Revision WHERE id = ? AND postId = ?').get(req.params.revId, req.params.id) as any;
    if (!existing || !rev) { res.status(404).json({ error: 'Not found' }); return; }
    if (!userMayAccessSite(req.user!.userId, req.user!.role, existing.siteId || undefined)) { res.status(403).json({ error: '无权操作该站点的内容' }); return; }
    withTransaction(() => {
      db.prepare('INSERT INTO Revision (id, postId, title, content, excerpt, createdAt) VALUES (?, ?, ?, ?, ?, ?)').run(
        cuid(), req.params.id, existing.title, existing.content || '', existing.excerpt || '', new Date().toISOString());
      db.prepare('UPDATE Post SET title = ?, content = ?, excerpt = ?, updatedAt = ? WHERE id = ?').run(rev.title, rev.content || '', rev.excerpt || '', new Date().toISOString(), req.params.id);
    });
    res.json({ success: true, restored: rev });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', authenticate, requireCap('delete_pages'), (req: AuthRequest, res: Response) => {
  try {
    // Deleting a page is a write on its site, so the row has to be in this user's
    // sites (this handler did not even load it before).
    const page = db.prepare('SELECT * FROM Post WHERE id = ? AND type = ?').get(req.params.id, 'page') as any;
    if (!page) { res.status(404).json({ error: 'Page not found' }); return; }
    if (!userMayAccessSite(req.user!.userId, req.user!.role, page.siteId || undefined)) { res.status(403).json({ error: '无权操作该站点的内容' }); return; }
    withTransaction(() => {
      db.prepare('DELETE FROM Post WHERE id = ? AND type = ?').run(req.params.id, 'page');
      // Categories may point at this page as their landing page — clear the
      // dangling reference so menu jumps don't 404
      db.prepare('UPDATE LinkCategory SET pageId = NULL WHERE pageId = ?').run(req.params.id);
    });
    try { doAction('delete_post', req.params.id, 'page'); } catch {}
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;
