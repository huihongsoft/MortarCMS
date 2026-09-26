import { Request, Response, NextFunction } from 'express';
import { resolveRedirect, countHit } from '../utils/redirects';

// Paths the app owns. The API is already terminated before this runs, but the
// check is repeated here so the middleware is safe to mount anywhere.
const EXEMPT = /^\/(api|admin|uploads|themes|metrics|assets)(\/|$)/;

/**
 * Send an old URL to its current home.
 *
 * GET/HEAD only — a POST to a moved path must not be answered with a 301, which
 * a browser would replay as a GET and silently drop the body. The lookup reads a
 * cached table, so an ordinary request that matches nothing pays a hash miss.
 */
export function redirectMiddleware() {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (req.method !== 'GET' && req.method !== 'HEAD') { next(); return; }
    if (EXEMPT.test(req.path || '')) { next(); return; }
    try {
      const hit = resolveRedirect(req.path, (req as any).siteId);
      if (hit) {
        countHit(hit.id);
        res.redirect(hit.status === 302 ? 302 : 301, hit.toPath);
        return;
      }
    } catch { /* a redirect lookup must never take the site down */ }
    next();
  };
}
