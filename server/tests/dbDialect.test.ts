import { describe, it, expect } from 'vitest';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { translateMysql, translatePg, pgFmt } = require('../src/utils/dbDialect');

describe('translateMysql', () => {
  it('translates SQLite upsert to ON DUPLICATE KEY UPDATE', () => {
    const sql = 'INSERT INTO Setting (id, key, value) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value';
    expect(translateMysql(sql)).toContain('ON DUPLICATE KEY UPDATE value = VALUES(value)');
  });

  it('translates INSERT OR IGNORE to INSERT IGNORE', () => {
    expect(translateMysql('INSERT OR IGNORE INTO PostTag (postId, tagId) VALUES (?, ?)'))
      .toBe('INSERT IGNORE INTO PostTag (postId, tagId) VALUES (?, ?)');
  });

  // MySQL's own string parser consumes a lone trailing backslash, so the
  // `ESCAPE '\'` clause every LIKE search emits is a syntax error there. The
  // escaping helper (utils/sqlLike) relies on this rewrite.
  it('doubles the LIKE escape character for MySQL', () => {
    const sql = "SELECT * FROM Post WHERE title LIKE ? ESCAPE '\\'";
    expect(translateMysql(sql)).toBe("SELECT * FROM Post WHERE title LIKE ? ESCAPE '\\\\'");
    // Postgres keeps the single backslash — it is already the LIKE escape char.
    expect(translatePg(sql)).toBe("SELECT * FROM Post WHERE title LIKE $1 ESCAPE '\\'");
    // Case and spacing variants still match (the rewrite normalises to upper case).
    expect(translateMysql("a LIKE ? escape '\\'")).toBe("a LIKE ? ESCAPE '\\\\'");
  });

  it('translates strftime with a nested function call', () => {
    const sql = "SELECT slug, strftime('%Y-%m-%d', COALESCE(publishedAt, createdAt)) as date FROM Post";
    const out = translateMysql(sql);
    expect(out).toContain("DATE_FORMAT(CAST(REPLACE(REPLACE(COALESCE(publishedAt, createdAt), 'T', ' '), 'Z', '') AS DATETIME), '%Y-%m-%d')");
  });

  it('translates strftime with a plain column', () => {
    const out = translateMysql("SELECT strftime('%Y-%m', publishedAt) as month FROM Post");
    expect(out).toContain("DATE_FORMAT(CAST(REPLACE(REPLACE(publishedAt, 'T', ' '), 'Z', '') AS DATETIME), '%Y-%m')");
  });

  it('translates datetime(?) comparisons', () => {
    expect(translateMysql('WHERE reset_expires > datetime(?)'))
      .toContain("WHERE reset_expires > CAST(REPLACE(REPLACE(?, 'T', ' '), 'Z', '') AS DATETIME)");
  });

  it('translates date(\'now\') to CURDATE()', () => {
    expect(translateMysql("SELECT COALESCE(SUM(tokens),0) as t FROM AiUsage WHERE date(createdAt) = date('now')"))
      .toContain('date(createdAt) = CURDATE()');
  });

  it('converts TEXT keys/uniques to VARCHAR in DDL but keeps content TEXT', () => {
    const ddl = "CREATE TABLE IF NOT EXISTS Post (id TEXT PRIMARY KEY, name TEXT UNIQUE NOT NULL, content TEXT NOT NULL DEFAULT '')";
    const out = translateMysql(ddl);
    expect(out).toContain('id VARCHAR(191) PRIMARY KEY');
    expect(out).toContain('name VARCHAR(191) UNIQUE NOT NULL');
    expect(out).toContain("content TEXT NOT NULL DEFAULT ''");
  });
});

describe('translatePg', () => {
  it('rewrites ? placeholders to $n', () => {
    expect(translatePg('SELECT * FROM Post WHERE type = ? AND status = ? LIMIT ? OFFSET ?'))
      .toBe('SELECT * FROM Post WHERE type = $1 AND status = $2 LIMIT $3 OFFSET $4');
  });

  it('translates INSERT OR IGNORE to ON CONFLICT DO NOTHING', () => {
    expect(translatePg('INSERT OR IGNORE INTO PostTag (postId, tagId) VALUES (?, ?)'))
      .toBe('INSERT INTO PostTag (postId, tagId) VALUES ($1, $2) ON CONFLICT DO NOTHING');
  });

  it('leaves ON CONFLICT upsert untouched (native PostgreSQL)', () => {
    const sql = 'INSERT INTO Setting (id, key, value) VALUES ($1, $2, $3) ON CONFLICT(key) DO UPDATE SET value = EXCLUDED.value';
    expect(translatePg(sql)).toBe(sql);
  });

  it('translates strftime to to_char with converted format', () => {
    const out = translatePg("SELECT strftime('%Y-%m-%d', COALESCE(publishedAt, createdAt)) as date FROM Post");
    expect(out).toContain("to_char((COALESCE(publishedAt, createdAt))::timestamptz, 'YYYY-MM-DD')");
  });

  it('translates datetime(?) after placeholder rewrite', () => {
    expect(translatePg('WHERE reset_expires > datetime(?)')).toBe('WHERE reset_expires > ($1)::timestamptz');
  });

  it('translates date(\'now\') to CURRENT_DATE', () => {
    expect(translatePg("WHERE date(createdAt) = date('now')")).toContain('date(createdAt) = CURRENT_DATE');
  });
});

describe('pgFmt', () => {
  it('maps strftime specifiers to to_char specifiers', () => {
    expect(pgFmt('%Y-%m-%d')).toBe('YYYY-MM-DD');
    expect(pgFmt('%Y-%m')).toBe('YYYY-MM');
    expect(pgFmt('%H:%M')).toBe('HH24:MI');
  });
});

// Packaging guard: the worker and its translator are plain JavaScript, and the
// deployed entry point is `node dist/index.js`. tsc only emits them because
// tsconfig sets allowJs — without it a MySQL/Postgres install died at startup
// with ENOENT from new Worker(__dirname + '/dbWorker.js').
describe('build configuration', () => {
  it('emits the plain-JS worker files', () => {
    const fs = require('fs');
    const path = require('path');
    const root = path.join(__dirname, '..');
    for (const f of ['dbWorker.js', 'dbDialect.js']) {
      expect(fs.existsSync(path.join(root, 'src/utils', f)), f + ' missing').toBe(true);
    }
    const tsconfig = fs.readFileSync(path.join(root, 'tsconfig.json'), 'utf8');
    expect(tsconfig).toMatch(/"allowJs":\s*true/);
  });
});
