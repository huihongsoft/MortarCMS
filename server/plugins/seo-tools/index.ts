import { addFilter } from '../../src/utils/hooks';

export function register() {
  addFilter('post_content', (html: string, post: any) => {
    if (!html) return html;
    const words = html.replace(/<[^>]*>/g, ' ').trim().split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.round(words / 200));
    return '<div style="display:flex;align-items:center;gap:8px;color:#6b7280;font-size:12px;margin-bottom:16px;">\u23F1 ' + minutes + ' min read (seo-tools plugin)</div>' + html;
  }, 10, 'seo-tools');
}
