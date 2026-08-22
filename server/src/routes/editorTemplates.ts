import { Router, Response } from 'express';
import fs from 'fs';
import path from 'path';
import db, { cuid } from '../utils/db';
import { authenticate, requireCap, AuthRequest } from '../middleware/auth';
import { SiteRequest } from '../middleware/site';
import { renderShortcode, listShortcodes } from '../utils/shortcodes';

const CMS_TYPES = ['post-list', 'categories', 'comments', 'search', 'archive', 'tag-cloud', 'link-list'];

const router = Router();

function loadTemplates(): any[] {
  const row = db.prepare("SELECT value FROM Setting WHERE key = 'custom_templates'").get() as any;
  try { return row ? JSON.parse(row.value) : []; } catch { return []; }
}

function saveTemplates(templates: any[]): void {
  db.prepare("INSERT INTO Setting (id, key, value) VALUES (?, 'custom_templates', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").run(
    'custom_templates', JSON.stringify(templates)
  );
}

// Public: the real site's built CSS bundle URLs, so the visual editor canvas
// preview matches the live frontend (typography, theme CSS, components).
router.get('/canvas-css', authenticate, requireCap('edit_posts'), (_req: AuthRequest, res: Response) => {
  try {
    const indexHtml = path.join(__dirname, '..', '..', '..', 'frontend', 'dist', 'index.html');
    if (!fs.existsSync(indexHtml)) { res.json({ styles: [] }); return; }
    const html = fs.readFileSync(indexHtml, 'utf8');
    const styles = [...html.matchAll(/href="([^"]*\.css)"/g)].map(m => m[1]);
    res.json({ styles });
  } catch (err: any) { res.json({ styles: [] }); }
});

// Public: live preview HTML for a CMS data block (used by the visual editor canvas)
router.get('/preview-cms/:type', authenticate, requireCap('edit_posts'), (req: AuthRequest & SiteRequest, res: Response) => {
  const type = req.params.type;
  if (!CMS_TYPES.includes(type)) { res.status(400).json({ error: 'Unknown CMS block type' }); return; }
  try {
    // Query params become shortcode attrs (e.g. ?category=ai for link-list)
    const attrs: Record<string, string> = {};
    Object.entries(req.query).forEach(([k, v]) => { if (typeof v === 'string') attrs[k] = v; });
    if (!('limit' in attrs)) attrs.limit = '5';
    // Site-scoped preview: same visibility rules as the rendered page
    const html = renderShortcode(type, attrs, { siteId: req.siteId });
    res.json({ html });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: list all registered shortcodes (name + description) for the editor inserter
router.get('/shortcodes', authenticate, requireCap('edit_posts'), (_req: AuthRequest, res: Response) => {
  try {
    res.json({ shortcodes: listShortcodes() });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Editor: custom block templates (admin-only)
router.get('/templates', authenticate, requireCap('edit_posts'), (_req: AuthRequest, res: Response) => {
  try {
    res.json({ templates: loadTemplates() });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: save a new custom template
router.post('/templates', authenticate, requireCap('edit_posts'), (req: AuthRequest, res: Response) => {
  try {
    const { name, html } = req.body || {};
    if (!name || !html) { res.status(400).json({ error: 'name and html required' }); return; }
    const css = String(req.body.css || '');
    const templates = loadTemplates();
    const tpl = { id: cuid(), name: String(name).slice(0, 50), html: String(html), css, createdAt: new Date().toISOString() };
    templates.push(tpl);
    saveTemplates(templates);
    res.status(201).json(tpl);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: delete a custom template
router.delete('/templates/:id', authenticate, requireCap('edit_posts'), (req: AuthRequest, res: Response) => {
  try {
    const templates = loadTemplates().filter((t: any) => t.id !== req.params.id);
    saveTemplates(templates);
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: export custom templates as JSON download
router.get('/templates/export', authenticate, requireCap('edit_posts'), (_req: AuthRequest, res: Response) => {
  try {
    const templates = loadTemplates().map(({ id, createdAt, ...rest }: any) => rest);
    res.setHeader('Content-Disposition', 'attachment; filename="mortar-templates.json"');
    res.type('application/json');
    res.send(JSON.stringify({ version: 1, templates }, null, 2));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin: import custom templates from JSON (merges by name, skips duplicates)
router.post('/templates/import', authenticate, requireCap('edit_posts'), (req: AuthRequest, res: Response) => {
  try {
    const incoming = req.body?.templates as any[];
    if (!Array.isArray(incoming) || incoming.length === 0) { res.status(400).json({ error: 'templates array required' }); return; }
    const existing = loadTemplates();
    let added = 0;
    for (const t of incoming) {
      if (!t || typeof t.name !== 'string' || typeof t.html !== 'string') continue;
      if (existing.some((e: any) => e.name === t.name)) continue; // skip duplicates by name
      existing.push({ id: cuid(), name: t.name.slice(0, 50), html: t.html, createdAt: new Date().toISOString() });
      added++;
    }
    saveTemplates(existing);
    res.json({ success: true, imported: added, total: existing.length });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;
