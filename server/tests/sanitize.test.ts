import { describe, it, expect } from 'vitest';
import { sanitizeHtml } from '../src/utils/sanitize';

describe('sanitizeHtml', () => {
  it('keeps valid content and formatting', () => {
    expect(sanitizeHtml('<p>Hello <strong>world</strong> <a href="https://example.com">link</a></p>'))
      .toBe('<p>Hello <strong>world</strong> <a href="https://example.com">link</a></p>');
  });

  it('strips script/iframe/style blocks entirely', () => {
    expect(sanitizeHtml('<script>alert(1)</script><p>ok</p>')).toBe('<p>ok</p>');
    expect(sanitizeHtml('<iframe src="https://evil.com"></iframe><p>ok</p>')).toBe('<p>ok</p>');
    expect(sanitizeHtml('<style>body{}</style><p>ok</p>')).toBe('<p>ok</p>');
  });

  it('strips event handlers', () => {
    expect(sanitizeHtml('<img src="x" onerror="alert(1)">')).toBe('<img src="x">');
  });

  it('blocks javascript: URLs', () => {
    expect(sanitizeHtml('<a href="javascript:alert(1)">x</a>')).toBe('<a>x</a>');
  });

  it('blocks obfuscated javascript: URLs (whitespace inside scheme)', () => {
    expect(sanitizeHtml('<a href="java\nscript:alert(1)">x</a>')).toBe('<a>x</a>');
    expect(sanitizeHtml('<a href="java\tscript:alert(1)">x</a>')).toBe('<a>x</a>');
  });

  it('blocks entity-encoded javascript: URLs', () => {
    expect(sanitizeHtml('<a href="&#106;avascript:alert(1)">x</a>')).toBe('<a>x</a>');
  });

  it('blocks data: and vbscript: URLs', () => {
    expect(sanitizeHtml('<img src="data:text/html;base64,PHNjcmlwdD4=">')).toBe('<img>');
    expect(sanitizeHtml('<a href="vbscript:msgbox(1)">x</a>')).toBe('<a>x</a>');
  });

  it('drops non-whitelisted tags', () => {
    expect(sanitizeHtml('<form action="x"><input name="y"></form><p>ok</p>')).toBe('<p>ok</p>');
    expect(sanitizeHtml('<svg onload="alert(1)"></svg><p>ok</p>')).toBe('<p>ok</p>');
  });

  it('handles empty input', () => {
    expect(sanitizeHtml('')).toBe('');
    expect(sanitizeHtml(null as unknown as string)).toBe('');
  });
});
