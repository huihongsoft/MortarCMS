import crypto from 'crypto';
import fs from 'fs';

// Fingerprints for installed packages (plugin archives).
//
// Plugins run in-process with full database, filesystem and network access —
// there is no sandbox — so the only integrity control available is knowing
// *which* artifact was installed and refusing one that does not match what the
// publisher announced. See docs/plugins.md for the trust model.

/** SHA-256 of a file, hex, lowercase. Returns null when it cannot be read. */
export function sha256File(filePath: string): string | null {
  try {
    const hash = crypto.createHash('sha256');
    hash.update(fs.readFileSync(filePath));
    return hash.digest('hex');
  } catch { return null; }
}

export interface ArtifactVerification {
  sha256: string | null;
  /** True when no expectation was given, or when it matched. */
  ok: boolean;
  expected?: string;
}

/**
 * Compute an artifact's hash and compare it with an expected one when provided.
 *
 * The expected value is tolerated in the shapes a publisher is likely to paste:
 * upper case, a leading `sha256:`, surrounding whitespace. Anything else must
 * match exactly — a "close enough" comparison would defeat the point.
 */
export function verifyArtifact(filePath: string, expected?: string): ArtifactVerification {
  const sha256 = sha256File(filePath);
  const want = normalize(expected);
  if (!want) return { sha256, ok: sha256 !== null };
  return { sha256, ok: !!sha256 && sha256 === want, expected: want };
}

/** Normalise an expected digest: trim, drop a `sha256:` prefix, lower-case. */
export function normalize(expected: unknown): string | undefined {
  const raw = String(expected ?? '').trim().toLowerCase().replace(/^sha256[:=]/, '').trim();
  return raw || undefined;
}
