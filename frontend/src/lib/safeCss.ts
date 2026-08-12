// Render-time guard for CSS that ends up in a <style> tag (visual-editor CSS,
// admin previews). Complements the server-side write-time sanitizer.
export function sanitizeCss(css: string): string {
  return String(css || '')
    .replace(/@import[^;]+;?/gi, '')
    .replace(/expression\([^)]*\)/gi, '')
    .replace(/behavior\s*:[^;}]+;?/gi, '')
    .replace(/url\(\s*(javascript|data):/gi, 'url(');
}
