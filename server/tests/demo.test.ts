import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'fs';
import db, { initDB } from '../src/utils/db';
import { importDemoData, resetSite } from '../src/utils/demo';

// MORTAR_DB_PATH is set by vitest.config.ts, so db.ts opens a throwaway file.
const DB_FILE = process.env.MORTAR_DB_PATH || '/tmp/mortar-vitest.db';

const count = (table: string): number => {
  try { return (db.prepare('SELECT COUNT(*) as c FROM ' + table).get() as any)?.c || 0; } catch { return -1; }
};

beforeAll(() => {
  initDB();
  db.prepare('INSERT INTO User (id, username, email, password, role) VALUES (?, ?, ?, ?, ?)')
    .run('test-admin', 'admin', 'admin@test.dev', 'x', 'admin');
  db.prepare('INSERT INTO Site (id, name, slug, domain, isPrimary, active) VALUES (?, ?, ?, ?, 1, 1)')
    .run('site-1', 'Test', 'default', 'localhost');
});

afterAll(() => {
  try { fs.unlinkSync(DB_FILE); } catch {}
  try { fs.unlinkSync(DB_FILE + '-wal'); } catch {}
  try { fs.unlinkSync(DB_FILE + '-shm'); } catch {}
  // Remove generated demo cover images
  const uploads = require('path').join(__dirname, '../../uploads');
  try { for (const f of fs.readdirSync(uploads)) if (f.startsWith('demo-')) fs.unlinkSync(require('path').join(uploads, f)); } catch {}
});

describe('importDemoData', () => {
  it('imports posts, categories, tags, comments, menu and links', () => {
    const stats = importDemoData();
    expect(stats.posts).toBe(8);
    expect(stats.categories).toBe(6);
    expect(stats.tags).toBe(12);
    expect(stats.comments).toBeGreaterThanOrEqual(3);
    expect(count('Post')).toBe(8);
    expect(count('Category')).toBe(6);
    expect(count('Tag')).toBe(12);
    expect(count('Menu')).toBe(1);
    expect(count('FriendLink')).toBe(3);
  });

  it('activates the softstore theme and writes a carousel', () => {
    const theme = db.prepare("SELECT value FROM Setting WHERE key = 'theme_active'").get() as any;
    const carousel = db.prepare("SELECT value FROM Setting WHERE key = 'carousel_items'").get() as any;
    expect(theme?.value).toBe('softstore');
    expect(carousel?.value).toContain('/uploads/demo-');
  });

  it('creates comment replies', () => {
    expect(count('Comment WHERE parentId IS NOT NULL')).toBeGreaterThan(0);
  });

  it('is idempotent (re-import does not duplicate)', () => {
    importDemoData();
    expect(count('Post')).toBe(8);
    expect(count('Category')).toBe(6);
  });
});

describe('resetSite', () => {
  it('clears content but preserves users, roles and sites', () => {
    const stats = resetSite();
    expect(count('Post')).toBe(0);
    expect(count('Category')).toBe(0);
    expect(count('Tag')).toBe(0);
    expect(count('Comment')).toBe(0);
    expect(count('Menu')).toBe(0);
    expect(count('Link')).toBe(0);
    expect(count('User')).toBe(1);
    expect(count('Site')).toBe(1);
    expect(stats.Post).toBe(8);
  });

  it('removes demo settings (theme falls back to default)', () => {
    expect((db.prepare("SELECT value FROM Setting WHERE key = 'theme_active'").get() as any)?.value).toBeUndefined();
    expect((db.prepare("SELECT value FROM Setting WHERE key = 'carousel_items'").get() as any)?.value).toBeUndefined();
  });
});
