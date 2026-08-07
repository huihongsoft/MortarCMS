import { Router, Response } from 'express';
import db, { cuid } from '../utils/db';
import { authenticate, requireCap, AuthRequest } from '../middleware/auth';
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

// Admin: list all sites
router.get('/', authenticate, requireCap('manage_options'), (_req: AuthRequest, res: Response) => {
  try {
    const sites = db.prepare('SELECT * FROM Site ORDER BY isPrimary DESC, createdAt ASC').all() as any[];
    res.json(sites);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: create site
router.post('/', authenticate, requireCap('manage_options'), (req: AuthRequest, res: Response) => {
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
router.put('/:id', authenticate, requireCap('manage_options'), (req: AuthRequest, res: Response) => {
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
router.post('/:id/primary', authenticate, requireCap('manage_options'), (req: AuthRequest, res: Response) => {
  try {
    const existing = db.prepare('SELECT id FROM Site WHERE id = ?').get(req.params.id) as any;
    if (!existing) { res.status(404).json({ error: 'Site not found' }); return; }
    db.prepare('UPDATE Site SET isPrimary = 0').run();
    db.prepare('UPDATE Site SET isPrimary = 1 WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: read site settings overrides
router.get('/:id/settings', authenticate, requireCap('manage_options'), (req: SiteRequest, res: Response) => {
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
router.put('/:id/settings', authenticate, requireCap('manage_options'), (req: SiteRequest, res: Response) => {
  try {
    const existing = db.prepare('SELECT id FROM Site WHERE id = ?').get(req.params.id) as any;
    if (!existing) { res.status(404).json({ error: 'Site not found' }); return; }
    const entries = req.body as Record<string, string>;
    const upsert = db.prepare('INSERT INTO SiteSetting (siteId, key, value) VALUES (?, ?, ?) ON CONFLICT(siteId, key) DO UPDATE SET value = excluded.value');
    for (const [key, value] of Object.entries(entries)) upsert.run(req.params.id, key, String(value));
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: delete site
router.delete('/:id', authenticate, requireCap('manage_options'), (req: AuthRequest, res: Response) => {
  try {
    const existing = db.prepare('SELECT * FROM Site WHERE id = ?').get(req.params.id) as any;
    if (!existing) { res.status(404).json({ error: 'Site not found' }); return; }
    if (existing.isPrimary === 1) { res.status(400).json({ error: 'Cannot delete the primary site' }); return; }
    db.prepare('DELETE FROM Site WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;
