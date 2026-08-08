import React, { useEffect, useState } from 'react';
import { Save, CheckCircle2, Upload, Trash2, Palette, X } from 'lucide-react';
import VisualEditor from '../components/VisualEditor';
import api from '../lib/api';
import { t, getLang } from '../lib/i18n';

export default function Appearance() {
  const [themes, setThemes] = useState<any[]>([]);
  const [activeTheme, setActiveTheme] = useState('');
  const [settings, setSettings] = useState<Record<string, string>>({});
	const [saved, setSaved] = useState(false);
	const [customCss, setCustomCss] = useState('');
	const [editingSection, setEditingSection] = useState<string | null>(null);
	const [sectionHtml, setSectionHtml] = useState('');
	const [sectionCss, setSectionCss] = useState('');
	const [rebuilding, setRebuilding] = useState(false);

	useEffect(() => {
		api.get('/themes').then(r => { setThemes(r.data.themes || []); setActiveTheme(r.data.active || 'default'); }).catch(() => {});
		api.get('/settings').then(r => {
			setSettings(r.data);
			if (r.data.theme_custom_css) setCustomCss(r.data.theme_custom_css);
		}).catch(() => {});
	}, []);

  async function activate(name: string) {
    await api.post('/themes/' + name + '/activate');
    window.location.reload();
  }

  // One-click rebuild of built-in theme bundles from frontend source
  async function rebuildThemes() {
    setRebuilding(true);
    try {
      const r = await api.post('/themes/rebuild');
      if (r.data?.success) {
        alert('Theme bundles rebuilt:\n' + (r.data.results || []).join('\n'));
      } else {
        alert('Some themes failed:\n' + (r.data?.results || []).join('\n') + '\n\n' + (r.data?.error || ''));
      }
    } catch (e: any) {
      alert(e.response?.data?.error || 'Theme rebuild failed');
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
    const themeKeys = ['primary_color', 'background', 'text_color', 'link_color', 'heading_font', 'body_font', 'sidebar_position', 'posts_per_row', ...schemaKeys];
    for (const k of themeKeys) {
      const v = settings['theme_' + k];
      if (v !== undefined) themeSettings[k] = v;
    }
	    if (activeTheme) {
	      themeSettings.custom_css = customCss;
	      await api.put('/themes/' + activeTheme + '/settings', themeSettings);
	    }
    // Site identity stays global
    const identity: Record<string, string> = {};
    if (settings.site_logo !== undefined) identity.site_logo = settings.site_logo;
    if (settings.favicon !== undefined) identity.favicon = settings.favicon;
    if (Object.keys(identity).length > 0) await api.put('/settings', identity);
    setSaved(true); setTimeout(() => setSaved(false), 2000);
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
    await api.put('/themes/sections/' + editingSection, { html: sectionHtml, css: sectionCss });
    const r = await api.get('/settings');
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
    React.createElement('div', { className: 'card p-6 mb-6' },
      React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider' }, t('themes', getLang())),
      React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-4' },
        themes.map((th: any) =>
          React.createElement('div', { key: th.name, className: 'p-4 rounded-lg border ' + (th.active ? 'border-primary-500 bg-primary-50/50' : 'border-gray-200') },
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
                !th.active && React.createElement('button', { onClick: () => activate(th.name), className: 'btn-secondary text-xs' }, t('activate', getLang())),
                React.createElement('button', {
                  onClick: async () => {
                    if (th.name === 'default') return;
                    if (!confirm(t('delete theme', getLang()) + ' "' + th.name + '"?')) return;
                    try { await api.delete('/themes/' + th.name); window.location.reload(); }
                    catch (e: any) { alert(e.response?.data?.error || t('delete failed', getLang())); }
                  },
                  disabled: th.name === 'default',
                  className: 'p-1.5 ' + (th.name === 'default' ? 'text-gray-300 cursor-not-allowed' : 'text-gray-400 hover:text-red-600'),
                  title: th.name === 'default' ? t('default theme protected', getLang()) : t('delete', getLang()),
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
                api.post('/themes/install', fd).then((r: any) => { alert(r.data.message); window.location.reload(); }).catch((err: any) => alert(err.response?.data?.error || t('install failed', getLang())));
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
      return React.createElement('div', { className: 'card p-6 mb-6' },
        React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider' }, t('theme custom settings', getLang())),
        React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4' },
          schema.map((f: any) =>
            React.createElement('div', { key: f.key },
              React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, f.label),
              f.type === 'checkbox'
                ? React.createElement('label', { className: 'flex items-center gap-2 cursor-pointer mt-1' },
                    React.createElement('input', { type: 'checkbox', checked: (settings['theme_' + f.key] || f.default || '') === '1', onChange: (e: React.ChangeEvent<HTMLInputElement>) => setSettings({ ...settings, ['theme_' + f.key]: e.target.checked ? '1' : '0' }), className: 'rounded border-gray-300 text-primary-600' }),
                    React.createElement('span', { className: 'text-sm text-gray-600' }, f.label))
                : f.type === 'select'
                  ? React.createElement('select', { value: settings['theme_' + f.key] || f.default || '', onChange: (e: React.ChangeEvent<HTMLSelectElement>) => setSettings({ ...settings, ['theme_' + f.key]: e.target.value }), className: 'input-field' },
                      (f.options || []).map((o: string) => React.createElement('option', { key: o, value: o }, o)))
                  : f.type === 'textarea'
                    ? React.createElement('textarea', { value: settings['theme_' + f.key] || f.default || '', onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => setSettings({ ...settings, ['theme_' + f.key]: e.target.value }), rows: 3, className: 'input-field' })
                    : React.createElement('input', { type: f.type === 'color' ? 'color' : 'text', value: settings['theme_' + f.key] || f.default || '', onChange: (e: React.ChangeEvent<HTMLInputElement>) => setSettings({ ...settings, ['theme_' + f.key]: e.target.value }), className: 'input-field' })
            )
          )
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
        )
      ),
      React.createElement('div', { className: 'card p-6' },
        React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider' }, t('layout', getLang())),
        React.createElement('div', { className: 'space-y-4' },
          selectField(t('sidebar position', getLang()), 'theme_sidebar_position', [t('right', getLang()), t('left', getLang()), t('none', getLang())], settings, setSettings),
          selectField(t('posts per row', getLang()), 'theme_posts_per_row', ['1', '2', '3'], settings, setSettings),
        )
      ),
        React.createElement('div', { className: 'card p-6' },
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
      // Custom CSS
      React.createElement('div', { className: 'card p-6 mb-6' },
        React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider' }, t('custom css', getLang())),
        React.createElement('p', { className: 'text-xs text-gray-400 mb-2' }, t('custom css hint', getLang())),
        React.createElement('textarea', {
          value: customCss,
          onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => setCustomCss(e.target.value),
          className: 'input-field font-mono text-xs',
          rows: 12,
          placeholder: '/* Custom CSS for the active theme */\nbody { }\n',
          spellCheck: false,
        }),
      ),
      // Theme Sections (visual hook editor)
      React.createElement('div', { className: 'card p-6 mb-6' },
        React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider' }, 'Theme Sections'),
        React.createElement('p', { className: 'text-xs text-gray-400 mb-4' }, 'Visually design custom sections injected at key theme locations.'),
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
            React.createElement('button', { onClick: closeSectionEditor, className: 'p-1.5 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100' }, React.createElement(X, { size: 18 })),
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
    React.createElement('select', { value: settings[key] || options[0].toLowerCase(), onChange: (e: React.ChangeEvent<HTMLSelectElement>) => setSettings({ ...settings, [key]: e.target.value }), className: 'input-field' },
      options.map(o => React.createElement('option', { key: o, value: o.toLowerCase() }, o))
    )
  );
}
