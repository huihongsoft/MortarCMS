import { test, expect, type Page } from '@playwright/test';

// The publishing workflow, end to end, through the real admin UI.
//
// This is the path a person actually takes — sign in, write, publish, rename,
// roll back — and it is the only test that crosses the boundary between the three
// apps (admin bundle, API, public site). Unit tests cover each piece; this covers
// the seams, which is where the regressions that matter have been.
//
// The steps are ordered and share one server's state, so they run serially in one
// file (Playwright does that by default within a file; `workers: 1` in the config
// keeps the other project from interleaving).

const ADMIN_EMAIL = 'e2e@mortar.test';
const ADMIN_PASSWORD = 'e2e-password-1';
const SITE_TITLE = 'E2E Site';

// A fresh slug per run: the API de-duplicates slugs, so a fixed one would grow a
// "-2" suffix on every re-run and the assertions would drift.
const STAMP = String(Date.now());
const SLUG = 'e2e-post-' + STAMP;
const RENAMED = 'e2e-renamed-' + STAMP;

/** Install the site if the database is empty. Idempotent, so a re-run is fine. */
async function ensureInstalled(page: Page): Promise<void> {
  const status = await page.request.get('/api/install/status');
  const { installed } = await status.json();
  if (installed) return;
  const res = await page.request.post('/api/install', {
    data: {
      siteTitle: SITE_TITLE,
      siteUrl: 'http://127.0.0.1:' + (process.env.E2E_PORT || 3119),
      adminEmail: ADMIN_EMAIL,
      adminPassword: ADMIN_PASSWORD,
      adminUsername: 'e2e',
      sampleData: false,
    },
  });
  expect(res.ok(), 'install failed: ' + (await res.text())).toBeTruthy();
}

async function signIn(page: Page): Promise<void> {
  await page.goto('/admin/');
  await page.fill('#login-email', ADMIN_EMAIL);
  await page.fill('input[type="password"]', ADMIN_PASSWORD);
  await page.getByRole('button', { name: /sign in|登录/i }).click();
  // The sidebar renders only for a signed-in session, and its nav has an
  // accessible name — a more stable landmark than any page's heading.
  await expect(page.getByRole('complementary', { name: /admin navigation/i })).toBeVisible();
}

/** Open the editor for a post from the list, through the row's edit action. */
async function openPost(page: Page, title: string): Promise<void> {
  await page.goto('/admin/posts');
  const row = page.getByRole('row', { name: new RegExp(title, 'i') });
  await expect(row).toBeVisible();
  await row.getByRole('link', { name: /edit/i }).click();
  await expect(page.getByPlaceholder(/post title/i).first()).toHaveValue(title);
}

test.describe.configure({ mode: 'serial' });

test.beforeEach(async ({ page }) => {
  // The admin follows localStorage; pin it so the text selectors below are stable
  // regardless of the machine's or the site's language.
  await page.addInitScript(() => { try { localStorage.setItem('mortar_lang', 'en'); } catch {} });
  await ensureInstalled(page);
});

test('sign in, publish a post, rename it, and roll it back', async ({ page }) => {
  await signIn(page);

  // --- write and publish -------------------------------------------------
  await page.goto('/admin/posts/new');
  await page.getByPlaceholder(/post title/i).first().fill('E2E original title');

  // The slug is the permalink; set it explicitly so the rename below is a real
  // change rather than a de-duplication suffix.
  await page.getByLabel(/post slug/i).fill(SLUG);

  await page.getByRole('button', { name: /^publish$/i }).first().click();
  // Publishing navigates to the post list.
  await expect(page).toHaveURL(/\/admin\/posts(\?|$)/);
  await expect(page.getByRole('cell', { name: 'E2E original title' }).first()).toBeVisible();

  // The public site serves it — and, with the prerenderer in place, in the HTML
  // itself rather than only after a client render.
  const html = await (await page.request.get('/post/' + SLUG)).text();
  expect(html).toContain('E2E original title');

  // --- rename the published post ----------------------------------------
  // Editing the slug of something already published must keep the old URL
  // working: the point of the automatic 301.
  await openPost(page, 'E2E original title');
  await page.getByLabel(/post slug/i).fill(RENAMED);
  // An existing post saves through the same header button; "publish" on a
  // published post is an update.
  await page.getByRole('button', { name: /^publish$/i }).first().click();
  await expect(page.getByRole('cell', { name: 'E2E original title' }).first()).toBeVisible();

  // The old URL answers with a redirect to the new one...
  const moved = await page.request.get('/post/' + SLUG, { maxRedirects: 0 });
  expect([301, 302]).toContain(moved.status());
  expect(moved.headers()['location'] || '').toContain(RENAMED);
  // ...and the new one serves the post.
  const renamed = await page.request.get('/post/' + RENAMED);
  expect(renamed.status()).toBe(200);
  expect(await renamed.text()).toContain('E2E original title');

  // --- edit twice, then roll back ---------------------------------------
  // A revision keeps the state *before* each save, and the panel only offers a
  // restore for revisions that are not the newest — so rolling back needs two
  // title changes to have something to go back to.
  await openPost(page, 'E2E original title');
  await page.getByPlaceholder(/post title/i).first().fill('E2E first edit');
  await page.getByRole('button', { name: /^publish$/i }).first().click();
  await expect(page.getByRole('cell', { name: 'E2E first edit' }).first()).toBeVisible();

  await openPost(page, 'E2E first edit');
  await page.getByPlaceholder(/post title/i).first().fill('E2E second edit');
  await page.getByRole('button', { name: /^publish$/i }).first().click();
  await expect(page.getByRole('cell', { name: 'E2E second edit' }).first()).toBeVisible();

  await openPost(page, 'E2E second edit');
  const revisions = page.getByRole('heading', { name: /revisions/i });
  await expect(revisions).toBeVisible();
  // The heading's parent is the panel card that holds the restore buttons.
  const restoreButtons = revisions.locator('..').getByRole('button', { name: /restore/i });
  await expect(restoreButtons.first()).toBeVisible();
  // Newest first, so the last one is the oldest state: the original title.
  await restoreButtons.last().click();
  // Restoring is destructive, so it goes through the confirmation dialog — which
  // is also a real check that the dialog still intercepts the action.
  await page.getByRole('dialog').getByRole('button', { name: /confirm/i }).click();
  await expect(page.getByPlaceholder(/post title/i).first()).toHaveValue('E2E original title');

  // --- sign out ----------------------------------------------------------
  // The account menu is the avatar in the header; "logout" only exists once it
  // is open, so that click is unambiguous.
  await page.getByRole('button', { name: /e2e/ }).first().click();
  await page.getByRole('button', { name: /logout/i }).click();
  // Back at the sign-in form, and the token is really gone — not merely a
  // navigation away from the page.
  await expect(page.locator('#login-email')).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('mortar_token'))).toBeNull();
});

test('the scheduled-task screen is the only place tasks are managed', async ({ page }) => {
  // They used to be listed twice: a dedicated screen (sidebar → scheduled tasks)
  // and a card inside Settings → Tools. The card is now a pointer, so this pins
  // that the duplicate does not come back — the two lists could drift, and the
  // card could not show next-run, last-error or source.
  await signIn(page);

  await page.goto('/admin/system-tasks');
  const table = page.getByRole('table');
  await expect(table).toBeVisible();
  // The columns the dedicated screen exists for.
  for (const column of [/task/i, /interval/i, /last run/i, /next run/i, /run count/i]) {
    await expect(table.getByRole('columnheader', { name: column })).toBeVisible();
  }
  // And it offers the controls.
  await expect(table.getByRole('button', { name: /run now/i }).first()).toBeVisible();

  // Settings → Tools points here instead of listing the tasks again.
  await page.goto('/admin/settings');
  await page.getByRole('button', { name: /^tools$/i }).click();
  // Scoped to the content: the sidebar has a link with the same name.
  const pointer = page.getByRole('main').getByRole('link', { name: /scheduled tasks/i });
  await expect(pointer).toBeVisible();
  await expect(pointer).toHaveAttribute('href', /system-tasks/);
  // No second run-now control on that tab.
  await expect(page.getByRole('button', { name: /^run now$/i })).toHaveCount(0);
});
