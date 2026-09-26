import { Router, Response } from 'express';
import { z } from 'zod';
import db, { cuid } from '../utils/db';
import { authenticate, requireCap, resolveOptionalUser, AuthRequest } from '../middleware/auth';
import { SiteRequest } from '../middleware/site';
import { activeThemeName, readTheme, themeOverrides } from './themes';
import { isHiddenSettingKey } from '../utils/settingsVisibility';
import { APP_VERSION } from '../utils/config';
import { normalizePermalinkStructure, permalinkStructureError } from '../utils/slug';
import { purgeAllCaches } from '../utils/cache';
import { doAction } from '../utils/hooks';

const router = Router();

// Settings that may never be written through the generic PUT endpoint (they
// are managed by dedicated code paths: install wizard, plugins, jwt, backups)
const BLOCKED_KEYS = new Set(['installed', 'active_plugins', '__proto__', 'constructor', 'prototype']);
const BLOCKED_PREFIXES = ['jwt_', 'db_', 'market_'];

const putSchema = z.record(z.string().min(1).max(100), z.union([z.string().max(100000), z.number(), z.boolean()]));

router.get('/', (req: AuthRequest & SiteRequest, res: Response) => {
  try {
    // Who is asking? resolveOptionalUser applies the same checks as the auth
    // middleware (blacklist, session version), so a revoked admin token cannot
    // unlock the admin view.
    const role = resolveOptionalUser(req)?.role || '';
    const isAdmin = role === 'admin';
    const hidden = (key: string) => isHiddenSettingKey(key, isAdmin);
    // The admin panel edits any site's effective set, not just the one its own
    // host resolves to — only an admin may ask for another site this way.
    const askedSiteId = String((req.query as any).siteId || '').trim();
    const scopedSiteId = isAdmin && askedSiteId ? askedSiteId : req.siteId;

    const settings = db.prepare('SELECT key, value FROM Setting').all() as any[];
    const map: Record<string, string> = {};
    settings.forEach((s: any) => {
      if (hidden(s.key)) return;
      map[s.key] = s.value;
    });
    // Report the structure in the form that is actually in effect. The PUT
    // endpoint stores only validated values, but a value stored before the rules
    // tightened (e.g. /page/%slug%, reserved once page/:slug was noticed) is
    // ignored by every URL builder — returning the raw row would show the admin a
    // prefix the site does not serve, with no hint that it is dead.
    if (map.permalink_structure !== undefined) {
      map.permalink_structure = normalizePermalinkStructure(map.permalink_structure) || '';
    }
    // Site-level overrides on top of global defaults. permalink_structure is
    // excluded: it is global-only (see GLOBAL_ONLY_SETTINGS in routes/sites.ts),
    // and the server builds post paths from the global row — letting an override
    // through here would advertise a prefix in the frontend that the routes do
    // not recognise.
    if (scopedSiteId) {
      const overrides = db.prepare('SELECT key, value FROM SiteSetting WHERE siteId = ?').all(scopedSiteId) as any[];
      overrides.forEach((s: any) => {
        if (hidden(s.key) || s.key === 'permalink_structure') return;
        map[s.key] = s.value;
      });
    }
    // Active theme: name + effective settings (theme.json + overrides) + custom CSS.
    // Both are resolved for the site being asked about, so a site can run a
    // different theme and restyle it without touching the other sites.
    const tname = activeThemeName(scopedSiteId);
    const theme = readTheme(tname);
    if (theme) {
      map.theme_name = theme.name;
      const overrides = themeOverrides(tname, scopedSiteId);
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
      // Theme hook sections: install-wide rows first, then this site's own (so a
      // section can be shown on one site only).
      const sectionRows = db.prepare("SELECT key, value FROM Setting WHERE key LIKE 'theme_section_%'").all() as any[];
      sectionRows.forEach((r: any) => {
        map[r.key] = r.value;
      });
      if (scopedSiteId) {
        const ownSections = db.prepare("SELECT key, value FROM SiteSetting WHERE siteId = ? AND key LIKE 'theme_section_%'").all(scopedSiteId) as any[];
        ownSections.forEach((r: any) => {
          map[r.key] = r.value;
        });
      }
    }
    res.json(map);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.put('/', authenticate, requireCap('manage_system'), (req: AuthRequest, res: Response) => {
  try {
    const parsed = putSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: 'Invalid settings payload' }); return; }
    const entries = parsed.data;
    const bad = Object.keys(entries).find(k => BLOCKED_KEYS.has(k) || BLOCKED_PREFIXES.some(p => k.startsWith(p)));
    if (bad) { res.status(400).json({ error: 'Setting key is not writable via this endpoint: ' + bad }); return; }
    // The permalink structure drives routing, link generation and SEO, so an
    // unusable value is refused with a reason instead of being stored and then
    // silently ignored (which is how this setting behaved before it was wired up).
    if (entries.permalink_structure !== undefined) {
      const problem = permalinkStructureError(entries.permalink_structure);
      if (problem) { res.status(400).json({ error: problem }); return; }
      const normalized = normalizePermalinkStructure(entries.permalink_structure);
      entries.permalink_structure = normalized || '';
    }
    const upsert = db.prepare('INSERT INTO Setting (id, key, value) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value');
    for (const [key, value] of Object.entries(entries)) upsert.run(cuid(), key, String(value));
    // Settings feed the generated output (sitemap, feeds, SEO meta, page HTML):
    // site_url/site_title/permalinks all appear in them, and the sitemap cache is
    // deliberately NOT part of the content purge — so writing settings has to
    // flush everything, or a permalink change keeps advertising the old URLs
    // until the 5 minute sitemap TTL expires.
    try { purgeAllCaches(); } catch { /* cache maintenance must not fail the write */ }
    // Template overrides may have changed — drop the cached render inputs
    if (Object.keys(entries).some(k => k.startsWith('mail_template_'))) {
      const { invalidateTemplateCache } = require('../utils/mailer');
      invalidateTemplateCache();
    }
    try { doAction('settings_saved', Object.keys(entries)); } catch {}
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: test the object-storage connection (reads the saved settings)
router.post('/storage/test', authenticate, requireCap('manage_system'), async (_req: AuthRequest, res: Response) => {
  try {
    const { testStorageConnection, invalidateStorageConfig } = await import('../utils/storage');
    invalidateStorageConfig();
    const r = await testStorageConnection();
    if (!r.ok) { res.status(400).json({ error: r.error || 'Connection failed' }); return; }
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
      version: APP_VERSION,
      database: db_test ? 'connected' : 'error',
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) { res.status(500).json({ status: 'error', error: err.message }); }
});

// Admin-only: site info (node version, platform, memory, table counts — these
// details are useful for diagnostics but must not be exposed publicly)
router.get('/info', authenticate, requireCap('manage_system'), (req: AuthRequest, res: Response) => {
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
      site: { title: cfg.site_title, url: cfg.site_url, version: APP_VERSION },
      php: { version: process.version, platform: process.platform, arch: process.arch },
      database: { tables: tables.length, posts: postCount, engine: driver === 'sqlite' ? 'SQLite' : driver === 'mysql' ? 'MySQL/MariaDB' : 'PostgreSQL', size: '—' },
      server: { uptime: Math.floor(process.uptime()), memory: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB' },
      themes: { active: activeThemeName(), available: themeAvailable },
    });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;
