import { Router, Response } from 'express';
import db, { cuid } from '../utils/db';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { SiteRequest } from '../middleware/site';
import { activeThemeName, readTheme, themeOverrides } from './themes';

const router = Router();

router.get('/', (req: SiteRequest, res: Response) => {
  try {
    // Only expose non-sensitive keys to the public
    const SENSITIVE_PREFIXES = ['smtp_', 'jwt_', 'market_', 'active_plugins', 'custom_templates', 'maintenance_'];
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
      map.theme_custom_css = theme.custom_css || '';
      const effective = { ...theme.settings, ...themeOverrides(tname) };
      // Merge theme settings into the settings payload (primary_color etc.)
      for (const [k, v] of Object.entries(effective)) {
        if (k === 'custom_css') continue;
        map['theme_' + k] = v;
      }
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

// Public: system health check
router.get('/health', (req: AuthRequest, res: Response) => {
  try {
    const db_test = db.prepare('SELECT 1').get();
    const postCount = (db.prepare("SELECT COUNT(*) as cnt FROM Post WHERE type='post'").get() as any)?.cnt || 0;
    const userCount = (db.prepare('SELECT COUNT(*) as cnt FROM User').get() as any)?.cnt || 0;
    const mediaCount = (db.prepare('SELECT COUNT(*) as cnt FROM Media').get() as any)?.cnt || 0;
    res.json({
      status: 'healthy',
      version: '0.1.0',
      database: !!db_test ? 'connected' : 'error',
      stats: { posts: postCount, users: userCount, media: mediaCount },
      memory: process.memoryUsage(),
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) { res.status(500).json({ status: 'error', error: err.message }); }
});

// Public: site info
router.get('/info', (req: AuthRequest, res: Response) => {
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
    res.json({
      site: { title: cfg.site_title, url: cfg.site_url, version: '0.1.0' },
      php: { version: process.version, platform: process.platform, arch: process.arch },
      database: { tables: tables.length, posts: postCount, engine: driver === 'sqlite' ? 'SQLite' : driver === 'mysql' ? 'MySQL/MariaDB' : 'PostgreSQL', size: '—' },
      server: { uptime: Math.floor(process.uptime()), memory: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB' },
      themes: { active: 'default', available: ['default'] },
    });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;
