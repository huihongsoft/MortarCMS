import { Router, Response } from 'express';
import fs from 'fs';
import path from 'path';
import db, { cuid } from '../utils/db';
import { authenticate, requireCap, AuthRequest } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { execFileSync, execSync } from 'child_process';

const router = Router();
const themesDir = path.join(__dirname, '..', '..', 'themes');

export interface SettingField {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'checkbox' | 'select' | 'color' | 'number';
  options?: string[];
  default?: string;
}

export interface ThemeMeta {
  name: string;
  version: string;
  description: string;
  author: string;
  active: boolean;
  settings: Record<string, string>;
  settingsSchema: SettingField[];
  custom_css: string;
}

function readTheme(name: string): ThemeMeta | null {
  try {
    const p = path.join(themesDir, name, 'theme.json');
    if (!fs.existsSync(p)) return null;
    const meta = JSON.parse(fs.readFileSync(p, 'utf8'));
    return {
      name: meta.name || name,
      version: meta.version || '0.0.0',
      description: meta.description || '',
      author: meta.author || '',
      active: false,
      settings: meta.settings || {},
      settingsSchema: Array.isArray(meta.settingsSchema) ? meta.settingsSchema : [],
      custom_css: meta.custom_css || '',
    };
  } catch { return null; }
}

function activeThemeName(): string {
  const row = db.prepare("SELECT value FROM Setting WHERE key = 'theme_active'").get() as any;
  return row?.value || 'default';
}

// Theme override settings (editable in the admin Appearance panel) live under
// theme_<name>_<key> so each theme keeps its own values.
function themeOverrides(name: string): Record<string, string> {
  const rows = db.prepare("SELECT key, value FROM Setting WHERE key LIKE 'theme_" + name + "_%'").all() as any[];
  const map: Record<string, string> = {};
  for (const r of rows) map[r.key.replace('theme_' + name + '_', '')] = r.value;
  return map;
}

// Public: list all themes with active flag + full effective settings
router.get('/', (_req: AuthRequest, res: Response) => {
  try {
    const active = activeThemeName();
    const themes = fs.readdirSync(themesDir)
      .filter(d => fs.existsSync(path.join(themesDir, d, 'theme.json')))
      .map(d => {
        const t = readTheme(d)!;
        t.active = t.name === active;
        t.settings = { ...t.settings, ...themeOverrides(t.name) };
        return t;
      });
    res.json({ themes, active });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: activate a theme
router.post('/:name/activate', authenticate, requireCap('manage_options'), (req: AuthRequest, res: Response) => {
  try {
    const t = readTheme(req.params.name);
    if (!t) { res.status(404).json({ error: 'Theme not found' }); return; }
    db.prepare("INSERT INTO Setting (id, key, value) VALUES (?, 'theme_active', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").run('theme_active', t.name);
    res.json({ success: true, active: t.name });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: save theme setting overrides
router.put('/:name/settings', authenticate, requireCap('manage_options'), (req: AuthRequest, res: Response) => {
  try {
    const t = readTheme(req.params.name);
    if (!t) { res.status(404).json({ error: 'Theme not found' }); return; }
    const entries = req.body as Record<string, string>;
    const upsert = db.prepare("INSERT INTO Setting (id, key, value) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value");
    for (const [k, v] of Object.entries(entries)) upsert.run(cuid(), 'theme_' + t.name + '_' + k, String(v));
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: install a theme from a zip (theme.json + optional screenshot.css etc.)
router.post('/install', authenticate, requireCap('manage_options'), upload.single('file'), (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) { res.status(400).json({ error: 'No theme zip uploaded' }); return; }
    const tmpDir = path.join(require('os').tmpdir(), 'mortar-theme-' + Date.now());
    fs.mkdirSync(tmpDir, { recursive: true });
    execFileSync('unzip', ['-q', req.file.path, '-d', tmpDir]);
    // Find the theme root (dir containing theme.json)
    let root: string | null = null;
    if (fs.existsSync(path.join(tmpDir, 'theme.json'))) root = tmpDir;
    else {
      for (const e of fs.readdirSync(tmpDir)) {
        const p = path.join(tmpDir, e);
        if (fs.statSync(p).isDirectory() && fs.existsSync(path.join(p, 'theme.json'))) { root = p; break; }
      }
    }
    if (!root) { res.status(400).json({ error: 'theme.json not found in archive' }); return; }
    // Zip-slip guard
    const resolvedRoot = fs.realpathSync(root);
    const resolvedTmp = fs.realpathSync(tmpDir);
    if (!resolvedRoot.startsWith(resolvedTmp + path.sep)) { res.status(400).json({ error: 'Invalid archive structure' }); return; }
    const meta = JSON.parse(fs.readFileSync(path.join(root, 'theme.json'), 'utf8'));
    const name = meta.name;
    if (!name) { res.status(400).json({ error: 'theme.json missing name' }); return; }
    const dest = path.join(themesDir, name);
    if (fs.existsSync(dest)) { res.status(400).json({ error: 'Theme already exists: ' + name }); return; }
    fs.cpSync(root, dest, { recursive: true });
    try { fs.unlinkSync(req.file.path); } catch {}
    fs.rmSync(tmpDir, { recursive: true, force: true });
    res.status(201).json({ success: true, name, message: 'Theme installed. Activate it from the list above.' });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: rebuild built-in theme bundles from frontend source
// (frontend/src/themes/<name>/ -> vite build -> server/themes/<name>/theme.js)
router.post('/rebuild', authenticate, requireCap('manage_options'), (req: AuthRequest, res: Response) => {
  try {
    const frontendDir = path.join(__dirname, '..', '..', '..', 'frontend');
    if (!fs.existsSync(path.join(frontendDir, 'package.json'))) {
      res.status(400).json({ error: 'Frontend source not found on this server (' + frontendDir + ')' });
      return;
    }
    const builtin = ['default', 'magazine', 'twentytwentyfour', 'twentytwentyone', 'twentynineteen', 'twentyseventeen'];
    const results: string[] = [];
    for (const t of builtin) {
      // Skip themes that aren't installed on this server (user may have deleted them)
      if (!fs.existsSync(path.join(themesDir, t))) continue;
      const cmd = 'npx vite build --config vite.themes.config.ts';
      try {
        execSync(cmd, {
          cwd: frontendDir,
          timeout: 180000,
          encoding: 'utf8',
          env: { ...process.env, THEME_NAME: t },
        });
        const src = path.join(frontendDir, 'dist', 'themes', t + '.js');
        if (!fs.existsSync(src)) { results.push(t + ': build OK but output missing'); continue; }
        fs.copyFileSync(src, path.join(themesDir, t, 'theme.js'));
        results.push(t + ': rebuilt');
      } catch (err: any) {
        results.push(t + ': FAILED (' + (err.message || err).toString().split('\n')[0].slice(0, 120) + ')');
      }
    }
    const failed = results.filter(r => r.includes('FAILED'));
    res.json({ success: failed.length === 0, results, error: failed.length > 0 ? failed.join('; ') : null });
  } catch (err: any) {
    res.status(500).json({ error: 'Theme rebuild failed: ' + err.message });
  }
});

// Admin: delete a theme (cannot delete the active theme or the default)
router.delete('/:name', authenticate, requireCap('manage_options'), (req: AuthRequest, res: Response) => {
  try {
    const name = req.params.name;
    if (name === 'default') { res.status(400).json({ error: 'Cannot delete the default theme' }); return; }
    if (activeThemeName() === name) { res.status(400).json({ error: 'Activate another theme before deleting this one' }); return; }
    const dest = path.join(themesDir, name);
    if (!fs.existsSync(dest)) { res.status(404).json({ error: 'Theme not found' }); return; }
    fs.rmSync(dest, { recursive: true, force: true });
    // Clean overrides
    db.prepare("DELETE FROM Setting WHERE key LIKE 'theme_" + name + "_%'").run();
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Public: get all theme sections (HTML+CSS for hook locations)
router.get('/sections', (_req: AuthRequest, res: Response) => {
  try {
    const rows = db.prepare("SELECT key, value FROM Setting WHERE key LIKE 'theme_section_%'").all() as any[];
    const sections: Record<string, { html: string; css: string }> = {};
    rows.forEach((r: any) => {
      try { sections[r.key.replace('theme_section_', '')] = JSON.parse(r.value); } catch {}
    });
    res.json(sections);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: save a theme section for a hook location
router.put('/sections/:location', authenticate, requireCap('manage_options'), (req: AuthRequest, res: Response) => {
  try {
    const { location } = req.params;
    const { html, css } = req.body || {};
    if (!['before_header', 'after_header', 'before_content', 'after_content', 'before_footer', 'after_footer'].includes(location)) {
      res.status(400).json({ error: 'Invalid hook location' }); return;
    }
    const key = 'theme_section_' + location;
    const value = JSON.stringify({ html: html || '', css: css || '' });
    db.prepare('INSERT INTO Setting (id, key, value) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value')
      .run(cuid(), key, value);
    res.json({ success: true, location });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export { readTheme, activeThemeName, themeOverrides };
export default router;
