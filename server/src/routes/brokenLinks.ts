import { Router, Response } from 'express';
import db from '../utils/db';
import { authenticate, requireCap, AuthRequest } from '../middleware/auth';

const router = Router();

// Admin: broken-link report (filter by status, paginated)
router.get('/admin/broken-links', authenticate, requireCap('manage_options'), (req: AuthRequest, res: Response) => {
  try {
    const page = Math.max(1, parseInt(String(req.query.page || '1')) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit || '15')) || 15));
    const status = String(req.query.status || '');
    const where = status ? ' WHERE status = ?' : '';
    const params: any[] = [];
    if (status) params.push(status);
    const total = (db.prepare('SELECT COUNT(*) as c FROM BrokenLink' + where).get(...params) as any).c;
    const needsAttention = (db.prepare("SELECT COUNT(*) as c FROM BrokenLink WHERE status != 'ok'").get() as any).c || 0;
    const rows = db.prepare('SELECT * FROM BrokenLink' + where + ' ORDER BY checkedAt DESC, statusCode IS NULL DESC LIMIT ? OFFSET ?')
      .all(...params, limit, (page - 1) * limit) as any[];
    res.json({ total, needsAttention, links: rows });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: delete one entry (e.g. a fixed or irrelevant link)
router.delete('/admin/broken-links/:id', authenticate, requireCap('manage_options'), (req: AuthRequest, res: Response) => {
  try {
    const r = db.prepare('DELETE FROM BrokenLink WHERE id = ?').run(req.params.id);
    if (r.changes === 0) { res.status(404).json({ error: 'Link not found' }); return; }
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;
