import fs from 'fs';
import path from 'path';
import { logger } from './logger';

// A plain file copy of the SQLite database, taken before an upgrade applies
// migrations. Deliberately free of any import from `db.ts`: `db.ts` imports this
// module to take the snapshot while it is initializing, so a dependency back on
// the database handle would be a cycle.
//
// Migrations are forward-only (there is no `down()`), which makes this the only
// way back after a bad upgrade — see docs/upgrade-rollback.md.

export const PRE_MIGRATION_RE = /^pre-migration-.*\.db$/;

/** Keep at most this many snapshots; older ones are dropped. */
const SNAPSHOTS_KEPT = 5;

/**
 * Where backup archives and pre-migration snapshots live. `server/backups` by
 * default; `MORTAR_BACKUPS_DIR` points it at another volume, which is what you
 * want when backups belong on different storage than the database (and what
 * lets tests write somewhere disposable). Read per call, not at module load.
 */
export function backupsRoot(): string {
  return process.env.MORTAR_BACKUPS_DIR || path.join(__dirname, '..', '..', 'backups');
}

/**
 * Copy `dbPath` to `backups/pre-migration-<label>-<timestamp>.db` and trim old
 * snapshots. Returns the snapshot path, or null when the copy could not be made
 * (a missing file on a fresh install, a read-only volume) — the caller must
 * treat that as non-fatal, an upgrade is not blocked by a failed safety net, but
 * it is logged.
 */
export function snapshotDatabaseFile(label: string, dbPath: string, dir = backupsRoot()): string | null {
  try {
    if (!fs.existsSync(dbPath)) return null;
    fs.mkdirSync(dir, { recursive: true });
    const dest = path.join(dir, 'pre-migration-' + label + '-' + new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19) + '.db');
    fs.copyFileSync(dbPath, dest);
    const snapshots = fs.readdirSync(dir)
      .filter((n) => PRE_MIGRATION_RE.test(n))
      .map((n) => {
        try { return { n, t: fs.statSync(path.join(dir, n)).mtimeMs }; } catch { return { n, t: 0 }; }
      })
      .sort((a, b) => a.t - b.t);
    while (snapshots.length > SNAPSHOTS_KEPT) {
      const oldest = snapshots.shift()!;
      try { fs.unlinkSync(path.join(dir, oldest.n)); } catch {}
    }
    return dest;
  } catch (err: any) {
    logger.warn({ err: err?.message, label }, 'pre-migration snapshot failed');
    return null;
  }
}
