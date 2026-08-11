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

// Admin: get activity log (filterable by action substring, paginated)
router.get('/', authenticate, authorize('admin'), (req: AuthRequest, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
    const q = String(req.query.q || '').trim();
    let where = '';
    const params: any[] = [];
    if (q) { where = ' WHERE a.action LIKE ?'; params.push('%' + q + '%'); }
    const total = (db.prepare('SELECT COUNT(*) as c FROM Activity a' + where).get(...params) as any)?.c || 0;
    const logs = db.prepare('SELECT a.*, u.username FROM Activity a LEFT JOIN User u ON u.id = a.userId' + where + ' ORDER BY a.createdAt DESC LIMIT ? OFFSET ?').all(...params, limit, (page - 1) * limit) as any[];
    res.json({ logs, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;
