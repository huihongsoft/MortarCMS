import { Router, Response } from 'express';
import db, { cuid } from '../utils/db';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { SiteRequest } from '../middleware/site';
import { activeThemeName, readTheme, themeOverrides } from './themes';

const router = Router();

router.get('/', (req: SiteRequest, res: Response) => {
  try {
    // Only expose non-sensitive keys to the public
    const SENSITIVE_PREFIXES = ['smtp_', 'jwt_', 'market_', 'active_plugins', 'custom_templates', 'maintenance_', 'ai_'];
    const settings = db.prepare('SELECT key, value FROM Setting').all() as any[];
    const map: Record<string, string> = {};
    settings.forEach((s: any) => {
      if (SENSITIVE_PREFIXES.some(p => s.key.startsWith(p))) return;
      map[s.key] = s.value;
    });
    // Site-level overrides on top of global defaults
    if (req.siteId) {
      const overrides = db.prepare('SELECT key, value FROM SiteSetting WHERE siteId = ?').all(req.siteId) as any[];
      overrides.forEach((s: any) => {
        if (SENSITIVE_PREFIXES.some(p => s.key.startsWith(p))) return;
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
    const entries = req.body as Record<string, string>;
    const upsert = db.prepare('INSERT INTO Setting (id, key, value) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value');
    for (const [key, value] of Object.entries(entries)) upsert.run(cuid(), key, value);
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
      database: !!db_test ? 'connected' : 'error',
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
