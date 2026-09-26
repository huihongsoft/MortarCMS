import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import fs from 'fs';
import os from 'os';
import path from 'path';
import express from 'express';
import sharp from 'sharp';
import db, { initDB, cuid } from '../src/utils/db';
import { signToken } from '../src/utils/jwt';
import { UPLOADS_DIR } from '../src/utils/paths';
import mediaRoutes from '../src/routes/media';
import { setUserSites, getUserSiteIds } from '../src/utils/userSites';

// The library was a flat list: an image was findable by filename search and
// nothing else. Folders, a "not filed yet" view, bulk move, and the image's own
// metadata (read from the file on first open rather than backfilled at upgrade).
const DB_FILE = process.env.MORTAR_DB_PATH || '/tmp/mortar-vitest-folders.db';
let server: any;
let base = '';

const token = (id: string, role: string) => ({ Authorization: 'Bearer ' + signToken({ userId: id, role, v: 0 }), 'content-type': 'application/json' });

function addMedia(id: string, opts: { mime?: string; url?: string; folderId?: string | null } = {}) {
  db.prepare('INSERT INTO Media (id, filename, original, mimeType, size, url, alt, title, folderId, createdAt) VALUES (?, ?, ?, ?, 10, ?, \'\', \'\', ?, ?)')
    .run(id, id + '.png', id + '.png', opts.mime || 'image/png', opts.url || '/uploads/' + id + '.png', opts.folderId ?? null, new Date().toISOString());
}

beforeAll(async () => {
  initDB();
  db.prepare("INSERT INTO User (id, username, email, password, role, tokenVersion) VALUES ('u1','u1','u1@test.dev','x','admin',0)").run();
  const app = express();
  app.use(express.json());
  app.use('/api/media', mediaRoutes);
  server = app.listen(0);
  await new Promise((r) => server.on('listening', r));
  base = 'http://127.0.0.1:' + server.address().port;
});

afterAll(() => {
  server?.close();
  for (const s of ['', '-wal', '-shm']) { try { fs.unlinkSync(DB_FILE + s); } catch {} }
});

beforeEach(() => {
  db.prepare('DELETE FROM Media').run();
  db.prepare('DELETE FROM MediaFolder').run();
});

describe('folders', () => {
  it('creates, lists with counts, renames and deletes', async () => {
    const created = await fetch(base + '/api/media/folders', { method: 'POST', headers: token('u1', 'admin'), body: JSON.stringify({ name: 'Products' }) });
    expect(created.status).toBe(201);
    const folder = await created.json();

    addMedia('m1', { folderId: folder.id });
    addMedia('m2');
    const list = await (await fetch(base + '/api/media/folders', { headers: token('u1', 'admin') })).json();
    expect(list.folders[0]).toMatchObject({ name: 'Products', count: 1 });
    // The unfiled count is what the "unfiled" tab shows.
    expect(list.unfiled).toBe(1);

    const renamed = await (await fetch(base + '/api/media/folders/' + folder.id, { method: 'PUT', headers: token('u1', 'admin'), body: JSON.stringify({ name: 'Shop' }) })).json();
    expect(renamed.name).toBe('Shop');

    // A folder is only deletable once it is empty (see the next test).
    await fetch(base + '/api/media/bulk-move', { method: 'POST', headers: token('u1', 'admin'), body: JSON.stringify({ ids: ['m1'], folderId: null }) });
    const del = await fetch(base + '/api/media/folders/' + folder.id, { method: 'DELETE', headers: token('u1', 'admin') });
    expect(del.status).toBe(200);
  });

  it('refuses to delete a folder that still holds files', async () => {
    const folder = await (await fetch(base + '/api/media/folders', { method: 'POST', headers: token('u1', 'admin'), body: JSON.stringify({ name: 'Busy' }) })).json();
    addMedia('m1', { folderId: folder.id });
    const del = await fetch(base + '/api/media/folders/' + folder.id, { method: 'DELETE', headers: token('u1', 'admin') });
    expect(del.status).toBe(400);
    expect((await del.json()).error).toContain('1');
    // The file is untouched — a delete that quietly discarded images would be the
    // worst possible behaviour here.
    expect((db.prepare('SELECT folderId FROM Media WHERE id = ?').get('m1') as any).folderId).toBe(folder.id);
  });

  it('requires a name', async () => {
    const r = await fetch(base + '/api/media/folders', { method: 'POST', headers: token('u1', 'admin'), body: JSON.stringify({ name: '   ' }) });
    expect(r.status).toBe(400);
  });
});

describe('filtering by folder', () => {
  it('narrows to a folder, or to the unfiled files', async () => {
    const folder = await (await fetch(base + '/api/media/folders', { method: 'POST', headers: token('u1', 'admin'), body: JSON.stringify({ name: 'F' }) })).json();
    addMedia('in1', { folderId: folder.id });
    addMedia('out1');
    addMedia('out2');

    const all = await (await fetch(base + '/api/media', { headers: token('u1', 'admin') })).json();
    expect(all.total).toBe(3);
    const inFolder = await (await fetch(base + '/api/media?folderId=' + folder.id, { headers: token('u1', 'admin') })).json();
    expect(inFolder.media.map((m: any) => m.id)).toEqual(['in1']);
    const unfiled = await (await fetch(base + '/api/media?folderId=none', { headers: token('u1', 'admin') })).json();
    expect(unfiled.media.map((m: any) => m.id).sort()).toEqual(['out1', 'out2']);
  });
});

describe('bulk move', () => {
  it('moves a selection in, and out again with a null folder', async () => {
    const folder = await (await fetch(base + '/api/media/folders', { method: 'POST', headers: token('u1', 'admin'), body: JSON.stringify({ name: 'F' }) })).json();
    addMedia('m1'); addMedia('m2');

    const moved = await (await fetch(base + '/api/media/bulk-move', { method: 'POST', headers: token('u1', 'admin'), body: JSON.stringify({ ids: ['m1', 'm2'], folderId: folder.id }) })).json();
    expect(moved.moved).toBe(2);
    expect((db.prepare('SELECT COUNT(*) c FROM Media WHERE folderId = ?').get(folder.id) as any).c).toBe(2);

    const back = await (await fetch(base + '/api/media/bulk-move', { method: 'POST', headers: token('u1', 'admin'), body: JSON.stringify({ ids: ['m1'], folderId: null }) })).json();
    expect(back.moved).toBe(1);
    expect((db.prepare('SELECT folderId FROM Media WHERE id = ?').get('m1') as any).folderId).toBeNull();
  });

  it('refuses an unknown folder and an empty selection', async () => {
    addMedia('m1');
    expect((await fetch(base + '/api/media/bulk-move', { method: 'POST', headers: token('u1', 'admin'), body: JSON.stringify({ ids: ['m1'], folderId: 'nope' }) })).status).toBe(404);
    expect((await fetch(base + '/api/media/bulk-move', { method: 'POST', headers: token('u1', 'admin'), body: JSON.stringify({ ids: [] }) })).status).toBe(400);
  });
});

describe('image metadata', () => {
  it('is read from the file on first open and cached', async () => {
    // A real image on disk, because the metadata comes from the file itself.
    const file = 'meta-' + cuid() + '.png';
    await sharp({ create: { width: 40, height: 25, channels: 3, background: '#3366ff' } }).png().toFile(path.join(UPLOADS_DIR, file));
    addMedia('meta1', { url: '/uploads/' + file });
    try {
      const detail = await (await fetch(base + '/api/media/meta1', { headers: token('u1', 'admin') })).json();
      expect(detail.meta).toMatchObject({ format: 'png', width: 40, height: 25 });
      // Cached, so the second read does not touch the file again.
      expect((db.prepare('SELECT meta FROM Media WHERE id = ?').get('meta1') as any).meta).toContain('png');
    } finally {
      try { fs.unlinkSync(path.join(UPLOADS_DIR, file)); } catch { /* best effort */ }
    }
  });

  it('does not fail the detail view when the file is missing', async () => {
    addMedia('gone', { url: '/uploads/does-not-exist-' + cuid() + '.png' });
    const r = await fetch(base + '/api/media/gone', { headers: token('u1', 'admin') });
    expect(r.status).toBe(200);
    expect((await r.json()).meta).toBeNull();
  });
});

describe('folders respect the site boundary', () => {
  // A folder carries a siteId, so renaming, deleting, nesting under, or filing
  // into one is a write to a row that belongs to a site. The media rows were
  // already scoped (mayEditMedia); the folder they were filed under was not, so
  // an editor assigned to one site could rename or delete another site's folders
  // and file their own uploads into them.
  beforeAll(() => {
    // The Site rows have to exist first: setUserSites only records an assignment
    // for a site that is really there, so without them the user stays
    // unrestricted and every check below would pass for the wrong reason.
    db.prepare("INSERT OR IGNORE INTO Site (id, name, slug, domain, isPrimary, active) VALUES ('s1','One','one','one.test',1,1)").run();
    db.prepare("INSERT OR IGNORE INTO Site (id, name, slug, domain, isPrimary, active) VALUES ('s2','Two','two','two.test',0,1)").run();
    db.prepare("INSERT OR REPLACE INTO User (id, username, email, password, role, tokenVersion) VALUES ('ed','ed','ed@test.dev','x','editor',0)").run();
    setUserSites('ed', ['s1']);
    // A guard on the fixture itself: if the assignment did not take, the tests
    // below would pass while proving nothing.
    expect(getUserSiteIds('ed')).toEqual(['s1']);
  });

  function addFolder(id: string, siteId: string | null) {
    db.prepare('INSERT INTO MediaFolder (id, name, parentId, siteId, createdAt) VALUES (?, ?, NULL, ?, ?)')
      .run(id, id, siteId, new Date().toISOString());
  }

  beforeEach(() => {
    db.prepare('DELETE FROM MediaFolder').run();
  });

  it('refuses to rename another site\'s folder, and says nothing about it', async () => {
    addFolder('fOther', 's2');
    const r = await fetch(base + '/api/media/folders/fOther', { method: 'PUT', headers: token('ed', 'editor'), body: JSON.stringify({ name: 'hijacked' }) });
    // 404 rather than 403: whether another site has folders is not this user's
    // business to learn.
    expect(r.status).toBe(404);
    expect((db.prepare("SELECT name FROM MediaFolder WHERE id = 'fOther'").get() as any).name).toBe('fOther');
  });

  it('refuses to delete another site\'s folder', async () => {
    addFolder('fOther', 's2');
    const r = await fetch(base + '/api/media/folders/fOther', { method: 'DELETE', headers: token('ed', 'editor') });
    expect(r.status).toBe(404);
    expect(db.prepare("SELECT id FROM MediaFolder WHERE id = 'fOther'").get()).toBeTruthy();
  });

  it('refuses to nest a folder under another site\'s folder', async () => {
    addFolder('fOther', 's2');
    const r = await fetch(base + '/api/media/folders', {
      method: 'POST', headers: token('ed', 'editor'),
      body: JSON.stringify({ name: 'mine', parentId: 'fOther', siteId: 's1' }),
    });
    expect(r.status).toBe(403);
    expect(db.prepare("SELECT COUNT(*) c FROM MediaFolder WHERE name = 'mine'").get()).toEqual({ c: 0 });
  });

  it('refuses to file uploads into another site\'s folder', async () => {
    addFolder('fOther', 's2');
    addMedia('m1', {});
    const r = await fetch(base + '/api/media/bulk-move', { method: 'POST', headers: token('ed', 'editor'), body: JSON.stringify({ ids: ['m1'], folderId: 'fOther' }) });
    expect(r.status).toBe(404);
    expect((db.prepare("SELECT folderId FROM Media WHERE id = 'm1'").get() as any).folderId).toBeNull();
  });

  it('still allows the folders this user does own, and the site-less ones', async () => {
    // A folder with no site is shared, exactly like site-less posts — refusing
    // those would break every single-site install.
    addFolder('fMine', 's1');
    addFolder('fShared', null);
    const rename = await fetch(base + '/api/media/folders/fMine', { method: 'PUT', headers: token('ed', 'editor'), body: JSON.stringify({ name: 'renamed' }) });
    expect(rename.status).toBe(200);
    const shared = await fetch(base + '/api/media/folders/fShared', { method: 'PUT', headers: token('ed', 'editor'), body: JSON.stringify({ name: 'also-renamed' }) });
    expect(shared.status).toBe(200);
    addMedia('m2', {});
    const moved = await fetch(base + '/api/media/bulk-move', { method: 'POST', headers: token('ed', 'editor'), body: JSON.stringify({ ids: ['m2'], folderId: 'fMine' }) });
    expect(moved.status).toBe(200);
    expect((db.prepare("SELECT folderId FROM Media WHERE id = 'm2'").get() as any).folderId).toBe('fMine');
  });
});
