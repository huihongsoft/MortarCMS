import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'fs';
import express from 'express';
import db, { initDB, cuid } from '../src/utils/db';
import { ftsAvailable, buildMatchQuery, MIN_FTS_TERM, resetSearchIndexProbe } from '../src/utils/searchIndex';
import postRoutes from '../src/routes/posts';

// Search was `title LIKE '%term%'` — a leading wildcard no index can serve, so
// every search scanned the table. FTS5 with the trigram tokenizer replaces it
// (trigram, not unicode61, because CJK has no word boundaries for the default
// tokenizer to find). These pin the query it builds, the CJK behaviour, and that
// the index stays in step through ordinary writes.
const DB_FILE = process.env.MORTAR_DB_PATH || '/tmp/mortar-vitest-search.db';
let server: any;
let base = '';

async function search(q: string, extra = ''): Promise<any> {
  const r = await fetch(base + '/api/posts?search=' + encodeURIComponent(q) + extra);
  return r.json();
}

function insertPost(id: string, title: string, content: string, status = 'published', type = 'post') {
  db.prepare('INSERT INTO Post (id, title, slug, content, excerpt, status, type, authorId, publishedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
    .run(id, title, id, content, '', status, type, 'u1', new Date().toISOString());
}

beforeAll(async () => {
  initDB();
  db.prepare("INSERT INTO User (id, username, email, password, role, tokenVersion) VALUES ('u1','u1','u1@test.dev','x','admin',0)").run();
  const app = express();
  app.use(express.json());
  app.use('/api/posts', postRoutes);
  server = app.listen(0);
  await new Promise((r) => server.on('listening', r));
  base = 'http://127.0.0.1:' + server.address().port;
});

afterAll(() => {
  server?.close();
  for (const s of ['', '-wal', '-shm']) { try { fs.unlinkSync(DB_FILE + s); } catch {} }
});

describe('the index is available', () => {
  it('was created by migration 23', () => {
    resetSearchIndexProbe();
    expect(ftsAvailable()).toBe(true);
    expect(db.prepare("SELECT 1 FROM sqlite_master WHERE name = 'PostSearch'").get()).toBeTruthy();
  });
});

describe('match expressions', () => {
  it('ands the words, quoting each so FTS syntax can only be searched for', () => {
    expect(buildMatchQuery('theme css')).toBe('"theme" "css"');
    // A user typing FTS operators must not be able to change the query shape.
    expect(buildMatchQuery('NEAR(')).toBe('"NEAR("');
    expect(buildMatchQuery('a"b')).toBe('"a""b"');
    expect(buildMatchQuery('AND NOT')).toBe('"AND" "NOT"');
    // The three-character floor applies to every word, so a short one anywhere
    // sends the whole query to LIKE.
    expect(buildMatchQuery('*')).toBeNull();
    expect(buildMatchQuery('theme OR')).toBeNull();
  });

  it('hands short terms to LIKE instead of matching nothing', () => {
    // A trigram index cannot answer fewer than three characters, and a
    // two-character CJK word is a very ordinary query.
    expect(buildMatchQuery('ab')).toBeNull();
    expect(buildMatchQuery('中文')).toBeNull();
    expect(MIN_FTS_TERM).toBe(3);
    expect(buildMatchQuery('abc')).toBe('"abc"');
    expect(buildMatchQuery('   ')).toBeNull();
  });
});

describe('searching posts', () => {
  it('finds a body match and ranks the better one first', async () => {
    insertPost('s1', 'Unrelated heading', 'a long body about kubernetes ingress');
    insertPost('s2', 'Kubernetes on a budget', 'short body');
    const body = await search('kubernetes');
    const ids = body.posts.map((p: any) => p.id);
    expect(ids).toContain('s1');
    expect(ids).toContain('s2');
    expect(body.total).toBe(2);
    // The title match outranks the body match.
    expect(ids[0]).toBe('s2');
  });

  it('requires every word, in any order', async () => {
    insertPost('s3', 'Deploy notes', 'kubernetes ingress controller tuning');
    expect((await search('kubernetes ingress')).posts.map((p: any) => p.id)).toContain('s3');
    // "ingress controller" is in s3; "kubernetes budget" is only partly there.
    expect((await search('ingress budget')).total).toBe(0);
  });

  it('finds CJK substrings of three or more characters through the index', async () => {
    insertPost('c1', '首页轮播图的图片与链接', '正文内容');
    const body = await search('轮播图');
    expect(body.posts.map((p: any) => p.id)).toContain('c1');
  });

  it('still finds a two-character CJK query, via the LIKE fallback', async () => {
    insertPost('c2', '站点设置说明', '正文');
    const viaFallback = await search('站点');
    expect(viaFallback.posts.map((p: any) => p.id)).toContain('c2');
    // ...and the FTS path is not silently used for it.
    expect(buildMatchQuery('站点')).toBeNull();
  });

  it('keeps the index in step with writes, through the triggers', async () => {
    insertPost('d1', 'Draft about elasticsearch', 'a body mentioning alpha');
    expect((await search('alpha')).total).toBe(1);

    // An UPDATE re-indexes: the old body word stops matching and the new one
    // starts, through the trigger rather than any code in the write path.
    db.prepare("UPDATE Post SET content = 'a body mentioning beta' WHERE id = 'd1'").run();
    expect((await search('alpha')).total).toBe(0);
    expect((await search('beta')).total).toBe(1);

    // A title change behaves the same way.
    db.prepare("UPDATE Post SET title = 'Notes about opensearch' WHERE id = 'd1'").run();
    expect((await search('elasticsearch')).total).toBe(0);
    expect((await search('opensearch')).total).toBe(1);

    // The trash transition is an UPDATE too — that is how content leaves search.
    db.prepare("UPDATE Post SET status = 'trash' WHERE id = 'd1'").run();
    expect((await search('opensearch')).total).toBe(0);

    // A DELETE drops the indexed row.
    db.prepare("DELETE FROM Post WHERE id = 'd1'").run();
    expect((db.prepare("SELECT COUNT(*) c FROM PostSearch WHERE postId = 'd1'").get() as any).c).toBe(0);
  });

  it('does not leak unpublished or other-type content through the index', async () => {
    insertPost('h1', 'Hidden secretword page', 'body', 'draft');
    insertPost('h2', 'A page with secretword', 'body', 'published', 'page');
    insertPost('h3', 'A published post with secretword', 'body');
    const ids = (await search('secretword')).posts.map((p: any) => p.id);
    expect(ids).toEqual(['h3']);   // not the draft, not the page
  });
});
