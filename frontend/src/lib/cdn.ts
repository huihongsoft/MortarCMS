// A CDN URL must be a plain http(s) origin — reject anything that could inject attributes
function safeCdn(cdn: string | undefined): string | null {
  if (!cdn) return null;
  if (/[\"'<>\s]/.test(cdn)) return null;
  if (!/^https?:\/\/[\w.-]+(\/\S*)?$/.test(cdn)) return null;
  return cdn.replace(/\/$/, '');
}

// Rewrite /uploads/ URLs to the configured CDN (WordPress-style CDN plugin behavior)
export function cdnUrl(url: string | undefined | null, settings: Record<string, string>): string | undefined {
  if (!url) return undefined;
  const cdn = safeCdn(settings.cdn_url);
  if (!cdn) return url;
  if (url.startsWith('/uploads/')) return cdn + url;
  return url;
}

// Rewrite all img src inside rendered HTML content + lazy-load
export function cdnHtml(html: string, settings: Record<string, string>): string {
  let out = html;
  const cdn = safeCdn(settings.cdn_url);
  if (cdn) {
    // Also rewrite data-src (gallery lightbox full-size URLs) and poster
    out = out.replace(/(src|href|data-src|poster)="\/uploads\//g, '$1="' + cdn + '/uploads/');
  }
  // Lazy load images that don't already declare loading
  return out.replace(/<img(?![^>]*loading=)[^>]*>/g, (m) => m.replace(/<img/, '<img loading="lazy"'));
}
