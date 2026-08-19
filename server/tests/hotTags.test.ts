import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'fs';
import express from 'express';
import db, { initDB, cuid } from '../src/utils/db';
import tagsRouter from '../src/routes/tags';
import { renderShortcode } from '../src/utils/shortcodes';

// MORTAR_DB_PATH is set by vitest.config.ts, so db.ts opens a throwaway file.
const DB_FILE = process.env.MORTAR_DB_PATH || '/tmp/mortar-vitest.db';

let server: any;
let base = '';

function seed() {
  db.prepare('INSERT INTO User (id, username, email, password, role) VALUES (?, ?, ?, ?, ?)')
    .run('u-admin', 'admin', 'admin@test.dev', 'x', 'admin');
  // Tags: viral (1 post, 5000 views) vs popular (3 posts, 30 views each)
  const viralId = cuid(), popularId = cuid(), deadId = cuid();
  db.prepare('INSERT INTO Tag (id, name, slug) VALUES (?, ?, ?)').run(viralId, 'Viral', 'viral');
  db.prepare('INSERT INTO Tag (id, name, slug) VALUES (?, ?, ?)').run(popularId, 'Popular', 'popular');
  db.prepare('INSERT INTO Tag (id, name, slug) VALUES (?, ?, ?)').run(deadId, 'Dead', 'dead');
  const p1 = cuid(), p2 = cuid(), p3 = cuid(), p4 = cuid();
  const insPost = (id: string, views: number, status = 'published') => {
    db.prepare('INSERT INTO Post (id, title, slug, status, authorId, views) VALUES (?, ?, ?, ?, ?, ?)')
      .run(id, id, id, status, 'u-admin', views);
  };
  insPost(p1, 5000);                       // viral post
  insPost(p2, 30); insPost(p3, 30); insPost(p4, 30);  // popular posts
  db.prepare('INSERT INTO PostTag (postId, tagId) VALUES (?, ?)').run(p1, viralId);
  for (const p of [p2, p3, p4]) db.prepare('INSERT INTO PostTag (postId, tagId) VALUES (?, ?)').run(p, popularId);
  // Draft posts must not count toward hotness
  const draft = cuid();
  insPost(draft, 99999, 'draft');
  db.prepare('INSERT INTO PostTag (postId, tagId) VALUES (?, ?)').run(draft, deadId);
  return { viralId, popularId, deadId };
}

beforeAll(async () => {
  initDB();
  seed();
  const app = express();
  app.use(express.json());
  app.use('/api/tags', (req: any, _res: any, next: any) => { req.user = { userId: 'u-admin', role: 'admin' }; next(); }, tagsRouter);
  server = app.listen(0);
  await new Promise(r => server.on('listening', r));
  base = 'http://127.0.0.1:' + server.address().port + '/api/tags';
});

afterAll(async () => {
  server?.close();
  try { fs.unlinkSync(DB_FILE); } catch {}
  try { fs.unlinkSync(DB_FILE + '-wal'); } catch {}
  try { fs.unlinkSync(DB_FILE + '-shm'); } catch {}
});

describe('hot tags (aggregated published-post views)', () => {
  it('sorts tags by aggregated views: one viral post beats many unread ones', async () => {
    const r = await fetch(base);
    expect(r.status).toBe(200);
    const tags = await r.json();
    const byName = (n: string) => tags.find((t: any) => t.name === n);
    expect(byName('Viral')._count).toEqual({ posts: 1, views: 5000 });
    expect(byName('Popular')._count).toEqual({ posts: 3, views: 90 });
    // Dead tag: draft posts are excluded from both counts and views
    expect(byName('Dead')._count).toEqual({ posts: 0, views: 0 });
  });

  it('tag-cloud shortcode orders by views (viral first, larger font)', async () => {
    const html = renderShortcode('tag-cloud');
    expect(html).toContain('Viral');
    expect(html).toContain('Popular');
    const viralIdx = html.indexOf('Viral');
    const popularIdx = html.indexOf('Popular');
    expect(viralIdx).toBeGreaterThan(-1);
    expect(popularIdx).toBeGreaterThan(-1);
    expect(viralIdx).toBeLessThan(popularIdx);
    // Font size: viral tag renders larger (its views dominate)
    const viralFont = html.match(/font-size:(\d+)px[^>]*>[^<]*Viral/)?.[1];
    const popularFont = html.match(/font-size:(\d+)px[^>]*>[^<]*Popular/)?.[1];
    expect(parseInt(viralFont || '0')).toBeGreaterThan(parseInt(popularFont || '999'));
  });
});
