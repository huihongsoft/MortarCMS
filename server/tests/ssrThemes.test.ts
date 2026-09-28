import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import { JSDOM } from 'jsdom';

// The renderer has to draw the *site's* theme, not the default one.
//
// It did not: entry-server wrapped the app in a ThemeProvider carrying the resolved
// theme, but the app builds its own ThemeProvider (from `loadedTheme()`), and the
// inner one won with nothing loaded — so every non-default site prerendered the
// default design and then hydrated into its real theme, which is a hydration
// mismatch on every page. Two things are pinned here:
//
//   1. each theme in the registry produces its own markup;
//   2. the registry is keyed by the theme's real name — it once held `twentytyone`,
//      a local variable spelling, so that theme was reachable only under a name
//      nobody uses and the renderer silently refused it.

const root = path.resolve(__dirname, '../..');
const BUNDLE = path.join(root, 'frontend/dist-ssr/entry-server.js');
const themes = await import(pathToFileURL(path.join(__dirname, '../dist/utils/ssr.js')).href).catch(() => null);

describe('the theme registry', () => {
  const registry = fs.readFileSync(path.join(root, 'frontend/src/themes/registry.ts'), 'utf8');
  // Themes have an index.ts; `shared/` holds the layout factory they share and is
  // not a theme anyone selects.
  const dirs = fs.readdirSync(path.join(root, 'frontend/src/themes'), { withFileTypes: true })
    .filter((d) => d.isDirectory() && fs.existsSync(path.join(root, 'frontend/src/themes', d.name, 'index.ts')))
    .map((d) => d.name);

  it('is keyed by the theme name, one entry per theme directory', () => {
    // The key is what the settings store as the active theme, so a key that does
    // not match a directory is a theme nobody can select and the renderer refuses.
    // The keys are shorthand properties (`{ aurora, magazine, ... }`), possibly all
    // on one line — parse the object body rather than line-by-line.
    const block = registry.slice(registry.indexOf('const builtIn'), registry.indexOf('for (const [name, mod]'));
    const body = block.slice(block.indexOf('{') + 1, block.lastIndexOf('}'));
    const keys = body.split(',').map((x) => x.trim()).filter(Boolean);
    expect(keys.length).toBeGreaterThanOrEqual(7);
    for (const dir of dirs) {
      // `default` is the built-in base and is not part of the optional registry.
      if (dir === 'default') continue;
      expect(keys, 'no registry entry keyed "' + dir + '"').toContain(dir);
    }
  });

  it('imports each theme from its own directory', () => {
    for (const m of registry.matchAll(/^import (\w+) from '\.\/(\w+)';$/gm)) {
      expect(m[2], m[1] + ' is imported from a different directory').toBe(m[1]);
    }
  });
});

describe.skipIf(!fs.existsSync(BUNDLE))('the renderer and the active theme', () => {
  let render: (options: Record<string, unknown>) => { html: string | null; payload: any };
  let domWindow: any;

  beforeAll(async () => {
    const mod: any = await import(pathToFileURL(BUNDLE).href);
    render = mod.render || mod.default?.render;
    domWindow = new JSDOM('<!doctype html><html><body></body></html>').window;
    expect(themes).toBeTruthy();
  });

  const renderTheme = (theme: string) => render({
    url: '/', themeName: theme, origin: 'https://x.test',
    settings: { site_title: 'T', site_lang: 'en', permalink_structure: '/post/%slug%', theme_name: theme },
    data: { home: { posts: [], total: 0, categories: [] } },
    domWindow,
  });

  /** The same, with one post, for anything that asserts on a post's markup. */
  const renderThemeWithPost = (theme: string) => render({
    url: '/', themeName: theme, origin: 'https://x.test',
    settings: { site_title: 'T', site_lang: 'en', permalink_structure: '/post/%slug%', theme_name: theme },
    data: {
      home: {
        posts: [{ id: 'p1', title: 'Post', slug: 'post', excerpt: 'Excerpt', featured: '', status: 'published', type: 'post', lang: '',
          createdAt: '2026-09-01T00:00:00.000Z', publishedAt: '2026-09-01T00:00:00.000Z', categories: [{ name: 'News', slug: 'news' }], tags: [], translations: [] }],
        total: 1, categories: [],
      },
    },
    domWindow,
  });

  it('draws the requested theme, not the default one', () => {
    const def = renderTheme('default');
    const aurora = renderTheme('aurora');
    expect(def.payload.themeName).toBe('default');
    expect(aurora.payload.themeName).toBe('aurora');
    // The failure mode was these coming out byte-identical.
    expect(aurora.html).not.toBe(def.html);
    // Aurora's own header/footer markup, which the default theme does not have.
    expect(aurora.html).toContain('indigo');
  });

  it('renders every theme it advertises', () => {
    // A theme the registry claims but cannot draw is worse than one it refuses:
    // this is how the `twentytyone` key went unnoticed.
    for (const name of ['default', 'aurora', 'softstore', 'twentyseventeen', 'twentytwentyone', 'twentynineteen', 'twentytwentyfour', 'magazine']) {
      const r = renderTheme(name);
      expect(r.html, name + ' did not render').toBeTruthy();
      expect(r.payload.themeName, name + ' resolved to another theme').toBe(name);
    }
  });

  it('keeps the two list-style themes on one shared layout', () => {
    // twentyseventeen and twentytwentyone are the same homepage in different
    // clothes; the structure lives in themes/shared/listHome.tsx and these are the
    // tokens. This is the guard against them drifting back into two copies.
    const ts17 = renderThemeWithPost('twentyseventeen').html || '';
    const tt1 = renderThemeWithPost('twentytwentyone').html || '';
    // Shared structure…
    for (const html of [ts17, tt1]) expect(html).toContain('lg:col-span-2');
    // …and the tokens that make each its own theme.
    expect(ts17).toContain('pb-8 border-b border-gray-200');
    expect(tt1).toContain('rounded-3xl');
    expect(ts17).not.toContain('rounded-3xl');
  });

  it('still refuses a theme it does not have, rather than drawing the wrong one', () => {
    const r = renderTheme('a-theme-that-does-not-exist');
    expect(r.html).toBeNull();
    expect(r.payload.rendered).toBe(false);
  });
});
