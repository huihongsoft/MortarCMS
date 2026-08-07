import { Request, Response, NextFunction } from 'express';
import db from '../utils/db';

export interface SiteRequest extends Request {
  siteId?: string;
  site?: { id: string; name: string; slug: string; domain: string; description: string; active: number; isPrimary: number };
}

// Resolve current site from the Host header (falls back to primary site)
export function resolveSite(req: SiteRequest, _res: Response, next: NextFunction): void {
  try {
    const host = (req.headers.host || '').replace(/:\d+$/, '').toLowerCase();
    let site: any = null;
    if (host) {
      site = db.prepare('SELECT * FROM Site WHERE domain = ? AND active = 1').get(host) as any;
    }
    if (!site) {
      site = db.prepare('SELECT * FROM Site WHERE isPrimary = 1 AND active = 1 LIMIT 1').get() as any;
    }
    if (site) {
      req.siteId = site.id;
      req.site = site;
    }
  } catch {}
  next();
}

export function currentSiteId(req: SiteRequest): string | undefined {
  return req.siteId;
}
