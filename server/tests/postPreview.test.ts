import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'fs';
import express from 'express';
import db, { initDB } from '../src/utils/db';
import postsRouter from '../src/routes/posts';
import { signToken, signPreviewToken, verifyPreviewToken } from '../src/utils/jwt';
import { setUserSites } from '../src/utils/userSites';

// A preview link shows ONE unpublished post on the real theme to a reviewer who
// has no account. The token is the whole authority, so it has to be narrow: one
// post, one site, and revocable through the session version. Anything wrong with
// it is answered exactly like a missing post — never a hint that a hidden post
// exists.

const DB_FILE = process.env.MORTAR_DB_PATH || '/tmp/mortar-vitest-post-preview.db';

let server: any;
let base = '';

const asAdmin = { authorization: 'Bearer ' + signToken({ userId: 'pv-admin', role: 'admin', v: 0 }), 'content-type': 'application/json' };
const asAuthor = { authorization: 'Bearer ' + signToken({ userId: 'pv-au', role: 'author', v: 0 }), 'content-type': 'application/json' };
const asAuthor2 = { authorization: 'Bearer ' + signToken({ userId: 'pv-au2', role: 'author', v: 0 }), 'content-type': 'application/json' };

beforeAll(async () => {
  initDB();
  for (const [id, role] of [['pv-admin', 'admin'], ['pv-au', 'author'], ['pv-au2', 'author']] as const) {
    db.prepare("INSERT INTO User (id, username, email, password, role, tokenVersion) VALUES (?, ?, ?, 'x', ?, 0)").run(id, id, id + '@example.dev', role);
  }
  const app = express();
  app.use(express.json());
  // Stands in for the real site resolver: the Host would pick the site.
  app.use((req: any, _res: any, next: any) => { req.siteId = req.headers['x-site'] || undefined; next(); });
  app.use('/api/posts', postsRouter);
  server = app.listen(0);
  await new Promise(r => server.on('listening', r));
  base = 'http://127.0.0.1:' + server.address().port + '/api/posts';
});

afterAll(() => {
  server?.close();
  for (const s of ['', '-wal', '-shm']) { try { fs.unlinkSync(DB_FILE + s); } catch {} }
});

function addPost(id: string, slug: string, opts: { status?: string; authorId?: string; siteId?: string | null; content?: string } = {}) {
  db.prepare('INSERT INTO Post (id, title, slug, content, status, type, authorId, siteId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    .run(id, 'Title ' + id, slug, opts.content || '<p>draft body</p>', opts.status || 'draft', 'post', opts.authorId || 'pv-admin', opts.siteId ?? null);
}

const mint = (id: string, headers: any) => fetch(base + '/' + id + '/preview-link', { headers });
const open = (slug: string, token?: string, headers: any = {}) =>
  fetch(base + '/slug/' + slug + (token ? '?preview=' + encodeURIComponent(token) : ''), { headers });

describe('minting a preview link', () => {
  it('gives the author a link for their own unpublished post', async () => {
    addPost('m1', 'mint-one', { authorId: 'pv-au' });
    const r = await mint('m1', asAuthor);
    expect(r.status).toBe(200);
    const { url } = await r.json();
    expect(url).toContain('/post/mint-one?preview=');
  });

  it('builds the link from the configured site URL, not from the caller\'s Host', async () => {
    // A link carries a capability: aiming it at a host the caller chose is how
    // the token ends up in someone else's logs.
    db.prepare("INSERT OR REPLACE INTO Setting (id, key, value) VALUES ('site_url','site_url','https://blog.example.com')").run();
    try {
      addPost('m9', 'mint-nine', { authorId: 'pv-au' });
      const { url } = await (await mint('m9', asAuthor)).json();
      expect(url.startsWith('https://blog.example.com/post/mint-nine?preview=')).toBe(true);
      expect(url).not.toContain('127.0.0.1');
    } finally {
      db.prepare("DELETE FROM Setting WHERE key = 'site_url'").run();
    }
  });

  it('stamps the token with the row\'s session version, not the request\'s', async () => {
    // An app-password session carries no `v`; reading it from the session would
    // mint a token that "log out everywhere" could never revoke.
    db.prepare("UPDATE User SET tokenVersion = 3 WHERE id = 'pv-au'").run();
    try {
      addPost('m10', 'mint-ten', { authorId: 'pv-au' });
      const { url } = await (await mint('m10', { authorization: 'Bearer ' + signToken({ userId: 'pv-au', role: 'author' }), 'content-type': 'application/json' })).json();
      const raw = decodeURIComponent(String(url).split('?preview=')[1]);
      expect(verifyPreviewToken(raw)?.v).toBe(3);
    } finally {
      db.prepare("UPDATE User SET tokenVersion = 0 WHERE id = 'pv-au'").run();
    }
  });

  it('refuses a post the caller may not edit', async () => {
    addPost('m2', 'mint-two', { authorId: 'pv-au' });
    const r = await mint('m2', asAuthor2);
    expect(r.status).toBe(403);
  });

  it('refuses a trashed post', async () => {
    addPost('m3', 'mint-three', { authorId: 'pv-au', status: 'trash' });
    const r = await mint('m3', asAuthor);
    expect(r.status).toBe(400);
  });

  it('refuses a page: the page route has no preview support', async () => {
    db.prepare("INSERT INTO Post (id, title, slug, content, status, type, authorId) VALUES ('m-pg','A page','a-page','<p>x</p>','draft','page','pv-au')").run();
    const r = await mint('m-pg', asAuthor);
    expect(r.status).toBe(400);
    expect((await r.json()).error).toContain('页面');
  });

  it('requires authentication', async () => {
    const r = await mint('m1', { 'content-type': 'application/json' });
    expect(r.status).toBe(401);
  });
});

describe('opening a preview link', () => {
  it('shows the draft, and says it must not be cached', async () => {
    addPost('o1', 'open-one', { authorId: 'pv-au', status: 'draft' });
    const { url } = await (await mint('o1', asAuthor)).json();
    const token = decodeURIComponent(String(url).split('?preview=')[1]);

    const r = await open('open-one', token);
    expect(r.status).toBe(200);
    expect(r.headers.get('cache-control')).toContain('no-store');
    const body = await r.json();
    expect(body.content).toContain('draft body');
    expect(body.status).toBe('draft');
  });

  it('shows a scheduled post, which anonymous visitors cannot reach at all', async () => {
    addPost('o2', 'open-two', { authorId: 'pv-au', status: 'published', siteId: null });
    db.prepare("UPDATE Post SET publishedAt = '2999-01-01T00:00:00.000Z' WHERE id = 'o2'").run();
    expect((await open('open-two')).status).toBe(404);      // baseline: hidden

    const token = previewTokenFor('o2');
    expect((await open('open-two', token)).status).toBe(200);
  });

  it('never lets a token open a different post', async () => {
    addPost('o3', 'open-three', { authorId: 'pv-au' });
    addPost('o4', 'open-four', { authorId: 'pv-au' });
    const tokenForThree = previewTokenFor('o3');
    expect((await open('open-three', tokenForThree)).status).toBe(200);
    expect((await open('open-four', tokenForThree)).status).toBe(404);
  });

  it('rejects a tampered or expired token as if the post did not exist', async () => {
    addPost('o5', 'open-five', { authorId: 'pv-au' });
    const token = previewTokenFor('o5');
    const tampered = token.slice(0, -2) + 'xy';
    const tamperedRes = await open('open-five', tampered);
    expect(tamperedRes.status).toBe(404);
    expect(JSON.stringify(await tamperedRes.json())).not.toContain('draft body');

    const expired = signPreviewToken({ userId: 'pv-au', pid: 'o5', v: 0 }, '-1s');
    expect((await open('open-five', expired)).status).toBe(404);
  });

  it('dies when the user logs out everywhere (tokenVersion)', async () => {
    addPost('o6', 'open-six', { authorId: 'pv-au' });
    const token = previewTokenFor('o6');
    expect((await open('open-six', token)).status).toBe(200);

    db.prepare("UPDATE User SET tokenVersion = 1 WHERE id = 'pv-au'").run();
    expect((await open('open-six', token)).status).toBe(404);
    db.prepare("UPDATE User SET tokenVersion = 0 WHERE id = 'pv-au'").run();
  });
});

describe('the preview token is not a session', () => {
  it('cannot be used as a bearer token', async () => {
    addPost('s1', 'session-one', { authorId: 'pv-au' });
    const token = previewTokenFor('s1');
    const r = await fetch(base + '/admin?limit=5', { headers: { authorization: 'Bearer ' + token } });
    expect(r.status).toBe(401);
  });
});

describe('preview stays inside its site', () => {
  it('dies when the viewer loses their site assignment', async () => {
    // The role did not change, so a check that only re-read the role would keep
    // honouring the link. Assignments are the authority for "which sites".
    db.prepare("INSERT OR REPLACE INTO Site (id, name, slug, domain) VALUES ('site-a','A','s-a','a.test')").run();
    db.prepare("INSERT OR REPLACE INTO Site (id, name, slug, domain) VALUES ('site-b','B','s-b','b.test')").run();
    addPost('t2', 'tenant-two', { authorId: 'pv-au', siteId: 'site-a' });
    const token = previewTokenFor('t2');
    expect((await open('tenant-two', token, { 'x-site': 'site-a' })).status).toBe(200);

    try {
      setUserSites('pv-au', ['site-b']);
      expect((await open('tenant-two', token, { 'x-site': 'site-a' })).status).toBe(404);
    } finally {
      // Without this a failure here leaves the assignment in place and takes the
      // NEXT test down with it.
      setUserSites('pv-au', []);
    }
  });

  it('refuses when the host resolves to another site', async () => {
    addPost('t1', 'tenant-one', { authorId: 'pv-au', siteId: 'site-a' });
    const token = previewTokenFor('t1');
    expect((await open('tenant-one', token, { 'x-site': 'site-a' })).status).toBe(200);
    expect((await open('tenant-one', token, { 'x-site': 'site-b' })).status).toBe(404);
  });
});

// The link the mint route would hand out, without going through HTTP.
function previewTokenFor(postId: string): string {
  return signPreviewToken({ userId: 'pv-au', pid: postId, v: 0 });
}
