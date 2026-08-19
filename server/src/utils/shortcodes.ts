import db from './db';

// Shortcode system: [tag attr="value"]content[/tag]
type ShortcodeFn = (attrs: Record<string, string>, content: string, ctx: any) => string;

// Escape dynamic text fields before they are spliced into shortcode HTML.
// Shortcode output is rendered server-side and injected via innerHTML on the
// frontend, so every database-sourced value must be escaped here.
function esc(v: any): string {
  return String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

const shortcodes = new Map<string, { fn: ShortcodeFn; desc?: string }>();

export function addShortcode(name: string, fn: ShortcodeFn, desc?: string): void {
  shortcodes.set(name, { fn, desc });
}

export function listShortcodes(): { name: string; desc?: string }[] {
  return [...shortcodes.entries()].map(([name, v]) => ({ name, desc: v.desc }));
}

// Render a single shortcode by name with attrs (used for live previews)
export function renderShortcode(name: string, attrs: Record<string, string> = {}): string {
  const sc = shortcodes.get(name);
  if (!sc) return '';
  try { return sc.fn(attrs, '', {}); } catch { return ''; }
}

// Parse and render all shortcodes in an HTML string (server-side, like WP do_shortcode)
export function applyShortcodes(html: string, ctx: any = {}): string {
  if (!html || shortcodes.size === 0) return html;
  let out = html;
  // Nested content shortcodes: [tag ...]content[/tag] (tag names may contain hyphens)
  out = out.replace(/\[([\w-]+)([^\]]*)\]([\s\S]*?)\[\/\1\]/g, (full, name, attrsRaw, content) => {
    const sc = shortcodes.get(name);
    if (!sc) return full;
    try { return sc.fn(parseAttrs(attrsRaw), content, ctx); } catch { return full; }
  });
  // Self-closing: [tag ...]
  out = out.replace(/\[([\w-]+)([^\]]*)\/\]/g, (full, name, attrsRaw) => {
    const sc = shortcodes.get(name);
    if (!sc) return full;
    try { return sc.fn(parseAttrs(attrsRaw), '', ctx); } catch { return full; }
  });
  out = out.replace(/\[([\w-]+)([^\]]*)\]/g, (full, name, attrsRaw) => {
    const sc = shortcodes.get(name);
    if (!sc) return full;
    try { return sc.fn(parseAttrs(attrsRaw), '', ctx); } catch { return full; }
  });
  return out;
}

function parseAttrs(raw: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  const re = /(\w+)(?:="([^"]*)"|='([^']*)'|="([^"]*)")?/g;
  let m;
  while ((m = re.exec(raw)) !== null) {
    attrs[m[1]] = m[2] || m[3] || m[4] || '';
  }
  return attrs;
}

// ---- Built-in shortcodes ----

// [gallery ids="1,2,3" columns="3" size="thumb"] -> responsive image grid (lightbox-ready)
addShortcode('gallery', (attrs, _content, ctx) => {
  const ids = (attrs.ids || '').split(',').map(s => s.trim()).filter(Boolean);
  const columns = Math.min(parseInt(attrs.columns || '3') || 3, 6);
  const useThumb = attrs.size === 'thumb' || !attrs.size;
  const media = ids.length > 0
    ? db.prepare('SELECT id, url, thumbnail, alt, title FROM Media WHERE id IN (' + ids.map(() => '?').join(',') + ')').all(...ids) as any[]
    : [];
  if (media.length === 0) return '';
  const gid = esc('g-' + ids.join('-'));
  const items = media.map((m: any) => {
    const caption = esc(m.alt || m.title || '');
    const displayUrl = useThumb && m.thumbnail ? m.thumbnail : m.url;
    return '<div class="gallery-item"><img loading="lazy" src="' + esc(displayUrl) + '" alt="' + caption + '" data-src="' + esc(m.url) + '" data-caption="' + caption + '"></div>';
  }).join('');
  return '<div class="gallery" data-gallery-id="' + gid + '" style="display:grid;grid-template-columns:repeat(' + columns + ',1fr);gap:8px;">' + items + '</div>';
}, 'Responsive image grid from the media library (ids=, columns=, size=)');

// [audio src="url"] -> audio player
addShortcode('audio', (attrs) => {
  const src = attrs.src || '';
  if (!src) return '';
  return '<audio controls preload="none" style="width:100%;"><source src="' + esc(src) + '"></audio>';
}, 'Audio player (src=)');

// [video src="url"] -> video player
addShortcode('video', (attrs) => {
  const src = attrs.src || '';
  if (!src) return '';
  return '<video controls preload="metadata" style="width:100%;border-radius:8px;"><source src="' + esc(src) + '"></video>';
}, 'Video player (src=)');

// ---- CMS Data shortcodes (used by VisualEditor dynamic blocks) ----

addShortcode('post-list', (attrs) => {
  const limit = Math.min(parseInt(attrs.limit || '5') || 5, 20);
  const posts = db.prepare("SELECT id, title, slug, excerpt, featured, publishedAt FROM Post WHERE type = 'post' AND status = 'published' ORDER BY publishedAt DESC LIMIT ?").all(limit) as any[];
  if (posts.length === 0) return '<p class="text-gray-400 text-sm italic">No posts yet.</p>';
  const items = posts.map((p: any) => {
    const title = esc(p.title);
    const img = p.featured ? '<img src="' + esc(p.featured) + '" alt="' + title + '" loading="lazy" style="width:80px;height:80px;object-fit:cover;border-radius:8px;flex-shrink:0;">' : '';
    return '<a href="/post/' + esc(p.slug) + '" style="display:flex;gap:16px;align-items:flex-start;padding:12px 0;border-bottom:1px solid #e5e7eb;text-decoration:none;color:inherit;">' + img + '<div><h4 style="margin:0 0 4px;font-size:15px;color:#111827;">' + title + '</h4><p style="margin:0;font-size:13px;color:#6b7280;line-height:1.5;">' + esc((p.excerpt || '').substring(0, 120)) + '</p></div></a>';
  }).join('');
  return '<div class="cms-rendered-post-list">' + items + '</div>';
}, 'Latest published posts (limit=)');

addShortcode('categories', () => {
  const cats = db.prepare('SELECT c.name, c.slug, COUNT(pc.postId) as cnt FROM Category c LEFT JOIN PostCategory pc ON pc.categoryId = c.id GROUP BY c.id ORDER BY c.name').all() as any[];
  if (cats.length === 0) return '<p class="text-gray-400 text-sm italic">No categories yet.</p>';
  const items = cats.map((c: any) => '<a href="/category/' + esc(c.slug) + '" style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f3f4f6;text-decoration:none;color:#374151;font-size:14px;"><span>' + esc(c.name) + '</span><span style="color:#9ca3af;">' + (c.cnt || 0) + '</span></a>').join('');
  return '<div class="cms-rendered-categories">' + items + '</div>';
}, 'Category list with post counts');

addShortcode('comments', (attrs) => {
  const limit = Math.min(parseInt(attrs.limit || '5') || 5, 20);
  const comments = db.prepare("SELECT c.author, c.content, c.createdAt, p.title as postTitle, p.slug as postSlug FROM Comment c JOIN Post p ON p.id = c.postId WHERE c.status = 'approved' ORDER BY c.createdAt DESC LIMIT ?").all(limit) as any[];
  if (comments.length === 0) return '<p class="text-gray-400 text-sm italic">No comments yet.</p>';
  const items = comments.map((c: any) => '<div style="padding:10px 0;border-bottom:1px solid #f3f4f6;"><p style="margin:0;font-size:13px;color:#374151;">' + esc(c.content.substring(0, 150)) + '</p><p style="margin:4px 0 0;font-size:12px;color:#9ca3af;">' + esc(c.author) + ' on <a href="/post/' + esc(c.postSlug) + '" style="color:#6b7280;text-decoration:none;">' + esc(c.postTitle || 'post') + '</a></p></div>').join('');
  return '<div class="cms-rendered-comments">' + items + '</div>';
}, 'Recent approved comments (limit=)');

addShortcode('search', () => {
  return '<form action="/search" method="get" style="display:flex;gap:8px;"><input type="text" name="q" placeholder="Search..." style="flex:1;padding:10px 14px;border:1px solid #d1d5db;border-radius:8px;font-size:14px;outline:none;"><button type="submit" style="padding:10px 20px;background:#3b82f6;color:#fff;border:none;border-radius:8px;font-size:14px;cursor:pointer;">Search</button></form>';
}, 'Site search form');

addShortcode('archive', () => {
  const months = db.prepare("SELECT strftime('%Y-%m', publishedAt) as month, COUNT(*) as cnt FROM Post WHERE type = 'post' AND status = 'published' AND publishedAt IS NOT NULL GROUP BY month ORDER BY month DESC LIMIT 12").all() as any[];
  if (months.length === 0) return '<p class="text-gray-400 text-sm italic">No archives yet.</p>';
  const items = months.map((m: any) => {
    const [y, mo] = m.month.split('-');
    const names = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return '<a href="/archive/' + y + '/' + mo + '" style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f3f4f6;text-decoration:none;color:#374151;font-size:14px;"><span>' + names[parseInt(mo)] + ' ' + y + '</span><span style="color:#9ca3af;">' + m.cnt + '</span></a>';
  }).join('');
  return '<div class="cms-rendered-archive">' + items + '</div>';
}, 'Monthly archive list');

addShortcode('tag-cloud', () => {
  // Hotness matches the frontend tag cloud: order/size by the aggregated
  // views of published posts, count only published posts (a tag with one
  // viral post outranks one with many unread posts).
  const tags = db.prepare("SELECT t.name, t.slug, COUNT(CASE WHEN p.status = 'published' AND p.type = 'post' THEN 1 END) as cnt, COALESCE(SUM(CASE WHEN p.status = 'published' AND p.type = 'post' THEN p.views ELSE 0 END), 0) as v FROM Tag t LEFT JOIN PostTag pt ON pt.tagId = t.id LEFT JOIN Post p ON p.id = pt.postId GROUP BY t.id ORDER BY v DESC, cnt DESC LIMIT 30").all() as any[];
  if (tags.length === 0) return '<p class="text-gray-400 text-sm italic">No tags yet.</p>';
  const maxCnt = Math.max(...tags.map((t: any) => t.v || 0), 1);
  const items = tags.map((t: any) => {
    const ratio = (t.v || 0) / maxCnt;
    const size = 12 + Math.round(ratio * 16); // 12px ~ 28px
    const name = esc(t.name);
    return '<a href="/tag/' + esc(t.slug) + '" title="' + (t.cnt || 0) + ' posts · ' + (t.v || 0) + ' views" style="display:inline-block;margin:4px 8px 4px 0;font-size:' + size + 'px;color:#6b7280;text-decoration:none;transition:color .15s;" onmouseover="this.style.color=\'#3b82f6\'" onmouseout="this.style.color=\'#6b7280\'">' + name + '</a>';
  }).join('');
  return '<div class="cms-rendered-tag-cloud" style="line-height:2;">' + items + '</div>';
}, 'Tag cloud sized by views');

// [link-list category="slug"] — render a navigation-site category's links
// (icon, name, description, associated posts) inside any page content.
// category is optional: without it, all active links are listed.
addShortcode('link-list', (attrs) => {
  const catSlug = String(attrs.category || '').trim();
  let sql = "SELECT l.*, c.name as catName FROM Link l LEFT JOIN LinkCategory c ON c.id = l.categoryId WHERE l.active = 1";
  const params: any[] = [];
  if (catSlug) { sql += ' AND c.slug = ?'; params.push(catSlug); }
  sql += ' ORDER BY l.categoryId ASC, l.menuOrder ASC, l.createdAt ASC';
  const links = db.prepare(sql).all(...params) as any[];
  if (links.length === 0) return '<p class="text-gray-400 text-sm italic">No links yet.</p>';
  // Associated posts for the listed links (one batch query)
  const postsByLink = new Map<string, any[]>();
  const ids = links.map((l: any) => l.id);
  (db.prepare('SELECT lp.linkId, p.id, p.title, p.slug FROM LinkPost lp JOIN Post p ON p.id = lp.postId WHERE lp.linkId IN (' + ids.map(() => '?').join(',') + ') ORDER BY p.createdAt DESC').all(...ids) as any[])
    .forEach((r: any) => { if (!postsByLink.has(r.linkId)) postsByLink.set(r.linkId, []); postsByLink.get(r.linkId)!.push(r); });
  const items = links.map((l: any) => {
    const posts = postsByLink.get(l.id) || [];
    const avatar = l.avatar ? '<img src="' + esc(l.avatar) + '" alt="" style="width:36px;height:36px;border-radius:50%;object-fit:cover;flex-shrink:0;">'
      : '<span style="width:36px;height:36px;border-radius:50%;background:#e0edff;color:#1d4ed8;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;flex-shrink:0;">' + esc((l.name || '?')[0].toUpperCase()) + '</span>';
    const desc = l.description ? '<p style="margin:4px 0 0;font-size:13px;color:#6b7280;line-height:1.5;">' + esc(l.description) + '</p>' : '';
    const postLinks = posts.map((p: any) => '<a href="/post/' + esc(p.slug) + '" style="display:inline-block;margin:6px 6px 0 0;padding:2px 10px;border-radius:999px;background:#e0edff;color:#1d4ed8;font-size:12px;text-decoration:none;">' + esc(p.title) + '</a>').join('');
    const postWrap = postLinks ? '<div style="margin-top:6px;">' + postLinks + '</div>' : '';
    return '<div style="display:flex;gap:12px;align-items:flex-start;padding:12px 0;border-bottom:1px solid #e5e7eb;">' + avatar +
      '<div style="min-width:0;flex:1;"><a href="' + esc(l.url) + '" target="_blank" rel="noopener noreferrer" style="font-weight:600;font-size:14px;color:#111827;text-decoration:none;">' + esc(l.name) + '</a>' + desc + postWrap + '</div></div>';
  }).join('');
  return '<div class="cms-rendered-link-list">' + items + '</div>';
}, 'Links of a navigation category (category=slug, optional)');

// Replace VisualEditor CMS placeholder blocks with rendered shortcodes.
// Detects <div data-cms="xxx"> elements and replaces them entirely with
// the corresponding shortcode output. Uses depth counting so nested divs
// (e.g. blocks wrapped in sections/columns) are matched correctly.
export function renderCmsBlocks(html: string): string {
  if (!html) return html;
  const cmsTypes = ['post-list', 'categories', 'comments', 'search', 'archive', 'tag-cloud'];
  let out = html;
  for (const type of cmsTypes) {
    const sc = shortcodes.get(type);
    if (!sc) continue;
    const marker = 'data-cms="' + type + '"';
    const openRe = /<div[\s>]/gi;
    const closeRe = /<\/div\s*>/gi;
    let searchFrom = 0;

    while (true) {
      const markerIdx = out.indexOf(marker, searchFrom);
      if (markerIdx === -1) break;
      // Find the opening <div ...> tag containing the marker
      const openStart = out.lastIndexOf('<div', markerIdx);
      if (openStart === -1) { searchFrom = markerIdx + marker.length; continue; }
      const openEnd = out.indexOf('>', openStart);
      if (openEnd === -1) { searchFrom = markerIdx + marker.length; continue; }
      // Count matching closing </div>
      let depth = 1;
      let i = openEnd + 1;
      let closeEnd = -1;
      while (i < out.length && depth > 0) {
        openRe.lastIndex = i;
        closeRe.lastIndex = i;
        const o = openRe.exec(out);
        const c = closeRe.exec(out);
        if (!o && !c) break;
        if (c && (!o || c.index < o.index)) {
          depth--;
          i = c.index + c[0].length;
          if (depth === 0) closeEnd = c.index;
        } else if (o) {
          depth++;
          i = o.index + o[0].length;
        }
      }
      if (closeEnd === -1) { searchFrom = markerIdx + marker.length; continue; }
      let rendered: string;
      try { rendered = sc.fn({}, '', {}); } catch { rendered = ''; }
      out = out.slice(0, openStart) + rendered + out.slice(closeEnd + '</div>'.length);
      searchFrom = openStart + rendered.length;
    }
  }
  return out;
}
