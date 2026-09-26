import db from './db';
import { currentPlugin } from './pluginApi';
import { PUBLIC_POST_CONDITIONS } from './publicPosts';
import { postUrl } from './slug';

// Shortcode system: [tag attr="value"]content[/tag]
type ShortcodeFn = (attrs: Record<string, string>, content: string, ctx: any) => string;

// Escape dynamic text fields before they are spliced into shortcode HTML.
// Shortcode output is rendered server-side and injected via innerHTML on the
// frontend, so every database-sourced value must be escaped here.
function esc(v: any): string {
  return String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

const shortcodes = new Map<string, { fn: ShortcodeFn; desc?: string; source: string }>();

export function addShortcode(name: string, fn: ShortcodeFn, desc?: string): void {
  const source = currentPlugin() || 'core';
  const existing = shortcodes.get(name);
  // Overriding is allowed (WordPress works the same way), but a silent
  // replacement between two different owners is a debugging trap.
  if (existing && existing.source !== source) {
    console.log('[Shortcodes] "' + name + '" registered by ' + source + ' replaces the one from ' + existing.source);
  }
  // Tagged like hooks, so deactivating a plugin can take its shortcodes with it
  // (a `[hello]` tag kept rendering after the plugin was disabled).
  shortcodes.set(name, { fn, desc, source });
}

// Remove every shortcode a plugin registered; called on deactivate and before a
// re-register, so toggling a plugin cannot stack duplicate handlers.
export function removeShortcodesBySource(source: string): number {
  let removed = 0;
  for (const [name, v] of [...shortcodes.entries()]) {
    if (v.source === source) { shortcodes.delete(name); removed++; }
  }
  return removed;
}

export function listShortcodes(): { name: string; desc?: string }[] {
  return [...shortcodes.entries()].map(([name, v]) => ({ name, desc: v.desc }));
}

// Render a single shortcode by name with attrs (used for live previews)
export function renderShortcode(name: string, attrs: Record<string, string> = {}, ctx: any = {}): string {
  const sc = shortcodes.get(name);
  if (!sc) return '';
  try { return sc.fn(attrs, '', ctx); } catch { return ''; }
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

addShortcode('post-list', (attrs, _content, ctx) => {
  const limit = Math.min(parseInt(attrs.limit || '5') || 5, 20);
  // Same conditions as the public API lists: a shortcode is rendered into a
  // public page, so it must not surface a password-protected, members-only,
  // noindex or not-yet-due post (it used to show all of them).
  // Site-scoped when the renderer knows the site (routes pass it in ctx), so a
  // block on site A's page cannot list site B's posts.
  const siteId = ctx?.siteId as string | undefined;
  const scope = siteId ? ' AND (p.siteId IS NULL OR p.siteId = ?)' : '';
  const args: any[] = [new Date().toISOString()];
  if (siteId) args.push(siteId);
  args.push(limit);
  const posts = db.prepare(
    "SELECT p.id, p.title, p.slug, p.excerpt, p.featured, p.publishedAt FROM Post p WHERE p.type = 'post' AND p.status = 'published' AND (p.publishedAt IS NULL OR p.publishedAt <= ?)" +
    PUBLIC_POST_CONDITIONS + scope + ' ORDER BY p.publishedAt DESC LIMIT ?'
  ).all(...args) as any[];
  if (posts.length === 0) return '<p class="text-gray-400 text-sm italic">No posts yet.</p>';
  const items = posts.map((p: any) => {
    const title = esc(p.title);
    const img = p.featured ? '<img src="' + esc(p.featured) + '" alt="' + title + '" loading="lazy" style="width:80px;height:80px;object-fit:cover;border-radius:8px;flex-shrink:0;">' : '';
    return '<a href="' + esc(postUrl(p.slug)) + '" style="display:flex;gap:16px;align-items:flex-start;padding:12px 0;border-bottom:1px solid #e5e7eb;text-decoration:none;color:inherit;">' + img + '<div><h4 style="margin:0 0 4px;font-size:15px;color:#111827;">' + title + '</h4><p style="margin:0;font-size:13px;color:#6b7280;line-height:1.5;">' + esc((p.excerpt || '').substring(0, 120)) + '</p></div></a>';
  }).join('');
  return '<div class="cms-rendered-post-list">' + items + '</div>';
}, 'Latest published posts (limit=)');

addShortcode('categories', () => {
  const cats = db.prepare('SELECT c.name, c.slug, COUNT(pc.postId) as cnt FROM Category c LEFT JOIN PostCategory pc ON pc.categoryId = c.id GROUP BY c.id ORDER BY c.name').all() as any[];
  if (cats.length === 0) return '<p class="text-gray-400 text-sm italic">No categories yet.</p>';
  const items = cats.map((c: any) => '<a href="/category/' + esc(c.slug) + '" style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f3f4f6;text-decoration:none;color:#374151;font-size:14px;"><span>' + esc(c.name) + '</span><span style="color:#9ca3af;">' + (c.cnt || 0) + '</span></a>').join('');
  return '<div class="cms-rendered-categories">' + items + '</div>';
}, 'Category list with post counts');

addShortcode('comments', (attrs, _content, ctx) => {
  const limit = Math.min(parseInt(attrs.limit || '5') || 5, 20);
  // The parent post must be publicly readable too — otherwise this renders the
  // title of a protected/draft/scheduled post together with its comments.
  const cSite = ctx?.siteId as string | undefined;
  const cScope = cSite ? ' AND (p.siteId IS NULL OR p.siteId = ?)' : '';
  const cArgs: any[] = [new Date().toISOString()];
  if (cSite) cArgs.push(cSite);
  cArgs.push(limit);
  const comments = db.prepare(
    "SELECT c.author, c.content, c.createdAt, p.title as postTitle, p.slug as postSlug FROM Comment c JOIN Post p ON p.id = c.postId WHERE c.status = 'approved' AND p.status = 'published' AND (p.publishedAt IS NULL OR p.publishedAt <= ?)" +
    PUBLIC_POST_CONDITIONS + cScope + ' ORDER BY c.createdAt DESC LIMIT ?'
  ).all(...cArgs) as any[];
  if (comments.length === 0) return '<p class="text-gray-400 text-sm italic">No comments yet.</p>';
  const items = comments.map((c: any) => '<div style="padding:10px 0;border-bottom:1px solid #f3f4f6;"><p style="margin:0;font-size:13px;color:#374151;">' + esc(c.content.substring(0, 150)) + '</p><p style="margin:4px 0 0;font-size:12px;color:#9ca3af;">' + esc(c.author) + ' on <a href="' + esc(postUrl(c.postSlug)) + '" style="color:#6b7280;text-decoration:none;">' + esc(c.postTitle || 'post') + '</a></p></div>').join('');
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
addShortcode('link-list', (attrs, _content, ctx) => {
  const catSlug = String(attrs.category || '').trim();
  let sql = "SELECT l.*, c.name as catName FROM Link l LEFT JOIN LinkCategory c ON c.id = l.categoryId WHERE l.active = 1";
  const params: any[] = [];
  if (catSlug) { sql += ' AND c.slug = ?'; params.push(catSlug); }
  // Scoped to the page/post's site when the content has one — visibility
  // follows the category (global category = everywhere, site-owned = that site)
  const siteId = ctx?.siteId;
  if (siteId) {
    sql += ' AND (c.siteId IS NULL OR c.siteId = ?)';
    params.push(siteId);
  }
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
    const postLinks = posts.map((p: any) => '<a href="' + esc(postUrl(p.slug)) + '" style="display:inline-block;margin:6px 6px 0 0;padding:2px 10px;border-radius:999px;background:#e0edff;color:#1d4ed8;font-size:12px;text-decoration:none;">' + esc(p.title) + '</a>').join('');
    const postWrap = postLinks ? '<div style="margin-top:6px;">' + postLinks + '</div>' : '';
    return '<div style="display:flex;gap:12px;align-items:flex-start;padding:12px 0;border-bottom:1px solid #e5e7eb;">' + avatar +
      '<div style="min-width:0;flex:1;"><a href="' + esc(l.url) + '" target="_blank" rel="noopener noreferrer" style="font-weight:600;font-size:14px;color:#111827;text-decoration:none;">' + esc(l.name) + '</a>' + desc + postWrap + '</div></div>';
  }).join('');
  return '<div class="cms-rendered-link-list">' + items + '</div>';
}, 'Links of a navigation category (category=slug, optional)');

// [form id="slug"] — render a Form-builder form.
//
// The markup is plain HTML on purpose: post/page content is injected with
// innerHTML after DOMPurify, which strips <script>, so the previous version's
// inline submit handler never ran (the form fell back to a native POST and
// navigated the visitor to a JSON response). The frontend installs one delegated
// submit handler for `.cms-form` instead — see frontend/src/lib/cmsForms.ts.
addShortcode('form', (attrs, _content) => {
  const slug = String(attrs.id || '').trim();
  if (!slug) return '';
  const form = db.prepare('SELECT * FROM Form WHERE slug = ? AND enabled = 1').get(slug) as any;
  if (!form) return '';
  let fields: any[];
  try { fields = JSON.parse(form.fields || '[]'); } catch { return ''; }
  if (!Array.isArray(fields) || fields.length === 0) return '';
  const lang = siteLang();
  const zh = lang === 'zh';
  const submitLabel = zh ? '提交' : 'Submit';
  const inputs = fields.map((f: any, i: number) => {
    const name = esc(String(f.name || 'field' + i));
    const label = esc(String(f.label || f.name || name));
    const placeholder = esc(String(f.placeholder || ''));
    const required = f.required ? ' required' : '';
    const reqMark = f.required ? ' <span style="color:#dc2626;">*</span>' : '';
    const labelHtml = '<label for="cf-' + i + '" style="display:block;margin:0 0 6px;font-size:14px;font-weight:500;color:#374151;">' + label + reqMark + '</label>';
    // data-field carries the submission key: the sanitizer strips a `name`
    // attribute that would clobber a DOM global (a field called "name" is the
    // obvious one, and the browser drops it silently), so the frontend builds
    // the payload from data-field instead. `name` stays for the no-JS fallback.
    const common = 'id="cf-' + i + '" name="' + name + '" data-field="' + name + '" placeholder="' + placeholder + '"' + required +
      ' style="width:100%;box-sizing:border-box;padding:10px 12px;border:1px solid #d1d5db;border-radius:8px;font-size:14px;font-family:inherit;outline:none;background:#fff;color:#111827;margin:0 0 14px;"';
    const type = String(f.type || 'text');
    if (type === 'textarea') return labelHtml + '<textarea ' + common + ' rows="5"></textarea>';
    if (type === 'select') {
      const opts = String(f.options || '').split(',').map((s: string) => s.trim()).filter(Boolean);
      const optHtml = opts.map((o: string) => '<option value="' + esc(o) + '">' + esc(o) + '</option>').join('');
      return labelHtml + '<select ' + common + '>' + optHtml + '</select>';
    }
    const inputType = ['text', 'email', 'number', 'tel', 'url'].includes(type) ? type : 'text';
    return labelHtml + '<input type="' + inputType + '" ' + common + '>';
  }).join('');
  const msg = esc(form.successMessage || (zh ? '提交成功，感谢您的来信！' : 'Thank you! Your message has been sent.'));
  return '<div class="cms-form" data-form="' + esc(slug) + '" data-success="' + msg + '">' +
    // The action/method are for the no-JS case: without the delegated handler the
    // browser posts the fields to the endpoint instead of reloading the page.
    '<form class="cms-form-inner" action="/api/forms/' + esc(slug) + '/submit" method="post" novalidate style="max-width:560px;margin:0 auto;">' +
    '<input type="hidden" name="_form" value="' + esc(slug) + '">' +
    '<div style="position:absolute;left:-9999px;top:auto;width:1px;height:1px;overflow:hidden;" aria-hidden="true"><label>Leave this field empty<input type="text" name="_hp" tabindex="-1" autocomplete="off"></label></div>' +
    inputs +
    '<button type="submit" style="padding:10px 22px;background:#2563eb;color:#fff;border:none;border-radius:8px;font-size:14px;cursor:pointer;">' + submitLabel + '</button>' +
    '<p class="cms-form-msg" role="status" hidden style="margin:14px 0 0;font-size:14px;"></p>' +
    '</form>' +
    '</div>';
}, 'Render a form builder form (id=slug)');

// [download id="media-id" label="..."] — download button for a media file.
// Clicks go through /api/media/:id/download which counts the download and
// redirects to the file (works for local and object-storage media alike).
addShortcode('download', (attrs) => {
  const id = String(attrs.id || '').trim();
  const label = String(attrs.label || '').trim();
  if (!id) return '';
  const m = db.prepare('SELECT id, original, filename, url FROM Media WHERE id = ?').get(id) as any;
  if (!m) return '';
  const name = esc(label || m.original || m.filename || 'Download');
  return '<a href="/api/media/' + esc(id) + '/download" class="cms-download" style="display:inline-flex;align-items:center;gap:8px;padding:10px 20px;background:#2563eb;color:#fff;border-radius:8px;text-decoration:none;font-size:14px;">' + name + '</a>';
}, 'Download button for a media file (id=media-id, label=optional)');

// [newsletter] — subscribe form for the newsletter digest.
//
// Plain HTML like the [form] shortcode: content is injected with innerHTML
// after DOMPurify, which strips <script>, so the inline handler this used to
// carry never ran (the browser fell back to a native GET of the current URL).
// The frontend handles .cms-newsletter submissions in lib/cmsForms.ts.
addShortcode('newsletter', () => {
  const lang = siteLang();
  const zh = lang === 'zh';
  const emailLabel = zh ? '邮箱' : 'Email';
  const nameLabel = zh ? '称呼' : 'Name';
  const btnLabel = zh ? '订阅' : 'Subscribe';
  const sentMsg = zh ? '订阅成功，感谢关注！' : 'Subscribed! Thank you for joining.';
  const confirmMsg = zh ? '确认邮件已发送，请查收并点击确认' : 'A confirmation email has been sent — please check your inbox.';
  const inputStyle = 'width:100%;box-sizing:border-box;padding:9px 12px;border:1px solid #d1d5db;border-radius:8px;font-size:14px;outline:none;';
  const labelStyle = 'display:block;margin:0 0 4px;font-size:13px;color:#4b5563;';
  return '<div class="cms-newsletter" data-newsletter data-email-field="email" data-name-field="name"' +
    ' data-sent="' + esc(sentMsg) + '" data-confirm="' + esc(confirmMsg) + '">' +
    // No-JS fallback: without the delegated handler this posts the form to the
    // subscribe endpoint and the browser at least leaves the page correctly.
    '<form class="cms-newsletter-form" action="/api/newsletter/subscribe" method="post" novalidate style="max-width:420px;margin:0 auto;display:flex;flex-direction:column;gap:10px;">' +
    '<div><label for="nl-name" style="' + labelStyle + '">' + esc(nameLabel) + '</label>' +
    '<input id="nl-name" name="name" type="text" data-field="name" style="' + inputStyle + '"></div>' +
    '<div><label for="nl-email" style="' + labelStyle + '">' + esc(emailLabel) + ' *</label>' +
    '<input id="nl-email" name="email" type="email" required data-field="email" style="' + inputStyle + '"></div>' +
    '<button type="submit" style="padding:9px 18px;background:#2563eb;color:#fff;border:none;border-radius:8px;font-size:14px;cursor:pointer;">' + esc(btnLabel) + '</button>' +
    '<p class="cms-form-msg" role="status" hidden style="margin:0;font-size:14px;"></p>' +
    '</form>' +
    '</div>';
}, 'Newsletter subscribe form');

function siteLang(): string {
  try {
    const row = db.prepare("SELECT value FROM Setting WHERE key = 'site_lang'").get() as any;
    return row?.value === 'zh' ? 'zh' : 'en';
  } catch { return 'en'; }
}

// Replace VisualEditor CMS placeholder blocks with rendered shortcodes.
// Detects <div data-cms="xxx"> elements and replaces them entirely with
// the corresponding shortcode output. Uses depth counting so nested divs
// (e.g. blocks wrapped in sections/columns) are matched correctly.
export function renderCmsBlocks(html: string, ctx: any = {}): string {
  if (!html) return html;
  const cmsTypes = ['post-list', 'categories', 'comments', 'search', 'archive', 'tag-cloud', 'link-list'];
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
      // data-* attributes on the block (e.g. data-category="ai") become
      // shortcode attrs, so blocks with settings render like the text shortcode
      const attrs: Record<string, string> = {};
      for (const m of out.slice(openStart, openEnd + 1).matchAll(/(\w[\w-]*)="([^"]*)"/g)) {
        const key = m[1], val = m[2];
        if (key.startsWith('data-') && key !== 'data-cms' && key !== 'data-gjs-type') {
          attrs[key.slice(5)] = val.replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
        }
      }
      let rendered: string;
      try { rendered = sc.fn(attrs, '', ctx); } catch { rendered = ''; }
      out = out.slice(0, openStart) + rendered + out.slice(closeEnd + '</div>'.length);
      searchFrom = openStart + rendered.length;
    }
  }
  return out;
}
