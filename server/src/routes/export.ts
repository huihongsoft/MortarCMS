import { Router, Response } from 'express';
import db from '../utils/db';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/export', authenticate, authorize('admin'), (_req: AuthRequest, res: Response) => {
  try {
    const data: any = {};
    data.posts = db.prepare("SELECT * FROM Post").all();
    data.pages = db.prepare("SELECT * FROM Post WHERE type='page'").all();
    data.categories = db.prepare("SELECT * FROM Category").all();
    data.tags = db.prepare("SELECT * FROM Tag").all();
    data.users = db.prepare("SELECT id, username, email, role, bio FROM User").all();
    data.settings = db.prepare("SELECT key, value FROM Setting").all();
    data.menus = db.prepare("SELECT * FROM Menu").all();
    data.comments = db.prepare("SELECT * FROM Comment").all();

    res.setHeader('Content-Disposition', 'attachment; filename=mortar-export.json');
    res.json(data);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.post('/import', authenticate, authorize('admin'), (req: AuthRequest, res: Response) => {
  try {
    const data = req.body;
    let count = 0;
    const cuid_import = () => Date.now().toString(36) + Math.random().toString(36).substr(2, 6);

    if (data.users) for (const u of data.users) {
      db.prepare('INSERT OR IGNORE INTO User (id, username, email, password, role, bio) VALUES (?,?,?,?,?,?)').run(u.id||cuid_import(), u.username, u.email, u.password||'', u.role||'author', u.bio||'');
      count++;
    }
    if (data.categories) for (const c of data.categories) {
      db.prepare('INSERT OR IGNORE INTO Category (id, name, slug, description, parentId) VALUES (?,?,?,?,?)').run(c.id||cuid_import(), c.name, c.slug, c.description||'', c.parentId||null);
      count++;
    }
    if (data.tags) for (const t of data.tags) {
      db.prepare('INSERT OR IGNORE INTO Tag (id, name, slug) VALUES (?,?,?)').run(t.id||cuid_import(), t.name, t.slug);
      count++;
    }
    if (data.posts) for (const p of data.posts) {
      db.prepare('INSERT OR IGNORE INTO Post (id, title, slug, content, excerpt, status, type, featured, authorId, parentId, menuOrder, sticky, password, publishedAt, createdAt, updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)').run(p.id||cuid_import(), p.title, p.slug, p.content||'', p.excerpt||'', p.status||'draft', p.type||'post', p.featured||null, p.authorId, p.parentId||null, p.menuOrder||0, p.sticky||0, p.password||'', p.publishedAt||null, p.createdAt||new Date().toISOString(), p.updatedAt||new Date().toISOString());
      count++;
    }
    res.json({ success: true, imported: count });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;
