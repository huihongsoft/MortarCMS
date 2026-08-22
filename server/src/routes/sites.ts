import { Router, Response } from 'express';
import db, { cuid } from '../utils/db';
import { authenticate, requireCap, authorize, AuthRequest } from '../middleware/auth';
import { SiteRequest } from '../middleware/site';

const router = Router();

// Public: current site info (resolved from Host header)
router.get('/current', (req: SiteRequest, res: Response) => {
  try {
    const site = req.site || db.prepare('SELECT * FROM Site WHERE isPrimary = 1 LIMIT 1').get() as any;
    if (!site) { res.json({ single: true, id: null }); return; }
    const overrides = db.prepare('SELECT key, value FROM SiteSetting WHERE siteId = ?').all(site.id) as any[];
    const settings: Record<string, string> = {};
    overrides.forEach((s: any) => { settings[s.key] = s.value; });
    res.json({ id: site.id, name: site.name, slug: site.slug, domain: site.domain, description: site.description, isPrimary: site.isPrimary, settings });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: list all sites with per-site content stats
router.get('/', authenticate, authorize('admin'), (_req: AuthRequest, res: Response) => {
  try {
    const sites = db.prepare('SELECT * FROM Site ORDER BY isPrimary DESC, createdAt ASC').all() as any[];
    const countBySite = (table: string, siteId: string, type?: string): number => {
      const row = db.prepare(`SELECT COUNT(*) as c FROM ${table} WHERE siteId = ?${type ? ' AND type = ?' : ''}`).get(siteId, ...(type ? [type] : [])) as any;
      return row?.c || 0;
    };
    const countGlobal = (table: string, type?: string): number => {
      const row = db.prepare(`SELECT COUNT(*) as c FROM ${table} WHERE siteId IS NULL${type ? ' AND type = ?' : ''}`).get(...(type ? [type] : [])) as any;
      return row?.c || 0;
    };
    const stats = sites.map((s: any) => ({
      posts: countBySite('Post', s.id, 'post'),
      pages: countBySite('Post', s.id, 'page'),
      comments: countBySite('Comment', s.id),
      media: countBySite('Media', s.id),
      menus: countBySite('Menu', s.id),
    }));
    const global = {
      posts: countGlobal('Post', 'post'),
      pages: countGlobal('Post', 'page'),
      comments: countGlobal('Comment'),
      media: countGlobal('Media'),
      menus: countGlobal('Menu'),
    };
    res.json({ sites: sites.map((s: any, i: number) => ({ ...s, stats: stats[i] })), global });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: create site
router.post('/', authenticate, authorize('admin'), (req: AuthRequest, res: Response) => {
  try {
    const { name, slug, domain, description } = req.body || {};
    if (!name || !slug || !domain) { res.status(400).json({ error: 'name, slug and domain required' }); return; }
    const exists = db.prepare('SELECT id FROM Site WHERE slug = ? OR domain = ?').get(slug, domain);
    if (exists) { res.status(400).json({ error: 'Site with this slug or domain already exists' }); return; }
    const hasPrimary = db.prepare('SELECT COUNT(*) as c FROM Site WHERE isPrimary = 1').get() as any;
    const id = cuid();
    db.prepare('INSERT INTO Site (id, name, slug, domain, description, active, isPrimary) VALUES (?, ?, ?, ?, ?, 1, ?)').run(
      id, name, slug, domain.replace(/^https?:\/\//, '').replace(/\/$/, '').toLowerCase(), description || '', hasPrimary.c === 0 ? 1 : 0
    );
    res.status(201).json(db.prepare('SELECT * FROM Site WHERE id = ?').get(id));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: update site
router.put('/:id', authenticate, authorize('admin'), (req: AuthRequest, res: Response) => {
  try {
    const existing = db.prepare('SELECT * FROM Site WHERE id = ?').get(req.params.id) as any;
    if (!existing) { res.status(404).json({ error: 'Site not found' }); return; }
    const { name, slug, domain, description, active } = req.body || {};
    const sets: string[] = []; const vals: any[] = [];
    if (name !== undefined) { sets.push('name = ?'); vals.push(name); }
    if (slug !== undefined) { sets.push('slug = ?'); vals.push(slug); }
    if (domain !== undefined) { sets.push('domain = ?'); vals.push(domain.replace(/^https?:\/\//, '').replace(/\/$/, '').toLowerCase()); }
    if (description !== undefined) { sets.push('description = ?'); vals.push(description); }
    if (active !== undefined) { sets.push('active = ?'); vals.push(active ? 1 : 0); }
    if (sets.length > 0) { vals.push(req.params.id); db.prepare('UPDATE Site SET ' + sets.join(', ') + ' WHERE id = ?').run(...vals); }
    res.json(db.prepare('SELECT * FROM Site WHERE id = ?').get(req.params.id));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: set site as primary
router.post('/:id/primary', authenticate, authorize('admin'), (req: AuthRequest, res: Response) => {
  try {
    const existing = db.prepare('SELECT id FROM Site WHERE id = ?').get(req.params.id) as any;
    if (!existing) { res.status(404).json({ error: 'Site not found' }); return; }
    db.prepare('UPDATE Site SET isPrimary = 0').run();
    db.prepare('UPDATE Site SET isPrimary = 1 WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: read site settings overrides
router.get('/:id/settings', authenticate, authorize('admin'), (req: SiteRequest, res: Response) => {
  try {
    const existing = db.prepare('SELECT id FROM Site WHERE id = ?').get(req.params.id) as any;
    if (!existing) { res.status(404).json({ error: 'Site not found' }); return; }
    const overrides = db.prepare('SELECT key, value FROM SiteSetting WHERE siteId = ?').all(req.params.id) as any[];
    const map: Record<string, string> = {};
    overrides.forEach((s: any) => { map[s.key] = s.value; });
    res.json(map);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: site settings overrides
router.put('/:id/settings', authenticate, authorize('admin'), (req: SiteRequest, res: Response) => {
  try {
    const existing = db.prepare('SELECT id FROM Site WHERE id = ?').get(req.params.id) as any;
    if (!existing) { res.status(404).json({ error: 'Site not found' }); return; }
    const entries = req.body as Record<string, string>;
    const upsert = db.prepare('INSERT INTO SiteSetting (siteId, key, value) VALUES (?, ?, ?) ON CONFLICT(siteId, key) DO UPDATE SET value = excluded.value');
    for (const [key, value] of Object.entries(entries)) upsert.run(req.params.id, key, String(value));
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: content assignable to a site (posts/pages/media/comments with their current siteId)
router.get('/:id/content', authenticate, authorize('admin'), (req: AuthRequest, res: Response) => {
  try {
    const existing = db.prepare('SELECT id FROM Site WHERE id = ?').get(req.params.id) as any;
    if (!existing) { res.status(404).json({ error: 'Site not found' }); return; }
    const list = (table: string, type?: string): any[] => {
      const rows = db.prepare(`SELECT id, title, siteId FROM ${table}${type ? ' WHERE type = ?' : ''} ORDER BY createdAt DESC LIMIT 300`).all(...(type ? [type] : [])) as any[];
      return rows.map((r: any) => ({ id: r.id, title: r.title, siteId: r.siteId || null }));
    };
    res.json({
      posts: list('Post', 'post'),
      pages: list('Post', 'page'),
      media: list('Media'),
      comments: db.prepare('SELECT id, content as title, siteId FROM Comment ORDER BY createdAt DESC LIMIT 300').all(),
    });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: assign content to this site
router.post('/:id/content/assign', authenticate, authorize('admin'), (req: AuthRequest, res: Response) => {
  try {
    const existing = db.prepare('SELECT id FROM Site WHERE id = ?').get(req.params.id) as any;
    if (!existing) { res.status(404).json({ error: 'Site not found' }); return; }
    const { type, ids } = req.body || {};
    const tableMap: Record<string, string> = { post: 'Post', page: 'Post', media: 'Media', comment: 'Comment' };
    const table = tableMap[type as string];
    if (!table || !Array.isArray(ids) || ids.length === 0) { res.status(400).json({ error: 'type (post|page|media|comment) and non-empty ids required' }); return; }
    db.prepare(`UPDATE ${table} SET siteId = ? WHERE id IN (${ids.map(() => '?').join(',')})`).run(req.params.id, ...ids);
    res.json({ success: true, assigned: ids.length });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: make content global (visible on every site)
router.post('/:id/content/global', authenticate, authorize('admin'), (req: AuthRequest, res: Response) => {
  try {
    const { type, ids } = req.body || {};
    const tableMap: Record<string, string> = { post: 'Post', page: 'Post', media: 'Media', comment: 'Comment' };
    const table = tableMap[type as string];
    if (!table || !Array.isArray(ids) || ids.length === 0) { res.status(400).json({ error: 'type (post|page|media|comment) and non-empty ids required' }); return; }
    db.prepare(`UPDATE ${table} SET siteId = NULL WHERE id IN (${ids.map(() => '?').join(',')})`).run(...ids);
    res.json({ success: true, global: ids.length });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: duplicate a site (row + settings overrides + menus with fresh ids)
router.post('/:id/duplicate', authenticate, authorize('admin'), (req: AuthRequest, res: Response) => {
  try {
    const src = db.prepare('SELECT * FROM Site WHERE id = ?').get(req.params.id) as any;
    if (!src) { res.status(404).json({ error: 'Site not found' }); return; }
    const suffix = '-' + Date.now().toString(36).slice(-4);
    const id = cuid();
    const name = (req.body?.name || src.name) + ' (copy)';
    const slug = (req.body?.slug || src.slug) + suffix;
    const domain = (req.body?.domain || src.domain) + suffix;
    db.prepare('INSERT INTO Site (id, name, slug, domain, description, active, isPrimary) VALUES (?, ?, ?, ?, ?, ?, 0)').run(
      id, name, slug, domain.replace(/^https?:\/\//, '').replace(/\/$/, '').toLowerCase(), src.description || '', src.active || 0
    );
    // Copy settings overrides
    const upsert = db.prepare('INSERT INTO SiteSetting (siteId, key, value) VALUES (?, ?, ?)');
    for (const row of db.prepare('SELECT key, value FROM SiteSetting WHERE siteId = ?').all(src.id) as any[]) {
      upsert.run(id, row.key, row.value);
    }
    // Copy menus (new ids so locations don't collide)
    for (const m of db.prepare('SELECT * FROM Menu WHERE siteId = ?').all(src.id) as any[]) {
      db.prepare('INSERT INTO Menu (id, name, location, items, siteId) VALUES (?, ?, ?, ?, ?)').run(cuid(), m.name, m.location, m.items, id);
    }
    res.status(201).json(db.prepare('SELECT * FROM Site WHERE id = ?').get(id));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: delete site
router.delete('/:id', authenticate, authorize('admin'), (req: AuthRequest, res: Response) => {
  try {
    const existing = db.prepare('SELECT * FROM Site WHERE id = ?').get(req.params.id) as any;
    if (!existing) { res.status(404).json({ error: 'Site not found' }); return; }
    if (existing.isPrimary === 1) { res.status(400).json({ error: 'Cannot delete the primary site' }); return; }
    db.prepare('DELETE FROM Site WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;
