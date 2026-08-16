import React, { useEffect, useState } from 'react';
import { Puzzle, Zap, Filter, Link2, PlusCircle, RefreshCw, ToggleLeft, ToggleRight, Package, Store, Download, Trash2, Info, X, Settings, Eye } from 'lucide-react';
import { useToast } from '../lib/toast';
import api from '../lib/api';
import { t, getLang } from '../lib/i18n';

const actionIcons: Record<string, any> = { init: Zap, post_published: RefreshCw, comment_added: PlusCircle, post_created: PlusCircle, post_updated: RefreshCw };
const filterIcons: Record<string, any> = { post_content: Filter };

export default function Plugins() {
  const [tab, setTab] = useState<'installed' | 'market'>('installed');
  const [hooks, setHooks] = useState<{ actions: any[]; filters: any[] }>({ actions: [], filters: [] });
  const [plugins, setPlugins] = useState<any[]>([]);
  const [market, setMarket] = useState<any[]>([]);
  const [detail, setDetail] = useState<any>(null);
  const [detailHooks, setDetailHooks] = useState<{ name: string; kind: string }[]>([]);

  async function openDetail(p: any) {
    setDetail(p);
    try {
      const r = await api.get('/system/hooks');
      const actNames = new Set((r.data?.actions || []).map((a: any) => a.name));
      const all = [...(r.data?.actions || []).map((a: any) => ({ name: a.name, kind: 'action' })), ...(r.data?.filters || []).map((f: any) => ({ name: f.name, kind: 'filter' }))];
      void actNames;
      const mine = all.filter((h: any) => r.data?.actions?.find((a: any) => a.name === h.name)?.listeners?.some((l: any) => l.source === p.name) || r.data?.filters?.find((f: any) => f.name === h.name)?.listeners?.some((l: any) => l.source === p.name));
      setDetailHooks(mine);
    } catch { setDetailHooks([]); }
  }
  const [marketSource, setMarketSource] = useState('');
  // Developer info (hooks overview) only shows in developer mode
  const [devMode, setDevMode] = useState(false);
  useEffect(() => {
    const load = () => api.get('/settings').then(r => {
      setDevMode(r.data?.dev_mode === '1');
    }).catch(() => {});
    load();
    window.addEventListener('mortar-settings-saved', load);
    return () => window.removeEventListener('mortar-settings-saved', load);
  }, []);
  const [pluginSearch, setPluginSearch] = useState('');
  const filteredPlugins = pluginSearch ? plugins.filter((p: any) => (p.name + ' ' + (p.description || '')).toLowerCase().includes(pluginSearch.toLowerCase())) : plugins;
  const toast = useToast();

  // Plugin settings modal
  const [settingsFor, setSettingsFor] = useState<any>(null);
  const [settingsValues, setSettingsValues] = useState<Record<string, string>>({});
  const [settingsReports, setSettingsReports] = useState<Record<string, string>>({});
  const [settingsSaving, setSettingsSaving] = useState(false);

  async function openSettings(p: any) {
    try {
      const r = await api.get('/plugins/' + p.name + '/settings');
      setSettingsFor(r.data.plugin);
      setSettingsValues(r.data.values || {});
      setSettingsReports(r.data.reports || {});
    } catch (e: any) { toast.toast(e.response?.data?.error || t('load failed', getLang()), 'error'); }
  }

  async function saveSettings() {
    setSettingsSaving(true);
    try {
      await api.put('/plugins/' + settingsFor.name + '/settings', { values: settingsValues });
      toast.toast(t('plugin settings saved', getLang()));
      setSettingsFor(null);
    } catch (e: any) { toast.toast(e.response?.data?.error || t('save failed', getLang()), 'error'); }
    finally { setSettingsSaving(false); }
  }

  useEffect(() => {
    api.get('/plugins/hooks').then(r => setHooks(r.data || { actions: [], filters: [] })).catch(() => {});
    fetchPlugins();
    api.get('/plugins/market/list').then(r => { setMarket(r.data.packages || []); setMarketSource(r.data.source || ''); }).catch(() => {});
  }, []);

  async function fetchPlugins() { api.get('/plugins').then(r => setPlugins(r.data.plugins || [])).catch(() => {}); }

  async function toggle(name: string, active: boolean) {
    try {
      await api.put('/plugins/' + name + '/toggle', { active });
      setPlugins(plugins.map((p: any) => p.name === name ? { ...p, active } : p));
      toast.toast((active ? t('enabled', getLang()) : t('disabled', getLang())) + ' ' + name);
    } catch (e: any) { toast.toast(e.response?.data?.error || t('toggle failed', getLang()), 'error'); }
  }

  async function install(name: string) {
    try {
      await api.post('/plugins/market/' + name + '/install');
      toast.toast(name + ' ' + t('installed', getLang()));
      fetchPlugins();
      api.get('/plugins/market/list').then(r => { setMarket(r.data.packages || []); setMarketSource(r.data.source || ''); }).catch(() => {});
    } catch (e: any) { toast.toast(e.response?.data?.error || t('install failed', getLang()), 'error'); }
  }

  async function uninstall(name: string) {
    if (!confirm(t('uninstall plugin', getLang()) + ' ' + name + '?')) return;
    try {
      await api.delete('/plugins/' + name);
      toast.toast(name + ' ' + t('uninstalled', getLang()));
      fetchPlugins();
    } catch (e: any) { toast.toast(e.response?.data?.error || t('uninstall failed', getLang()), 'error'); }
  }

  const hookItem = (h: any, kind: string) => {
    const Icon = kind === 'action' ? (actionIcons[h.hook] || Zap) : (filterIcons[h.hook] || Filter);
    return React.createElement('div', { key: h.hook, className: 'flex items-start gap-3 p-3 bg-gray-50 rounded-lg' },
      React.createElement(Icon, { size: 16, className: 'text-primary-500 mt-0.5 shrink-0' }),
      React.createElement('div', { className: 'min-w-0' },
        React.createElement('p', { className: 'text-sm font-mono text-gray-800' }, h.hook),
        React.createElement('p', { className: 'text-xs text-gray-500 mt-0.5' }, h.description || (kind === 'action' ? t('fires during request handling', getLang()) : t('transforms data before output', getLang()))),
        React.createElement('span', { className: 'inline-block mt-1 px-1.5 py-0.5 text-[10px] rounded ' + (kind === 'action' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700') }, kind)
      )
    );
  };

  return React.createElement('div', null,
    React.createElement('h2', { className: 'text-2xl font-bold text-gray-900 mb-2' }, t('plugins', getLang())),
    React.createElement('p', { className: 'text-sm text-gray-500 mb-6' }, t('plugin system with a plugin market.', getLang())),
    React.createElement('div', { className: 'flex items-center gap-2 mb-6' },
      React.createElement('button', { onClick: () => setTab('installed'), className: `px-3 py-1.5 text-sm rounded-lg flex items-center gap-1.5 ${tab === 'installed' ? 'bg-primary-600 text-white' : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'}` }, React.createElement(Package, { size: 14 }), t('installed', getLang())),
      React.createElement('button', { onClick: () => setTab('market'), className: `px-3 py-1.5 text-sm rounded-lg flex items-center gap-1.5 ${tab === 'market' ? 'bg-primary-600 text-white' : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'}` }, React.createElement(Store, { size: 14 }), t('market', getLang())),
    ),
    tab === 'market' && React.createElement('div', { className: 'card p-5 mb-6' },
      React.createElement('div', { className: 'flex items-center gap-2 mb-4' },
        React.createElement(Store, { size: 18, className: 'text-primary-500' }),
        React.createElement('h3', { className: 'text-sm font-semibold text-gray-900' }, t('plugin market', getLang()) + ' (' + market.length + ')'),
        React.createElement('span', { className: 'ml-2 text-[10px] px-1.5 py-0.5 rounded ' + (marketSource.startsWith('remote') ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500') }, marketSource || 'local'),
      ),
      market.length === 0
        ? React.createElement('p', { className: 'text-xs text-gray-400' }, t('market is empty. add packages to server/market/.', getLang()))
        : React.createElement('div', { className: 'space-y-3' },
            market.map((p: any) =>
              React.createElement('div', { key: p.name, className: 'flex items-start gap-3 p-3 bg-gray-50 rounded-lg' },
                React.createElement(Store, { size: 18, className: 'text-gray-400 mt-0.5 shrink-0' }),
                React.createElement('div', { className: 'flex-1 min-w-0' },
                  React.createElement('div', { className: 'flex items-center gap-2' },
                    React.createElement('p', { className: 'font-mono text-sm font-medium text-gray-800' }, p.name),
                    React.createElement('span', { className: 'text-[10px] text-gray-400' }, 'v' + p.version),
                  ),
                  React.createElement('p', { className: 'text-xs text-gray-500 mt-0.5' }, t(p.description, getLang())),
                  p.author && React.createElement('p', { className: 'text-[10px] text-gray-400 mt-0.5' }, t('by', getLang()) + ' ' + p.author),
                ),
                p.installed
                  ? React.createElement('button', { onClick: () => uninstall(p.name), className: 'flex items-center gap-1.5 shrink-0 text-xs px-2.5 py-1.5 rounded-lg bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-600' }, React.createElement(Trash2, { size: 14 }), t('uninstall', getLang()))
                  : React.createElement('button', { onClick: () => install(p.name), className: 'flex items-center gap-1.5 shrink-0 text-xs px-2.5 py-1.5 rounded-lg bg-primary-600 text-white hover:bg-primary-700' }, React.createElement(Download, { size: 14 }), p.source === 'remote' ? t('install from remote', getLang()) : t('install', getLang())),
              )
            )
          )
    ),
    tab === 'installed' && React.createElement('div', { className: 'card p-5 mb-6' },
      React.createElement('div', { className: 'flex items-center gap-2 mb-4 flex-wrap' },
        React.createElement(Package, { size: 18, className: 'text-green-600' }),
        React.createElement('h3', { className: 'text-sm font-semibold text-gray-900' }, t('installed plugins', getLang()) + ' (' + plugins.length + ')'),
        React.createElement('div', { className: 'flex-1' }),
        React.createElement('input', { type: 'text', value: pluginSearch, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setPluginSearch(e.target.value), placeholder: t('search plugins', getLang()), className: 'input-field w-48 text-sm py-1.5' }),
        plugins.some((p: any) => !p.active) && React.createElement('button', { onClick: () => plugins.forEach((p: any) => { if (!p.active) toggle(p.name, true); }), className: 'btn-secondary text-xs' }, t('activate all', getLang())),
        plugins.some((p: any) => p.active) && React.createElement('button', { onClick: () => plugins.forEach((p: any) => { if (p.active) toggle(p.name, false); }), className: 'btn-secondary text-xs' }, t('deactivate all', getLang())),
      ),
      filteredPlugins.length === 0
        ? React.createElement('p', { className: 'text-xs text-gray-400' }, plugins.length === 0 ? t('no plugins installed. add a folder with plugin.json + index.ts to server/plugins.', getLang()) : t('no plugins match your search', getLang()))
        : React.createElement('div', { className: 'space-y-3' },
            filteredPlugins.map((p: any) =>
              React.createElement('div', { key: p.name, className: 'flex items-start gap-3 p-3 bg-gray-50 rounded-lg' },
                React.createElement(Puzzle, { size: 18, className: 'text-gray-400 mt-0.5 shrink-0' }),
                React.createElement('div', { className: 'flex-1 min-w-0' },
                  React.createElement('div', { className: 'flex items-center gap-2' },
                    React.createElement('p', { className: 'font-mono text-sm font-medium text-gray-800' }, p.name),
                    React.createElement('span', { className: 'text-[10px] text-gray-400' }, 'v' + p.version),
                    p.requires && React.createElement('span', { className: 'text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500', title: t('requires core version', getLang()) + ' ' + p.requires }, '≥ ' + p.requires),
                    p.error && React.createElement('span', { className: 'text-[10px] text-red-500' }, p.error),
                  ),
                  React.createElement('p', { className: 'text-xs text-gray-500 mt-0.5' }, t(p.description, getLang())),
                  p.author && React.createElement('p', { className: 'text-[10px] text-gray-400 mt-0.5' }, t('by', getLang()) + ' ' + p.author),
                ),
                React.createElement('button', { onClick: () => openDetail(p), className: 'flex items-center gap-1 shrink-0 text-xs px-2 py-1.5 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-50' }, React.createElement(Info, { size: 13 }), t('details', getLang())),
                p.settingsSchema?.length > 0 && React.createElement('button', { onClick: () => openSettings(p), className: 'flex items-center gap-1 shrink-0 text-xs px-2 py-1.5 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-50' }, React.createElement(Settings, { size: 13 }), t('settings', getLang())),
                React.createElement('button', {
                  onClick: () => toggle(p.name, !p.active),
                  className: 'flex items-center gap-1.5 shrink-0 text-xs px-2.5 py-1.5 rounded-lg border ' + (p.active ? 'bg-green-50 border-green-200 text-green-700' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'),
                },
                  p.active ? React.createElement(ToggleRight, { size: 14 }) : React.createElement(ToggleLeft, { size: 14 }),
                  p.active ? t('active', getLang()) : t('inactive', getLang())
                )
              )
            )
          )
    ),
    detail && React.createElement('div', { className: 'fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4', onClick: (e: React.MouseEvent) => { if (e.target === e.currentTarget) setDetail(null); } },
      React.createElement('div', { className: 'card w-full max-w-md p-6' },
        React.createElement('div', { className: 'flex items-center justify-between mb-3' },
          React.createElement('h3', { className: 'text-sm font-semibold text-gray-900' }, detail.name + ' '),
          React.createElement('span', { className: 'text-xs text-gray-400' }, 'v' + detail.version),
          React.createElement('button', { onClick: () => setDetail(null), className: 'p-1 text-gray-400 hover:text-gray-700 ml-auto', title: t('close', getLang()) }, React.createElement(X, { size: 16 }))
        ),
        React.createElement('p', { className: 'text-sm text-gray-500 mb-2' }, t(detail.description, getLang())),
        detail.author && React.createElement('p', { className: 'text-[10px] text-gray-400 mb-2' }, t('by', getLang()) + ' ' + detail.author),
        detail.requires && React.createElement('p', { className: 'text-[10px] text-gray-400 mb-3' }, t('requires core version', getLang()) + ': ' + detail.requires),
        devMode && React.createElement(React.Fragment, null,
          React.createElement('p', { className: 'text-xs font-semibold text-gray-700 mb-2' }, t('registered hooks', getLang()) + ' (' + detailHooks.length + ')'),
          detailHooks.length === 0
            ? React.createElement('p', { className: 'text-xs text-gray-400' }, t('this plugin does not register hooks', getLang()))
            : React.createElement('div', { className: 'space-y-1 max-h-40 overflow-y-auto' },
                detailHooks.map((h: any, i: number) =>
                  React.createElement('div', { key: i, className: 'flex items-center gap-2 text-xs' },
                    React.createElement('span', { className: 'px-1.5 py-0.5 rounded text-[10px] font-bold ' + (h.kind === 'action' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700') }, h.kind),
                    React.createElement('code', { className: 'text-gray-700 truncate' }, h.name)
                  )
                )
              )
        )
      )
    ),
    // Plugin settings modal (rendered from the plugin's settingsSchema)
    settingsFor && React.createElement('div', { className: 'fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4', onClick: (e: React.MouseEvent) => { if (e.target === e.currentTarget) setSettingsFor(null); } },
      React.createElement('div', { className: 'card w-full max-w-md p-6 max-h-[85vh] overflow-y-auto' },
        React.createElement('div', { className: 'flex items-center justify-between mb-1' },
          React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 flex items-center gap-2' }, React.createElement(Settings, { size: 15, className: 'text-primary-500' }), settingsFor.name + ' ' + t('settings', getLang())),
          React.createElement('button', { onClick: () => setSettingsFor(null), className: 'p-1 text-gray-400 hover:text-gray-700', title: t('close', getLang()) }, React.createElement(X, { size: 16 }))
        ),
        React.createElement('p', { className: 'text-xs text-gray-400 mb-4' }, t(settingsFor.description, getLang())),
        React.createElement('div', { className: 'space-y-4' },
          (settingsFor.settingsSchema || []).map((f: any) =>
            React.createElement('div', { key: f.key },
              React.createElement('label', { className: 'block text-xs font-medium text-gray-700 mb-1' }, t(f.label, getLang())),
              f.type === 'checkbox'
                ? React.createElement('label', { className: 'flex items-center gap-2 cursor-pointer' },
                    React.createElement('input', { type: 'checkbox', checked: settingsValues[f.key] === '1', onChange: (e: React.ChangeEvent<HTMLInputElement>) => setSettingsValues({ ...settingsValues, [f.key]: e.target.checked ? '1' : '0' }), className: 'rounded border-gray-300 text-primary-600' }),
                    React.createElement('span', { className: 'text-sm text-gray-600' }, settingsValues[f.key] === '1' ? t('enabled', getLang()) : t('disabled', getLang())))
                : f.type === 'select'
                  ? React.createElement('select', { value: settingsValues[f.key] || '', onChange: (e: React.ChangeEvent<HTMLSelectElement>) => setSettingsValues({ ...settingsValues, [f.key]: e.target.value }), className: 'input-field text-sm' },
                      (f.options || []).map((o: string) => React.createElement('option', { key: o, value: o }, o)))
                  : f.type === 'textarea'
                    ? React.createElement('textarea', { value: settingsValues[f.key] || '', onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => setSettingsValues({ ...settingsValues, [f.key]: e.target.value }), rows: 3, className: 'input-field font-mono text-xs' })
                    : React.createElement('input', { type: f.type === 'password' ? 'password' : f.type === 'number' ? 'number' : 'text', value: settingsValues[f.key] || '', onChange: (e: React.ChangeEvent<HTMLInputElement>) => setSettingsValues({ ...settingsValues, [f.key]: e.target.value }), className: 'input-field text-sm' }),
              f.hint && React.createElement('p', { className: 'text-[10px] text-gray-400 mt-1' }, t(f.hint, getLang())),
            )
          )
        ),
        // Read-only reports (link-health-check / media-cleanup)
        Object.keys(settingsReports).length > 0 && React.createElement('div', { className: 'mt-4 pt-4 border-t border-gray-100' },
          React.createElement('p', { className: 'text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1.5' }, React.createElement(Eye, { size: 13, className: 'text-gray-400' }), t('latest report', getLang())),
          Object.entries(settingsReports).map(([key, raw]) => {
            let parsed: any = null;
            try { parsed = JSON.parse(raw); } catch {}
            return React.createElement('div', { key: key, className: 'bg-gray-50 rounded-lg p-3 text-[11px] text-gray-500' },
              parsed
                ? React.createElement(React.Fragment, null,
                    React.createElement('p', { className: 'mb-1' }, new Date(parsed.at || Date.now()).toLocaleString() + (parsed.checked !== undefined ? ' · ' + t('checked', getLang()) + ': ' + parsed.checked + ' · ' + t('broken', getLang()) + ': ' + parsed.broken : '') + (parsed.orphaned !== undefined ? ' · ' + t('orphaned', getLang()) + ': ' + parsed.orphaned + ' · ' + t('deleted', getLang()) + ': ' + parsed.deleted : '')),
                    Array.isArray(parsed.items) && parsed.items.length > 0
                      ? React.createElement('ul', { className: 'space-y-0.5 max-h-32 overflow-y-auto' }, parsed.items.slice(0, 20).map((it: any, i: number) =>
                          React.createElement('li', { key: i, className: 'truncate ' + (it.ok === false ? 'text-red-500' : '') }, it.name || it.url || it.original)))
                      : null)
                : React.createElement('p', { className: 'break-all' }, String(raw).slice(0, 300)));
          })
        ),
        React.createElement('div', { className: 'flex gap-3 mt-5' },
          React.createElement('button', { onClick: () => setSettingsFor(null), className: 'btn-secondary flex-1 justify-center text-sm' }, t('cancel', getLang())),
          React.createElement('button', { onClick: saveSettings, disabled: settingsSaving, className: 'btn-primary flex-1 justify-center text-sm disabled:opacity-50' }, t('save settings', getLang()))
        )
      )
    ),
    devMode && React.createElement('div', { className: 'grid grid-cols-1 lg:grid-cols-2 gap-6' },
      React.createElement('div', { className: 'card p-5' },
        React.createElement('div', { className: 'flex items-center gap-2 mb-4' },
          React.createElement(Zap, { size: 18, className: 'text-blue-500' }),
          React.createElement('h3', { className: 'text-sm font-semibold text-gray-900' }, t('actions', getLang()) + ' (' + hooks.actions.length + ')'),
        ),
        React.createElement('div', { className: 'space-y-2' }, hooks.actions.map((h: any) => hookItem(h, 'action'))),
        hooks.actions.length === 0 && React.createElement('p', { className: 'text-xs text-gray-400' }, t('no actions registered', getLang()))
      ),
      React.createElement('div', { className: 'card p-5' },
        React.createElement('div', { className: 'flex items-center gap-2 mb-4' },
          React.createElement(Filter, { size: 18, className: 'text-purple-500' }),
          React.createElement('h3', { className: 'text-sm font-semibold text-gray-900' }, t('filters', getLang()) + ' (' + hooks.filters.length + ')'),
        ),
        React.createElement('div', { className: 'space-y-2' }, hooks.filters.map((h: any) => hookItem(h, 'filter'))),
        hooks.filters.length === 0 && React.createElement('p', { className: 'text-xs text-gray-400' }, t('no filters registered', getLang()))
      ),
    ),
    React.createElement('div', { className: 'card p-5 mt-6' },
      React.createElement('div', { className: 'flex items-center gap-2 mb-3' },
        React.createElement(Link2, { size: 18, className: 'text-gray-400' }),
        React.createElement('h3', { className: 'text-sm font-semibold text-gray-900' }, t('developer guide', getLang())),
      ),
      React.createElement('pre', { className: 'text-xs text-gray-600 bg-gray-50 rounded-lg p-4 overflow-x-auto' },
        `server/plugins/<name>/plugin.json   -> name, version, description, author\nserver/plugins/<name>/index.ts          -> export function register() { addFilter/addAction }\n\n// Example: hello-world plugin\nimport { addFilter } from '../../src/utils/hooks';\nexport function register() {\n  addFilter('post_content', (html, post) => '\\n<div>Plugin banner</div>' + html);\n}\n\nEnable/disable from this page — activation is persisted in settings.`
      ),
      React.createElement('p', { className: 'text-xs text-gray-400 mt-3' }, 'API: GET /api/plugins · PUT /api/plugins/:name/toggle · GET /api/plugins/hooks')
    )
  );
}

