import { Router, Response } from 'express';
import multer from 'multer';
import fs from 'fs';
import db, { cuid } from '../utils/db';
import { authenticate, requireCap, AuthRequest } from '../middleware/auth';
import { slugify, uniqueSlug } from '../utils/slug';
import { parseFrontmatter, mdToHtml } from '../utils/markdown';
import { sanitizeHtml } from '../utils/sanitize';

const router = Router();
const upload = multer({ dest: 'uploads/import-tmp/', limits: { fileSize: 50 * 1024 * 1024 } });

function esc(s: string): string { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function unesc(s: string): string { return s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#039;/g, "'"); }

// Admin: import WordPress WXR XML file
router.post('/wxr', authenticate, requireCap('manage_options'), upload.single('file'), (req: AuthRequest, res: Response) => {
  let tmpPath: string | null = null;
  try {
    if (!req.file) { res.status(400).json({ error: 'No file uploaded' }); return; }
    tmpPath = req.file.path;
    const xml = fs.readFileSync(tmpPath, 'utf8');
    if (!xml.includes('<channel>') || !xml.includes('<wp:post_type>')) {
      res.status(400).json({ error: 'Not a valid WordPress WXR file' });
      return;
    }

    // Parse items
    const items: any[] = [];
    const itemRe = /<item>([\s\S]*?)<\/item>/g;
    let m: RegExpExecArray | null;
    const authorMap: Record<string, string> = {}; // wp:author_login -> userId
    const users = db.prepare('SELECT id, username FROM User').all() as any[];
    users.forEach((u: any) => { authorMap[u.username] = u.id; });

    while ((m = itemRe.exec(xml)) !== null) {
      const body = m[1];
      const stripCdata = (s: string) => s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/, '$1');
      const grab = (tag: string) => {
        const r = new RegExp('<' + tag + '>([\\s\\S]*?)</' + tag + '>').exec(body);
        return r ? stripCdata(unesc(r[1])).trim() : '';
      };
      const grabAttr = (tag: string, attr: string) => {
        const r = new RegExp('<' + tag + '[^>]*' + attr + '="([^"]*)"').exec(body);
        return r ? r[1] : '';
      };
      items.push({
        title: grab('title'),
        link: grab('link'),
        pubDate: grab('pubDate'),
        creator: grab('dc:creator'),
        content: grab('content:encoded'),
        excerpt: grab('excerpt:encoded'),
        postType: grab('wp:post_type') || 'post',
        status: grab('wp:status') || 'draft',
        slug: grab('wp:post_name'),
        categories: [...body.matchAll(/<category domain="category"[^>]*><!\[CDATA\[([\s\S]*?)\]\]><\/category>/g)].map(c => c[1]),
        tags: [...body.matchAll(/<category domain="post_tag"[^>]*><!\[CDATA\[([\s\S]*?)\]\]><\/category>/g)].map(t => t[1]),
        attachmentUrl: grabAttr('wp:attachment_url', '') || '',
      });
    }

    if (items.length === 0) { res.status(400).json({ error: 'No items found in WXR file' }); return; }

    const now = new Date().toISOString();
    const allSlugs = (db.prepare('SELECT slug FROM Post WHERE type = ?').all('post') as any[]).map((s: any) => s.slug);
    const allPageSlugs = (db.prepare('SELECT slug FROM Post WHERE type = ?').all('page') as any[]).map((s: any) => s.slug);

    const stats = { posts: 0, pages: 0, attachments: 0, categories: 0, tags: 0, comments: 0, skipped: 0 };

    for (const item of items) {
      if (item.postType === 'attachment') { stats.attachments++; continue; }
      if (item.postType !== 'post' && item.postType !== 'page') { stats.skipped++; continue; }

      // Resolve author
      let authorId = authorMap[item.creator] || null;
      if (!authorId) {
        const admin = db.prepare("SELECT id FROM User WHERE role = 'admin' LIMIT 1").get() as any;
        authorId = admin?.id || null;
      }
      if (!authorId) { stats.skipped++; continue; }

      const type = item.postType;
      const slugPool = type === 'page' ? allPageSlugs : allSlugs;
      const slug = uniqueSlug(item.slug || item.title, slugPool);
      slugPool.push(slug);

      const id = cuid();
      // Imported content is untrusted: sanitize before it is stored and later
      // rendered as HTML (defense in depth with the frontend's DOMPurify pass)
      const content = sanitizeHtml(item.content);
      const excerpt = sanitizeHtml(item.excerpt);
      db.prepare('INSERT INTO Post (id, title, slug, content, excerpt, status, type, authorId, createdAt, updatedAt, publishedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(
        id, item.title, slug, content, excerpt, item.status === 'publish' ? 'published' : 'draft', type, authorId, now, now, item.status === 'publish' ? now : null
      );

      // Categories
      for (const catName of item.categories) {
        const catSlug = slugify(catName);
        let cat: any = db.prepare('SELECT id FROM Category WHERE slug = ?').get(catSlug);
        if (!cat) {
          const cid = cuid();
          db.prepare('INSERT INTO Category (id, name, slug) VALUES (?, ?, ?)').run(cid, catName, catSlug);
          cat = { id: cid };
          stats.categories++;
        }
        db.prepare('INSERT OR IGNORE INTO PostCategory (postId, categoryId) VALUES (?, ?)').run(id, cat.id);
      }

      // Tags
      for (const tagName of item.tags) {
        const tagSlug = slugify(tagName);
        let tag: any = db.prepare('SELECT id FROM Tag WHERE slug = ?').get(tagSlug);
        if (!tag) {
          const tid = cuid();
          db.prepare('INSERT INTO Tag (id, name, slug) VALUES (?, ?, ?)').run(tid, tagName, tagSlug);
          tag = { id: tid };
          stats.tags++;
        }
        db.prepare('INSERT OR IGNORE INTO PostTag (postId, tagId) VALUES (?, ?)').run(id, tag.id);
      }

      if (type === 'post') stats.posts++; else stats.pages++;
    }

    // Comments are embedded in items; parse separately
    const commentRe = /<wp:comment>([\s\S]*?)<\/wp:comment>/g;
    const commentItems = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)];
    for (const ci of commentItems) {
      const body = ci[1];
      const rawSlug = new RegExp('<wp:post_name>([\\s\\S]*?)<\\/wp:post_name>').exec(body)?.[1] || '';
      const postSlug = rawSlug.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/, '$1').trim();
      const post = postSlug ? db.prepare('SELECT id FROM Post WHERE slug = ?').get(postSlug) as any : null;
      if (!post) continue;
      let cm: RegExpExecArray | null;
      const cbody = body.slice(0);
      const cre = /<wp:comment>([\s\S]*?)<\/wp:comment>/g;
      while ((cm = cre.exec(cbody)) !== null) {
      const cb = cm[1];
      const stripCdata = (s: string) => s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/, '$1');
      const grab = (tag: string) => {
        const r = new RegExp('<' + tag + '>([\\s\\S]*?)</' + tag + '>').exec(cb);
        return r ? stripCdata(unesc(r[1])).trim() : '';
      };
        db.prepare('INSERT INTO Comment (id, content, author, email, website, status, postId, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(
          cuid(), sanitizeHtml(grab('wp:comment_content')), grab('wp:comment_author') || 'Anonymous', grab('wp:comment_author_email'), grab('wp:comment_author_url'), grab('wp:comment_approved') === '1' ? 'approved' : 'pending', post.id, grab('wp:comment_date_gmt') || now
        );
        stats.comments++;
      }
    }

    if (tmpPath) { try { fs.unlinkSync(tmpPath); } catch {} }
    res.json({ success: true, stats });
  } catch (err: any) {
    if (tmpPath) { try { fs.unlinkSync(tmpPath); } catch {} }
    res.status(500).json({ error: err.message });
  }
});

// Admin: import Markdown files (frontmatter + body) as draft posts
router.post('/markdown', authenticate, requireCap('manage_options'), upload.array('files', 20), (req: AuthRequest, res: Response) => {
  try {
    const files = (req.files as Express.Multer.File[]) || [];
    if (files.length === 0) { res.status(400).json({ error: 'No files uploaded' }); return; }
    const status = req.body?.status === 'published' ? 'published' : 'draft';
    const imported: { title: string; slug: string; status: string }[] = [];
    let errors = 0;
    for (const file of files) {
      try {
        const raw = fs.readFileSync(file.path, 'utf8');
        const { meta, body } = parseFrontmatter(raw);
        const title = String(meta.title || file.originalname.replace(/\.md$/i, '')).slice(0, 200);
        const existingSlugs = db.prepare("SELECT slug FROM Post WHERE type = 'post'").all().map((r: any) => r.slug);
        const slug = uniqueSlug(String(meta.slug || slugify(title)), existingSlugs);
        const id = cuid();
        const now = new Date().toISOString();
        const publishedAt = meta.date ? new Date(String(meta.date)).toISOString() : null;
        db.prepare('INSERT INTO Post (id, title, slug, content, excerpt, status, type, authorId, publishedAt, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
          .run(id, title, slug, mdToHtml(body), String(meta.excerpt || body.slice(0, 200)), status, 'post', req.user!.userId, publishedAt, now, now);
        // Tags + categories from frontmatter
        for (const tagName of (meta.tags || []) as string[]) {
          const ts = String(tagName).trim().slice(0, 50);
          if (!ts) continue;
          const existing = db.prepare('SELECT id FROM Tag WHERE slug = ?').get(slugify(ts)) as any;
          let tagId = existing?.id as string | undefined;
          if (!tagId) { tagId = cuid(); db.prepare('INSERT INTO Tag (id, name, slug) VALUES (?, ?, ?)').run(tagId, ts, slugify(ts)); }
          db.prepare('INSERT OR IGNORE INTO PostTag (postId, tagId) VALUES (?, ?)').run(id, tagId);
        }
        for (const catName of (meta.categories || []) as string[]) {
          const cs = String(catName).trim().slice(0, 50);
          if (!cs) continue;
          const existing = db.prepare('SELECT id FROM Category WHERE slug = ?').get(slugify(cs)) as any;
          let catId = existing?.id as string | undefined;
          if (!catId) { catId = cuid(); db.prepare('INSERT INTO Category (id, name, slug) VALUES (?, ?, ?)').run(catId, cs, slugify(cs)); }
          db.prepare('INSERT OR IGNORE INTO PostCategory (postId, categoryId) VALUES (?, ?)').run(id, catId);
        }
        imported.push({ title, slug, status });
      } catch { errors++; }
      finally { try { fs.unlinkSync(file.path); } catch {} }
    }
    res.json({ success: true, imported: imported.length, errors, items: imported });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;
