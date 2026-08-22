import { Router, Response } from 'express';
import fs from 'fs';
import path from 'path';
import db, { cuid } from '../utils/db';
import { authenticate, requireCap, authorize, AuthRequest } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { purgeAllCaches } from '../utils/cache';
import { execFileSync, execSync } from 'child_process';
import { assertSafeArchive } from '../utils/archive';

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
// The name is bound as a parameter and LIKE wildcards are escaped so a theme
// name cannot widen the match to unrelated settings.
function escapeLike(s: string): string { return s.replace(/[\\%_]/g, (c: string) => '\\' + c); }
function themeOverrides(name: string): Record<string, string> {
  const rows = db.prepare("SELECT key, value FROM Setting WHERE key LIKE ? ESCAPE '\\'").all('theme_' + escapeLike(name) + '_%') as any[];
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
router.post('/:name/activate', authenticate, authorize('admin'), (req: AuthRequest, res: Response) => {
  try {
    const t = readTheme(req.params.name);
    if (!t) { res.status(404).json({ error: 'Theme not found' }); return; }
    db.prepare("INSERT INTO Setting (id, key, value) VALUES (?, 'theme_active', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").run('theme_active', t.name);
    res.json({ success: true, active: t.name });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: save theme setting overrides
router.put('/:name/settings', authenticate, authorize('admin'), (req: AuthRequest, res: Response) => {
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
router.post('/install', authenticate, authorize('admin'), upload.single('file'), (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) { res.status(400).json({ error: 'No theme zip uploaded' }); return; }
    const tmpDir = path.join(require('os').tmpdir(), 'mortar-theme-' + Date.now());
    fs.mkdirSync(tmpDir, { recursive: true });
    // Zip-slip guard: reject traversal entries BEFORE anything hits the disk
    assertSafeArchive(req.file.path);
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
    // The name is used as a directory component: it must be a plain slug so a
    // crafted theme.json can never escape the themes directory (../ traversal).
    if (!name || !/^[a-z0-9][a-z0-9-_]*$/i.test(name)) { res.status(400).json({ error: 'theme.json name must be a plain alphanumeric slug' }); return; }
    const dest = path.join(themesDir, name);
    if (!dest.startsWith(path.join(themesDir, '')) || fs.existsSync(dest)) {
      res.status(400).json({ error: 'Theme already exists: ' + name }); return;
    }
    fs.cpSync(root, dest, { recursive: true });
    try { fs.unlinkSync(req.file.path); } catch {}
    fs.rmSync(tmpDir, { recursive: true, force: true });
    res.status(201).json({ success: true, name, message: 'Theme installed. Activate it from the list above.' });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: rebuild built-in theme bundles from frontend source
// (frontend/src/themes/<name>/ -> vite build -> server/themes/<name>/theme.js)
router.post('/rebuild', authenticate, authorize('admin'), (req: AuthRequest, res: Response) => {
  try {
    const frontendDir = path.join(__dirname, '..', '..', '..', 'frontend');
    if (!fs.existsSync(path.join(frontendDir, 'package.json'))) {
      res.status(400).json({ error: 'Frontend source not found on this server (' + frontendDir + ')' });
      return;
    }
    const builtin = ['default', 'magazine', 'aurora', 'twentytwentyfour', 'twentytwentyone', 'twentynineteen', 'twentyseventeen'];
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
router.delete('/:name', authenticate, authorize('admin'), (req: AuthRequest, res: Response) => {
  try {
    const name = req.params.name;
    if (name === 'default') { res.status(400).json({ error: 'Cannot delete the default theme' }); return; }
    if (activeThemeName() === name) { res.status(400).json({ error: 'Activate another theme before deleting this one' }); return; }
    const dest = path.join(themesDir, name);
    if (!fs.existsSync(dest)) { res.status(404).json({ error: 'Theme not found' }); return; }
    fs.rmSync(dest, { recursive: true, force: true });
    // Clean overrides
    db.prepare("DELETE FROM Setting WHERE key LIKE ? ESCAPE '\\'").run('theme_' + escapeLike(name) + '_%');
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: list theme files (safelisted extensions only, no traversal)
const SAFE_THEME_EXTS = ['.css', '.json', '.tsx', '.js'];
function safeThemePath(themeName: string, rel: string): string | null {
  if (!rel || rel.includes('..') || rel.startsWith('/')) return null;
  const full = path.resolve(path.join(themesDir, themeName), rel);
  if (!full.startsWith(path.resolve(path.join(themesDir, themeName)) + path.sep)) return null;
  return full;
}
router.get('/:name/files', authenticate, authorize('admin'), (req: AuthRequest, res: Response) => {
  try {
    const dir = path.join(themesDir, req.params.name);
    if (!fs.existsSync(dir)) { res.status(404).json({ error: 'Theme not found' }); return; }
    const walk = (d: string, base = ''): any[] => {
      const out: any[] = [];
      for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
        if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
        const rel = base ? base + '/' + entry.name : entry.name;
        if (entry.isDirectory()) out.push(...walk(path.join(d, entry.name), rel));
        else if (SAFE_THEME_EXTS.includes(path.extname(entry.name))) {
          const stat = fs.statSync(path.join(d, entry.name));
          out.push({ path: rel, size: stat.size });
        }
      }
      return out;
    };
    res.json({ files: walk(dir) });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});
router.get('/:name/file', authenticate, authorize('admin'), (req: AuthRequest, res: Response) => {
  try {
    const full = safeThemePath(req.params.name, String(req.query.path || ''));
    if (!full || !fs.existsSync(full)) { res.status(404).json({ error: 'File not found' }); return; }
    const content = fs.readFileSync(full, 'utf8');
    res.json({ content, path: req.query.path });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});
// Admin: edit a CSS file (the only writable type — safe from code injection)
router.put('/:name/file', authenticate, authorize('admin'), (req: AuthRequest, res: Response) => {
  try {
    const rel = String(req.body.path || '');
    if (!rel.endsWith('.css')) { res.status(400).json({ error: 'Only CSS files are editable' }); return; }
    const full = safeThemePath(req.params.name, rel);
    if (!full || !fs.existsSync(full)) { res.status(404).json({ error: 'File not found' }); return; }
    fs.writeFileSync(full, String(req.body.content || ''));
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
router.put('/sections/:location', authenticate, authorize('admin'), (req: AuthRequest, res: Response) => {
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

// ---- Theme backups: snapshot the effective settings (+ theme.json file) so
// style changes made in the Appearance panel or by AI tools can be rolled
// back. Stored in the Setting table (list index + per-backup blobs). ----
const MAX_BACKUPS_PER_THEME = 10;

function getAllBackups(): any[] {
  try {
    const row = db.prepare("SELECT value FROM Setting WHERE key = 'theme_backup_list'").get() as any;
    const list = row ? JSON.parse(row.value) : [];
    return Array.isArray(list) ? list : [];
  } catch { return []; }
}

function persistBackups(list: any[]): void {
  db.prepare('INSERT OR REPLACE INTO Setting (id, key, value) VALUES (?, ?, ?)').run('theme_backup_list', 'theme_backup_list', JSON.stringify(list));
}

export function themeBackupList(theme: string): any[] {
  return getAllBackups().filter((b: any) => b.theme === theme);
}

export function createThemeBackup(theme: string, name: string, note?: string, auto?: boolean): { id: string } | null {
  const t = readTheme(theme);
  if (!t) return null;
  const overrides = themeOverrides(t.name);
  const themeJsonPath = path.join(themesDir, t.name, 'theme.json');
  const themeJson = fs.existsSync(themeJsonPath) ? fs.readFileSync(themeJsonPath, 'utf8') : null;
  const id = 'bk_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
  const entry = { id, theme: t.name, name: String(name || '').slice(0, 80), note: String(note || '').slice(0, 200), auto: !!auto, createdAt: new Date().toISOString() };
  db.prepare('INSERT OR REPLACE INTO Setting (id, key, value) VALUES (?, ?, ?)').run('theme_backup_' + id, 'theme_backup_' + id, JSON.stringify({ ...entry, settings: overrides, themeJson }));
  // Trim this theme's backups to the cap, dropping the oldest ones
  const all = getAllBackups();
  const mine = themeBackupList(t.name);
  const others = all.filter((b: any) => b.theme !== t.name);
  const excess = mine.length + 1 - MAX_BACKUPS_PER_THEME;
  if (excess > 0) {
    const drop = mine.slice(0, excess);
    for (const d of drop) db.prepare('DELETE FROM Setting WHERE key = ?').run('theme_backup_' + d.id);
    persistBackups([...others, ...mine.slice(excess), entry]);
  } else {
    persistBackups([...others, ...mine, entry]);
  }
  return { id };
}

function deleteThemeBackup(id: string): boolean {
  const row = db.prepare('SELECT value FROM Setting WHERE key = ?').get('theme_backup_' + id) as any;
  if (!row) return false;
  const snap = JSON.parse(row.value);
  db.prepare('DELETE FROM Setting WHERE key = ?').run('theme_backup_' + id);
  const all = getAllBackups().filter((b: any) => b.id !== id);
  persistBackups(all);
  return !!snap;
}

router.get('/:name/backups', authenticate, authorize('admin'), (req: AuthRequest, res: Response) => {
  try {
    const t = readTheme(req.params.name);
    if (!t) { res.status(404).json({ error: 'Theme not found' }); return; }
    res.json({ backups: themeBackupList(t.name) });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.post('/:name/backups', authenticate, authorize('admin'), (req: AuthRequest, res: Response) => {
  try {
    const t = readTheme(req.params.name);
    if (!t) { res.status(404).json({ error: 'Theme not found' }); return; }
    const created = createThemeBackup(t.name, String((req.body || {}).name || '').trim() || '手动备份 ' + new Date().toLocaleString(), String((req.body || {}).note || ''), false);
    res.json({ success: true, id: created?.id, backups: themeBackupList(t.name) });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.post('/:name/backups/:id/restore', authenticate, authorize('admin'), (req: AuthRequest, res: Response) => {
  try {
    const t = readTheme(req.params.name);
    if (!t) { res.status(404).json({ error: 'Theme not found' }); return; }
    const row = db.prepare('SELECT value FROM Setting WHERE key = ?').get('theme_backup_' + req.params.id) as any;
    if (!row) { res.status(404).json({ error: '备份不存在' }); return; }
    const snap = JSON.parse(row.value);
    if (snap.theme !== t.name) { res.status(400).json({ error: '备份不属于该主题' }); return; }
    // 1. Replace the theme's DB overrides with the snapshot's settings
    const del = db.prepare('DELETE FROM Setting WHERE key = ?');
    for (const r of db.prepare("SELECT key FROM Setting WHERE key LIKE ? ESCAPE '\\'").all('theme_' + escapeLike(t.name) + '_%') as any[]) del.run(r.key);
    const upsert = db.prepare('INSERT INTO Setting (id, key, value) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value');
    for (const [k, v] of Object.entries(snap.settings || {})) upsert.run(cuid(), 'theme_' + t.name + '_' + k, String(v));
    // 2. Restore theme.json from the snapshot (validated before writing; the
    // current file is preserved as .bak-<ts> first so the write is reversible)
    if (snap.themeJson) {
      try {
        JSON.parse(snap.themeJson);
        const p = path.join(themesDir, t.name, 'theme.json');
        if (fs.existsSync(p)) fs.copyFileSync(p, p + '.bak-' + Date.now().toString(36));
        fs.writeFileSync(p, snap.themeJson);
      } catch { /* invalid snapshot file: settings still restored */ }
    }
    purgeAllCaches();
    res.json({ success: true, message: '主题已恢复到备份：' + snap.name });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.delete('/:name/backups/:id', authenticate, authorize('admin'), (req: AuthRequest, res: Response) => {
  try {
    if (!deleteThemeBackup(req.params.id)) { res.status(404).json({ error: '备份不存在' }); return; }
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export { readTheme, activeThemeName, themeOverrides };
export default router;
