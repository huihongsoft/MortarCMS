import { describe, it, expect } from 'vitest';
import { sanitizeHtml, stripDangerousHtml } from '../src/utils/sanitize';

// Server-side sanitizer used for content arriving from import (WXR/JSON) and AI
// generation. Two bypasses were found and fixed:
//   1. named entities (&colon; &Tab; &NewLine;) hid a dangerous URL scheme,
//   2. `/` as an attribute separator made the tag scan miss the tag entirely, so
//      `<img/src=x/onerror=…>` was emitted verbatim with the handler intact.
describe('sanitizer: URL scheme obfuscation', () => {
  const payloads = [
    'javascript&colon;alert(1)',
    'java&Tab;script:alert(1)',
    'java&NewLine;script:alert(1)',
    'java\tscript:alert(1)',
    '&#106;avascript:alert(1)',
    'javascript:alert(1)',
    'vbscript:msgbox(1)',
    'data:text/html,<script>alert(1)</script>',
  ];

  it.each(payloads)('sanitizeHtml neutralises href=%s', (scheme) => {
    const out = sanitizeHtml('<a href="' + scheme + '">x</a>');
    expect(out.toLowerCase()).not.toContain('javascript');
    expect(out.toLowerCase()).not.toContain('vbscript');
    expect(out.toLowerCase()).not.toContain('script:');
    expect(out.toLowerCase()).not.toContain('data:');
  });

  it.each(payloads)('stripDangerousHtml neutralises href=%s', (scheme) => {
    const out = stripDangerousHtml('<a href="' + scheme + '">x</a>');
    expect(out.toLowerCase()).not.toContain('javascript');
    expect(out.toLowerCase()).not.toContain('vbscript');
    expect(out.toLowerCase()).not.toContain('data:');
  });

  it('keeps safe hrefs untouched', () => {
    const safe = '<a href="https://example.com/a?b=1&amp;c=2">x</a>';
    expect(sanitizeHtml(safe)).toContain('https://example.com/a?b=1');
    expect(stripDangerousHtml(safe)).toBe(safe);
  });
});

describe('sanitizer: slash-separated attributes', () => {
  it('drops an event handler written after a slash', () => {
    expect(sanitizeHtml('<img/src=x/onerror=alert(1)>')).toBe('<img src=x>');
    expect(stripDangerousHtml('<img/src=x/onerror=alert(1)>').toLowerCase()).not.toContain('onerror');
  });

  it('drops a non-whitelisted tag even with a slash separator', () => {
    expect(sanitizeHtml('<body/onload=alert(1)>')).toBe('');
    expect(stripDangerousHtml('<body/onload=alert(1)>').toLowerCase()).not.toContain('onload');
  });

  it('drops a slash-separated dangerous href', () => {
    const out = sanitizeHtml('<a/href="javascript&colon;alert(1)">x</a>');
    expect(out.toLowerCase()).not.toContain('javascript');
  });

  it('still drops ordinary event handlers', () => {
    expect(sanitizeHtml('<img src=x onerror="alert(1)">')).toBe('<img src=x>');
    expect(stripDangerousHtml('<div onclick="x()">y</div>').toLowerCase()).not.toContain('onclick');
  });
});

describe('sanitizer: legitimate markup survives', () => {
  it.each([
    '<p>hello <strong>world</strong></p>',
    '<a href="https://example.com" target="_blank" rel="noopener">link</a>',
    '<img src="/uploads/a.png" alt="x" width="100">',
    '<table><tr><td colspan="2">c</td></tr></table>',
    '<ul><li>a</li><li>b</li></ul>',
    '<div style="color:red">d</div>',
    '<h2>Title</h2><p>Body</p>',
    '<figure><img src="/uploads/b.jpg"><figcaption>cap</figcaption></figure>',
    '<blockquote><p>q</p></blockquote>',
  ])('keeps %s', (html) => {
    expect(sanitizeHtml(html)).toBe(html);
  });
});
