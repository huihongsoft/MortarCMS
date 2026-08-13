import { Router, Response } from 'express';
import crypto from 'crypto';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import db, { cuid } from '../utils/db';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { SiteRequest } from '../middleware/site';
import { slugify, uniqueSlug } from '../utils/slug';
import { applyFilters, doAction } from '../utils/hooks';
import { applyShortcodes, renderCmsBlocks } from '../utils/shortcodes';

const router = Router();
// Protected-post password guessing is brute-forced per IP
const passwordLimiter = rateLimit({ windowMs: 60 * 1000, max: 20, standardHeaders: true, message: { error: 'Too many attempts, slow down' } });

// Visual-editor CSS is rendered into a <style> tag on the public site, so
// dangerous primitives are stripped at write time (defense in depth with the
// frontend render guard). @import can pull external resources, expression() is
// an XSS vector in old engines, behavior: is an IE active-content vector.
function sanitizeVisualCss(css: string): string {
  return String(css || '')
    .replace(/@import[^;]+;?/gi, '')
    .replace(/expression\([^)]*\)/gi, '')
    .replace(/behavior\s*:[^;}]+;?/gi, '')
    .replace(/url\(\s*(javascript|data):/gi, 'url(');
}
const postSchema = z.object({ title: z.string().min(1), content: z.string().optional(), excerpt: z.string().optional(), status: z.enum(['draft', 'published', 'scheduled', 'private', 'trash']).optional(), featured: z.string().optional(), password: z.string().optional(), categoryIds: z.array(z.string()).optional(), tagIds: z.array(z.string()).optional(), tagNames: z.array(z.string()).optional(), parentId: z.string().nullable().optional(), menuOrder: z.number().int().optional(), siteId: z.string().nullable().optional(), meta: z.record(z.string(), z.string()).optional() });

function enrichPost(p: any) {
  if (!p) return p;
  p.author = db.prepare('SELECT id, username, email, avatar FROM User WHERE id = ?').get(p.authorId);
  p.categories = db.prepare('SELECT c.id as categoryId, c.name, c.slug FROM PostCategory pc JOIN Category c ON c.id = pc.categoryId WHERE pc.postId = ?').all(p.id);
  p.tags = db.prepare('SELECT t.id as tagId, t.name, t.slug FROM PostTag pt JOIN Tag t ON t.id = pt.tagId WHERE pt.postId = ?').all(p.id);
  p.commentCount = (db.prepare('SELECT COUNT(*) as cnt FROM Comment WHERE postId = ?').get(p.id) as any)?.cnt || 0;
  p.revisionCount = (db.prepare('SELECT COUNT(*) as cnt FROM Revision WHERE postId = ?').get(p.id) as any)?.cnt || 0;
  // Load meta fields
  const metaRows = db.prepare('SELECT key, value FROM PostMeta WHERE postId = ?').all(p.id) as any[];
  p.meta = {};
  metaRows.forEach((r: any) => { p.meta[r.key] = r.value; });
  if (p.featured && p.featured.startsWith('/uploads/')) {
    const media = db.prepare('SELECT srcset FROM Media WHERE url = ?').get(p.featured) as any;
    if (media?.srcset) { try { p.srcset = JSON.parse(media.srcset); } catch {} }
  }
  return p;
}

router.get('/', (req: AuthRequest & SiteRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
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
    if (search) { sql += ' AND (p.title LIKE ? OR p.content LIKE ? OR p.excerpt LIKE ?)'; params.push('%' + search + '%', '%' + search + '%', '%' + search + '%'); }
    if (category) { sql += ' AND c.slug = ?'; params.push(category); }
    if (tag) { sql += ' AND t.slug = ?'; params.push(tag); }
    // Relevance: title matches rank above body matches
    if (search) {
      const sp = '%' + search + '%';
      sql += ' ORDER BY p.sticky DESC, CASE WHEN p.title LIKE ? THEN 0 ELSE 1 END, p.publishedAt DESC LIMIT ? OFFSET ?';
      params.push(sp, limit, (page - 1) * limit);
    } else {
      sql += ' ORDER BY p.sticky DESC, p.publishedAt DESC LIMIT ? OFFSET ?';
      params.push(limit, (page - 1) * limit);
    }
    const postsData = db.prepare(sql).all(...params) as any[];
    const countSql = 'SELECT COUNT(DISTINCT p.id) as cnt FROM Post p' + (category ? ' JOIN PostCategory pc ON pc.postId = p.id JOIN Category c ON c.id = pc.categoryId' : '') + (tag ? ' JOIN PostTag pt ON pt.postId = p.id JOIN Tag t ON t.id = pt.tagId' : '') + ' WHERE p.type = ? AND p.status = ? AND (p.publishedAt IS NULL OR p.publishedAt <= ?)' + (req.siteId ? ' AND (p.siteId IS NULL OR p.siteId = ?)' : '') + (search ? ' AND (p.title LIKE ? OR p.content LIKE ? OR p.excerpt LIKE ?)' : '') + (category ? ' AND c.slug = ?' : '') + (tag ? ' AND t.slug = ?' : '');
    const countParams: any[] = [type, 'published', now];
    if (req.siteId) countParams.push(req.siteId);
    if (search) countParams.push('%' + search + '%', '%' + search + '%', '%' + search + '%');
    if (category) countParams.push(category);
    if (tag) countParams.push(tag);
    const total = (db.prepare(countSql).get(...countParams) as any)?.cnt || 0;
    const posts = postsData.map(enrichPost);
    posts.forEach((p: any) => { p.content = renderCmsBlocks(applyShortcodes(applyFilters('post_content', p.content || '', p), p)); });
    res.json({ posts, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Search suggestions for the search widget autocomplete (lightweight, no content)
router.get('/suggest', (req: AuthRequest, res: Response) => {
  try {
    const q = String(req.query.q || '').trim().slice(0, 60);
    if (!q) { res.json({ suggestions: [] }); return; }
    const like = '%' + q + '%';
    const rows = db.prepare("SELECT id, title, slug, type, publishedAt FROM Post WHERE type IN ('post','page') AND status = 'published' AND (title LIKE ? OR slug LIKE ?) ORDER BY CASE WHEN title LIKE ? THEN 0 ELSE 1 END, publishedAt DESC LIMIT 6").all(like, like, like) as any[];
    res.json({ suggestions: rows.map((p: any) => ({ id: p.id, title: p.title, slug: p.slug, type: p.type, date: p.publishedAt })) });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.get('/slug/:slug', (req: AuthRequest & SiteRequest, res: Response) => {
  try {
    const post = (req.siteId
      ? db.prepare('SELECT * FROM Post WHERE slug = ? AND type = ? AND (siteId IS NULL OR siteId = ?)').get(req.params.slug, 'post', req.siteId)
      : db.prepare('SELECT * FROM Post WHERE slug = ? AND type = ?').get(req.params.slug, 'post')) as any;
    if (!post) { res.status(404).json({ error: 'Post not found' }); return; }
    // WordPress-style password protection: cookie (hashed) unlocks the post.
    // Admins/editors bypass.
    if (post.password && (!req.user || !['admin', 'editor'].includes(req.user.role))) {
      const raw = String(req.headers.cookie || '');
      const m = raw.match(new RegExp('mortar_post_pass_' + post.id + '=([^;]+)'));
      const cookieVal = m ? decodeURIComponent(m[1]) : null;
      const expected = crypto.createHash('sha256').update(post.id + ':' + post.password).digest('hex');
      if (cookieVal !== expected) {
        const safe = { id: post.id, title: post.title, slug: post.slug, status: post.status, protected: true };
        res.json(safe);
        return;
      }
    }
    if (post.status !== 'published') {
      // Non-published posts (draft/private/trash) are only visible to
      // admins/editors or the author themselves — never to other logged-in
      // users or anonymous visitors.
      const canView = req.user && (['admin', 'editor'].includes(req.user.role) || (req.user.userId && req.user.userId === post.authorId));
      if (!canView) { res.status(404).json({ error: 'Post not found' }); return; }
    }
    db.prepare('UPDATE Post SET views = views + 1 WHERE id = ?').run(post.id);
    const enriched = enrichPost(post);
    // Never expose the protection password to the public API
    enriched.hasPassword = !!post.password;
    delete enriched.password;
    enriched.content = renderCmsBlocks(applyShortcodes(applyFilters('post_content', enriched.content || '', enriched), enriched));
    res.json(enriched);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Verify a password for a protected post; on success set an httpOnly cookie
// (WordPress-style wp-postpass behaviour, matching the page flow).
router.post('/slug/:slug/password', passwordLimiter, (req: AuthRequest, res: Response) => {
  try {
    const post = db.prepare('SELECT id, password FROM Post WHERE slug = ? AND type = ?').get(req.params.slug, 'post') as any;
    if (!post || !post.password) { res.status(404).json({ error: 'Post not found' }); return; }
    const submitted = String((req.body || {}).password || '');
    if (post.password !== submitted) { res.status(401).json({ error: 'wrong_password' }); return; }
    const hash = crypto.createHash('sha256').update(post.id + ':' + post.password).digest('hex');
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


// Public: popular posts by views
router.get('/popular', (req: AuthRequest & SiteRequest, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 5;
    const now = new Date().toISOString();
    const posts = db.prepare('SELECT * FROM Post WHERE type = ? AND status = ? AND (publishedAt IS NULL OR publishedAt <= ?)' + (req.siteId ? ' AND (siteId IS NULL OR siteId = ?)' : '') + ' ORDER BY views DESC, publishedAt DESC LIMIT ?').all(...(req.siteId ? ['post', 'published', now, req.siteId, limit] : ['post', 'published', now, limit])) as any[];
    res.json(posts.map(enrichPost));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Public: posts by author

// Public: monthly archive
router.get('/archive/:year/:month', (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const y = req.params.year;
    const m = req.params.month.padStart(2, '0');
    const now = new Date().toISOString();
    const where = 'p.type = ? AND p.status = ? AND strftime("%Y-%m", p.publishedAt) = ? AND (p.publishedAt IS NULL OR p.publishedAt <= ?)';
    const ym = y + '-' + m;
    const posts = db.prepare('SELECT DISTINCT p.* FROM Post p WHERE ' + where + ' ORDER BY p.sticky DESC, p.publishedAt DESC LIMIT ? OFFSET ?').all('post', 'published', ym, now, limit, (page - 1) * limit) as any[];
    const total = (db.prepare('SELECT COUNT(DISTINCT p.id) as cnt FROM Post p WHERE ' + where).get('post', 'published', ym, now) as any)?.cnt || 0;
    res.json({ posts: posts.map(enrichPost), total, page, totalPages: Math.ceil(total / limit), archive: { year: y, month: m } });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Public: archive months list
router.get('/archives', (_req: AuthRequest, res: Response) => {
  try {
    const months = db.prepare("SELECT strftime('%Y-%m', publishedAt) as month, COUNT(*) as count FROM Post WHERE type = 'post' AND status = 'published' AND publishedAt IS NOT NULL GROUP BY month ORDER BY month DESC LIMIT 24").all() as any[];
    res.json(months);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.get('/author/:username', (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const author = db.prepare('SELECT id FROM User WHERE username = ?').get(req.params.username) as any;
    if (!author) { res.status(404).json({ error: 'Author not found' }); return; }
    const where = 'p.type = ? AND p.status = ? AND p.authorId = ? AND (p.publishedAt IS NULL OR p.publishedAt <= ?)';
    const posts = db.prepare('SELECT DISTINCT p.* FROM Post p WHERE ' + where + ' ORDER BY p.sticky DESC, p.publishedAt DESC LIMIT ? OFFSET ?').all('post', 'published', author.id, new Date().toISOString(), limit, (page - 1) * limit) as any[];
    const total = (db.prepare('SELECT COUNT(DISTINCT p.id) as cnt FROM Post p WHERE ' + where).get('post', 'published', author.id, new Date().toISOString()) as any)?.cnt || 0;
    res.json({ posts: posts.map(enrichPost), total, page, totalPages: Math.ceil(total / limit), author: { username: req.params.username } });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.get('/admin', authenticate, authorize('admin', 'editor', 'author'), (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string;
    const search = (req.query.search as string) || '';
    // Sort columns are whitelisted (never concatenate raw query input into SQL)
    const sortCols: Record<string, string> = { title: 'title', createdAt: 'createdAt', views: 'views' };
    const sortCol = sortCols[(req.query.sortBy as string) || 'createdAt'] || 'createdAt';
    const sortDir = req.query.sortDir === 'asc' ? 'ASC' : 'DESC';
    let sql = 'SELECT * FROM Post WHERE type = ?';
    const params: any[] = ['post'];
    if (req.user!.role === 'author') { sql += ' AND authorId = ?'; params.push(req.user!.userId); }
    if (status) { sql += ' AND status = ?'; params.push(status); }
    if (search) { sql += ' AND title LIKE ?'; params.push('%' + search + '%'); }
    sql += ' ORDER BY sticky DESC, ' + sortCol + ' ' + sortDir + ' LIMIT ? OFFSET ?';
    params.push(limit, (page - 1) * limit);
    const postsData = db.prepare(sql).all(...params) as any[];
    const cntSql = 'SELECT COUNT(*) as cnt FROM Post WHERE type = ?' + (req.user!.role === 'author' ? ' AND authorId = ?' : '') + (status ? ' AND status = ?' : '') + (search ? ' AND title LIKE ?' : '');
    const cntParams: any[] = ['post'];
    if (req.user!.role === 'author') cntParams.push(req.user!.userId);
    if (status) cntParams.push(status);
    if (search) cntParams.push('%' + search + '%');
    const total = (db.prepare(cntSql).get(...cntParams) as any)?.cnt || 0;
    res.json({ posts: postsData.map(enrichPost), total, page, totalPages: Math.ceil(total / limit) });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.post('/', authenticate, authorize('admin', 'editor', 'author', 'contributor'), (req: AuthRequest, res: Response) => {
  try {
    const data = postSchema.parse(req.body);
    // Contributors submit drafts only (an editor publishes later), like WP
    const status = req.user!.role === 'contributor' ? 'draft' : (data.status || 'draft');
    const allSlugs = (db.prepare('SELECT slug FROM Post WHERE type = ?').all('post') as any[]).map((s: any) => s.slug);
    const slug = uniqueSlug(data.title, allSlugs);
    const id = cuid();
    const now = new Date().toISOString();
    db.prepare('INSERT INTO Post (id, title, slug, content, excerpt, status, featured, password, authorId, parentId, menuOrder, publishedAt, siteId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(id, data.title, slug, data.content || '', data.excerpt || '', status, data.featured || null, data.password || '', req.user!.userId, data.parentId || null, data.menuOrder || 0, status === 'published' ? now : null, data.siteId || null);
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
        db.prepare('INSERT INTO PostMeta (id, postId, key, value) VALUES (?, ?, ?, ?)').run(cuid(), id, key, key === '_visual_css' ? sanitizeVisualCss(value) : value);
      }
    }
    const post = db.prepare('SELECT * FROM Post WHERE id = ?').get(id) as any;
    doAction('post_created', id, status);
    if (status === 'published') doAction('post_published', id);
    res.status(201).json(enrichPost(post));
  } catch (err: any) { if (err instanceof z.ZodError) { res.status(400).json({ error: err.errors }); return; } res.status(500).json({ error: err.message }); }
});

router.put('/:id', authenticate, authorize('admin', 'editor', 'author', 'contributor'), (req: AuthRequest, res: Response) => {
  try {
    const existing = db.prepare('SELECT * FROM Post WHERE id = ?').get(req.params.id) as any;
    if (!existing) { res.status(404).json({ error: 'Post not found' }); return; }
    if ((req.user!.role === 'author' || req.user!.role === 'contributor') && existing.authorId !== req.user!.userId) { res.status(403).json({ error: 'Cannot edit another user\'s post' }); return; }
    const data = postSchema.partial().parse(req.body);
    // Contributors may never publish (or unpublish) their drafts
    if (req.user!.role === 'contributor' && data.status !== undefined && data.status !== 'draft') { res.status(403).json({ error: 'Contributors can only keep posts as drafts' }); return; }
    const sets: string[] = []; const vals: any[] = [];
    if (data.title !== undefined) { sets.push('title = ?'); vals.push(data.title); }
    if (data.content !== undefined) { sets.push('content = ?'); vals.push(data.content); }
    if (data.excerpt !== undefined) { sets.push('excerpt = ?'); vals.push(data.excerpt); }
    if (data.status !== undefined) { sets.push('status = ?'); vals.push(data.status); if (data.status === 'published' && !existing.publishedAt) { sets.push('publishedAt = ?'); vals.push(new Date().toISOString()); } }
    if (data.featured !== undefined) { sets.push('featured = ?'); vals.push(data.featured); }
    if (data.menuOrder !== undefined) { sets.push('menuOrder = ?'); vals.push(data.menuOrder); }
    if (data.password !== undefined) { sets.push('password = ?'); vals.push(data.password); }
    if (data.siteId !== undefined) { sets.push('siteId = ?'); vals.push(data.siteId || null); }
    if (data.categoryIds) { db.prepare('DELETE FROM PostCategory WHERE postId = ?').run(req.params.id); for (const cid of data.categoryIds) db.prepare('INSERT OR IGNORE INTO PostCategory (postId, categoryId) VALUES (?, ?)').run(req.params.id, cid); }
    if (data.tagIds) { db.prepare('DELETE FROM PostTag WHERE postId = ?').run(req.params.id); for (const tid of data.tagIds) db.prepare('INSERT OR IGNORE INTO PostTag (postId, tagId) VALUES (?, ?)').run(req.params.id, tid); }
    if (data.meta) {
      db.prepare('DELETE FROM PostMeta WHERE postId = ?').run(req.params.id);
      for (const [key, value] of Object.entries(data.meta)) {
        db.prepare('INSERT INTO PostMeta (id, postId, key, value) VALUES (?, ?, ?, ?)').run(cuid(), req.params.id, key, key === '_visual_css' ? sanitizeVisualCss(value) : value);
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
    const post = db.prepare('SELECT * FROM Post WHERE id = ?').get(req.params.id) as any;
    doAction('post_updated', req.params.id);
    if (data.status === 'published' && existing.status !== 'published') doAction('post_published', req.params.id);
    res.json(enrichPost(post));
  } catch (err: any) { if (err instanceof z.ZodError) { res.status(400).json({ error: err.errors }); return; } res.status(500).json({ error: err.message }); }
});

router.delete('/:id', authenticate, authorize('admin', 'editor', 'author'), (req: AuthRequest, res: Response) => {
  try {
    const existing = db.prepare('SELECT * FROM Post WHERE id = ?').get(req.params.id) as any;
    if (!existing) { res.status(404).json({ error: 'Post not found' }); return; }
    if (req.user!.role === 'author' && existing.authorId !== req.user!.userId) { res.status(403).json({ error: 'Cannot delete another author\'s post' }); return; }
    doAction('delete_post', req.params.id);
    db.prepare('DELETE FROM Post WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: restore from trash
router.put('/:id/restore', authenticate, authorize('admin', 'editor'), (req: AuthRequest, res: Response) => {
  try {
    const existing = db.prepare('SELECT * FROM Post WHERE id = ?').get(req.params.id) as any;
    if (!existing) { res.status(404).json({ error: 'Post not found' }); return; }
    db.prepare('UPDATE Post SET status = ?, updatedAt = ? WHERE id = ?').run('draft', new Date().toISOString(), req.params.id);
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: bulk trash
router.post('/bulk-trash', authenticate, authorize('admin', 'editor'), (req: AuthRequest, res: Response) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) { res.status(400).json({ error: 'ids array required' }); return; }
    const stmt = db.prepare('UPDATE Post SET status = ?, updatedAt = ? WHERE id = ?');
    const now = new Date().toISOString();
    for (const id of ids) stmt.run('trash', now, id);
    res.json({ success: true, count: ids.length });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: bulk restore trashed posts
router.post('/bulk-restore', authenticate, authorize('admin', 'editor'), (req: AuthRequest, res: Response) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) { res.status(400).json({ error: 'ids array required' }); return; }
    const stmt = db.prepare("UPDATE Post SET status = 'draft', updatedAt = ? WHERE id = ? AND status = 'trash'");
    const now = new Date().toISOString();
    let restored = 0;
    for (const id of ids) restored += stmt.run(now, id).changes;
    res.json({ success: true, restored });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: bulk change status (e.g. publish / draft a selection at once)
router.post('/bulk-status', authenticate, authorize('admin', 'editor'), (req: AuthRequest, res: Response) => {
  try {
    const { ids, status } = req.body || {};
    if (!ids || !Array.isArray(ids) || ids.length === 0 || !status) { res.status(400).json({ error: 'ids and status required' }); return; }
    const valid = ['draft', 'published', 'private', 'pending', 'trash'];
    if (!valid.includes(status)) { res.status(400).json({ error: 'invalid status' }); return; }
    const stmt = db.prepare("UPDATE Post SET status = ?, publishedAt = CASE WHEN ? = 'published' THEN COALESCE(publishedAt, ?) ELSE publishedAt END, updatedAt = ? WHERE id = ?");
    const now = new Date().toISOString();
    let updated = 0;
    for (const id of ids) updated += stmt.run(status, status, now, now, id).changes;
    res.json({ success: true, updated });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: bulk permanently delete trashed posts
router.post('/bulk-delete', authenticate, authorize('admin', 'editor'), (req: AuthRequest, res: Response) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) { res.status(400).json({ error: 'ids array required' }); return; }
    const stmt = db.prepare("DELETE FROM Post WHERE id = ? AND status = 'trash'");
    let deleted = 0;
    for (const id of ids) deleted += stmt.run(id).changes;
    res.json({ success: true, deleted });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: toggle sticky
router.put('/:id/sticky', authenticate, authorize('admin', 'editor'), (req: AuthRequest, res: Response) => {
  try {
    const existing = db.prepare('SELECT id, sticky FROM Post WHERE id = ?').get(req.params.id) as any;
    if (!existing) { res.status(404).json({ error: 'Post not found' }); return; }
    const newSticky = existing.sticky ? 0 : 1;
    db.prepare('UPDATE Post SET sticky = ? WHERE id = ?').run(newSticky, req.params.id);
    res.json({ sticky: newSticky });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: get revisions for a post
router.get('/:id/revisions', authenticate, authorize('admin', 'editor', 'author'), (req: AuthRequest, res: Response) => {
  try {
    const existing = db.prepare('SELECT authorId FROM Post WHERE id = ?').get(req.params.id) as any;
    if (!existing) { res.status(404).json({ error: 'Post not found' }); return; }
    if (req.user!.role === 'author' && existing.authorId !== req.user!.userId) { res.status(403).json({ error: 'Cannot view another author\'s revisions' }); return; }
    const revisions = db.prepare('SELECT id, title, content, excerpt, createdAt FROM Revision WHERE postId = ? ORDER BY createdAt DESC LIMIT 20').all(req.params.id) as any[];
    res.json(revisions);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: restore a revision (writes back to post, keeps a new revision of the overwritten state)
router.put('/:id/revisions/:revId/restore', authenticate, authorize('admin', 'editor', 'author'), (req: AuthRequest, res: Response) => {
  try {
    const rev = db.prepare('SELECT * FROM Revision WHERE id = ? AND postId = ?').get(req.params.revId, req.params.id) as any;
    if (!rev) { res.status(404).json({ error: 'Revision not found' }); return; }
    const post = db.prepare('SELECT * FROM Post WHERE id = ?').get(req.params.id) as any;
    if (!post) { res.status(404).json({ error: 'Post not found' }); return; }
    if (req.user!.role === 'author' && post.authorId !== req.user!.userId) { res.status(403).json({ error: 'Cannot restore another author\'s revisions' }); return; }
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
router.get('/:id/related', (req: AuthRequest, res: Response) => {
  try {
    const catIds = (db.prepare('SELECT categoryId FROM PostCategory WHERE postId = ?').all(req.params.id) as any[]).map((r: any) => r.categoryId);
    if (catIds.length === 0) { res.json([]); return; }
    const placeholders = catIds.map(() => '?').join(',');
    const now = new Date().toISOString();
    const posts = db.prepare(
      'SELECT DISTINCT p.* FROM Post p JOIN PostCategory pc ON pc.postId = p.id WHERE pc.categoryId IN (' + placeholders + ') AND p.id != ? AND p.type = ? AND p.status = ? AND (p.publishedAt IS NULL OR p.publishedAt <= ?) ORDER BY p.publishedAt DESC LIMIT 4'
    ).all(...catIds, req.params.id, 'post', 'published', now) as any[];
    res.json(posts.map(enrichPost));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: lock post for editing
router.post('/:id/lock', authenticate, authorize('admin', 'editor', 'author'), (req: AuthRequest, res: Response) => {
  try {
    const existing = db.prepare('SELECT id, lockedAt, lockedBy FROM Post WHERE id = ?').get(req.params.id) as any;
    if (!existing) { res.status(404).json({ error: 'Post not found' }); return; }
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
router.post('/:id/unlock', authenticate, authorize('admin', 'editor'), (req: AuthRequest, res: Response) => {
  try {
    db.prepare('UPDATE Post SET lockedAt = ?, lockedBy = ? WHERE id = ?').run('', '', req.params.id);
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: clone/duplicate a post
router.post('/:id/clone', authenticate, authorize('admin', 'editor', 'author'), (req: AuthRequest, res: Response) => {
  try {
    const existing = db.prepare('SELECT * FROM Post WHERE id = ?').get(req.params.id) as any;
    if (!existing) { res.status(404).json({ error: 'Post not found' }); return; }
    if (req.user!.role === 'author' && existing.authorId !== req.user!.userId) { res.status(403).json({ error: 'Cannot clone another author\'s post' }); return; }
    const id = cuid();
    const now = new Date().toISOString();
    db.prepare('INSERT INTO Post (id, title, slug, content, excerpt, status, type, featured, password, format, authorId, parentId, menuOrder, sticky) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(
      id, existing.title + ' (Copy)', existing.slug + '-copy', existing.content, existing.excerpt, 'draft', existing.type, existing.featured, '', existing.format || 'standard', req.user!.userId, null, existing.menuOrder, 0
    );
    // Copy categories
    const cats = db.prepare('SELECT categoryId FROM PostCategory WHERE postId = ?').all(req.params.id) as any[];
    for (const c of cats) db.prepare('INSERT OR IGNORE INTO PostCategory (postId, categoryId) VALUES (?, ?)').run(id, c.categoryId);
    // Copy tags
    const tags = db.prepare('SELECT tagId FROM PostTag WHERE postId = ?').all(req.params.id) as any[];
    for (const t of tags) db.prepare('INSERT OR IGNORE INTO PostTag (postId, tagId) VALUES (?, ?)').run(id, t.tagId);
    res.status(201).json(db.prepare('SELECT * FROM Post WHERE id = ?').get(id));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;
