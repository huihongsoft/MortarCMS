import { Router, Response } from 'express';
import db, { cuid } from '../utils/db';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { SiteRequest } from '../middleware/site';

const router = Router();

// Public: get menu by location
router.get('/location/:location', (req: AuthRequest & SiteRequest, res: Response) => {
  try {
    const menu = (req.siteId
      ? db.prepare('SELECT * FROM Menu WHERE location = ? AND (siteId IS NULL OR siteId = ?) ORDER BY createdAt DESC LIMIT 1').get(req.params.location, req.siteId)
      : db.prepare('SELECT * FROM Menu WHERE location = ? ORDER BY createdAt DESC LIMIT 1').get(req.params.location)) as any;
    if (!menu) { res.json({ items: [] }); return; }
    res.json({ ...menu, items: JSON.parse(menu.items || '[]') });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: list all menus
router.get('/', authenticate, authorize('admin', 'editor'), (req: AuthRequest, res: Response) => {
  try {
    const menus = db.prepare('SELECT * FROM Menu ORDER BY createdAt DESC').all() as any[];
    res.json(menus.map((m: any) => ({ ...m, items: JSON.parse(m.items || '[]') })));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: save menu
router.post('/', authenticate, authorize('admin', 'editor'), (req: AuthRequest, res: Response) => {
  try {
    const { name, location, items, siteId } = req.body;
    const id = cuid();
    db.prepare('INSERT INTO Menu (id, name, location, items, siteId) VALUES (?, ?, ?, ?, ?)').run(id, name || 'Menu', location || 'primary', JSON.stringify(items || []), siteId || null);
    const created = db.prepare('SELECT * FROM Menu WHERE id = ?').get(id) as any;
    res.status(201).json({ ...created, items: JSON.parse(created.items || '[]') });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: update menu
router.put('/:id', authenticate, authorize('admin', 'editor'), (req: AuthRequest, res: Response) => {
  try {
    const { name, items, location, siteId } = req.body;
    if (name !== undefined) db.prepare('UPDATE Menu SET name = ? WHERE id = ?').run(name, req.params.id);
    if (items) db.prepare('UPDATE Menu SET items = ? WHERE id = ?').run(JSON.stringify(items), req.params.id);
    if (location !== undefined) db.prepare('UPDATE Menu SET location = ? WHERE id = ?').run(location, req.params.id);
    if (siteId !== undefined) db.prepare('UPDATE Menu SET siteId = ? WHERE id = ?').run(siteId || null, req.params.id);
    res.json(db.prepare('SELECT * FROM Menu WHERE id = ?').get(req.params.id));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', authenticate, authorize('admin', 'editor'), (req: AuthRequest, res: Response) => {
  try { db.prepare('DELETE FROM Menu WHERE id = ?').run(req.params.id); res.json({ success: true }); } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;
