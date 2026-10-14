import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import fs from 'fs';
import http from 'http';
import express from 'express';
import db, { initDB } from '../src/utils/db';
import { signToken } from '../src/utils/jwt';
import { saveProviders } from '../src/utils/ai';
import postsRoutes from '../src/routes/posts';
import aiRoutes from '../src/routes/ai';
import { registerBuiltinTasks, runTaskNow } from '../src/utils/scheduler';
import { embedPost, nearestPosts, cosine, embeddingsEnabled } from '../src/utils/embeddings';
import { retrieveSiteContent, executeTool } from '../src/utils/aiTools';

// Semantic retrieval: vectors from an OpenAI-compatible /embeddings endpoint,
// stored per post and compared in-process. The interesting behaviours are the
// fallbacks — no model configured, nothing embedded yet, a provider that fails —
// and the rule that a private or unpublished post never occupies a result slot.

const DB_FILE = process.env.MORTAR_DB_PATH || '/tmp/mortar-vitest-embeddings.db';

let server: any;
let base = '';
let providerSrv: http.Server;
let providerBase = '';
// The fake embedder maps the FIRST marker word it finds in the text to a vector,
// so "similar meaning" is something the test controls.
const AXES: Record<string, number[]> = {
  '[[CAT]]': [1, 0, 0],
  '[[DOG]]': [0.98, 0.2, 0],
  '[[SQL]]': [0, 1, 0],
  // A synonym for the CAT axis, so a query can express the meaning WITHOUT any
  // word that appears in the post — the only way to prove retrieval is semantic.
  '猫咪': [1, 0, 0],
};
let embedCalls = 0;
let embedStatus = 200;
// What the mock answers on /chat/completions (complete_post calls the model).
let chatReply = '';

function vectorFor(text: string): number[] {
  for (const [marker, vec] of Object.entries(AXES)) if (text.includes(marker)) return vec;
  return [0, 0, 1];
}

beforeAll(async () => {
  initDB();
  db.prepare("INSERT OR REPLACE INTO User (id, username, email, password, role, tokenVersion) VALUES ('u1','u1','u1@example.dev','x','admin',0)").run();
  providerSrv = http.createServer((req, res) => {
    let raw = '';
    req.on('data', c => { raw += c; });
    req.on('end', () => {
      if (String(req.url).endsWith('/chat/completions')) {
        res.writeHead(200, { 'content-type': 'application/json' });
        res.end(JSON.stringify({ choices: [{ message: { role: 'assistant', content: chatReply } }] }));
        return;
      }
      if (!String(req.url).endsWith('/embeddings')) { res.writeHead(404).end(); return; }
      embedCalls++;
      if (embedStatus !== 200) { res.writeHead(embedStatus).end('nope'); return; }
      const input = String(JSON.parse(raw || '{}').input || '');
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ data: [{ embedding: vectorFor(input) }] }));
    });
  });
  await new Promise<void>(r => providerSrv.listen(0, '127.0.0.1', () => r()));
  providerBase = 'http://127.0.0.1:' + (providerSrv.address() as any).port + '/v1';
  saveProviders([{ id: 'p1', name: 'Mock', type: 'openai', baseUrl: providerBase, model: 'm', apiKey: 'k', enabled: true } as any]);

  const app = express();
  app.use(express.json());
  app.use('/api/posts', postsRoutes);
  app.use('/api/ai', aiRoutes);
  server = app.listen(0);
  await new Promise(r => server.on('listening', r));
  base = 'http://127.0.0.1:' + server.address().port + '/api';
  registerBuiltinTasks();
});

afterAll(() => {
  server?.close();
  providerSrv?.close();
  for (const s of ['', '-wal', '-shm']) { try { fs.unlinkSync(DB_FILE + s); } catch {} }
});

beforeEach(() => {
  embedCalls = 0;
  embedStatus = 200;
  chatReply = '';
  db.prepare('DELETE FROM Post').run();
  db.prepare('DELETE FROM PostEmbedding').run();
  db.prepare('DELETE FROM PostMeta').run();
  db.prepare("DELETE FROM Setting WHERE key IN ('ai_embedding_model','ai_embedding_provider')").run();
});

function setModel(model = 'test-embed') {
  db.prepare("INSERT OR REPLACE INTO Setting (id, key, value) VALUES ('ai_embedding_model','ai_embedding_model',?)").run(model);
}
function addPost(id: string, text: string, opts: { status?: string; title?: string } = {}) {
  db.prepare("INSERT INTO Post (id, title, slug, content, status, type, authorId, publishedAt) VALUES (?, ?, ?, ?, ?, 'post', 'u1', ?)")
    .run(id, opts.title || id, id, '<p>' + text + '</p>', opts.status || 'published', new Date(Date.now() - 60_000).toISOString());
}
const relatedIds = async (id: string) => (await (await fetch(base + '/posts/' + id + '/related')).json()).map((p: any) => p.id);

describe('the vector store', () => {
  it('stays off until a model is named', async () => {
    expect(embeddingsEnabled()).toBe(false);
    addPost('a', '[[CAT]]');
    expect(await embedPost('a')).toBe(false);
    expect(embedCalls).toBe(0);
  });

  it('embeds once and skips an unchanged post', async () => {
    setModel();
    addPost('a', '[[CAT]]');
    expect(await embedPost('a')).toBe(true);
    expect(await embedPost('a')).toBe(false);   // same text, same hash
    expect(embedCalls).toBe(1);
    // ...and re-embeds when the text changes.
    db.prepare("UPDATE Post SET content = '<p>[[DOG]]</p>' WHERE id = 'a'").run();
    expect(await embedPost('a')).toBe(true);
    expect(embedCalls).toBe(2);
  });

  it('compares by meaning: the near vector wins over the far one', async () => {
    setModel();
    addPost('cat', '[[CAT]]');
    addPost('dog', '[[DOG]]');
    addPost('sql', '[[SQL]]');
    for (const id of ['cat', 'dog', 'sql']) await embedPost(id);
    expect(nearestPosts('cat', 2)).toEqual(['dog', 'sql']);
    expect(cosine(new Float32Array([1, 0, 0]), new Float32Array([0.98, 0.2, 0]))).toBeGreaterThan(0.9);
  });

  it('drops embeddings of posts that no longer exist', async () => {
    setModel();
    addPost('gone', '[[CAT]]');
    await embedPost('gone');
    db.prepare("DELETE FROM Post WHERE id = 'gone'").run();
    const r = await runTaskNow('embed_posts');
    expect(r.result).toMatchObject({ pruned: 1 });
    expect((db.prepare('SELECT COUNT(*) as c FROM PostEmbedding').get() as any).c).toBe(0);
  });

  it('does nothing when the embedding model is not configured', async () => {
    const r = await runTaskNow('embed_posts');
    expect(r.result).toMatchObject({ code: 'embeddings not configured' });
    expect(embedCalls).toBe(0);
  });
});

describe('related posts', () => {
  beforeEach(() => {
    setModel();
    addPost('cat', '[[CAT]]', { title: 'Cat' });
    addPost('dog', '[[DOG]]', { title: 'Dog' });
    addPost('sql', '[[SQL]]', { title: 'Sql' });
  });

  it('falls back to categories when nothing is embedded', async () => {
    db.prepare("INSERT INTO Category (id, name, slug) VALUES ('c1','c','c')").run();
    db.prepare("INSERT INTO PostCategory (postId, categoryId) VALUES ('cat','c1')").run();
    db.prepare("INSERT INTO PostCategory (postId, categoryId) VALUES ('sql','c1')").run();
    expect(await relatedIds('cat')).toEqual(['sql']);   // category, not meaning
  });

  it('uses meaning once the index exists', async () => {
    for (const id of ['cat', 'dog', 'sql']) await embedPost(id);
    // Ranked by meaning: the near neighbour first, the unrelated one after it.
    // The endpoint offers up to four, so "sql" being present is correct — only
    // its position is the assertion.
    expect(await relatedIds('cat')).toEqual(['dog', 'sql']);
  });

  it('never puts an unpublished or gated post in a slot', async () => {
    addPost('draft', '[[CAT]]', { status: 'draft' });
    addPost('gated', '[[CAT]]');
    db.prepare("INSERT INTO PostMeta (id, postId, key, value) VALUES ('pm1','gated','_members_only','1')").run();
    for (const id of ['cat', 'dog', 'sql', 'draft', 'gated']) await embedPost(id);

    const ids = await relatedIds('cat');
    expect(ids).not.toContain('draft');
    expect(ids).not.toContain('gated');
    // The visible neighbour still gets its slot.
    expect(ids).toContain('dog');
  });
});

// The assistant's own retrieval: what it uses to answer "have we written about
// X", and what an MCP client gets through the same tool.
describe('site retrieval for the assistant', () => {
  const ctx = { userId: 'u1', role: 'admin' };
  beforeEach(() => {
    setModel();
    addPost('cat', '[[CAT]]', { title: 'A cat' });
    addPost('sql', '[[SQL]]', { title: 'A query' });
  });

  it('finds a post by meaning when not one word matches', async () => {
    await embedPost('cat');
    await embedPost('sql');
    const out = await retrieveSiteContent('猫咪', ctx, 3);
    expect(out.map((r: any) => r.title)[0]).toBe('A cat');
    // Citable: the answer can link to what it used.
    expect(out[0].url).toContain('cat');
    expect(out[0].snippet.length).toBeGreaterThan(0);
  });

  it('still puts an exact keyword hit first', async () => {
    await embedPost('cat');
    await embedPost('sql');
    const out = await retrieveSiteContent('sql', ctx, 3);
    expect(out.map((r: any) => r.title)[0]).toBe('A query');
  });

  it('is the keyword search it always was without an embedding model', async () => {
    db.prepare("DELETE FROM Setting WHERE key = 'ai_embedding_model'").run();
    expect((await retrieveSiteContent('猫咪', ctx, 3))).toEqual([]);   // no keyword hit
    expect((await retrieveSiteContent('query', ctx, 3)).map((r: any) => r.title)).toEqual(['A query']);
  });
});

describe('internal links added by complete_post', () => {
  const ctx = { userId: 'u1', role: 'admin' };

  beforeEach(() => {
    setModel();
    // No shared word with the neighbour, so only meaning can connect them.
    addPost('main', '<p>关于猫咪的一切</p>', { title: '养猫笔记' });
    addPost('near', '[[CAT]]', { title: 'Feline care' });
  });

  it('links a semantically close post that shares no keyword', async () => {
    chatReply = '摘要：一段摘要';
    await embedPost('main');
    await embedPost('near');
    const out: any = await executeTool('complete_post', { id: 'main' }, ctx);
    expect(out.error).toBeUndefined();
    const content = (db.prepare("SELECT content FROM Post WHERE id = 'main'").get() as any).content;
    expect(content).toContain('related-reading');
    expect(content).toContain('Feline care');
  });

  it('never links a post a reader cannot open', async () => {
    chatReply = '摘要：一段摘要';
    db.prepare("INSERT INTO PostMeta (id, postId, key, value) VALUES ('pmx','near','_members_only','1')").run();
    await embedPost('main');
    await embedPost('near');
    await executeTool('complete_post', { id: 'main' }, ctx);
    const content = (db.prepare("SELECT content FROM Post WHERE id = 'main'").get() as any).content;
    expect(content).not.toContain('Feline care');
  });
});

describe('semantic search', () => {
  beforeEach(() => {
    setModel();
    addPost('cat', '[[CAT]]', { title: 'A cat' });
    addPost('sql', '[[SQL]]', { title: 'A query' });
  });

  it('answers with the closest post even when no word matches', async () => {
    for (const id of ['cat', 'sql']) await embedPost(id);
    const body = await (await fetch(base + '/posts/semantic?q=' + encodeURIComponent('[[CAT]]'))).json();
    expect(body.semantic).toBe(true);
    expect(body.posts.map((p: any) => p.id)[0]).toBe('cat');
  });

  it('says so instead of guessing when there is no model', async () => {
    db.prepare("DELETE FROM Setting WHERE key = 'ai_embedding_model'").run();
    const body = await (await fetch(base + '/posts/semantic?q=anything')).json();
    expect(body).toEqual({ posts: [], semantic: false });
  });

  it('answers "no semantic results" rather than failing when the provider does', async () => {
    for (const id of ['cat', 'sql']) await embedPost(id);
    embedStatus = 500;
    const r = await fetch(base + '/posts/semantic?q=anything');
    expect(r.status).toBe(200);
    expect(await r.json()).toEqual({ posts: [], semantic: false });
  });
});
