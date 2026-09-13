// Render-time guard for CSS that ends up in a <style> tag (visual-editor CSS,
// admin previews). Complements the server-side write-time sanitizer.
// Not a full CSS parser — it blocks the known dangerous constructs
// (@import, expression(), legacy bindings, javascript:/vbscript:/data: URLs)
// including quoted and whitespace-obfuscated forms.
export function sanitizeCss(css: string): string {
  return String(css || '')
    .replace(/\/\*[\s\S]*?\*\//g, '')                       // comments can hide payloads
    .replace(/@import[^;]+;?/gi, '')
    .replace(/expression\s*\([^)]*\)/gi, '')
    .replace(/(?:behavior|-moz-binding)\s*:[^;}]+;?/gi, '')
    // url(  'javascript: ...  /  j a v a s c r i p t:  with optional quotes.
    // data: is allowed only for raster images; text/html and svg can carry
    // script, so those specific forms are neutralized (not all data: URIs).
    .replace(/url\(\s*['"]?\s*(?:j\s*a\s*v\s*a\s*s\s*c\s*r\s*i\s*p\s*t|v\s*b\s*s\s*c\s*r\s*i\s*p\s*t|file)\s*:/gi, 'url(')
    .replace(/url\(\s*['"]?\s*data\s*:\s*text\/html/gi, 'url(')
    .replace(/url\(\s*['"]?\s*data\s*:\s*image\/svg/gi, 'url(');
}
