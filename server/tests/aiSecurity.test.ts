import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'fs';
import express from 'express';
import db, { initDB } from '../src/utils/db';
import { signToken } from '../src/utils/jwt';
import { encryptSecretJson, decryptSecretJson, isEncryptedSecret } from '../src/utils/ai';
import { canUseTool, isRoleAllowed, executeTool } from '../src/utils/aiTools';
import aiRoutes from '../src/routes/ai';

const DB_FILE = process.env.MORTAR_DB_PATH || '/tmp/mortar-vitest-ai-security.db';
let server: any;
let base = '';

const setSetting = (key: string, value: string) =>
  db.prepare("INSERT INTO Setting (id, key, value) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").run(key, key, value);

beforeAll(async () => {
  initDB();
  db.prepare("INSERT OR REPLACE INTO User (id, username, email, password, role, tokenVersion) VALUES ('ad','ad','ad@example.dev','x','admin',0)").run();
  // Post.authorId is a FK, so the authoring users must exist.
  for (const [id, role] of [['au', 'author'], ['co', 'contributor'], ['ed', 'editor']] as const) {
    db.prepare("INSERT OR REPLACE INTO User (id, username, email, password, role, tokenVersion) VALUES (?, ?, ?, 'x', ?, 0)").run(id, id, id + '@example.dev', role);
  }
  const app = express();
  app.use(express.json());
  app.use('/api/ai', aiRoutes);
  server = app.listen(0);
  await new Promise((r) => server.on('listening', r));
  base = 'http://127.0.0.1:' + server.address().port + '/api/ai';
});

afterAll(() => {
  server?.close();
  for (const s of ['', '-wal', '-shm']) { try { fs.unlinkSync(DB_FILE + s); } catch {} }
});

const adminToken = signToken({ userId: 'ad', role: 'admin', v: 0 });
const asAdmin = { authorization: 'Bearer ' + adminToken, 'content-type': 'application/json' };

describe('AI secrets are encrypted at rest', () => {
  it('round-trips a JSON blob and hides the plaintext', () => {
    const secret = { ddAppSecret: 'super-secret-value', token: 'wh-token' };
    const enc = encryptSecretJson(secret);
    expect(isEncryptedSecret(enc)).toBe(true);
    expect(enc).not.toContain('super-secret-value');
    expect(decryptSecretJson(enc)).toEqual(secret);
  });

  it('returns null for tampered ciphertext instead of throwing', () => {
    const enc = encryptSecretJson({ a: 1 });
    const tampered = enc.slice(0, -4) + 'AAAA';
    expect(decryptSecretJson(tampered)).toBeNull();
  });

  it('stores bindings encrypted and serves them back intact', async () => {
    const r = await fetch(base + '/bindings', {
      method: 'POST', headers: asAdmin,
      body: JSON.stringify({ platform: 'dingtalk', userId: 'ad', label: 'ops', ddWebhook: 'https://oapi.dingtalk.com/robot/send?access_token=abc', ddSecret: 'shh-secret' }),
    });
    expect(r.status, JSON.stringify(await r.clone().json())).toBe(201);

    const stored = (db.prepare("SELECT value FROM Setting WHERE key = 'ai_bindings'").get() as any).value;
    expect(isEncryptedSecret(stored)).toBe(true);
    expect(stored).not.toContain('shh-secret');
    expect(stored).not.toContain('access_token=abc');

    const list = await (await fetch(base + '/bindings', { headers: asAdmin })).json();
    expect(list.bindings.some((b: any) => b.ddSecret === 'shh-secret')).toBe(true);
  });
});

describe('AI tool authorization is default-deny', () => {
  it('lets an admin use everything', () => {
    expect(canUseTool('admin', 'write_post')).toBe(true);
    expect(canUseTool('admin', 'update_site_settings')).toBe(true);
  });

  it('denies every tool to a role with no explicit grant', () => {
    for (const tool of ['write_post', 'list_posts', 'get_site_settings', 'generate_image']) {
      expect(canUseTool('editor', tool)).toBe(false);
    }
  });

  it('never lets a non-admin use an admin-only tool, even when granted', () => {
    setSetting('ai_tool_permissions', JSON.stringify({ editor: ['update_site_settings', 'apply_theme_style', 'write_post'] }));
    expect(canUseTool('editor', 'update_site_settings')).toBe(false);
    expect(canUseTool('editor', 'apply_theme_style')).toBe(false);
    expect(canUseTool('editor', 'write_post')).toBe(true);
  });

  it('admits admins and ai_use roles to the assistant itself', () => {
    expect(isRoleAllowed('admin')).toBe(true);
    expect(isRoleAllowed('author')).toBe(true); // seeded with ai_use
  });
});

describe('get_site_settings does not hand out credentials', () => {
  it('omits storage/smtp/ai credentials while keeping ordinary settings', async () => {
    setSetting('storage_secret', 'S3-SECRET-KEY');
    setSetting('storage_key', 'S3-ACCESS-KEY-ID');
    setSetting('smtp_pass', 'mail-password');
    setSetting('site_title', 'My Site');
    const out = await executeTool('get_site_settings', {}, { userId: 'ad', role: 'admin' }) as any;
    expect(out.site_title).toBe('My Site');
    expect(out.storage_secret).toBeUndefined();
    expect(out.storage_key).toBeUndefined();
    expect(out.smtp_pass).toBeUndefined();
    expect(JSON.stringify(out)).not.toContain('S3-SECRET-KEY');
  });
});

describe('AI writes respect capabilities and sites', () => {
  it('lets a role with publish_posts publish', async () => {
    setSetting('ai_tool_permissions', JSON.stringify({ author: ['write_post'] }));
    const out = await executeTool('write_post', { title: 'Author Post', status: 'published' }, { userId: 'au', role: 'author' }) as any;
    expect(out.status).toBe('published');
  });

  it('downgrades a contributor to draft instead of publishing', async () => {
    // contributor has edit_posts/delete_posts but no publish_posts
    setSetting('ai_tool_permissions', JSON.stringify({ contributor: ['write_post'] }));
    const out = await executeTool('write_post', { title: 'Contrib Post', status: 'published' }, { userId: 'co', role: 'contributor' }) as any;
    expect(out.status).toBe('draft');
    expect(out.note).toMatch(/发布权限/);
    expect(out.message).toMatch(/草稿/);
    const row = db.prepare("SELECT status FROM Post WHERE id = ?").get(out.id) as any;
    expect(row.status).toBe('draft');
  });

  it('stamps the requesting site on created posts', async () => {
    setSetting('ai_tool_permissions', JSON.stringify({ author: ['write_post'] }));
    const out = await executeTool('write_post', { title: 'Site A Post' }, { userId: 'au', role: 'author', siteId: 'site-a' }) as any;
    expect((db.prepare('SELECT siteId FROM Post WHERE id = ?').get(out.id) as any).siteId).toBe('site-a');
  });

  it('scopes list and search to the requesting site', async () => {
    db.prepare("INSERT INTO Post (id, title, slug, content, status, type, authorId, siteId) VALUES ('p-a','Alpha A','alpha-a','alpha body','published','post','au','site-a')").run();
    db.prepare("INSERT INTO Post (id, title, slug, content, status, type, authorId, siteId) VALUES ('p-b','Alpha B','alpha-b','alpha body','published','post','au','site-b')").run();
    db.prepare("INSERT INTO Post (id, title, slug, content, status, type, authorId, siteId) VALUES ('p-t','Alpha Trash','alpha-trash','alpha body','trash','post','au','site-a')").run();
    setSetting('ai_tool_permissions', JSON.stringify({ editor: ['list_posts', 'search_site_content'] }));
    const ctx = { userId: 'ed', role: 'editor', siteId: 'site-a' };

    const listed = await executeTool('list_posts', { search: 'Alpha' }, ctx) as any[];
    expect(listed.map((p) => p.id)).toContain('p-a');
    expect(listed.map((p) => p.id)).not.toContain('p-b');

    const found = await executeTool('search_site_content', { query: 'alpha' }, ctx) as any[];
    const titles = found.map((r) => r.title);
    expect(titles).toContain('Alpha A');
    expect(titles).not.toContain('Alpha B');
    expect(titles).not.toContain('Alpha Trash');
  });
});

describe('dingtalk webhook cannot be pointed at the internal network', () => {
  it('refuses a loopback webhook instead of POSTing to it', async () => {
    const create = await fetch(base + '/bindings', {
      method: 'POST', headers: asAdmin,
      body: JSON.stringify({ platform: 'dingtalk', userId: 'ad', ddWebhook: 'http://127.0.0.1:9/internal' }),
    });
    const id = (await create.json()).binding?.id;
    expect(id).toBeTruthy();
    const r = await fetch(base + '/bindings/' + id + '/test-group', { method: 'POST', headers: asAdmin, body: JSON.stringify({ message: 'hi' }) });
    const body = await r.json();
    expect(body.success).toBe(false);
    expect(String(body.error)).toMatch(/Webhook/);
  });
});
