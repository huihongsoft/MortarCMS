import { Router, Response } from 'express';
import { z } from 'zod';
import db, { cuid } from '../utils/db';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { verifyToken } from '../utils/jwt';
import { SiteRequest } from '../middleware/site';
import { activeThemeName, readTheme, themeOverrides } from './themes';

const router = Router();

// Credentials / system state: never returned by the general settings GET,
// even to admins (dedicated endpoints exist: /ai/settings, /api/db/*)
const CRED_KEYS = new Set(['ai_providers', 'ai_bindings', 'installed', 'active_plugins']);
const CRED_PREFIXES = ['jwt_', 'market_', 'db_'];
// Extra keys hidden from anonymous visitors (admin-only configuration)
const ADMIN_KEYS = new Set(['admin_email']);
// widgets_* holds admin-authored custom HTML — never expose it anonymously
const ADMIN_PREFIXES = ['smtp_', 'custom_templates', 'maintenance_', 'ai_', 'widgets_'];

// Settings that may never be written through the generic PUT endpoint (they
// are managed by dedicated code paths: install wizard, plugins, jwt, backups)
const BLOCKED_KEYS = new Set(['installed', 'active_plugins', '__proto__', 'constructor', 'prototype']);
const BLOCKED_PREFIXES = ['jwt_', 'db_', 'market_'];

const putSchema = z.record(z.string().min(1).max(100), z.union([z.string().max(100000), z.number(), z.boolean()]));

router.get('/', (req: AuthRequest & SiteRequest, res: Response) => {
  try {
    // Who is asking? App-password auth already populated req.user; parse a
    // Bearer token as well, so authenticated admins get the full view while
    // anonymous visitors only see non-sensitive keys.
    let role = req.user?.role || '';
    if (!role) {
      const header = req.headers.authorization || '';
      if (header.startsWith('Bearer ')) {
        const payload = verifyToken(header.slice(7));
        role = payload?.role || '';
      }
    }
    const isAdmin = role === 'admin';
    const hidden = (key: string) => CRED_PREFIXES.some(p => key.startsWith(p)) || CRED_KEYS.has(key)
      || (!isAdmin && (ADMIN_PREFIXES.some(p => key.startsWith(p)) || ADMIN_KEYS.has(key)));

    const settings = db.prepare('SELECT key, value FROM Setting').all() as any[];
    const map: Record<string, string> = {};
    settings.forEach((s: any) => {
      if (hidden(s.key)) return;
      map[s.key] = s.value;
    });
    // Site-level overrides on top of global defaults
    if (req.siteId) {
      const overrides = db.prepare('SELECT key, value FROM SiteSetting WHERE siteId = ?').all(req.siteId) as any[];
      overrides.forEach((s: any) => {
        if (hidden(s.key)) return;
        map[s.key] = s.value;
      });
    }
    // Active theme: name + effective settings (theme.json + overrides) + custom CSS
    const tname = activeThemeName();
    const theme = readTheme(tname);
    if (theme) {
      map.theme_name = theme.name;
      const overrides = themeOverrides(tname);
      // custom_css: prefer DB override, fall back to theme.json
      map.theme_custom_css = overrides['custom_css'] || theme.custom_css || '';
      const effective = { ...theme.settings, ...overrides };
      // Merge theme settings into the settings payload (primary_color etc.)
      for (const [k, v] of Object.entries(effective)) {
        if (k === 'custom_css') continue; // handled above as theme_custom_css
        map['theme_' + k] = v;
      }
      // Expose schema defaults so themes can read them before any override is saved
      for (const f of theme.settingsSchema || []) {
        if (map['theme_' + f.key] === undefined && f.default !== undefined) map['theme_' + f.key] = String(f.default);
      }
      // Theme hook sections: load from DB so the frontend can inject them
      const sectionRows = db.prepare("SELECT key, value FROM Setting WHERE key LIKE 'theme_section_%'").all() as any[];
      sectionRows.forEach((r: any) => {
        map[r.key] = r.value;
      });
    }
    res.json(map);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.put('/', authenticate, authorize('admin'), (req: AuthRequest, res: Response) => {
  try {
    const parsed = putSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: 'Invalid settings payload' }); return; }
    const entries = parsed.data;
    const bad = Object.keys(entries).find(k => BLOCKED_KEYS.has(k) || BLOCKED_PREFIXES.some(p => k.startsWith(p)));
    if (bad) { res.status(400).json({ error: 'Setting key is not writable via this endpoint: ' + bad }); return; }
    const upsert = db.prepare('INSERT INTO Setting (id, key, value) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value');
    for (const [key, value] of Object.entries(entries)) upsert.run(cuid(), key, String(value));
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Public: system health check (minimal — no memory/uptime/statistics so a
// public endpoint cannot leak instance details to anonymous visitors)
router.get('/health', (req: AuthRequest, res: Response) => {
  try {
    const db_test = db.prepare('SELECT 1').get();
    res.json({
      status: 'healthy',
      version: '0.1.0',
      database: db_test ? 'connected' : 'error',
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) { res.status(500).json({ status: 'error', error: err.message }); }
});

// Admin-only: site info (node version, platform, memory, table counts — these
// details are useful for diagnostics but must not be exposed publicly)
router.get('/info', authenticate, authorize('admin'), (req: AuthRequest, res: Response) => {
  try {
    const driver = (db as any).driver || 'sqlite';
    // Dialect-aware table listing
    const tables = driver === 'sqlite'
      ? db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all() as any[]
      : driver === 'mysql'
        ? db.prepare("SELECT table_name as name FROM information_schema.tables WHERE table_schema = DATABASE()").all() as any[]
        : db.prepare("SELECT tablename as name FROM pg_tables WHERE schemaname = 'public'").all() as any[];
    const postCount = (db.prepare("SELECT COUNT(*) as cnt FROM Post WHERE type='post'").get() as any)?.cnt || 0;
    const settings = db.prepare('SELECT key, value FROM Setting').all() as any[];
    const cfg: Record<string, string> = {};
    settings.forEach((s: any) => { cfg[s.key] = s.value; });
    // Real theme data instead of hardcoded defaults (matches the Appearance panel)
    let themeAvailable: string[] = ['default'];
    try {
      themeAvailable = require('fs').existsSync(require('path').join(__dirname, '../..', 'themes'))
        ? require('fs').readdirSync(require('path').join(__dirname, '../..', 'themes')).filter((d: string) => require('fs').existsSync(require('path').join(__dirname, '../..', 'themes', d, 'theme.json')))
        : ['default'];
    } catch {}
    res.json({
      site: { title: cfg.site_title, url: cfg.site_url, version: '0.1.0' },
      php: { version: process.version, platform: process.platform, arch: process.arch },
      database: { tables: tables.length, posts: postCount, engine: driver === 'sqlite' ? 'SQLite' : driver === 'mysql' ? 'MySQL/MariaDB' : 'PostgreSQL', size: '—' },
      server: { uptime: Math.floor(process.uptime()), memory: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB' },
      themes: { active: activeThemeName(), available: themeAvailable },
    });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;
