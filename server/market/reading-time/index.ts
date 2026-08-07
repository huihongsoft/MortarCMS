import { addFilter } from '../../src/utils/hooks';

export function register() {
  addFilter('post_content', (html: string) => {
    if (!html) return html;
    return '<p style="background:#f3f4f6;display:inline-block;padding:4px 10px;border-radius:999px;font-size:12px;color:#6b7280;">\u{1F4D6} Estimated reading time: ' + Math.max(1, Math.round(html.replace(/<[^>]*>/g, ' ').trim().split(/\s+/).filter(Boolean).length / 200)) + ' min</p>' + html;
  });
}
