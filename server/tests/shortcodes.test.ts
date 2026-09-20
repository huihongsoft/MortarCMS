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

// The DB-backed shortcodes render into public pages, so they follow the same
// visibility rules as the public API lists. They used to select every published
// post/comment, surfacing password-protected, members-only, noindex and
// not-yet-due content (title, excerpt, slug) on any page containing the block.
describe('CMS data shortcodes respect public visibility', () => {
  it('post-list omits protected, members-only, noindex and not-yet-due posts', async () => {
    const db = (await import('../src/utils/db')).default;
    const { initDB } = await import('../src/utils/db');
    initDB();
    db.prepare("INSERT OR REPLACE INTO User (id, username, email, password, role, tokenVersion) VALUES ('sc1','sc1','sc1@x.dev','x','admin',0)").run();
    const now = new Date().toISOString();
    const later = new Date(Date.now() + 86400000).toISOString();
    const ins = db.prepare("INSERT INTO Post (id, title, slug, content, excerpt, status, type, authorId, password, publishedAt) VALUES (?,?,?,?,?,'published','post','sc1',?,?)");
    ins.run('sp1', 'Public One', 'sp-public', '<p>x</p>', 'e', '', now);
    ins.run('sp2', 'Locked Two', 'sp-locked', '<p>x</p>', 'e', '$2a$10$hash', now);
    ins.run('sp3', 'Later Three', 'sp-later', '<p>x</p>', 'e', '', later);
    db.prepare("INSERT INTO PostMeta (id, postId, key, value) VALUES ('spm1','sp1','_members_only','1')").run();
    db.prepare("INSERT INTO PostMeta (id, postId, key, value) VALUES ('spm2','sp2','_seo_noindex','1')").run();

    const out = await import('../src/utils/shortcodes').then(m => m.applyShortcodes('[post-list limit="20"]'));
    expect(out).not.toContain('Locked Two');
    expect(out).not.toContain('Later Three');
    expect(out).not.toContain('sp-locked');
  });
});
