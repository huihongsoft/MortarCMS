import { addShortcode } from '../../src/utils/shortcodes';
import db from '../../src/utils/db';

// Content utility shortcodes:
//   [views]        — current view count of the current post
//   [word-count]   — word/character count of the current post content
//   [post-title]   — the current post title (no attrs)
// The "current post" is resolved from the render context (applyShortcodes is
// called with the post as ctx by the post/pages routes).

function countOf(content: string): number {
  const text = String(content || '').replace(/<[^>]*>/g, '');
  const cjk = (text.match(/[\u4e00-\u9fff\u3400-\u4dbf]/g) || []).length;
  const words = text.replace(/[\u4e00-\u9fff\u3400-\u4dbf]/g, ' ').split(/\s+/).filter(Boolean).length;
  return cjk + words;
}

export function register() {
  addShortcode('views', (_attrs, _content, ctx: any) => {
    const n = (ctx?.views ?? 0);
    return '<span class="shortcode-views">' + n + '</span>';
  }, 'Current post view count ([views])');

  addShortcode('word-count', (_attrs, _content, ctx: any) => {
    return '<span class="shortcode-word-count">' + countOf(ctx?.content || '') + '</span>';
  }, 'Word/character count of the current post ([word-count])');

  addShortcode('post-title', (_attrs, _content, ctx: any) => {
    const t = String(ctx?.title || '');
    return t ? '<span class="shortcode-post-title">' + t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</span>' : '';
  }, 'Current post title ([post-title])');
}
