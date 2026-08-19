import { Router, Response } from 'express';
import db, { cuid } from '../utils/db';
import { authenticate, requireCap, AuthRequest } from '../middleware/auth';

// Friend links (blogroll): lightweight name/url/avatar/description list,
// separate from the navigation-site Link model.
const router = Router();

// Public: all friend links
router.get('/', (_req: AuthRequest, res: Response) => {
  try {
    res.json(db.prepare('SELECT * FROM FriendLink ORDER BY createdAt ASC').all());
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: create
router.post('/', authenticate, requireCap('manage_options'), (req: AuthRequest, res: Response) => {
  try {
    const { name, url, avatar, description } = req.body || {};
    if (!name || !url) { res.status(400).json({ error: 'name and url required' }); return; }
    const id = cuid();
    db.prepare('INSERT INTO FriendLink (id, name, url, avatar, description) VALUES (?, ?, ?, ?, ?)')
      .run(id, name, url, avatar || '', description || '');
    res.status(201).json(db.prepare('SELECT * FROM FriendLink WHERE id = ?').get(id));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: update
router.put('/:id', authenticate, requireCap('manage_options'), (req: AuthRequest, res: Response) => {
  try {
    const { name, url, avatar, description } = req.body || {};
    const sets: string[] = []; const vals: any[] = [];
    if (name !== undefined) { sets.push('name = ?'); vals.push(name); }
    if (url !== undefined) { sets.push('url = ?'); vals.push(url); }
    if (avatar !== undefined) { sets.push('avatar = ?'); vals.push(avatar); }
    if (description !== undefined) { sets.push('description = ?'); vals.push(description); }
    if (sets.length > 0) { vals.push(req.params.id); db.prepare('UPDATE FriendLink SET ' + sets.join(', ') + ' WHERE id = ?').run(...vals); }
    res.json(db.prepare('SELECT * FROM FriendLink WHERE id = ?').get(req.params.id));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: delete
router.delete('/:id', authenticate, requireCap('manage_options'), (req: AuthRequest, res: Response) => {
  try { db.prepare('DELETE FROM FriendLink WHERE id = ?').run(req.params.id); res.json({ success: true }); } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;
