import { Router, Response, NextFunction } from 'express';
import { authenticate, requireCap, AuthRequest } from '../middleware/auth';
import { findPluginRoute, findAdminPage, listAdminPages, listEditorBlocks } from '../utils/pluginApi';

// Everything a plugin extends lives under /api/ext/<plugin>/<path>.
//
// The dispatch happens through this one router, mounted once, instead of the
// plugin manager calling app.get() while loading: routes added at runtime would
// land after the SPA catch-all and never be reached.
const router = Router();

// Admin: the pages plugins registered (drives the admin navigation)
router.get('/pages', authenticate, requireCap('manage_plugins'), (_req: AuthRequest, res: Response) => {
  res.json(listAdminPages().map(({ plugin, id, title }) => ({ plugin, id, title, path: '/plugin/' + plugin + '/' + id })));
});

// Admin: one plugin page's body (HTML, rendered by the admin shell)
router.get('/pages/:plugin/:id', authenticate, requireCap('manage_plugins'), (req: AuthRequest, res: Response) => {
  const page = findAdminPage(req.params.plugin, req.params.id);
  if (!page) { res.status(404).json({ error: 'Page not found' }); return; }
  res.json({ plugin: page.plugin, id: page.id, title: page.title, html: page.html });
});

// Editor: blocks contributed by plugins, merged with the built-ins client-side
router.get('/blocks', authenticate, requireCap('edit_posts'), (_req: AuthRequest, res: Response) => {
  res.json(listEditorBlocks().map(({ plugin, id, label, category, content }) => ({ id: plugin + ':' + id, label, category, content, plugin })));
});

// Plugin-declared endpoints. They run after the global body parser and rate
// limit, but BEFORE any auth: a plugin deciding its own access is the whole
// point (webhook callbacks, public widgets), so it must check what it needs.
// Only active plugins answer.
router.all('/:plugin/*', authenticateOptional, (req: AuthRequest, res: Response, next: NextFunction) => {
  const plugin = String(req.params.plugin || '');
  // Express 4 puts the wildcard capture in params[0]
  const sub = String((req.params as any)[0] || '');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { isPluginActive } = require('../plugins/manager');
  if (!isPluginActive(plugin)) { res.status(404).json({ error: 'Not found' }); return; }
  const route = findPluginRoute(plugin, req.method, sub);
  if (!route) { next(); return; }
  // Express 4 does not catch a rejected promise from a handler, and an
  // unhandledRejection shuts the process down (index.ts) — so a bug in a plugin
  // endpoint would take the whole site offline. Catch both the sync throw and
  // the async rejection here.
  const fail = (err: any) => {
    console.log('[Plugins] route ' + plugin + '/' + sub + ' failed: ' + (err?.message || err));
    if (!res.headersSent) res.status(500).json({ error: 'Plugin route failed' });
  };
  try {
    // Typed as void by Express, but an async handler really returns a promise.
    const out = (route.handler as any)(req, res, next) as any;
    if (out && typeof out.then === 'function') out.catch(fail);
  } catch (err: any) {
    fail(err);
  }
});

// Resolve a session when one is offered, so a plugin route can *choose* to
// require auth (req.user) without forcing every call to carry a token.
function authenticateOptional(req: AuthRequest, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) { next(); return; }
  authenticate(req, _res, next);
}

export default router;
