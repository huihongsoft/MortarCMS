import { describe, it, expect } from 'vitest';
import { normalizeDomainInput, parseSiteUrl } from '../src/utils/siteUrl';

describe('normalizeDomainInput', () => {
  it.each([
    ['HTTP://Example.com/', 'example.com'],
    ['blog.example.com:8080', 'blog.example.com'],
    ['example.com/path?q=1#frag', 'example.com'],
    ['https://user:pass@example.com', 'example.com'],
    ['[::1]:3001', '[::1]'],
    ['  Example.COM  ', 'example.com'],
    ['', ''],
    ['   ', ''],
  ])('%j -> %j', (input, expected) => {
    expect(normalizeDomainInput(input)).toBe(expected);
  });

  it('does not mangle a bare IPv6 literal', () => {
    // Several colons: the port-stripping rule must not fire.
    expect(normalizeDomainInput('::1')).toBe('::1');
  });

  it('strips a trailing root dot, which is the same host', () => {
    // Otherwise the stored domain never equals the Host header.
    expect(normalizeDomainInput('example.com.')).toBe('example.com');
    expect(normalizeDomainInput('blog.example.com.:8080')).toBe('blog.example.com');
  });

  it('handles non-string input without throwing', () => {
    expect(normalizeDomainInput(null)).toBe('');
    expect(normalizeDomainInput(undefined)).toBe('');
  });
});

describe('parseSiteUrl', () => {
  it('normalizes scheme and host, dropping a default port', () => {
    expect(parseSiteUrl('https://Example.com/')).toEqual({ url: 'https://example.com', domain: 'example.com' });
  });

  it('keeps a non-default port in the URL but not in the domain', () => {
    // The resolver strips the port from the Host header, so the domain must not carry one.
    expect(parseSiteUrl('http://localhost:3001/')).toEqual({ url: 'http://localhost:3001', domain: 'localhost' });
  });

  it('keeps IPv6 brackets so the Host comparison can match', () => {
    expect(parseSiteUrl('http://[::1]:3001/')).toEqual({ url: 'http://[::1]:3001', domain: '[::1]' });
  });

  it('accepts a URL with no trailing slash', () => {
    expect(parseSiteUrl('https://example.com')).toEqual({ url: 'https://example.com', domain: 'example.com' });
  });

  it('normalizes a trailing root dot instead of storing it', () => {
    expect(parseSiteUrl('https://example.com.')).toEqual({ url: 'https://example.com', domain: 'example.com' });
  });

  it('accepts a single-label host such as localhost or an intranet name', () => {
    expect(parseSiteUrl('http://mortar/')).toEqual({ url: 'http://mortar', domain: 'mortar' });
  });

  it('punycodes an IDN host, matching what browsers put in Host', () => {
    const u = new URL('https://例子.测试/');
    const r = parseSiteUrl('https://例子.测试/');
    expect('error' in r).toBe(false);
    if (!('error' in r)) {
      expect(r.url).toBe(u.origin);
      expect(r.domain).toBe(u.hostname);
    }
  });

  it.each([
    ['blank', ''],
    ['whitespace only', '   '],
    ['no scheme', 'example.com'],
    ['non-http scheme', 'ftp://example.com'],
    ['path', 'https://example.com/blog'],
    ['double slash path', 'https://example.com//'],
    ['embedded space', 'https://exa mple.com'],
    ['userinfo', 'https://user:pass@example.com'],
    ['query string', 'https://example.com?q=1'],
    ['hash', 'https://example.com#frag'],
    ['control character', 'https://example.com\u0000'],
    ['not a URL', 'not-a-url'],
    ['non-string', {} as any],
    // Malformed hostnames: accepted by URL but would never match a Host header.
    ['empty label', 'https://.example.com'],
    ['double dot', 'https://example..com'],
    ['leading hyphen', 'https://-example.com'],
    ['trailing hyphen', 'https://example.com-'],
    ['plus sign', 'https://exa+mple.com'],
    ['label over 63 chars', 'https://' + 'a'.repeat(64) + '.example.com'],
    ['host over 253 chars', 'https://' + Array(13).fill('a'.repeat(60)).join('.') + '.com'],
  ])('rejects %s', (_label, input) => {
    const r = parseSiteUrl(input);
    expect('error' in r).toBe(true);
  });
});
