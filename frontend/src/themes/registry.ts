// Server-side theme registry.
//
// The browser loads a theme as a standalone ESM bundle from
// `/themes/<name>/theme.js` (see loadTheme in ./index), but those bundles import
// `react` and `react-router-dom` as bare specifiers resolved by the page's
// importmap — Node has no importmap, so the renderer cannot load them.
//
// Instead the built-in themes are compiled *into* the server bundle from source,
// which is why this file imports each one statically. It is imported only by
// entry-server.tsx, so none of it reaches the client bundle (which keeps loading
// themes lazily, exactly as before).
//
// A theme installed on disk that is not in this list (a custom or legacy theme)
// cannot be rendered server-side; the request falls back to the client-rendered
// shell. See server/src/utils/ssr.ts.

import { defaultTheme, mergeTheme, type Theme } from './index';
import aurora from './aurora';
import magazine from './magazine';
import softstore from './softstore';
import twentynineteen from './twentynineteen';
import twentyseventeen from './twentyseventeen';
import twentytyone from './twentytwentyone';
import twentytwentyfour from './twentytwentyfour';

const builtIn: Record<string, any> = {
  aurora, magazine, softstore, twentynineteen, twentyseventeen, twentytyone, twentytwentyfour,
};

const registry: Record<string, Theme> = { default: defaultTheme };
for (const [name, mod] of Object.entries(builtIn)) registry[name] = mergeTheme(name, mod);

/** The theme to render with, or null when this one cannot be rendered here. */
export function serverTheme(name?: string): Theme | null {
  const key = String(name || 'default').trim() || 'default';
  return registry[key] || null;
}

/** Names the renderer supports, for diagnostics. */
export function serverThemeNames(): string[] {
  return Object.keys(registry);
}
