import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'fs';
import express from 'express';
import db, { initDB } from '../src/utils/db';
import postsRouter from '../src/routes/posts';

// MORTAR_DB_PATH is set by vitest.config.ts, so db.ts opens a throwaway file.
const DB_FILE = process.env.MORTAR_DB_PATH || '/tmp/mortar-vitest.db';

let server: any;
let base = '';

beforeAll(async () => {
  initDB();
  db.prepare('INSERT INTO User (id, username, email, password, role) VALUES (?, ?, ?, ?, ?)')
    .run('u-admin', 'admin', 'admin@test.dev', 'x', 'admin');
  db.prepare('INSERT INTO User (id, username, email, password, role) VALUES (?, ?, ?, ?, ?)')
    .run('u-author', 'author', 'author@test.dev', 'x', 'author');
  // Mount the posts router with a stub identity (authenticate skips when req.user exists)
  const app = express();
  app.use(express.json());
  app.use('/api/posts', (req: any, _res: any, next: any) => { req.user = { userId: 'u-admin', role: 'admin' }; next(); }, postsRouter);
  server = app.listen(0);
  await new Promise(r => server.on('listening', r));
  base = 'http://127.0.0.1:' + server.address().port + '/api/posts';
});

afterAll(async () => {
  server?.close();
  try { fs.unlinkSync(DB_FILE); } catch {}
  try { fs.unlinkSync(DB_FILE + '-wal'); } catch {}
  try { fs.unlinkSync(DB_FILE + '-shm'); } catch {}
});

const post = (url: string, body: any) => fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
const put = (url: string, body: any) => fetch(url, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

describe('post publish date & author (WP-style editor fields)', () => {
  it('stores a custom publish date when creating a scheduled post', async () => {
    const r = await post(base, { title: 'Scheduled post', status: 'scheduled', publishedAt: '2030-01-01T00:00:00.000Z' });
    expect(r.status).toBe(201);
    expect((await r.json()).publishedAt).toBe('2030-01-01T00:00:00.000Z');
  });

  it('assigns the requested author when the caller is an admin', async () => {
    const r = await post(base, { title: 'By author', status: 'draft', authorId: 'u-author' });
    expect(r.status).toBe(201);
    expect((await r.json()).authorId).toBe('u-author');
  });

  it('publishing without a date stores the current time', async () => {
    const r = await post(base, { title: 'Published now', status: 'published' });
    expect(r.status).toBe(201);
    const p = await r.json();
    expect(p.publishedAt).toBeTruthy();
  });

  it('PUT applies an explicit publish date even when status also flips to published', async () => {
    const created = await (await post(base, { title: 'Draft then publish', status: 'draft' })).json();
    expect(created.publishedAt).toBeNull();
    const r = await put(base + '/' + created.id, { title: 'Draft then publish', status: 'published', publishedAt: '2020-05-05T05:05:05.000Z' });
    expect(r.status).toBe(200);
    const p = await r.json();
    expect(p.status).toBe('published');
    expect(p.publishedAt).toBe('2020-05-05T05:05:05.000Z');
  });

  it('PUT updates the author for admins', async () => {
    const created = await (await post(base, { title: 'Reassigned', status: 'draft' })).json();
    const r = await put(base + '/' + created.id, { title: 'Reassigned', status: 'draft', authorId: 'u-author' });
    expect(r.status).toBe(200);
    expect((await r.json()).authorId).toBe('u-author');
  });

  it('keeps the current author when no authorId is sent', async () => {
    const created = await (await post(base, { title: 'Mine', status: 'draft', authorId: 'u-author' })).json();
    const r = await put(base + '/' + created.id, { title: 'Mine edited', status: 'draft' });
    expect(r.status).toBe(200);
    expect((await r.json()).authorId).toBe('u-author');
  });
});
