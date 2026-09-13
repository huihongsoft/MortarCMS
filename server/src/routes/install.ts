import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import db, { cuid, reconfigureDb, withTransaction } from '../utils/db';
import { authenticate, requireCap, authorize, AuthRequest } from '../middleware/auth';

const router = Router();

// Connection fields are written into DATABASE_URL (and from there into .env).
// Reject empty/oversized values and any control character or whitespace so a
// crafted host/database cannot inject a new line into the .env file.
function safeDbField(v: unknown): string | null {
  const s = String(v ?? '');
  if (!s || s.length > 255 || /[\s\x00-\x1f\x7f]/.test(s)) return null;
  return s;
}

// Build a DSN with every component that can contain reserved characters
// percent-encoded (host stays raw so IPv6 literals keep their colons).
function buildDsn(dbType: string, cfg: any): { url: string } | { error: string } {
  const host = safeDbField(cfg?.host);
  const user = safeDbField(cfg?.user);
  const database = safeDbField(cfg?.database);
  if (!host || !user || !database) return { error: 'Invalid database host, user or name' };
  const defPort = dbType === 'mysql' ? '3306' : '5432';
  const port = String(cfg?.port || defPort).replace(/[^0-9]/g, '') || defPort;
  return { url: dbType + '://' + encodeURIComponent(user) + ':' + encodeURIComponent(cfg?.password || '') + '@' + host + ':' + port + '/' + encodeURIComponent(database) };
}

function installed(): boolean {
  try {
    const row = db.prepare("SELECT value FROM Setting WHERE key = 'installed'").get() as any;
    return !!(row && row.value === '1');
  } catch {
    // Fail closed: if the settings store is unreadable we must NOT treat the
    // site as uninstalled. Doing so would expose the public installer, letting
    // anyone re-create the admin account (or point the site at another DB).
    return true;
  }
}

// Guard against two concurrent installs racing past the `installed` check
// (both would create an admin account / seed settings). Single-instance only.
let installing = false;

// Public: installation status
router.get('/status', (_req: AuthRequest, res: Response) => {
  try {
    res.json({ installed: installed() });
  } catch { res.json({ installed: true }); }
});

// Admin: current database configuration
router.get('/', authenticate, authorize('admin'), (_req: AuthRequest, res: Response) => {
  try {
    const driver = (db as any).driver || 'sqlite';
    const url = process.env.DATABASE_URL || '';
    const m = url.match(/^(mysql|postgres):\/\/([^:]+):[^@]+@([^:/]+)(?::(\d+))?\/([^/?]+)/);
    res.json({
      driver,
      host: m ? m[3] : undefined,
      port: m ? m[4] : undefined,
      database: m ? m[5] : 'server/data/mortar.db',
      installed: installed(),
      switchHint: 'Run the installer wizard to change the database (admin only).',
    });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Public: perform installation (database choice + site info + admin account)
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    if (installed()) { res.status(400).json({ error: 'Already installed' }); return; }
    const { dbType, dbConfig, siteTitle, siteDescription, adminEmail, adminPassword, adminUsername, sampleData } = req.body || {};
    if (!siteTitle || !adminEmail || !adminPassword) {
      res.status(400).json({ error: 'Site title, admin email and a password are required' }); return;
    }
    if (adminPassword.length < 8 || !/[a-zA-Z]/.test(adminPassword) || !/\d/.test(adminPassword)) {
      res.status(400).json({ error: 'Admin password must be at least 8 characters with letters and numbers' }); return;
    }
    // 1. Reconfigure the database driver per user choice (SQLite default / MySQL / PostgreSQL)
    let databaseUrl = '';
    if (dbType === 'mysql' || dbType === 'postgres') {
      const built = buildDsn(dbType, dbConfig || {});
      if ('error' in built) { res.status(400).json({ error: built.error }); return; }
      databaseUrl = built.url;
    }
    // Claim the install slot before mutating anything (reconfigureDb rewrites
    // .env and swaps the driver); a concurrent request must not race past us.
    if (installing) { res.status(409).json({ error: 'Installation already in progress' }); return; }
    installing = true;
    try {
    reconfigureDb(databaseUrl);
    // 2. Initialize tables on the (possibly new) driver
    const { initDB } = require('../utils/db');
    initDB();
    // 3. Create the admin account + base settings
    const password = await bcrypt.hash(adminPassword, 12);
    const adminId = cuid();
    const exists = db.prepare('SELECT id FROM User WHERE username = ? OR email = ?').get(adminUsername || 'admin', adminEmail) as any;
    // The admin account, the base settings and the default site are written
    // as one unit — a partial install must not leave an unusable site.
    withTransaction(() => {
      if (!exists) db.prepare('INSERT INTO User (id, username, email, password, role) VALUES (?, ?, ?, ?, ?)').run(adminId, adminUsername || 'admin', adminEmail, password, 'admin');
      const upsert = db.prepare("INSERT INTO Setting (id, key, value) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value");
      upsert.run(cuid(), 'site_title', siteTitle);
      upsert.run(cuid(), 'site_description', siteDescription || '');
      upsert.run(cuid(), 'admin_email', adminEmail);
      upsert.run(cuid(), 'installed', '1');
      // 4. Fresh default site
      const hasSite = db.prepare('SELECT COUNT(*) as c FROM Site').get() as any;
      if (!hasSite || hasSite.c === 0) {
        const siteExists = db.prepare('SELECT id FROM Site WHERE slug = ?').get('default') as any;
        if (!siteExists) db.prepare('INSERT INTO Site (id, name, slug, domain, isPrimary, active) VALUES (?, ?, ?, ?, 1, 1)').run(cuid(), siteTitle, 'default', 'localhost:3001');
      }
    });
    // 5. Optional demo data (sample posts/categories/tags/comments/menu/links
    //    + softstore theme demo). Best-effort: never fail the install.
    let demo: { ok: boolean; stats?: Record<string, number> } = { ok: false };
    if (sampleData === true) { // strict boolean — 'false' as a string must not import
      try {
        const { importDemoData } = require('../utils/demo');
        const stats = importDemoData();
        demo = { ok: true, stats: { posts: stats.posts, categories: stats.categories, tags: stats.tags, comments: stats.comments, menus: stats.menus, links: stats.links } };
      } catch (err: any) { console.error('[install] demo data import failed:', err.message); }
    }
    res.json({ success: true, message: 'Mortar installed. Redirecting...', demo });
    } finally { installing = false; }
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin only: switch the database driver at runtime (keeps the site installed)
router.post('/switch', authenticate, authorize('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { dbType, dbConfig } = req.body || {};
    if (dbType !== 'sqlite' && dbType !== 'mysql' && dbType !== 'postgres') { res.status(400).json({ error: 'Invalid database type' }); return; }
    let databaseUrl = '';
    if (dbType === 'mysql' || dbType === 'postgres') {
      const built = buildDsn(dbType, dbConfig || {});
      if ('error' in built) { res.status(400).json({ error: built.error }); return; }
      databaseUrl = built.url;
    }
    // Same lock as the installer: switching opens a new driver and closes the
    // old one, so it must not race a concurrent install/switch.
    if (installing) { res.status(409).json({ error: 'Another database operation is in progress' }); return; }
    installing = true;
    try {
      reconfigureDb(databaseUrl);
      const { initDB } = require('../utils/db');
      initDB();
      // Mark installed on the new database (the site remains installed)
      const upsert = db.prepare("INSERT INTO Setting (id, key, value) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value");
      upsert.run('installed', 'installed', '1');
    } finally { installing = false; }
    res.json({ success: true, message: 'Database switched. Note: the new database starts empty — migrate content via Export/Import if needed.', driver: dbType });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin only: remove the installed marker (re-run the install wizard)
router.post('/reset', authenticate, authorize('admin'), (_req: AuthRequest, res: Response) => {
  try {
    db.prepare("DELETE FROM Setting WHERE key = 'installed'").run();
    res.json({ success: true, message: 'Installation marker removed. Restart to re-run the wizard.' });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export { installed };
export default router;
