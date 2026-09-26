import { Router, Response } from 'express';
import { mayWriteSite, userMayAccessSite, assignedSites } from '../utils/userSites';
import db, { cuid, withTransaction } from '../utils/db';
import { authenticate, requireCap, AuthRequest } from '../middleware/auth';
import { SiteRequest } from '../middleware/site';
import { doAction } from '../utils/hooks';

const router = Router();

// Menu item URLs are rendered into frontend <a href> — only allow safe forms:
// site-relative paths (never protocol-relative //), #anchors, http(s) and
// mailto. Anything else (javascript:, data:, vbscript: …) is rejected so an
// editor can't store an XSS payload that every visitor executes.
function assertSafeMenuItems(items: any): void {
  for (const it of items || []) {
    const u = String(it?.url ?? '');
    const ok = u === '' || u.startsWith('#') ||
      (u.startsWith('/') && !u.startsWith('//')) ||
      /^https?:\/\//i.test(u) ||
      /^mailto:/i.test(u);
    if (!ok) throw new Error('Invalid menu item URL: ' + u);
  }
}


// Menu items are stored as JSON and consumed by three renderers (the admin menu
// editor and the header/footer of every theme), all of which build a tree by
// matching `child.parentId === parent.id`. Items that arrive without an id break
// that: `childrenOf(undefined)` then matches every other parentless item, so each
// top-level entry appears to own all the others — which is exactly how the demo
// menu rendered (every top-level item listing the same children).
//
// So the shape is enforced here, on the boundary: every item gets a stable id,
// and a parentId that points nowhere is dropped rather than left dangling. The
// healing is persisted on read (callers pass the result through saveIfHealed) so
// an install that already stored an id-less menu repairs itself the first time
// the menu is loaded, without the operator re-importing anything.
function normalizeMenuItems(raw: any): { items: any[]; changed: boolean } {
  const input = Array.isArray(raw) ? raw : [];
  let changed = false;
  const items = input
    .filter((it: any) => it && typeof it === 'object')
    .map((it: any) => {
      const id = typeof it.id === 'string' && it.id ? it.id : '';
      const parentId = typeof it.parentId === 'string' && it.parentId ? it.parentId : null;
      const label = typeof it.label === 'string' ? it.label : String(it.label ?? '');
      const url = typeof it.url === 'string' ? it.url : '#';
      if (!id || parentId !== (it.parentId ?? null) || label !== it.label || url !== it.url) changed = true;
      return { ...it, id: id || cuid(), label, url, parentId };
    });
  const ids = new Set(items.map((i: any) => i.id));
  for (const it of items) {
    if (it.parentId && !ids.has(it.parentId)) { it.parentId = null; changed = true; }
  }
  if (items.length !== input.filter((it: any) => it && typeof it === 'object').length) changed = true;
  return { items, changed };
}

// Persist the healed shape so the ids stay stable across requests (generating
// them per read would change every id on every load).
function healMenu(row: any): any {
  const parsed = (() => { try { return JSON.parse(row.items || '[]'); } catch { return []; } })();
  const { items, changed } = normalizeMenuItems(parsed);
  if (changed) {
    try { db.prepare('UPDATE Menu SET items = ? WHERE id = ?').run(JSON.stringify(items), row.id); } catch { /* best effort */ }
  }
  return { ...row, items };
}

// Public: get menu by location
router.get('/location/:location', (req: AuthRequest & SiteRequest, res: Response) => {
  try {
    const menu = (req.siteId
      ? db.prepare('SELECT * FROM Menu WHERE location = ? AND (siteId IS NULL OR siteId = ?) ORDER BY createdAt DESC LIMIT 1').get(req.params.location, req.siteId)
      : db.prepare('SELECT * FROM Menu WHERE location = ? ORDER BY createdAt DESC LIMIT 1').get(req.params.location)) as any;
    if (!menu) { res.json({ items: [] }); return; }
    res.json(healMenu(menu));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: list all menus
router.get('/', authenticate, requireCap('manage_menus'), (req: AuthRequest, res: Response) => {
  try {
    // Site-scoped like the other admin lists: an editor assigned to specific sites
    // sees their own menus plus the shared ones.
    const assigned = assignedSites(req.user!.userId, req.user!.role);
    const menus = (assigned
      ? db.prepare('SELECT * FROM Menu WHERE siteId IS NULL OR siteId IN (' + assigned.map(() => '?').join(',') + ') ORDER BY createdAt DESC').all(...assigned)
      : db.prepare('SELECT * FROM Menu ORDER BY createdAt DESC').all()) as any[];
    res.json(menus.map((m: any) => healMenu(m)));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: save menu
router.post('/', authenticate, requireCap('manage_menus'), (req: AuthRequest, res: Response) => {
  try {
    const { name, location, items, siteId } = req.body;
    // Naming a site requires that site to be one the caller is assigned to.
    if (siteId !== undefined && siteId !== null && !mayWriteSite(req.user!.userId, req.user!.role, siteId)) {
      res.status(403).json({ error: '无权在该站点创建内容' }); return;
    }
    assertSafeMenuItems(items);
    const normalized = normalizeMenuItems(items).items;
    const id = cuid();
    db.prepare('INSERT INTO Menu (id, name, location, items, siteId) VALUES (?, ?, ?, ?, ?)').run(id, name || 'Menu', location || 'primary', JSON.stringify(normalized), siteId || null);
    const created = db.prepare('SELECT * FROM Menu WHERE id = ?').get(id) as any;
    try { doAction('menu_saved', id, 'created'); } catch {}
    res.status(201).json({ ...created, items: JSON.parse(created.items || '[]') });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: update menu
router.put('/:id', authenticate, requireCap('manage_menus'), (req: AuthRequest, res: Response) => {
  try {
    const existing = db.prepare('SELECT * FROM Menu WHERE id = ?').get(req.params.id) as any;
    if (!existing) { res.status(404).json({ error: 'Menu not found' }); return; }
    // The menu's *current* site matters as much as the target one.
    if (!userMayAccessSite(req.user!.userId, req.user!.role, existing.siteId || undefined)) { res.status(403).json({ error: '无权操作该站点的菜单' }); return; }
    const { name, items, location, siteId } = req.body;
    if (siteId !== undefined && siteId !== null && !mayWriteSite(req.user!.userId, req.user!.role, siteId)) {
      res.status(403).json({ error: '无权移到该站点' }); return;
    }
    if (items) assertSafeMenuItems(items);
    const normalizedItems = items ? normalizeMenuItems(items).items : null;
    withTransaction(() => {
      if (name !== undefined) db.prepare('UPDATE Menu SET name = ? WHERE id = ?').run(name, req.params.id);
      if (normalizedItems) db.prepare('UPDATE Menu SET items = ? WHERE id = ?').run(JSON.stringify(normalizedItems), req.params.id);
      if (location !== undefined) db.prepare('UPDATE Menu SET location = ? WHERE id = ?').run(location, req.params.id);
      if (siteId !== undefined) db.prepare('UPDATE Menu SET siteId = ? WHERE id = ?').run(siteId || null, req.params.id);
    });
    try { doAction('menu_saved', req.params.id, 'updated'); } catch {}
    res.json(db.prepare('SELECT * FROM Menu WHERE id = ?').get(req.params.id));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', authenticate, requireCap('manage_menus'), (req: AuthRequest, res: Response) => {
  try {
    const existing = db.prepare('SELECT * FROM Menu WHERE id = ?').get(req.params.id) as any;
    if (!existing) { res.status(404).json({ error: 'Menu not found' }); return; }
    if (!userMayAccessSite(req.user!.userId, req.user!.role, existing.siteId || undefined)) { res.status(403).json({ error: '无权操作该站点的菜单' }); return; }
    db.prepare('DELETE FROM Menu WHERE id = ?').run(req.params.id);
    try { doAction('menu_deleted', req.params.id); } catch {}
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;
