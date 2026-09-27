import { Router, Response } from 'express';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import rateLimit from 'express-rate-limit';
import db, { cuid, withTransaction } from '../utils/db';
import { authenticate, requireCap, resolveOptionalUser, AuthRequest } from '../middleware/auth';
import { siteScopeForFilter, mayWriteSite, userMayAccessSite } from '../utils/userSites';
import { doAction } from '../utils/hooks';
import { purgeContentCaches } from '../utils/cache';
import { upload } from '../middleware/upload';
import { uploadPath, resolveUploadUrl } from '../utils/paths';
import { getStorageConfig, storeFile, deleteRemoteFile, keyFromUrl } from '../utils/storage';
import { stripEventHandlerAttrs, stripUnsafeUrlAttrs } from '../utils/sanitize';
import { likeContains } from '../utils/sqlLike';
import { rateLimitStore } from '../utils/rateLimitStore';
import { logger } from '../utils/logger';

const router = Router();

// The public image-variant endpoint is unauthenticated (it serves <img> tags),
// so it is rate-limited per IP to prevent anonymous CPU/disk exhaustion via
// unique ?w=/fmt= combinations.
const imageVariantLimiter = rateLimit({ windowMs: 60 * 1000, max: 90, standardHeaders: true, store: rateLimitStore(), message: { error: 'Too many image requests, slow down' } });

// Backfill responsive variants (thumbnail + 480/960 webp srcset) for legacy
// uploads. Runs in the background so list requests stay fast; the DB row is
// updated once the files are generated.
function ensureResponsiveVariants(m: any): void {
  if (!m || (m.mimeType && !m.mimeType.startsWith('image/'))) return;
  if (m.thumbnail && m.srcset) return;
  const srcPath = uploadPath(m.filename);
  if (!fs.existsSync(srcPath)) return;
  const thumbsDir = uploadPath('thumbs');
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

// May this user change (or delete) this media row? A shared file (siteId NULL) is
// open to whoever has the media capability, exactly like site-less posts.
function mayEditMedia(req: AuthRequest, media: any): boolean {
  return userMayAccessSite(req.user!.userId, req.user!.role, media?.siteId || undefined);
}

// The same rule for a folder, and it has to be asked separately: renaming,
// deleting or filing *into* a folder are all writes to a row that carries a
// siteId. Without this an editor assigned to one site could rename or delete
// another site's folders, or file their own uploads into them — the media rows
// were scoped (mayEditMedia) but the folder they were filed under was not.
function mayUseFolder(req: AuthRequest, folder: any): boolean {
  return userMayAccessSite(req.user!.userId, req.user!.role, folder?.siteId || undefined);
}

// 'missing' (a stale id from an old list) is not an authorization failure: the
// bulk routes skip it instead of refusing the whole batch.
function mediaScope(req: AuthRequest, id: unknown): 'ok' | 'denied' | 'missing' {
  const media = db.prepare('SELECT id, siteId FROM Media WHERE id = ?').get(String(id)) as any;
  if (!media) return 'missing';
  return mayEditMedia(req, media) ? 'ok' : 'denied';
}

router.get('/', authenticate, requireCap('upload_files'), (req: AuthRequest, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    // Clamped: media rows are expensive (each one triggers ensureResponsiveVariants).
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const search = (req.query.search as string) || '';
    // Site isolation, like posts/pages: a user assigned to specific sites does not
    // browse the files another site owns ('?siteId=' narrows further, and naming a
    // site outside their set is refused).
    const sf = siteScopeForFilter(req.user!.userId, req.user!.role, req.query.siteId, 'm.siteId');
    if (sf.denied) { res.status(403).json({ error: '无权访问该站点' }); return; }
    let where = ' WHERE 1=1';
    const params: any[] = [];
    if (search) {
      // Escaped: an unescaped "%" matched the whole library.
      where += " AND (m.original LIKE ? ESCAPE '\\' OR m.filename LIKE ? ESCAPE '\\')";
      const p = likeContains(search);
      params.push(p, p);
    }
    // Folder filter: an id, or 'none' for the files nobody has filed yet.
    const folder = String(req.query.folderId || '');
    if (folder === 'none') where += ' AND m.folderId IS NULL';
    else if (folder) { where += ' AND m.folderId = ?'; params.push(folder); }
    where += sf.clause; params.push(...sf.params);
    const sql = 'SELECT m.*, u.username FROM Media m LEFT JOIN User u ON u.id = m.userId' + where + ' ORDER BY m.createdAt DESC LIMIT ? OFFSET ?';
    const media = db.prepare(sql).all(...params, limit, (page - 1) * limit) as any[];
    const total = (db.prepare('SELECT COUNT(*) as cnt FROM Media m' + where).get(...params) as any)?.cnt || 0;
    media.forEach(ensureResponsiveVariants);
    res.json({ media: parseSrcsetList(media), total, page, totalPages: Math.ceil(total / limit) });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// ---- Folders ----
//
// Declared before GET /:id — Express matches in order, and '/folders' would
// otherwise be read as a media id.

// Admin: list folders with how many files each holds
router.get('/folders', authenticate, requireCap('upload_files'), (req: AuthRequest, res: Response) => {
  try {
    const sf = siteScopeForFilter(req.user!.userId, req.user!.role, req.query.siteId, 'f.siteId');
    if (sf.denied) { res.status(403).json({ error: '无权访问该站点' }); return; }
    const folders = db.prepare('SELECT f.* FROM MediaFolder f WHERE 1=1' + sf.clause + ' ORDER BY f.name ASC').all(...sf.params) as any[];
    // The counts are aggregated in one query and matched in memory; asking per
    // folder would be a query each. The unfiled count is the same scope clause
    // against the media table, computed once rather than rebuilt per call.
    const counts = db.prepare('SELECT folderId, COUNT(*) as c FROM Media WHERE folderId IS NOT NULL GROUP BY folderId').all() as any[];
    const countMap: Record<string, number> = {};
    counts.forEach((r: any) => { countMap[r.folderId] = r.c; });
    const mediaScope = siteScopeForFilter(req.user!.userId, req.user!.role, req.query.siteId, 'm.siteId');
    const unfiled = (db.prepare('SELECT COUNT(*) as c FROM Media m WHERE m.folderId IS NULL' + mediaScope.clause)
      .get(...mediaScope.params) as any)?.c || 0;
    res.json({ folders: folders.map((f) => ({ ...f, count: countMap[f.id] || 0 })), unfiled });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.post('/folders', authenticate, requireCap('upload_files'), (req: AuthRequest, res: Response) => {
  try {
    const name = String(req.body?.name || '').trim().slice(0, 60);
    if (!name) { res.status(400).json({ error: '文件夹名称必填' }); return; }
    const siteId = req.body?.siteId ? String(req.body.siteId) : null;
    if (siteId && !mayWriteSite(req.user!.userId, req.user!.role, siteId)) { res.status(403).json({ error: '无权在该站点创建文件夹' }); return; }
    // A parent folder is a write to another row: nesting under a site you cannot
    // reach would put your folder inside someone else's tree.
    const parentId = req.body?.parentId ? String(req.body.parentId) : null;
    if (parentId) {
      const parent = db.prepare('SELECT id, siteId FROM MediaFolder WHERE id = ?').get(parentId) as any;
      if (!parent || !mayUseFolder(req, parent)) { res.status(403).json({ error: '无权访问该文件夹' }); return; }
    }
    const id = cuid();
    db.prepare('INSERT INTO MediaFolder (id, name, parentId, siteId, createdAt) VALUES (?, ?, ?, ?, ?)')
      .run(id, name, parentId, siteId, new Date().toISOString());
    res.status(201).json(db.prepare('SELECT * FROM MediaFolder WHERE id = ?').get(id));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.put('/folders/:id', authenticate, requireCap('upload_files'), (req: AuthRequest, res: Response) => {
  try {
    const folder = db.prepare('SELECT * FROM MediaFolder WHERE id = ?').get(req.params.id) as any;
    // 404 rather than 403 for a folder in a site the caller cannot reach: the
    // existence of another site's folders is not theirs to learn.
    if (!folder || !mayUseFolder(req, folder)) { res.status(404).json({ error: '文件夹不存在' }); return; }
    const name = String(req.body?.name || '').trim().slice(0, 60);
    if (!name) { res.status(400).json({ error: '文件夹名称必填' }); return; }
    db.prepare('UPDATE MediaFolder SET name = ? WHERE id = ?').run(name, req.params.id);
    res.json(db.prepare('SELECT * FROM MediaFolder WHERE id = ?').get(req.params.id));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Refuses a non-empty folder rather than orphaning its files or deleting them:
// the caller can move them first, and a delete that quietly threw away images
// would be the worst possible behaviour here.
router.delete('/folders/:id', authenticate, requireCap('upload_files'), (req: AuthRequest, res: Response) => {
  try {
    const folder = db.prepare('SELECT * FROM MediaFolder WHERE id = ?').get(req.params.id) as any;
    if (!folder || !mayUseFolder(req, folder)) { res.status(404).json({ error: '文件夹不存在' }); return; }
    const count = (db.prepare('SELECT COUNT(*) as c FROM Media WHERE folderId = ?').get(req.params.id) as any)?.c || 0;
    if (count > 0) { res.status(400).json({ error: '该文件夹还有 ' + count + ' 个文件，请先移动或删除' }); return; }
    db.prepare('DELETE FROM MediaFolder WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Move a selection into a folder (or out of every folder with folderId: null).
router.post('/bulk-move', authenticate, requireCap('upload_files'), (req: AuthRequest, res: Response) => {
  try {
    const ids = Array.isArray(req.body?.ids) ? req.body.ids.map(String).slice(0, 500) : [];
    if (ids.length === 0) { res.status(400).json({ error: 'ids array required' }); return; }
    const folderId = req.body?.folderId ? String(req.body.folderId) : null;
    if (folderId) {
      // The destination is a write to that folder, so it needs the same check as
      // the media rows below — otherwise an editor files their own uploads into
      // another site's folder.
      const folder = db.prepare('SELECT id, siteId FROM MediaFolder WHERE id = ?').get(folderId) as any;
      if (!folder || !mayUseFolder(req, folder)) { res.status(404).json({ error: '文件夹不存在' }); return; }
    }
    let moved = 0;
    withTransaction(() => {
      for (const id of ids) {
        const m = db.prepare('SELECT id, siteId FROM Media WHERE id = ?').get(id) as any;
        if (!m || !mayEditMedia(req, m)) continue;
        moved += db.prepare('UPDATE Media SET folderId = ? WHERE id = ?').run(folderId, id).changes || 0;
      }
    });
    purgeContentCaches();
    res.json({ success: true, moved });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.get('/search', authenticate, requireCap('upload_files'), (req: AuthRequest, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const sf = siteScopeForFilter(req.user!.userId, req.user!.role, req.query.siteId, 'm.siteId');
    if (sf.denied) { res.status(403).json({ error: '无权访问该站点' }); return; }
    const media = db.prepare('SELECT m.*, u.username FROM Media m LEFT JOIN User u ON u.id = m.userId WHERE 1=1' + sf.clause + ' ORDER BY m.createdAt DESC LIMIT ? OFFSET ?').all(...sf.params, limit, (page - 1) * limit) as any[];
    const total = (db.prepare('SELECT COUNT(*) as cnt FROM Media m WHERE 1=1' + sf.clause).get(...sf.params) as any)?.cnt || 0;
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

// Strip active content from SVG uploads. SVG-specific blocks first, then the
// shared hardened attribute passes — the local regexes this used to carry missed
// `/`-separated handlers and entity/whitespace-obfuscated `javascript:`.
function sanitizeSvg(content: string): string {
  const stripped = content
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<foreignObject[\s\S]*?<\/foreignObject>/gi, '')
    .replace(/<!\[CDATA\[[\s\S]*?\]\]>/g, '')
    .replace(/<!--[\s\S]*?-->/g, '');
  return stripUnsafeUrlAttrs(stripEventHandlerAttrs(stripped));
}

router.post('/upload', authenticate, requireCap('upload_files'), upload.single('file'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) { res.status(400).json({ error: 'No file uploaded' }); return; }
    const srcPath = uploadPath(req.file.filename);
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
      const srcPath = uploadPath(req.file.filename);
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
        const thumbsDir = uploadPath('thumbs');
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
    // A file can be attached to a site on upload (the Media page may pass one); an
    // omitted/empty value keeps the previous behaviour — a shared file.
    const uploadSite = String(req.body.siteId || '').trim() || null;
    if (uploadSite && !mayWriteSite(req.user!.userId, req.user!.role, uploadSite)) {
      // Multer already wrote the original and the thumbnail pass generated its
      // variants: dropping them here, or a repeated 403 fills the uploads dir.
      try { fs.unlinkSync(srcPath); } catch { /* already gone */ }
      try {
        const tdir = uploadPath('thumbs');
        for (const f of fs.readdirSync(tdir)) if (f.startsWith(id + '-')) fs.unlinkSync(path.join(tdir, f));
      } catch { /* nothing generated */ }
      res.status(403).json({ error: '无权上传到该站点' }); return;
    }
    db.prepare('INSERT INTO Media (id, filename, original, mimeType, size, url, alt, title, userId, width, height, thumbnail, srcset, siteId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(id, req.file.filename, req.file.originalname, req.file.mimetype, req.file.size, '/uploads/' + req.file.filename, req.body.alt || '', req.body.title || '', req.user!.userId, width, height, thumbnail, srcsetField, uploadSite);
    // Object storage: push the original + derived variants to the remote store
    // and rewrite the URLs; local scratch files are removed afterwards.
    try {
      const cfg = getStorageConfig();
      if (cfg.provider === 's3') {
        const keyBase = new Date().toISOString().slice(0, 7) + '/' + id;
        const origUrl = await storeFile(keyBase + (path.extname(req.file.filename) || ''), fs.readFileSync(srcPath), req.file.mimetype);
        let remoteThumb: string | null = thumbnail;
        if (thumbnail) {
          const tp = uploadPath('thumbs/' + id + '-thumb.jpg');
          if (fs.existsSync(tp)) remoteThumb = await storeFile(keyBase + '-thumb.jpg', fs.readFileSync(tp), 'image/jpeg');
        }
        const remoteSrcset: Record<string, string> = {};
        if (srcsetField) {
          try {
            const parsed = JSON.parse(srcsetField);
            for (const [size, p] of Object.entries(parsed)) {
              const pp = uploadPath(String(p).replace(/^\/uploads\/thumbs\//, 'thumbs/'));
              if (fs.existsSync(pp)) remoteSrcset[size] = await storeFile(keyBase + '-w' + size + '.webp', fs.readFileSync(pp), 'image/webp');
            }
          } catch {}
        }
        db.prepare('UPDATE Media SET url = ?, thumbnail = ?, srcset = ? WHERE id = ?')
          .run(origUrl, remoteThumb, Object.keys(remoteSrcset).length ? JSON.stringify(remoteSrcset) : srcsetField, id);
        // Remove local scratch files (original + thumbs) — remote is now the source of truth
        try { fs.unlinkSync(srcPath); } catch {}
        try {
          const thumbsDir = uploadPath('thumbs');
          if (fs.existsSync(thumbsDir)) for (const f of fs.readdirSync(thumbsDir)) if (f.startsWith(id)) fs.unlinkSync(path.join(thumbsDir, f));
        } catch {}
      }
    } catch (e: any) { console.log('[Storage] remote upload failed:', e.message); }
    try { doAction('media_uploaded', id); } catch {}
    res.status(201).json(db.prepare('SELECT * FROM Media WHERE id = ?').get(id));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Public: download counter + redirect (used by the [download] shortcode).
// Works for local and object-storage media alike (Media.url is the target).
router.get('/:id/download', (req: AuthRequest, res: Response) => {
  try {
    const media = db.prepare('SELECT url FROM Media WHERE id = ?').get(req.params.id) as any;
    if (!media) { res.status(404).json({ error: 'Media not found' }); return; }
    db.prepare('UPDATE Media SET downloads = COALESCE(downloads, 0) + 1 WHERE id = ?').run(req.params.id);
    res.redirect(media.url);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Public: single media item detail (for attachment pages / preview)
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const media = db.prepare('SELECT m.*, u.username FROM Media m LEFT JOIN User u ON u.id = m.userId WHERE m.id = ?').get(req.params.id) as any;
    if (!media) { res.status(404).json({ error: 'Media not found' }); return; }
    // A site-scoped user must not read another site's file metadata by guessing an
    // id (this route used to be public; the bytes themselves stay public under
    // /uploads, which is by design).
    if (!userMayAccessSite(req.user!.userId, req.user!.role, media.siteId || undefined)) { res.status(403).json({ error: '无权访问该站点的媒体' }); return; }
    // Don't hand an anonymous caller the uploader's identity (user-enumeration
    // class — CVE-2023-45809 in Wagtail). Staff still see it via the auth'd list.
    const viewer = resolveOptionalUser(req);
    if (!viewer || !['admin', 'editor', 'author'].includes(viewer.role)) { delete media.username; delete media.userId; }
    ensureResponsiveVariants(media);
    // Image metadata, read from the file the first time details are opened (older
    // uploads have none, and re-reading every file at upgrade time would make an
    // upgrade slow for a field most rows never show). sharp exposes the colour
    // space, density, orientation and whether an EXIF block is present; it does
    // not decode the EXIF fields themselves (camera, GPS), so this is honest
    // "image metadata" and not a claim to have parsed EXIF.
    if (!media.meta && /^image\//.test(String(media.mimeType || ''))) {
      try {
        const filePath = resolveUploadUrl(media.url);
        if (filePath && fs.existsSync(filePath)) {
          const info = await sharp(filePath).metadata();
          const meta = {
            format: info.format, width: info.width, height: info.height,
            space: info.space, density: info.density, orientation: info.orientation,
            hasAlpha: info.hasAlpha, hasProfile: !!info.icc,
            // The block exists or it does not — a full EXIF reader is a different
            // dependency and a different promise.
            exifPresent: !!info.exif,
          };
          db.prepare('UPDATE Media SET meta = ? WHERE id = ?').run(JSON.stringify(meta), media.id);
          media.meta = JSON.stringify(meta);
        }
      } catch { /* metadata is a nicety; never fail the detail view for it */ }
    }
    if (media.meta) {
      try { media.meta = JSON.parse(media.meta); } catch { media.meta = null; }
    }
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
    const srcPath = uploadPath(media.filename);
    if (!fs.existsSync(srcPath)) { res.status(404).json({ error: 'File missing' }); return; }
    const thumbsDir = uploadPath('thumbs');
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
router.post('/bulk-edit', authenticate, requireCap('edit_media'), (req: AuthRequest, res: Response) => {
  try {
    const { ids, title, alt } = req.body || {};
    if (!Array.isArray(ids) || ids.length === 0) { res.status(400).json({ error: 'ids array required' }); return; }
    const sets: string[] = []; const vals: any[] = [];
    if (title !== undefined && String(title).trim() !== '') { sets.push('title = ?'); vals.push(String(title).slice(0, 255)); }
    if (alt !== undefined && String(alt).trim() !== '') { sets.push('alt = ?'); vals.push(String(alt).slice(0, 255)); }
    if (sets.length === 0) { res.status(400).json({ error: 'title or alt required' }); return; }
    for (const id of ids) { if (mediaScope(req, id) === 'denied') { res.status(403).json({ error: '无权操作该站点的媒体' }); return; } }
    vals.push(...ids);
    const result = db.prepare(`UPDATE Media SET ${sets.join(', ')} WHERE id IN (${ids.map(() => '?').join(',')})`).run(...vals);
    res.json({ success: true, updated: result.changes });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: update media metadata (title / alt text) — like the WP attachment edit screen
router.put('/:id', authenticate, requireCap('edit_media'), (req: AuthRequest, res: Response) => {
  try {
    const media = db.prepare('SELECT * FROM Media WHERE id = ?').get(req.params.id) as any;
    if (!media) { res.status(404).json({ error: 'Media not found' }); return; }
    if (!mayEditMedia(req, media)) { res.status(403).json({ error: '无权操作该站点的媒体' }); return; }
    const { title, alt } = req.body || {};
    const sets: string[] = []; const vals: any[] = [];
    if (title !== undefined) { sets.push('title = ?'); vals.push(String(title).slice(0, 255)); }
    if (alt !== undefined) { sets.push('alt = ?'); vals.push(String(alt).slice(0, 255)); }
    if (sets.length) {
      vals.push(req.params.id);
      db.prepare('UPDATE Media SET ' + sets.join(', ') + ' WHERE id = ?').run(...vals);
    }
    const updated = db.prepare('SELECT * FROM Media WHERE id = ?').get(req.params.id) as any;
    try { doAction('media_updated', req.params.id); } catch {}
    res.json(updated);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Remove the original file plus generated variants (thumbs are named by
// media id: {id}-thumb.jpg, {id}-w480.webp, …) so deletion leaves no orphans.
// Remote-stored media (object storage) deletes the objects instead.
function removeMediaFiles(media: any): void {
  if (media.url && !String(media.url).startsWith('/uploads/')) {
    try { deleteRemoteFile(keyFromUrl(media.url)); } catch {}
    try { if (media.thumbnail && !String(media.thumbnail).startsWith('/uploads/')) deleteRemoteFile(keyFromUrl(media.thumbnail)); } catch {}
    if (media.srcset) {
      try {
        const parsed = JSON.parse(media.srcset);
        for (const u of Object.values(parsed)) if (typeof u === 'string' && !u.startsWith('/uploads/')) deleteRemoteFile(keyFromUrl(u));
      } catch {}
    }
    return;
  }
  // Only delete inside the uploads directory; a tampered Media.url must not
  // let this escape into arbitrary paths.
  const filePath = resolveUploadUrl(media.url);
  // A failed unlink must not turn a completed row deletion into a 500: the
  // leftover file is an orphan (recoverable), and callers delete the row first.
  try { if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath); }
  catch (err: any) { logger.warn({ err: err?.message, url: media.url }, 'media file unlink failed'); }
  try {
    const thumbsDir = uploadPath('thumbs');
    if (fs.existsSync(thumbsDir)) {
      for (const f of fs.readdirSync(thumbsDir)) {
        if (f.startsWith(media.id)) fs.unlinkSync(path.join(thumbsDir, f));
      }
    }
  } catch {}
}

router.delete('/:id', authenticate, requireCap('delete_media'), (req: AuthRequest, res: Response) => {
  try {
    const media = db.prepare('SELECT * FROM Media WHERE id = ?').get(req.params.id) as any;
    if (!media) { res.status(404).json({ error: 'Media not found' }); return; }
    if (!mayEditMedia(req, media)) { res.status(403).json({ error: '无权操作该站点的媒体' }); return; }
    // Row first, then the files. The two cannot share a transaction, so pick the
    // order whose failure mode is survivable: a crash in between leaves an orphan
    // object, whereas deleting the file first would leave a row pointing at
    // nothing — a broken image on the site.
    withTransaction(() => { db.prepare('DELETE FROM Media WHERE id = ?').run(req.params.id); });
    removeMediaFiles(media);
    try { doAction('media_deleted', req.params.id); } catch {}
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: bulk delete media
router.post('/bulk-delete', authenticate, requireCap('delete_media'), (req: AuthRequest, res: Response) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) { res.status(400).json({ error: 'ids array required' }); return; }
    for (const id of ids) { if (mediaScope(req, id) === 'denied') { res.status(403).json({ error: '无权操作该站点的媒体' }); return; } }
    const rows = ids.map((id: string) => db.prepare('SELECT * FROM Media WHERE id = ?').get(id) as any).filter(Boolean);
    // Same ordering rule as the single-row delete: drop every row in one
    // transaction first, then unlink. A failure part-way through the old
    // loop left some rows deleted, some orphaned files and some rows pointing
    // at files that were already gone.
    withTransaction(() => { for (const m of rows) db.prepare('DELETE FROM Media WHERE id = ?').run(m.id); });
    for (const m of rows) {
      removeMediaFiles(m);
      try { doAction('media_deleted', m.id); } catch {}
    }
    res.json({ success: true, count: ids.length });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;
