import { Router, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import db from '../utils/db';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

router.get('/optimize', authenticate, authorize('admin'), (_req: AuthRequest, res: Response) => {
  try {
    db.pragma('optimize');
    db.pragma('vacuum');
    // Remote drivers have no pragma; vacuum is SQLite-only. Run equivalent maintenance.
    if ((db as any).driver !== 'sqlite') db.exec('ANALYZE');
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all() as any[];
    const stats = tables.map((t: any) => ({
      table: t.name,
      rows: (db.prepare('SELECT COUNT(*) as cnt FROM ' + t.name).get() as any)?.cnt || 0,
    }));
    res.json({ success: true, optimized: true, stats });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: download database backup
router.get('/backup', authenticate, authorize('admin'), (_req: AuthRequest, res: Response) => {
  try {
    const dbPath = require('path').join(__dirname, '../../data/mortar.db');
    const backupPath = '/tmp/mortar-backup.db';
    require('fs').copyFileSync(dbPath, backupPath);
    res.download(backupPath, 'mortar-backup-' + new Date().toISOString().slice(0,10) + '.db');
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: download a full backup (database + uploads) as a zip
router.get('/backup-full', authenticate, authorize('admin'), (_req: AuthRequest, res: Response) => {
  try {
    const uploadsDir = path.join(__dirname, '../..', 'uploads');
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
    execFileSync('unzip', ['-q', req.file.path, '-d', tmpDir]);
    const dbFile = path.join(tmpDir, 'mortar.db');
    if (!fs.existsSync(dbFile)) { res.status(400).json({ error: 'Invalid backup: mortar.db not found' }); return; }
    const dataDir = path.join(__dirname, '../..', 'data');
    const liveDb = path.join(dataDir, 'mortar.db');
    db.pragma('wal_checkpoint(TRUNCATE)');
    const uploadsDir = path.join(__dirname, '../..', 'uploads');
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

export default router;
