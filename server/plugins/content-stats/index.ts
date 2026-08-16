import { addShortcode } from '../../src/utils/shortcodes';
import db from '../../src/utils/db';

// [stats] shortcode — renders site content counts. Optional attrs enable
// individual counters: [stats posts pages comments categories tags]
// (default: all). Output is plain inline markup that themes can style.
//
// Example: "本站已有 [stats posts] 篇文章、[stats comments] 条评论"

function count(sql: string): number {
  try { return (db.prepare(sql).get() as any)?.c || 0; } catch { return 0; }
}

export function register() {
  addShortcode('stats', (attrs) => {
    // With no attrs show everything; with attrs show only the listed counters
    const anyAttr = Object.keys(attrs).length > 0;
    const show = (k: string) => anyAttr ? (attrs[k] !== undefined && attrs[k] !== '0' && attrs[k] !== 'false') : true;
    const parts: string[] = [];
    if (show('posts', true)) parts.push('<span class="stat-posts"><strong>' + count("SELECT COUNT(*) c FROM Post WHERE type = 'post' AND status = 'published'") + '</strong> posts</span>');
    if (show('pages', true)) parts.push('<span class="stat-pages"><strong>' + count("SELECT COUNT(*) c FROM Post WHERE type = 'page' AND status = 'published'") + '</strong> pages</span>');
    if (show('comments', true)) parts.push('<span class="stat-comments"><strong>' + count("SELECT COUNT(*) c FROM Comment WHERE status = 'approved'") + '</strong> comments</span>');
    if (show('categories', true)) parts.push('<span class="stat-categories"><strong>' + count('SELECT COUNT(*) c FROM Category') + '</strong> categories</span>');
    if (show('tags', true)) parts.push('<span class="stat-tags"><strong>' + count('SELECT COUNT(*) c FROM Tag') + '</strong> tags</span>');
    return '<span class="content-stats" style="display:inline-flex;gap:12px;flex-wrap:wrap;">' + parts.join('') + '</span>';
  }, 'Site content statistics ([stats posts pages comments categories tags])');
}
