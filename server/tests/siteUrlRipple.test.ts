import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'fs';
import db, { initDB } from '../src/utils/db';
import { getMailSettings } from '../src/utils/mailer';
import { isPublicSiteUrl } from '../plugins/search-engine-ping/index';

// Ripple guards: the install wizard now writes a site_url on every fresh
// install, so features that previously always saw an empty value switch to the
// configured branch. These tests pin the two that must not misbehave.
const DB_FILE = process.env.MORTAR_DB_PATH || '/tmp/mortar-vitest-siteurl-ripple.db';

beforeAll(() => { initDB(); });

afterAll(() => {
  for (const s of ['', '-wal', '-shm']) { try { fs.unlinkSync(DB_FILE + s); } catch {} }
});

const setSiteUrl = (value: string) => {
  if (value === '') { db.prepare("DELETE FROM Setting WHERE key = 'site_url'").run(); return; }
  db.prepare("INSERT INTO Setting (id, key, value) VALUES ('t-site-url', 'site_url', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").run(value);
};

describe('default mail From address', () => {
  it('falls back to localhost when no site URL is set', () => {
    setSiteUrl('');
    expect(getMailSettings().from).toBe('no-reply@localhost');
  });

  it('drops the port so the address stays valid', () => {
    // The install default is http://host:3001 — "no-reply@host:3001" is invalid.
    setSiteUrl('http://127.0.0.1:3001');
    expect(getMailSettings().from).toBe('no-reply@127.0.0.1');
  });

  it('uses the hostname for a real domain', () => {
    setSiteUrl('https://example.com');
    expect(getMailSettings().from).toBe('no-reply@example.com');
  });

  it('falls back to localhost for an unparseable value', () => {
    setSiteUrl('not a url');
    expect(getMailSettings().from).toBe('no-reply@localhost');
  });

  it('lets an explicit smtp_from win', () => {
    setSiteUrl('https://example.com');
    db.prepare("INSERT INTO Setting (id, key, value) VALUES ('t-from', 'smtp_from', 'hi@custom.dev') ON CONFLICT(key) DO UPDATE SET value = excluded.value").run();
    expect(getMailSettings().from).toBe('hi@custom.dev');
    db.prepare("DELETE FROM Setting WHERE key = 'smtp_from'").run();
  });
});

describe('search-engine ping public-host guard', () => {
  it.each([
    ['localhost', 'http://localhost:3001', false],
    ['localhost subdomain', 'http://blog.localhost', false],
    ['mdns name', 'http://mac.local:3001', false],
    ['internal name', 'http://server.internal', false],
    ['loopback v4 with port', 'http://127.0.0.1:3001', false],
    ['private v4', 'http://192.168.1.10', false],
    ['CGNAT v4', 'http://100.64.0.1', false],
    ['loopback v6 with port', 'http://[::1]:3001', false],
    ['unique-local v6', 'http://[fd00::1]', false],
    ['real domain', 'https://example.com', true],
    ['subdomain', 'https://blog.example.com', true],
    ['public IP', 'http://93.184.216.34', true],
    ['not a url', 'nonsense', false],
  ])('%s (%s)', (_label, url, expected) => {
    expect(isPublicSiteUrl(url)).toBe(expected);
  });
});
