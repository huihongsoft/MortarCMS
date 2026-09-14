// Whitelist HTML sanitizer (XSS guard): keeps common formatting tags, strips
// scripts/iframes/event handlers. Used for AI-generated content and for
// content arriving via import (WXR / JSON), where the source cannot be
// trusted. Closing tags are preserved as closing tags.
const ALLOWED_TAGS = new Set(['p','br','h1','h2','h3','h4','ul','ol','li','strong','b','em','i','u','a','img','blockquote','code','pre','hr','table','thead','tbody','tr','th','td','span','div','figure','figcaption','small','mark','del','sub','sup','details','summary']);
const ALLOWED_ATTRS = new Set(['href','src','alt','title','target','rel','width','height','style','colspan','rowspan']);

// Named entities a browser will decode inside an attribute value. Anything not
// listed is dropped by the caller rather than left in place: an unknown entity
// must not be able to hide a character (`java&foo;script:` would otherwise
// decode to `javascript:` in the browser but read as harmless here).
const NAMED_ENTITIES: Record<string, string> = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", '#39': "'",
  colon: ':', tab: '\t', newline: '\n', nbsp: '\u00a0',
};

// Decode HTML entities so URL scheme checks see the decoded value (browsers
// decode `&#106;avascript:` and `javascript&colon;` before parsing).
function decodeEntities(s: string): string {
  return s
    .replace(/&#(x?[0-9a-f]+);?/gi, (_m, code: string) => {
      const n = /^x/i.test(code) ? parseInt(code.slice(1), 16) : parseInt(code, 10);
      return Number.isNaN(n) ? _m : String.fromCodePoint(n);
    })
    .replace(/&([a-z][a-z0-9]*|#39);/gi, (_m, e: string) => NAMED_ENTITIES[e.toLowerCase()] ?? '');
}

// Attribute separators: HTML treats `/` like whitespace between attributes
// (`<img/src=x/onerror=alert(1)>` parses as src + onerror), so every attribute
// scan must accept it — otherwise the tag is not recognised at all and passes
// through with its event handler intact.
const ATTR_SEP = '[\\s/]';

// The URL spec strips tabs/newlines during parsing, so `java\nscript:` would
// otherwise execute — normalize whitespace out of the scheme before checking.
// Exported so every attribute-stripping pass (including the SVG upload sanitizer)
// shares one implementation instead of growing its own weaker regexes.
export function isUnsafeUrl(value: string): boolean {
  const v = decodeEntities(value).replace(/[\t\n\f\r ]/g, '').toLowerCase();
  return /^(javascript|vbscript|data|file):/.test(v);
}

// Remove event-handler attributes. `ATTR_SEP` matters: HTML also accepts `/` as
// an attribute separator, so a `\s`-only pattern lets `<img/src=x/onerror=…>`
// through with the handler intact.
export function stripEventHandlerAttrs(html: string): string {
  return html.replace(new RegExp(ATTR_SEP + 'on\\w+\\s*=\\s*("[^"]*"|\'[^\']*\'|[^\\s>]+)', 'gi'), '');
}

// Blank out href/src values whose scheme is dangerous once entities and
// whitespace are decoded.
export function stripUnsafeUrlAttrs(html: string): string {
  return html.replace(/(href|src|xlink:href)\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, (full, attr: string, val: string) => {
    const raw = val.replace(/^(["'])|(["'])$/g, '');
    return isUnsafeUrl(raw) ? attr + '=""' : full;
  });
}

// Removes active content (scripts, frames, form controls, event handlers and
// dangerous URL schemes) while preserving the rest of the markup — classes,
// styles and custom structure included. Use where a strict tag whitelist would
// break legitimate layout (e.g. custom block templates).
export function stripDangerousHtml(input: string): string {
  if (!input) return '';
  let html = String(input);
  html = html.replace(/<(script|style|iframe|object|embed|form|input|textarea|button|select|svg|math|link|meta|base)[\s\S]*?<\/\1>/gi, '');
  html = html.replace(/<\/?(script|iframe|object|embed|form|input|textarea|button|select|svg|math|link|meta|base)[^>]*>/gi, '');
  html = stripEventHandlerAttrs(html);
  html = stripUnsafeUrlAttrs(html);
  return html;
}

// CSS guard for styles that end up in a <style> tag. Blocks @import, legacy
// script vectors and script-capable URL schemes; allows data:image raster URLs
// (commonly used by the visual editor).
export function sanitizeCssText(input: string): string {
  return String(input || '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/@import[^;]+;?/gi, '')
    .replace(/expression\s*\([^)]*\)/gi, '')
    .replace(/(?:behavior|-moz-binding)\s*:[^;}]+;?/gi, '')
    .replace(/url\(\s*['"]?\s*(?:j\s*a\s*v\s*a\s*s\s*c\s*r\s*i\s*p\s*t|v\s*b\s*s\s*c\s*r\s*i\s*p\s*t|file)\s*:/gi, 'url(')
    .replace(/url\(\s*['"]?\s*data\s*:\s*text\/html/gi, 'url(')
    .replace(/url\(\s*['"]?\s*data\s*:\s*image\/svg/gi, 'url(');
}

export function sanitizeHtml(input: string): string {
  if (!input) return '';
  let html = String(input);
  // Strip script/style/iframe/object/embed blocks entirely
  html = html.replace(/<(script|style|iframe|object|embed|form|input|textarea|button|select|svg|math|link|meta|base)[\s\S]*?<\/\1>/gi, '');
  html = html.replace(/<\/(script|style|iframe|object|embed|form|input|textarea|button|select|svg|math|link|meta|base)>/gi, '');
  // Strip event handlers and dangerous URL schemes
  html = html.replace(new RegExp(ATTR_SEP + 'on\\w+\\s*=\\s*("[^"]*"|\'[^\']*\'|[^\\s>]+)', 'gi'), '');
  // Keep only allowed tags (simple tag whitelist pass). The attribute separator
  // must include `/`, otherwise `<img/src=x/onerror=…>` fails to match here and
  // is emitted verbatim — the browser then parses the handler back out.
  html = html.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)((?:[\s/]+[a-zA-Z-]+(?:\s*=\s*("[^"]*"|'[^']*'|[^\s>]+))?)*)\s*\/?>/g, (full, tag: string, attrsRaw: string) => {
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
