import db, { cuid } from './db';
import { logger } from './logger';
import { getProviders, getDefaultProvider, AIProvider } from './ai';

// Semantic retrieval.
//
// Vectors come from an OpenAI-compatible `/embeddings` endpoint, so they reuse
// the provider configuration and the same budget the rest of the AI features
// use — no second integration to maintain, and a local Ollama endpoint works
// the same way. They are stored base64-encoded (one portable column, no binary
// dialect differences) and compared in-process.
//
// The comparison is a linear scan. That is a deliberate trade: a site with a few
// thousand posts costs a few tens of milliseconds per query, and it avoids both
// a native extension (sqlite-vec) and a vector database — neither of which
// belongs in a self-hosted install that must run on SQLite, MySQL and Postgres
// alike. If a site outgrows it, `nearestByVector` is the one function to replace.

export interface EmbeddingProvider { provider: AIProvider; model: string; }

// Configured by an admin: the model name is the switch. Empty = the feature is
// off, and every caller falls back to whatever it did before.
export function embeddingConfig(): EmbeddingProvider | null {
  try {
    const model = String((db.prepare("SELECT value FROM Setting WHERE key = 'ai_embedding_model'").get() as any)?.value || '').trim();
    if (!model) return null;
    const wantedId = String((db.prepare("SELECT value FROM Setting WHERE key = 'ai_embedding_provider'").get() as any)?.value || '');
    const provider = (wantedId && getProviders().find(p => p.id === wantedId && p.enabled)) || getDefaultProvider();
    if (!provider) return null;
    return { provider, model };
  } catch { return null; }
}

export function embeddingsEnabled(): boolean {
  return embeddingConfig() !== null;
}

function toBase64(vec: number[]): string {
  return Buffer.from(new Float32Array(vec).buffer).toString('base64');
}
function fromBase64(b64: string): Float32Array {
  const buf = Buffer.from(b64, 'base64');
  // Copy into a fresh buffer: Buffer's backing store is pooled and may be offset.
  return new Float32Array(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
}

export function cosine(a: Float32Array, b: Float32Array): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) { dot += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i]; }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

// One embedding call. Throws on failure; callers decide whether to care — the
// embedding of a post is never on a user's critical path.
export async function embedText(text: string): Promise<number[]> {
  const cfg = embeddingConfig();
  if (!cfg) throw new Error('未配置向量模型');
  const body = JSON.stringify({ model: cfg.model, input: text.slice(0, 8000) });
  const res = await fetch(cfg.provider.baseUrl.replace(/\/+$/, '') + '/embeddings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + cfg.provider.apiKey },
    // Bounded like every other outbound AI call: a hung endpoint must not hold a
    // scheduler tick open indefinitely.
    signal: AbortSignal.timeout(30_000),
    body,
  });
  if (!res.ok) throw new Error('向量请求失败 (' + res.status + ')');
  const j: any = await res.json().catch(() => null);
  const vec = j?.data?.[0]?.embedding;
  if (!Array.isArray(vec) || vec.length === 0) throw new Error('向量服务未返回向量');
  return vec.map(Number);
}

// What a post's vector is made of. Title and excerpt carry most of the meaning
// for short posts, so they lead; the body is capped because cost grows with it.
export function postEmbeddingText(post: { title?: string; excerpt?: string; content?: string }): string {
  const plain = String(post.content || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  return [post.title || '', post.excerpt || '', plain].filter(Boolean).join('\n').slice(0, 4000);
}

function hashText(text: string): string {
  // Content hash, not a timestamp: re-embedding only when the text actually
  // changed is what keeps a nightly pass cheap.
  return require('crypto').createHash('sha256').update(text).digest('hex').slice(0, 32);
}

export async function embedPost(postId: string): Promise<boolean> {
  // Nothing to do when the feature is off — a caller asking to embed a post on
  // an install without a model is not an error, it is a no-op.
  if (!embeddingsEnabled()) return false;
  const post = db.prepare('SELECT id, title, excerpt, content FROM Post WHERE id = ?').get(postId) as any;
  if (!post) return false;
  const text = postEmbeddingText(post);
  if (!text) return false;
  const hash = hashText(text);
  const existing = db.prepare('SELECT hash FROM PostEmbedding WHERE postId = ?').get(postId) as any;
  if (existing?.hash === hash) return false;

  const vec = await embedText(text);
  db.prepare('INSERT INTO PostEmbedding (id, postId, model, dims, vector, hash, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?) ON CONFLICT(postId) DO UPDATE SET model = excluded.model, dims = excluded.dims, vector = excluded.vector, hash = excluded.hash, createdAt = excluded.createdAt')
    .run(cuid(), postId, embeddingConfig()?.model || '', vec.length, toBase64(vec), hash, new Date().toISOString());
  return true;
}

export function forgetEmbedding(postId: string): void {
  try { db.prepare('DELETE FROM PostEmbedding WHERE postId = ?').run(postId); } catch { /* best effort */ }
}

// Posts closest to this one, by meaning rather than by shared keywords. Returns
// [] when nothing has been embedded yet, so a caller can fall back.
export function nearestPosts(postId: string, limit = 5): string[] {
  try {
    const rows = db.prepare('SELECT postId, vector, dims FROM PostEmbedding WHERE postId <> ?').all(postId) as any[];
    const mineRow = db.prepare('SELECT vector, dims FROM PostEmbedding WHERE postId = ?').get(postId) as any;
    if (!mineRow || rows.length === 0) return [];
    const mine = fromBase64(mineRow.vector);
    return rows
      .map(r => ({ id: r.postId, score: cosine(mine, fromBase64(r.vector)) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(r => r.id);
  } catch (e: any) {
    logger.warn({ err: e?.message }, 'nearest posts failed; falling back');
    return [];
  }
}

// Closest posts to an arbitrary query — semantic search. `where` lets the caller
// apply the visibility rules (published, site, not members-only) to the results;
// it is applied AFTER ranking, so the ranking is over everything embedded and the
// caller decides what may be shown.
export async function searchByVector(query: string, limit = 10): Promise<{ postId: string; score: number }[]> {
  const vec = await embedText(query);
  const q = new Float32Array(vec);
  const rows = db.prepare('SELECT postId, vector FROM PostEmbedding').all() as any[];
  return rows
    .map(r => ({ postId: r.postId, score: cosine(q, fromBase64(r.vector)) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.max(1, Math.min(limit, 50)));
}
