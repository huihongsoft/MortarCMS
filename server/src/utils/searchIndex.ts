import db from './db';

// Full-text search over posts, with LIKE as the floor.
//
// Search used to be `title LIKE '%term%'` with a leading wildcard: no index can
// serve that, so every search scanned the whole table, and "relevance" was a
// hand-rolled CASE that only ranked a title hit above a body hit. SQLite's FTS5
// with the **trigram** tokenizer replaces it — trigram rather than the default
// unicode61 because this CMS publishes CJK content, and unicode61 has no word
// boundaries to find in Chinese.
//
// Two consequences worth knowing:
//   * A trigram index cannot answer a term shorter than three characters, so
//     short queries (and any 2-character CJK word — a very common length) fall
//     back to LIKE rather than silently returning nothing.
//   * FTS5 exists only on SQLite. MySQL and PostgreSQL keep the LIKE path, which
//     is why this returns null instead of throwing there.
//
// The index is maintained by triggers (migration 23), so no write path has to
// remember to update it — including the bulk operations.

let available: boolean | null = null;

/** True when a usable FTS index is present. Probed once per process. */
export function ftsAvailable(): boolean {
  if (available !== null) return available;
  if (db.driver !== 'sqlite') { available = false; return available; }
  try {
    available = !!db.prepare("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'PostSearch'").get();
  } catch {
    available = false;
  }
  return available;
}

/** Test seam: forget the probe result. */
export function resetSearchIndexProbe(): void { available = null; }

/** The shortest term the trigram index can answer. */
export const MIN_FTS_TERM = 3;

/**
 * An FTS5 MATCH expression for `term`, or null when the caller should use LIKE.
 *
 * Each whitespace-separated word becomes a quoted phrase and the phrases are
 * space-separated, which FTS5 reads as AND — "theme css" finds documents
 * containing both, in any order, matching what users expect from a search box.
 * Every term is quoted, so FTS5 syntax (`"`, `*`, `:`, `-`, `NEAR`) can only ever
 * be searched for, never interpreted.
 */
export function buildMatchQuery(term: unknown): string | null {
  if (!ftsAvailable()) return null;
  const words = String(term ?? '').trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return null;
  // Below the trigram floor FTS would match nothing at all, so hand it to LIKE.
  if (words.some((w) => w.length < MIN_FTS_TERM)) return null;
  return words.map((w) => '"' + w.replace(/"/g, '""') + '"').join(' ');
}

/** The JOIN + MATCH fragment the post queries append, given a match expression. */
export function matchJoin(): string {
  return ' JOIN PostSearch ON PostSearch.postId = p.id';
}

// No alias on purpose: MATCH's left side must be a column, and the only column
// that carries the match is FTS5's hidden one, named after the table. Both
// `ps MATCH ?` and `ps.PostSearch MATCH ?` fail with "no such column: ps"
// (checked against the SQLite 3.53 this ships with).
export function matchClause(): string {
  return ' PostSearch MATCH ?';
}

/** Relevance ordering: bm25 is smaller-is-better, so ASC. */
export function matchOrder(): string {
  return 'bm25(PostSearch)';
}
