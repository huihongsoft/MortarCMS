// Server-side limits for the per-post SEO meta.
//
// The admin editor caps the fields in the browser (70 for the SEO title, 160 for
// the description) but the API, the AI tools and the importer all write PostMeta
// directly, so a value could arrive unbounded. These limits mirror the editor.
const SEO_FIELD_LIMITS: Record<string, number> = {
  _seo_title: 70,
  _seo_desc: 160,
  _seo_canonical: 500,
  _seo_og_image: 500,
  // A category id or slug, used for article:section.
  _seo_primary_category: 64,
};

// Normalise one SEO meta value before it is stored. Unknown keys pass through
// untouched so non-SEO meta (e.g. _visual_css, custom fields) is unaffected.
export function normalizeSeoField(key: string, value: string): string {
  if (key === '_seo_noindex') return String(value) === '1' ? '1' : '';
  const max = SEO_FIELD_LIMITS[key];
  const v = String(value);
  return max && v.length > max ? v.slice(0, max) : v;
}
