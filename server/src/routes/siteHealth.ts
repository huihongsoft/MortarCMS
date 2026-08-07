import { Router, Response } from 'express';
import fs from 'fs';
import path from 'path';
import os from 'os';
import db from '../utils/db';
import { authenticate, requireCap, AuthRequest } from '../middleware/auth';

const router = Router();

// Admin: detailed site health check
router.get('/health/detail', authenticate, requireCap('manage_options'), (_req: AuthRequest, res: Response) => {
  try {
    const checks: Record<string, any> = {};

    // Database
    try {
      db.prepare('SELECT 1').get();
      const tables = db.prepare("SELECT name FROM sqlite_master WHERE type = 'table'").all() as any[];
      checks.database = { ok: true, tables: tables.length };
    } catch (err: any) { checks.database = { ok: false, error: err.message }; }

    // Counts
    try {
      checks.counts = {
        posts: (db.prepare("SELECT COUNT(*) as c FROM Post WHERE type = 'post'").get() as any).c,
        pages: (db.prepare("SELECT COUNT(*) as c FROM Post WHERE type = 'page'").get() as any).c,
        comments: (db.prepare('SELECT COUNT(*) as c FROM Comment').get() as any).c,
        users: (db.prepare('SELECT COUNT(*) as c FROM User').get() as any).c,
        media: (db.prepare('SELECT COUNT(*) as c FROM Media').get() as any).c,
        pendingComments: (db.prepare("SELECT COUNT(*) as c FROM Comment WHERE status = 'pending'").get() as any).c,
        revisions: (db.prepare('SELECT COUNT(*) as c FROM Revision').get() as any).c,
      };
    } catch (err: any) { checks.counts = { ok: false, error: err.message }; }

    // Uploads directory writable
    try {
      const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
      if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
      const probe = path.join(uploadsDir, '.write-test-' + Date.now());
      fs.writeFileSync(probe, 'ok');
      fs.unlinkSync(probe);
      checks.uploads = { ok: true, dir: uploadsDir };
    } catch (err: any) { checks.uploads = { ok: false, error: err.message }; }

    // Disk space
    try {
      const stat = fs.statfsSync(path.join(__dirname, '..', '..'));
      const freeGB = (stat.bavail * stat.bsize) / 1024 / 1024 / 1024;
      checks.disk = { ok: freeGB > 1, freeGB: Math.round(freeGB * 10) / 10 };
    } catch (err: any) { checks.disk = { ok: false, error: err.message }; }

    // Environment
    checks.environment = {
      node: process.version,
      platform: os.platform() + ' ' + os.release(),
      arch: os.arch(),
      uptimeMin: Math.round(process.uptime() / 60),
      memoryMB: Math.round(process.memoryUsage().rss / 1024 / 1024),
    };

    // Mail config (SMTP settings presence)
    const settings = db.prepare('SELECT key, value FROM Setting WHERE key LIKE ? OR key LIKE ?').all('smtp_%', 'mail_%') as any[];
    checks.mail = { configured: settings.length > 0, keys: settings.map((s: any) => s.key) };

    const allOk = Object.values(checks).every((c: any) => c.ok !== false);
    res.json({ ok: allOk, checks });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;
