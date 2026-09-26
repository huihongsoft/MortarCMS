import { Router, Response } from 'express';
import db, { cuid, withTransaction } from '../utils/db';
import { authenticate, requireCap, resolveOptionalUser, AuthRequest } from '../middleware/auth';
import { isHiddenSettingKey } from '../utils/settingsVisibility';
import { SiteRequest, invalidateSiteCache } from '../middleware/site';
import { themeExists } from './themes';
import { purgeAllCaches } from '../utils/cache';

const router = Router();

// Public: current site info (resolved from Host header)
router.get('/current', (req: SiteRequest, res: Response) => {
  try {
    // Match resolveSite: an inactive site (even the primary) is not served.
    const site = req.site || db.prepare('SELECT * FROM Site WHERE isPrimary = 1 AND active = 1 LIMIT 1').get() as any;
    if (!site) { res.json({ single: true, id: null }); return; }
    const overrides = db.prepare('SELECT key, value FROM SiteSetting WHERE siteId = ?').all(site.id) as any[];
    // This endpoint is public (it backs the frontend's site bootstrap), so apply
    // the same key redaction as GET /api/settings — otherwise a credential
    // written into SiteSetting would leak here.
    const isAdmin = resolveOptionalUser(req)?.role === 'admin';
    const settings: Record<string, string> = {};
    overrides.forEach((s: any) => { if (!isHiddenSettingKey(s.key, isAdmin)) settings[s.key] = s.value; });
    res.json({ id: site.id, name: site.name, slug: site.slug, domain: site.domain, description: site.description, isPrimary: site.isPrimary, settings });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// List all sites with per-site content stats.
//
// Gated by `view_sites` (editors hold it) rather than `manage_sites`, because the
// post editor's site dropdown calls this: editors can already move a post between
// sites, so the list is not new information for them, while creating/removing
// sites stays behind `manage_sites`. Per-site settings (GET /:id) also stay
// admin-only.
router.get('/', authenticate, requireCap('view_sites', 'manage_sites'), (_req: AuthRequest, res: Response) => {
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
router.post('/', authenticate, requireCap('manage_sites'), (req: AuthRequest, res: Response) => {
  try {
    const { name, slug, domain, description } = req.body || {};
    if (!name || !slug || !domain) { res.status(400).json({ error: 'name, slug and domain required' }); return; }
    // Normalise BEFORE the uniqueness check: "ONE.test" and "https://one.test"
    // both become "one.test", and checking the raw value let them past the lookup
    // and into the table, where two sites then answer to the same host and
    // resolution depends on row order.
    const normDomain = String(domain).replace(/^https?:\/\//, '').replace(/\/$/, '').toLowerCase();
    const exists = db.prepare('SELECT id FROM Site WHERE slug = ? OR domain = ?').get(slug, normDomain);
    if (exists) { res.status(400).json({ error: 'Site with this slug or domain already exists' }); return; }
    const hasPrimary = db.prepare('SELECT COUNT(*) as c FROM Site WHERE isPrimary = 1').get() as any;
    const id = cuid();
    db.prepare('INSERT INTO Site (id, name, slug, domain, description, active, isPrimary) VALUES (?, ?, ?, ?, ?, 1, ?)').run(
      id, name, slug, normDomain, description || '', hasPrimary.c === 0 ? 1 : 0
    );
    invalidateSiteCache();
    res.status(201).json(db.prepare('SELECT * FROM Site WHERE id = ?').get(id));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: update site
router.put('/:id', authenticate, requireCap('manage_sites'), (req: AuthRequest, res: Response) => {
  try {
    const existing = db.prepare('SELECT * FROM Site WHERE id = ?').get(req.params.id) as any;
    if (!existing) { res.status(404).json({ error: 'Site not found' }); return; }
    const { name, slug, domain, description, active } = req.body || {};
    // Same normalisation and uniqueness rule as create: this route had no check
    // at all, so an edit could point a site at another site's domain (making host
    // resolution depend on row order).
    const normDomain = domain === undefined ? undefined : String(domain).replace(/^https?:\/\//, '').replace(/\/$/, '').toLowerCase();
    const clash = db.prepare('SELECT id FROM Site WHERE id != ? AND (slug = ? OR domain = ?)').get(
      req.params.id, slug === undefined ? existing.slug : slug, normDomain === undefined ? existing.domain : normDomain
    );
    if (clash) { res.status(400).json({ error: 'Site with this slug or domain already exists' }); return; }
    const sets: string[] = []; const vals: any[] = [];
    if (name !== undefined) { sets.push('name = ?'); vals.push(name); }
    if (slug !== undefined) { sets.push('slug = ?'); vals.push(slug); }
    if (normDomain !== undefined) { sets.push('domain = ?'); vals.push(normDomain); }
    if (description !== undefined) { sets.push('description = ?'); vals.push(description); }
    if (active !== undefined) { sets.push('active = ?'); vals.push(active ? 1 : 0); }
    if (sets.length > 0) { vals.push(req.params.id); db.prepare('UPDATE Site SET ' + sets.join(', ') + ' WHERE id = ?').run(...vals); }
    invalidateSiteCache();
    res.json(db.prepare('SELECT * FROM Site WHERE id = ?').get(req.params.id));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: set site as primary
router.post('/:id/primary', authenticate, requireCap('manage_sites'), (req: AuthRequest, res: Response) => {
  try {
    const existing = db.prepare('SELECT id FROM Site WHERE id = ?').get(req.params.id) as any;
    if (!existing) { res.status(404).json({ error: 'Site not found' }); return; }
    // Clear-then-set must be atomic: a crash between them would leave no primary site.
    withTransaction(() => {
      db.prepare('UPDATE Site SET isPrimary = 0').run();
      db.prepare('UPDATE Site SET isPrimary = 1 WHERE id = ?').run(req.params.id);
    });
    invalidateSiteCache();
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: read site settings overrides
router.get('/:id/settings', authenticate, requireCap('manage_sites'), (req: SiteRequest, res: Response) => {
  try {
    const existing = db.prepare('SELECT id FROM Site WHERE id = ?').get(req.params.id) as any;
    if (!existing) { res.status(404).json({ error: 'Site not found' }); return; }
    const overrides = db.prepare('SELECT key, value FROM SiteSetting WHERE siteId = ?').all(req.params.id) as any[];
    const map: Record<string, string> = {};
    overrides.forEach((s: any) => { map[s.key] = s.value; });
    res.json(map);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Settings that may not be overridden per site. The permalink structure is one
// namespace for the whole install: the server resolves post paths against the
// global Setting (utils/slug.ts), so a per-site value would only change what the
// frontend believes and make its links disagree with the routes the server
// answers. Refused instead of stored and ignored.
const GLOBAL_ONLY_SETTINGS = new Set(['permalink_structure']);

// Mirrors the guards on PUT /api/settings: a per-site override reaches the public
// site through /api/settings, so it must not be able to carry credentials or the
// keys managed by dedicated code paths.
const SITE_BLOCKED_KEYS = new Set(['installed', '__proto__', 'constructor', 'prototype']);
const SITE_BLOCKED_PREFIXES = ['jwt_', 'db_', 'market_'];

// Admin: site settings overrides
router.put('/:id/settings', authenticate, requireCap('manage_sites'), (req: SiteRequest, res: Response) => {
  try {
    const existing = db.prepare('SELECT id FROM Site WHERE id = ?').get(req.params.id) as any;
    if (!existing) { res.status(404).json({ error: 'Site not found' }); return; }
    const raw = req.body as Record<string, string>;
    const entries: Record<string, string> = {};
    for (const [k, v] of Object.entries(raw)) entries[k] = typeof v === 'string' ? v.trim() : String(v);
    const globalOnly = Object.keys(entries).find(k => GLOBAL_ONLY_SETTINGS.has(k));
    if (globalOnly) { res.status(400).json({ error: '「' + globalOnly + '」是全局设置，不能按站点覆盖' }); return; }
    // Same key hygiene as PUT /api/settings: these rows are served to the public
    // site through /api/settings, so credentials and internals must not be
    // plantable here either (this route had no guard at all).
    const blocked = Object.keys(entries).find(k => SITE_BLOCKED_KEYS.has(k) || SITE_BLOCKED_PREFIXES.some(p => k.startsWith(p)));
    if (blocked) { res.status(400).json({ error: 'Setting key is not writable for a site: ' + blocked }); return; }
    // A site may pick its own theme, but only one that is installed — otherwise
    // the site would silently render the install default. An empty value means
    // "follow the install-wide theme".
    if (entries.theme_active && !themeExists(entries.theme_active)) {
      res.status(400).json({ error: '「' + entries.theme_active + '」不是已安装的主题' });
      return;
    }
    const upsert = db.prepare('INSERT INTO SiteSetting (siteId, key, value) VALUES (?, ?, ?) ON CONFLICT(siteId, key) DO UPDATE SET value = excluded.value');
    // A settings save is all-or-nothing — a partial override set is worse than none.
    withTransaction(() => {
      for (const [key, value] of Object.entries(entries)) {
        // An empty theme_active has no meaning beyond "follow the install-wide
        // theme", so drop the row instead of storing a dead one.
        if (key === 'theme_active' && !value) { db.prepare('DELETE FROM SiteSetting WHERE siteId = ? AND key = ?').run(req.params.id, key); continue; }
        upsert.run(req.params.id, key, String(value));
      }
    });
    // These overrides are served through the cached /api/settings (per host), so
    // a change — site title, or which theme the site runs — has to drop it.
    try { purgeAllCaches(); } catch { /* cache maintenance must not fail the write */ }
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: content assignable to a site (posts/pages/media/comments with their current siteId)
router.get('/:id/content', authenticate, requireCap('manage_sites'), (req: AuthRequest, res: Response) => {
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
router.post('/:id/content/assign', authenticate, requireCap('manage_sites'), (req: AuthRequest, res: Response) => {
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
router.post('/:id/content/global', authenticate, requireCap('manage_sites'), (req: AuthRequest, res: Response) => {
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
router.post('/:id/duplicate', authenticate, requireCap('manage_sites'), (req: AuthRequest, res: Response) => {
  try {
    const src = db.prepare('SELECT * FROM Site WHERE id = ?').get(req.params.id) as any;
    if (!src) { res.status(404).json({ error: 'Site not found' }); return; }
    const suffix = '-' + Date.now().toString(36).slice(-4);
    const id = cuid();
    const name = (req.body?.name || src.name) + ' (copy)';
    const slug = (req.body?.slug || src.slug) + suffix;
    const domain = (req.body?.domain || src.domain) + suffix;
    // Site row + copied settings + copied menus are one unit; a half-duplicated
    // site would be missing its configuration.
    withTransaction(() => {
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
    });
    invalidateSiteCache();
    res.status(201).json(db.prepare('SELECT * FROM Site WHERE id = ?').get(id));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: delete site
router.delete('/:id', authenticate, requireCap('manage_sites'), (req: AuthRequest, res: Response) => {
  try {
    const existing = db.prepare('SELECT * FROM Site WHERE id = ?').get(req.params.id) as any;
    if (!existing) { res.status(404).json({ error: 'Site not found' }); return; }
    if (existing.isPrimary === 1) { res.status(400).json({ error: 'Cannot delete the primary site' }); return; }
    db.prepare('DELETE FROM Site WHERE id = ?').run(req.params.id);
    invalidateSiteCache();
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;
