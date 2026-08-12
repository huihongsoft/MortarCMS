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
    // Never export credentials/secrets: SMTP password, JWT secret, AI provider
    // API keys and webhook tokens would leak the whole installation if the
    // export file fell into the wrong hands.
    const SECRET_KEYS = ['smtp_pass', 'jwt_secret', 'ai_providers', 'ai_bindings', 'reset_token'];
    const SECRET_PREFIXES = ['jwt_', 'market_', 'ai_binding_'];
    data.settings = (db.prepare("SELECT key, value FROM Setting").all() as any[])
      .filter((s: any) => !SECRET_KEYS.includes(s.key) && !SECRET_PREFIXES.some(p => s.key.startsWith(p)));
    data.menus = db.prepare("SELECT * FROM Menu").all();
    data.comments = db.prepare("SELECT * FROM Comment").all();
    data.media = db.prepare("SELECT * FROM Media").all();

    res.setHeader('Content-Disposition', 'attachment; filename=mortar-export.json');
    res.json(data);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Import preview: report what the file contains without writing anything
router.post('/import/preview', authenticate, authorize('admin'), (req: AuthRequest, res: Response) => {
  try {
    const data = req.body || {};
    const counts: Record<string, number> = {};
    for (const key of ['users', 'categories', 'tags', 'posts', 'menus', 'comments', 'media']) {
      counts[key] = Array.isArray(data[key]) ? data[key].length : 0;
    }
    // Detect potential slug conflicts
    const posts = Array.isArray(data.posts) ? data.posts : [];
    const existing = db.prepare("SELECT slug FROM Post WHERE type = 'post'").all().map((r: any) => r.slug);
    const conflicts = posts.filter((p: any) => existing.includes(p.slug)).length;
    res.json({ counts, conflicts });
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
    if (data.menus) for (const m of data.menus) {
      db.prepare('INSERT OR IGNORE INTO Menu (id, name, location, items, siteId) VALUES (?,?,?,?,?)').run(m.id||cuid_import(), m.name, m.location||'primary', JSON.stringify(m.items||[]), m.siteId||null);
      count++;
    }
    if (data.comments) for (const cm of data.comments) {
      db.prepare('INSERT OR IGNORE INTO Comment (id, content, author, email, website, postId, parentId, status, createdAt) VALUES (?,?,?,?,?,?,?,?,?)').run(cm.id||cuid_import(), cm.content||'', cm.author||'Anonymous', cm.email||'', cm.website||'', cm.postId, cm.parentId||null, cm.status||'pending', cm.createdAt||new Date().toISOString());
      count++;
    }
    if (data.media) for (const md of data.media) {
      try {
        db.prepare('INSERT OR IGNORE INTO Media (id, filename, original, mimeType, size, url, thumbnail, title, alt, createdAt) VALUES (?,?,?,?,?,?,?,?,?,?)').run(md.id||cuid_import(), md.filename, md.original, md.mimeType, md.size||0, md.url, md.thumbnail||null, md.title||'', md.alt||'', md.createdAt||new Date().toISOString());
        count++;
      } catch {}
    }
    res.json({ success: true, imported: count });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;
