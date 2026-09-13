import DOMPurify from 'dompurify';

// Shared sanitizer for HTML that originates from settings / AI / imports
// (theme sections, HTML widgets). Scripts and event handlers are stripped;
// iframes are kept so legitimate embeds (video, maps) keep working. <style> is
// explicitly forbidden: DOMPurify does not sanitize the *text* of a style tag,
// so allowing it would reopen CSS-based injection (the CSS field on a theme
// section goes through sanitizeCss separately).
const CONFIG = {
  ADD_TAGS: ['iframe'],
  ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling', 'target', 'rel', 'loading', 'sandbox'],
  FORBID_TAGS: ['style'],
};

export function sanitizeHtml(html: string | undefined | null): string {
  return DOMPurify.sanitize(html || '', CONFIG);
}
