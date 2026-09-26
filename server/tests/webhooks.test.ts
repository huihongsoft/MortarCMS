import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import fs from 'fs';
import crypto from 'crypto';
import express from 'express';
import db, { initDB } from '../src/utils/db';
import { signToken } from '../src/utils/jwt';

// Outbound webhooks.
//
// Two things can go wrong quietly here: a payload that does not match what the
// subscriber was promised (the docs say post_* carry the post's fields), and a
// delivery that fails in a way the admin screen cannot see. Both are checked
// below. The SSRF guard has its own tests, so `fetchUrlGuarded` is stubbed: what
// is being verified here is the payload, the signature and the failure record.

// One shared recorder the stub writes into, so a test can assert on what was
// actually sent.
const sent: { url: string; init: any; body: any }[] = [];
let nextResponse: { status: number } | null = { status: 200 };

vi.mock('../src/utils/ssrf', () => ({
  fetchUrlGuarded: async (url: string, init: any) => {
    sent.push({ url, init, body: init?.body });
    return nextResponse ? { status: nextResponse.status } : null;
  },
}));

const { deliverWebhooks, deliverTestWebhook } = await import('../src/utils/webhooks');

const DB_FILE = process.env.MORTAR_DB_PATH || '/tmp/mortar-vitest-webhooks.db';
let server: any;
let base = '';
const token = { Authorization: 'Bearer ' + signToken({ userId: 'u1', role: 'admin', v: 0 }), 'content-type': 'application/json' };

beforeAll(async () => {
  initDB();
  db.prepare("INSERT INTO User (id, username, email, password, role, tokenVersion) VALUES ('u1','u1','u1@test.dev','x','admin',0)").run();
  const app = express();
  app.use(express.json());
  app.use('/api', (await import('../src/routes/webhooks')).default);
  server = app.listen(0);
  await new Promise((r) => server.on('listening', r));
  base = 'http://127.0.0.1:' + server.address().port;
});

afterAll(() => {
  server?.close();
  for (const s of ['', '-wal', '-shm']) { try { fs.unlinkSync(DB_FILE + s); } catch {} }
});

beforeEach(() => {
  db.prepare('DELETE FROM Webhook').run();
  db.prepare('DELETE FROM Post').run();
  sent.length = 0;
  nextResponse = { status: 200 };
});

function addWebhook(id: string, url: string, events: string[], secret = 'secret-' + id) {
  db.prepare("INSERT INTO Webhook (id, name, url, events, secret, active) VALUES (?, ?, ?, ?, ?, 1)")
    .run(id, id, url, JSON.stringify(events), secret);
}

function addPost(id: string, title: string) {
  db.prepare("INSERT INTO Post (id, title, slug, content, excerpt, status, type, authorId, publishedAt) VALUES (?, ?, ?, '', 'an excerpt', 'published', 'post', 'u1', ?)")
    .run(id, title, id, new Date().toISOString());
}

describe('delivery', () => {
  it('signs the payload with the webhook secret and sends it to the subscriber', async () => {
    addPost('p1', 'Hello');
    addWebhook('w1', 'https://example.com/hook', ['post_published']);

    await deliverWebhooks('post_published', ['p1']);

    expect(sent).toHaveLength(1);
    expect(sent[0].url).toBe('https://example.com/hook');
    // The signature is over the exact bytes sent: a subscriber that re-signs the
    // body it received must get the same value, or every delivery looks forged.
    const sig = sent[0].init.headers['X-Webhook-Signature'];
    expect(sig).toBe('sha256=' + crypto.createHmac('sha256', 'secret-w1').update(sent[0].body).digest('hex'));

    const payload = JSON.parse(sent[0].body);
    expect(payload.event).toBe('post_published');
    expect(payload.data).toMatchObject({ postId: 'p1', title: 'Hello', slug: 'p1', status: 'published' });
    expect(typeof payload.sentAt).toBe('string');
  });

  it('only sends the events a subscriber asked for', async () => {
    addPost('p1', 'Hello');
    addWebhook('w1', 'https://example.com/a', ['post_published']);
    addWebhook('w2', 'https://example.com/b', ['comment_added']);

    await deliverWebhooks('post_published', ['p1']);
    expect(sent.map((s) => s.url)).toEqual(['https://example.com/a']);
  });

  it('skips inactive subscribers', async () => {
    addPost('p1', 'Hello');
    addWebhook('w1', 'https://example.com/a', ['post_published']);
    db.prepare("UPDATE Webhook SET active = 0 WHERE id = 'w1'").run();
    await deliverWebhooks('post_published', ['p1']);
    expect(sent).toHaveLength(0);
  });

  it('records a failed delivery instead of throwing', async () => {
    // A broken endpoint must not break the site: the hook fired from the request
    // that published the post, so an exception here would 500 that request.
    addPost('p1', 'Hello');
    addWebhook('w1', 'https://example.com/broken', ['post_published']);
    nextResponse = { status: 500 };

    await expect(deliverWebhooks('post_published', ['p1'])).resolves.toBeUndefined();
    const row = db.prepare("SELECT lastStatus, lastError, lastSentAt FROM Webhook WHERE id = 'w1'").get() as any;
    expect(row.lastStatus).toBe(500);
    expect(row.lastError).toContain('500');
    expect(row.lastSentAt).toBeTruthy();
  });

  it('records a blocked or unreachable endpoint as a failure, with a null status', async () => {
    addPost('p1', 'Hello');
    addWebhook('w1', 'http://169.254.169.254/latest/meta-data', ['post_published']);
    nextResponse = null; // what the guard returns when it refuses

    await deliverWebhooks('post_published', ['p1']);
    const row = db.prepare("SELECT lastStatus, lastError FROM Webhook WHERE id = 'w1'").get() as any;
    expect(row.lastStatus).toBeNull();
    expect(row.lastError).toBeTruthy();
  });

  it('reports a test delivery to the caller', async () => {
    addWebhook('w1', 'https://example.com/hook', ['post_published']);
    nextResponse = { status: 200 };
    expect(await deliverTestWebhook('w1')).toMatchObject({ ok: true, status: 200 });

    nextResponse = { status: 404 };
    const bad = await deliverTestWebhook('w1');
    expect(bad.ok).toBe(false);
    expect(bad.status).toBe(404);
  });
});

describe('the admin endpoints', () => {
  it('keeps the secret out of the list response', async () => {
    // The secret is what lets a subscriber verify a payload; handing it to any
    // admin screen reader would let them forge deliveries.
    addWebhook('w1', 'https://example.com/hook', ['post_published']);
    const res = await fetch(base + '/api/admin/webhooks', { headers: token });
    const body = await res.json();
    const row = (body.webhooks || body || [])[0];
    expect(row).toBeTruthy();
    expect(row.secret).toBeUndefined();
    expect(row.hasSecret ?? true).toBeTruthy();
  });

  it('refuses a subscriber URL that is not http(s)', async () => {
    const res = await fetch(base + '/api/admin/webhooks', {
      method: 'POST', headers: token,
      body: JSON.stringify({ url: 'file:///etc/passwd', events: ['post_published'] }),
    });
    expect(res.status).toBe(400);
  });

  it('rotates the secret and delivers with the new one', async () => {
    addWebhook('w1', 'https://example.com/hook', ['post_published']);
    const res = await fetch(base + '/api/admin/webhooks/w1/reset-secret', { method: 'POST', headers: token });
    expect(res.ok).toBeTruthy();
    const { secret } = await res.json();
    expect(secret).toBeTruthy();

    addPost('p1', 'Hello');
    await deliverWebhooks('post_published', ['p1']);
    const sig = sent[0].init.headers['X-Webhook-Signature'];
    expect(sig).toBe('sha256=' + crypto.createHmac('sha256', secret).update(sent[0].body).digest('hex'));
  });
});
