import React, { useEffect, useState } from 'react';
import { formatDateTime } from '../lib/format';
import { Save, CheckCircle2, Upload, Trash2, Palette, X, ChevronDown } from 'lucide-react';
import VisualEditor from '../components/VisualEditor';
import api from '../lib/api';
import { t, getLang } from '../lib/i18n';
import Select from '../components/Select';
import { dialog } from '../lib/dialog';
import { postPath, usePermalinkPrefix } from '../lib/permalink';

// Collapsible section of the Appearance page.
//
// The five panels used to repeat the same details/summary markup with
// `card p-6`: a collapsed header was ~76px tall for a single line of text, the
// title and the 18px `▾` glyph sat at opposite ends of a full-width card, and
// nothing changed on open except the arrow — so a collapsed panel read as an
// empty white bar. Now the header carries the section's hint text (it was in the
// body, leaving the header blank), the padding lives on the header/body instead
// of the card so the hover tint covers the whole row, and opening a panel tints
// and rules off its header.
function Section({ title, hint, children }: { title: string; hint?: string; children?: React.ReactNode }) {
  return React.createElement('details', { className: 'card mb-6 group overflow-hidden' },
    React.createElement('summary', { className: 'flex items-center gap-3 px-5 py-3.5 cursor-pointer select-none list-none transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/40 group-open:bg-gray-50 dark:group-open:bg-gray-700/30 group-open:border-b group-open:border-gray-200 dark:group-open:border-gray-700' },
      React.createElement('div', { className: 'flex-1 min-w-0' },
        React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider' }, title),
        hint && React.createElement('p', { className: 'text-xs text-gray-500 mt-0.5' }, hint)),
      React.createElement('span', { className: 'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-gray-400 transition-transform duration-200 group-open:rotate-180 group-open:text-gray-600 dark:group-open:text-gray-300', 'aria-hidden': 'true' },
        React.createElement(ChevronDown, { size: 16 }))),
    React.createElement('div', { className: 'px-5 pb-5' }, children),
  );
}

export default function Appearance() {
  // Carousel slides hold a free-text link. The example in the placeholder used
  // to be a hardcoded /post/xxx, which under a custom permalink prefix pointed
  // admins at a URL shape the site no longer serves.
  const permalink = usePermalinkPrefix();
  const [themes, setThemes] = useState<any[]>([]);
  const [activeTheme, setActiveTheme] = useState('');
  const [settings, setSettings] = useState<Record<string, string>>({});
	const [saved, setSaved] = useState(false);
	const [customCss, setCustomCss] = useState('');
	const [editingSection, setEditingSection] = useState<string | null>(null);
	const [sectionHtml, setSectionHtml] = useState('');
	const [sectionCss, setSectionCss] = useState('');
	const [rebuilding, setRebuilding] = useState(false);
	const [themeDetail, setThemeDetail] = useState<any>(null);
	const [fileBrowser, setFileBrowser] = useState<{ theme: string; files: any[]; path: string; content: string; loading: boolean } | null>(null);
	const [backups, setBackups] = useState<any[]>([]);
	const [backupName, setBackupName] = useState('');
	const [backupBusy, setBackupBusy] = useState(false);
	// Developer tools (theme file editor) only show in developer mode
	const [devMode, setDevMode] = useState(false);
	const [carouselItems, setCarouselItems] = useState<{ image: string; title: string; link: string; alt: string }[]>([]);
	const [carouselDirty, setCarouselDirty] = useState(false);
	// Options for theme settings of type 'categories' (e.g. softstore's homepage
	// tab list). Loaded once — a new category needs a reload, same as elsewhere.
	const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([]);
	// '' = install-wide; a site id = edit that site's theme and its settings.
	const [siteList, setSiteList] = useState<any[]>([]);
	const [scopeSite, setScopeSite] = useState('');
	useEffect(() => {
		api.get('/categories').then(r => setCategories(Array.isArray(r.data) ? r.data : [])).catch(() => {});
	}, []);

	async function loadBackups() {
		if (!activeTheme) return;
		try { const r = await api.get('/themes/' + activeTheme + '/backups'); setBackups(r.data.backups || []); } catch {}
	}
	async function createBackup() {
		if (backupBusy) return;
		setBackupBusy(true);
		try {
			await api.post('/themes/' + activeTheme + '/backups', { name: backupName.trim() || undefined });
			setBackupName('');
			await loadBackups();
		} catch (e: any) { dialog.alert(e.response?.data?.error || t('save failed', getLang())); }
		setBackupBusy(false);
	}
	async function restoreBackup(id: string, name: string) {
		if (!(await dialog.confirm(t('restore backup confirm', getLang()) + '「' + name + '」？', { danger: true }))) return;
		try {
			await api.post('/themes/' + activeTheme + '/backups/' + id + '/restore');
			await dialog.alert(t('restore backup success', getLang()));
			window.location.reload();
		} catch (e: any) { dialog.alert(e.response?.data?.error || t('save failed', getLang())); }
	}
	async function deleteBackup(id: string) {
		if (!(await dialog.confirm(t('delete backup confirm', getLang()), { danger: true }))) return;
		try { await api.delete('/themes/' + activeTheme + '/backups/' + id); await loadBackups(); } catch {}
	}

	async function openFileBrowser(theme: string) {
		setFileBrowser({ theme, files: [], path: '', content: '', loading: true });
		try {
			const r = await api.get('/themes/' + theme + '/files');
			setFileBrowser({ theme, files: r.data.files || [], path: '', content: '', loading: false });
		} catch { setFileBrowser(f => f ? { ...f, loading: false } : f); }
	}
	async function openFile(path: string) {
		if (!fileBrowser) return;
		try { const r = await api.get('/themes/' + fileBrowser.theme + '/file?path=' + encodeURIComponent(path)); setFileBrowser({ ...fileBrowser, path, content: r.data.content || '' }); } catch {}
	}
	async function saveFile() {
		if (!fileBrowser || !fileBrowser.path) return;
		try { await api.put('/themes/' + fileBrowser.theme + '/file', { path: fileBrowser.path, content: fileBrowser.content }); dialog.alert(t('file saved', getLang())); } catch (e: any) { dialog.alert(e.response?.data?.error || t('save failed', getLang())); }
	}

	useEffect(() => {
		// The list is scope-aware: with a site selected, `active` is that site's
		// theme (and its card previews use the site's own overrides).
		api.get('/themes' + (scopeSite ? '?siteId=' + encodeURIComponent(scopeSite) : ''))
			.then(r => { setThemes(r.data.themes || []); setActiveTheme(r.data.active || 'default'); })
			.catch(() => {});
	}, [scopeSite]);
	useEffect(() => { api.get('/sites').then(r => setSiteList(r.data?.sites || [])).catch(() => {}); }, []);
	// Load the effective settings of the selected scope: install-wide (no
	// query) or one site's (admins may ask for any site by id).
	const scopeQuery = scopeSite ? '?siteId=' + encodeURIComponent(scopeSite) : '';
	useEffect(() => {
		let cancelled = false;
		api.get('/settings' + scopeQuery).then(r => {
			if (cancelled) return;
			setSettings(r.data);
			if (r.data.theme_name) setActiveTheme(r.data.theme_name);
			setCustomCss(r.data.theme_custom_css || '');
			// The carousel is part of this payload, so it follows the scope too.
			setDevMode(r.data?.dev_mode === '1');
			try { const items = JSON.parse(r.data?.carousel_items || '[]'); setCarouselItems(Array.isArray(items) ? items : []); } catch { setCarouselItems([]); }
		}).catch(() => {});
		return () => { cancelled = true; };
	}, [scopeSite]);
	useEffect(() => { if (activeTheme) loadBackups(); }, [activeTheme]);

  // `name` activates for the selected scope only: a site can run its own theme
  // while the rest of the install keeps the current one.
  async function activate(name: string) {
    try {
      await api.post('/themes/' + name + '/activate', scopeSite ? { siteId: scopeSite } : undefined);
    } catch (e: any) {
      dialog.alert(e.response?.data?.error || t('save failed', getLang()));
      return;
    }
    setActiveTheme(name);
    // Refresh the list so the "active" badge follows the scope.
    api.get('/themes' + (scopeSite ? '?siteId=' + encodeURIComponent(scopeSite) : ''))
      .then(r => { setThemes(r.data.themes || []); setActiveTheme(r.data.active || name); })
      .catch(() => {});
    if (!scopeSite) window.location.reload();
  }

  // Preview a theme (or the unsaved CSS) in the scope being edited: with a site
  // selected, opening the admin's own host would show that host's theme instead.
  function previewUrl(extra: string) {
    const host = scopeSite ? (siteList.find((x: any) => x.id === scopeSite)?.domain || '') : '';
    return (host ? window.location.protocol + '//' + host : '') + '/' + extra;
  }

  // One-click rebuild of built-in theme bundles from frontend source
  async function rebuildThemes() {
    setRebuilding(true);
    try {
      const r = await api.post('/themes/rebuild');
      if (r.data?.success) {
        dialog.alert('Theme bundles rebuilt:\n' + (r.data.results || []).join('\n'));
      } else {
        dialog.alert('Some themes failed:\n' + (r.data?.results || []).join('\n') + '\n\n' + (r.data?.error || ''));
      }
    } catch (e: any) {
      dialog.alert(e.response?.data?.error || 'Theme rebuild failed');
    } finally {
      setRebuilding(false);
    }
  }

  async function save() {
    // Persist theme settings to the active theme's overrides
    const themeSettings: Record<string, string> = {};
    // Fixed core keys + schema-declared custom keys (theme_<key> from the active theme)
    const activeMeta = themes.find((x: any) => x.name === activeTheme);
    const schemaKeys = (activeMeta?.settingsSchema || []).map((f: any) => f.key);
    const themeKeys = ['primary_color', 'background', 'text_color', 'link_color', 'heading_font', 'body_font', 'sidebar_position', 'posts_per_row', 'heading_cap', 'heading_max', ...schemaKeys];
    for (const k of themeKeys) {
      const v = settings['theme_' + k];
      if (v !== undefined) themeSettings[k] = v;
    }
	    if (activeTheme) {
	      themeSettings.custom_css = customCss;
	      // ?siteId scopes the write to that site's own layer (SiteSetting);
	      // without it the values are the install-wide defaults.
	      await api.put('/themes/' + activeTheme + '/settings' + (scopeSite ? '?siteId=' + encodeURIComponent(scopeSite) : ''), themeSettings);
	    }
    // Site identity stays global, and while a site scope is selected the form
    // shows that site's *effective* logo/favicon — writing those back would copy
    // one site's value over the install-wide one for every other site.
    if (!scopeSite) {
      const identity: Record<string, string> = {};
      if (settings.site_logo !== undefined) identity.site_logo = settings.site_logo;
      if (settings.favicon !== undefined) identity.favicon = settings.favicon;
      if (Object.keys(identity).length > 0) await api.put('/settings', identity);
    }
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  }

  async function saveCarousel() {
    try {
      const url = scopeSite ? '/sites/' + scopeSite + '/settings' : '/settings';
      await api.put(url, { carousel_items: JSON.stringify(carouselItems.filter(c => c.image.trim())) });
      setCarouselDirty(false);
      setSaved(true); setTimeout(() => setSaved(false), 2000);
      window.dispatchEvent(new Event('mortar-settings-saved'));
    } catch (e: any) { dialog.alert(e.response?.data?.error || t('save failed', getLang())); }
  }

  function openSectionEditor(location: string) {
    const key = 'theme_section_' + location;
    const raw = settings[key];
    let data = { html: '', css: '' };
    try { if (raw) data = JSON.parse(raw); } catch {}

    setEditingSection(location);
    setSectionHtml(data.html || '');
    setSectionCss(data.css || '');
  }

  async function saveSection() {
    if (!editingSection) return;
    await api.put('/themes/sections/' + editingSection + scopeQuery, { html: sectionHtml, css: sectionCss });
    // Reload through the current scope, or a scoped form would silently swap to
    // install-wide values (and the next Save would write them into the site).
    const r = await api.get('/settings' + scopeQuery);
    setSettings(r.data);
    setEditingSection(null);
  }

  function closeSectionEditor() { setEditingSection(null); }

  const HOOK_LOCATIONS = [
    { id: 'before_header', label: 'Before Header' },
    { id: 'after_header', label: 'After Header' },
    { id: 'before_content', label: 'Before Content' },
    { id: 'after_content', label: 'After Content' },
    { id: 'before_footer', label: 'Before Footer' },
    { id: 'after_footer', label: 'After Footer' },
  ];

  // Keyboard: Ctrl+S to save in section editor
  useEffect(() => {
    if (!editingSection) return;
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); saveSection(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [editingSection, sectionHtml, sectionCss]);

  return React.createElement('div', null,
    React.createElement('div', { className: 'flex items-center justify-between mb-6' },
      React.createElement('h2', { className: 'text-2xl font-bold text-gray-900' }, t('appearance', getLang())),
      React.createElement('button', { onClick: save, className: 'btn-primary' }, React.createElement(Save, { size: 16 }), saved ? t('saved!', getLang()) : t('save', getLang()))
    ),
    // Which scope the theme and its settings are read from and written to. A site
    // can run its own theme and its own colours; without a selection everything
    // here is the install-wide default the other sites inherit.
    React.createElement('div', { className: 'card p-4 mb-6 flex flex-wrap items-center gap-3' },
      React.createElement('span', { className: 'text-sm font-medium text-gray-700 dark:text-gray-200' }, t('apply to', getLang())),
      React.createElement(Select, { value: scopeSite, onChange: (v: string) => setScopeSite(v), className: 'input-field max-w-xs' },
        React.createElement('option', { value: '' }, t('all sites (install-wide)', getLang())),
        siteList.map((s: any) => React.createElement('option', { key: s.id, value: s.id }, s.name))),
      React.createElement('span', { className: 'text-xs text-gray-500 dark:text-gray-400' },
        scopeSite
          ? t('editing this site only: its theme, colours, fonts and theme settings. other sites keep the install-wide values.', getLang())
          : t('editing the install-wide default that every site inherits unless it was given its own theme.', getLang()))),
    React.createElement('div', { className: 'card p-6 mb-6' },
      React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider' }, t('themes', getLang())),
      React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-4' },
        themes.map((th: any) =>
          React.createElement('div', { key: th.name, className: 'p-4 rounded-lg border ' + (th.active ? 'theme-card-active' : 'border-gray-200 dark:border-gray-700') },
            React.createElement('div', { className: 'flex items-center justify-between' },
              React.createElement('div', { className: 'min-w-0' },
                React.createElement('div', { className: 'flex items-center gap-2' },
                  React.createElement('p', { className: 'font-medium text-gray-900' }, th.name),
                  React.createElement('span', { className: 'text-[10px] text-gray-400' }, 'v' + th.version),
                  th.active && React.createElement('span', { className: 'inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-green-100 text-green-700' }, React.createElement(CheckCircle2, { size: 10 }), t('active', getLang())),
                ),
                React.createElement('p', { className: 'text-xs text-gray-500 mt-1' }, th.description),
                React.createElement('p', { className: 'text-[10px] text-gray-400 mt-0.5' }, t('by', getLang()) + ' ' + th.author),
              ),
              React.createElement('div', { className: 'flex items-center gap-2 shrink-0' },
                devMode && React.createElement('button', { onClick: () => openFileBrowser(th.name), className: 'btn-secondary text-xs' }, t('edit files', getLang())),
                React.createElement('button', { onClick: () => setThemeDetail(th), className: 'btn-secondary text-xs' }, t('details', getLang())),
                React.createElement('button', { onClick: () => window.open(previewUrl('?theme=' + th.name), '_blank'), className: 'btn-secondary text-xs' }, t('preview', getLang())),
                !th.active && React.createElement('button', { onClick: () => activate(th.name), className: 'btn-secondary text-xs' }, t('activate', getLang())),
                React.createElement('button', {
                  onClick: async () => {
                    if (th.name === 'default') return;
                    if (!(await dialog.confirm(t('delete theme', getLang()) + ' "' + th.name + '"?', { danger: true }))) return;
                    try { await api.delete('/themes/' + th.name); window.location.reload(); }
                    catch (e: any) { dialog.alert(e.response?.data?.error || t('delete failed', getLang())); }
                  },
                  disabled: th.name === 'default',
                  className: 'p-1.5 ' + (th.name === 'default' ? 'text-gray-300 cursor-not-allowed' : 'text-gray-400 hover:text-red-600'),
                  title: th.name === 'default' ? t('default theme protected', getLang()) : t('delete', getLang()), 'aria-label': th.name === 'default' ? t('default theme protected', getLang()) : t('delete', getLang()),
                }, React.createElement(Trash2, { size: 14 })),
              )
            )
          )
        )
      ),
      themes.length === 0 && React.createElement('p', { className: 'text-xs text-gray-400' }, 'No themes found in server/themes/.'),
      // Install theme from zip (Halo-style upload) + rebuild built-in theme bundles
      React.createElement('div', { className: 'mt-4 pt-4 border-t border-gray-100' },
        React.createElement('div', { className: 'flex items-center gap-2 flex-wrap' },
          React.createElement('label', { className: 'btn-secondary text-xs cursor-pointer inline-flex' },
            React.createElement(Upload, { size: 14 }), t('install theme', getLang()),
            React.createElement('input', {
              type: 'file', accept: '.zip', className: 'hidden',
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                const f = e.target.files?.[0];
                if (!f) return;
                const fd = new FormData();
                fd.append('file', f);
                api.post('/themes/install', fd).then(async (r: any) => { await dialog.alert(r.data.message); window.location.reload(); }).catch((err: any) => dialog.alert(err.response?.data?.error || t('install failed', getLang())));
                e.target.value = '';
              },
            }),
          ),
          React.createElement('button', {
            onClick: rebuildThemes,
            disabled: rebuilding,
            className: 'btn-secondary text-xs',
            title: 'Rebuilds theme.js bundles from frontend/src/themes source (takes a few seconds)',
          }, rebuilding ? 'Rebuilding...' : 'Rebuild Theme Bundles'),
        ),
        React.createElement('p', { className: 'text-xs text-gray-400 mt-2' }, t('install theme hint', getLang()))
      )
    ),
    (() => {
      const activeMeta = themes.find((x: any) => x.name === activeTheme);
      const schema = activeMeta?.settingsSchema || [];
      if (schema.length === 0) return null;
      return React.createElement(Section, { title: t('theme custom settings', getLang()) },
        React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4' },
          schema.map((f: any) => {
            // Labels come from theme.json; the dictionary keys are English, so a
            // label written as an English sentence gets translated here.
            const label = t(f.label, getLang());
            const stored = settings['theme_' + f.key] || f.default || '';
            if (f.type === 'category') {
              // Single-choice variant: a dropdown of the site's categories. The
              // empty option is the theme's own default (softstore then shows its
              // "latest software" block).
              //
              // Only categories with at least two posts are offered: these blocks
              // lay their posts out two per row, so a one-post category would put
              // a single item alone on its line. A choice that no longer qualifies
              // (its posts were deleted) stays listed, so the saved value is never
              // silently shown as something else.
              const eligible = categories.filter((c: any) => (c._count?.posts || 0) >= 2);
              const options = stored && !eligible.some((c: any) => c.slug === stored)
                ? [...categories.filter((c: any) => c.slug === stored), ...eligible]
                : eligible;
              return React.createElement('div', { key: f.key },
                React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, label),
                React.createElement(Select, { value: stored, onChange: (v: string) => setSettings({ ...settings, ['theme_' + f.key]: v }), className: 'input-field' },
                  React.createElement('option', { value: '' }, t('default: latest software', getLang())),
                  options.map((c: any) => React.createElement('option', { key: c.id, value: c.slug }, c.name))),
                React.createElement('p', { className: 'text-xs text-gray-400 mt-1' }, t('only categories with 2 or more posts are listed', getLang())));
            }
            if (f.type === 'categories') {
              // Comma-separated slugs. Empty means "no filter" — the theme then
              // shows its own default selection.
              const picked = stored.split(',').map((s: string) => s.trim()).filter(Boolean);
              const toggle = (slug: string) => {
                const next = picked.includes(slug) ? picked.filter((s: string) => s !== slug) : [...picked, slug];
                setSettings({ ...settings, ['theme_' + f.key]: next.join(',') });
              };
              return React.createElement('div', { key: f.key, className: 'md:col-span-2' },
                React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, label),
                categories.length === 0
                  ? React.createElement('p', { className: 'text-xs text-gray-400' }, t('no categories yet', getLang()))
                  : React.createElement('div', { className: 'flex flex-wrap gap-x-4 gap-y-2 py-1' },
                      categories.map((c: any) => React.createElement('label', { key: c.id, className: 'flex items-center gap-2 cursor-pointer text-sm text-gray-600' },
                        React.createElement('input', { type: 'checkbox', checked: picked.includes(c.slug), onChange: () => toggle(c.slug), className: 'rounded border-gray-300 text-primary-600' }),
                        c.name))),
                React.createElement('p', { className: 'text-xs text-gray-400 mt-1' }, t('leave empty to show the theme default; extra tabs are dropped when they do not fit', getLang())));
            }
            return React.createElement('div', { key: f.key },
              React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, label),
              f.type === 'checkbox'
                ? React.createElement('label', { className: 'flex items-center gap-2 cursor-pointer py-2.5' },
                    React.createElement('input', { type: 'checkbox', checked: (stored) === '1', onChange: (e: React.ChangeEvent<HTMLInputElement>) => setSettings({ ...settings, ['theme_' + f.key]: e.target.checked ? '1' : '0' }), className: 'rounded border-gray-300 text-primary-600' }),
                    React.createElement('span', { className: 'text-sm text-gray-600' }, label))
                : f.type === 'select'
                  ? React.createElement(Select, { value: stored, onChange: (v: string) => setSettings({ ...settings, ['theme_' + f.key]: v }), className: 'input-field' },
                      (f.options || []).map((o: string) => React.createElement('option', { key: o, value: o }, o)))
                  : f.type === 'textarea'
                    ? React.createElement('textarea', { value: stored, onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => setSettings({ ...settings, ['theme_' + f.key]: e.target.value }), rows: 3, className: 'input-field' })
                    : React.createElement('input', { type: f.type === 'color' ? 'color' : 'text', value: stored, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setSettings({ ...settings, ['theme_' + f.key]: e.target.value }), className: 'input-field' })
            );
          })
        )
      );
    })(),
    React.createElement('div', { className: 'grid grid-cols-1 lg:grid-cols-2 gap-6' },
      React.createElement('div', { className: 'card p-6' },
        React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider' }, t('theme colors', getLang())),
        React.createElement('div', { className: 'space-y-4' },
          colorField(t('primary color', getLang()), 'theme_primary_color', settings, setSettings),
          colorField(t('background', getLang()), 'theme_background', settings, setSettings),
          colorField(t('text color', getLang()), 'theme_text_color', settings, setSettings),
          colorField(t('link color', getLang()), 'theme_link_color', settings, setSettings),
        )
      ),
      React.createElement('div', { className: 'card p-6' },
        React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider' }, t('typography', getLang())),
        React.createElement('div', { className: 'space-y-4' },
          selectField(t('heading font', getLang()), 'theme_heading_font', ['System', 'Serif', 'Sans-serif'], settings, setSettings),
          selectField(t('body font', getLang()), 'theme_body_font', ['System', 'Serif', 'Sans-serif'], settings, setSettings),
          React.createElement('div', null,
            React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, t('heading cap', getLang())),
            React.createElement(Select, { value: settings.theme_heading_cap || '2', onChange: (v: string) => setSettings({ ...settings, theme_heading_cap: v }), className: 'input-field' },
              React.createElement('option', { value: '2' }, '2 ' + t('(start from h2)', getLang())),
              React.createElement('option', { value: '1' }, '1 ' + t('(allow h1)', getLang()))
            ),
            React.createElement('p', { className: 'text-xs text-gray-400 mt-1' }, t('heading cap hint', getLang()))
          ),
          React.createElement('div', null,
            React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, t('heading max size', getLang())),
            React.createElement('input', { type: 'number', min: 14, max: 48, value: settings.theme_heading_max || '', placeholder: '24', onChange: (e: React.ChangeEvent<HTMLInputElement>) => setSettings({ ...settings, theme_heading_max: e.target.value }), className: 'input-field' }),
            React.createElement('p', { className: 'text-xs text-gray-400 mt-1' }, t('heading max size hint', getLang()))
          )
        )
      ),
      React.createElement('div', { className: 'card p-6 mb-6' },
        React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider' }, t('layout', getLang())),
        React.createElement('div', { className: 'space-y-4' },
          selectField(t('sidebar position', getLang()), 'theme_sidebar_position', [t('right', getLang()), t('left', getLang()), t('none', getLang())], settings, setSettings),
          selectField(t('posts per row', getLang()), 'theme_posts_per_row', ['1', '2', '3'], settings, setSettings),
        )
      ),
        React.createElement('div', { className: 'card p-6 mb-6' },
          React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider' }, t('site identity', getLang())),
          React.createElement('div', { className: 'space-y-4' },
            React.createElement('div', null,
              React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, t('site logo url', getLang())),
              React.createElement('input', { value: settings.site_logo || '', onChange: (e: React.ChangeEvent<HTMLInputElement>) => setSettings({ ...settings, site_logo: e.target.value }), className: 'input-field', placeholder: 'https://...' }),
              settings.site_logo && React.createElement('img', { src: settings.site_logo, alt: t('logo', getLang()), className: 'mt-2 h-8' })
            ),
            React.createElement('div', null,
              React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, t('favicon url', getLang())),
              React.createElement('input', { value: settings.favicon || '', onChange: (e: React.ChangeEvent<HTMLInputElement>) => setSettings({ ...settings, favicon: e.target.value }), className: 'input-field', placeholder: 'https://...' })
            ),
          )
        ),
      ),

      // Homepage carousel (hero banner)
      React.createElement(Section, { title: t('homepage carousel', getLang()), hint: t('carousel hint', getLang()) },
        carouselItems.map((c, i) => React.createElement('div', { key: i, className: 'border border-gray-200 rounded-lg p-3 mb-3 space-y-2 bg-gray-50/50' },
          React.createElement('div', { className: 'flex items-center gap-2' },
            React.createElement('span', { className: 'text-xs text-gray-400 w-6' }, i + 1 + '.'),
            React.createElement('input', { value: c.image, onChange: (e: React.ChangeEvent<HTMLInputElement>) => { const n = [...carouselItems]; n[i] = { ...n[i], image: e.target.value }; setCarouselItems(n); setCarouselDirty(true); }, className: 'input-field text-xs flex-1', placeholder: t('image url', getLang()) + ' (https://... ' + t('or', getLang()) + ' /uploads/...)', 'aria-label': t('image url', getLang()) }),
            React.createElement('button', { onClick: () => { setCarouselItems(carouselItems.filter((_, j) => j !== i)); setCarouselDirty(true); }, className: 'p-1.5 text-gray-400 hover:text-red-600', title: t('delete', getLang()), 'aria-label': t('delete', getLang()) }, React.createElement('span', null, '✕'))),
          React.createElement('input', { value: c.title, onChange: (e: React.ChangeEvent<HTMLInputElement>) => { const n = [...carouselItems]; n[i] = { ...n[i], title: e.target.value }; setCarouselItems(n); setCarouselDirty(true); }, className: 'input-field text-xs', placeholder: t('title', getLang()), 'aria-label': t('title', getLang()) }),
          React.createElement('input', { value: c.link, onChange: (e: React.ChangeEvent<HTMLInputElement>) => { const n = [...carouselItems]; n[i] = { ...n[i], link: e.target.value }; setCarouselItems(n); setCarouselDirty(true); }, className: 'input-field text-xs', placeholder: t('link', getLang()) + ' (' + postPath(permalink, 'xxx') + ' ' + t('or', getLang()) + ' https://...)', 'aria-label': t('link', getLang()) }),
        )),
        React.createElement('div', { className: 'flex gap-2' },
          React.createElement('button', { onClick: () => { setCarouselItems([...carouselItems, { image: '', title: '', link: '', alt: '' }]); setCarouselDirty(true); }, className: 'btn-secondary text-sm' }, '+ ' + t('add slide', getLang())),
          React.createElement('button', { onClick: saveCarousel, disabled: !carouselDirty, className: 'btn-primary text-sm disabled:opacity-40' }, t('save carousel', getLang())),
        ),
      ),

      // Custom CSS
      React.createElement(Section, { title: t('custom css', getLang()), hint: t('custom css hint', getLang()) },
        React.createElement('textarea', {
          value: customCss,
          onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => setCustomCss(e.target.value),
          className: 'input-field font-mono text-xs',
          rows: 12,
          placeholder: '/* Custom CSS for the active theme */\nbody { }\n',
          spellCheck: false,
        }),
        // Live preview of unsaved CSS (frontend reads ?preview_css=)
        React.createElement('div', { className: 'flex gap-2 mt-3' },
          React.createElement('button', { onClick: () => window.open(previewUrl('?preview_css=' + encodeURIComponent(customCss)), '_blank'), disabled: !customCss.trim(), className: 'btn-secondary text-sm disabled:opacity-40' }, t('preview custom css', getLang()))
        ),
      ),
      // Theme backups (snapshots of settings + custom CSS, rollback point for
      // panel edits and AI apply_theme_style calls).
      //
      // Hidden while a site scope is selected: a backup holds the *install-wide*
      // values, so restoring one from here would rewrite every site's settings
      // and still leave the selected site untouched — destructive and useless at
      // the same time.
      !scopeSite && React.createElement(Section, { title: t('theme backups', getLang()), hint: t('theme backups hint', getLang()) },
        React.createElement('div', { className: 'flex gap-2 mb-4' },
          React.createElement('input', { value: backupName, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setBackupName(e.target.value), placeholder: t('backup name placeholder', getLang()), className: 'input-field flex-1' }),
          React.createElement('button', { onClick: createBackup, disabled: backupBusy, className: 'btn-primary text-sm whitespace-nowrap' }, t('create backup', getLang()))
        ),
        backups.length === 0
          ? React.createElement('p', { className: 'text-sm text-gray-400' }, t('no backups yet', getLang()))
          : React.createElement('div', { className: 'space-y-2' },
              [...backups].sort((a: any, b: any) => b.createdAt.localeCompare(a.createdAt)).map((b: any) =>
                React.createElement('div', { key: b.id, className: 'flex items-center gap-3 p-3 rounded-lg border border-gray-100 dark:border-gray-700' },
                  React.createElement('div', { className: 'flex-1 min-w-0' },
                    React.createElement('p', { className: 'text-sm text-gray-800 dark:text-gray-100 truncate' }, b.name, b.auto && React.createElement('span', { className: 'ml-2 text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700' }, t('auto', getLang()))),
                    React.createElement('p', { className: 'text-[10px] text-gray-400 mt-0.5' }, formatDateTime(b.createdAt))
                  ),
                  React.createElement('button', { onClick: () => restoreBackup(b.id, b.name), className: 'text-xs px-2.5 py-1 rounded-lg bg-primary-50 text-primary-700 hover:bg-primary-100' }, t('restore', getLang())),
                  React.createElement('button', { onClick: () => deleteBackup(b.id), className: 'text-xs px-2.5 py-1 rounded-lg border border-gray-200 text-red-500 hover:bg-red-50' }, t('delete', getLang()))
                )
              )
            )
      ),
      // Theme Sections (visual hook editor)
      React.createElement(Section, { title: t('theme sections', getLang()), hint: t('theme sections hint', getLang()) },
        React.createElement('div', { className: 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3' },
          HOOK_LOCATIONS.map(loc => {
            const hasContent = (() => {
              try { const d = JSON.parse(settings['theme_section_' + loc.id] || '{}'); return !!(d.html || d.css); }
              catch { return false; }
            })();
            return React.createElement('button', {
              key: loc.id,
              onClick: () => openSectionEditor(loc.id),
              className: 'flex items-center gap-2 p-3 rounded-lg border text-left text-sm transition-colors ' +
                (hasContent ? 'border-primary-300 bg-primary-50 text-primary-700 hover:bg-primary-100' : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'),
            }, React.createElement(Palette, { size: 14 }), loc.label, hasContent && React.createElement('span', { className: 'ml-auto w-2 h-2 rounded-full bg-primary-500' }));
          })
        ),
      ),
      // Section Editor — full-screen builder (same as post/page visual mode)
      editingSection && React.createElement('div', { className: 'fixed inset-0 z-50 bg-white dark:bg-gray-900 flex flex-col' },
        React.createElement('div', { className: 'flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-white shrink-0' },
          React.createElement('div', { className: 'flex items-center gap-2' },
            React.createElement('button', { onClick: closeSectionEditor, className: 'p-1.5 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100', 'aria-label': t('close', getLang())}, React.createElement(X, { size: 18 })),
            React.createElement('h3', { className: 'text-base font-semibold text-gray-900' }, 'Design: ' + HOOK_LOCATIONS.find(l => l.id === editingSection)?.label),
          ),
          React.createElement('div', { className: 'flex items-center gap-2' },
            React.createElement('button', { onClick: closeSectionEditor, className: 'btn-secondary text-xs' }, t('cancel', getLang())),
            React.createElement('button', { onClick: saveSection, className: 'btn-primary text-xs' }, React.createElement(Save, { size: 14 }), t('save', getLang())),
          ),
        ),
        React.createElement('div', { className: 'flex-1 relative overflow-hidden' },
          React.createElement(VisualEditor, {
            content: sectionHtml,
            css: sectionCss,
            onChange: (html: string, css: string) => { setSectionHtml(html); setSectionCss(css); },
            height: '100%',
          })
        ),
        // Bottom spacer the height of the admin status bar (~42px), which stays
        // visible above this full-screen overlay — the editor area ends here so
        // canvas content can scroll fully into view without being covered.
        React.createElement('div', { className: 'shrink-0 bg-white dark:bg-gray-800 h-[42px]', 'aria-hidden': 'true' }),
      ),
      // ---- Theme file browser/editor modal ----
      fileBrowser && React.createElement('div', { className: 'fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4', onClick: () => setFileBrowser(null) },
        React.createElement('div', { className: 'bg-white rounded-xl shadow-2xl max-w-3xl w-full h-[80vh] flex flex-col', onClick: (e: React.MouseEvent) => e.stopPropagation() },
          React.createElement('div', { className: 'flex items-center justify-between px-5 py-3 border-b border-gray-200' },
            React.createElement('h3', { className: 'text-base font-semibold text-gray-900' }, t('theme files', getLang()) + ': ' + fileBrowser.theme),
            React.createElement('button', { onClick: () => setFileBrowser(null), className: 'text-gray-400 hover:text-gray-600 p-1', 'aria-label': t('close', getLang())}, React.createElement(X, { size: 18 }))),
          React.createElement('div', { className: 'flex flex-1 min-h-0' },
            // File list
            React.createElement('div', { className: 'w-56 border-r border-gray-200 overflow-y-auto p-2 shrink-0' },
              fileBrowser.loading ? React.createElement('p', { className: 'text-xs text-gray-400 p-2' }, t('loading', getLang()) + '...')
              : fileBrowser.files.length === 0 ? React.createElement('p', { className: 'text-xs text-gray-400 p-2' }, t('no editable files', getLang()))
              : fileBrowser.files.map((f: any) => React.createElement('button', {
                  key: f.path,
                  onClick: () => openFile(f.path),
                  className: 'block w-full text-left text-xs px-2 py-1.5 rounded hover:bg-gray-100 ' + (fileBrowser.path === f.path ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-600'),
                }, f.path))),
            // Editor pane
            React.createElement('div', { className: 'flex-1 flex flex-col min-w-0' },
              fileBrowser.path ? React.createElement(React.Fragment, null,
                React.createElement('textarea', {
                  value: fileBrowser.content,
                  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => setFileBrowser({ ...fileBrowser, content: e.target.value }),
                  readOnly: !fileBrowser.path.endsWith('.css'),
                  spellCheck: false,
                  className: 'flex-1 p-4 font-mono text-xs bg-gray-50 outline-none resize-none' + (!fileBrowser.path.endsWith('.css') ? ' text-gray-500' : ''),
                }),
                React.createElement('div', { className: 'px-4 py-2 border-t border-gray-200 flex items-center justify-between' },
                  React.createElement('span', { className: 'text-xs text-gray-400' }, fileBrowser.path + (fileBrowser.path.endsWith('.css') ? ' · ' + t('editable', getLang()) : ' · ' + t('read only', getLang()))),
                  fileBrowser.path.endsWith('.css') && React.createElement('button', { onClick: saveFile, className: 'btn-primary text-xs' }, React.createElement(Save, { size: 13 }), t('save', getLang()))))
              : React.createElement('div', { className: 'flex-1 flex items-center justify-center text-sm text-gray-400' }, t('select a file to view', getLang())))
          )
        )
      ),
      // ---- Theme details modal ----
      themeDetail && React.createElement('div', { className: 'fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4', onClick: () => setThemeDetail(null) },
        React.createElement('div', { className: 'bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto', onClick: (e: React.MouseEvent) => e.stopPropagation() },
          React.createElement('div', { className: 'p-6' },
            React.createElement('div', { className: 'flex items-start justify-between mb-4' },
              React.createElement('div', null,
                React.createElement('h3', { className: 'text-xl font-bold text-gray-900' }, themeDetail.name),
                React.createElement('p', { className: 'text-sm text-gray-500 mt-1' }, t('version', getLang()) + ' ' + themeDetail.version + ' · ' + t('by', getLang()) + ' ' + themeDetail.author)),
              React.createElement('button', { onClick: () => setThemeDetail(null), className: 'text-gray-400 hover:text-gray-600 p-1', 'aria-label': t('close', getLang())}, React.createElement(X, { size: 20 }))),
            themeDetail.active && React.createElement('div', { className: 'mb-4 flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg bg-green-100 text-green-700 w-fit' }, React.createElement(CheckCircle2, { size: 14 }), t('this theme is active', getLang())),
            React.createElement('div', { className: 'bg-gray-50 rounded-lg p-4 mb-4' },
              React.createElement('p', { className: 'text-sm text-gray-700 leading-relaxed' }, themeDetail.description || t('no description', getLang()))),
            themeDetail.settingsSchema && themeDetail.settingsSchema.length > 0 && React.createElement('div', { className: 'mb-4' },
              React.createElement('p', { className: 'text-xs font-semibold text-gray-500 uppercase mb-2' }, t('customizable options', getLang())),
              React.createElement('div', { className: 'flex flex-wrap gap-1.5' },
                themeDetail.settingsSchema.map((s: any) => React.createElement('span', { key: s.key, className: 'text-xs px-2 py-1 rounded bg-blue-50 text-blue-700' }, s.label || s.key)))),
            React.createElement('div', { className: 'flex gap-2 pt-4 border-t border-gray-100' },
              !themeDetail.active && React.createElement('button', { onClick: () => { activate(themeDetail.name); setThemeDetail(null); }, className: 'btn-primary text-sm flex-1' }, t('activate this theme', getLang())),
              React.createElement('button', { onClick: () => setThemeDetail(null), className: 'btn-secondary text-sm flex-1' }, t('close', getLang()))),
          )
        )
      ),
    );
}

function colorField(label: string, key: string, settings: Record<string, string>, setSettings: any) {
  return React.createElement('div', null,
    React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, label),
    React.createElement('div', { className: 'flex items-center gap-3' },
      React.createElement('input', { type: 'color', value: settings[key] || '#3b82f6', onChange: (e: React.ChangeEvent<HTMLInputElement>) => setSettings({ ...settings, [key]: e.target.value }), className: 'w-10 h-10 rounded border border-gray-300 cursor-pointer' }),
      React.createElement('input', { value: settings[key] || '', onChange: (e: React.ChangeEvent<HTMLInputElement>) => setSettings({ ...settings, [key]: e.target.value }), className: 'input-field flex-1', placeholder: '#hex' })
    )
  );
}

function selectField(label: string, key: string, options: string[], settings: Record<string, string>, setSettings: any) {
  return React.createElement('div', null,
    React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, label),
    React.createElement(Select, { value: settings[key] || options[0].toLowerCase(), onChange: (v: string) => setSettings({ ...settings, [key]: v }), className: 'input-field' },
      options.map(o => React.createElement('option', { key: o, value: o.toLowerCase() }, o))
    )
  );
}
