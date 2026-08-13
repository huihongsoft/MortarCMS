// SEO Tools plugin.
//
// Note: this plugin used to inject a "min read" line at the top of post
// content via the post_content filter, but the frontend already shows an
// accurate, localized reading time in the post meta row (CJK-aware). The
// plugin injection was redundant and its word-count was English-only, so
// Chinese articles always read "1 min read". The filter is removed — the
// plugin remains registered so enabled plugin lists keep working.

export function register() {
  // no-op: reading time is rendered by the frontend meta row
}
