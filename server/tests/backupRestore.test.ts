import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { execFileSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import db, { initDB, runMigrations, DB_PATH } from '../src/utils/db';
import { UPLOADS_DIR } from '../src/utils/paths';
import { createBackupArchive, listBackups, pruneBackups } from '../src/utils/backup';
import { snapshotDatabaseFile } from '../src/utils/dbSnapshot';

// The scheduled backup used to copy only the SQLite file, so a restore brought
// the content back with every uploaded image missing; retention sorted by name
// (random suffix inside the same day) instead of by age; and an upgrade applied
// irreversible migrations without any way back. These pin all three.
function haveTool(t: string): boolean {
  try { execFileSync('which', [t], { stdio: 'ignore' }); return true; } catch { return false; }
}
const ready = haveTool('tar');

let tmp = '';
let uploadFile = '';

beforeAll(() => {
  initDB();
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mortar-backup-test-'));
  // A file that a full backup must carry alongside the database.
  uploadFile = 'a4-test-' + process.pid + '.jpg';
  fs.writeFileSync(path.join(UPLOADS_DIR, uploadFile), Buffer.alloc(64, 9));
});

afterAll(() => {
  try { fs.rmSync(tmp, { recursive: true, force: true }); } catch { /* best effort */ }
  try { fs.unlinkSync(path.join(UPLOADS_DIR, uploadFile)); } catch { /* best effort */ }
});

describe.skipIf(!ready)('backup archives', () => {
  it('writes a database + uploads archive', async () => {
    const entry = await createBackupArchive({ dir: tmp });
    expect(entry.name).toMatch(/^mortar-.*\.tar\.gz$/);
    expect(fs.existsSync(entry.path)).toBe(true);
    expect(entry.bytes).toBeGreaterThan(0);

    const listing = execFileSync('tar', ['-tzf', entry.path], { encoding: 'utf8' })
      .split('\n').map((l) => l.replace(/^\.\//, '')).filter(Boolean);
    expect(listing).toContain('mortar.db');
    expect(listing).toContain(uploadFile);
    // Derived data: regenerated on demand, so it must not bloat every backup.
    expect(listing.some((f) => f.startsWith('thumbs/'))).toBe(false);

    // The database inside the archive is a real SQLite file.
    const out = path.join(tmp, 'extract');
    fs.mkdirSync(out, { recursive: true });
    execFileSync('tar', ['-xzf', entry.path, '-C', out]);
    const header = fs.readFileSync(path.join(out, 'mortar.db')).subarray(0, 16).toString('latin1');
    expect(header).toBe('SQLite format 3\0');
  });

  it('can skip uploads when only the database is wanted', async () => {
    const entry = await createBackupArchive({ dir: tmp, includeUploads: false });
    const listing = execFileSync('tar', ['-tzf', entry.path], { encoding: 'utf8' });
    expect(listing).toContain('mortar.db');
    expect(listing).not.toContain(uploadFile);
  });
});

describe('backup retention', () => {
  // Names are not sortable: the scheduled task embedded a random suffix, so two
  // backups from the same day sorted arbitrarily and the "oldest" pick could
  // delete a recent one. Order must come from the file's age.
  it('drops the oldest by mtime, not by name', () => {
    const dir = fs.mkdtempSync(path.join(tmp, 'retention-'));
    const old = path.join(dir, 'mortar-2030-12-31-zzzz.db');   // sorts LAST, is oldest
    const mid = path.join(dir, 'mortar-2000-01-01-aaaa.db');   // sorts FIRST
    const fresh = path.join(dir, 'mortar-2026-06-06-mmmm.db');
    for (const f of [old, mid, fresh]) fs.writeFileSync(f, 'x');
    const now = Date.now();
    fs.utimesSync(old, new Date(now - 300000), new Date(now - 300000));
    fs.utimesSync(mid, new Date(now - 200000), new Date(now - 200000));
    fs.utimesSync(fresh, new Date(now - 100000), new Date(now - 100000));

    expect(listBackups(dir).map((e) => e.name)).toEqual([
      'mortar-2030-12-31-zzzz.db', 'mortar-2000-01-01-aaaa.db', 'mortar-2026-06-06-mmmm.db',
    ]);

    expect(pruneBackups(2, dir)).toBe(1);
    const left = fs.readdirSync(dir).sort();
    expect(left).not.toContain('mortar-2030-12-31-zzzz.db'); // the oldest went
    expect(left).toContain('mortar-2000-01-01-aaaa.db');     // despite sorting first
    expect(left).toContain('mortar-2026-06-06-mmmm.db');
  });

  it('never prunes below one archive', () => {
    const dir = fs.mkdtempSync(path.join(tmp, 'retention-floor-'));
    fs.writeFileSync(path.join(dir, 'mortar-a.db'), 'x');
    expect(pruneBackups(0, dir)).toBe(0);
    expect(fs.readdirSync(dir)).toHaveLength(1);
  });
});

describe('pre-migration snapshots', () => {
  it('copies the database and trims old snapshots', () => {
    const dir = fs.mkdtempSync(path.join(tmp, 'snapshots-'));
    const first = snapshotDatabaseFile('v18', DB_PATH, dir);
    expect(first).toBeTruthy();
    expect(fs.readFileSync(first as string).subarray(0, 16).toString('latin1')).toBe('SQLite format 3\0');

    for (let i = 0; i < 7; i++) {
      const f = snapshotDatabaseFile('v' + i, DB_PATH, dir);
      // Space the mtimes so the trim order is deterministic.
      if (f) fs.utimesSync(f, new Date(Date.now() - (100 - i) * 1000), new Date(Date.now() - (100 - i) * 1000));
    }
    const kept = fs.readdirSync(dir).filter((f) => f.startsWith('pre-migration-'));
    expect(kept.length).toBe(5);
  });

  it('returns null instead of throwing when there is no database file', () => {
    const dir = fs.mkdtempSync(path.join(tmp, 'snapshots-missing-'));
    expect(snapshotDatabaseFile('v1', path.join(dir, 'nope.db'), dir)).toBeNull();
  });

  // The wiring, not just the helper: runMigrations must take the snapshot before
  // it applies anything. Simulated by dropping the newest ledger row, which is
  // what a pending upgrade looks like to the server on boot.
  it('is taken by the migration runner before applying a pending migration', () => {
    const dir = fs.mkdtempSync(path.join(tmp, 'migration-run-'));
    process.env.MORTAR_BACKUPS_DIR = dir;
    try {
      db.prepare('DELETE FROM _SchemaMigration WHERE version = 18').run();
      runMigrations();
      const snapshots = fs.readdirSync(dir).filter((f) => f.startsWith('pre-migration-v18-'));
      expect(snapshots).toHaveLength(1);
      // The migration still ran (and is idempotent, as every migration must be).
      const applied = db.prepare('SELECT version FROM _SchemaMigration WHERE version = 18').get();
      expect(applied).toBeTruthy();
    } finally {
      delete process.env.MORTAR_BACKUPS_DIR;
    }
  });
});
