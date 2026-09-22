import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'fs';
import express from 'express';
import db, { initDB } from '../src/utils/db';
import { signToken } from '../src/utils/jwt';
import postRoutes from '../src/routes/posts';
import commentRoutes from '../src/routes/comments';

// Members-only gating and comment attribution used a bare verifyToken(), which
// accepted 2FA-partial tokens (type:'2fa', issued after the password but before
// the TOTP) and blacklisted ones. Both now go through resolveOptionalUser.
const DB_FILE = process.env.MORTAR_DB_PATH || '/tmp/mortar-vitest-members-only.db';
let server: any;
let base = '';

beforeAll(async () => {
  initDB();
  db.prepare("INSERT OR REPLACE INTO User (id, username, email, password, role, tokenVersion) VALUES ('u1','u1','u1@example.dev','x','subscriber',0)").run();
  db.prepare("INSERT INTO Post (id, title, slug, content, excerpt, status, type, authorId, publishedAt) VALUES ('post1','Members','members-post','<p>secret body</p>','', 'published','post','u1', ?)").run(new Date().toISOString());
  db.prepare("INSERT INTO PostMeta (id, postId, key, value) VALUES ('m1','post1','_members_only','1')").run();

  const app = express();
  app.use(express.json());
  app.use('/api/posts', postRoutes);
  app.use('/api/comments', commentRoutes);
  server = app.listen(0);
  await new Promise((r) => server.on('listening', r));
  base = 'http://127.0.0.1:' + server.address().port + '/api';
});

afterAll(() => {
  server?.close();
  for (const s of ['', '-wal', '-shm']) { try { fs.unlinkSync(DB_FILE + s); } catch {} }
});

const full = signToken({ userId: 'u1', role: 'subscriber', v: 0 });
const partial2fa = signToken({ userId: 'u1', role: 'subscriber', type: '2fa', v: 0 });
const stale = signToken({ userId: 'u1', role: 'subscriber', v: 99 });

async function getPost(token?: string) {
  const headers: Record<string, string> = {};
  if (token) headers.authorization = 'Bearer ' + token;
  return fetch(base + '/posts/slug/members-post', { headers });
}

// The single-post route refuses a protected body until the cookie unlocks it,
// but the public lists returned the whole row — shipping the body and the
// protection hash. These pin the list shape.
describe('public list payloads hide protected bodies and the password hash', () => {
  beforeAll(() => {
    db.prepare("INSERT INTO Post (id, title, slug, content, excerpt, status, type, authorId, password, publishedAt) VALUES ('post2','Protected','protected-post','<p>TOP-SECRET-BODY</p>','visible excerpt','published','post','u1','$2a$10$storedhash', ?)")
      .run(new Date().toISOString());
  });

  it('omits the body and the hash for anonymous callers', async () => {
    const list = await (await fetch(base + '/posts')).json();
    const raw = JSON.stringify(list);
    expect(raw).not.toContain('TOP-SECRET-BODY');
    expect(raw).not.toContain('storedhash');
    expect(raw).not.toContain('"password"');
    // the card data itself is still there (the list is not broken by the strip)
    expect(list.posts.some((p: any) => p.slug === 'protected-post')).toBe(true);
    expect(list.posts.find((p: any) => p.slug === 'protected-post').excerpt).toBe('visible excerpt');
    // enrichPosts embeds the author row; its email is not public data
    expect(raw).not.toContain('@example.dev');
    expect(list.posts[0].author?.username).toBeTruthy();
    expect(list.posts[0].author?.email).toBeUndefined();
  });

  it('omits them from the popular list too', async () => {
    const popular = await (await fetch(base + '/posts/popular')).json();
    const raw = JSON.stringify(popular);
    expect(raw).not.toContain('TOP-SECRET-BODY');
    expect(raw).not.toContain('storedhash');
    // The row itself must not be advertised either: stripping the body still
    // published the title and excerpt of a gated/unlisted post.
    expect(popular.some((p: any) => p.slug === 'protected-post')).toBe(false);
    expect(popular.some((p: any) => p.slug === 'members-post')).toBe(false);
    // …and the search dropdown is a public list as well
    const suggest = await (await fetch(base + '/posts/suggest?q=members')).json();
    expect(suggest.suggestions.some((s: any) => s.slug === 'members-post')).toBe(false);
  });
});

// The per-category "hot" rail a theme renders inside a category block needs a
// ranking scoped to that category, not the site-wide one.
describe('the popular list can be scoped to a category', () => {
  beforeAll(() => {
    db.prepare("INSERT INTO Category (id, name, slug) VALUES ('cat-a','Alpha','alpha')").run();
    db.prepare("INSERT INTO Category (id, name, slug) VALUES ('cat-b','Beta','beta')").run();
    const ins = (id: string, views: number) =>
      db.prepare("INSERT INTO Post (id, title, slug, content, excerpt, status, type, authorId, publishedAt, views) VALUES (?, ?, ?, '<p>b</p>', 'e', 'published', 'post', 'u1', ?, ?)")
        .run(id, id, id, new Date().toISOString(), views);
    ins('a-hot', 50); ins('a-cold', 10); ins('b-hot', 99);
    const link = (postId: string, categoryId: string) => db.prepare('INSERT INTO PostCategory (postId, categoryId) VALUES (?, ?)').run(postId, categoryId);
    link('a-hot', 'cat-a'); link('a-cold', 'cat-a'); link('b-hot', 'cat-b');
  });

  it('ranks by views within the category', async () => {
    const all = await (await fetch(base + '/posts/popular?limit=10')).json();
    expect(all.map((p: any) => p.slug)).toEqual(['b-hot', 'a-hot', 'a-cold']);
    const alpha = await (await fetch(base + '/posts/popular?limit=10&category=alpha')).json();
    expect(alpha.map((p: any) => p.slug)).toEqual(['a-hot', 'a-cold']);
    const beta = await (await fetch(base + '/posts/popular?limit=10&category=beta')).json();
    expect(beta.map((p: any) => p.slug)).toEqual(['b-hot']);
  });

  it('returns nothing for a category that does not exist', async () => {
    const none = await (await fetch(base + '/posts/popular?category=nope')).json();
    expect(none).toEqual([]);
  });

  it('still lets an editor read the body, but never the hash', async () => {
    // a real editor: the role comes from the stored user, not the token claim
    db.prepare("INSERT OR REPLACE INTO User (id, username, email, password, role, tokenVersion) VALUES ('ed1','ed1','ed1@example.dev','x','editor',0)").run();
    const list = await (await fetch(base + '/posts', { headers: { authorization: 'Bearer ' + signToken({ userId: 'ed1', role: 'editor', v: 0 }) } })).json();
    const p = list.posts.find((x: any) => x.slug === 'protected-post');
    expect(p.content).toContain('TOP-SECRET-BODY');
    expect(p.password).toBeUndefined();
  });
});

describe('public archive month', () => {
  it('serves the month instead of erroring', async () => {
    // This build reports SQLITE_DQS=0, so a double-quoted "%Y-%m" is read as an
    // identifier and the whole route 500s with "no such column".
    const [y, m] = new Date().toISOString().slice(0, 7).split('-');
    const r = await fetch(base + '/posts/archive/' + y + '/' + m);
    expect(r.status).toBe(200);
    const body = await r.json();
    expect(Array.isArray(body.posts)).toBe(true);
    expect(body.archive).toEqual({ year: y, month: m });
  });
});

describe('members-only gating', () => {
  it('blocks an anonymous visitor', async () => {
    const r = await getPost();
    expect(r.status).toBe(403);
    expect((await r.json()).membersOnly).toBe(true);
  });

  it('blocks a 2FA-partial token', async () => {
    expect((await getPost(partial2fa)).status).toBe(403);
  });

  it('blocks a stale-session token', async () => {
    expect((await getPost(stale)).status).toBe(403);
  });

  it('never leaks the body when blocked', async () => {
    expect(JSON.stringify(await (await getPost(partial2fa)).json())).not.toContain('secret body');
  });

  it('allows a full session token', async () => {
    const r = await getPost(full);
    expect(r.status).toBe(200);
    expect((await r.json()).content).toContain('secret body');
  });

  it('excludes members-only posts from the public list for a partial token', async () => {
    const anon = await (await fetch(base + '/posts')).json();
    const withPartial = await (await fetch(base + '/posts', { headers: { authorization: 'Bearer ' + partial2fa } })).json();
    const withFull = await (await fetch(base + '/posts', { headers: { authorization: 'Bearer ' + full } })).json();
    const ids = (r: any) => (r.posts || []).map((p: any) => p.id);
    expect(ids(anon)).not.toContain('post1');
    expect(ids(withPartial)).not.toContain('post1');
    expect(ids(withFull)).toContain('post1');
  });
});

describe('comment attribution', () => {
  async function comment(token?: string) {
    const headers: Record<string, string> = { 'content-type': 'application/json' };
    if (token) headers.authorization = 'Bearer ' + token;
    const r = await fetch(base + '/comments', {
      method: 'POST', headers,
      body: JSON.stringify({ postId: 'post1', content: 'hi there', author: 'A', email: 'a@b.dev' }),
    });
    return (await r.json()).userId ?? null;
  }

  it('does not attribute a comment to a 2FA-partial token', async () => {
    expect(await comment(partial2fa)).toBeNull();
  });

  it('does not attribute a comment to a stale token', async () => {
    expect(await comment(stale)).toBeNull();
  });

  it('attributes a comment to a full session token', async () => {
    expect(await comment(full)).toBe('u1');
  });
});
