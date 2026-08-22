import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import db, { cuid, reconfigureDb } from '../utils/db';
import { authenticate, requireCap, authorize, AuthRequest } from '../middleware/auth';

const router = Router();

function installed(): boolean {
  try {
    const row = db.prepare("SELECT value FROM Setting WHERE key = 'installed'").get() as any;
    return !!(row && row.value === '1');
  } catch { return false; }
}

// Public: installation status
router.get('/status', (_req: AuthRequest, res: Response) => {
  try {
    res.json({ installed: installed() });
  } catch { res.json({ installed: false }); }
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
      const cfg = dbConfig || {};
      if (!cfg.host || !cfg.user || !cfg.database) { res.status(400).json({ error: 'Database host, user and name are required' }); return; }
      databaseUrl = dbType + '://' + encodeURIComponent(cfg.user) + ':' + encodeURIComponent(cfg.password || '') + '@' + cfg.host + ':' + (cfg.port || (dbType === 'mysql' ? '3306' : '5432')) + '/' + cfg.database;
    }
    reconfigureDb(databaseUrl);
    // 2. Initialize tables on the (possibly new) driver
    const { initDB } = require('../utils/db');
    initDB();
    // 3. Create the admin account + base settings
    const password = await bcrypt.hash(adminPassword, 12);
    const adminId = cuid();
    const exists = db.prepare('SELECT id FROM User WHERE username = ? OR email = ?').get(adminUsername || 'admin', adminEmail) as any;
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
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin only: switch the database driver at runtime (keeps the site installed)
router.post('/switch', authenticate, authorize('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { dbType, dbConfig } = req.body || {};
    if (dbType !== 'sqlite' && dbType !== 'mysql' && dbType !== 'postgres') { res.status(400).json({ error: 'Invalid database type' }); return; }
    let databaseUrl = '';
    if (dbType === 'mysql' || dbType === 'postgres') {
      const cfg = dbConfig || {};
      if (!cfg.host || !cfg.user || !cfg.database) { res.status(400).json({ error: 'Database host, user and name are required' }); return; }
      databaseUrl = dbType + '://' + encodeURIComponent(cfg.user) + ':' + encodeURIComponent(cfg.password || '') + '@' + cfg.host + ':' + (cfg.port || (dbType === 'mysql' ? '3306' : '5432')) + '/' + cfg.database;
    }
    reconfigureDb(databaseUrl);
    const { initDB } = require('../utils/db');
    initDB();
    // Mark installed on the new database (the site remains installed)
    const upsert = db.prepare("INSERT INTO Setting (id, key, value) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value");
    upsert.run('installed', 'installed', '1');
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
