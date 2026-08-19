import { Router, Response } from 'express';
import db from '../utils/db';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { sanitizeHtml } from '../utils/sanitize';

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
    // Navigation-site link model (links, their categories, post associations, friend links)
    data.links = db.prepare("SELECT * FROM Link").all();
    data.linkCategories = db.prepare("SELECT * FROM LinkCategory").all();
    data.linkPosts = db.prepare("SELECT * FROM LinkPost").all();
    data.friendLinks = db.prepare("SELECT * FROM FriendLink").all();

    res.setHeader('Content-Disposition', 'attachment; filename=mortar-export.json');
    res.json(data);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Import preview: report what the file contains without writing anything
router.post('/import/preview', authenticate, authorize('admin'), (req: AuthRequest, res: Response) => {
  try {
    const data = req.body || {};
    const counts: Record<string, number> = {};
    for (const key of ['users', 'categories', 'tags', 'posts', 'menus', 'comments', 'media', 'links', 'linkCategories', 'linkPosts', 'friendLinks']) {
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
      try { db.prepare('INSERT OR IGNORE INTO User (id, username, email, password, role, bio) VALUES (?,?,?,?,?,?)').run(u.id||cuid_import(), u.username, u.email, u.password||'', u.role||'author', u.bio||''); count++; } catch {}
    }
    if (data.categories) for (const c of data.categories) {
      try { db.prepare('INSERT OR IGNORE INTO Category (id, name, slug, description, parentId) VALUES (?,?,?,?,?)').run(c.id||cuid_import(), c.name, c.slug, c.description||'', c.parentId||null); count++; } catch {}
    }
    if (data.tags) for (const t of data.tags) {
      try { db.prepare('INSERT OR IGNORE INTO Tag (id, name, slug) VALUES (?,?,?)').run(t.id||cuid_import(), t.name, t.slug); count++; } catch {}
    }
    if (data.posts) for (const p of data.posts) {
      // Imported content is untrusted: sanitize before storing (the file may
      // have been tampered with after export)
      const content = sanitizeHtml(p.content || '');
      const excerpt = sanitizeHtml(p.excerpt || '');
      try { db.prepare('INSERT OR IGNORE INTO Post (id, title, slug, content, excerpt, status, type, featured, authorId, parentId, menuOrder, sticky, password, publishedAt, createdAt, updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)').run(p.id||cuid_import(), p.title, p.slug, content, excerpt, p.status||'draft', p.type||'post', p.featured||null, p.authorId, p.parentId||null, p.menuOrder||0, p.sticky||0, p.password||'', p.publishedAt||null, p.createdAt||new Date().toISOString(), p.updatedAt||new Date().toISOString()); count++; } catch {}
    }
    if (data.menus) for (const m of data.menus) {
      try { db.prepare('INSERT OR IGNORE INTO Menu (id, name, location, items, siteId) VALUES (?,?,?,?,?)').run(m.id||cuid_import(), m.name, m.location||'primary', JSON.stringify(m.items||[]), m.siteId||null); count++; } catch {}
    }
    if (data.comments) for (const cm of data.comments) {
      try { db.prepare('INSERT OR IGNORE INTO Comment (id, content, author, email, website, postId, parentId, status, createdAt) VALUES (?,?,?,?,?,?,?,?,?)').run(cm.id||cuid_import(), sanitizeHtml(cm.content||''), cm.author||'Anonymous', cm.email||'', cm.website||'', cm.postId, cm.parentId||null, cm.status||'pending', cm.createdAt||new Date().toISOString()); count++; } catch {}
    }
    if (data.media) for (const md of data.media) {
      try {
        db.prepare('INSERT OR IGNORE INTO Media (id, filename, original, mimeType, size, url, thumbnail, title, alt, createdAt) VALUES (?,?,?,?,?,?,?,?,?,?)').run(md.id||cuid_import(), md.filename, md.original, md.mimeType, md.size||0, md.url, md.thumbnail||null, md.title||'', md.alt||'', md.createdAt||new Date().toISOString());
        count++;
      } catch {}
    }
    if (data.linkCategories) for (const lc of data.linkCategories) {
      db.prepare('INSERT OR IGNORE INTO LinkCategory (id, name, slug, description, menuOrder, siteId, createdAt) VALUES (?,?,?,?,?,?,?)').run(lc.id||cuid_import(), lc.name, lc.slug, lc.description||'', lc.menuOrder||0, lc.siteId||null, lc.createdAt||new Date().toISOString());
      count++;
    }
    if (data.links) for (const l of data.links) {
      db.prepare('INSERT OR IGNORE INTO Link (id, name, url, description, avatar, icon, categoryId, siteId, pageId, menuOrder, active, clicks, createdAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)').run(l.id||cuid_import(), l.name, l.url, l.description||'', l.avatar||'', l.icon||'', l.categoryId||null, l.siteId||null, l.pageId||null, l.menuOrder||0, l.active===0?0:1, l.clicks||0, l.createdAt||new Date().toISOString());
      count++;
    }
    if (data.linkPosts) for (const lp of data.linkPosts) {
      try {
        db.prepare('INSERT OR IGNORE INTO LinkPost (linkId, postId) VALUES (?,?)').run(lp.linkId, lp.postId);
        count++;
      } catch {}
    }
    if (data.friendLinks) for (const fl of data.friendLinks) {
      db.prepare('INSERT OR IGNORE INTO FriendLink (id, name, url, avatar, description, createdAt) VALUES (?,?,?,?,?,?)').run(fl.id||cuid_import(), fl.name, fl.url, fl.avatar||'', fl.description||'', fl.createdAt||new Date().toISOString());
      count++;
    }
    res.json({ success: true, imported: count });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;
