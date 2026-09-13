import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'fs';
import db, { initDB, cuid, withTransaction } from '../src/utils/db';

const DB_FILE = process.env.MORTAR_DB_PATH || '/tmp/mortar-vitest-tx.db';

function tagCount(slug: string): number {
  return (db.prepare('SELECT COUNT(*) AS c FROM Tag WHERE slug = ?').get(slug) as any).c;
}

beforeAll(() => { initDB(); });

afterAll(() => {
  for (const s of ['', '-wal', '-shm']) { try { fs.unlinkSync(DB_FILE + s); } catch {} }
});

describe('withTransaction', () => {
  it('commits all writes on success', () => {
    const slug = 'tx-ok-' + cuid();
    withTransaction(() => {
      db.prepare('INSERT INTO Tag (id, name, slug) VALUES (?, ?, ?)').run(cuid(), 'ok', slug);
    });
    expect(tagCount(slug)).toBe(1);
  });

  it('rolls back every write when the body throws', () => {
    const slug = 'tx-fail-' + cuid();
    expect(() => withTransaction(() => {
      db.prepare('INSERT INTO Tag (id, name, slug) VALUES (?, ?, ?)').run(cuid(), 'fail', slug);
      throw new Error('boom');
    })).toThrow('boom');
    expect(tagCount(slug)).toBe(0);
  });

  it('nested block rolls back independently (savepoint)', () => {
    const outer = 'tx-outer-' + cuid();
    const inner = 'tx-inner-' + cuid();
    withTransaction(() => {
      db.prepare('INSERT INTO Tag (id, name, slug) VALUES (?, ?, ?)').run(cuid(), 'outer', outer);
      try {
        withTransaction(() => {
          db.prepare('INSERT INTO Tag (id, name, slug) VALUES (?, ?, ?)').run(cuid(), 'inner', inner);
          throw new Error('inner-fail');
        });
      } catch { /* swallow: outer should still commit */ }
    });
    expect(tagCount(outer)).toBe(1);  // outer survived
    expect(tagCount(inner)).toBe(0);  // inner rolled back
  });

  it('rejects an async body (would commit before it resolves)', () => {
    expect(() => withTransaction((async () => { /* not awaited */ }) as any)).toThrow();
  });
});
