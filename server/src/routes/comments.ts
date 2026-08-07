import { Router, Response } from 'express';
import { z } from 'zod';
import db, { cuid } from '../utils/db';
import { authenticate, authorize, requireCap, AuthRequest } from '../middleware/auth';
import { doAction } from '../utils/hooks';

const router = Router();
const commentSchema = z.object({ content: z.string().min(1), author: z.string().optional(), email: z.string().optional().or(z.literal('')), website: z.string().optional().or(z.literal('')), parentId: z.string().optional(), postId: z.string() });

router.get('/post/:postId', (req: AuthRequest, res: Response) => {
  try {
    const comments = db.prepare('SELECT id, content, author, website, status, postId, parentId, userId, createdAt FROM Comment WHERE postId = ? AND status = ? AND parentId IS NULL ORDER BY createdAt DESC').all(req.params.postId, 'approved') as any[];
    for (const c of comments) {
      c.children = db.prepare('SELECT id, content, author, website, status, postId, parentId, userId, createdAt FROM Comment WHERE parentId = ? AND status = ? ORDER BY createdAt ASC').all(c.id, 'approved');
    }
    res.json(comments);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.post('/', (req: AuthRequest, res: Response) => {
  try {
    const data = commentSchema.parse(req.body);
    const post = db.prepare('SELECT * FROM Post WHERE id = ?').get(data.postId) as any;
    if (!post || post.status !== 'published') { res.status(404).json({ error: 'Post not found' }); return; }
    const id = cuid();
    db.prepare('INSERT INTO Comment (id, content, author, email, website, postId, parentId, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(id, data.content, data.author || 'Anonymous', data.email || '', data.website || '', data.postId, data.parentId || null, 'pending');
    
    // Notify parent comment author (simple mailto)
    if (data.parentId) {
      const parent = db.prepare('SELECT author, email, content FROM Comment WHERE id = ?').get(data.parentId) as any;
      if (parent?.email) {
        console.log('[Notify] Reply to "' + parent.content.substring(0, 40) + '" by ' + (data.author || 'Anonymous'));
      }
    }

    doAction('comment_added', id);
    res.status(201).json(db.prepare('SELECT * FROM Comment WHERE id = ?').get(id));
  } catch (err: any) { if (err instanceof z.ZodError) { res.status(400).json({ error: err.errors }); return; } res.status(500).json({ error: err.message }); }
});

router.get('/admin', authenticate, requireCap('moderate_comments'), (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string;
    let where = ''; const params: any[] = [];
    if (status) { where = ' WHERE c.status = ?'; params.push(status); }
    const comments = db.prepare('SELECT c.*, p.title as postTitle FROM Comment c LEFT JOIN Post p ON p.id = c.postId' + where + ' ORDER BY c.createdAt DESC LIMIT ? OFFSET ?').all(...params, limit, (page - 1) * limit) as any[];
    for (const c of comments) { c.post = { id: c.postId, title: c.postTitle }; }
    const total = (db.prepare('SELECT COUNT(*) as cnt FROM Comment c' + where).get(...params) as any)?.cnt || 0;
    res.json({ comments, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', authenticate, authorize('admin', 'editor'), (req: AuthRequest, res: Response) => {
  try {
    db.prepare('UPDATE Comment SET status = ? WHERE id = ?').run(req.body.status, req.params.id);
    if (req.body.status === 'approved') doAction('comment_approved', req.params.id);
    if (req.body.status === 'spam') doAction('comment_spam', req.params.id);
    res.json(db.prepare('SELECT * FROM Comment WHERE id = ?').get(req.params.id));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', authenticate, authorize('admin', 'editor'), (req: AuthRequest, res: Response) => {
  try { doAction('delete_comment', req.params.id); db.prepare('DELETE FROM Comment WHERE id = ?').run(req.params.id); res.json({ success: true }); } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: bulk action on comments
router.post('/bulk-action', authenticate, requireCap('moderate_comments'), (req: AuthRequest, res: Response) => {
  try {
    const { ids, action } = req.body;
    if (!ids || !Array.isArray(ids) || !action) { res.status(400).json({ error: 'ids and action required' }); return; }
    const validActions = ['approved', 'pending', 'spam', 'trash', 'delete'];
    if (!validActions.includes(action)) { res.status(400).json({ error: 'Invalid action' }); return; }
    if (action === 'trash' || action === 'delete') {
      for (const id of ids) db.prepare('DELETE FROM Comment WHERE id = ?').run(id);
    } else {
      for (const id of ids) {
        db.prepare('UPDATE Comment SET status = ? WHERE id = ?').run(action, id);
        if (action === 'approved') doAction('comment_approved', id);
        if (action === 'spam') doAction('comment_spam', id);
      }
    }
    res.json({ success: true, count: ids.length });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;
