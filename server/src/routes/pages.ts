import { Router, Response } from 'express';
import crypto from 'crypto';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import db, { cuid } from '../utils/db';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { SiteRequest } from '../middleware/site';
import { uniqueSlug } from '../utils/slug';
import { applyShortcodes, renderCmsBlocks } from '../utils/shortcodes';

const router = Router();
// Protected-page password guessing is brute-forced per IP
const passwordLimiter = rateLimit({ windowMs: 60 * 1000, max: 20, standardHeaders: true, message: { error: 'Too many attempts, slow down' } });

// Visual-editor CSS is rendered into a <style> tag on the public site — strip
// dangerous primitives at write time (mirrors the guard in routes/posts.ts).
function sanitizeVisualCss(css: string): string {
  return String(css || '')
    .replace(/@import[^;]+;?/gi, '')
    .replace(/expression\([^)]*\)/gi, '')
    .replace(/behavior\s*:[^;}]+;?/gi, '')
    .replace(/url\(\s*(javascript|data):/gi, 'url(');
}
const pageSchema = z.object({ title: z.string().min(1), content: z.string().optional(), excerpt: z.string().optional(), status: z.enum(['draft', 'published', 'private', 'password', 'trash']).optional(), password: z.string().optional(), featured: z.string().optional(), parentId: z.string().nullable().optional(), menuOrder: z.number().int().optional(), meta: z.record(z.string(), z.string()).optional() });

// 'password' status means "published but password protected" (WordPress style):
// store it as status='published' + a non-empty password field.
function normalizePage(data: any, existingPassword = ''): { status: string; password: string } {
  if (data.status === 'password') return { status: 'published', password: String(data.password || '') };
  const status = data.status || 'draft';
  const password = data.password !== undefined ? String(data.password || '') : existingPassword;
  return { status, password };
}


router.get('/public', (req: AuthRequest, res: Response) => {
  try {
    const pages = db.prepare('SELECT id, title, slug, status, menuOrder FROM Post WHERE type = ? AND status = ? ORDER BY menuOrder ASC').all('page', 'published') as any[];
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
    const page = db.prepare('SELECT * FROM Post WHERE slug = ? AND type = ?').get(req.params.slug, 'page') as any;
    if (!page || page.status === 'trash') { res.status(404).json({ error: 'Page not found' }); return; }
    const isAdmin = !!req.user && ['admin', 'editor'].includes(req.user.role);
    // Draft pages are never public (WordPress behavior).
    if (page.status === 'draft' && !isAdmin) { res.status(404).json({ error: 'Page not found' }); return; }
    // Password protection only applies to published pages (WordPress model).
    // A private page with a leftover password must still behave as private.
    const protectedPage = page.status === 'published' && page.password ? true : false;

    // Password protected — cookie must match, admins bypass.
    if (protectedPage && !isAdmin) {
      const cookieVal = getPassCookie(req, page.id);
      const expected = crypto.createHash('sha256').update(page.id + ':' + page.password).digest('hex');
      if (cookieVal !== expected) {
        const safe = { id: page.id, title: page.title, slug: page.slug, status: 'published', protected: true };
        res.json(safe);
        return;
      }
    }

    // Truly private page — logged-in staff only.
    if (page.status === 'private' && !isAdmin) {
      res.status(403).json({ error: 'This page is private', private: true, title: page.title, slug: page.slug });
      return;
    }

    page.author = db.prepare('SELECT id, username FROM User WHERE id = ?').get(page.authorId);
    // Load meta fields for visual CSS, etc.
    const metaRows = db.prepare('SELECT key, value FROM PostMeta WHERE postId = ?').all(page.id) as any[];
    page.meta = {};
    metaRows.forEach((r: any) => { page.meta[r.key] = r.value; });
    delete page.password;
    page.content = renderCmsBlocks(applyShortcodes(page.content || '', { siteId: req.siteId }));
    res.json(page);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Verify a password for a protected page. On success set an httpOnly cookie
// (hashed password, 7 days) so the visitor stays unlocked — like WordPress.
router.post('/slug/:slug/password', passwordLimiter, (req: AuthRequest, res: Response) => {
  try {
    const page = db.prepare('SELECT id, password FROM Post WHERE slug = ? AND type = ?').get(req.params.slug, 'page') as any;
    if (!page || !page.password) { res.status(404).json({ error: 'Page not found' }); return; }
    const submitted = String((req.body || {}).password || '');
    if (page.password !== submitted) {
      res.status(401).json({ error: 'wrong_password' });
      return;
    }
    const hash = crypto.createHash('sha256').update(page.id + ':' + page.password).digest('hex');
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

router.get('/', authenticate, authorize('admin', 'editor'), (req: AuthRequest, res: Response) => {
  try {
    const pages = db.prepare(`
      SELECT p.*, (SELECT COUNT(*) FROM Comment c WHERE c.postId = p.id AND c.status = 'approved') AS commentCount
      FROM Post p WHERE p.type = ? ORDER BY p.menuOrder ASC
    `).all('page') as any[];
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

router.post('/', authenticate, authorize('admin', 'editor'), (req: AuthRequest, res: Response) => {
  try {
    const data = pageSchema.parse(req.body);
    const allSlugs = (db.prepare('SELECT slug FROM Post WHERE type = ?').all('page') as any[]).map((s: any) => s.slug);
    const slug = uniqueSlug(data.title, allSlugs);
    const id = cuid();
    const { status: storeStatus, password: storePassword } = normalizePage(data);
    db.prepare('INSERT INTO Post (id, title, slug, content, excerpt, featured, status, password, type, authorId, parentId, menuOrder, publishedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(id, data.title, slug, data.content || '', data.excerpt || '', data.featured || null, storeStatus, storePassword, 'page', req.user!.userId, data.parentId || null, data.menuOrder || 0, storeStatus === 'published' ? new Date().toISOString() : null);
    if (data.meta) {
      for (const [key, value] of Object.entries(data.meta)) {
        db.prepare('INSERT INTO PostMeta (id, postId, key, value) VALUES (?, ?, ?, ?)').run(cuid(), id, key, key === '_visual_css' ? sanitizeVisualCss(value) : value);
      }
    }
    const page = db.prepare('SELECT * FROM Post WHERE id = ?').get(id) as any;
    res.status(201).json(page);
  } catch (err: any) { if (err instanceof z.ZodError) { res.status(400).json({ error: err.errors }); return; } res.status(500).json({ error: err.message }); }
});

router.put('/:id', authenticate, authorize('admin', 'editor'), (req: AuthRequest, res: Response) => {
  try {
    const existing = db.prepare('SELECT * FROM Post WHERE id = ? AND type = ?').get(req.params.id, 'page') as any;
    if (!existing) { res.status(404).json({ error: 'Page not found' }); return; }
    const data = pageSchema.partial().parse(req.body);
    const sets: string[] = []; const vals: any[] = [];
    if (data.title !== undefined) { sets.push('title = ?'); vals.push(data.title); }
    if (data.content !== undefined) { sets.push('content = ?'); vals.push(data.content); }
    if (data.excerpt !== undefined) { sets.push('excerpt = ?'); vals.push(data.excerpt); }
    if (data.featured !== undefined) { sets.push('featured = ?'); vals.push(data.featured || null); }
    if (data.status !== undefined || data.password !== undefined) {
      const norm = normalizePage({ status: data.status, password: data.password }, existing.password || '');
      sets.push('status = ?'); vals.push(norm.status);
      sets.push('password = ?'); vals.push(norm.password);
      if (norm.status === 'published' && !existing.publishedAt) { sets.push('publishedAt = ?'); vals.push(new Date().toISOString()); }
    }
    if (data.parentId !== undefined) { sets.push('parentId = ?'); vals.push(data.parentId); }
    if (data.menuOrder !== undefined) { sets.push('menuOrder = ?'); vals.push(data.menuOrder); }
    if (data.meta) {
      db.prepare('DELETE FROM PostMeta WHERE postId = ?').run(req.params.id);
      for (const [key, value] of Object.entries(data.meta)) {
        db.prepare('INSERT INTO PostMeta (id, postId, key, value) VALUES (?, ?, ?, ?)').run(cuid(), req.params.id, key, key === '_visual_css' ? sanitizeVisualCss(value) : value);
      }
    }
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
    const page = db.prepare('SELECT * FROM Post WHERE id = ?').get(req.params.id) as any;
    res.json(page);
  } catch (err: any) { if (err instanceof z.ZodError) { res.status(400).json({ error: err.errors }); return; } res.status(500).json({ error: err.message }); }
});

// Admin: list revisions for a page (history)
router.get('/:id/revisions', authenticate, authorize('admin', 'editor'), (req: AuthRequest, res: Response) => {
  try {
    const revisions = db.prepare('SELECT id, title, content, excerpt, createdAt FROM Revision WHERE postId = ? ORDER BY createdAt DESC LIMIT 20').all(req.params.id) as any[];
    res.json(revisions);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: restore a page revision (current state becomes a new revision first)
router.put('/:id/revisions/:revId/restore', authenticate, authorize('admin', 'editor'), (req: AuthRequest, res: Response) => {
  try {
    const existing = db.prepare('SELECT * FROM Post WHERE id = ? AND type = ?').get(req.params.id, 'page') as any;
    const rev = db.prepare('SELECT * FROM Revision WHERE id = ? AND postId = ?').get(req.params.revId, req.params.id) as any;
    if (!existing || !rev) { res.status(404).json({ error: 'Not found' }); return; }
    db.prepare('INSERT INTO Revision (id, postId, title, content, excerpt, createdAt) VALUES (?, ?, ?, ?, ?, ?)').run(
      cuid(), req.params.id, existing.title, existing.content || '', existing.excerpt || '', new Date().toISOString());
    db.prepare('UPDATE Post SET title = ?, content = ?, excerpt = ?, updatedAt = ? WHERE id = ?').run(rev.title, rev.content || '', rev.excerpt || '', new Date().toISOString(), req.params.id);
    res.json({ success: true, restored: rev });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', authenticate, authorize('admin', 'editor'), (req: AuthRequest, res: Response) => {
  try {
    db.prepare('DELETE FROM Post WHERE id = ? AND type = ?').run(req.params.id, 'page');
    // Categories may point at this page as their landing page — clear the
    // dangling reference so menu jumps don't 404
    db.prepare('UPDATE LinkCategory SET pageId = NULL WHERE pageId = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;
