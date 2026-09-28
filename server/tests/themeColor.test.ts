import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

// The theme-colour ramp: one configured colour becomes the ten shades the UI
// uses. This is the piece that replaced a hand-written palette in
// tailwind.config.js, which no setting could change — so "primary colour" in the
// Appearance panel recoloured the buttons and left ~120 palette utilities blue.
//
// The module is pure and dependency-free, which is also why the server renderer
// can import it to bake the same variables into the HTML (no flash of the default
// blue before hydration).

const root = path.resolve(__dirname, '../..');
const { shadesFrom, themeVarsCss, SHADES } = await import(path.join(root, 'frontend/src/lib/themeColor.ts'));

describe('the palette ramp', () => {
  it('produces all ten shades as RGB triples', () => {
    const p = shadesFrom('#2563eb')!;
    expect(Object.keys(p)).toEqual([...SHADES]);
    for (const s of SHADES) expect(p[s], s).toMatch(/^\d{1,3} \d{1,3} \d{1,3}$/);
  });

  it('keeps 600 as the configured colour', () => {
    // 600 is the accent/action shade in this UI, so it is what the operator picked.
    expect(shadesFrom('#5066e1')!['600']).toBe('80 102 225');
  });

  it('reproduces Tailwind\'s blue ramp for the default colour', () => {
    // A default install must not change appearance: the derived ramp has to land
    // on the palette that was hard-coded before, give or take a step.
    const p = shadesFrom('#2563eb')!;
    const asHex = (s: string) => '#' + p[s].split(' ').map((n) => Number(n).toString(16).padStart(2, '0')).join('');
    expect(asHex('50')).toBe('#f0f4fe');   // was #eff6ff
    expect(asHex('500')).toBe('#4c7fef');  // was #3b82f6
    expect(asHex('700')).toBe('#1f54c8');  // was #1d4ed8
    // Close enough to read as the same colour: each channel within ~20.
    const near = (a: string, b: string) => a.split(' ').every((n, i) => Math.abs(Number(n) - Number(b.split(' ')[i])) <= 20);
    expect(near(p['50'], '239 246 255')).toBe(true);
    expect(near(p['500'], '59 130 246')).toBe(true);
    expect(near(p['700'], '29 78 216')).toBe(true);
  });

  it('is monotonic: each shade is darker than the one before it', () => {
    const lum = (s: string) => Number(shadesFrom('#8b5cf6')![s].split(' ')[0]);
    for (let i = 1; i < SHADES.length; i++) {
      expect(lum(SHADES[i]), SHADES[i] + ' vs ' + SHADES[i - 1]).toBeLessThanOrEqual(lum(SHADES[i - 1]));
    }
  });

  it('refuses anything that is not a plain hex colour', () => {
    // An 8-digit value carries alpha, which cannot go into a triple — dropping it
    // silently would paint a different colour than the operator chose.
    for (const bad of ['', 'red', '#12345', '#12345678', 'rgb(1,2,3)', '#12', 'javascript:alert(1)', undefined, null]) {
      expect(shadesFrom(bad as any), String(bad)).toBeNull();
    }
    expect(shadesFrom('#abc')).toBeTruthy();          // shorthand expands
    expect(shadesFrom('  #AABBCC  ')).toBeTruthy();   // trimmed, case-insensitive
  });
});

describe('the generated stylesheet block', () => {
  it('emits the palette and the single colour the component classes read', () => {
    const css = themeVarsCss({ theme_primary_color: '#e11d48' });
    expect(css.startsWith(':root{')).toBe(true);
    expect(css).toContain('--primary-600:225 29 72');
    expect(css).toContain('--primary-color:#e11d48');
    // Every value is generated, so nothing operator-supplied can escape into CSS:
    // exactly one rule, closed once, with no stray braces from a crafted value.
    expect(css.match(/\}/g)).toHaveLength(1);
  });

  it('emits nothing when the theme has no colour (the CSS defaults stand)', () => {
    expect(themeVarsCss({})).toBe('');
    expect(themeVarsCss(undefined)).toBe('');
    expect(themeVarsCss({ theme_primary_color: 'not-a-colour' })).toBe('');
  });

  it('is idempotent, because both the server and the client set it', () => {
    const s = { theme_primary_color: '#0ea5e9' };
    expect(themeVarsCss(s)).toBe(themeVarsCss(s));
  });
});

describe('the palette is wired through, not hard-coded twice', () => {
  const config = fs.readFileSync(path.join(root, 'frontend/tailwind.config.js'), 'utf8');

  it('reads the shades from CSS variables so the setting reaches every utility', () => {
    // The whole point: `text-primary-600` has to follow --primary-600, or the
    // ~120 palette utilities ignore the theme colour again.
    for (const shade of SHADES) {
      // The keys are unquoted numeric literals in the config.
      expect(config, 'primary.' + shade).toContain(shade + ": 'rgb(var(--primary-" + shade + ") / <alpha-value>)'");
    }
    expect(config).not.toMatch(/primary:\s*\{\s*50:\s*'#/);   // no fixed hexes left
  });

  it('has the fallbacks in index.css, so an unthemed install still renders', () => {
    const css = fs.readFileSync(path.join(root, 'frontend/src/index.css'), 'utf8');
    for (const shade of SHADES) expect(css, '--primary-' + shade).toContain('--primary-' + shade + ':');
  });
});
