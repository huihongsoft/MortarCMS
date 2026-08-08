import { Router, Response } from 'express';
import { z } from 'zod';
import db, { cuid } from '../utils/db';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { uniqueSlug } from '../utils/slug';
import { applyShortcodes, renderCmsBlocks } from '../utils/shortcodes';

const router = Router();
const pageSchema = z.object({ title: z.string().min(1), content: z.string().optional(), status: z.enum(['draft', 'published', 'private', 'trash']).optional(), parentId: z.string().nullable().optional(), menuOrder: z.number().int().optional(), meta: z.record(z.string(), z.string()).optional() });


router.get('/public', (req: AuthRequest, res: Response) => {
  try {
    const pages = db.prepare('SELECT id, title, slug, status, menuOrder FROM Post WHERE type = ? AND status = ? ORDER BY menuOrder ASC').all('page', 'published') as any[];
    res.json(pages);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.get('/slug/:slug', (req: AuthRequest, res: Response) => {
  try {
    const page = db.prepare('SELECT * FROM Post WHERE slug = ? AND type = ?').get(req.params.slug, 'page') as any;
    if (!page || page.status !== 'published') { res.status(404).json({ error: 'Page not found' }); return; }
    page.author = db.prepare('SELECT id, username FROM User WHERE id = ?').get(page.authorId);
    // Load meta fields for visual CSS, etc.
    const metaRows = db.prepare('SELECT key, value FROM PostMeta WHERE postId = ?').all(page.id) as any[];
    page.meta = {};
    metaRows.forEach((r: any) => { page.meta[r.key] = r.value; });
    page.content = renderCmsBlocks(applyShortcodes(page.content || ''));
    res.json(page);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.get('/', authenticate, authorize('admin', 'editor'), (req: AuthRequest, res: Response) => {
  try {
    const pages = db.prepare('SELECT * FROM Post WHERE type = ? ORDER BY menuOrder ASC').all('page') as any[];
    pages.forEach((p: any) => {
      p.author = db.prepare('SELECT id, username FROM User WHERE id = ?').get(p.authorId);
      const metaRows = db.prepare('SELECT key, value FROM PostMeta WHERE postId = ?').all(p.id) as any[];
      p.meta = {};
      metaRows.forEach((r: any) => { p.meta[r.key] = r.value; });
    });
    res.json(pages);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.post('/', authenticate, authorize('admin', 'editor'), (req: AuthRequest, res: Response) => {
  try {
    const data = pageSchema.parse(req.body);
    const allSlugs = (db.prepare('SELECT slug FROM Post WHERE type = ?').all('page') as any[]).map((s: any) => s.slug);
    const slug = uniqueSlug(data.title, allSlugs);
    const id = cuid();
    db.prepare('INSERT INTO Post (id, title, slug, content, status, type, authorId, parentId, menuOrder, publishedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(id, data.title, slug, data.content || '', data.status || 'draft', 'page', req.user!.userId, data.parentId || null, data.menuOrder || 0, data.status === 'published' ? new Date().toISOString() : null);
    if (data.meta) {
      for (const [key, value] of Object.entries(data.meta)) {
        db.prepare('INSERT INTO PostMeta (id, postId, key, value) VALUES (?, ?, ?, ?)').run(cuid(), id, key, value);
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
    if (data.status !== undefined) { sets.push('status = ?'); vals.push(data.status); if (data.status === 'published' && !existing.publishedAt) { sets.push('publishedAt = ?'); vals.push(new Date().toISOString()); } }
    if (data.parentId !== undefined) { sets.push('parentId = ?'); vals.push(data.parentId); }
    if (data.menuOrder !== undefined) { sets.push('menuOrder = ?'); vals.push(data.menuOrder); }
    if (data.meta) {
      db.prepare('DELETE FROM PostMeta WHERE postId = ?').run(req.params.id);
      for (const [key, value] of Object.entries(data.meta)) {
        db.prepare('INSERT INTO PostMeta (id, postId, key, value) VALUES (?, ?, ?, ?)').run(cuid(), req.params.id, key, value);
      }
    }
    if (sets.length > 0) { sets.push('updatedAt = ?'); vals.push(new Date().toISOString()); vals.push(req.params.id); db.prepare('UPDATE Post SET ' + sets.join(', ') + ' WHERE id = ?').run(...vals); }
    const page = db.prepare('SELECT * FROM Post WHERE id = ?').get(req.params.id) as any;
    res.json(page);
  } catch (err: any) { if (err instanceof z.ZodError) { res.status(400).json({ error: err.errors }); return; } res.status(500).json({ error: err.message }); }
});

router.delete('/:id', authenticate, authorize('admin', 'editor'), (req: AuthRequest, res: Response) => {
  try { db.prepare('DELETE FROM Post WHERE id = ? AND type = ?').run(req.params.id, 'page'); res.json({ success: true }); } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;
