// Which posts a visitor — and therefore a crawler — can actually read.
//
// The sitemap and the RSS feed used to list every published post, including ones
// that are password-protected (the API only returns a title stub), marked
// members-only (anonymous requests get 403) or tagged noindex. Advertising a URL
// that is gated or explicitly excluded is self-defeating: search consoles report
// the mismatch and the sitemap stops being a trustworthy list.
//
// Expects the Post table to be aliased as `p`.
export const PUBLIC_POST_CONDITIONS = `
  AND (p.password IS NULL OR p.password = '')
  AND NOT EXISTS (SELECT 1 FROM PostMeta pm WHERE pm.postId = p.id AND pm.key = '_members_only' AND pm.value = '1')
  AND NOT EXISTS (SELECT 1 FROM PostMeta pm WHERE pm.postId = p.id AND pm.key = '_seo_noindex' AND pm.value = '1')
`;
