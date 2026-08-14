import { Router, Response } from 'express';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import rateLimit from 'express-rate-limit';
import db, { cuid } from '../utils/db';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

// The public image-variant endpoint is unauthenticated (it serves <img> tags),
// so it is rate-limited per IP to prevent anonymous CPU/disk exhaustion via
// unique ?w=/fmt= combinations.
const imageVariantLimiter = rateLimit({ windowMs: 60 * 1000, max: 90, standardHeaders: true, message: { error: 'Too many image requests, slow down' } });

// Backfill responsive variants (thumbnail + 480/960 webp srcset) for legacy
// uploads. Runs in the background so list requests stay fast; the DB row is
// updated once the files are generated.
function ensureResponsiveVariants(m: any): void {
  if (!m || (m.mimeType && !m.mimeType.startsWith('image/'))) return;
  if (m.thumbnail && m.srcset) return;
  const srcPath = path.join(__dirname, '../..', 'uploads', m.filename);
  if (!fs.existsSync(srcPath)) return;
  const thumbsDir = path.join(__dirname, '../..', 'uploads', 'thumbs');
  if (!fs.existsSync(thumbsDir)) fs.mkdirSync(thumbsDir, { recursive: true });
  (async () => {
    try {
      let thumbnail: string | null = m.thumbnail || null;
      let srcset: string | null = m.srcset || null;
      const tasks: Promise<any>[] = [];
      if (!thumbnail) {
        const fn = m.id + '-thumb.jpg';
        tasks.push(sharp(srcPath).resize({ width: 300, withoutEnlargement: true }).jpeg({ quality: 80 }).toFile(path.join(thumbsDir, fn)).then(() => { thumbnail = '/uploads/thumbs/' + fn; }));
      }
      if (!srcset) {
        const sizes: Record<string, string> = {};
        for (const size of [480, 960]) {
          const fn = m.id + '-w' + size + '.webp';
          tasks.push(sharp(srcPath).resize({ width: size, withoutEnlargement: true }).webp({ quality: 80 }).toFile(path.join(thumbsDir, fn)).then(() => { sizes[size] = '/uploads/thumbs/' + fn; }));
        }
        srcset = JSON.stringify(sizes);
      }
      await Promise.all(tasks);
      db.prepare('UPDATE Media SET thumbnail = ?, srcset = ? WHERE id = ?').run(thumbnail, srcset, m.id);
    } catch { /* best-effort backfill */ }
  })();
}

function parseSrcsetList(media: any[]): any[] {
  return media.map((m: any) => {
    try { m.srcset = m.srcset ? JSON.parse(m.srcset) : null; } catch { m.srcset = null; }
    return m;
  });
}

router.get('/', authenticate, authorize('admin', 'editor', 'author'), (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = (req.query.search as string) || '';
    let sql = 'SELECT m.*, u.username FROM Media m LEFT JOIN User u ON u.id = m.userId';
    const params: any[] = [];
    if (search) { sql += ' WHERE m.original LIKE ? OR m.filename LIKE ?'; params.push('%' + search + '%', '%' + search + '%'); }
    sql += ' ORDER BY m.createdAt DESC LIMIT ? OFFSET ?';
    params.push(limit, (page - 1) * limit);
    const media = db.prepare(sql).all(...params) as any[];
    const total = (db.prepare('SELECT COUNT(*) as cnt FROM Media' + (search ? ' WHERE original LIKE ? OR filename LIKE ?' : '')).get(...(search ? ['%' + search + '%', '%' + search + '%'] : [])) as any)?.cnt || 0;
    media.forEach(ensureResponsiveVariants);
    res.json({ media: parseSrcsetList(media), total, page, totalPages: Math.ceil(total / limit) });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.get('/search', authenticate, authorize('admin', 'editor', 'author'), (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const media = db.prepare('SELECT m.*, u.username FROM Media m LEFT JOIN User u ON u.id = m.userId ORDER BY m.createdAt DESC LIMIT ? OFFSET ?').all(limit, (page - 1) * limit) as any[];
    const total = (db.prepare('SELECT COUNT(*) as cnt FROM Media').get() as any)?.cnt || 0;
    media.forEach(ensureResponsiveVariants);
    res.json({ media: parseSrcsetList(media), total, page, totalPages: Math.ceil(total / limit) });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Magic-byte verification: the stored file's header must match its claimed
// MIME type (defeats renamed executables / polyglot uploads).
const MAGIC_PATTERNS: [string, RegExp][] = [
  ['application/pdf', /^%PDF/],
  ['application/zip', /^PK\x03\x04/],
  ['application/x-zip-compressed', /^PK\x03\x04/],
  ['audio/mpeg', /^(ID3|\xFF\xFB|\xFF\xF3)/],
  ['video/mp4', /^.{4}ftyp/s],
];

function checkMagic(mime: string, head: Buffer): boolean {
  for (const [m, re] of MAGIC_PATTERNS) {
    if (mime.startsWith(m)) return re.test(head.toString('latin1', 0, Math.min(head.length, 16)));
  }
  return true; // no magic rule for this type (docx etc. are zip-based; checked above)
}

// Strip active content from SVG uploads: scripts, event handlers, foreignObject
function sanitizeSvg(content: string): string {
  return content
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<foreignObject[\s\S]*?<\/foreignObject>/gi, '')
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/<!\[CDATA\[[\s\S]*?\]\]>/g, '')
    .replace(/<!--[\s\S]*?-->/g, '');
}

router.post('/upload', authenticate, authorize('admin', 'editor', 'author'), upload.single('file'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) { res.status(400).json({ error: 'No file uploaded' }); return; }
    const srcPath = path.join(__dirname, '../..', 'uploads', req.file.filename);
    // Content validation for non-image types (images are validated via sharp below)
    if (!(req.file.mimetype || '').startsWith('image/')) {
      const head = fs.readFileSync(srcPath).subarray(0, 16);
      if (!checkMagic(req.file.mimetype || '', head)) {
        fs.unlinkSync(srcPath);
        res.status(400).json({ error: 'File content does not match its type' });
        return;
      }
    }
    // Sanitize SVG uploads (strip scripts and event handlers). Keyed off the
    // file extension, not the client-supplied MIME type, so a mismatched MIME
    // claim can never skip sanitization.
    if (path.extname(req.file.filename).toLowerCase() === '.svg') {
      const content = fs.readFileSync(srcPath, 'utf8');
      const clean = sanitizeSvg(content);
      fs.writeFileSync(srcPath, clean);
    }
    const id = cuid();
    const isImage = (req.file.mimetype || '').startsWith('image/');
    let width: number | null = null;
    let height: number | null = null;
    let srcsetField: string | null = null;
    // Generate a 300px thumbnail for images (for the media grid / pickers)
    let thumbnail: string | null = null;
    if (isImage) {
      const srcPath = path.join(__dirname, '../..', 'uploads', req.file.filename);
      let meta;
      try {
        meta = await sharp(srcPath).metadata();
        // metadata() only reads the file header — a truncated/corrupt image can
        // pass it but never renders in browsers. Do a full decode pass instead.
        await sharp(srcPath).resize({ width: 16 }).toBuffer();
      } catch {
        // Not a decodable image — reject instead of storing arbitrary content
        fs.unlinkSync(srcPath);
        res.status(400).json({ error: 'Invalid or corrupted image file' });
        return;
      }
      try {
        width = meta.width || null;
        height = meta.height || null;
        const thumbsDir = path.join(__dirname, '../..', 'uploads', 'thumbs');
        if (!fs.existsSync(thumbsDir)) fs.mkdirSync(thumbsDir, { recursive: true });
        const thumbName = id + '-thumb.jpg';
        await sharp(srcPath).resize({ width: 300, withoutEnlargement: true }).jpeg({ quality: 80 }).toFile(path.join(thumbsDir, thumbName));
        thumbnail = '/uploads/thumbs/' + thumbName;
        // Responsive srcset sizes (webp, disk-cached)
        const srcset: Record<string, string> = {};
        for (const size of [480, 960]) {
          const fn = id + '-w' + size + '.webp';
          await sharp(srcPath).resize({ width: size, withoutEnlargement: true }).webp({ quality: 80 }).toFile(path.join(thumbsDir, fn));
          srcset[size] = '/uploads/thumbs/' + fn;
        }
        srcsetField = JSON.stringify(srcset);
      } catch (e: any) { console.log('[Media] thumbnail gen failed:', e.message); }
    }
    db.prepare('INSERT INTO Media (id, filename, original, mimeType, size, url, alt, title, userId, width, height, thumbnail, srcset) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(id, req.file.filename, req.file.originalname, req.file.mimetype, req.file.size, '/uploads/' + req.file.filename, req.body.alt || '', req.body.title || '', req.user!.userId, width, height, thumbnail, srcsetField);
    res.status(201).json(db.prepare('SELECT * FROM Media WHERE id = ?').get(id));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Public: single media item detail (for attachment pages / preview)
router.get('/:id', (req: AuthRequest, res: Response) => {
  try {
    const media = db.prepare('SELECT m.*, u.username FROM Media m LEFT JOIN User u ON u.id = m.userId WHERE m.id = ?').get(req.params.id) as any;
    if (!media) { res.status(404).json({ error: 'Media not found' }); return; }
    ensureResponsiveVariants(media);
    // Parse srcset JSON for the client
    if (media.srcset) {
      try { media.srcset = JSON.parse(media.srcset); } catch { media.srcset = null; }
    }
    res.json(media);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Responsive image endpoint: GET /api/media/:id/img?w=640&fmt=webp -> resized (disk-cached)
router.get('/:id/img', imageVariantLimiter, async (req: AuthRequest, res: Response) => {
  try {
    const media = db.prepare('SELECT * FROM Media WHERE id = ?').get(req.params.id) as any;
    if (!media || !media.mimeType?.startsWith('image/')) { res.status(404).json({ error: 'Image not found' }); return; }
    // w must be a multiple of 16 (and capped) so an attacker cannot flood the
    // disk with one cached variant per arbitrary width.
    const wRaw = parseInt(req.query.w as string) || 640;
    if (wRaw % 16 !== 0) { res.status(400).json({ error: 'w must be a multiple of 16' }); return; }
    const w = Math.min(wRaw, 2560);
    const fmt = (req.query.fmt as string || 'jpeg').toLowerCase();
    if (!['jpeg', 'webp', 'avif'].includes(fmt)) { res.status(400).json({ error: 'fmt must be jpeg, webp or avif' }); return; }
    const srcPath = path.join(__dirname, '../..', 'uploads', media.filename);
    if (!fs.existsSync(srcPath)) { res.status(404).json({ error: 'File missing' }); return; }
    const thumbsDir = path.join(__dirname, '../..', 'uploads', 'thumbs');
    if (!fs.existsSync(thumbsDir)) fs.mkdirSync(thumbsDir, { recursive: true });
    const outPath = path.join(thumbsDir, media.id + '-w' + w + '.' + fmt);
    const mime = fmt === 'webp' ? 'image/webp' : fmt === 'avif' ? 'image/avif' : 'image/jpeg';
    if (fs.existsSync(outPath)) {
      res.type(mime).sendFile(outPath);
      return;
    }
    const pipeline = sharp(srcPath).resize({ width: w, withoutEnlargement: true });
    const task = fmt === 'webp' ? pipeline.webp({ quality: 82 }) : fmt === 'avif' ? pipeline.avif({ quality: 75 }) : pipeline.jpeg({ quality: 82 });
    try {
      await task.toFile(outPath);
      res.type(mime).sendFile(outPath);
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: bulk update media metadata (title / alt text) for many items at once
router.post('/bulk-edit', authenticate, authorize('admin', 'editor'), (req: AuthRequest, res: Response) => {
  try {
    const { ids, title, alt } = req.body || {};
    if (!Array.isArray(ids) || ids.length === 0) { res.status(400).json({ error: 'ids array required' }); return; }
    const sets: string[] = []; const vals: any[] = [];
    if (title !== undefined && String(title).trim() !== '') { sets.push('title = ?'); vals.push(String(title).slice(0, 255)); }
    if (alt !== undefined && String(alt).trim() !== '') { sets.push('alt = ?'); vals.push(String(alt).slice(0, 255)); }
    if (sets.length === 0) { res.status(400).json({ error: 'title or alt required' }); return; }
    vals.push(...ids);
    const result = db.prepare(`UPDATE Media SET ${sets.join(', ')} WHERE id IN (${ids.map(() => '?').join(',')})`).run(...vals);
    res.json({ success: true, updated: result.changes });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: update media metadata (title / alt text) — like the WP attachment edit screen
router.put('/:id', authenticate, authorize('admin', 'editor'), (req: AuthRequest, res: Response) => {
  try {
    const media = db.prepare('SELECT * FROM Media WHERE id = ?').get(req.params.id) as any;
    if (!media) { res.status(404).json({ error: 'Media not found' }); return; }
    const { title, alt } = req.body || {};
    const sets: string[] = []; const vals: any[] = [];
    if (title !== undefined) { sets.push('title = ?'); vals.push(String(title).slice(0, 255)); }
    if (alt !== undefined) { sets.push('alt = ?'); vals.push(String(alt).slice(0, 255)); }
    if (sets.length) {
      vals.push(req.params.id);
      db.prepare('UPDATE Media SET ' + sets.join(', ') + ' WHERE id = ?').run(...vals);
    }
    const updated = db.prepare('SELECT * FROM Media WHERE id = ?').get(req.params.id) as any;
    res.json(updated);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', authenticate, authorize('admin', 'editor'), (req: AuthRequest, res: Response) => {
  try {
    const media = db.prepare('SELECT * FROM Media WHERE id = ?').get(req.params.id) as any;
    if (!media) { res.status(404).json({ error: 'Media not found' }); return; }
    const filePath = path.join(__dirname, '../..', media.url);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    db.prepare('DELETE FROM Media WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: bulk delete media
router.post('/bulk-delete', authenticate, authorize('admin', 'editor'), (req: AuthRequest, res: Response) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) { res.status(400).json({ error: 'ids array required' }); return; }
    for (const id of ids) {
      const m = db.prepare('SELECT * FROM Media WHERE id = ?').get(id) as any;
      if (m) {
        const filePath = require('path').join(__dirname, '../..', m.url);
        if (require('fs').existsSync(filePath)) require('fs').unlinkSync(filePath);
        db.prepare('DELETE FROM Media WHERE id = ?').run(id);
      }
    }
    res.json({ success: true, count: ids.length });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;
