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

// Backfill the affected entity's title for old entries whose detail is
// empty (the action string still carries the id, e.g. "PUT /api/posts/abc").
// Runs once per entry; later reads hit the stored detail directly.
function backfillDetails(rows: any[]): void {
  for (const row of rows) {
    if (row.detail) continue;
    const m = String(row.action || '').match(/^\/api\/links\/categories\/([^/]+)/);
    if (m) {
      const c = db.prepare('SELECT name FROM LinkCategory WHERE id = ?').get(m[1]) as any;
      if (c?.name) { try { db.prepare('UPDATE Activity SET detail = ? WHERE id = ?').run(String(c.name).slice(0, 60), row.id); } catch {} }
      continue;
    }
    const m2 = String(row.action || '').match(/^\/api\/(posts|pages|categories|tags|comments|media|users|menus|links|sites|roles|themes|plugins|friend-links)\/([^/]+)/);
    if (!m2) continue;
    const [, type, id] = m2;
    let title = '';
    try {
      if (type === 'posts' || type === 'pages') {
        const p = db.prepare('SELECT title FROM Post WHERE id = ?').get(id) as any;
        title = p?.title ? String(p.title).slice(0, 60) : '';
      } else if (type === 'categories') {
        const r = db.prepare('SELECT name FROM Category WHERE id = ?').get(id) as any;
        title = r?.name ? String(r.name).slice(0, 60) : '';
      } else if (type === 'tags') {
        const r = db.prepare('SELECT name FROM Tag WHERE id = ?').get(id) as any;
        title = r?.name ? String(r.name).slice(0, 60) : '';
      } else if (type === 'comments') {
        const r = db.prepare('SELECT content FROM Comment WHERE id = ?').get(id) as any;
        title = r ? String(r.content).slice(0, 40) : '';
      } else if (type === 'media') {
        const r = db.prepare('SELECT original FROM Media WHERE id = ?').get(id) as any;
        title = r?.original ? String(r.original).slice(0, 60) : '';
      } else if (type === 'users') {
        const r = db.prepare('SELECT username FROM User WHERE id = ?').get(id) as any;
        title = r?.username ? String(r.username).slice(0, 60) : '';
      } else if (type === 'menus') {
        const r = db.prepare('SELECT name FROM Menu WHERE id = ?').get(id) as any;
        title = r?.name ? String(r.name).slice(0, 60) : '';
      } else if (type === 'links') {
        const r = db.prepare('SELECT name FROM Link WHERE id = ?').get(id) as any;
        title = r?.name ? String(r.name).slice(0, 60) : '';
      } else if (type === 'sites') {
        const r = db.prepare('SELECT name FROM Site WHERE id = ?').get(id) as any;
        title = r?.name ? String(r.name).slice(0, 60) : '';
      } else if (type === 'roles') {
        const r = db.prepare('SELECT name FROM Role WHERE slug = ? OR id = ?').get(id, id) as any;
        title = r?.name ? String(r.name).slice(0, 60) : '';
      } else if (type === 'themes' || type === 'plugins') {
        title = id.slice(0, 60);  // the route segment IS the name
      } else if (type === 'friend-links') {
        const r = db.prepare('SELECT name FROM FriendLink WHERE id = ?').get(id) as any;
        title = r?.name ? String(r.name).slice(0, 60) : '';
      }
    } catch {}
    if (title) {
      try { db.prepare('UPDATE Activity SET detail = ? WHERE id = ?').run(title, row.id); } catch {}
    }
  }
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
    backfillDetails(logs);
    res.json({ logs, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;
