import fs from 'fs';
import path from 'path';
import { execFile } from 'child_process';
import db, { DB_PATH } from './db';
import { UPLOADS_DIR } from './paths';
import { logger } from './logger';
import { backupsRoot } from './dbSnapshot';

// Backup archives and their retention.
//
// The scheduled task used to copy only the SQLite file, so a restore brought the
// content back but left every uploaded image missing. Archives now carry the
// database *and* uploads.
//
// Format is tar.gz, not zip: `tar` ships with every base image we target (Debian
// slim pulls it in with dpkg) while `zip`/`unzip` do not — the zip-based manual
// download and plugin installs need those binaries installed explicitly (see the
// runtime stage of the Dockerfile). A backup that silently cannot be written is
// worse than a slower one.
//
// Retention is by mtime, not by filename: names embed a random suffix
// (`Date.now().toString(36).slice(-4)`, which wraps), so sorting names made the
// "oldest" pick arbitrary within the same day.

export interface BackupEntry {
  name: string;
  path: string;
  bytes: number;
  mtimeMs: number;
}

/**
 * `server/backups` by default — outside `data/` so a DB reset cannot take the
 * backups with it — or `MORTAR_BACKUPS_DIR` when backups belong on a separate
 * volume. Shared with utils/dbSnapshot so archives and pre-migration snapshots
 * always land in the same place.
 */
export function backupsDir(): string {
  return backupsRoot();
}

const ARCHIVE_RE = /^mortar-.*\.(tar\.gz|db|zip)$/;

/** Every backup archive we manage, oldest first. */
export function listBackups(dir = backupsDir()): BackupEntry[] {
  let names: string[];
  try { names = fs.readdirSync(dir); } catch { return []; }
  return names
    .filter((n) => ARCHIVE_RE.test(n))
    .map((name) => {
      const full = path.join(dir, name);
      let st: fs.Stats;
      try { st = fs.statSync(full); } catch { return null; }
      return { name, path: full, bytes: st.size, mtimeMs: st.mtimeMs };
    })
    .filter((e): e is BackupEntry => !!e)
    .sort((a, b) => a.mtimeMs - b.mtimeMs);
}

/**
 * Keep the newest `retention` archives, delete the rest. Returns how many were
 * removed. `pre-migration-*` snapshots are not covered by `ARCHIVE_RE` — they
 * are capped separately in utils/dbSnapshot.ts, so a pruning run cannot throw
 * away the safety net an upgrade just created.
 */
export function pruneBackups(retention: number, dir = backupsDir()): number {
  const keep = Math.max(1, retention);
  const files = listBackups(dir);
  let removed = 0;
  while (files.length > keep) {
    const oldest = files.shift()!;
    try { fs.unlinkSync(oldest.path); removed++; }
    catch (err: any) { logger.warn({ err: err?.message, file: oldest.name }, 'backup prune failed'); }
  }
  return removed;
}

function execFileAsync(cmd: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    execFile(cmd, args, { maxBuffer: 1024 * 1024 }, (err, _stdout, stderr) => {
      if (err) reject(new Error(cmd + ': ' + (stderr || err.message)));
      else resolve();
    });
  });
}

function stamp(): string {
  return new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
}

/**
 * Write `mortar-<timestamp>.tar.gz` containing `mortar.db` at the archive root
 * plus every uploaded file (flat, matching what `/api/db/restore-full` expects).
 * Thumbnails and the import scratch directory are skipped — they are derived
 * data that the media routes regenerate on demand.
 */
export async function createBackupArchive(opts: { includeUploads?: boolean; dir?: string } = {}): Promise<BackupEntry> {
  const dir = opts.dir || backupsDir();
  fs.mkdirSync(dir, { recursive: true });
  const includeUploads = opts.includeUploads !== false;
  const name = 'mortar-' + stamp() + '.tar.gz';
  const dest = path.join(dir, name);
  // Flush the WAL so the copied database file contains the latest commits;
  // without it the archive can be a checkpoint behind. Best-effort: the pragma
  // only exists on the SQLite driver.
  try {
    if (db.driver === 'sqlite') db.pragma('wal_checkpoint(TRUNCATE)');
  } catch { /* checkpoint is best-effort */ }

  // The database goes in as `mortar.db` whatever its real filename is. Restore
  // looks for exactly that name, so with a custom MORTAR_DB_PATH (any filename
  // other than mortar.db) the old copy-in-place archive could never be restored.
  // Copying first also avoids tarring a file SQLite may still be writing to.
  const staging = fs.mkdtempSync(path.join(require('os').tmpdir(), 'mortar-backup-stage-'));
  try {
    fs.copyFileSync(DB_PATH, path.join(staging, 'mortar.db'));
    const withUploads = includeUploads && fs.existsSync(UPLOADS_DIR);
    // Every option must precede the first file operand: GNU tar treats an
    // option after it as another path to archive.
    const args = ['-czf', dest];
    if (withUploads) args.push('--exclude=thumbs', '--exclude=import-tmp');
    args.push('-C', staging, 'mortar.db');
    if (withUploads) args.push('-C', UPLOADS_DIR, '.');
    await execFileAsync('tar', args);
  } catch (err: any) {
    // Never leave a half-written archive behind for the retention pass to keep.
    try { fs.unlinkSync(dest); } catch {}
    throw err;
  } finally {
    try { fs.rmSync(staging, { recursive: true, force: true }); } catch {}
  }
  const st = fs.statSync(dest);
  return { name, path: dest, bytes: st.size, mtimeMs: st.mtimeMs };
}

/** Keep the newest `retention` archives, delete the rest. Returns how many were removed. */