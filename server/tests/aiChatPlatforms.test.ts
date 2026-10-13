import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'fs';
import crypto from 'crypto';
import express from 'express';
import db, { initDB } from '../src/utils/db';
import { signToken } from '../src/utils/jwt';
import aiRoutes from '../src/routes/ai';
import { verifyTelegramSecret, verifySlackSignature, ADAPTERS } from '../src/utils/chatAdapters';

// Telegram and Slack bindings. Both are delivered over plain HTTP and answered
// by pushing through the platform's API, so what has to hold is that a delivery
// is authenticated before the assistant sees it — and that the ack does not wait
// for the model (Slack retries past 3 seconds, Telegram retries a non-2xx, and
// either would answer the user twice).

const DB_FILE = process.env.MORTAR_DB_PATH || '/tmp/mortar-vitest-chat-platforms.db';

let server: any;
let base = '';

const asAdmin = { authorization: 'Bearer ' + signToken({ userId: 'cp-admin', role: 'admin', v: 0 }), 'content-type': 'application/json' };

beforeAll(async () => {
  initDB();
  db.prepare("INSERT INTO User (id, username, email, password, role, tokenVersion) VALUES ('cp-admin','cp-admin','cp-admin@example.dev','x','admin',0)").run();
  const app = express();
  // Same raw-body hook index.ts installs: Slack's signature is over the bytes.
  app.use(express.json({ verify: (req: any, _res: any, buf: Buffer) => { req.rawBody = buf; } }));
  app.use('/api/ai', aiRoutes);
  server = app.listen(0);
  await new Promise(r => server.on('listening', r));
  base = 'http://127.0.0.1:' + server.address().port + '/api/ai';
});

afterAll(() => {
  server?.close();
  for (const s of ['', '-wal', '-shm']) { try { fs.unlinkSync(DB_FILE + s); } catch {} }
});

async function makeBinding(platform: string, extra: Record<string, string>) {
  const r = await fetch(base + '/bindings', { method: 'POST', headers: asAdmin, body: JSON.stringify({ platform, userId: 'cp-admin', ...extra }) });
  expect(r.status, JSON.stringify(await r.clone().json())).toBe(201);
  return (await r.json()).binding;
}

describe('telegram webhook', () => {
  it('rejects a delivery without the secret header, and accepts one with it', async () => {
    const b = await makeBinding('telegram', { tgToken: 'bot-token', tgSecret: 'shh-telegram' });
    const url = base + '/webhook/telegram/' + b.token;
    const body = JSON.stringify({ message: { chat: { id: 42 }, from: { id: 7 }, text: '你好' } });

    const denied = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body });
    expect(denied.status).toBe(403);

    const wrong = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json', 'x-telegram-bot-api-secret-token': 'nope' }, body });
    expect(wrong.status).toBe(403);

    const ok = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json', 'x-telegram-bot-api-secret-token': 'shh-telegram' }, body });
    expect(ok.status).toBe(200);
    expect((await ok.json()).ok).toBe(true);
  });

  it('ignores a message from a bot, which would otherwise answer itself forever', () => {
    const inbound = ADAPTERS.telegram.parse({ body: { message: { chat: { id: 1 }, from: { id: 2, is_bot: true }, text: 'ping' } } });
    expect(inbound).toBeNull();
    expect(ADAPTERS.telegram.parse({ body: { message: { chat: { id: 1 }, from: { id: 2 }, text: 'ping' } } }))
      .toEqual({ message: 'ping', replyTo: '1' });
  });

  it('rejects a binding whose token matches but whose platform does not', async () => {
    const b = await makeBinding('slack', { slackToken: 'xoxb-x', slackSecret: 'sign-me' });
    const r = await fetch(base + '/webhook/telegram/' + b.token, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-telegram-bot-api-secret-token': 'anything' },
      body: JSON.stringify({ message: { chat: { id: 1 }, text: 'hi' } }),
    });
    expect(r.status).toBe(404);
  });
});

describe('slack webhook', () => {
  const sign = (secret: string, ts: string, body: string) =>
    'v0=' + crypto.createHmac('sha256', secret).update('v0:' + ts + ':' + body).digest('hex');

  it('answers the URL-verification challenge only when the signature checks out', async () => {
    const b = await makeBinding('slack', { slackToken: 'xoxb-x', slackSecret: 'sign-me' });
    const url = base + '/webhook/slack/' + b.token;
    const ts = String(Math.floor(Date.now() / 1000));
    const body = JSON.stringify({ type: 'url_verification', challenge: 'challenge-abc' });

    const unsigned = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body });
    expect(unsigned.status).toBe(403);

    const signed = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json', 'x-slack-request-timestamp': ts, 'x-slack-signature': sign('sign-me', ts, body) }, body });
    expect(signed.status).toBe(200);
    expect((await signed.json()).challenge).toBe('challenge-abc');
  });

  it('accepts an event and skips the ones that are not a plain user message', async () => {
    const b = await makeBinding('slack', { slackToken: 'xoxb-x', slackSecret: 'sign-me-2' });
    const url = base + '/webhook/slack/' + b.token;
    const post = async (payload: any) => {
      const body = JSON.stringify(payload);
      const ts = String(Math.floor(Date.now() / 1000));
      return fetch(url, { method: 'POST', headers: { 'content-type': 'application/json', 'x-slack-request-timestamp': ts, 'x-slack-signature': sign('sign-me-2', ts, body) }, body });
    };

    const message = await post({ type: 'event_callback', event: { type: 'message', text: 'hi', channel: 'C1' } });
    expect(message.status).toBe(200);

    // A bot's own post (including this app's reply) must not be answered.
    expect(ADAPTERS.slack.parse({ body: { type: 'event_callback', event: { type: 'message', text: 'x', channel: 'C1', bot_id: 'B1' } } })).toBeNull();
    // An edit carries a subtype; answering it would duplicate the reply.
    expect(ADAPTERS.slack.parse({ body: { type: 'event_callback', event: { type: 'message', subtype: 'message_changed', text: 'x', channel: 'C1' } } })).toBeNull();
  });
});

describe('signature checks are strict', () => {
  it('rejects a stale Slack timestamp (replay)', () => {
    const secret = 's';
    const old = String(Math.floor(Date.now() / 1000) - 4000);
    const body = Buffer.from('{"a":1}');
    const sig = 'v0=' + crypto.createHmac('sha256', secret).update('v0:' + old + ':').update(body).digest('hex');
    expect(verifySlackSignature(secret, old, body, sig)).toBe(false);
    const fresh = String(Math.floor(Date.now() / 1000));
    const freshSig = 'v0=' + crypto.createHmac('sha256', secret).update('v0:' + fresh + ':').update(body).digest('hex');
    expect(verifySlackSignature(secret, fresh, body, freshSig)).toBe(true);
    // ...and a body swapped after signing no longer matches.
    expect(verifySlackSignature(secret, fresh, Buffer.from('{"a":2}'), freshSig)).toBe(false);
  });

  it('requires the Telegram secret to be configured and to match exactly', () => {
    expect(verifyTelegramSecret({ platform: 'telegram', token: 't', tgSecret: 'abc' }, { headers: { 'x-telegram-bot-api-secret-token': 'abc' } })).toBe(true);
    expect(verifyTelegramSecret({ platform: 'telegram', token: 't', tgSecret: 'abc' }, { headers: { 'x-telegram-bot-api-secret-token': 'abd' } })).toBe(false);
    // An unconfigured secret must fail closed, not accept everything.
    expect(verifyTelegramSecret({ platform: 'telegram', token: 't' }, { headers: { 'x-telegram-bot-api-secret-token': '' } })).toBe(false);
  });
});
