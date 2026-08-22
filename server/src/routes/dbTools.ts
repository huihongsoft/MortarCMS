import { Router, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import db, { listSlowQueries } from '../utils/db';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { assertSafeArchive } from '../utils/archive';
import { UPLOADS_DIR as uploadsDir } from '../utils/paths';

const router = Router();

// Admin: database status (driver, size, per-table rows, indexes, last maintenance)
router.get('/status', authenticate, authorize('admin'), (_req: AuthRequest, res: Response) => {
  try {
    const tables = (db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name").all() as any[]).map((t: any) => {
      const cnt = (db.prepare('SELECT COUNT(*) as cnt FROM "' + t.name + '"').get() as any)?.cnt || 0;
      const idx = (db.prepare("SELECT COUNT(*) as c FROM sqlite_master WHERE type='index' AND tbl_name = ?").get(t.name) as any)?.c || 0;
      return { name: t.name, rows: cnt, indexes: idx };
    });
    let size = 0; let journal = 'n/a'; let pageCount = 0; let pageSize = 0; let walSize = 0;
    try {
      if (db.raw) {
        const dataDir = path.join(__dirname, '../..', 'data');
        const dbFile = path.join(dataDir, 'mortar.db');
        if (fs.existsSync(dbFile)) size = fs.statSync(dbFile).size;
        const walFile = dbFile + '-wal';
        if (fs.existsSync(walFile)) walSize = fs.statSync(walFile).size;
        journal = ((db.raw.pragma('journal_mode') as any[])?.[0]?.journal_mode) || 'n/a';
        pageCount = ((db.raw.pragma('page_count') as any[])?.[0]?.page_count) || 0;
        pageSize = ((db.raw.pragma('page_size') as any[])?.[0]?.page_size) || 0;
      }
    } catch {}
    const lastOpt = (db.prepare("SELECT value FROM Setting WHERE key = 'db_last_optimized'").get() as any)?.value || null;
    const lastBackup = (db.prepare("SELECT value FROM Setting WHERE key = 'db_last_backup'").get() as any)?.value || null;
    res.json({
      driver: (db as any).driver || 'sqlite',
      size,
      walSize,
      journal,
      pageCount,
      pageSize,
      tables,
      totalRows: tables.reduce((s, t) => s + t.rows, 0),
      lastOptimized: lastOpt,
      lastBackup: lastBackup,
    });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: recently recorded slow queries (>150ms)
router.get('/slow-queries', authenticate, authorize('admin'), (_req: AuthRequest, res: Response) => {
  try {
    res.json({ slow: listSlowQueries() });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: SQLite integrity quick check
router.get('/integrity', authenticate, authorize('admin'), (_req: AuthRequest, res: Response) => {
  try {
    if ((db as any).driver !== 'sqlite' || !db.raw) {
      res.json({ ok: false, detail: 'SQLite-only check — unavailable for the current driver' });
      return;
    }
    const result = (db.raw.pragma('quick_check') || []) as any[];
    const ok = result.length === 1 && result[0]?.quick_check === 'ok';
    res.json({ ok, detail: result[0]?.quick_check || 'unavailable' });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.get('/optimize', authenticate, authorize('admin'), (_req: AuthRequest, res: Response) => {
  try {
    db.pragma('optimize');
    db.pragma('vacuum');
    // Remote drivers have no pragma; vacuum is SQLite-only. Run equivalent maintenance.
    if ((db as any).driver !== 'sqlite') db.exec('ANALYZE');
    const driver = (db as any).driver || 'sqlite';
    const tables = (driver === 'sqlite'
      ? db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all() as any[]
      : driver === 'mysql'
        ? db.prepare("SELECT table_name as name FROM information_schema.tables WHERE table_schema = DATABASE() ORDER BY table_name").all() as any[]
        : db.prepare("SELECT tablename as name FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename").all() as any[]);
    const stats = tables.map((t: any) => ({
      table: t.name,
      rows: (db.prepare('SELECT COUNT(*) as cnt FROM ' + t.name).get() as any)?.cnt || 0,
    }));
    db.prepare("INSERT INTO Setting (id, key, value) VALUES ('db_last_optimized', 'db_last_optimized', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").run(new Date().toISOString());
    res.json({ success: true, optimized: true, stats });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: list backups in the backups folder
router.get('/backups', authenticate, authorize('admin'), (_req: AuthRequest, res: Response) => {
  try {
    const backupDir = path.join(__dirname, '../..', 'backups');
    let files: { name: string; sizeKB: number; at: string }[] = [];
    if (fs.existsSync(backupDir)) {
      files = fs.readdirSync(backupDir)
        .filter(f => f.endsWith('.db') || f.endsWith('.zip') || f.endsWith('.json'))
        .map((f: string) => { const p = path.join(backupDir, f); const st = fs.statSync(p); return { name: f, sizeKB: Math.round(st.size / 1024), at: st.mtime.toISOString() }; })
        .sort((a, b) => b.at.localeCompare(a.at));
    }
    const retention = parseInt((db.prepare("SELECT value FROM Setting WHERE key = 'backup_retention'").get() as any)?.value || '10') || 10;
    res.json({ backups: files, retention });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: download a backup file (path-traversal safe)
router.get('/backups/:name', authenticate, authorize('admin'), (req: AuthRequest, res: Response) => {
  try {
    const name = path.basename(req.params.name);
    if (!/^[a-zA-Z0-9._-]+$/.test(name)) { res.status(400).json({ error: 'Invalid backup name' }); return; }
    const file = path.join(__dirname, '../..', 'backups', name);
    if (!fs.existsSync(file)) { res.status(404).json({ error: 'Backup not found' }); return; }
    res.download(file, name);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: delete a backup file
router.delete('/backups/:name', authenticate, authorize('admin'), (req: AuthRequest, res: Response) => {
  try {
    const name = path.basename(req.params.name);
    if (!/^[a-zA-Z0-9._-]+$/.test(name)) { res.status(400).json({ error: 'Invalid backup name' }); return; }
    const file = path.join(__dirname, '../..', 'backups', name);
    if (!fs.existsSync(file)) { res.status(404).json({ error: 'Backup not found' }); return; }
    fs.unlinkSync(file);
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: download database backup
router.get('/backup', authenticate, authorize('admin'), (_req: AuthRequest, res: Response) => {
  try {
    // Flush the WAL first so the copied file contains the latest transactions
    db.pragma('wal_checkpoint(TRUNCATE)');
    const dbPath = require('path').join(__dirname, '../../data/mortar.db');
    const backupPath = '/tmp/mortar-backup.db';
    require('fs').copyFileSync(dbPath, backupPath);
    try { db.prepare("INSERT INTO Setting (id, key, value) VALUES ('db_last_backup', 'db_last_backup', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").run(new Date().toISOString()); } catch {}
    res.download(backupPath, 'mortar-backup-' + new Date().toISOString().slice(0,10) + '.db');
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: download a full backup (database + uploads) as a zip
router.get('/backup-full', authenticate, authorize('admin'), (_req: AuthRequest, res: Response) => {
  try {
    const tmpZip = path.join(require('os').tmpdir(), 'mortar-backup-' + Date.now() + '.zip');
    db.pragma('wal_checkpoint(TRUNCATE)');
    const files = ['data/mortar.db'];
    if (fs.existsSync(uploadsDir)) {
      for (const f of fs.readdirSync(uploadsDir)) {
        if (f === 'thumbs' || f === 'import-tmp') continue;
        files.push('uploads/' + f);
      }
    }
    execFileSync('zip', ['-q', '-j', tmpZip, ...files.map(f => path.join(__dirname, '../..', f))]);
    res.setHeader('Content-Disposition', 'attachment; filename="mortar-backup-' + new Date().toISOString().slice(0, 10) + '.zip"');
    res.type('application/zip');
    res.sendFile(tmpZip, () => { try { fs.unlinkSync(tmpZip); } catch {} });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: restore a full backup zip (database + uploads)
router.post('/restore-full', authenticate, authorize('admin'), upload.single('file'), (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) { res.status(400).json({ error: 'No file uploaded' }); return; }
    const tmpDir = path.join(require('os').tmpdir(), 'mortar-restore-' + Date.now());
    fs.mkdirSync(tmpDir, { recursive: true });
    // Zip-slip guard: reject traversal entries BEFORE anything hits the disk
    const archiveEntries = assertSafeArchive(req.file.path);
    // Bound the archive (zip bomb / resource exhaustion): entry count first
    if (archiveEntries.length > 5000) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
      res.status(400).json({ error: 'Invalid backup: too many file entries' });
      return;
    }
    execFileSync('unzip', ['-q', req.file.path, '-d', tmpDir]);
    // zip-slip guard: every entry must be a plain file in the extraction root
    // (no nested dirs, no ../, no absolute paths) before it can overwrite
    // uploads. Directories and symlinks are rejected too: copyFileSync would
    // follow a symlink and copy a server-readable file into public /uploads.
    const tmpEntries = fs.readdirSync(tmpDir);
    let totalBytes = 0;
    const badEntries = tmpEntries.filter((f: string) => {
      if (f === '..' || !/^[a-zA-Z0-9._-]+$/.test(f) || f.startsWith('/')) return true;
      const st = fs.lstatSync(path.join(tmpDir, f));
      if (!st.isFile()) return true;
      totalBytes += st.size;
      return false;
    });
    if (badEntries.length > 0 || totalBytes > 1024 * 1024 * 1024) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
      res.status(400).json({ error: 'Invalid backup: unsafe file entries' });
      return;
    }
    const dbFile = path.join(tmpDir, 'mortar.db');
    if (!fs.existsSync(dbFile)) { res.status(400).json({ error: 'Invalid backup: mortar.db not found' }); return; }
    const dataDir = path.join(__dirname, '../..', 'data');
    const liveDb = path.join(dataDir, 'mortar.db');
    db.pragma('wal_checkpoint(TRUNCATE)');
    for (const f of fs.readdirSync(tmpDir)) {
      if (f === 'mortar.db' || f === 'mortar.db-wal' || f === 'mortar.db-shm') continue;
      const dest = path.join(uploadsDir, f);
      if (fs.existsSync(dest)) fs.unlinkSync(dest);
      fs.copyFileSync(path.join(tmpDir, f), dest);
    }
    const backupName = 'mortar.db.bak-' + Date.now();
    fs.copyFileSync(liveDb, path.join(dataDir, backupName));
    fs.copyFileSync(dbFile, liveDb);
    fs.rmSync(tmpDir, { recursive: true, force: true });
    try { fs.unlinkSync(req.file.path); } catch {}
    res.json({ success: true, message: 'Backup restored. Restart required.', backup: backupName });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: reset the site to a fresh empty state — wipes all content
// (posts/categories/tags/media/comments/menus/links/AI data/activity/stats)
// but keeps user accounts, roles, system settings and site structure.
router.post('/reset-content', authenticate, authorize('admin'), (_req: AuthRequest, res: Response) => {
  try {
    const { resetSite } = require('../utils/demo');
    const stats = resetSite();
    res.json({ success: true, message: 'Site content reset', stats });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;
