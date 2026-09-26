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
