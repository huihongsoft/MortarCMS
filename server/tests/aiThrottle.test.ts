import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'fs';
import express from 'express';
import db, { initDB } from '../src/utils/db';
import { signToken } from '../src/utils/jwt';
import aiRoutes from '../src/routes/ai';

// The chat client compresses a long conversation and then sends the next message
// back to back. Both endpoints used to share one per-user throttle slot, so the
// message came back as "请求太频繁，请稍等几秒再试" — and the retry button could only
// fail again. They are keyed per operation now.
//
// Kept in its own file: the throttle and usage-limit caches are module state, and
// vitest isolates modules per file.
const DB_FILE = process.env.MORTAR_DB_PATH || '/tmp/mortar-vitest-ai-throttle.db';
let server: any;
let base = '';

beforeAll(async () => {
  initDB();
  db.prepare("INSERT OR REPLACE INTO User (id, username, email, password, role, tokenVersion) VALUES ('ad','ad','ad@example.dev','x','admin',0)").run();
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

const asAdmin = { authorization: 'Bearer ' + signToken({ userId: 'ad', role: 'admin', v: 0 }), 'content-type': 'application/json' };
const post = (path: string, body: any) => fetch(base + path, { method: 'POST', headers: asAdmin, body: JSON.stringify(body) });

describe('per-operation throttle', () => {
  it('does not turn away the chat message that follows a history summary', async () => {
    const summary = await post('/summarize', { text: 'a long conversation history' });
    // No provider is configured in this test, so both requests stop at 400. The
    // point is that the second one was not rejected by the throttle.
    expect(summary.status).toBe(400);

    const assistant = await post('/assistant', { message: '你好' });
    const body = await assistant.json();
    expect(assistant.status, JSON.stringify(body)).toBe(400);
    expect(String(body.error || '')).not.toMatch(/太频繁/);
  });

  it('still guards a rapid repeat of the same operation', async () => {
    // Let the window from the previous test lapse so this call claims the slot.
    await new Promise((r) => setTimeout(r, 2100));
    await post('/assistant', { message: 'a' });
    const again = await post('/assistant', { message: 'b' });
    const body = await again.json();
    expect(again.status, JSON.stringify(body)).toBe(429);
    expect(String(body.error)).toMatch(/太频繁/);
  });

  it('does not let a summary block a later one, nor share the slot with a chat', async () => {
    await new Promise((r) => setTimeout(r, 2100));
    const first = await post('/summarize', { text: 'one' });
    expect(first.status).toBe(400); // claimed the summarize slot
    const chat = await post('/assistant', { message: 'hi' });
    expect(chat.status).toBe(400); // different slot -> not throttled
  });
});
