// Load server/.env into process.env BEFORE any module that reads configuration.
// This file must be imported first in index.ts (see the top of that file):
// jwt.ts fails fast at module-load in production, so the secret has to be
// present before the route imports are evaluated.
//
// Dependency-free (no dotenv): parses simple KEY=VALUE lines, ignores blank
// lines and `#` comments, strips surrounding quotes, and never overrides a
// value that is already present in the real environment.
import fs from 'fs';
import path from 'path';

function applyEnvFile(file: string): boolean {
  let text: string;
  try {
    text = fs.readFileSync(file, 'utf8');
  } catch {
    return false;
  }
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim().replace(/^export\s+/, '');
    if (!key || process.env[key] !== undefined) continue;
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
  return true;
}

// server/.env, resolved from this file's location (src/utils or dist/utils).
for (const candidate of [path.join(__dirname, '../../.env'), path.join(process.cwd(), '.env')]) {
  if (applyEnvFile(candidate)) break;
}
