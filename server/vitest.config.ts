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
      // Ratchet thresholds, a couple of points below the measured baseline
      // (50.2 / 44.7 / 58.3 / 55.9 when they were raised) so ordinary
      // cross-platform variance does not fail a build while a real regression
      // does. They used to sit at 15/8/17/18: a floor low enough that whole
      // features could lose their tests unnoticed, which is what a threshold
      // nobody dares raise is worth.
      thresholds: { statements: 48, branches: 42, functions: 55, lines: 53 },
    },
  },
});
