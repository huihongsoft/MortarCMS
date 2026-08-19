import { Router, Response } from 'express';
import db, { cuid } from '../utils/db';
import { authenticate, requireCap, AuthRequest } from '../middleware/auth';
import { SiteRequest } from '../middleware/site';
import { verifyToken } from '../utils/jwt';
import { slugify } from '../utils/slug';

const router = Router();

// Batch enrichment: one query per relation for the whole list
function enrichLinks(links: any[]): any[] {
  if (links.length === 0) return links;
  const ids = links.map((l: any) => l.id);
  const qmarks = ids.map(() => '?').join(',');
  // Categories (query by the links' categoryId, not the link ids)
  const cats = new Map<string, any>();
  const catIds = [...new Set(links.map((l: any) => l.categoryId).filter(Boolean))];
  if (catIds.length) {
    const cq = catIds.map(() => '?').join(',');
    (db.prepare('SELECT * FROM LinkCategory WHERE id IN (' + cq + ')').all(...catIds) as any[])
      .forEach((c: any) => cats.set(c.id, c));
  }
  // Associated posts (title + slug for navigation links)
  const postsByLink = new Map<string, any[]>();
  (db.prepare('SELECT lp.linkId, p.id, p.title, p.slug FROM LinkPost lp JOIN Post p ON p.id = lp.postId WHERE lp.linkId IN (' + qmarks + ') ORDER BY p.createdAt DESC').all(...ids) as any[])
    .forEach((r: any) => { if (!postsByLink.has(r.linkId)) postsByLink.set(r.linkId, []); postsByLink.get(r.linkId)!.push({ id: r.id, title: r.title, slug: r.slug }); });
  // Linked page title
  const pages = new Map<string, any>();
  const pageIds = links.map((l: any) => l.pageId).filter(Boolean);
  if (pageIds.length) {
    const pq = pageIds.map(() => '?').join(',');
    (db.prepare('SELECT id, title, slug FROM Post WHERE id IN (' + pq + ')').all(...pageIds) as any[])
      .forEach((p: any) => pages.set(p.id, p));
  }
  // Site names
  const sites = new Map<string, any>();
  const siteIds = links.map((l: any) => l.siteId).filter(Boolean);
  if (siteIds.length) {
    const sq = siteIds.map(() => '?').join(',');
    (db.prepare('SELECT id, name FROM Site WHERE id IN (' + sq + ')').all(...siteIds) as any[])
      .forEach((s: any) => sites.set(s.id, s));
  }
  links.forEach((l: any) => {
    l.category = l.categoryId ? cats.get(l.categoryId) || null : null;
    l.posts = postsByLink.get(l.id) || [];
    l.page = l.pageId ? pages.get(l.pageId) || null : null;
    l.site = l.siteId ? sites.get(l.siteId) || null : null;
  });
  return links;
}

// Public: all links (ordered by category, then menuOrder). Anonymous
// visitors get only the current site's links plus global ones (siteId IS
// NULL = visible everywhere, same semantics as posts); admins see all.
router.get('/', (req: AuthRequest & SiteRequest, res: Response) => {
  try {
    let sql = 'SELECT l.* FROM Link l LEFT JOIN LinkCategory c ON c.id = l.categoryId';
    const params: any[] = [];
    if (req.siteId && !isAdminReq(req)) {
      // Public visitors: active links only, visible when the link's own
      // siteId matches (or is global) — and a link WITHOUT a siteId inherits
      // its category's site ownership
      sql += " WHERE l.active = 1 AND ((l.siteId IS NULL AND (c.siteId IS NULL OR c.siteId = ?)) OR l.siteId = ?)";
      params.push(req.siteId, req.siteId);
    }
    sql += ' ORDER BY l.categoryId ASC, l.menuOrder ASC, l.createdAt ASC';
    const links = db.prepare(sql).all(...params) as any[];
    res.json(enrichLinks(links));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// A valid Bearer token means an admin request (management view shows all
// sites' links); anything else is a public visitor filtered by site.
function isAdminReq(req: AuthRequest): boolean {
  if (req.user) return true;
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return false;
  return !!verifyToken(header.slice(7));
}

// Admin: create link
router.post('/', authenticate, requireCap('manage_options'), (req: AuthRequest, res: Response) => {
  try {
    const { name, url, description, avatar, icon, categoryId, siteId, pageId, menuOrder, active } = req.body || {};
    if (!name || !url) { res.status(400).json({ error: 'name and url required' }); return; }
    const id = cuid();
    db.prepare('INSERT INTO Link (id, name, url, description, avatar, icon, categoryId, siteId, pageId, menuOrder, active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .run(id, name, url, description || '', avatar || '', icon || '', categoryId || null, siteId || null, pageId || null, menuOrder || 0, active === false ? 0 : 1);
    // Link-post associations
    const postIds = Array.isArray(req.body?.postIds) ? req.body.postIds : [];
    for (const pid of postIds) db.prepare('INSERT OR IGNORE INTO LinkPost (linkId, postId) VALUES (?, ?)').run(id, pid);
    res.status(201).json(enrichLinks([db.prepare('SELECT * FROM Link WHERE id = ?').get(id)])[0]);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: update link
router.put('/:id', authenticate, requireCap('manage_options'), (req: AuthRequest, res: Response) => {
  try {
    const { name, url, description, avatar, icon, categoryId, siteId, pageId, menuOrder, active } = req.body || {};
    const sets: string[] = []; const vals: any[] = [];
    if (name !== undefined) { sets.push('name = ?'); vals.push(name); }
    if (url !== undefined) { sets.push('url = ?'); vals.push(url); }
    if (description !== undefined) { sets.push('description = ?'); vals.push(description); }
    if (avatar !== undefined) { sets.push('avatar = ?'); vals.push(avatar); }
    if (icon !== undefined) { sets.push('icon = ?'); vals.push(icon); }
    if (categoryId !== undefined) { sets.push('categoryId = ?'); vals.push(categoryId || null); }
    if (siteId !== undefined) { sets.push('siteId = ?'); vals.push(siteId || null); }
    if (pageId !== undefined) { sets.push('pageId = ?'); vals.push(pageId || null); }
    if (menuOrder !== undefined) { sets.push('menuOrder = ?'); vals.push(menuOrder || 0); }
    if (active !== undefined) { sets.push('active = ?'); vals.push(active === false ? 0 : 1); }
    if (sets.length > 0) { vals.push(req.params.id); db.prepare('UPDATE Link SET ' + sets.join(', ') + ' WHERE id = ?').run(...vals); }
    // Link-post associations (full replace)
    if (Array.isArray(req.body?.postIds)) {
      db.prepare('DELETE FROM LinkPost WHERE linkId = ?').run(req.params.id);
      for (const pid of req.body.postIds) db.prepare('INSERT OR IGNORE INTO LinkPost (linkId, postId) VALUES (?, ?)').run(req.params.id, pid);
    }
    res.json(enrichLinks([db.prepare('SELECT * FROM Link WHERE id = ?').get(req.params.id)])[0]);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: delete link
router.delete('/:id', authenticate, requireCap('manage_options'), (req: AuthRequest, res: Response) => {
  try { db.prepare('DELETE FROM Link WHERE id = ?').run(req.params.id); res.json({ success: true }); } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Public: count a click on a link (navigation-site usage)
router.post('/:id/click', (req: AuthRequest, res: Response) => {
  try { db.prepare('UPDATE Link SET clicks = clicks + 1 WHERE id = ?').run(req.params.id); res.json({ success: true }); } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// ---------- Link categories ----------

// Public: categories (with link counts)
router.get('/categories', (req: AuthRequest & SiteRequest, res: Response) => {
  try {
    let sql = 'SELECT * FROM LinkCategory';
    const params: any[] = [];
    if (req.siteId && !isAdminReq(req)) {
      sql += ' WHERE siteId IS NULL OR siteId = ?';
      params.push(req.siteId);
    }
    sql += ' ORDER BY menuOrder ASC, name ASC';
    const cats = db.prepare(sql).all(...params) as any[];
    const counts = new Map<string, number>();
    if (req.siteId && !isAdminReq(req)) {
      // Count only links this site can actually see (site + inheritance)
      (db.prepare("SELECT l.categoryId, COUNT(*) as cnt FROM Link l LEFT JOIN LinkCategory c ON c.id = l.categoryId WHERE l.categoryId IS NOT NULL AND l.active = 1 AND ((l.siteId IS NULL AND (c.siteId IS NULL OR c.siteId = ?)) OR l.siteId = ?) GROUP BY l.categoryId").all(req.siteId, req.siteId) as any[])
        .forEach((r: any) => counts.set(r.categoryId, r.cnt));
    } else {
      (db.prepare("SELECT categoryId, COUNT(*) as cnt FROM Link WHERE categoryId IS NOT NULL AND active = 1 GROUP BY categoryId").all() as any[])
        .forEach((r: any) => counts.set(r.categoryId, r.cnt));
    }
    cats.forEach((c: any) => { c.count = counts.get(c.id) || 0; });
    res.json(cats);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: create category
router.post('/categories', authenticate, requireCap('manage_options'), (req: AuthRequest, res: Response) => {
  try {
    const { name, description, menuOrder, siteId } = req.body || {};
    if (!name) { res.status(400).json({ error: 'name required' }); return; }
    const slug = slugify(name);
    const exists = db.prepare('SELECT id FROM LinkCategory WHERE slug = ?').get(slug);
    if (exists) { res.status(400).json({ error: 'Category already exists' }); return; }
    const id = cuid();
    db.prepare('INSERT INTO LinkCategory (id, name, slug, description, menuOrder, siteId) VALUES (?, ?, ?, ?, ?, ?)')
      .run(id, name, slug, description || '', menuOrder || 0, siteId || null);
    res.status(201).json(db.prepare('SELECT * FROM LinkCategory WHERE id = ?').get(id));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: update category
router.put('/categories/:id', authenticate, requireCap('manage_options'), (req: AuthRequest, res: Response) => {
  try {
    const { name, description, menuOrder, siteId } = req.body || {};
    const sets: string[] = []; const vals: any[] = [];
    if (name !== undefined) { sets.push('name = ?'); vals.push(name); sets.push('slug = ?'); vals.push(slugify(name)); }
    if (description !== undefined) { sets.push('description = ?'); vals.push(description); }
    if (menuOrder !== undefined) { sets.push('menuOrder = ?'); vals.push(menuOrder || 0); }
    if (siteId !== undefined) { sets.push('siteId = ?'); vals.push(siteId || null); }
    if (sets.length > 0) { vals.push(req.params.id); db.prepare('UPDATE LinkCategory SET ' + sets.join(', ') + ' WHERE id = ?').run(...vals); }
    res.json(db.prepare('SELECT * FROM LinkCategory WHERE id = ?').get(req.params.id));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: delete category (links keep existing, categoryId set null)
router.delete('/categories/:id', authenticate, requireCap('manage_options'), (req: AuthRequest, res: Response) => {
  try {
    db.prepare('UPDATE Link SET categoryId = NULL WHERE categoryId = ?').run(req.params.id);
    db.prepare('DELETE FROM LinkCategory WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;
