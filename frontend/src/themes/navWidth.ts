// Top-nav width classes (Settings > Reading > nav width). Only top-nav themes
// apply it; a side-nav theme's header ignores it.
export const NAV_W: Record<string, string> = {
  narrow: 'max-w-3xl',
  normal: 'max-w-5xl',
  wide: 'max-w-7xl',
  full: 'max-w-none',
};

// Resolve the requested width, falling back to the theme's own default so an
// unset / invalid value never changes a theme's existing header width.
export function navWidthClass(setting: string | undefined, fallback: string): string {
  return NAV_W[setting || ''] || fallback;
}
