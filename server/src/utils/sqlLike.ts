// LIKE-wildcard escaping, shared by every search filter.
//
// Three copies of this had grown independently (posts.ts twice, themes.ts once)
// while the admin posts list, media, activity and newsletter searches did not
// escape at all — so searching for "100%" or "a_b" matched far more rows than
// the user typed, and a pattern of only wildcards ("%%%") degenerates into a
// full scan.
//
// Always pair this with `ESCAPE '\'` in the SQL. dbDialect rewrites that literal
// to `ESCAPE '\\'` for MySQL, whose own string parser would otherwise consume a
// lone backslash and break the statement.

/** Escape the LIKE metacharacters `\`, `%` and `_` so they match literally. */
export function escapeLike(value: unknown): string {
  return String(value ?? '').replace(/[\\%_]/g, (c) => '\\' + c);
}

/** `%escaped%` — the pattern for a "contains" search. */
export function likeContains(value: unknown): string {
  return '%' + escapeLike(value) + '%';
}
