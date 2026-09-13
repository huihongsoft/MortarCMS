import { defineConfig } from 'vitest/config';

// Tests that touch the database (demo data) run against an isolated SQLite
// file via MORTAR_DB_PATH — never the real server/data/mortar.db.
export default defineConfig({
  test: {
    // setup.ts assigns a per-file MORTAR_DB_PATH (isolation) and JWT_SECRET.
    setupFiles: ['./tests/setup.ts'],
    fileParallelism: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      // Ratchet thresholds: set below the current baseline (with headroom for
      // cross-platform/line-count variance) so coverage can't regress
      // silently. Raise them as tests are added.
      thresholds: { statements: 15, branches: 8, functions: 17, lines: 18 },
    },
  },
});
