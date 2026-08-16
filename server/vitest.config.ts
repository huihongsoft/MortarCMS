import { defineConfig } from 'vitest/config';

// Tests that touch the database (demo data) run against an isolated SQLite
// file via MORTAR_DB_PATH — never the real server/data/mortar.db.
export default defineConfig({
  test: {
    env: { MORTAR_DB_PATH: '/tmp/mortar-vitest-' + process.pid + '.db' },
    fileParallelism: false,
  },
});
