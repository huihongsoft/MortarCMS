import path from 'path';

// Uploads directory — the real site uses server/uploads, tests override it
// with UPLOADS_DIR so scratch instances never touch real media files.
export const UPLOADS_DIR: string = process.env.UPLOADS_DIR || path.join(__dirname, '../../uploads');
export const uploadPath = (...parts: string[]): string => path.join(UPLOADS_DIR, ...parts);

// Map a public media URL (`/uploads/...`) to its absolute path on disk.
// Returns null for anything that is not inside the uploads directory, so a
// tampered/imported `Media.url` (e.g. `/uploads/../../etc/passwd`) can never
// be used to read or delete arbitrary files.
export function resolveUploadUrl(url: unknown): string | null {
  if (typeof url !== 'string' || !url) return null;
  const rel = url.replace(/^\/+/, '');
  if (!rel.startsWith('uploads/')) return null;
  const root = path.resolve(UPLOADS_DIR);
  const abs = path.resolve(root, rel.slice('uploads/'.length));
  // Must resolve to something *inside* the uploads dir — the dir itself is not
  // a file, so reject it too (prevents attempting to unlink the root).
  if (abs === root || !abs.startsWith(root + path.sep)) return null;
  return abs;
}
