import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'fs';
import express from 'express';
import db, { initDB } from '../src/utils/db';
import { signToken } from '../src/utils/jwt';
import { encryptSecretJson, decryptSecretJson, isEncryptedSecret, saveProviders, providerError, userFacingAiError } from '../src/utils/ai';
import { canUseTool, isRoleAllowed, executeTool, executeToolUnattended, friendlyTaskError, downloadProviderImage } from '../src/utils/aiTools';
import { riskyReason, describeCall, signApproval, verifyApproval, claimApproval, MAX_APPROVAL_CALLS } from '../src/utils/aiApproval';
import { userMayAccessSite, getUserSiteIds, setUserSites } from '../src/utils/userSites';
import { loadSecret } from '../src/utils/jwt';
import crypto from 'crypto';
import aiRoutes, { resetUsageCache } from '../src/routes/ai';
import { registerBuiltinTasks, runTaskNow } from '../src/utils/scheduler';

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

// Depends on the p-a / p-b / p-t fixtures the suite above inserts.
describe('single-post tools stay inside the requesting site', () => {
  const ctxA = { userId: 'ed', role: 'editor', siteId: 'site-a' };

  beforeAll(() => {
    setSetting('ai_tool_permissions', JSON.stringify({ editor: ['get_post', 'update_post', 'translate_post', 'complete_post'] }));
  });

  it('refuses to read another site\'s post by id or by slug', async () => {
    const byId = await executeTool('get_post', { id: 'p-b' }, ctxA) as any;
    expect(byId.error).toMatch(/未找到/);
    const bySlug = await executeTool('get_post', { slug: 'alpha-b' }, ctxA) as any;
    expect(bySlug.error).toMatch(/未找到/);
  });

  it('refuses to rewrite or translate another site\'s post', async () => {
    const upd = await executeTool('update_post', { id: 'p-b', title: 'Hijacked' }, ctxA) as any;
    expect(upd.error).toMatch(/未找到/);
    expect((db.prepare('SELECT title FROM Post WHERE id = ?').get('p-b') as any).title).toBe('Alpha B');

    const tr = await executeTool('translate_post', { id: 'p-b' }, ctxA) as any;
    expect(tr.error).toMatch(/未找到/);
  });

  it('still reaches a post inside the requesting site', async () => {
    const read = await executeTool('get_post', { id: 'p-a' }, ctxA) as any;
    expect(read.title).toBe('Alpha A');
  });
});

describe('AI edits stay recoverable', () => {
  const ctxA = { userId: 'ed', role: 'editor', siteId: 'site-a' };
  const revisions = () => (db.prepare('SELECT COUNT(*) as c FROM Revision WHERE postId = ?').get('p-a') as any).c;

  beforeAll(() => {
    setSetting('ai_tool_permissions', JSON.stringify({ editor: ['update_post'] }));
  });

  it('snapshots the pre-edit state before overwriting a post', async () => {
    const before = revisions();
    const out = await executeTool('update_post', { id: 'p-a', title: 'Alpha A v2' }, ctxA) as any;
    expect(out.error).toBeUndefined();
    expect(revisions()).toBe(before + 1);
    const latest = db.prepare('SELECT title FROM Revision WHERE postId = ? ORDER BY createdAt DESC').get('p-a') as any;
    expect(latest.title).toBe('Alpha A'); // the state the AI replaced
  });

  it('takes no snapshot when a revision-covered field did not change', async () => {
    const before = revisions();
    await executeTool('update_post', { id: 'p-a', title: 'Alpha A v2' }, ctxA);
    expect(revisions()).toBe(before);
  });
});

// The scheduler flips 'scheduled' → 'published' once publishedAt passes, so a
// scheduled post must never be stored as published early — and scheduling is a
// publish, so it needs the same capability.
describe('AI scheduling stays inside the publish rules', () => {
  const future = new Date(Date.now() + 86400000).toISOString();
  const asAuthor = { userId: 'au', role: 'author' };
  const asContributor = { userId: 'co', role: 'contributor' };

  beforeAll(() => {
    setSetting('ai_tool_permissions', JSON.stringify({ author: ['write_post', 'update_post'], contributor: ['write_post', 'update_post'] }));
  });

  it('schedules a post for a future date instead of publishing it', async () => {
    const out = await executeTool('write_post', { title: 'Scheduled Piece', status: 'scheduled', publishedAt: future }, asAuthor) as any;
    expect(out.status).toBe('scheduled');
    const row = db.prepare('SELECT status, publishedAt FROM Post WHERE id = ?').get(out.id) as any;
    expect(row.status).toBe('scheduled');
    expect(row.publishedAt).toBe(future);
  });

  it('drafts the post when the schedule date is missing or already past', async () => {
    const missing = await executeTool('write_post', { title: 'No Date', status: 'scheduled' }, asAuthor) as any;
    expect(missing.status).toBe('draft');
    expect(missing.note).toMatch(/publishedAt/);

    const past = await executeTool('write_post', { title: 'Past Date', status: 'scheduled', publishedAt: '2020-01-01T00:00:00Z' }, asAuthor) as any;
    expect(past.status).toBe('draft');
    expect((db.prepare('SELECT status FROM Post WHERE id = ?').get(past.id) as any).status).toBe('draft');
  });

  it('clears a future date when the post is published now', async () => {
    const created = await executeTool('write_post', { title: 'Flip Me', status: 'scheduled', publishedAt: future }, asAuthor) as any;
    const out = await executeTool('update_post', { id: created.id, status: 'published' }, asAuthor) as any;
    expect(out.note).toBeUndefined();
    const row = db.prepare('SELECT status, publishedAt FROM Post WHERE id = ?').get(created.id) as any;
    expect(row.status).toBe('published');
    // published with a future date would be invisible to the public lists yet
    // still reachable by slug — routes/posts.ts resets it, and so must the tool
    expect(row.publishedAt <= new Date().toISOString()).toBe(true);
  });

  it('keeps a contributor on drafts and out of the trash', async () => {
    const scheduled = await executeTool('write_post', { title: 'Co Scheduled', status: 'scheduled', publishedAt: future }, asContributor) as any;
    expect(scheduled.status).toBe('draft');
    expect(scheduled.note).toMatch(/权限/);

    const own = await executeTool('write_post', { title: 'Co Own' }, asContributor) as any;
    const trashed = await executeTool('update_post', { id: own.id, status: 'trash' }, asContributor) as any;
    // a contributor is held to drafts outright (routes/posts.ts blocks any
    // other status), so they never even reach the trash rule
    expect(trashed.error).toMatch(/草稿/);
    expect((db.prepare('SELECT status FROM Post WHERE id = ?').get(own.id) as any).status).toBe('draft');
  });

  it('hands the scheduler a row it can actually publish', async () => {
    registerBuiltinTasks();
    const out = await executeTool('write_post', { title: 'Fires Later', status: 'scheduled', publishedAt: future }, asAuthor) as any;
    // Let time pass the way it would, then run the task the server runs every
    // minute. This pins the exact shape the scheduler matches on: status
    // 'scheduled' plus a UTC ISO date it can compare as a string.
    db.prepare('UPDATE Post SET publishedAt = ? WHERE id = ?').run('2020-01-01T00:00:00.000Z', out.id);
    const run = await runTaskNow('publish_scheduled');
    expect(run.ok, run.error).toBe(true);
    expect((db.prepare('SELECT status FROM Post WHERE id = ?').get(out.id) as any).status).toBe('published');
  });

  it('accepts an epoch timestamp as a schedule date', async () => {
    const at = Date.now() + 86400000;
    const out = await executeTool('write_post', { title: 'Epoch Scheduled', status: 'scheduled', publishedAt: at }, asAuthor) as any;
    expect(out.status).toBe('scheduled');
    // stored in the same UTC ISO shape the scheduler compares against
    expect((db.prepare('SELECT publishedAt FROM Post WHERE id = ?').get(out.id) as any).publishedAt).toBe(new Date(at).toISOString());
  });

  it('refuses an absurd schedule date instead of crashing or publishing early', async () => {
    // 1e16 ms is past the Date range: toISOString() would throw and lose the
    // whole write_post call. A year past 9999 formats as "+033658-…", and '+'
    // sorts below digits — the scheduler's string compare would read it as due.
    for (const bad of [1e16, '9999999999', Date.now() - 86400000, 0, -1, 'not-a-date', {}]) {
      const out = await executeTool('write_post', { title: 'Bad Date ' + String(bad), status: 'scheduled', publishedAt: bad }, asAuthor) as any;
      expect(out.status, JSON.stringify(bad)).toBe('draft');
      expect(out.note).toMatch(/publishedAt/);
    }
    const stored = db.prepare("SELECT COUNT(*) as c FROM Post WHERE status = 'scheduled' AND publishedAt > ?").get(new Date(Date.now() + 50 * 365 * 86400000).toISOString()) as any;
    expect(stored.c).toBe(0);
  });

  it('ignores null fields instead of blanking the post', async () => {
    const created = await executeTool('write_post', { title: 'Null Guard', content: '<p>keep me</p>', excerpt: 'keep' }, asAuthor) as any;
    const out = await executeTool('update_post', { id: created.id, title: null, content: null, excerpt: null }, asAuthor) as any;
    const row = db.prepare('SELECT title, content, excerpt FROM Post WHERE id = ?').get(created.id) as any;
    // content:null used to wipe the body, excerpt:null used to store the literal
    // "null" (String(null)) — a model omitting a field must not destroy content
    expect(row.content).toContain('keep me');
    expect(row.excerpt).toBe('keep');
    expect(row.title).toBe('Null Guard');
    // and nothing was written at all (no UPDATE, so no revision either)
    expect(out.message).toBe('没有需要更新的字段');
    expect((db.prepare('SELECT COUNT(*) as c FROM Revision WHERE postId = ?').get(created.id) as any).c).toBe(0);
  });

  it('blocks a trash status change for a role the delete route would reject', async () => {
    setSetting('ai_tool_permissions', JSON.stringify({ subscriber: ['update_post'] }));
    // the caller owns the post, so ownership passes and the role gate decides
    db.prepare("INSERT INTO Post (id, title, slug, content, status, type, authorId) VALUES ('p-sub','Sub Own','sub-own','x','draft','post','co')").run();
    const out = await executeTool('update_post', { id: 'p-sub', status: 'trash' }, { userId: 'co', role: 'subscriber' }) as any;
    expect(out.error).toMatch(/删除权限/);
    expect((db.prepare('SELECT status FROM Post WHERE id = ?').get('p-sub') as any).status).toBe('draft');
  });
});

// Analytics is read-only, but it feeds numbers straight into prose the user
// will trust — so it has to read the stored counters, stay inside the caller's
// site and posts, and admit what the schema cannot answer.
describe('content analytics reports stored numbers, not estimates', () => {
  beforeAll(() => {
    setSetting('ai_tool_permissions', JSON.stringify({ editor: ['get_post_analytics'], author: ['get_post_analytics'] }));
    const now = new Date().toISOString();
    db.prepare("INSERT INTO Comment (id, content, author, status, postId, createdAt) VALUES ('c-ok','nice','x','approved','p-a',?)").run(now);
    db.prepare("INSERT INTO Comment (id, content, author, status, postId, createdAt) VALUES ('c-spam','buy now','y','pending','p-a',?)").run(now);
    db.prepare('UPDATE Post SET views = 120 WHERE id = ?').run('p-a');
    db.prepare('UPDATE Post SET views = 999 WHERE id = ?').run('p-b'); // another site
  });

  it('reads the real counters and ranking', async () => {
    const out = await executeTool('get_post_analytics', {}, { userId: 'ad', role: 'admin', siteId: 'site-a' }) as any;
    expect(out.totals.totalViews).toBe(120);                 // p-b's 999 is site-b
    expect(out.topByViews[0]).toMatchObject({ url: '/post/alpha-a', views: 120 });
    expect(out.totals.comments).toEqual({ approved: 1, pending: 1 });
    expect(out.mostCommented[0]).toMatchObject({ url: '/post/alpha-a', comments: 1 });
    expect(out.zeroViews.count).toBeGreaterThan(0);
  });

  it('says traffic trends are unavailable instead of inventing a curve', async () => {
    const out = await executeTool('get_post_analytics', {}, { userId: 'ad', role: 'admin', siteId: 'site-a' }) as any;
    // views is one cumulative counter per post — there is no per-day log
    expect(out.unavailable).toMatch(/趋势/);
    expect(Object.keys(out)).not.toContain('viewsTrend');
    // publishing cadence, by contrast, is real data from publishedAt
    expect(Array.isArray(out.monthlyPublishing)).toBe(true);
  });

  it('scopes analytics to the site and to the caller\'s own posts', async () => {
    const urls = (out: any) => out.topByViews.map((p: any) => p.url);

    // nothing is authored by 'co', so an author-scoped view is empty
    const other = await executeTool('get_post_analytics', {}, { userId: 'co', role: 'author' }) as any;
    expect(other.totals.totalViews).toBe(0);
    expect(other.topByViews).toHaveLength(0);

    // 'au' owns both fixtures, and this context pins no site
    const own = await executeTool('get_post_analytics', {}, { userId: 'au', role: 'author' }) as any;
    expect(urls(own)).toEqual(expect.arrayContaining(['/post/alpha-a', '/post/alpha-b']));

    // site + ownership together: alpha-b belongs to the other site
    const scoped = await executeTool('get_post_analytics', {}, { userId: 'au', role: 'author', siteId: 'site-a' }) as any;
    expect(urls(scoped)).toContain('/post/alpha-a');
    expect(urls(scoped)).not.toContain('/post/alpha-b');
  });
});

describe('high-risk calls wait for a human', () => {
  it('flags what the call does, not which tool it is', () => {
    // without a target to look up, a body edit is treated as live (ask, don't assume)
    expect(riskyReason('update_post', { id: 'x', title: 't' })).toMatch(/正文/);
    expect(riskyReason('write_post', { title: 't' })).toBeNull();                  // new draft
    expect(riskyReason('write_post', { title: 't', status: 'published' })).toMatch(/发布/);
    expect(riskyReason('update_post', { id: 'x', status: 'trash' })).toMatch(/删除/);
    expect(riskyReason('update_post', { id: 'x', status: 'scheduled' })).toMatch(/定时/);
    expect(riskyReason('apply_theme_style', { primary_color: '#fff' })).toMatch(/主题/);
    expect(riskyReason('update_site_settings', { settings: { site_title: 'x' } })).toMatch(/配置/);
    expect(riskyReason('search_site_content', { query: 'x' })).toBeNull();
    // a metadata-only toggle on a live post is not a body change
    expect(riskyReason('update_post', { id: 'x', featured: '/uploads/a.png' })).toBeNull();
  });

  it('flags rewriting a live post, but leaves a draft edit alone', () => {
    db.prepare("INSERT INTO Post (id, title, slug, content, status, type, authorId) VALUES ('p-live','Live','p-live','<p>x</p>','published','post','au')").run();
    db.prepare("INSERT INTO Post (id, title, slug, content, status, type, authorId) VALUES ('p-draft','Draft','p-draft','<p>x</p>','draft','post','au')").run();
    // changing what visitors can read right now is a public act
    expect(riskyReason('update_post', { id: 'p-live', content: '<p>new</p>' })).toMatch(/正文/);
    expect(riskyReason('complete_post', { id: 'p-live' })).toMatch(/正文/);
    // a draft is private and rolls back through the revision snapshot
    expect(riskyReason('update_post', { id: 'p-draft', content: '<p>new</p>' })).toBeNull();
    expect(riskyReason('complete_post', { id: 'p-draft' })).toBeNull();
  });

  it('describes a call so the confirmation card can name it', () => {
    // These exact shapes are what the admin translates (see serverMsgPatterns in
    // admin/src/lib/i18n.ts) — changing them here means updating that map.
    db.prepare("INSERT INTO Post (id, title, slug, content, status, type, authorId, siteId) VALUES ('p-desc','待删稿','p-desc','x','published','post','au','site-a')").run();
    expect(describeCall('update_post', { id: 'p-desc', status: 'trash' }, 'site-a')).toBe('删除文章（移入回收站）《待删稿》');
    expect(describeCall('write_post', { title: '新稿子', status: 'published' })).toBe('发布文章（对访客立即可见）《新稿子》');
    expect(describeCall('apply_theme_style', { primary_color: '#fff' })).toBe('修改全站主题样式（会覆盖现有自定义 CSS）');
    expect(describeCall('update_site_settings', { settings: { site_title: 'x' } })).toBe('修改站点配置：site_title');
  });

  it('lets a plan be executed only once', () => {
    const token = signApproval('ad', [{ name: 'write_post', args: { title: 'once' } }]);
    expect(claimApproval(token)).toBe(true);
    expect(claimApproval(token)).toBe(false);          // replay of the same plan
    const other = signApproval('ad', [{ name: 'write_post', args: { title: 'twice' } }]);
    expect(claimApproval(other)).toBe(true);           // a different plan is unaffected
  });

  it('refuses a replayed approval over HTTP instead of doing the work twice', async () => {
    db.prepare("INSERT OR REPLACE INTO User (id, username, email, password, role, tokenVersion) VALUES ('au2','au2','au2@example.dev','x','author',0)").run();
    setSetting('ai_tool_permissions', JSON.stringify({ author: ['write_post'] }));
    const token = signApproval('au2', [{ name: 'write_post', args: { title: 'Once Only', status: 'published' } }]);
    const asAu2 = { authorization: 'Bearer ' + signToken({ userId: 'au2', role: 'author', v: 0 }), 'content-type': 'application/json' };

    const first = await fetch(base + '/assistant/approve', { method: 'POST', headers: asAu2, body: JSON.stringify({ token, approved: true }) });
    expect(first.status).toBe(200);
    // wait out the per-user throttle so the second call reaches the handler
    await new Promise(r => setTimeout(r, 2200));
    const second = await fetch(base + '/assistant/approve', { method: 'POST', headers: asAu2, body: JSON.stringify({ token, approved: true }) });
    expect(second.status).toBe(409);
    expect((db.prepare("SELECT COUNT(*) as c FROM Post WHERE title = 'Once Only'").get() as any).c).toBe(1);
  });

  it('spends the plan when the user cancels', async () => {
    db.prepare("INSERT OR REPLACE INTO User (id, username, email, password, role, tokenVersion) VALUES ('au3','au3','au3@example.dev','x','author',0)").run();
    const token = signApproval('au3', [{ name: 'write_post', args: { title: 'Cancelled Plan' } }]);
    const r = await fetch(base + '/assistant/approve', {
      method: 'POST',
      headers: { authorization: 'Bearer ' + signToken({ userId: 'au3', role: 'author', v: 0 }), 'content-type': 'application/json' },
      body: JSON.stringify({ token, approved: false }),
    });
    expect((await r.json()).cancelled).toBe(true);
    // cancelling consumes the token too — a cancel must not leave a live plan behind
    expect(claimApproval(token)).toBe(false);
    expect((db.prepare("SELECT COUNT(*) as c FROM Post WHERE title = 'Cancelled Plan'").get() as any).c).toBe(0);
  });

  it('fails closed when the replay store is unusable', () => {
    const token = signApproval('ad', [{ name: 'write_post', args: { t: 1 } }]);
    db.exec('DROP TABLE IF EXISTS AiApprovalUse');
    try {
      // a missing table is a broken deployment, not a licence to skip the check
      expect(claimApproval(token)).toBe(false);
    } finally {
      db.exec('CREATE TABLE IF NOT EXISTS AiApprovalUse (hash TEXT PRIMARY KEY, expiresAt TEXT NOT NULL, createdAt TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP))');
    }
    expect(claimApproval(token)).toBe(true); // and it works again once restored
  });

  it('exposes the unattended escape hatch as an admin setting', async () => {
    const before = await (await fetch(base + '/settings', { headers: asAdmin })).json();
    expect(before.allowUnattendedRisky).toBe(false);
    await fetch(base + '/settings', { method: 'PUT', headers: asAdmin, body: JSON.stringify({ allowUnattendedRisky: true }) });
    const after = await (await fetch(base + '/settings', { headers: asAdmin })).json();
    expect(after.allowUnattendedRisky).toBe(true);
    await fetch(base + '/settings', { method: 'PUT', headers: asAdmin, body: JSON.stringify({ allowUnattendedRisky: false }) });
  });

  it('signs a plan to one user and refuses tampering or replay by another', () => {
    const token = signApproval('ad', [{ name: 'update_post', args: { id: 'p-a', status: 'trash' } }]);
    expect(verifyApproval(token, 'ad')?.calls).toEqual([{ name: 'update_post', args: { id: 'p-a', status: 'trash' } }]);
    expect(verifyApproval(token, 'au')).toBeNull();                                 // another user's token
    expect(verifyApproval(token.slice(0, -2) + 'xy', 'ad')).toBeNull();             // bad signature
    expect(verifyApproval('', 'ad')).toBeNull();
  });

  it('caps a plan at exactly what verification accepts', () => {
    const calls = Array.from({ length: MAX_APPROVAL_CALLS }, (_x, i) => ({ name: 'write_post', args: { i } }));
    expect(verifyApproval(signApproval('ad', calls), 'ad')?.calls).toHaveLength(MAX_APPROVAL_CALLS);
    // the site a plan was prepared for travels with it
    expect(verifyApproval(signApproval('ad', calls, 'site-a'), 'ad')?.siteId).toBe('site-a');
    expect(verifyApproval(signApproval('ad', calls), 'ad')?.siteId).toBeUndefined();
    // one more than the cap is refused by the verifier, which is why the route
    // truncates the batch it signs instead of signing it whole
    expect(verifyApproval(signApproval('ad', [...calls, { name: 'write_post', args: {} }]), 'ad')).toBeNull();
  });

  it('expires an approval token', () => {
    // Same construction as signApproval, with the clock moved past the deadline.
    const body = Buffer.from(JSON.stringify({ u: 'ad', exp: Date.now() - 1000, c: [{ name: 'write_post', args: {} }] })).toString('base64url');
    const sig = crypto.createHmac('sha256', loadSecret()).update(body).digest('base64url');
    expect(verifyApproval(body + '.' + sig, 'ad')).toBeNull();
  });

  it('refuses risky calls in an unattended task, and runs them for a human', async () => {
    setSetting('ai_tool_permissions', JSON.stringify({ author: ['write_post'] }));
    const asAuthor = { userId: 'au', role: 'author' };

    const blocked = await executeToolUnattended('write_post', { title: 'Unattended Publish', status: 'published' }, asAuthor) as any;
    expect(blocked.error).toMatch(/人工确认/);
    expect((db.prepare("SELECT COUNT(*) as c FROM Post WHERE title = 'Unattended Publish'").get() as any).c).toBe(0);

    // a draft is not risky, so an unattended job may still write one
    const drafted = await executeToolUnattended('write_post', { title: 'Unattended Draft' }, asAuthor) as any;
    expect(drafted.status).toBe('draft');

    // the operator's explicit opt-in restores the old behaviour
    setSetting('ai_allow_unattended_risky', '1');
    try {
      const allowed = await executeToolUnattended('write_post', { title: 'Unattended Opted In', status: 'published' }, asAuthor) as any;
      expect(allowed.status).toBe('published');
    } finally {
      db.prepare("DELETE FROM Setting WHERE key = 'ai_allow_unattended_risky'").run();
    }
  });

  it('executes an approved plan, and does nothing on cancel', async () => {
    setSetting('ai_tool_permissions', JSON.stringify({ author: ['write_post'] }));

    const token = signApproval('au', [{ name: 'write_post', args: { title: 'Approved Piece', status: 'published' } }]);
    const ok = await fetch(base + '/assistant/approve', {
      method: 'POST', headers: { authorization: 'Bearer ' + signToken({ userId: 'au', role: 'author', v: 0 }), 'content-type': 'application/json' },
      body: JSON.stringify({ token, approved: true }),
    });
    const body = await ok.json();
    expect(ok.status, JSON.stringify(body)).toBe(200);
    expect(body.summary).toMatch(/^✓ /);
    expect((db.prepare("SELECT status FROM Post WHERE title = 'Approved Piece'").get() as any).status).toBe('published');

    // cancel: a different user, so the per-user throttle does not interfere
    const cancelToken = signApproval('ad', [{ name: 'write_post', args: { title: 'Never Created' } }]);
    const cancelled = await fetch(base + '/assistant/approve', {
      method: 'POST', headers: asAdmin,
      body: JSON.stringify({ token: cancelToken, approved: false }),
    });
    expect((await cancelled.json()).cancelled).toBe(true);
    expect((db.prepare("SELECT COUNT(*) as c FROM Post WHERE title = 'Never Created'").get() as any).c).toBe(0);

    // a token signed for somebody else is not usable, even by an admin
    const foreign = signApproval('au', [{ name: 'write_post', args: { title: 'Not Mine' } }]);
    const refused = await fetch(base + '/assistant/approve', {
      method: 'POST', headers: { authorization: 'Bearer ' + signToken({ userId: 'ed', role: 'editor', v: 0 }), 'content-type': 'application/json' },
      body: JSON.stringify({ token: foreign, approved: true }),
    });
    expect(refused.status).toBe(400);
  });
});

// Task errors are persisted on the task and rendered in the admin, so anything
// unmapped must come out as a message we wrote, never as engine text.
// The provider-origin carve-out in downloadProviderImage is the one outbound
// fetch whose guard is conditional, so it gets its own redirect test.
describe('generated images cannot be redirected into the internal network', () => {
  it('follows no redirect out of the provider origin, and still reads a plain one', async () => {
    const http = require('http');
    const secret = http.createServer((_q: any, s: any) => { s.writeHead(200, { 'content-type': 'image/png' }); s.end('INTERNAL-SECRET'); });
    await new Promise<void>(r => secret.listen(0, '127.0.0.1', () => r()));
    const secretPort = secret.address().port;

    const front = http.createServer((req: any, s: any) => {
      if (req.url === '/img.png') { s.writeHead(200, { 'content-type': 'image/png' }); s.end('REAL-IMAGE'); return; }
      if (req.url === '/moved.png') { s.writeHead(302, { location: '/img.png' }); s.end(); return; } // stays in origin
      s.writeHead(302, { location: 'http://127.0.0.1:' + secretPort + '/img.png' }); s.end();        // leaves it
    });
    await new Promise<void>(r => front.listen(0, '127.0.0.1', () => r()));
    const origin = 'http://127.0.0.1:' + front.address().port;

    try {
      // same origin as the "provider", but it answers with a redirect to a
      // loopback service: the guard must reject, never return those bytes
      const redirected = await downloadProviderImage(origin + '/redirect.png', origin, 4096);
      expect('error' in redirected).toBe(true);
      expect(JSON.stringify(redirected)).not.toContain('INTERNAL-SECRET');

      // a self-hosted provider serving its own asset still works
      const direct = await downloadProviderImage(origin + '/img.png', origin, 4096);
      expect('buf' in direct && String((direct as any).buf)).toBe('REAL-IMAGE');

      // ...including when it redirects within its own origin (the trust
      // boundary is the origin, not "no redirects at all")
      const moved = await downloadProviderImage(origin + '/moved.png', origin, 4096);
      expect('buf' in moved && String((moved as any).buf)).toBe('REAL-IMAGE');
    } finally { front.close(); secret.close(); }
  });
});

describe('AI errors shown to users disclose no server detail', () => {
  it('replaces an unmapped internal error instead of echoing it', () => {
    const msg = friendlyTaskError(new Error('SQLITE_ERROR: no such column: Post.secret_key at /srv/app/dist/utils/db.js:88'));
    expect(msg).toBe('任务执行失败，请重试');
    expect(msg).not.toMatch(/SQLITE|secret_key|\/srv\/app|db\.js/);
  });

  it('keeps a provider failure down to its status code', () => {
    const e = providerError(401, '{"error":{"message":"Incorrect API key provided: sk-live-abcdef123456","organization":"org-9f2c"}}');
    expect(e.message).toBe('AI 请求失败 (401)');
    expect(e.message).not.toMatch(/sk-live|org-9f2c/);
    // and the friendly mapping still turns it into something actionable
    expect(friendlyTaskError(e)).toMatch(/余额与模型配置/);
    expect(friendlyTaskError(e)).not.toMatch(/sk-live|org-9f2c/);
  });

  it('lets through messages the application wrote itself', () => {
    expect(userFacingAiError(new Error('尚未配置 AI 服务商'))).toBe('尚未配置 AI 服务商');
    expect(userFacingAiError(new Error('任务执行超时（10 分钟上限）'))).toMatch(/任务执行超时/);
  });

  it('keeps a connection failure actionable without naming the address', () => {
    const msg = userFacingAiError(new TypeError('fetch failed', { cause: new Error('connect ECONNREFUSED 10.0.0.5:11434') }));
    expect(msg).toMatch(/无法连接 AI 服务商/);
    expect(msg).not.toMatch(/10\.0\.0\.5|11434|ECONNREFUSED/);
  });

  it('falls back to a generic line for anything else', () => {
    expect(userFacingAiError(new Error('TypeError: Cannot read properties of undefined (reading \'apiKey\') at /srv/app/dist/routes/ai.js:300')))
      .toBe('操作失败，请稍后重试');
  });
});

// A scheduled job or a bound bot has no human to narrow its scope at run time,
// so the scope has to be stored with it — and only a role that may target
// another site is allowed to choose one.
describe('unattended jobs carry a site scope', () => {
  beforeAll(() => {
    db.prepare("INSERT OR REPLACE INTO Site (id, name, slug, domain) VALUES ('st-1','Site One','site-one','one.test')").run();
  });

  it('stores the site an admin picks, and ignores one for everyone else', async () => {
    const ok = await fetch(base + '/schedules', { method: 'POST', headers: asAdmin, body: JSON.stringify({ name: 'scoped', prompt: 'x', type: 'daily', siteId: 'st-1' }) });
    expect(ok.status).toBe(201);
    expect((await ok.json()).siteId).toBe('st-1');

    // an unknown site resolves to "no scope" rather than being stored verbatim
    const bogus = await fetch(base + '/schedules', { method: 'POST', headers: asAdmin, body: JSON.stringify({ name: 'bogus', prompt: 'x', type: 'daily', siteId: 'nope' }) });
    expect((await bogus.json()).siteId).toBeNull();

    // an author may still create a schedule, but not scope it to a site
    const asAuthor = { authorization: 'Bearer ' + signToken({ userId: 'au', role: 'author', v: 0 }), 'content-type': 'application/json' };
    const denied = await fetch(base + '/schedules', { method: 'POST', headers: asAuthor, body: JSON.stringify({ name: 'author-job', prompt: 'x', type: 'daily', siteId: 'st-1' }) });
    expect(denied.status).toBe(201);
    expect((await denied.json()).siteId).toBeNull();
  });

  it('only scopes a request to a site the user is assigned to', async () => {
    // The Host header decides which site a request LOOKS like it belongs to, and
    // the caller controls it. Assignments are what make that header non-authoritative.
    db.prepare("INSERT OR REPLACE INTO Site (id, name, slug, domain) VALUES ('st-a','A','site-a','a.test')").run();
    db.prepare("INSERT OR REPLACE INTO Site (id, name, slug, domain) VALUES ('st-b','B','site-b','b.test')").run();
    db.prepare("INSERT OR REPLACE INTO User (id, username, email, password, role, tokenVersion) VALUES ('ed9','ed9','ed9@example.dev','x','editor',0)").run();

    expect(userMayAccessSite('ed9', 'editor', 'st-a')).toBe(true); // no assignments = unrestricted
    setUserSites('ed9', ['st-a']);
    expect(userMayAccessSite('ed9', 'editor', 'st-a')).toBe(true);
    expect(userMayAccessSite('ed9', 'editor', 'st-b')).toBe(false);
    // admins are never restricted, and "no site resolved" is always allowed
    expect(userMayAccessSite('ed9', 'admin', 'st-b')).toBe(true);
    expect(userMayAccessSite('ed9', 'editor', undefined)).toBe(true);
    // and it is what the job-site resolver consults
    expect(getUserSiteIds('ed9')).toEqual(['st-a']);
  });

  it('writes site settings where the visitor will actually see them', async () => {
    db.prepare("INSERT OR REPLACE INTO Site (id, name, slug, domain) VALUES ('st-2','Site Two','site-two','two.test')").run();
    // scoped request → the site's override (what the frontend merges over global)
    await executeTool('update_site_settings', { settings: { site_title: 'Scoped Title' } }, { userId: 'ad', role: 'admin', siteId: 'st-2' });
    expect((db.prepare('SELECT value FROM SiteSetting WHERE siteId = ? AND key = ?').get('st-2', 'site_title') as any)?.value).toBe('Scoped Title');
    // unscoped → the global default
    await executeTool('update_site_settings', { settings: { site_title: 'Global Title' } }, { userId: 'ad', role: 'admin' });
    expect((db.prepare("SELECT value FROM Setting WHERE key = 'site_title'").get() as any)?.value).toBe('Global Title');
    expect((db.prepare('SELECT value FROM SiteSetting WHERE siteId = ? AND key = ?').get('st-2', 'site_title') as any)?.value).toBe('Scoped Title');
  });

  it('a binding owner cannot widen (or clear) the scope an admin set', async () => {
    const created = await fetch(base + '/bindings', { method: 'POST', headers: asAdmin, body: JSON.stringify({ platform: 'wechat', userId: 'au', siteId: 'st-1' }) });
    const b = (await created.json()).binding;
    expect(b.siteId).toBe('st-1');

    // the owner may edit the label, but their siteId field is ignored — resolving
    // it to null would let the restricted party lift the restriction itself
    const asAuthor = { authorization: 'Bearer ' + signToken({ userId: 'au', role: 'author', v: 0 }), 'content-type': 'application/json' };
    await fetch(base + '/bindings/' + b.id, { method: 'PUT', headers: asAuthor, body: JSON.stringify({ label: 'renamed', siteId: '' }) });
    const after = (await (await fetch(base + '/bindings', { headers: asAdmin })).json()).bindings.find((x: any) => x.id === b.id);
    expect(after.siteId).toBe('st-1');
    expect(after.label).toBe('renamed');

    // an admin can clear it deliberately
    await fetch(base + '/bindings/' + b.id, { method: 'PUT', headers: asAdmin, body: JSON.stringify({ siteId: '' }) });
    const cleared = (await (await fetch(base + '/bindings', { headers: asAdmin })).json()).bindings.find((x: any) => x.id === b.id);
    expect(cleared.siteId).toBeNull();
  });
});

describe('AI bookkeeping stays bounded and scoped', () => {
  beforeAll(() => { registerBuiltinTasks(); });

  it('a retry keeps the original task\'s site scope', async () => {
    // A retry used to carry no site at all, silently widening a site-scoped task
    // into one that could touch every site.
    // distinct prompt: the budget suite below counts tasks by prompt text
    db.prepare("INSERT INTO AiTask (id, userId, username, prompt, status, steps, siteId, createdAt) VALUES ('t-site','ad','ad','site scoped retry','failed','[]','site-a',?)")
      .run(new Date().toISOString());
    const r = await fetch(base + '/tasks/t-site/retry', { method: 'POST', headers: asAdmin });
    expect(r.status).toBe(201);
    const { id } = await r.json();
    expect((db.prepare('SELECT siteId FROM AiTask WHERE id = ?').get(id) as any).siteId).toBe('site-a');
  });

  it('prunes old AI bookkeeping without touching recent rows', async () => {
    const old = new Date(Date.now() - 200 * 86400000).toISOString();
    const now = new Date().toISOString();
    db.prepare("INSERT INTO AiAudit (id, userId, role, tool, args, output, createdAt) VALUES ('a-old','ad','admin','x','{}','{}',?)").run(old);
    db.prepare("INSERT INTO AiAudit (id, userId, role, tool, args, output, createdAt) VALUES ('a-new','ad','admin','x','{}','{}',?)").run(now);
    const run = await runTaskNow('prune_ai_records');
    expect(run.ok, run.error).toBe(true);
    expect((db.prepare("SELECT COUNT(*) as c FROM AiAudit WHERE id = 'a-old'").get() as any).c).toBe(0);
    expect((db.prepare("SELECT COUNT(*) as c FROM AiAudit WHERE id = 'a-new'").get() as any).c).toBe(1);
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

// Share links are copied and pasted, so they must point at the site's real
// address: the client used to prefix window.location.origin, publishing
// "http://localhost:3001/..." for a site that has a domain.
describe('share links use the configured domain', () => {
  const share = async () => {
    const r = await fetch(base + '/share', { method: 'POST', headers: asAdmin, body: JSON.stringify({ messages: [{ role: 'user', content: 'hi' }] }) });
    return String((await r.json()).url || '');
  };

  it('prefers the site_url setting over the request host', async () => {
    setSetting('site_url', 'https://blog.example.com');
    const url = await share();
    expect(url.startsWith('https://blog.example.com/share/ai/')).toBe(true);
    // the token in it still resolves
    const token = url.split('/').pop();
    expect((await fetch(base + '/share/' + token)).status).toBe(200);
  });

  it('falls back to the primary site domain when site_url is unset', async () => {
    setSetting('site_url', '');
    db.prepare("INSERT OR REPLACE INTO Site (id, name, slug, domain, isPrimary, active) VALUES ('share-primary','P','share-primary','primary.example',1,1)").run();
    const url = await share();
    expect(url).toMatch(/^https?:\/\/primary\.example\/share\/ai\//);
    db.prepare("DELETE FROM Site WHERE id = 'share-primary'").run();
  });
});

// A share link is public the moment it exists, so what lands in the row is
// decided server-side; the client's message objects also carry tool outputs and
// pending approval tokens, and the row must stay small and revocable.
describe('share links are built server-side and expire', () => {
  it('keeps only role/content, drops tool output, and caps the size', async () => {
    const r = await fetch(base + '/share', {
      method: 'POST', headers: asAdmin,
      body: JSON.stringify({ messages: [
        { role: 'user', content: 'question', toolResults: [{ name: 'get_site_settings', output: '{"storage_secret":"S3-SECRET"}' }] },
        { role: 'assistant', content: 'answer', pending: { token: 'signed-plan-token', calls: [{ name: 'update_post' }] } },
        { role: 'system', content: 'internal note' },
        { role: 'assistant', content: 'x'.repeat(9000) },
      ] }),
    });
    const { url, token } = await r.json();
    expect(url).toContain('/share/ai/' + token);

    const pub = await (await fetch(base + '/share/' + token)).text();
    expect(pub).not.toContain('S3-SECRET');            // tool output never goes public
    expect(pub).not.toContain('signed-plan-token');    // nor a pending approval token
    expect(pub).not.toContain('internal note');        // nor non-conversation roles
    expect(pub).not.toContain('userId');               // nor the sharer's id
    const data = JSON.parse(pub);
    // the system-role entry is dropped; the oversized assistant message is kept
    // but truncated rather than stored whole
    expect(data.messages.map((m: any) => m.role)).toEqual(['user', 'assistant', 'assistant']);
    expect(data.messages[2].content.length).toBe(4000);
    expect(data.expiresAt).toBeTruthy();
  });

  it('can be revoked by its author, and stops resolving', async () => {
    const r = await fetch(base + '/share', { method: 'POST', headers: asAdmin, body: JSON.stringify({ messages: [{ role: 'user', content: 'revoke me' }] }) });
    const { token } = await r.json();
    expect((await fetch(base + '/share/' + token)).status).toBe(200);
    const del = await fetch(base + '/share/' + token, { method: 'DELETE', headers: asAdmin });
    expect(del.status).toBe(200);
    expect((await fetch(base + '/share/' + token)).status).toBe(404);
  });

  it('is not exposed through the generic settings read', async () => {
    // share blobs are content, not configuration: they must not ride along in
    // GET /settings (or reach the AI's get_site_settings)
    const r = await fetch(base + '/share', { method: 'POST', headers: asAdmin, body: JSON.stringify({ messages: [{ role: 'user', content: 'CANARY-IN-SETTINGS' }] }) });
    await r.json();
    const shareTools = await executeTool('get_site_settings', {}, { userId: 'ad', role: 'admin' }) as any;
    expect(JSON.stringify(shareTools)).not.toContain('CANARY-IN-SETTINGS');
  });
});

// Declared last on purpose: exhausting the budget flips a module-level cache that
// the other suites should not observe.
describe('the bot callback respects the daily budget', () => {
  it('refuses a webhook reply once the daily tokens are spent', async () => {
    const create = await fetch(base + '/bindings', {
      method: 'POST', headers: asAdmin,
      body: JSON.stringify({ platform: 'wechat', userId: 'ad' }),
    });
    const token = (await create.json()).binding?.token;
    expect(token).toBeTruthy();

    // A provider must exist, otherwise the callback stops at "not configured"
    // before it ever consults the budget.
    saveProviders([{ id: 'p1', name: 'Test', type: 'openai', baseUrl: 'https://api.example.com/v1', model: 'm', apiKey: 'k', enabled: true } as any]);
    setSetting('ai_usage_limit_daily', '1');
    db.prepare("INSERT INTO AiUsage (id, userId, kind, model, tokens, createdAt) VALUES ('usage-x','ad','test','',100,?)").run(new Date().toISOString());
    resetUsageCache(); // the budget verdict is cached for 10s

    const r = await fetch(base + '/webhook/' + token, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ message: '你好' }),
    });
    expect((await r.json()).reply).toMatch(/用量已达上限/);
  });
});

// Also runs on the spent budget left behind above: retrying a task must not be
// a way around the cap (runTask re-checks it too, for the scheduled jobs that
// never pass through a route).
describe('retrying a task cannot bypass the daily budget', () => {
  it('rejects the retry instead of starting a new run', async () => {
    db.prepare("INSERT INTO AiTask (id, userId, username, prompt, status, steps, createdAt) VALUES ('t-spent','ad','ad','hi','failed','[]',?)")
      .run(new Date().toISOString());
    resetUsageCache();

    const r = await fetch(base + '/tasks/t-spent/retry', { method: 'POST', headers: asAdmin });
    expect(r.status).toBe(429);

    const row = db.prepare('SELECT status FROM AiTask WHERE id = ?').get('t-spent') as any;
    expect(row.status).toBe('failed');
    const spawned = db.prepare("SELECT COUNT(*) as c FROM AiTask WHERE prompt = 'hi'").get() as any;
    expect(spawned.c).toBe(1); // no new task was created
  });
});

// The session row is what a second device loads, so the confirmation card has to
// survive the round trip: the text alone ("需要你确认后执行") with no button left
// the user with an action they could neither see nor complete.
describe('a pending approval survives the session round trip', () => {
  it('keeps the token and the call list, and drops malformed ones', async () => {
    const r = await fetch(base + '/sessions', {
      method: 'POST', headers: asAdmin,
      body: JSON.stringify({
        title: 'pending round trip',
        messages: [
          { role: 'assistant', content: '⏸ 需要你确认后执行：…', pending: { token: 'tok-abc', calls: [{ id: 'c1', name: 'write_post', summary: '发布文章（对访客立即可见）《x》' }] } },
          { role: 'assistant', content: 'no pending here' },
          { role: 'assistant', content: 'bad', pending: { token: '' } },
        ],
      }),
    });
    expect(r.status).toBe(201);
    const { id } = await r.json();
    const full = await (await fetch(base + '/sessions/' + id, { headers: asAdmin })).json();
    expect(full.messages[0].pending.token).toBe('tok-abc');
    expect(full.messages[0].pending.calls[0].summary).toContain('发布文章');
    expect(full.messages[1].pending).toBeUndefined();
    expect(full.messages[2].pending).toBeUndefined();
    await fetch(base + '/sessions/' + id, { method: 'DELETE', headers: asAdmin });
  });
});

// A plugin tool is unknown to the assistant, so it is low-risk by default — but
// its author can now opt into the confirmation gate.
describe('plugin tools can declare their own risk', () => {
  it('gates a declared tool and leaves an undeclared one alone', async () => {
    const { registerTool, pluginRiskyReason } = await import('../src/utils/aiTools');
    registerTool('plugin_publish_all', 'test tool', { type: 'object', properties: {} }, async () => ({ ok: true }), { reason: '批量发布全站文章' });
    registerTool('plugin_count', 'test tool', { type: 'object', properties: {} }, async () => ({ ok: true }));
    expect(riskyReason('plugin_publish_all', {})).toBe('批量发布全站文章');
    expect(riskyReason('plugin_count', {})).toBeNull();
    // a function form can decide per call
    registerTool('plugin_maybe', 'test', { type: 'object', properties: {} }, async () => ({}), (args: any) => (args?.force ? '强制覆盖' : null));
    expect(riskyReason('plugin_maybe', { force: true })).toBe('强制覆盖');
    expect(riskyReason('plugin_maybe', {})).toBeNull();
    expect(pluginRiskyReason('plugin_count', {})).toBeNull();
  });
});

