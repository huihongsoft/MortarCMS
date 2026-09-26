import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import fs from 'fs';
import express from 'express';
import db, { initDB } from '../src/utils/db';
import { scoreSpam, spamWords, SPAM_THRESHOLD, MIN_FILL_MS } from '../src/utils/spam';
import commentRoutes from '../src/routes/comments';
import formRoutes from '../src/routes/forms';

// Public submissions had one client-side honeypot between them and the internet:
// a POST straight to the API skipped it, the `spam_words` setting had no reader
// on the server, and form submissions had no rate limit. These pin the scoring
// and the two paths that use it.
const DB_FILE = process.env.MORTAR_DB_PATH || '/tmp/mortar-vitest-spam.db';
let server: any;
let base = '';

beforeAll(async () => {
  initDB();
  db.prepare("INSERT INTO User (id, username, email, password, role, tokenVersion) VALUES ('u1','u1','u1@test.dev','x','admin',0)").run();
  db.prepare("INSERT INTO Post (id, title, slug, content, excerpt, status, type, authorId, publishedAt) VALUES ('p1','Post','post-1','body','','published','post','u1', ?)")
    .run(new Date().toISOString());
  db.prepare("INSERT INTO Form (id, name, slug, fields, enabled) VALUES ('f1','Contact','contact',?,1)")
    .run(JSON.stringify([{ name: 'email', label: 'Email', type: 'email', required: true }, { name: 'message', label: 'Message', type: 'textarea', required: true }]));
  const app = express();
  app.use(express.json());
  // Comments live under /api/comments (the router owns '/'), forms under /api.
  app.use('/api/comments', commentRoutes);
  app.use('/api', formRoutes);
  server = app.listen(0);
  await new Promise((r) => server.on('listening', r));
  base = 'http://127.0.0.1:' + server.address().port + '/api';
});

afterAll(() => {
  server?.close();
  for (const s of ['', '-wal', '-shm']) { try { fs.unlinkSync(DB_FILE + s); } catch {} }
});

beforeEach(() => {
  db.prepare('DELETE FROM Comment').run();
  db.prepare('DELETE FROM FormSubmission').run();
  db.prepare("DELETE FROM Setting WHERE key = 'spam_words'").run();
});

describe('scoring', () => {
  it('passes an ordinary comment', () => {
    const v = scoreSpam({ content: 'Nice write-up, thanks for sharing!', author: 'Ann', email: 'ann@example.com' });
    expect(v.spam).toBe(false);
    expect(v.score).toBe(0);
  });

  it('treats a filled honeypot as a bot', () => {
    const v = scoreSpam({ content: 'hi', honeypot: 'http://spam.example' });
    expect(v.spam).toBe(true);
    expect(v.reasons).toContain('honeypot');
  });

  it('flags a submission faster than a human can type', () => {
    const fast = scoreSpam({ content: 'hello there', startedAt: Date.now() - 200 });
    expect(fast.spam).toBe(true);
    expect(fast.reasons.join(' ')).toContain('submitted in');
  });

  it('does not treat a missing timing signal as fast', () => {
    // No startedAt: API clients (the CMS's own tools included) send none, and
    // "absent" must not read as "instant".
    expect(scoreSpam({ content: 'hello there' }).spam).toBe(false);
    const slow = scoreSpam({ content: 'hello there', startedAt: Date.now() - (MIN_FILL_MS + 5000) });
    expect(slow.spam).toBe(false);
  });

  it('counts links, a URL in the name field, and the operator’s word list', () => {
    const links = scoreSpam({ content: 'see http://a.example http://b.example http://c.example' });
    expect(links.reasons.join(' ')).toContain('links=3');
    const urlName = scoreSpam({ content: 'hello', author: 'visit www.spam.example' });
    expect(urlName.reasons.join(' ')).toContain('url in author');
    const words = scoreSpam({ content: 'buy cheap casino tokens now' }, ['casino', 'cheap']);
    expect(words.reasons.join(' ')).toContain('spam words');
    expect(words.spam).toBe(true);
    // Scoring with an empty list must ignore the setting entirely.
    expect(scoreSpam({ content: 'buy cheap casino tokens now' }, []).reasons.join(' ')).not.toContain('spam words');
  });

  it('reads the list from the setting that had no reader', () => {
    db.prepare("INSERT INTO Setting (id, key, value) VALUES ('spam_words','spam_words',?)").run('casino\nviagra, buy now');
    expect(spamWords()).toEqual(['casino', 'viagra', 'buy now']);
    expect(scoreSpam({ content: 'casino viagra' }).spam).toBe(true);
  });

  it('thresholds at a documented score', () => {
    // Fast + links + a URL in the name: comfortably over.
    const v = scoreSpam({ content: 'hi http://a.example http://b.example', author: 'www.x.example', startedAt: Date.now() - 100 });
    expect(v.score).toBeGreaterThanOrEqual(SPAM_THRESHOLD);
    expect(v.spam).toBe(true);
  });
});

describe('comments', () => {
  async function comment(body: Record<string, unknown>): Promise<any> {
    const r = await fetch(base + '/comments/', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ postId: 'p1', author: 'Ann', email: 'ann@example.com', content: 'hello', ...body }),
    });
    return { status: r.status, body: await r.json() };
  }

  it('files a honeypot submission as spam without saying so', async () => {
    const r = await comment({ _hp: 'http://spam.example' });
    // The reply is the ordinary one: telling a bot it was caught teaches it to
    // adjust, and a false positive must look like a normal submission.
    expect(r.status).toBe(201);
    expect(r.body.recoveryCodeUsed).toBeUndefined();
    const row = db.prepare("SELECT status FROM Comment WHERE id = ?").get(r.body.id) as any;
    expect(row.status).toBe('spam');
  });

  it('keeps an ordinary comment pending, not spam', async () => {
    const r = await comment({ content: 'A thoughtful reply to the post.' });
    expect((db.prepare('SELECT status FROM Comment WHERE id = ?').get(r.body.id) as any).status).toBe('pending');
  });

  it('hides a comment that arrives faster than a person can write it', async () => {
    const r = await comment({ content: 'buy now http://spam.example', _t: Date.now() - 50 });
    expect((db.prepare('SELECT status FROM Comment WHERE id = ?').get(r.body.id) as any).status).toBe('spam');
  });
});

describe('form submissions', () => {
  async function submit(body: Record<string, unknown>): Promise<any> {
    const r = await fetch(base + '/forms/contact/submit', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'ann@example.com', message: 'hello', ...body }),
    });
    return { status: r.status, body: await r.json() };
  }

  it('stores a normal submission unflagged', async () => {
    const r = await submit({ message: 'I would like a quote.' });
    expect(r.status).toBe(200);
    const row = db.prepare('SELECT spam FROM FormSubmission ORDER BY createdAt DESC LIMIT 1').get() as any;
    expect(row.spam).toBe(0);
  });

  it('flags a honeypot submission', async () => {
    await submit({ _hp: 'bot' });
    expect((db.prepare('SELECT spam FROM FormSubmission ORDER BY createdAt DESC LIMIT 1').get() as any).spam).toBe(1);
  });

  it('flags spam words from the setting', async () => {
    db.prepare("INSERT INTO Setting (id, key, value) VALUES ('spam_words','spam_words',?)").run('casino');
    await submit({ message: 'best casino deals' });
    expect((db.prepare('SELECT spam FROM FormSubmission ORDER BY createdAt DESC LIMIT 1').get() as any).spam).toBe(1);
  });

  it('rate limits the public submit endpoint', async () => {
    let limited = false;
    for (let i = 0; i < 14 && !limited; i++) {
      const r = await fetch(base + '/forms/contact/submit', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: 'ann@example.com', message: 'hello ' + i }),
      });
      if (r.status === 429) limited = true;
    }
    expect(limited).toBe(true);
  });
});
