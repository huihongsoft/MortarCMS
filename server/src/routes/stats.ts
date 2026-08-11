import { Router, Response } from 'express';
import db from '../utils/db';
import { authenticate, requireCap, AuthRequest } from '../middleware/auth';

const router = Router();

// Admin: PV/UV stats (overview + daily series)
router.get('/', authenticate, requireCap('manage_options'), (req: AuthRequest, res: Response) => {
  try {
    const days = Math.min(parseInt(req.query.days as string) || 7, 90);
    const since = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);
    const totals = db.prepare("SELECT COUNT(*) as pv, COUNT(DISTINCT ip) as uv FROM Visit WHERE date >= ?").get(since) as any;
    // Daily series
    const rows = db.prepare("SELECT date, COUNT(*) as pv, COUNT(DISTINCT ip) as uv FROM Visit WHERE date >= ? GROUP BY date ORDER BY date").all(since) as any[];
    const map: Record<string, any> = {};
    for (const r of rows) map[r.date] = r;
    const series: any[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
      series.push({ date: d, pv: map[d]?.pv || 0, uv: map[d]?.uv || 0 });
    }
    // Top posts by views
    const top = db.prepare("SELECT title, slug, views FROM Post WHERE status = 'published' AND type = 'post' ORDER BY views DESC LIMIT 5").all() as any[];
    res.json({ total: { pv: totals?.pv || 0, uv: totals?.uv || 0 }, series, top });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: combined dashboard payload (counts, status breakdowns, recent content)
router.get('/dashboard', authenticate, requireCap('manage_options'), (_req: AuthRequest, res: Response) => {
  try {
    const q = (sql: string) => (db.prepare(sql).get() as any)?.cnt || 0;
    const counts = {
      posts: q("SELECT COUNT(*) as cnt FROM Post WHERE type='post'"),
      pages: q("SELECT COUNT(*) as cnt FROM Post WHERE type='page'"),
      users: q('SELECT COUNT(*) as cnt FROM User'),
      media: q('SELECT COUNT(*) as cnt FROM Media'),
      tags: q('SELECT COUNT(*) as cnt FROM Tag'),
      categories: q('SELECT COUNT(*) as cnt FROM Category'),
      links: q('SELECT COUNT(*) as cnt FROM Link'),
    };
    const postStatus: Record<string, number> = {};
    for (const r of db.prepare('SELECT status, COUNT(*) as cnt FROM Post GROUP BY status').all() as any[]) postStatus[r.status] = (postStatus[r.status] || 0) + r.cnt;
    const commentStatus: Record<string, number> = {};
    for (const r of db.prepare('SELECT status, COUNT(*) as cnt FROM Comment GROUP BY status').all() as any[]) commentStatus[r.status] = (commentStatus[r.status] || 0) + r.cnt;
    const recent = {
      posts: db.prepare("SELECT id, title, status, createdAt FROM Post WHERE type='post' ORDER BY createdAt DESC LIMIT 5").all(),
      comments: db.prepare('SELECT id, author, content, status, createdAt FROM Comment ORDER BY createdAt DESC LIMIT 5').all(),
    };
    res.json({ counts, postStatus, commentStatus, recent });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;
