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
