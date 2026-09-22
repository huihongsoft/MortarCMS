import { Router, Response } from 'express';
import db from '../utils/db';
import { authenticate, requireCap, AuthRequest } from '../middleware/auth';
import { assignedSites } from '../utils/userSites';

const router = Router();

// A user assigned to specific sites only sees their numbers: the clause matches
// their sites plus the shared (site-less) rows. An unrestricted user gets '' and
// keeps the previous, install-wide behaviour.
function scopeClause(column: string, assigned: string[] | null): { clause: string; params: string[] } {
  if (!assigned) return { clause: '', params: [] };
  return { clause: ' AND (' + column + ' IS NULL OR ' + column + ' IN (' + assigned.map(() => '?').join(',') + '))', params: assigned };
}
// Comments have no site of their own in practice: their post's is the real one.
const COMMENT_SITE_SQL = 'COALESCE(c.siteId, p.siteId)';

// Admin: PV/UV stats (overview + series). range: 7d | 14d | 30d | month | year
// — day granularity for the ranges, month granularity for the year view.
router.get('/', authenticate, requireCap('manage_options'), (req: AuthRequest, res: Response) => {
  try {
    // Visit.date is written in UTC (toISOString), so every boundary here is
    // computed in UTC too — a local-time "month start" would shift the window
    // by the timezone offset and skew the first/last day counts.
    const range = String(req.query.range || req.query.days || '14d');
    const utcToday = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    let since = ''; let byMonth = false; let spanDays = 0;
    switch (range) {
      case '7d': spanDays = 7; break;
      case '30d': spanDays = 30; break;
      case 'month': since = utcToday.slice(0, 7) + '-01'; break;
      case 'year': since = utcToday.slice(0, 4) + '-01-01'; byMonth = true; break;
      default: spanDays = 14; // 14d (also the fallback for the legacy ?days=N param)
    }
    if (spanDays) since = new Date(Date.now() - spanDays * 86400000).toISOString().slice(0, 10);
    const assigned = assignedSites(req.user!.userId, req.user!.role);
    const visitScope = scopeClause('siteId', assigned);
    const postScope = scopeClause('siteId', assigned);
    const totals = db.prepare('SELECT COUNT(*) as pv, COUNT(DISTINCT ip) as uv FROM Visit WHERE date >= ?' + visitScope.clause).get(since, ...visitScope.params) as any;
    const top = db.prepare("SELECT title, slug, views FROM Post WHERE status = 'published' AND type = 'post'" + postScope.clause + ' ORDER BY views DESC LIMIT 5').all(...postScope.params) as any[];
    const series: any[] = [];
    if (byMonth) {
      // Year view: one bar per month up to the current month (substr() works
      // on SQLite/MySQL/PostgreSQL — the date column is stored as YYYY-MM-DD)
      const rows = db.prepare('SELECT substr(date, 1, 7) as ym, COUNT(*) as pv, COUNT(DISTINCT ip) as uv FROM Visit WHERE date >= ?' + visitScope.clause + ' GROUP BY ym ORDER BY ym').all(since, ...visitScope.params) as any[];
      const map: Record<string, any> = {};
      for (const r of rows) map[r.ym] = r;
      const curY = utcToday.slice(0, 4); const curM = parseInt(utcToday.slice(5, 7), 10);
      for (let m = 1; m <= curM; m++) {
        const key = curY + '-' + String(m).padStart(2, '0');
        series.push({ date: key, pv: map[key]?.pv || 0, uv: map[key]?.uv || 0 });
      }
    } else {
      // Day view: one bar per day, zero-filled for days without visits
      const rows = db.prepare('SELECT date, COUNT(*) as pv, COUNT(DISTINCT ip) as uv FROM Visit WHERE date >= ?' + visitScope.clause + ' GROUP BY date ORDER BY date').all(since, ...visitScope.params) as any[];
      const map: Record<string, any> = {};
      for (const r of rows) map[r.date] = r;
      const totalDays = spanDays || Math.ceil((Date.now() - new Date(since + 'T00:00:00Z').getTime()) / 86400000);
      for (let i = totalDays - 1; i >= 0; i--) {
        const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
        series.push({ date: d, pv: map[d]?.pv || 0, uv: map[d]?.uv || 0 });
      }
    }
    res.json({ range, total: { pv: totals?.pv || 0, uv: totals?.uv || 0 }, series, top });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: combined dashboard payload (counts, status breakdowns, recent content)
router.get('/dashboard', authenticate, requireCap('manage_options'), (req: AuthRequest, res: Response) => {
  try {
    // Site-scoped for an assigned user (users/tags/categories are install-wide by
    // design and stay unscoped).
    const assigned = assignedSites(req.user!.userId, req.user!.role);
    const sPost = scopeClause('siteId', assigned);
    const sMedia = scopeClause('siteId', assigned);
    const sComment = assigned ? ' AND (' + COMMENT_SITE_SQL + ' IS NULL OR ' + COMMENT_SITE_SQL + ' IN (' + assigned.map(() => '?').join(',') + '))' : '';
    const q = (sql: string, params: string[] = []) => (db.prepare(sql).get(...params) as any)?.cnt || 0;
    const counts = {
      posts: q("SELECT COUNT(*) as cnt FROM Post WHERE type='post'" + sPost.clause, sPost.params),
      pages: q("SELECT COUNT(*) as cnt FROM Post WHERE type='page'" + sPost.clause, sPost.params),
      comments: q('SELECT COUNT(*) as cnt FROM Comment c LEFT JOIN Post p ON p.id = c.postId WHERE 1=1' + sComment, assigned || []),
      users: q('SELECT COUNT(*) as cnt FROM User'),
      media: q('SELECT COUNT(*) as cnt FROM Media WHERE 1=1' + sMedia.clause, sMedia.params),
      tags: q('SELECT COUNT(*) as cnt FROM Tag'),
      categories: q('SELECT COUNT(*) as cnt FROM Category'),
      links: q("SELECT COUNT(*) as cnt FROM Link l LEFT JOIN LinkCategory c ON c.id = l.categoryId WHERE 1=1" + (assigned ? ' AND (c.siteId IS NULL OR c.siteId IN (' + assigned.map(() => '?').join(',') + '))' : ''), assigned || []),
    };
    const postStatus: Record<string, number> = {};
    for (const r of db.prepare('SELECT status, COUNT(*) as cnt FROM Post WHERE 1=1' + sPost.clause + ' GROUP BY status').all(...sPost.params) as any[]) postStatus[r.status] = (postStatus[r.status] || 0) + r.cnt;
    const commentStatus: Record<string, number> = {};
    for (const r of db.prepare('SELECT c.status, COUNT(*) as cnt FROM Comment c LEFT JOIN Post p ON p.id = c.postId WHERE 1=1' + sComment + ' GROUP BY c.status').all(...(assigned || [])) as any[]) commentStatus[r.status] = (commentStatus[r.status] || 0) + r.cnt;
    const recent = {
      posts: db.prepare("SELECT id, title, status, createdAt FROM Post WHERE type='post'" + sPost.clause + ' ORDER BY createdAt DESC LIMIT 5').all(...sPost.params),
      comments: db.prepare('SELECT c.id, c.author, c.content, c.status, c.createdAt FROM Comment c LEFT JOIN Post p ON p.id = c.postId WHERE 1=1' + sComment + ' ORDER BY c.createdAt DESC LIMIT 5').all(...(assigned || [])),
    };
    res.json({ counts, postStatus, commentStatus, recent });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;
