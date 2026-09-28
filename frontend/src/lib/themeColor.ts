// One theme colour, one palette.
//
// The theme setting is a single hex value, but the UI uses a *ramp*: 600 for
// accents and buttons, 700 for hover, 50/100 for tints, 200/300 for borders. That
// ramp used to be a hand-written palette in tailwind.config.js — ten fixed values
// that no setting could change, so "primary colour" in the Appearance panel
// recoloured `.btn-primary` and left ~120 palette utilities blue.
//
// The ramp is derived here from the configured colour instead, and published as
// RGB *triplets* (`--primary-600: 37 99 235`) so Tailwind can keep generating
// `rgb(var(--primary-600) / <alpha-value>)`. Triplets matter: a plain
// `var(--x)` colour cannot carry Tailwind's opacity modifier, and the UI uses
// `bg-primary-500/10`, `bg-primary-900/30` and friends.
//
// Pure and dependency-free on purpose: the server renderer imports the same
// module to bake the variables into the HTML it sends (see entry-server.tsx), so
// a themed site does not flash the default blue before hydration.

/** The shades Tailwind generates utilities for (see tailwind.config.js). */
export const SHADES = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'] as const;

/**
 * How far each shade moves from the configured colour toward white (negative) or
 * black. 600 is the configured colour itself, because 600 is the accent/action
 * shade in this UI. The amounts are tuned so the default #2563eb reproduces
 * Tailwind's blue ramp closely (50 → #eff6ff, 500 → #3b82f6, 700 → #1d4ed8).
 */
const MIX: Record<string, number> = {
  50: -0.93, 100: -0.82, 200: -0.68, 300: -0.5, 400: -0.35,
  500: -0.18, 600: 0, 700: 0.15, 800: 0.3, 900: 0.45,
};

export type Palette = Record<string, string>;

function parseHex(raw: unknown): [number, number, number] | null {
  const value = String(raw ?? '').trim();
  const m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(value);
  if (!m) return null;
  const h = m[1].length === 3 ? m[1].replace(/./g, (c) => c + c) : m[1];
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function mix(channel: number, towards: number, amount: number): number {
  return Math.round(channel + (towards - channel) * amount);
}

/**
 * The ten shades for one colour, as space-separated RGB triples.
 * Returns null for anything that is not a 3- or 6-digit hex (including the
 * 8-digit form: an alpha channel cannot go into a triple, and silently dropping
 * it would change the colour the operator chose).
 */
export function shadesFrom(raw: unknown): Palette | null {
  const rgb = parseHex(raw);
  if (!rgb) return null;
  const out: Palette = {};
  for (const shade of SHADES) {
    const amount = MIX[shade];
    const colour = amount >= 0
      ? rgb.map((c) => mix(c, 0, amount))
      : rgb.map((c) => mix(c, 255, -amount));
    out[shade] = colour.join(' ');
  }
  return out;
}

/**
 * The `:root{…}` block for a theme's settings: the palette, plus the single colour
 * the component classes read directly (`--primary-color`).
 *
 * Every value is generated here rather than interpolated from the settings, so
 * nothing operator-supplied reaches the stylesheet — a theme colour is validated
 * by `parseHex` and emitted as three integers.
 */
export function themeVarsCss(settings: Record<string, string> | undefined): string {
  const palette = shadesFrom(settings?.theme_primary_color);
  if (!palette) return '';
  const parts = SHADES.map((s) => '--primary-' + s + ':' + palette[s]);
  parts.push('--primary-color:#' + palette['600'].split(' ').map((n) => Number(n).toString(16).padStart(2, '0')).join(''));
  return ':root{' + parts.join(';') + '}';
}
