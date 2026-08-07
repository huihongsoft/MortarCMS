import { Router, Response } from 'express';
import crypto from 'crypto';
import db, { cuid } from '../utils/db';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const passwords = db.prepare('SELECT id, name, created_at as createdAt FROM AppPassword WHERE userId = ? ORDER BY created_at DESC').all(req.user!.userId) as any[];
    res.json(passwords);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.post('/', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const { name } = req.body;
    if (!name) { res.status(400).json({ error: 'Name required' }); return; }
    const token = crypto.randomBytes(24).toString('hex');
    const hash = crypto.createHash('sha256').update(token).digest('hex');
    const id = cuid();
    db.prepare('INSERT INTO AppPassword (id, userId, name, hash, created_at) VALUES (?, ?, ?, ?, ?)').run(id, req.user!.userId, name, hash, new Date().toISOString());
    res.status(201).json({ id, name, token, message: 'Save this token - it will not be shown again' });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', authenticate, (req: AuthRequest, res: Response) => {
  try {
    db.prepare('DELETE FROM AppPassword WHERE id = ? AND userId = ?').run(req.params.id, req.user!.userId);
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;
