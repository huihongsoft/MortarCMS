import { Router, Response } from 'express';
import db, { cuid } from '../utils/db';
import { authenticate, requireCap, AuthRequest } from '../middleware/auth';

const router = Router();

// Public: all links (ordered)
router.get('/', (_req: AuthRequest, res: Response) => {
  try {
    res.json(db.prepare('SELECT * FROM Link ORDER BY createdAt ASC').all());
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: create link
router.post('/', authenticate, requireCap('manage_options'), (req: AuthRequest, res: Response) => {
  try {
    const { name, url, description, avatar } = req.body || {};
    if (!name || !url) { res.status(400).json({ error: 'name and url required' }); return; }
    const id = cuid();
    db.prepare('INSERT INTO Link (id, name, url, description, avatar) VALUES (?, ?, ?, ?, ?)').run(id, name, url, description || '', avatar || '');
    res.status(201).json(db.prepare('SELECT * FROM Link WHERE id = ?').get(id));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: update link
router.put('/:id', authenticate, requireCap('manage_options'), (req: AuthRequest, res: Response) => {
  try {
    const { name, url, description, avatar } = req.body || {};
    const sets: string[] = []; const vals: any[] = [];
    if (name !== undefined) { sets.push('name = ?'); vals.push(name); }
    if (url !== undefined) { sets.push('url = ?'); vals.push(url); }
    if (description !== undefined) { sets.push('description = ?'); vals.push(description); }
    if (avatar !== undefined) { sets.push('avatar = ?'); vals.push(avatar); }
    if (sets.length > 0) { vals.push(req.params.id); db.prepare('UPDATE Link SET ' + sets.join(', ') + ' WHERE id = ?').run(...vals); }
    res.json(db.prepare('SELECT * FROM Link WHERE id = ?').get(req.params.id));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: delete link
router.delete('/:id', authenticate, requireCap('manage_options'), (req: AuthRequest, res: Response) => {
  try { db.prepare('DELETE FROM Link WHERE id = ?').run(req.params.id); res.json({ success: true }); } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;
