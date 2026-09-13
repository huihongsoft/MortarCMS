// Central environment configuration + validation.
//
// Values are read once here instead of scattered `process.env` lookups.
// Validation is exposed as `assertValidConfig()` and called by the server entry
// point — NOT at module load — so importing this module (e.g. from tests or the
// logger) never terminates the process as a side effect.

// Single source of truth for the app version reported by the API/health and
// used as the minimum-core version for plugin compatibility checks.
export const APP_VERSION = '0.1.2';

function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

const rawPort = process.env.PORT;
const parsedPort = rawPort ? Number(rawPort) : 3001;
const portValid = Number.isInteger(parsedPort) && parsedPort >= 1 && parsedPort <= 65535;

const databaseUrl = process.env.DATABASE_URL || '';

export const config = {
  isProduction: isProduction(),
  nodeEnv: process.env.NODE_ENV || 'development',
  // Fall back to the default when the value is invalid; assertValidConfig()
  // reports the problem (and the entry point exits in production).
  port: portValid ? parsedPort : 3001,
  trustProxy: process.env.TRUST_PROXY === '1',
  corsOrigins: (process.env.CORS_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean),
  databaseUrl,
  uploadsDir: process.env.UPLOADS_DIR || '',
};

// Throws when the configuration is unusable. Called once from the server entry
// point so all problems are reported together and the process exits cleanly.
export function assertValidConfig(): void {
  const errors: string[] = [];
  if (!portValid) errors.push('Invalid PORT "' + rawPort + '" — expected an integer 1-65535.');
  if (databaseUrl && !/^(mysql|postgres|postgresql):\/\/.+/.test(databaseUrl)) {
    errors.push('Invalid DATABASE_URL — expected mysql://, postgres:// or postgresql://...');
  }
  // jwt.ts also enforces this; checked here so all config problems report at once.
  if (isProduction() && !process.env.JWT_SECRET) errors.push('JWT_SECRET is required in production.');
  if (errors.length > 0) {
    for (const e of errors) console.error('[Config] ' + e);
    throw new Error('Invalid configuration');
  }
}
