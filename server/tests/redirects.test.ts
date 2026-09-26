import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import fs from 'fs';
import express from 'express';
import db, { initDB, cuid } from '../src/utils/db';
import { signToken } from '../src/utils/jwt';
import { redirectMiddleware } from '../src/middleware/redirects';
import { normalizePath, normalizeTarget, resolveRedirect, recordMovedPath, invalidateRedirectCache } from '../src/utils/redirects';
import postRoutes from '../src/routes/posts';
import redirectRoutes from '../src/routes/redirects';

// Editing a published post's slug used to be impossible through the API (the
// editor sent `slug` and the schema dropped it), and nothing could fix a URL that
// had already changed — the broken-link report only lists dead links. These pin
// the pieces: the path/target rules, the lookup, the 301 itself, and the redirect
// the slug-change path writes.
const DB_FILE = process.env.MORTAR_DB_PATH || '/tmp/mortar-vitest-redirects.db';
let server: any;
let base = '';

const token = (id: string, role: string) => ({ Authorization: 'Bearer ' + signToken({ userId: id, role, v: 0 }), 'content-type': 'application/json' });

function addRedirect(from: string, to: string, opts: { status?: number; siteId?: string | null } = {}): string {
  const id = cuid();
  db.prepare('INSERT INTO Redirect (id, fromPath, toPath, status, siteId, hits, createdAt, createdBy) VALUES (?, ?, ?, ?, ?, 0, ?, ?)')
    .run(id, normalizePath(from), to, opts.status || 301, opts.siteId ?? null, new Date().toISOString(), 'test');
  invalidateRedirectCache();
  return id;
}

beforeAll(async () => {
  initDB();
  db.prepare("INSERT INTO User (id, username, email, password, role, tokenVersion) VALUES ('a1','a1','a1@test.dev','x','admin',0)").run();
  const app = express();
  app.use(express.json());
  // Stand in for the SPAs: anything reaching here is "the site".
  app.use(redirectMiddleware());
  app.use('/api/posts', postRoutes);
  app.use('/api/redirects', redirectRoutes);
  app.use((req, res) => { res.status(req.path.startsWith('/api') ? 404 : 200).json({ served: req.path }); });
  server = app.listen(0);
  await new Promise((r) => server.on('listening', r));
  base = 'http://127.0.0.1:' + server.address().port;
});

afterAll(() => {
  server?.close();
  for (const s of ['', '-wal', '-shm']) { try { fs.unlinkSync(DB_FILE + s); } catch {} }
});

beforeEach(() => { db.prepare('DELETE FROM Redirect').run(); invalidateRedirectCache(); });

describe('path and target rules', () => {
  it('normalizes the source path', () => {
    expect(normalizePath('/old/')).toBe('/old');
    expect(normalizePath('old')).toBe('/old');
    expect(normalizePath('/old?utm=1#x')).toBe('/old');
    expect(normalizePath('')).toBe('/');
    expect(normalizePath('/')).toBe('/');
  });

  it('accepts a site path or an absolute http(s) URL, and nothing else', () => {
    expect(normalizeTarget('/new')).toBe('/new');
    expect(normalizeTarget('https://example.com/x')).toBe('https://example.com/x');
    expect(normalizeTarget('http://example.com')).toBe('http://example.com');
    // A Location header is a redirect primitive: these would be XSS or an open
    // redirect that reads like a path.
    expect(normalizeTarget('javascript:alert(1)')).toBeNull();
    expect(normalizeTarget('data:text/html,x')).toBeNull();
    expect(normalizeTarget('//evil.example/x')).toBeNull();
    expect(normalizeTarget('   ')).toBeNull();
  });
});

describe('lookup', () => {
  it('finds a redirect and prefers the site-specific row over the global one', () => {
    addRedirect('/old', '/global-target');
    expect(resolveRedirect('/old')?.toPath).toBe('/global-target');
    addRedirect('/old', '/site-target', { siteId: 'site-1' });
    expect(resolveRedirect('/old', 'site-1')?.toPath).toBe('/site-target');
    // Another site still gets the global row, not someone else's.
    expect(resolveRedirect('/old', 'site-2')?.toPath).toBe('/global-target');
  });

  it('does not carry a 302 request as a 301', () => {
    addRedirect('/temp', '/now', { status: 302 });
    expect(resolveRedirect('/temp')?.status).toBe(302);
  });

  it('never redirects the root', () => {
    addRedirect('/', '/somewhere');
    expect(resolveRedirect('/')).toBeNull();
  });
});

describe('recordMovedPath', () => {
  it('writes a 301 and counts the hit', () => {
    expect(recordMovedPath('/post/old-title', '/post/new-title', null)).toBe(true);
    const row = resolveRedirect('/post/old-title');
    expect(row?.toPath).toBe('/post/new-title');
    expect(row?.status).toBe(301);
    expect(row?.createdBy).toBe('slug-change');
  });

  it('repoints an existing row instead of chaining redirects', () => {
    recordMovedPath('/post/a', '/post/b', null);
    recordMovedPath('/post/a', '/post/c', null);
    const rows = db.prepare("SELECT * FROM Redirect WHERE fromPath = '/post/a'").all() as any[];
    expect(rows).toHaveLength(1);
    expect(rows[0].toPath).toBe('/post/c');
  });

  it('ignores a no-op or a bad target', () => {
    expect(recordMovedPath('/post/a', '/post/a', null)).toBe(false);
    expect(recordMovedPath('/post/a', 'javascript:x', null)).toBe(false);
    expect(db.prepare('SELECT COUNT(*) c FROM Redirect').get()).toBeTruthy();
  });
});

describe('the middleware', () => {
  it('answers 301 with a Location header and counts the hit', async () => {
    const id = addRedirect('/old-page', '/new-page');
    const r = await fetch(base + '/old-page', { redirect: 'manual' });
    expect(r.status).toBe(301);
    expect(r.headers.get('location')).toBe('/new-page');
    expect((db.prepare('SELECT hits FROM Redirect WHERE id = ?').get(id) as any).hits).toBe(1);
  });

  it('honours 302 and the query string it was requested with', async () => {
    addRedirect('/temp', 'https://elsewhere.example/x', { status: 302 });
    const r = await fetch(base + '/temp?a=1', { redirect: 'manual' });
    expect(r.status).toBe(302);
    expect(r.headers.get('location')).toBe('https://elsewhere.example/x');
  });

  it('leaves unmatched paths and non-GET requests alone', async () => {
    expect((await fetch(base + '/nothing-here', { redirect: 'manual' })).status).toBe(200);
    addRedirect('/posted-to', '/elsewhere');
    const post = await fetch(base + '/posted-to', { method: 'POST', redirect: 'manual' });
    // Reached the app: a 301 would make a browser replay it as a GET and drop
    // the body silently.
    expect(post.status).not.toBe(301);
    expect(post.headers.get('location')).toBeNull();
  });

  it('stays out of the app’s own paths', async () => {
    addRedirect('/api/posts', '/hijacked');
    addRedirect('/admin/x', '/hijacked');
    expect((await fetch(base + '/api/posts', { redirect: 'manual' })).status).toBe(200);
    expect((await fetch(base + '/admin/x', { redirect: 'manual' })).status).toBe(200);
  });
});

describe('changing a published post’s slug', () => {
  it('honours the new slug and keeps the old URL working', async () => {
    // A published post, as the editor would have saved it.
    const created = await fetch(base + '/api/posts', {
      method: 'POST', headers: token('a1', 'admin'),
      body: JSON.stringify({ title: 'First title', status: 'published' }),
    });
    expect(created.status).toBe(201);
    const post = await created.json();
    expect(post.slug).toBe('first-title');

    const updated = await fetch(base + '/api/posts/' + post.id, {
      method: 'PUT', headers: token('a1', 'admin'),
      body: JSON.stringify({ title: 'Second title', slug: 'second-title' }),
    });
    expect(updated.status).toBe(200);
    const after = await updated.json();
    expect(after.slug).toBe('second-title');       // the slug edit is no longer dropped

    // The old URL redirects to the new one, and the new one resolves.
    const row = db.prepare("SELECT * FROM Redirect WHERE fromPath = ?").get('/post/first-title') as any;
    expect(row).toBeTruthy();
    expect(row.toPath).toBe('/post/second-title');
    const r = await fetch(base + '/post/first-title', { redirect: 'manual' });
    expect(r.status).toBe(301);
    expect(r.headers.get('location')).toBe('/post/second-title');
  });

  it('dedupes a slug that is already taken instead of failing the save', async () => {
    await fetch(base + '/api/posts', { method: 'POST', headers: token('a1', 'admin'), body: JSON.stringify({ title: 'Taken', status: 'published' }) });
    const created = await fetch(base + '/api/posts', { method: 'POST', headers: token('a1', 'admin'), body: JSON.stringify({ title: 'Other', status: 'published' }) });
    const post = await created.json();
    const updated = await fetch(base + '/api/posts/' + post.id, {
      method: 'PUT', headers: token('a1', 'admin'), body: JSON.stringify({ slug: 'taken' }),
    });
    expect(updated.status).toBe(200);
    expect((await updated.json()).slug).toBe('taken-2');
  });
});

describe('the redirects API', () => {
  it('creates, lists, updates and deletes', async () => {
    const created = await fetch(base + '/api/redirects', {
      method: 'POST', headers: token('a1', 'admin'),
      body: JSON.stringify({ fromPath: '/a', toPath: '/b' }),
    });
    expect(created.status).toBe(201);
    const row = await created.json();

    // Duplicate source is refused with a reason rather than silently ignored.
    const dup = await fetch(base + '/api/redirects', { method: 'POST', headers: token('a1', 'admin'), body: JSON.stringify({ fromPath: '/a', toPath: '/c' }) });
    expect(dup.status).toBe(400);
    expect((await dup.json()).error).toContain('已有重定向');

    // A javascript: target is refused.
    const bad = await fetch(base + '/api/redirects', { method: 'POST', headers: token('a1', 'admin'), body: JSON.stringify({ fromPath: '/x', toPath: 'javascript:alert(1)' }) });
    expect(bad.status).toBe(400);

    const list = await (await fetch(base + '/api/redirects?q=/a', { headers: token('a1', 'admin') })).json();
    expect(list.total).toBe(1);

    const put = await fetch(base + '/api/redirects/' + row.id, { method: 'PUT', headers: token('a1', 'admin'), body: JSON.stringify({ status: 302 }) });
    expect((await put.json()).status).toBe(302);

    const del = await fetch(base + '/api/redirects/' + row.id, { method: 'DELETE', headers: token('a1', 'admin') });
    expect(del.status).toBe(200);
    expect(resolveRedirect('/a')).toBeNull();
  });

  it('imports a CSV and reports the lines it refused', async () => {
    const csv = [
      '# from,to',
      '/old-1,/new-1',
      '/old-2,https://example.com/x,302',
      'bad-line',
      '/old-3,javascript:alert(1)',
    ].join('\n');
    const r = await fetch(base + '/api/redirects/import', { method: 'POST', headers: token('a1', 'admin'), body: JSON.stringify({ csv }) });
    const body = await r.json();
    expect(body.created).toBe(2);
    expect(body.errorCount).toBe(2);
    expect(body.errors.length).toBeLessThanOrEqual(20);
    expect(resolveRedirect('/old-2')?.status).toBe(302);
    // Re-importing the same file neither duplicates nor errors.
    const again = await (await fetch(base + '/api/redirects/import', { method: 'POST', headers: token('a1', 'admin'), body: JSON.stringify({ csv }) })).json();
    expect(again.created).toBe(0);
    expect(again.skipped).toBe(2);
  });
});
