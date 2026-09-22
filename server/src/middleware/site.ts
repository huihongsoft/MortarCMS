import { Request, Response, NextFunction } from 'express';
import db from '../utils/db';
import { logger } from '../utils/logger';

export interface SiteRequest extends Request {
  siteId?: string;
  site?: { id: string; name: string; slug: string; domain: string; description: string; active: number; isPrimary: number };
}

// Hosts are compared without their port on BOTH sides. The request side never
// carries one (it is stripped below), so a site whose stored domain was saved as
// "localhost:3001" — which the Sites form accepts — could otherwise never match,
// and every request would silently be served global settings.
const hostOf = (value: unknown): string => String(value || '').replace(/:\d+$/, '').trim().toLowerCase();

// resolveSite runs on every request, so an unmatched host would flood the log.
// One line per host is enough to expose the misconfiguration (a domain saved
// with a port, a changed domain, a request by IP, an inactive primary site).
const warned = new Set<string>();
function warnUnmatched(host: string, total: number, active: number, fellBackToPrimary: boolean): void {
  if (!host || warned.has(host)) return;
  if (warned.size >= 50) warned.clear();
  warned.add(host);
  logger.warn(
    { host, sites: total, activeSites: active },
    fellBackToPrimary
      ? 'request host matches no site — serving the primary site instead'
      : 'request host matches no active site — serving global settings (no per-site overrides, no site scoping)'
  );
}

// The site list changes only when an admin edits a site, but resolveSite runs on
// every request (assets included). Cached for a few seconds and dropped
// explicitly by the sites routes on any write, so a change is instant.
let siteCache: { at: number; rows: any[] } | null = null;
const SITE_CACHE_MS = 5000;
export function invalidateSiteCache(): void { siteCache = null; }
function allSites(): any[] {
  if (!siteCache || Date.now() - siteCache.at > SITE_CACHE_MS) {
    siteCache = { at: Date.now(), rows: db.prepare('SELECT * FROM Site').all() as any[] };
  }
  return siteCache.rows;
}

// Resolve current site from the Host header (falls back to the primary site)
export function resolveSite(req: SiteRequest, _res: Response, next: NextFunction): void {
  try {
    const host = hostOf(req.headers.host);
    // One query, matched in JS: a stored domain may still carry a port.
    const all = allSites();
    const active = all.filter((s) => Number(s.active) === 1);
    let site: any = host ? active.find((s) => hostOf(s.domain) === host) : null;
    if (!site) {
      site = active.find((s) => Number(s.isPrimary) === 1) || null;
      // Only worth reporting when the install has sites at all: that is when
      // "nothing matched" means the visitor is not getting the site they asked
      // for (they get the primary site, or global settings when none is active).
      if (all.length > 0) warnUnmatched(host, all.length, active.length, !!site);
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
