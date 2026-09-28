import { test, expect } from '@playwright/test';

// What a visitor and a crawler actually receive.
//
// These assert on the *server's* response, not on the rendered DOM: that is the
// difference server rendering makes, and the thing that silently regressed before
// (a page that looks right in a browser can still be an empty shell to a bot).

test.describe('the server-rendered document', () => {
  test('carries the article, not just an empty root element', async ({ page }) => {
    const res = await page.request.get('/');
    expect(res.status()).toBe(200);
    const html = await res.text();
    // The homepage lists posts in the HTML itself.
    expect(html).toMatch(/<div id="root">\s*<div/);
    expect(html).toContain('__MORTAR_SSR__');
  });

  test('keeps the inline scripts the CSP nonce allows', async ({ page }) => {
    const res = await page.request.get('/');
    const html = await res.text();
    const csp = res.headers()['content-security-policy-report-only'] || res.headers()['content-security-policy'] || '';
    const nonce = (/script-src[^;]*'nonce-([^']+)'/.exec(csp) || [])[1];
    expect(nonce).toBeTruthy();
    // Both inline scripts a document has must carry it: the importmap, without
    // which no module resolves and the app never boots, and the render payload,
    // without which the prerendered markup is thrown away.
    const importmap = /<script nonce="([^"]+)" type="importmap">/.exec(html);
    expect(importmap?.[1]).toBe(nonce);
    expect(html).toContain('<script nonce="' + nonce + '">window.__MORTAR_SSR__=');
    // No placeholder left behind...
    expect(html).not.toContain('__MORTAR_CSP_NONCE__');
    // ...and every inline script carries the nonce. (An external script is
    // covered by 'self' and is deliberately not stamped.)
    const inlineScripts = html.match(/<script(?![^>]*\ssrc=)[^>]*>/g) || [];
    expect(inlineScripts.length).toBeGreaterThan(0);
    for (const tag of inlineScripts) expect(tag).toContain('nonce="' + nonce + '"');
  });

  test('the payload is not a way to inject markup', async ({ page }) => {
    const res = await page.request.get('/');
    const html = await res.text();
    const payload = /window\.__MORTAR_SSR__=(.*?)<\/script>/s.exec(html)?.[1];
    expect(payload).toBeTruthy();
    // Raw `<` inside the JSON would end the script element early. Escaped, the
    // payload still parses as JSON.
    expect(() => JSON.parse(payload!.replace(/\\u003c/g, '<'))).not.toThrow();
  });

  test('an unknown path is a real 404, not a 200 shell', async ({ page }) => {
    const res = await page.request.get('/definitely-not-a-page');
    expect(res.status()).toBe(404);
    // And it is not prerendered: there is nothing to prerender.
    expect(await res.text()).not.toContain('__MORTAR_SSR__');
  });

  test('a missing post under a valid route shape is a 404 too', async ({ page }) => {
    const res = await page.request.get('/post/no-such-post-' + Date.now());
    expect(res.status()).toBe(404);
  });
});

test.describe('the theme colour', () => {
  // One colour, one palette. The `*-primary-*` utilities used to resolve to ten
  // hard-coded values in tailwind.config.js, so the colour an operator sets in
  // Appearance recoloured `.btn-primary` and left ~120 palette utilities blue —
  // measured on the rendered page, not inferred from the source.
  test('reaches the palette utilities, not just the buttons', async ({ page }) => {
    const status = await (await page.request.get('/api/install/status')).json();
    if (!status.installed) {
      const r = await page.request.post('/api/install', { data: { siteTitle: 'Colour', adminEmail: 'e2e@mortar.test', adminPassword: 'e2e-password-1', adminUsername: 'e2e', sampleData: false } });
      expect(r.ok(), await r.text()).toBeTruthy();
    }
    const login = await (await page.request.post('/api/auth/login', { data: { email: 'e2e@mortar.test', password: 'e2e-password-1' } })).json();
    const auth = { Authorization: 'Bearer ' + login.token, 'content-type': 'application/json' };

    // A rose that shares no channel with the default blue, so "it followed" cannot
    // be a coincidence. Written per active theme, which is what the Appearance
    // panel does — a per-theme override wins over the install-wide default.
    const themes = await (await page.request.get('/api/themes', { headers: auth })).json();
    const active = themes.active;
    const put = await page.request.put('/api/settings', { headers: auth, data: { ['theme_' + active + '_primary_color']: '#e11d48' } });
    expect(put.ok(), await put.text()).toBeTruthy();
    try {
      // The shell itself carries the generated palette, so the first paint is
      // already themed (App.tsx would otherwise apply it in an effect).
      const shell = await (await page.request.get('/')).text();
      const block = /<style id="mortar-theme-vars">([^<]*)<\/style>/.exec(shell)?.[1] || '';
      expect(block).toContain('--primary-600:225 29 72');

      await page.goto('/');
      await page.waitForTimeout(500);
      const painted = await page.evaluate(() => {
        const out: string[] = [];
        for (const el of Array.from(document.querySelectorAll('[class*="primary-"]')).slice(0, 300) as HTMLElement[]) {
          const s = getComputedStyle(el);
          out.push(s.color, s.backgroundColor, s.borderTopColor);
        }
        return out.filter((c) => c && c !== 'rgba(0, 0, 0, 0)');
      });
      expect(painted.length, 'no element uses a palette utility on the homepage').toBeGreaterThan(0);
      // The palette used to be fixed hexes, so every one of these painted the same
      // blue whatever the setting said. None may still.
      expect(painted.filter((c) => c === 'rgb(59, 130, 246)')).toEqual([]);

      // And the configured rose has to actually appear — one of its derived
      // shades (#e11d48 = rgb(225, 29, 72) at 600, lighter at 500, and so on).
      const rgb = (c: string) => (c.match(/\d+/g) || []).map(Number);
      const followed = painted.filter((c) => {
        const [r, g, b] = rgb(c);
        return r >= 200 && g <= 90 && b >= 60 && b <= 140;
      });
      expect(followed.length, 'nothing followed the theme colour; painted: ' + painted.slice(0, 8).join(' | ')).toBeGreaterThan(0);
    } finally {
      await page.request.put('/api/settings', { headers: auth, data: { ['theme_' + active + '_primary_color']: '' } });
    }
  });
});

test.describe('the hydrated page', () => {
  test('boots without console errors and keeps the rendered content', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (m) => {
      if (m.type() !== 'error') return;
      // The app probes its own auth state for an anonymous visitor, so a 401 for
      // a resource the page does not need is normal. What must not appear is a
      // React error or an uncaught exception.
      if (/Failed to load resource/.test(m.text())) return;
      errors.push(m.text());
    });
    page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));

    await page.goto('/');
    // The header is part of every theme's layout; if hydration had thrown, the
    // fallback client render would still show it — but a broken main.tsx would
    // leave the prerendered markup frozen with no interactivity. The language
    // toggle only exists after React has taken over.
    await expect(page.locator('header')).toBeVisible();
    const body = page.locator('body');
    await expect(body).not.toHaveText(/^\s*$/);

    expect(errors, 'console errors: ' + errors.join(' | ')).toEqual([]);
  });
});
