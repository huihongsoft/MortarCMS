import { Router, Response } from 'express';
import fs from 'fs';
import path from 'path';
import db, { cuid } from '../utils/db';
import { authenticate, requireCap, AuthRequest } from '../middleware/auth';

const router = Router();
const themesDir = path.join(__dirname, '..', '..', 'themes');

export interface ThemeMeta {
  name: string;
  version: string;
  description: string;
  author: string;
  active: boolean;
  settings: Record<string, string>;
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

export { readTheme, activeThemeName, themeOverrides };
export default router;
