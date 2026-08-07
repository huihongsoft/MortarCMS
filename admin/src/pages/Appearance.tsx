import React, { useEffect, useState } from 'react';
import { Save, CheckCircle2 } from 'lucide-react';
import api from '../lib/api';
import { t, getLang } from '../lib/i18n';

export default function Appearance() {
  const [themes, setThemes] = useState<any[]>([]);
  const [activeTheme, setActiveTheme] = useState('');
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get('/themes').then(r => { setThemes(r.data.themes || []); setActiveTheme(r.data.active || 'default'); }).catch(() => {});
    api.get('/settings').then(r => setSettings(r.data)).catch(() => {});
  }, []);

  async function activate(name: string) {
    await api.post('/themes/' + name + '/activate');
    window.location.reload();
  }

  async function save() {
    // Persist theme settings to the active theme's overrides
    const themeSettings: Record<string, string> = {};
    const themeKeys = ['primary_color', 'background', 'text_color', 'link_color', 'heading_font', 'body_font', 'sidebar_position', 'posts_per_row'];
    for (const k of themeKeys) {
      const v = settings['theme_' + k];
      if (v !== undefined) themeSettings[k] = v;
    }
    if (activeTheme) await api.put('/themes/' + activeTheme + '/settings', themeSettings);
    // Site identity stays global
    const identity: Record<string, string> = {};
    if (settings.site_logo !== undefined) identity.site_logo = settings.site_logo;
    if (settings.favicon !== undefined) identity.favicon = settings.favicon;
    if (Object.keys(identity).length > 0) await api.put('/settings', identity);
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  }

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
              !th.active && React.createElement('button', { onClick: () => activate(th.name), className: 'btn-secondary text-xs shrink-0' }, t('activate', getLang()))
            )
          )
        )
      ),
      themes.length === 0 && React.createElement('p', { className: 'text-xs text-gray-400' }, 'No themes found in server/themes/.')
    ),
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
      )
    )
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
