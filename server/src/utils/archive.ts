import { execFileSync } from 'child_process';
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
