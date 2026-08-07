import { Router, Response } from 'express';
import db from '../utils/db';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = Router();

// Log an activity
export function logActivity(userId: string, action: string, detail = '') {
  try {
    const id = Date.now().toString(36) + Math.random().toString(36).substr(2, 6);
    db.prepare('INSERT INTO Activity (id, userId, action, detail) VALUES (?, ?, ?, ?)').run(id, userId, action, detail);
  } catch {}
}

// Admin: get activity log
router.get('/', authenticate, authorize('admin'), (req: AuthRequest, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const logs = db.prepare('SELECT a.*, u.username FROM Activity a LEFT JOIN User u ON u.id = a.userId ORDER BY a.createdAt DESC LIMIT ?').all(limit) as any[];
    res.json(logs);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;
