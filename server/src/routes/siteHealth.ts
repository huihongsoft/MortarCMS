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
      const driver = (db as any).driver || 'sqlite';
      const tables = driver === 'sqlite'
        ? db.prepare("SELECT name FROM sqlite_master WHERE type = 'table'").all() as any[]
        : driver === 'mysql'
          ? db.prepare("SELECT table_name as name FROM information_schema.tables WHERE table_schema = DATABASE()").all() as any[]
          : db.prepare("SELECT tablename as name FROM pg_tables WHERE schemaname = 'public'").all() as any[];
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

    // Database file size + index count
    try {
      const dbPath = db.prepare('PRAGMA database_list').all().find((r: any) => r.name === 'main')?.file || '';
      let dbSize = 0;
      if (dbPath && fs.existsSync(dbPath)) dbSize = fs.statSync(dbPath).size;
      const indexes = db.prepare("SELECT COUNT(*) as c FROM sqlite_master WHERE type = 'index'").get() as any;
      checks.databaseDetail = { ok: true, sizeKB: Math.round(dbSize / 1024), indexes: indexes.c };
    } catch (err: any) { checks.databaseDetail = { ok: false, error: err.message }; }

    // Uploads directory size
    try {
      const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
      let size = 0;
      if (fs.existsSync(uploadsDir)) {
        const walk = (d: string) => { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); const s = fs.statSync(p); if (s.isDirectory()) walk(p); else size += s.size; } };
        walk(uploadsDir);
      }
      checks.uploadsSize = { ok: true, sizeMB: Math.round(size / 1024 / 1024 * 10) / 10 };
    } catch (err: any) { checks.uploadsSize = { ok: false, error: err.message }; }

    // Ecosystem counts (themes + plugins) and backup presence
    try {
      const themesDir = path.join(__dirname, '..', '..', 'themes');
      const pluginsDir = path.join(__dirname, '..', '..', 'plugins');
      const themes = fs.existsSync(themesDir) ? fs.readdirSync(themesDir).filter(d => fs.existsSync(path.join(themesDir, d, 'theme.json'))).length : 0;
      const plugins = fs.existsSync(pluginsDir) ? fs.readdirSync(pluginsDir).filter(d => fs.existsSync(path.join(pluginsDir, d, 'plugin.json'))).length : 0;
      const backupDir = path.join(__dirname, '..', '..', 'backups');
      const backups = fs.existsSync(backupDir) ? fs.readdirSync(backupDir).filter(f => f.endsWith('.json') || f.endsWith('.zip') || f.endsWith('.db')).length : 0;
      checks.ecosystem = { ok: true, themes, plugins, backups };
    } catch (err: any) { checks.ecosystem = { ok: false, error: err.message }; }

    // Uploads directory writability (permissions check)
    try {
      const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
      if (!fs.existsSync(uploadsDir)) { checks.permissions = { ok: false, error: 'uploads directory missing' }; }
      else {
        const probe = path.join(uploadsDir, '.health-probe-' + Date.now());
        fs.writeFileSync(probe, 'ok');
        fs.unlinkSync(probe);
        checks.permissions = { ok: true, writable: true };
      }
    } catch (err: any) { checks.permissions = { ok: false, error: 'uploads not writable: ' + err.message }; }

    // Key dependency versions
    try {
      const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'package.json'), 'utf8'));
      const keyDeps: Record<string, string> = {};
      for (const d of ['express', 'better-sqlite3', 'sharp', 'zod', 'bcryptjs', 'jsonwebtoken', 'multer']) {
        if (pkg.dependencies?.[d]) keyDeps[d] = pkg.dependencies[d];
      }
      checks.dependencies = { ok: true, deps: keyDeps };
    } catch (err: any) { checks.dependencies = { ok: false, error: err.message }; }

    // Backup status (last manual/scheduled backup + recent files)
    try {
      const lastBackup = (db.prepare("SELECT value FROM Setting WHERE key = 'db_last_backup'").get() as any)?.value || null;
      const backupDir = path.join(__dirname, '..', '..', 'backups');
      let recent: { name: string; sizeKB: number; at: string }[] = [];
      if (fs.existsSync(backupDir)) {
        recent = fs.readdirSync(backupDir)
          .filter(f => f.endsWith('.json') || f.endsWith('.zip') || f.endsWith('.db'))
          .map((f: string) => { const p = path.join(backupDir, f); const st = fs.statSync(p); return { name: f, sizeKB: Math.round(st.size / 1024), at: st.mtime.toISOString() }; })
          .sort((a, b) => b.at.localeCompare(a.at)).slice(0, 5);
      }
      checks.backupStatus = { ok: true, lastBackup, recent };
    } catch (err: any) { checks.backupStatus = { ok: false, error: err.message }; }

    // Page cache + maintenance status (operational state)
    try {
      const cacheRow = db.prepare("SELECT value FROM Setting WHERE key = 'cache_enabled'").get() as any;
      const mmRow = db.prepare("SELECT value FROM Setting WHERE key = 'maintenance_mode'").get() as any;
      checks.operations = {
        ok: true,
        cache: cacheRow ? cacheRow.value !== '0' : true,
        maintenance: mmRow?.value === '1',
        uptimeMin: Math.round(process.uptime() / 60),
      };
    } catch (err: any) { checks.operations = { ok: false, error: err.message }; }

    const allOk = Object.values(checks).every((c: any) => c.ok !== false);
    res.json({ ok: allOk, checks });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;
