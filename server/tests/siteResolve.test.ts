import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest';
import fs from 'fs';
import express from 'express';
import db, { initDB } from '../src/utils/db';
import { resolveSite, invalidateSiteCache } from '../src/middleware/site';
import { logger } from '../src/utils/logger';
import sitesRoutes from '../src/routes/sites';

// Site resolution used to compare the request host (port stripped) against the
// stored domain verbatim. A domain saved as "localhost:3001" therefore never
// matched, and the request silently lost its site context — per-site overrides,
// content scoping and canonical hosts all fell back to global with no signal
// anywhere. The Sites form accepts such a value, so this is a data-shape the
// resolver has to survive.
const DB_FILE = process.env.MORTAR_DB_PATH || '/tmp/mortar-vitest-site-resolve.db';

beforeEach(() => {
  initDB();
  db.prepare('DELETE FROM Site').run();
  // resolveSite caches the site list (it runs on every request, assets included);
  // tests write Site rows directly, so they have to drop the cache themselves.
  invalidateSiteCache();
});

afterAll(() => {
  try { fs.unlinkSync(DB_FILE); } catch {}
  try { fs.unlinkSync(DB_FILE + '-wal'); } catch {}
  try { fs.unlinkSync(DB_FILE + '-shm'); } catch {}
});

const addSite = (id: string, domain: string, isPrimary = 0, active = 1) => {
  db.prepare('INSERT INTO Site (id, name, slug, domain, isPrimary, active) VALUES (?, ?, ?, ?, ?, ?)')
    .run(id, id, id, domain, isPrimary, active);
  invalidateSiteCache();
};

const resolve = (host?: string): string | undefined => {
  const req: any = { headers: host === undefined ? {} : { host } };
  resolveSite(req, {} as any, () => {});
  return req.siteId;
};

describe('host resolution', () => {
  it('matches a plain domain, ignoring case and the request port', () => {
    addSite('s1', 'one.test', 1);
    expect(resolve('one.test')).toBe('s1');
    expect(resolve('ONE.test:8080')).toBe('s1');
  });

  it('matches a stored domain that itself carries a port', () => {
    addSite('s1', 'localhost:3001', 1);
    expect(resolve('localhost:3001')).toBe('s1');
    expect(resolve('localhost')).toBe('s1');
  });

  it('falls back to the active primary site for an unknown host', () => {
    addSite('s1', 'one.test', 1);
    addSite('s2', 'two.test');
    expect(resolve('elsewhere.test')).toBe('s1');
  });

  it('resolves nothing when the only site is inactive, and says so once', () => {
    addSite('s1', 'one.test', 1, 0);
    const warn = vi.spyOn(logger, 'warn').mockImplementation(() => logger);
    try {
      expect(resolve('one.test')).toBeUndefined();
      expect(warn).toHaveBeenCalledTimes(1);
      // Once per host, not once per request: this middleware runs on every one.
      expect(resolve('one.test')).toBeUndefined();
      expect(warn).toHaveBeenCalledTimes(1);
      // A different host is a different problem and does get its own line
      expect(resolve('other.test')).toBeUndefined();
      expect(warn).toHaveBeenCalledTimes(2);
    } finally { warn.mockRestore(); }
  });

  it('stays quiet on an install with no sites at all', () => {
    const warn = vi.spyOn(logger, 'warn').mockImplementation(() => logger);
    try {
      expect(resolve('anything.test')).toBeUndefined();
      expect(warn).not.toHaveBeenCalled();
    } finally { warn.mockRestore(); }
  });
});

// Two sites answering to the same host make resolution depend on row order, so
// the create/update routes must normalise before comparing and must not let an
// edit steal another site's domain.
describe('site domains stay unique', () => {
  it('rejects a duplicate that only differs by case, scheme or trailing slash', async () => {
    addSite('s1', 'one.test', 1);
    const app = express();
    app.use(express.json());
    app.use((req: any, _res: any, next: any) => { req.user = { userId: 'u1', role: 'admin' }; next(); });
    app.use('/api/sites', sitesRoutes);
    const srv = app.listen(0);
    await new Promise((r) => srv.on('listening', r));
    const base = 'http://127.0.0.1:' + (srv as any).address().port + '/api/sites';
    try {
      for (const domain of ['one.test', 'ONE.test', 'https://one.test', 'one.test/']) {
        const r = await fetch(base, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name: 'X', slug: 'x' + Math.abs(domain.length), domain }) });
        expect(r.status, domain).toBe(400);
      }
      const ok = await fetch(base, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name: 'Two', slug: 'two', domain: 'two.test' }) });
      expect(ok.status).toBe(201);
      const created = await ok.json();
      // an update must not point a site at another one's domain
      const clash = await fetch(base + '/' + created.id, { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ domain: 'ONE.test' }) });
      expect(clash.status).toBe(400);
      // …but re-saving its own domain (with a trailing slash) is fine
      const same = await fetch(base + '/' + created.id, { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ domain: 'two.test/', name: 'Two' }) });
      expect(same.status).toBe(200);
    } finally { srv.close(); }
  });
});
