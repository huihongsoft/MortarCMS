import { Router, Response } from 'express';
import { z } from 'zod';
import db, { cuid } from '../utils/db';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { slugify } from '../utils/slug';

const router = Router();
const tagSchema = z.object({ name: z.string().min(1).max(50) });

router.get('/', (req: AuthRequest, res: Response) => {
  try {
    const tags = db.prepare('SELECT * FROM Tag ORDER BY name ASC').all() as any[];
    // Count only published posts so the tag cloud matches the tag page.
    // Also aggregate the published posts' views (hotness): a tag with one
    // viral post ranks higher than one with many unread posts.
    if (tags.length > 0) {
      // One count query for all tags instead of one per tag
      const counts = new Map<string, number>();
      const views = new Map<string, number>();
      (db.prepare("SELECT pt.tagId, COUNT(*) as cnt FROM PostTag pt JOIN Post p ON p.id = pt.postId WHERE pt.tagId IN (" + tags.map(() => '?').join(',') + ") AND p.type = 'post' AND p.status = 'published' GROUP BY pt.tagId").all(...tags.map((t: any) => t.id)) as any[])
        .forEach((r: any) => counts.set(r.tagId, r.cnt));
      (db.prepare("SELECT pt.tagId, SUM(p.views) as v FROM PostTag pt JOIN Post p ON p.id = pt.postId WHERE pt.tagId IN (" + tags.map(() => '?').join(',') + ") AND p.type = 'post' AND p.status = 'published' GROUP BY pt.tagId").all(...tags.map((t: any) => t.id)) as any[])
        .forEach((r: any) => views.set(r.tagId, r.v));
      tags.forEach((t: any) => { t._count = { posts: counts.get(t.id) || 0, views: views.get(t.id) || 0 }; });
    }
    res.json(tags);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.post('/', authenticate, authorize('admin', 'editor', 'author'), (req: AuthRequest, res: Response) => {
  try {
    const data = tagSchema.parse(req.body);
    const id = cuid();
    db.prepare('INSERT INTO Tag (id, name, slug) VALUES (?, ?, ?)').run(id, data.name, slugify(data.name));
    res.status(201).json(db.prepare('SELECT * FROM Tag WHERE id = ?').get(id));
  } catch (err: any) { if (err instanceof z.ZodError) { res.status(400).json({ error: err.errors }); return; } res.status(500).json({ error: err.message }); }
});

router.put('/:id', authenticate, authorize('admin', 'editor'), (req: AuthRequest, res: Response) => {
  try {
    const data = tagSchema.partial().parse(req.body);
    if (data.name) db.prepare('UPDATE Tag SET name = ?, slug = ? WHERE id = ?').run(data.name, slugify(data.name), req.params.id);
    res.json(db.prepare('SELECT * FROM Tag WHERE id = ?').get(req.params.id));
  } catch (err: any) { if (err instanceof z.ZodError) { res.status(400).json({ error: err.errors }); return; } res.status(500).json({ error: err.message }); }
});

router.delete('/:id', authenticate, authorize('admin'), (req: AuthRequest, res: Response) => {
  try { db.prepare('DELETE FROM Tag WHERE id = ?').run(req.params.id); res.json({ success: true }); } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: bulk delete tags
router.post('/bulk-delete', authenticate, authorize('admin'), (req: AuthRequest, res: Response) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) { res.status(400).json({ error: 'ids array required' }); return; }
    for (const id of ids) { db.prepare('DELETE FROM Tag WHERE id = ?').run(id); }
    res.json({ success: true, count: ids.length });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;
