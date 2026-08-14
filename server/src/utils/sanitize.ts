// Whitelist HTML sanitizer (XSS guard): keeps common formatting tags, strips
// scripts/iframes/event handlers. Used for AI-generated content and for
// content arriving via import (WXR / JSON), where the source cannot be
// trusted. Closing tags are preserved as closing tags.
const ALLOWED_TAGS = new Set(['p','br','h1','h2','h3','h4','ul','ol','li','strong','b','em','i','u','a','img','blockquote','code','pre','hr','table','thead','tbody','tr','th','td','span','div','figure','figcaption','small','mark','del','sub','sup','details','summary']);
const ALLOWED_ATTRS = new Set(['href','src','alt','title','target','rel','width','height','style','colspan','rowspan']);

// Decode common HTML entities so URL scheme checks see the decoded value
// (browsers decode `&#106;avascript:` to `javascript:` before parsing).
function decodeEntities(s: string): string {
  return s
    .replace(/&#(x?[0-9a-f]+);?/gi, (_m, code: string) => {
      const n = /^x/i.test(code) ? parseInt(code.slice(1), 16) : parseInt(code, 10);
      return Number.isNaN(n) ? _m : String.fromCodePoint(n);
    })
    .replace(/&(amp|lt|gt|quot|apos|#39);/gi, (_m, e: string) => {
      const map: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", '#39': "'" };
      return map[e.toLowerCase()] ?? _m;
    });
}

// The URL spec strips tabs/newlines during parsing, so `java\nscript:` would
// otherwise execute — normalize whitespace out of the scheme before checking.
function isUnsafeUrl(value: string): boolean {
  const v = decodeEntities(value).replace(/[\t\n\f\r ]/g, '').toLowerCase();
  return /^(javascript|vbscript|data|file):/.test(v);
}

export function sanitizeHtml(input: string): string {
  if (!input) return '';
  let html = String(input);
  // Strip script/style/iframe/object/embed blocks entirely
  html = html.replace(/<(script|style|iframe|object|embed|form|input|textarea|button|select|svg|math|link|meta|base)[\s\S]*?<\/\1>/gi, '');
  html = html.replace(/<\/(script|style|iframe|object|embed|form|input|textarea|button|select|svg|math|link|meta|base)>/gi, '');
  // Strip event handlers and dangerous URL schemes
  html = html.replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '');
  // Keep only allowed tags (simple tag whitelist pass)
  html = html.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)((?:\s+[a-zA-Z-]+(?:\s*=\s*("[^"]*"|'[^']*'|[^\s>]+))?)*)\s*\/?>/g, (full, tag: string, attrsRaw: string) => {
    const t = tag.toLowerCase();
    if (!ALLOWED_TAGS.has(t)) return '';
    // Rebuild allowed attributes
    const attrs: string[] = [];
    const re = /([a-zA-Z-]+)(?:\s*=\s*("[^"]*"|'[^']*'|[^\s>]+))?/g;
    let m;
    while ((m = re.exec(attrsRaw)) !== null) {
      const name = m[1].toLowerCase();
      if (ALLOWED_ATTRS.has(name)) {
        // Drop href/src values with an obfuscated dangerous scheme
        if ((name === 'href' || name === 'src') && m[2] && isUnsafeUrl(m[2].replace(/^(["'])|(["'])$/g, ''))) {
          continue;
        }
        attrs.push(m[1] + (m[2] ? '=' + m[2] : ''));
      }
    }
    return (full.startsWith('</') ? '</' : '<') + t + (attrs.length ? ' ' + attrs.join(' ') : '') + '>';
  });
  return html;
}
