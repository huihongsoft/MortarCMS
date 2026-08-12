import { Router, Response } from 'express';
import https from 'https';
import http from 'http';
import db from '../utils/db';
import { listHooks } from '../utils/hooks';
import { listPlugins, listMarket, installPlugin, installFromUrl, uninstallPlugin, setPluginActive } from '../plugins/manager';
import { authenticate, requireCap, AuthRequest } from '../middleware/auth';

const router = Router();

// Public: registered hooks (plugin system introspection)
router.get('/hooks', authenticate, requireCap('manage_options'), (_req: AuthRequest, res: Response) => {
  try {
    const hooks = listHooks();
    res.json({
      actions: hooks.actions.map((h: any) => ({ hook: h.name, description: hookDescriptions[h.name] || '', listeners: h.listeners.length })),
      filters: hooks.filters.map((h: any) => ({ hook: h.name, description: hookDescriptions[h.name] || '', listeners: h.listeners.length })),
    });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: list installed plugins
router.get('/', authenticate, requireCap('manage_options'), (_req: AuthRequest, res: Response) => {
  try {
    res.json({ plugins: listPlugins() });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: enable / disable a plugin
router.put('/:name/toggle', authenticate, requireCap('manage_options'), async (req: AuthRequest, res: Response) => {
  try {
    const r = await setPluginActive(req.params.name, req.body?.active === true);
    if (!r.ok) { res.status(400).json({ error: r.error || 'Failed' }); return; }
    res.json({ success: true, name: req.params.name, active: req.body?.active === true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

function fetchJson(url: string, timeoutMs = 15000): Promise<any> {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, { headers: { 'User-Agent': 'Mortar-CMS/0.1' } }, (res) => {
      if (res.statusCode !== 200) { reject(new Error('Catalog fetch failed: HTTP ' + res.statusCode)); res.resume(); return; }
      let body = '';
      res.on('data', (c: Buffer) => body += c);
      res.on('end', () => { try { resolve(JSON.parse(body)); } catch (e: any) { reject(new Error('Invalid catalog JSON: ' + e.message)); } });
    });
    req.on('error', reject);
    req.setTimeout(timeoutMs, () => req.destroy(new Error('Catalog fetch timed out')));
  });
}

// Admin: market catalog — remote repository first (market_url setting), local market as fallback
router.get('/market/list', authenticate, requireCap('manage_options'), async (_req: AuthRequest, res: Response) => {
  try {
    const setting = db.prepare("SELECT value FROM Setting WHERE key = 'market_url'").get() as any;
    const marketUrl = setting?.value as string | undefined;
    let packages: any[] = [];
    let source = 'local';
    if (marketUrl) {
      try {
        const data = await fetchJson(marketUrl);
        packages = Array.isArray(data) ? data : (data.packages || []);
        source = 'remote:' + marketUrl;
      } catch (e: any) {
        packages = listMarket();
        source = 'local (remote failed: ' + e.message + ')';
      }
    } else {
      packages = listMarket();
    }
    // Mark which remote packages are already installed
    const installed = listPlugins().map((p: any) => p.name);
    packages = packages.map((p: any) => ({ ...p, installed: installed.includes(p.name), source: p.url ? 'remote' : 'local' }));
    res.json({ packages, source });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: install a package from the market (local package or remote URL)
router.post('/market/:name/install', authenticate, requireCap('manage_options'), async (req: AuthRequest, res: Response) => {
  try {
    const name = req.params.name;
    // If the package came from a remote catalog with a url, install from there
    const setting = db.prepare("SELECT value FROM Setting WHERE key = 'market_url'").get() as any;
    const marketUrl = setting?.value as string | undefined;
    let r: { ok: boolean; error?: string; name?: string };
    if (marketUrl) {
      try {
        const data = await fetchJson(marketUrl);
        const packages = Array.isArray(data) ? data : (data.packages || []);
        const pkg = packages.find((p: any) => p.name === name);
        if (pkg && pkg.url) {
          r = await installFromUrl(pkg.url);
        } else if (pkg) {
          r = await installPlugin(name); // remote catalog entry without url -> local market
        } else {
          r = await installPlugin(name);
        }
      } catch {
        r = await installPlugin(name);
      }
    } else {
      r = await installPlugin(name);
    }
    if (!r.ok) { res.status(400).json({ error: r.error || 'Install failed' }); return; }
    res.json({ success: true, name: r.name || name });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: install a plugin from a remote URL (zip or tar.gz)
router.post('/market/install-url', authenticate, requireCap('manage_options'), async (req: AuthRequest, res: Response) => {
  try {
    const url = req.body?.url as string;
    if (!url) { res.status(400).json({ error: 'url required' }); return; }
    const r = await installFromUrl(url);
    if (!r.ok) { res.status(400).json({ error: r.error || 'Install failed' }); return; }
    res.json({ success: true, name: r.name });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: uninstall a plugin (must be inactive)
router.delete('/:name', authenticate, requireCap('manage_options'), async (req: AuthRequest, res: Response) => {
  try {
    const r = await uninstallPlugin(req.params.name);
    if (!r.ok) { res.status(400).json({ error: r.error || 'Uninstall failed' }); return; }
    res.json({ success: true, name: req.params.name });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

const hookDescriptions: Record<string, string> = {
  init: 'Runs once when the server starts',
  post_content: 'Filters the HTML content of a post before it is served to visitors',
  post_published: 'Fires when a post transitions to published',
  comment_added: 'Fires when a new comment is submitted',
  post_created: 'Fires after a new post is created',
  post_updated: 'Fires after a post is updated',
  delete_post: 'Fires when a post is deleted',
  comment_approved: 'Fires when a comment is approved',
  comment_spam: 'Fires when a comment is marked as spam',
  delete_comment: 'Fires when a comment is deleted',
  user_register: 'Fires when a new user registers',
};

export default router;
