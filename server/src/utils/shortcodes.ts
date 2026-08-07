import db from './db';

// WordPress-style shortcode system: [tag attr="value"]content[/tag]
type ShortcodeFn = (attrs: Record<string, string>, content: string, ctx: any) => string;

const shortcodes = new Map<string, ShortcodeFn>();

export function addShortcode(name: string, fn: ShortcodeFn): void {
  shortcodes.set(name, fn);
}

export function listShortcodes(): string[] {
  return [...shortcodes.keys()];
}

// Parse and render all shortcodes in an HTML string (server-side, like WP do_shortcode)
export function applyShortcodes(html: string, ctx: any = {}): string {
  if (!html || shortcodes.size === 0) return html;
  let out = html;
  // Nested content shortcodes: [tag ...]content[/tag]
  out = out.replace(/\[(\w+)([^\]]*)\]([\s\S]*?)\[\/\1\]/g, (full, name, attrsRaw, content) => {
    const fn = shortcodes.get(name);
    if (!fn) return full;
    try { return fn(parseAttrs(attrsRaw), content, ctx); } catch { return full; }
  });
  // Self-closing: [tag ...]
  out = out.replace(/\[(\w+)([^\]]*)\/\]/g, (full, name, attrsRaw) => {
    const fn = shortcodes.get(name);
    if (!fn) return full;
    try { return fn(parseAttrs(attrsRaw), '', ctx); } catch { return full; }
  });
  out = out.replace(/\[(\w+)([^\]]*)\]/g, (full, name, attrsRaw) => {
    const fn = shortcodes.get(name);
    if (!fn) return full;
    try { return fn(parseAttrs(attrsRaw), '', ctx); } catch { return full; }
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

// [gallery ids="1,2,3" columns="3" size="thumb"] -> responsive image grid
addShortcode('gallery', (attrs, _content, ctx) => {
  const ids = (attrs.ids || '').split(',').map(s => s.trim()).filter(Boolean);
  const columns = Math.min(parseInt(attrs.columns || '3') || 3, 6);
  const useThumb = attrs.size === 'thumb' || !attrs.size;
  const media = ids.length > 0
    ? db.prepare('SELECT id, url, thumbnail, alt, title FROM Media WHERE id IN (' + ids.map(() => '?').join(',') + ')').all(...ids) as any[]
    : [];
  if (media.length === 0) return '';
  const items = media.map((m: any) =>
    '<a href="' + m.url + '" target="_blank" class="gallery-item"><img loading="lazy" src="' + (useThumb && m.thumbnail ? m.thumbnail : m.url) + '" alt="' + (m.alt || m.title || '') + '"></a>'
  ).join('');
  return '<div class="gallery" style="display:grid;grid-template-columns:repeat(' + columns + ',1fr);gap:8px;">' + items + '</div>';
});

// [audio src="url"] -> audio player
addShortcode('audio', (attrs) => {
  const src = attrs.src || '';
  if (!src) return '';
  return '<audio controls preload="none" style="width:100%;"><source src="' + src + '"></audio>';
});

// [video src="url"] -> video player
addShortcode('video', (attrs) => {
  const src = attrs.src || '';
  if (!src) return '';
  return '<video controls preload="metadata" style="width:100%;border-radius:8px;"><source src="' + src + '"></video>';
});
