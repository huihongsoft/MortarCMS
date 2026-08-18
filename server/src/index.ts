import express from 'express';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import db, { initDB } from './utils/db';
import { flushViews } from './utils/views';
import { verifyToken } from './utils/jwt';
import { appPasswordAuth } from './middleware/auth';
import { doAction } from './utils/hooks';
import authRoutes from './routes/auth';
import postRoutes from './routes/posts';
import pageRoutes from './routes/pages';
import categoryRoutes from './routes/categories';
import tagRoutes from './routes/tags';
import mediaRoutes from './routes/media';
import commentRoutes from './routes/comments';
import userRoutes from './routes/users';
import menuRoutes from './routes/menus';
import activityRoutes, { logActivity } from './routes/activity';
import appPwRoutes from './routes/appPasswords';
import gdprRoutes from './routes/gdpr';
import dbToolsRoutes from './routes/dbTools';
import postTypesRoutes from './routes/customPostTypes';
import exportRoutes from './routes/export';
import sitemapRoutes from './routes/sitemap';
import feedRoutes from './routes/feed';
import settingsRoutes from './routes/settings';
import siteHealthRoutes from './routes/siteHealth';
import hooksRoutes from './routes/hooks';
import cacheAdminRoutes from './routes/cacheAdmin';
import mailerRoutes from './routes/mailer';
import tasksRoutes from './routes/tasks';
import { registerBuiltinTasks, startScheduler, runTaskNow } from './utils/scheduler';
import { cacheGet, cacheSet, cacheConfigure, purgeContentCaches, purgeAllCaches } from './utils/cache';
import importRoutes from './routes/import';
import pluginsRoutes from './routes/plugins';
import siteRoutes from './routes/sites';
import themeRoutes from './routes/themes';
import linkRoutes from './routes/links';
import statsRoutes from './routes/stats';
import installRoutes, { installed as isInstalled } from './routes/install';
import securityRoutes from './routes/security';
import editorTemplatesRoutes from './routes/editorTemplates';
import aiRoutes from './routes/ai';
import rolesRoutes from './routes/roles';
import { loadActivePlugins } from './plugins/manager';
import { resolveSite } from './middleware/site';

initDB();
loadActivePlugins().catch(e => console.log('[Plugins] init error: ' + e.message));

const app = express();
const PORT = process.env.PORT || 3001;

// CORS: same-origin requests are always allowed (the admin/frontend apps talk
// to the API through the same origin or a dev proxy). Cross-origin requests are
// only allowed for explicitly configured origins: CORS_ORIGINS env var
// (comma-separated) or the site_url setting (read with a short cache).
const siteUrlCache: { at: number; url: string } = { at: 0, url: '' };
function configuredOrigins(): string[] {
  const env = (process.env.CORS_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
  if (Date.now() - siteUrlCache.at > 10000) {
    siteUrlCache.at = Date.now();
    try { siteUrlCache.url = ((db.prepare("SELECT value FROM Setting WHERE key = 'site_url'").get() as any)?.value || '').replace(/\/$/, ''); } catch { /* DB not ready */ }
  }
  if (siteUrlCache.url) env.push(siteUrlCache.url);
  return env;
}
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // same-origin / non-browser request
    if (configuredOrigins().includes(origin)) return cb(null, true);
    return cb(null, false); // no ACAO header -> browser blocks the cross-origin read
  },
}));
// Trust the X-Forwarded-For header only when explicitly enabled (e.g. running
// behind nginx). req.ip is then reliable for rate limits / visit tracking.
app.set('trust proxy', process.env.TRUST_PROXY === '1');
// Security headers
app.use((_req: any, res: any, next: any) => {
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  // HSTS on HTTPS deployments (browsers ignore it over plain HTTP)
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  next();
});

// Global API abuse floor: generous per-IP cap so a single client cannot
// hammer public endpoints (feed, sitemap, search...). Specific endpoints
// (auth, comments, passwords, AI) keep their own tighter limits.
app.use('/api', rateLimit({ windowMs: 60 * 1000, max: 600, standardHeaders: true, message: { error: 'Too many requests, slow down' } }));
app.use(resolveSite);
// Visit tracking (PV/UV): record page views for non-API, non-asset requests.
// Respects the visit_logging privacy setting (checked with a short cache).
let visitLogging: boolean | null = null;
let visitLoggingAt = 0;
app.use((req, res, next) => {
  try {
    if (Date.now() - visitLoggingAt > 10000) {
      visitLoggingAt = Date.now();
      try {
        const row = db.prepare("SELECT value FROM Setting WHERE key = 'visit_logging'").get() as any;
        visitLogging = !row || row.value !== '0';
      } catch { visitLogging = true; }
    }
    if (visitLogging !== false) {
      const p = req.path;
      if (!p.startsWith('/api') && !p.startsWith('/assets') && !p.startsWith('/admin') && !p.startsWith('/uploads') && p !== '/favicon.ico') {
        // req.ip honors TRUST_PROXY; without it the socket address is used so a
        // spoofed X-Forwarded-For header cannot fake visitor IPs.
        const ip = (req.ip || req.socket.remoteAddress || 'unknown').replace(/^::ffff:/, '');
        const today = new Date().toISOString().slice(0, 10);
        const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
        db.prepare('INSERT INTO Visit (id, date, ip, path) VALUES (?, ?, ?, ?)').run(id, today, ip || 'unknown', p.slice(0, 200));
      }
    }
  } catch {}
  next();
});
// Rate limiting for abuse-prone endpoints
const authLimiter = rateLimit({ windowMs: 60 * 1000, max: 10, standardHeaders: true, message: { error: 'Too many attempts, try again later' } });
const commentLimiter = rateLimit({ windowMs: 60 * 1000, max: 10, standardHeaders: true, message: { error: 'Too many comments, slow down' } });
// Maintenance mode middleware (auth + admin requests bypass so the site can be managed/recovered)
app.use((req, res, next) => {
  if (req.path.startsWith('/api/auth') || req.path.startsWith('/admin')) return next();
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    try {
      const payload = verifyToken(header.slice(7));
      if (payload && payload.role === 'admin') return next();
    } catch {}
  }
  // Manual toggle OR an active scheduled maintenance window
  let active = false;
  const mm = db.prepare("SELECT value FROM Setting WHERE key = 'maintenance_mode'").get() as any;
  if (mm && mm.value === '1') active = true;
  if (!active) {
    try {
      const sch = JSON.parse((db.prepare("SELECT value FROM Setting WHERE key = 'maintenance_schedule'").get() as any)?.value || 'null');
      if (sch?.start && sch?.end) {
        const now = Date.now();
        active = now >= new Date(sch.start).getTime() && now < new Date(sch.end).getTime();
      }
    } catch {}
  }
  if (active) {
    // IP whitelist bypasses maintenance (IPv6 loopback forms normalized)
    const wl = ((db.prepare("SELECT value FROM Setting WHERE key = 'maintenance_whitelist'").get() as any)?.value || '').split(/[,\s]+/).filter(Boolean);
    let ip = (req.ip || req.socket.remoteAddress || '').replace(/^::ffff:/, '');
    if (ip === '::1') ip = '127.0.0.1';
    if (wl.includes(ip) || wl.includes('*')) { next(); return; }
    const msg = (db.prepare("SELECT value FROM Setting WHERE key = 'maintenance_message'").get() as any)?.value || 'Under maintenance';
    return res.status(503).send('<!DOCTYPE html><html><head><title>Maintenance</title><style>body{font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f9fafb;color:#374151}div{text-align:center;max-width:400px;padding:40px}h1{font-size:2rem;margin-bottom:1rem}p{color:#6b7280}</style></head><body><div><h1>\u{1F6E0} Under Maintenance</h1><p>' + msg + '</p></div></body></html>');
  }
  next();
});

app.use(express.json({ limit: '10mb' }));

// Production error sanitizer: routes commonly respond with err.message (SQL
// fragments, file paths, stack traces). In production, any error payload that
// looks internal is replaced with a generic message so diagnostics never leak
// to remote clients. Dev keeps full messages for debugging.
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    const origJson = res.json.bind(res);
    res.json = (body: any) => {
      if (body && typeof body === 'object' && typeof body.error === 'string') {
        if (/(sqlite|better-sqlite|syntax error|no such column|no such table|constraint failed|malformed|ambiguous|ENOENT|EACCES|EPERM|at \S+\.ts:|\.js:\d+|Cannot read|TypeError|ReferenceError|ERR_|SELECT |INSERT |UPDATE |DELETE FROM)/i.test(body.error)) {
          body.error = 'Internal server error';
        }
      }
      return origJson(body);
    };
    next();
  });
}

// Install wizard gate:
// - Not installed: only /install, /api/install and static assets respond
//   (everything else -> 503 / redirect). Static assets MUST pass through so
//   the install-wizard SPA can load its CSS/JS bundles — otherwise the wizard
//   page whitescreens with MIME errors (assets 302-redirected to /install).
// - Installed: /install bounces to the home page (no stale wizard UI)
app.use((req, res, next) => {
  try {
    const installed = isInstalled();
    if (req.path.startsWith('/api/install')) return next();
    if (!installed) {
      if (req.path.startsWith('/api/')) { res.status(503).json({ error: 'Mortar is not installed yet' }); return; }
      // Static asset pass-through (SPA bundles, theme bundles, uploads, favicon)
      if (req.path.startsWith('/assets') || req.path.startsWith('/admin/assets') || req.path.startsWith('/themes') ||
          req.path === '/esm-react.js' || req.path === '/esm-react-dom.js' || req.path === '/esm-router.js' ||
          req.path === '/favicon.ico' || req.path.startsWith('/uploads')) return next();
      if (req.path === '/install' || req.path.startsWith('/install/')) return next();
      res.redirect('/install');
      return;
    }
    if (req.path === '/install' || req.path.startsWith('/install/')) {
      res.redirect('/');
      return;
    }
  } catch {}
  next();
});

const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
const cacheControl = (maxAge: string, immutable = false) => (_req: any, res: any, next: any) => {
  res.setHeader('Cache-Control', 'public, max-age=' + maxAge + (immutable ? ', immutable' : ''));
  next();
};
// Versioned build assets can be cached forever
app.use('/assets', cacheControl('31536000', true), express.static(path.join(__dirname, '../../frontend/dist/assets')));
app.use('/admin/assets', cacheControl('31536000', true), express.static(path.join(__dirname, '../../admin/dist/assets')));
// Theme bundles: served for runtime loading of theme layout components
app.use('/themes', (_req: any, res: any, next: any) => {
  res.setHeader('Cache-Control', 'public, max-age=300');
  next();
}, express.static(path.join(__dirname, '..', 'themes')));
// Uploads: cache 1 day; CSP locks down script execution (e.g. uploaded SVGs)
app.use('/uploads', cacheControl('86400'), (_req: any, res: any, next: any) => {
  res.setHeader('Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline'; img-src 'self' data:; media-src 'self'");
  next();
}, express.static(uploadsDir));

// App-password auth (alternative to Bearer tokens) for all API routes
app.use('/api', appPasswordAuth);

// Look up the affected entity's title for the activity log (e.g. the post
// title behind PUT /api/posts/:id), so entries read "更新文章「Foo」".
function resourceTitle(path: string): string {
  const m = path.match(/^\/api\/(posts|pages|categories|tags|comments|media|users|menus|links|sites)\/([^/]+)/);
  if (!m) return '';
  const [, type, id] = m;
  try {
    if (type === 'posts' || type === 'pages') {
      const p = db.prepare('SELECT title FROM Post WHERE id = ?').get(id) as any;
      return p?.title ? String(p.title).slice(0, 60) : '';
    }
    if (type === 'categories') { const r = db.prepare('SELECT name FROM Category WHERE id = ?').get(id) as any; return r?.name ? String(r.name).slice(0, 60) : ''; }
    if (type === 'tags') { const r = db.prepare('SELECT name FROM Tag WHERE id = ?').get(id) as any; return r?.name ? String(r.name).slice(0, 60) : ''; }
    if (type === 'comments') { const r = db.prepare('SELECT content FROM Comment WHERE id = ?').get(id) as any; return r ? String(r.content).slice(0, 40) : ''; }
    if (type === 'media') { const r = db.prepare('SELECT original FROM Media WHERE id = ?').get(id) as any; return r?.original ? String(r.original).slice(0, 60) : ''; }
    if (type === 'users') { const r = db.prepare('SELECT username FROM User WHERE id = ?').get(id) as any; return r?.username ? String(r.username).slice(0, 60) : ''; }
    if (type === 'menus') { const r = db.prepare('SELECT name FROM Menu WHERE id = ?').get(id) as any; return r?.name ? String(r.name).slice(0, 60) : ''; }
    if (type === 'links') { const r = db.prepare('SELECT name FROM Link WHERE id = ?').get(id) as any; return r?.name ? String(r.name).slice(0, 60) : ''; }
    if (type === 'sites') { const r = db.prepare('SELECT name FROM Site WHERE id = ?').get(id) as any; return r?.name ? String(r.name).slice(0, 60) : ''; }
  } catch {}
  return '';
}

// Public page cache: caches anonymous GET responses for the frontend content
// endpoints, so repeated visitors skip DB work. Admin/API clients (Bearer/App
// auth) are never cached. Content mutations purge the affected prefixes.
// '/api/comments' (not just '/api/comments/post') so new submissions and
// moderation changes (PUT/DELETE /api/comments/:id) also purge the cache
const CACHE_PREFIXES = ['/api/posts', '/api/pages', '/api/menus', '/api/categories', '/api/tags', '/api/links', '/api/comments', '/api/settings', '/api/feed', '/api/themes'];
app.use('/api', (req: any, res: any, next: any) => {
  if (req.method !== 'GET' || req.headers.authorization) { next(); return; }
  if (!CACHE_PREFIXES.some((p: string) => req.originalUrl.startsWith(p))) { next(); return; }
  // Key includes the Host so per-site overrides are cached separately
  const key = 'GET ' + (req.headers.host || '') + req.originalUrl;
  const cached = cacheGet(key);
  if (cached !== undefined) { res.json(cached); return; }
  const origJson = res.json.bind(res);
  res.json = (body: any) => {
    if (res.statusCode < 400 && body && typeof body === 'object') cacheSet(key, body);
    return origJson(body);
  };
  next();
});

// After any successful mutation on a content route, drop the cached public
// responses so visitors immediately see the new state. Settings changes
// purge everything (they can alter any page). Successful authenticated
// mutations are also recorded in the activity log (audit trail).
app.use('/api', (req: any, res: any, next: any) => {
  if (req.method === 'GET' || !CACHE_PREFIXES.some((p: string) => req.originalUrl.startsWith(p))) { next(); return; }
  const origJson = res.json.bind(res);
  res.json = (body: any) => {
    const status = res.statusCode;
    const r = origJson(body);
    if (status < 400) {
      // Imports, settings and site changes can affect every page
      if (req.originalUrl.startsWith('/api/settings') || req.originalUrl.startsWith('/api/sites') ||
          req.originalUrl.startsWith('/api/themes') || req.originalUrl.startsWith('/api/export/import') ||
          req.originalUrl.startsWith('/api/import') || req.originalUrl.startsWith('/api/install')) purgeAllCaches();
      else purgeContentCaches();
      // Audit trail: record authenticated content mutations (skip public
      // endpoints like comment submission / password checks). The detail
      // column carries the affected entity's title so the activity log can
      // say "updated post「Foo」" instead of a bare API route.
      if (req.user?.userId && !req.originalUrl.includes('/password')) {
        const path = req.originalUrl.split('?')[0];
        try {
          logActivity(req.user.userId, req.method + ' ' + path.slice(0, 60), resourceTitle(path));
        } catch {}
      }
    }
    return r;
  };
  next();
});

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/pages', pageRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/comments', commentLimiter, commentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/menus', menuRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/app-passwords', appPwRoutes);
app.use('/api/gdpr', gdprRoutes);
app.use('/api/db', dbToolsRoutes);
app.use('/api/post-types', postTypesRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/import', importRoutes);
app.use('/api/plugins', pluginsRoutes);
app.use('/api/sites', siteRoutes);
app.use('/api/themes', themeRoutes);
app.use('/api/links', linkRoutes);
app.use('/api/install', installRoutes);
app.use('/api/security', securityRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/editor', editorTemplatesRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/roles', rolesRoutes);
app.use('/api', sitemapRoutes);
app.use('/api/feed', cacheControl('600'), feedRoutes);
app.use('/api/sitemap.xml', cacheControl('600'));
app.use('/api/settings', settingsRoutes);
app.use('/api', siteHealthRoutes);
app.use('/api', hooksRoutes);
app.use('/api', cacheAdminRoutes);
app.use('/api', mailerRoutes);
app.use('/api', tasksRoutes);

app.get('/api/health', (_req, res) => { res.json({ status: 'ok', version: '0.1.0' }); });

// robots.txt (honors the blog_public SEO setting)
app.get('/robots.txt', (_req, res) => {
  try {
    const row = db.prepare("SELECT value FROM Setting WHERE key = 'blog_public'").get() as any;
    const allow = !(row && row.value === '0');
    const siteUrl = (db.prepare("SELECT value FROM Setting WHERE key = 'site_url'").get() as any)?.value || '';
    const sitemap = (siteUrl || 'http://localhost:3001').replace(/\/$/, '') + '/api/sitemap.xml';
    const body = (allow
      ? 'User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/\n\nSitemap: ' + sitemap + '\n'
      : 'User-agent: *\nDisallow: /\n');
    res.type('text/plain').send(body);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// API documentation: endpoint list with descriptions, query params and sample
// bodies, consumed by the admin "API docs & test center" page.
app.get('/api/schema', (_req, res) => {
  const endpoints = [
    { method: 'POST', path: '/api/auth/login', desc: 'Log in with email + password, returns a JWT', body: { email: 'admin@example.com', password: 'secret' } },
    { method: 'GET', path: '/api/auth/me', desc: 'Current user profile' },
    { method: 'GET', path: '/api/posts', desc: 'Published posts, paginated; supports search/category/tag/site filtering', query: { page: '1', limit: '10', search: 'term', category: 'slug', tag: 'slug' } },
    { method: 'GET', path: '/api/posts/slug/:slug', desc: 'Single post by slug (enriched: author, categories, tags, meta)' },
    { method: 'GET', path: '/api/posts/suggest', desc: 'Search suggestions for the autocomplete widget', query: { q: 'term' } },
    { method: 'GET', path: '/api/posts/popular', desc: 'Most viewed posts', query: { limit: '5' } },
    { method: 'GET', path: '/api/posts/archive/:year/:month', desc: 'Posts published in a month', query: { page: '1' } },
    { method: 'GET', path: '/api/posts/archives', desc: 'Monthly archive list with counts' },
    { method: 'GET', path: '/api/posts/author/:username', desc: 'Posts by an author' },
    { method: 'GET', path: '/api/posts/:id/related', desc: 'Related posts by shared tags/categories' },
    { method: 'GET', path: '/api/posts/admin', auth: 'editor+', desc: 'All posts with any status (admin list)' },
    { method: 'POST', path: '/api/posts', auth: 'editor+', desc: 'Create a post', body: { title: 'Hello world', content: '<p>...</p>', status: 'draft', categoryIds: [], tagNames: [] } },
    { method: 'PUT', path: '/api/posts/:id', auth: 'editor+', desc: 'Update a post' },
    { method: 'DELETE', path: '/api/posts/:id', auth: 'editor+', desc: 'Delete a post' },
    { method: 'POST', path: '/api/posts/bulk-trash', auth: 'editor+', desc: 'Move posts to trash', body: { ids: ['id1', 'id2'] } },
    { method: 'POST', path: '/api/posts/bulk-restore', auth: 'editor+', desc: 'Restore trashed posts', body: { ids: [] } },
    { method: 'POST', path: '/api/posts/bulk-status', auth: 'editor+', desc: 'Set status on many posts', body: { ids: [], status: 'published' } },
    { method: 'POST', path: '/api/posts/bulk-delete', auth: 'editor+', desc: 'Permanently delete posts', body: { ids: [] } },
    { method: 'GET', path: '/api/posts/:id/revisions', auth: 'editor+', desc: 'Revision history of a post' },
    { method: 'PUT', path: '/api/posts/:id/revisions/:revId/restore', auth: 'editor+', desc: 'Restore a revision' },
    { method: 'GET', path: '/api/pages', desc: 'Published pages' },
    { method: 'GET', path: '/api/pages/slug/:slug', desc: 'Single page by slug' },
    { method: 'POST', path: '/api/pages', auth: 'editor+', desc: 'Create a page', body: { title: 'About', content: '<p>...</p>', status: 'published' } },
    { method: 'PUT', path: '/api/pages/:id', auth: 'editor+', desc: 'Update a page' },
    { method: 'DELETE', path: '/api/pages/:id', auth: 'editor+', desc: 'Delete a page' },
    { method: 'GET', path: '/api/categories', desc: 'All categories with post counts' },
    { method: 'GET', path: '/api/tags', desc: 'All tags with post counts' },
    { method: 'GET', path: '/api/comments/post/:postId', desc: 'Approved comments for a post' },
    { method: 'POST', path: '/api/comments', desc: 'Submit a comment', body: { postId: 'id', author: 'Name', email: 'a@b.c', content: 'Nice post!' } },
    { method: 'GET', path: '/api/comments/admin', auth: 'editor+', desc: 'All comments with status (moderation queue)' },
    { method: 'POST', path: '/api/comments/bulk-action', auth: 'editor+', desc: 'Moderate comments', body: { ids: [], action: 'approved' } },
    { method: 'GET', path: '/api/media', auth: 'editor+', desc: 'Media library, paginated', query: { page: '1', limit: '20', search: '' } },
    { method: 'GET', path: '/api/media/:id/img', desc: 'Responsive resized image', query: { w: '640', fmt: 'webp' } },
    { method: 'POST', path: '/api/media/upload', auth: 'editor+', desc: 'Upload a file (multipart field "file")' },
    { method: 'GET', path: '/api/menus', desc: 'All menus' },
    { method: 'GET', path: '/api/menus/location/:location', desc: 'Menus for a location (primary etc.)' },
    { method: 'GET', path: '/api/widgets', desc: 'Active widgets by area' },
    { method: 'GET', path: '/api/links', desc: 'Blogroll links' },
    { method: 'GET', path: '/api/settings', desc: 'Public site settings' },
    { method: 'PUT', path: '/api/settings', auth: 'admin', desc: 'Update site settings', body: { site_title: 'My Site', site_url: 'https://example.com' } },
    { method: 'GET', path: '/api/feed/rss', desc: 'RSS 2.0 feed' },
    { method: 'GET', path: '/api/sitemap.xml', desc: 'XML sitemap' },
    { method: 'GET', path: '/api/health', desc: 'Liveness check' },
    { method: 'GET', path: '/api/health/detail', auth: 'admin', desc: 'Detailed site health' },
    { method: 'GET', path: '/api/users', auth: 'admin', desc: 'All users' },
    { method: 'GET', path: '/api/activity', auth: 'admin', desc: 'Activity log' },
    { method: 'GET', path: '/api/gdpr/export', auth: 'admin', desc: 'Download all user data' },
    { method: 'GET', path: '/api/db/backup', auth: 'admin', desc: 'SQLite backup download' },
    { method: 'GET', path: '/api/system/hooks', auth: 'admin', desc: 'Registered hooks (actions/filters) with listeners' },
    { method: 'GET', path: '/api/system/cache', auth: 'admin', desc: 'Page cache stats' },
    { method: 'POST', path: '/api/system/cache/purge', auth: 'admin', desc: 'Purge all cached responses' },
    { method: 'GET', path: '/api/editor/shortcodes', auth: 'editor+', desc: 'Registered shortcodes with descriptions' },
    { method: 'GET', path: '/api/sites', auth: 'admin', desc: 'Sites with per-site content stats' },
    { method: 'POST', path: '/api/sites/:id/duplicate', auth: 'admin', desc: 'Duplicate a site with settings and menus' },
  ];
  res.json({ name: 'Mortar CMS API', version: '0.1.0', endpoints });
});

// Widget registry: widgets the frontend can render plus the active
// configuration managed from the admin Widgets panel (widgets_active /
// widgets_config live in the Setting table, so this endpoint stays in sync).
app.get('/api/widgets', (_req, res) => {
  const registry = [
    { id: 'search', name: 'Search', areas: ['sidebar'] },
    { id: 'categories', name: 'Categories', areas: ['sidebar'] },
    { id: 'recent_posts', name: 'Recent Posts', areas: ['sidebar'] },
    { id: 'recent_comments', name: 'Recent Comments', areas: ['sidebar'] },
    { id: 'archives', name: 'Archives', areas: ['sidebar'] },
    { id: 'calendar', name: 'Calendar', areas: ['sidebar'] },
    { id: 'tag_cloud', name: 'Tag Cloud', areas: ['sidebar'] },
    { id: 'pages', name: 'Pages', areas: ['sidebar'] },
    { id: 'rss', name: 'RSS Feed', areas: ['sidebar'] },
    { id: 'html', name: 'Custom HTML', areas: ['sidebar'] },
  ];
  let active: string[] = [];
  let config: Record<string, any> = {};
  try {
    active = JSON.parse((db.prepare("SELECT value FROM Setting WHERE key = 'widgets_active'").get() as any)?.value || '[]');
    config = JSON.parse((db.prepare("SELECT value FROM Setting WHERE key = 'widgets_config'").get() as any)?.value || '{}');
  } catch {}
  res.json({ widgets: registry, active, config });
});

// Unknown API paths must return a JSON 404 (not the SPA HTML catch-all) so
// client code can distinguish missing endpoints from real API failures.
app.use('/api', (_req, res) => { res.status(404).json({ error: 'Not found' }); });

// Serve Admin SPA
const adminDist = path.join(__dirname, '../../admin/dist');
if (fs.existsSync(adminDist)) {
  console.log('Serving Admin SPA from ' + adminDist);
  app.use('/admin', express.static(adminDist));
  app.get('/admin/*', (_req, res) => { res.sendFile(path.join(adminDist, 'index.html')); });
}

// Serve Frontend SPA
const frontendDist = path.join(__dirname, '../../frontend/dist');
if (fs.existsSync(frontendDist)) {
  console.log('Serving Frontend SPA from ' + frontendDist);
  app.use(express.static(frontendDist));
  app.get('*', (_req, res) => { res.sendFile(path.join(frontendDist, 'index.html')); });
}


// Scheduled tasks: auto-publish, trash purge, activity pruning, db maintenance
registerBuiltinTasks();
startScheduler();
void runTaskNow('publish_scheduled'); // catch up on due posts at boot

// Apply page cache settings persisted by the admin tools panel
try {
  const cEnabled = db.prepare("SELECT value FROM Setting WHERE key = 'cache_enabled'").get() as any;
  const cTtl = db.prepare("SELECT value FROM Setting WHERE key = 'cache_ttl'").get() as any;
  cacheConfigure(cEnabled ? cEnabled.value !== '0' : true, cTtl ? parseInt(cTtl.value) || 60 : 60);
} catch {}


// Unified error handler: any uncaught error -> 500 { error } (details only in dev)
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error('[Error]', err.message);
  const isProd = process.env.NODE_ENV === 'production';
  // Client errors keep their status (multer rejects oversized files with
  // LIMIT_FILE_SIZE — that is a 413, not a 500)
  const status = err.status || (err.code === 'LIMIT_FILE_SIZE' ? 413 : 500);
  res.status(status).json({ error: isProd && status >= 500 ? 'Internal server error' : (err.message || 'Internal server error') });
});

app.listen(PORT, () => {
  console.log('Mortar server at http://localhost:' + PORT);
  console.log('  Admin:    http://localhost:' + PORT + '/admin');
  console.log('  Frontend: http://localhost:' + PORT);
  doAction('init'); // Fired once everything is up; plugins listen to bootstrap
});

// Best-effort flush of in-memory view counts on shutdown
for (const sig of ['SIGTERM', 'SIGINT'] as const) {
  process.on(sig, () => {
    try { flushViews(); } catch {}
    process.exit(0);
  });
}
