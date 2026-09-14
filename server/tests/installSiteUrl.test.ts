import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'fs';
import http from 'node:http';
import express from 'express';
import db, { initDB } from '../src/utils/db';
import installRoutes from '../src/routes/install';
import siteRoutes from '../src/routes/sites';
import { resolveSite } from '../src/middleware/site';

const DB_FILE = process.env.MORTAR_DB_PATH || '/tmp/mortar-vitest-install-siteurl.db';
let server: any;
let base = '';

beforeAll(async () => {
  initDB();
  const app = express();
  app.use(express.json());
  app.use('/api/install', installRoutes);
  server = app.listen(0);
  await new Promise((r) => server.on('listening', r));
  base = 'http://127.0.0.1:' + server.address().port + '/api/install';
});

afterAll(() => {
  server?.close();
  for (const s of ['', '-wal', '-shm']) { try { fs.unlinkSync(DB_FILE + s); } catch {} }
});

function post(body: any) {
  return fetch(base, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
}

function setting(key: string) {
  return (db.prepare('SELECT value FROM Setting WHERE key = ?').get(key) as any)?.value;
}

function primarySite() {
  return db.prepare('SELECT * FROM Site WHERE isPrimary = 1').get() as any;
}

const valid = { dbType: 'sqlite', siteTitle: 'T', adminUsername: 'admin', adminEmail: 'a@b.dev', adminPassword: 'Passw0rd1', sampleData: false };

describe('install site URL validation (rejects before touching the database)', () => {
  it.each([
    ['no scheme', 'example.com'],
    ['non-http scheme', 'ftp://example.com'],
    ['with a path', 'https://example.com/blog'],
    ['with whitespace', 'https://exa mple.com'],
    ['not a URL', 'not-a-url'],
  ])('rejects a site URL that is %s', async (_label, siteUrl) => {
    const r = await post({ ...valid, siteUrl });
    expect(r.status).toBe(400);
    expect((await r.json()).error).toMatch(/site url/i);
  });

  it('wrote nothing while rejecting', () => {
    expect(setting('installed')).toBeUndefined();
    expect((db.prepare('SELECT COUNT(*) as c FROM Site').get() as any).c).toBe(0);
  });
});

// Only one successful install per database — the `installed` marker blocks the
// rest, so the success cases run last, in order.
describe('install records the site URL', () => {
  it('writes Setting.site_url and the primary Site domain', async () => {
    const r = await post({ ...valid, siteUrl: 'https://Example.com/' });
    const body = await r.json();
    expect(r.status, JSON.stringify(body)).toBe(200);
    expect(body.success).toBe(true);

    expect(setting('site_url')).toBe('https://example.com');
    const site = primarySite();
    // Hostname only: the resolver strips the port from the Host header.
    expect(site.domain).toBe('example.com');
    expect(site.slug).toBe('default');
  });

  it('updates the primary domain on a re-install (Site rows survive a reset)', async () => {
    // The reset endpoint only clears the installed marker, so the Site row is
    // still there and the wizard must update it instead of skipping the insert.
    db.prepare("DELETE FROM Setting WHERE key = 'installed'").run();

    const r = await post({ ...valid, siteUrl: 'https://new.example.com' });
    expect(r.status).toBe(200);

    expect(setting('site_url')).toBe('https://new.example.com');
    expect(primarySite().domain).toBe('new.example.com');
    expect((db.prepare('SELECT COUNT(*) as c FROM Site').get() as any).c).toBe(1);
  });

  it('does not steal a domain another site already owns', async () => {
    // domain is UNIQUE: letting the constraint fire would roll back the install,
    // so the primary domain is left alone (and the skip is logged).
    db.prepare("INSERT INTO Site (id, name, slug, domain, isPrimary, active) VALUES ('s2', 'Second', 'second', 'second.example.com', 0, 1)").run();
    db.prepare("DELETE FROM Setting WHERE key = 'installed'").run();

    const r = await post({ ...valid, siteUrl: 'https://second.example.com' });
    const body = await r.json();
    expect(r.status, JSON.stringify(body)).toBe(200);

    expect(primarySite().domain).toBe('new.example.com'); // unchanged
    expect(setting('site_url')).toBe('https://second.example.com'); // still recorded
    expect((db.prepare('SELECT COUNT(*) as c FROM Site').get() as any).c).toBe(2);
  });
});

// The point of recording the domain is that a request carrying it resolves to
// that site. fetch() refuses to set Host (undici forbids it), so drive node:http
// directly — this is what nginx's `proxy_set_header Host $host` reproduces.
describe('the installed domain actually resolves to its site', () => {
  let resolveApp: any;
  let port = 0;

  beforeAll(async () => {
    // Relies on the installs above (same file, same database) — assert instead
    // of assuming, so a filtered run fails with a clear message.
    expect((db.prepare('SELECT COUNT(*) as c FROM Site').get() as any).c).toBe(2);

    const app = express();
    app.use(express.json());
    app.use(resolveSite);
    app.use('/api/sites', siteRoutes);
    resolveApp = app.listen(0);
    await new Promise((r) => resolveApp.on('listening', r));
    port = resolveApp.address().port;
  });

  afterAll(() => { resolveApp?.close(); });

  function getWithHost(host: string): Promise<{ status: number; body: any }> {
    return new Promise((resolve, reject) => {
      const req = http.request(
        { hostname: '127.0.0.1', port, path: '/api/sites/current', headers: { Host: host } },
        (res) => {
          let data = '';
          res.on('data', (c) => (data += c));
          res.on('end', () => resolve({ status: res.statusCode || 0, body: JSON.parse(data || '{}') }));
        },
      );
      req.on('error', reject);
      req.end();
    });
  }

  it('resolves the primary site from its domain', async () => {
    const r = await getWithHost('new.example.com');
    expect(r.status).toBe(200);
    expect(r.body.domain).toBe('new.example.com');
    expect(r.body.isPrimary).toBe(1);
  });

  it('resolves a secondary site, stripping the port', async () => {
    const r = await getWithHost('second.example.com:3001');
    expect(r.body.domain).toBe('second.example.com');
  });

  it('lowercases the Host before matching', async () => {
    const r = await getWithHost('SECOND.Example.COM');
    expect(r.body.domain).toBe('second.example.com');
  });

  it('falls back to the primary site for an unregistered host', async () => {
    const r = await getWithHost('nobody.example.com');
    expect(r.body.domain).toBe('new.example.com');
    expect(r.body.isPrimary).toBe(1);
  });
});
