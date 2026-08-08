import express from 'express';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import db, { initDB } from './utils/db';
import { verifyToken } from './utils/jwt';
import { appPasswordAuth } from './middleware/auth';
import './utils/hooks';
import authRoutes from './routes/auth';
import postRoutes from './routes/posts';
import pageRoutes from './routes/pages';
import categoryRoutes from './routes/categories';
import tagRoutes from './routes/tags';
import mediaRoutes from './routes/media';
import commentRoutes from './routes/comments';
import userRoutes from './routes/users';
import menuRoutes from './routes/menus';
import activityRoutes from './routes/activity';
import appPwRoutes from './routes/appPasswords';
import gdprRoutes from './routes/gdpr';
import dbToolsRoutes from './routes/dbTools';
import postTypesRoutes from './routes/customPostTypes';
import exportRoutes from './routes/export';
import sitemapRoutes from './routes/sitemap';
import feedRoutes from './routes/feed';
import settingsRoutes from './routes/settings';
import siteHealthRoutes from './routes/siteHealth';
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
import { loadActivePlugins } from './plugins/manager';
import { resolveSite } from './middleware/site';

initDB();
loadActivePlugins().catch(e => console.log('[Plugins] init error: ' + e.message));

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
// Security headers
app.use((_req: any, res: any, next: any) => {
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});
app.use(resolveSite);
// Visit tracking (PV/UV): record page views for non-API, non-asset requests
app.use((req, res, next) => {
  try {
    const p = req.path;
    if (!p.startsWith('/api') && !p.startsWith('/assets') && !p.startsWith('/admin') && !p.startsWith('/uploads') && p !== '/favicon.ico') {
      const ip = (req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || '') .split(',')[0].trim();
      const today = new Date().toISOString().slice(0, 10);
      const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
      db.prepare('INSERT INTO Visit (id, date, ip, path) VALUES (?, ?, ?, ?)').run(id, today, ip || 'unknown', p.slice(0, 200));
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
  const mm = db.prepare("SELECT value FROM Setting WHERE key = 'maintenance_mode'").get() as any;
  if (mm && mm.value === '1') {
    const msg = (db.prepare("SELECT value FROM Setting WHERE key = 'maintenance_message'").get() as any)?.value || 'Under maintenance';
    return res.status(503).send('<!DOCTYPE html><html><head><title>Maintenance</title><style>body{font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f9fafb;color:#374151}div{text-align:center;max-width:400px;padding:40px}h1{font-size:2rem;margin-bottom:1rem}p{color:#6b7280}</style></head><body><div><h1>\u{1F6E0} Under Maintenance</h1><p>' + msg + '</p></div></body></html>');
  }
  next();
});

app.use(express.json({ limit: '10mb' }));

// Install wizard gate:
// - Not installed: only /install and /api/install respond (everything else -> 503 / redirect)
// - Installed: /install bounces to the home page (no stale wizard UI)
app.use((req, res, next) => {
  try {
    const installed = isInstalled();
    if (req.path.startsWith('/api/install')) return next();
    if (!installed) {
      if (req.path.startsWith('/api/')) { res.status(503).json({ error: 'Mortar is not installed yet' }); return; }
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
app.use('/api', sitemapRoutes);
app.use('/api/feed', cacheControl('600'), feedRoutes);
app.use('/api/sitemap.xml', cacheControl('600'));
app.use('/api/settings', settingsRoutes);
app.use('/api', siteHealthRoutes);

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

// API endpoint discovery
app.get('/api/schema', (_req, res) => {
  const endpoints = [
    { method: 'GET', path: '/api/auth/login' }, { method: 'GET', path: '/api/auth/me' },
    { method: 'GET', path: '/api/posts' }, { method: 'GET', path: '/api/posts/slug/:slug' }, { method: 'GET', path: '/api/posts/popular' }, { method: 'GET', path: '/api/posts/archive/:year/:month' }, { method: 'GET', path: '/api/posts/archives' }, { method: 'GET', path: '/api/posts/author/:username' }, { method: 'GET', path: '/api/posts/:id/related' },
    { method: 'GET', path: '/api/pages' }, { method: 'GET', path: '/api/pages/slug/:slug' },
    { method: 'GET', path: '/api/categories' }, { method: 'GET', path: '/api/tags' },
    { method: 'GET', path: '/api/comments/post/:postId' },
    { method: 'GET', path: '/api/media' }, { method: 'GET', path: '/api/menus/location/:location' },
    { method: 'GET', path: '/api/feed/rss' }, { method: 'GET', path: '/api/sitemap.xml' }, { method: 'GET', path: '/api/settings' },
    { method: 'GET', path: '/api/health' }, { method: 'GET', path: '/api/health/detail', auth: 'admin' },
    { method: 'POST', path: '/api/posts', auth: 'editor+' }, { method: 'PUT', path: '/api/posts/:id', auth: 'editor+' }, { method: 'DELETE', path: '/api/posts/:id', auth: 'editor+' },
    { method: 'GET', path: '/api/posts/admin', auth: 'editor+' }, { method: 'GET', path: '/api/posts/:id/revisions', auth: 'editor+' }, { method: 'PUT', path: '/api/posts/:id/revisions/:revId/restore', auth: 'editor+' },
    { method: 'POST', path: '/api/posts/bulk-trash', auth: 'editor+' }, { method: 'POST', path: '/api/posts/bulk-restore', auth: 'editor+' }, { method: 'POST', path: '/api/posts/bulk-delete', auth: 'editor+' },
    { method: 'GET', path: '/api/comments/admin', auth: 'editor+' }, { method: 'POST', path: '/api/comments/bulk-action', auth: 'editor+' },
    { method: 'GET', path: '/api/users', auth: 'admin' }, { method: 'GET', path: '/api/activity', auth: 'admin' },
    { method: 'GET', path: '/api/app-passwords', auth: 'admin' }, { method: 'GET', path: '/api/gdpr/export', auth: 'admin' },
    { method: 'GET', path: '/api/post-types' }, { method: 'GET', path: '/api/export/wxr', auth: 'admin' }, { method: 'POST', path: '/api/import/wxr', auth: 'admin' },
    { method: 'GET', path: '/api/db/backup', auth: 'admin' }, { method: 'GET', path: '/api/settings/info' },
  ];
  res.json({ name: 'Mortar CMS API', version: '0.1.0', endpoints });
});

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


// Cron: auto-publish scheduled posts
function runCron() {
  try {
    const now = new Date().toISOString();
    const result = db.prepare("UPDATE Post SET status = 'published', publishedAt = ? WHERE status = 'scheduled' AND publishedAt <= ?").run(now, now);
    if (result.changes > 0) console.log('[Cron] Published ' + result.changes + ' scheduled posts');
  } catch (e) {}
}
runCron();
setInterval(runCron, 60000);


// Unified error handler: any uncaught error -> 500 { error } (details only in dev)
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error('[Error]', err.message);
  const isProd = process.env.NODE_ENV === 'production';
  res.status(err.status || 500).json({ error: isProd ? 'Internal server error' : (err.message || 'Internal server error') });
});

app.listen(PORT, () => {
  console.log('Mortar server at http://localhost:' + PORT);
  console.log('  Admin:    http://localhost:' + PORT + '/admin');
  console.log('  Frontend: http://localhost:' + PORT);
});
