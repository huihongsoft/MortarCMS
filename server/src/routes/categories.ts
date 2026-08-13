import { Router, Response } from 'express';
import { z } from 'zod';
import db, { cuid } from '../utils/db';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { slugify } from '../utils/slug';

const router = Router();
const categorySchema = z.object({ name: z.string().min(1).max(50), description: z.string().max(500).optional(), parentId: z.string().optional() });

router.get('/', (req: AuthRequest, res: Response) => {
  try {
    const categories = db.prepare('SELECT * FROM Category ORDER BY name ASC').all() as any[];
    // Count only published posts so category lists match the category page
    categories.forEach((c: any) => { c._count = { posts: (db.prepare("SELECT COUNT(*) as cnt FROM PostCategory pc JOIN Post p ON p.id = pc.postId WHERE pc.categoryId = ? AND p.type = 'post' AND p.status = 'published'").get(c.id) as any)?.cnt || 0 }; });
    res.json(categories);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.post('/', authenticate, authorize('admin', 'editor'), (req: AuthRequest, res: Response) => {
  try {
    const data = categorySchema.parse(req.body);
    const id = cuid();
    db.prepare('INSERT INTO Category (id, name, slug, description, parentId) VALUES (?, ?, ?, ?, ?)').run(id, data.name, slugify(data.name), data.description || '', data.parentId || null);
    res.status(201).json(db.prepare('SELECT * FROM Category WHERE id = ?').get(id));
  } catch (err: any) { if (err instanceof z.ZodError) { res.status(400).json({ error: err.errors }); return; } res.status(500).json({ error: err.message }); }
});

router.put('/:id', authenticate, authorize('admin', 'editor'), (req: AuthRequest, res: Response) => {
  try {
    const data = categorySchema.partial().parse(req.body);
    const sets: string[] = []; const vals: any[] = [];
    if (data.name !== undefined) { sets.push('name = ?'); vals.push(data.name); sets.push('slug = ?'); vals.push(slugify(data.name)); }
    if (data.description !== undefined) { sets.push('description = ?'); vals.push(data.description); }
    if (data.parentId !== undefined) { sets.push('parentId = ?'); vals.push(data.parentId); }
    if (sets.length > 0) { vals.push(req.params.id); db.prepare('UPDATE Category SET ' + sets.join(', ') + ' WHERE id = ?').run(...vals); }
    res.json(db.prepare('SELECT * FROM Category WHERE id = ?').get(req.params.id));
  } catch (err: any) { if (err instanceof z.ZodError) { res.status(400).json({ error: err.errors }); return; } res.status(500).json({ error: err.message }); }
});

router.delete('/:id', authenticate, authorize('admin'), (req: AuthRequest, res: Response) => {
  try { db.prepare('DELETE FROM Category WHERE id = ?').run(req.params.id); res.json({ success: true }); } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: bulk delete categories
router.post('/bulk-delete', authenticate, authorize('admin'), (req: AuthRequest, res: Response) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) { res.status(400).json({ error: 'ids array required' }); return; }
    for (const id of ids) { db.prepare('DELETE FROM Category WHERE id = ?').run(id); }
    res.json({ success: true, count: ids.length });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;
