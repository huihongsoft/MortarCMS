import { execFileSync, spawn } from 'child_process';
import path from 'path';

// Validate every entry in an archive BEFORE extraction. Throws if any entry
// could escape the extraction directory (absolute path or ../ components),
// preventing zip-slip / tar-slip from writing outside the target dir.
export function assertSafeArchive(archivePath: string): string[] {
  const isTarGz = /\.(tar\.gz|tgz)$/i.test(archivePath);
  const entries = execFileSync(isTarGz ? 'tar' : 'unzip', isTarGz ? ['-tzf', archivePath] : ['-Z1', archivePath], { encoding: 'utf8' })
    .split('\n').map(e => e.replace(/\r$/, '')).filter(Boolean);
  for (const entry of entries) {
    if (entry.includes('\0') || path.isAbsolute(entry) || entry.split(/[\\/]/).some(p => p === '..')) {
      throw new Error('Unsafe archive entry: ' + entry);
    }
  }
  return entries;
}

// Entry count and total declared uncompressed size, read from the archive's own
// listing so a zip bomb is rejected BEFORE anything is extracted to disk.
//
// The size is parsed as the token preceding the date in each listing line, which
// works for both `unzip -l` (SIZE DATE TIME NAME) and `tar -tvzf`
// (MODE [LINKS] OWNER GROUP SIZE DATE TIME NAME) regardless of how owner/group
// are formatted. Filenames are never consulted.
// Measure the real uncompressed size by streaming the archive through its own
// decompressor to stdout and counting bytes, aborting as soon as `maxBytes` is
// exceeded. Two reasons this beats parsing a listing: the count cannot be spoofed
// by a lying header, and nothing is ever written to disk. Listing formats differ
// between implementations (`unzip -l` prints MM-DD-YYYY on macOS and
// YYYY-MM-DD on Linux; bsdtar prints "Sep 14 23:50" with no year), so parsing
// them was not portable.
export function measureArchiveBytes(archivePath: string, maxBytes: number): Promise<number> {
  return new Promise((resolve, reject) => {
    const isTarGz = /\.(tar\.gz|tgz)$/i.test(archivePath);
    const child = spawn(isTarGz ? 'tar' : 'unzip', isTarGz ? ['-xzOf', archivePath] : ['-p', archivePath], {
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    let total = 0;
    let settled = false;
    const finish = (fn: () => void) => {
      if (settled) return;
      settled = true;
      try { child.kill('SIGKILL'); } catch { /* already gone */ }
      fn();
    };
    child.stdout.on('data', (chunk: Buffer) => {
      total += chunk.length;
      if (total > maxBytes) finish(() => resolve(total));
    });
    child.stdout.on('error', () => finish(() => resolve(total)));
    child.on('error', (err) => finish(() => reject(err)));
    child.on('close', () => finish(() => resolve(total)));
  });
}

// Reject an archive whose entry count is over the limit, then (async) whose real
// uncompressed size is over the limit. Returns the entry list so the caller can
// reuse it. Throws on rejection.
export async function assertArchiveWithinLimits(archivePath: string, limits: { maxEntries: number; maxBytes: number }): Promise<string[]> {
  const entries = assertSafeArchive(archivePath);
  if (entries.length > limits.maxEntries) {
    throw new Error('Archive has too many entries (' + entries.length + ', limit ' + limits.maxEntries + ')');
  }
  const bytes = await measureArchiveBytes(archivePath, limits.maxBytes);
  if (bytes > limits.maxBytes) {
    throw new Error('Archive expands beyond the limit of ' + limits.maxBytes + ' bytes');
  }
  return entries;
}
