// Theme typography: a theme declares only the heading level cap (the highest
// level allowed in article body copy) and the max heading size in px. The
// per-level sizes are derived from those two values so the heading hierarchy
// never inverts. Rendering is presentation-only — content keeps its semantic
// h1-h6 tags, and h1 is simply shown at h2's size when the cap is 2.
export interface ThemeTypography {
  cap: number; // 1 = allow h1 in body copy, 2 = body copy starts at h2
  max: number; // largest heading size in px (h1 when cap=1, h1/h2 when cap=2)
}

const SCALE_CAP1 = [1, 0.833, 0.75, 0.667, 0.583, 0.5]; // h1..h6
const SCALE_CAP2 = [1, 1, 0.833, 0.75, 0.667, 0.583]; // h1 shares h2's size

export function headingSizes(t: ThemeTypography): Record<string, number> {
  const cap = t && t.cap === 1 ? 1 : 2;
  const max = Math.max(14, Math.min(48, Math.round((t && t.max) || 24)));
  const scale = cap === 1 ? SCALE_CAP1 : SCALE_CAP2;
  const sizes: Record<string, number> = {};
  for (let i = 0; i < 6; i++) sizes['h' + (i + 1)] = Math.round(max * scale[i] * 10) / 10;
  return sizes;
}

// CSS applied globally so every theme's `.prose` article body follows the
// active theme's heading standard (specificity above Tailwind's :where rules).
export function headingCss(t: ThemeTypography): string {
  const s = headingSizes(t);
  return '.prose h1{font-size:' + s.h1 + 'px}' +
    '.prose h2{font-size:' + s.h2 + 'px}' +
    '.prose h3{font-size:' + s.h3 + 'px}' +
    '.prose h4{font-size:' + s.h4 + 'px}' +
    '.prose h5{font-size:' + s.h5 + 'px}' +
    '.prose h6{font-size:' + s.h6 + 'px}';
}
