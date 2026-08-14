import { describe, it, expect } from 'vitest';
import { applyShortcodes } from '../src/utils/shortcodes';

// These tests cover attribute escaping only (no DB access); the shortcode
// system renders server-side into innerHTML, so quotes in attrs must never
// survive into the output.
describe('shortcode attribute escaping', () => {
  it('audio: escapes quotes in src (attribute injection)', () => {
    const out = applyShortcodes('[audio src="x" onerror="alert(1)"]');
    expect(out).toContain('<audio');
    expect(out).not.toContain('onerror');
    expect(out).not.toContain('" onerror');
  });

  it('audio: entity-quotes in src are double-escaped so they can never decode into an attribute boundary', () => {
    const out = applyShortcodes('[audio src="evil&quot; onerror=&quot;alert(1)"]');
    expect(out).toContain('&amp;quot;');
    expect(out).not.toContain('" onerror="');
  });

  it('video: escapes quotes in src (attribute injection)', () => {
    const out = applyShortcodes('[video src="x\" onerror=\"alert(1)"]');
    expect(out).toContain('<video');
    expect(out).not.toContain('onerror=');
  });

  it('video: keeps a normal URL intact', () => {
    expect(applyShortcodes('[video src="https://ok.com/v.mp4"]'))
      .toContain('<source src="https://ok.com/v.mp4">');
  });

  it('audio: keeps a normal URL intact', () => {
    expect(applyShortcodes('[audio src="https://ok.com/a.mp3"]'))
      .toContain('<source src="https://ok.com/a.mp3">');
  });

  it('unknown shortcodes are left untouched', () => {
    expect(applyShortcodes('[nope src="x"]')).toBe('[nope src="x"]');
  });
});
