import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'fs';
import db, { initDB } from '../src/utils/db';
import { escapeLike, likeContains } from '../src/utils/sqlLike';

// Search filters were inconsistent: the public post list escaped LIKE wildcards,
// the admin list / media / activity / newsletter searches did not — so typing
// "100%" or "a_b" matched far more rows than requested, and a pattern of nothing
// but wildcards degenerated into a full scan. These pin the helper and prove the
// escaping actually round-trips through SQLite (a typo in the ESCAPE clause would
// silently change the match set, not throw).
const DB_FILE = process.env.MORTAR_DB_PATH || '/tmp/mortar-vitest-sqllike.db';

beforeAll(() => {
  initDB();
  // Post.authorId is NOT NULL — the rows need a real author.
  db.prepare("INSERT INTO User (id, username, email, password, role, tokenVersion) VALUES ('u1','u1','u1@test.dev','x','admin',0)").run();
  const insert = db.prepare('INSERT INTO Post (id, title, slug, content, excerpt, status, type, authorId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
  insert.run('p1', '涨了 100% 的方案', 'p1', 'body', '', 'published', 'post', 'u1');
  insert.run('p2', '涨了 1000 的方案', 'p2', 'body', '', 'published', 'post', 'u1');
  insert.run('p3', 'a_b 命名约定', 'p3', 'body', '', 'published', 'post', 'u1');
  insert.run('p4', 'axb 命名约定', 'p4', 'body', '', 'published', 'post', 'u1');
  insert.run('p5', '反斜杠 \\ 的用法', 'p5', 'body', '', 'published', 'post', 'u1');
});

afterAll(() => {
  for (const s of ['', '-wal', '-shm']) { try { fs.unlinkSync(DB_FILE + s); } catch {} }
});

function search(term: string): string[] {
  const rows = db.prepare("SELECT id FROM Post WHERE title LIKE ? ESCAPE '\\' ORDER BY id").all(likeContains(term)) as any[];
  return rows.map(r => r.id);
}

describe('sqlLike', () => {
  it('escapes the LIKE metacharacters', () => {
    expect(escapeLike('100%')).toBe('100\\%');
    expect(escapeLike('a_b')).toBe('a\\_b');
    expect(escapeLike('c:\\dir')).toBe('c:\\\\dir');
    expect(likeContains('x')).toBe('%x%');
    expect(likeContains(undefined)).toBe('%%');
  });

  it('matches a literal percent instead of the wildcard', () => {
    // Unescaped this would also hit p2 ("1000").
    expect(search('100%')).toEqual(['p1']);
  });

  it('matches a literal underscore instead of the wildcard', () => {
    // Unescaped this would also hit p4 ("axb").
    expect(search('a_b')).toEqual(['p3']);
  });

  it('matches a literal backslash', () => {
    expect(search('\\')).toEqual(['p5']);
  });

  it('still matches plain text', () => {
    expect(search('命名')).toEqual(['p3', 'p4']);
    expect(search('nope')).toEqual([]);
  });

  it('treats a wildcard-only pattern as literal text, not a full scan', () => {
    // Before escaping these matched every row in the table.
    expect(search('%')).toEqual(['p1']);   // only the title with a literal "%"
    expect(search('_')).toEqual(['p3']);   // only the title with a literal "_"
  });
});
