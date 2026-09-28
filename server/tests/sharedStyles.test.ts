import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

// The form-control and button classes exist once, in shared/ui.css, imported by
// both SPAs.
//
// They used to be two copies that were identical except for one thing: the admin's
// used a variable named `--admin-primary` that nothing in the codebase ever sets,
// so all 36 of its references took the #2563eb fallback. A fix to these classes had
// to be applied twice (it was, once, for the `.input-field` cascade bug), and the
// only thing keeping them in step was that nobody had touched one of them yet.
//
// This is the guard that replaces "somebody will notice": the shared file owns the
// selectors, the app stylesheets must not declare them again.

const root = path.resolve(__dirname, '../..');
const shared = fs.readFileSync(path.join(root, 'shared/ui.css'), 'utf8');

/** The rules both apps need, and which therefore live in the shared file. */
const SHARED_SELECTORS = [
  '.input-field',
  '.input-field:hover',
  '.input-field:focus',
  '.btn-primary',
  '.btn-primary:not(:disabled)',
  '.btn-primary:not(:disabled):hover',
  '.btn-primary:active:not(:disabled)',
  '.btn-primary:disabled',
  '.btn-secondary',
];

const APPS = [
  { name: 'admin', file: 'admin/src/index.css' },
  { name: 'frontend', file: 'frontend/src/index.css' },
];

describe('the shared component stylesheet', () => {
  it('declares every rule both apps need', () => {
    for (const sel of SHARED_SELECTORS) {
      // Anchored at the start of a line so `.btn-primary:disabled` is not
      // satisfied by `.btn-primary:disabled-thing`.
      const re = new RegExp('^\\s*' + sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*\\{', 'm');
      expect(shared, sel).toMatch(re);
    }
  });

  it('is the only place those rules are declared', () => {
    for (const app of APPS) {
      const css = fs.readFileSync(path.join(root, app.file), 'utf8');
      for (const sel of SHARED_SELECTORS) {
        const re = new RegExp('^\\s*' + sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*\\{', 'm');
        expect(css, `${app.name} re-declares ${sel}`).not.toMatch(re);
      }
    }
  });

  it('is imported by both apps', () => {
    for (const app of APPS) {
      const css = fs.readFileSync(path.join(root, app.file), 'utf8');
      expect(css, app.name).toMatch(/@import\s+'[^']*shared\/ui\.css';/);
    }
  });

  it('uses the one variable name, and no variable that is never set', () => {
    // `--admin-primary` was referenced 36 times and defined nowhere: an
    // indirection that looked themeable and was not.
    for (const app of APPS) {
      const css = fs.readFileSync(path.join(root, app.file), 'utf8');
      expect(css, app.name + ' still uses --admin-primary').not.toContain('--admin-primary');
    }
    expect(shared).toContain('var(--primary-color, #2563eb)');
    // The name the public site actually writes, from the theme settings.
    const themeColor = fs.readFileSync(path.join(root, 'frontend/src/lib/themeColor.ts'), 'utf8');
    expect(themeColor).toContain("'--primary-color:#'");
  });
});
