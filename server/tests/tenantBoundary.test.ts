import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import fs from 'fs';
import express from 'express';
import db, { initDB, cuid } from '../src/utils/db';
import { signToken } from '../src/utils/jwt';
import { setUserSites } from '../src/utils/userSites';
import postRoutes from '../src/routes/posts';
import pageRoutes from '../src/routes/pages';
import linkRoutes from '../src/routes/links';
import redirectRoutes from '../src/routes/redirects';

// The multi-site boundary on the admin API.
//
// A site-assigned editor must not reach another site's rows, and the built-in
// editor role holds the capabilities that gate these routes (`edit_posts`,
// `edit_others_posts`, `review_posts`, `edit_pages`, `manage_links`,
// `manage_options`) — so "the capability is checked" is not enough. Each case
// here is a route that checked *ownership or capability* and stopped there.
//
// These are the read/restore/lock paths rather than the obvious write paths: the
// bug they document is that a route can look guarded (`if (!canEditOthers && …)`)
// while the site dimension is simply absent.

const DB_FILE = process.env.MORTAR_DB_PATH || '/tmp/mortar-vitest-tenant.db';
let server: any;
let base = '';

const token = (id: string, role: string) => ({ Authorization: 'Bearer ' + signToken({ userId: id, role, v: 0 }), 'content-type': 'application/json' });

function addPost(id: string, siteId: string | null, type = 'post') {
  db.prepare("INSERT INTO Post (id, title, slug, content, excerpt, status, type, authorId, publishedAt, siteId) VALUES (?, ?, ?, '<p>body</p>', '', 'pending', ?, 'other', ?, ?)")
    .run(id, 'Title ' + id, id, type, new Date().toISOString(), siteId);
}

function addRevision(postId: string, title = 'Old title') {
  db.prepare('INSERT INTO Revision (id, postId, title, content, excerpt, createdAt) VALUES (?, ?, ?, ?, ?, ?)')
    .run(cuid(), postId, title, '<p>old</p>', '', new Date().toISOString());
}

beforeAll(async () => {
  initDB();
  db.prepare("INSERT OR IGNORE INTO Site (id, name, slug, domain, isPrimary, active) VALUES ('s1','One','one','one.test',1,1)").run();
  db.prepare("INSERT OR IGNORE INTO Site (id, name, slug, domain, isPrimary, active) VALUES ('s2','Two','two','two.test',0,1)").run();
  // An editor scoped to s1, and an admin (unrestricted) to prove the routes still work.
  db.prepare("INSERT OR REPLACE INTO User (id, username, email, password, role, tokenVersion) VALUES ('ed','ed','ed@test.dev','x','editor',0)").run();
  db.prepare("INSERT OR REPLACE INTO User (id, username, email, password, role, tokenVersion) VALUES ('other','other','other@test.dev','x','author',0)").run();
  setUserSites('ed', ['s1']);
  // A guard on the fixture: if the assignment did not take, every test below
  // would pass while proving nothing.
  expect((db.prepare("SELECT COUNT(*) c FROM UserSite WHERE userId = 'ed'").get() as any).c).toBe(1);

  const app = express();
  app.use(express.json());
  app.use('/api/posts', postRoutes);
  app.use('/api/pages', pageRoutes);
  app.use('/api/links', linkRoutes);
  app.use('/api/redirects', redirectRoutes);
  server = app.listen(0);
  await new Promise((r) => server.on('listening', r));
  base = 'http://127.0.0.1:' + server.address().port;
});

afterAll(() => {
  server?.close();
  for (const s of ['', '-wal', '-shm']) { try { fs.unlinkSync(DB_FILE + s); } catch {} }
});

beforeEach(() => {
  for (const table of ['Revision', 'Post', 'LinkPost', 'Link', 'LinkCategory', 'Redirect']) db.prepare('DELETE FROM ' + table).run();
});

describe('post revisions', () => {
  it('are neither listed nor restorable across sites', async () => {
    addPost('p1', 's1'); addPost('p2', 's2');
    addRevision('p1'); addRevision('p2', 'S2 secret title');

    // Own site: readable.
    expect((await fetch(base + '/api/posts/p1/revisions', { headers: token('ed', 'editor') })).status).toBe(200);

    const listed = await fetch(base + '/api/posts/p2/revisions', { headers: token('ed', 'editor') });
    expect(listed.status).toBe(403);

    const rev = db.prepare("SELECT id FROM Revision WHERE postId = 'p2'").get() as any;
    const restored = await fetch(base + '/api/posts/p2/revisions/' + rev.id + '/restore', { method: 'PUT', headers: token('ed', 'editor') });
    expect(restored.status).toBe(403);
    // The other site's post is untouched.
    expect((db.prepare("SELECT title FROM Post WHERE id = 'p2'").get() as any).title).toBe('Title p2');
  });
});

describe('translations', () => {
  it('are not listed for another site\'s post, and a translation cannot be created for it', async () => {
    addPost('p1', 's1');
    addPost('p2', 's2');
    db.prepare("UPDATE Post SET translationGroup = 'g2', status = 'published' WHERE id = 'p2'").run();

    expect((await fetch(base + '/api/posts/p2/translations', { headers: token('ed', 'editor') })).status).toBe(403);
    // POST /translate was already scoped; the list beside it was not.
    expect((await fetch(base + '/api/posts/p2/translate', { method: 'POST', headers: token('ed', 'editor'), body: JSON.stringify({ lang: 'en' }) })).status).toBe(403);
    // The caller's own post still works.
    expect((await fetch(base + '/api/posts/p1/translations', { headers: token('ed', 'editor') })).status).toBe(200);
  });
});

describe('reviewing a submission', () => {
  it('is refused for another site\'s queue even though reviewing others is the point', async () => {
    addPost('p1', 's1'); addPost('p2', 's2');
    const other = await fetch(base + '/api/posts/p2/review', { method: 'POST', headers: token('ed', 'editor'), body: JSON.stringify({ action: 'approve' }) });
    expect(other.status).toBe(403);
    expect((db.prepare("SELECT status FROM Post WHERE id = 'p2'").get() as any).status).toBe('pending');

    const own = await fetch(base + '/api/posts/p1/review', { method: 'POST', headers: token('ed', 'editor'), body: JSON.stringify({ action: 'approve' }) });
    expect(own.status).toBe(200);
    expect((db.prepare("SELECT status FROM Post WHERE id = 'p1'").get() as any).status).toBe('published');
  });
});

describe('locking', () => {
  it('cannot be used to block another site\'s author', async () => {
    addPost('p1', 's1'); addPost('p2', 's2');
    expect((await fetch(base + '/api/posts/p2/lock', { method: 'POST', headers: token('ed', 'editor') })).status).toBe(403);
    expect((await fetch(base + '/api/posts/p1/lock', { method: 'POST', headers: token('ed', 'editor') })).status).toBe(200);
    // Unlocking loads the row now, instead of clearing the lock for any id.
    db.prepare("UPDATE Post SET lockedAt = ?, lockedBy = 'other' WHERE id = 'p2'").run(new Date().toISOString());
    expect((await fetch(base + '/api/posts/p2/unlock', { method: 'POST', headers: token('ed', 'editor') })).status).toBe(404);
    expect((db.prepare("SELECT lockedBy FROM Post WHERE id = 'p2'").get() as any).lockedBy).toBe('other');
  });
});

describe('cloning', () => {
  it('copies the site and the language, and only what the caller can reach', async () => {
    db.prepare("INSERT INTO Post (id, title, slug, content, excerpt, status, type, authorId, siteId, lang) VALUES ('p1','Original','original','<p>x</p>','','published','post','ed','s1','en')").run();
    addPost('p2', 's2');

    const res = await fetch(base + '/api/posts/p1/clone', { method: 'POST', headers: token('ed', 'editor') });
    expect(res.status).toBe(201);
    const clone = await res.json();
    // Without this the copy landed as global content in the default language.
    expect(clone.siteId).toBe('s1');
    expect(clone.lang).toBe('en');
    expect(clone.status).toBe('draft');

    expect((await fetch(base + '/api/posts/p2/clone', { method: 'POST', headers: token('ed', 'editor') })).status).toBe(403);
  });
});

describe('page revisions', () => {
  it('are not readable for another site\'s page', async () => {
    addPost('pg1', 's1', 'page'); addPost('pg2', 's2', 'page');
    addRevision('pg1'); addRevision('pg2', 'S2 page history');
    expect((await fetch(base + '/api/pages/pg1/revisions', { headers: token('ed', 'editor') })).status).toBe(200);
    expect((await fetch(base + '/api/pages/pg2/revisions', { headers: token('ed', 'editor') })).status).toBe(404);
  });
});

describe('links', () => {
  it('drop post attachments the caller cannot reach, and say how many', async () => {
    addPost('p1', 's1'); addPost('p2', 's2');
    const res = await fetch(base + '/api/links', {
      method: 'POST', headers: token('ed', 'editor'),
      body: JSON.stringify({ name: 'Friends', url: 'https://example.com', postIds: ['p1', 'p2'] }),
    });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.skippedPosts).toBe(1);
    const attached = (db.prepare('SELECT postId FROM LinkPost').all() as any[]).map((r) => r.postId);
    expect(attached).toEqual(['p1']);
  });
});

describe('redirects', () => {
  it('are listed, created, retargeted and deleted only within the caller\'s sites', async () => {
    db.prepare("INSERT INTO Redirect (id, fromPath, toPath, status, siteId, hits, createdAt, createdBy) VALUES ('r1','/a','/b',301,'s1',0,?,'admin')").run(new Date().toISOString());
    db.prepare("INSERT INTO Redirect (id, fromPath, toPath, status, siteId, hits, createdAt, createdBy) VALUES ('r2','/c','/d',301,'s2',0,?,'admin')").run(new Date().toISOString());

    const list = await (await fetch(base + '/api/redirects', { headers: token('ed', 'editor') })).json();
    expect(list.redirects.map((r: any) => r.id)).toEqual(['r1']);

    // Creating one for a site the caller cannot reach.
    const created = await fetch(base + '/api/redirects', {
      method: 'POST', headers: token('ed', 'editor'),
      body: JSON.stringify({ fromPath: '/x', toPath: '/y', siteId: 's2' }),
    });
    expect(created.status).toBe(403);

    // Retargeting and deleting another site's row.
    expect((await fetch(base + '/api/redirects/r2', { method: 'PUT', headers: token('ed', 'editor'), body: JSON.stringify({ toPath: '/hijacked' }) })).status).toBe(404);
    expect((await fetch(base + '/api/redirects/r2', { method: 'DELETE', headers: token('ed', 'editor') })).status).toBe(404);
    expect((db.prepare("SELECT toPath FROM Redirect WHERE id = 'r2'").get() as any).toPath).toBe('/d');

    // Its own site is still fully usable.
    expect((await fetch(base + '/api/redirects/r1', { method: 'PUT', headers: token('ed', 'editor'), body: JSON.stringify({ toPath: '/moved' }) })).status).toBe(200);
  });

  it('does not put the driver\'s error text in the import report', async () => {
    // A row that cannot be written must not answer with SQL. The check is on the
    // shape of the reply: a line number, and no SQL keywords.
    const res = await fetch(base + '/api/redirects/import', {
      method: 'POST', headers: token('ed', 'editor'),
      body: JSON.stringify({ csv: '/from,/to\n/only-one-field' }),
    });
    const body = await res.json();
    expect(body.errors.join(' ')).not.toMatch(/SQL|sqlite|INSERT|SELECT|constraint/i);
  });
});
