import { defineConfig, devices } from '@playwright/test';
import path from 'path';

// End-to-end smoke tests.
//
// These run against the *built* app — `server/dist` plus both frontends — because
// that is what a deployment serves: the prerenderer, the admin bundle and the
// static assets all have to be present for the path to be real. CI builds first
// and then runs this; locally, `npm run build && npm run e2e`.
//
// One worker, no retries: the spec walks a single server's state in order (create
// a post, publish it, rename it, restore it), so parallel files would fight over
// the same database.

const PORT = Number(process.env.E2E_PORT || 3119);
const DB = process.env.E2E_DB || path.join(require('os').tmpdir(), 'mortar-e2e.db');

export default defineConfig({
  testDir: '.',
  // Keep every artifact under e2e/ rather than the repository root.
  outputDir: './test-results',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  workers: 1,
  retries: 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: 'http://127.0.0.1:' + PORT,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    // The admin is where the publishing workflow lives.
    { name: 'admin', testMatch: /admin\.spec\.ts/, use: { ...devices['Desktop Chrome'] } },
    // The public site, to confirm what a visitor and a crawler actually get.
    { name: 'site', testMatch: /site\.spec\.ts/, use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    // A fresh database every run: the spec installs the site itself, and a
    // leftover install would silently change which flow is exercised.
    command: 'rm -f "' + DB + '" "' + DB + '-wal" "' + DB + '-shm" && node server/dist/index.js',
    cwd: path.resolve(__dirname, '..'),
    // Not /api/health: before the first install every /api path answers 503, and
    // Playwright only treats 2xx/3xx/(4xx minus 5xx) as "up", so it would wait
    // forever for a server that is running perfectly well.
    url: 'http://127.0.0.1:' + PORT + '/api/install/status',
    reuseExistingServer: false,
    timeout: 60_000,
    env: {
      MORTAR_DB_PATH: DB,
      PORT: String(PORT),
      NODE_ENV: 'production',
      JWT_SECRET: 'e2e-secret-e2e-secret-e2e-secret-32',
      SITE_URL: '',
    },
  },
});
