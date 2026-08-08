import React, { useEffect, useState } from 'react';
import { Save, Zap, Plus, Trash2, KeyRound, Server } from 'lucide-react';
import api from '../lib/api';
import { useToast } from '../lib/toast';
import { t, getLang } from '../lib/i18n';

interface Provider {
  id: string;
  name: string;
  type: string;
  baseUrl: string;
  apiKey: string;
  model: string;
  enabled: boolean;
  hasKey?: boolean;
}

const TOOL_NAMES = [
  'get_site_stats', 'list_posts', 'get_post', 'search_site_content', 'write_post', 'update_post',
  'list_comments', 'get_categories', 'list_tags', 'generate_image', 'web_search', 'get_site_settings', 'update_site_settings',
];

export default function AISettings() {
  const toast = useToast();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [presets, setPresets] = useState<any[]>([]);
  const [defaultProvider, setDefaultProvider] = useState('');
  const [allowedRoles, setAllowedRoles] = useState<string[]>([]);
  const [toolPermissions, setToolPermissions] = useState<Record<string, string[]>>({});
  const [roles, setRoles] = useState<string[]>([]);
  const [testing, setTesting] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<Record<string, { ok: boolean; message: string }>>({});

  useEffect(() => {
    api.get('/ai/settings').then(r => {
      setProviders(r.data.providers || []);
      setPresets(r.data.presets || []);
      setDefaultProvider(r.data.defaultProvider || '');
      setAllowedRoles(r.data.allowedRoles || []);
      setToolPermissions(r.data.toolPermissions || {});
      setRoles(r.data.roles || []);
    }).catch(() => {});
  }, []);

  function updateProvider(id: string, patch: Partial<Provider>) {
    setProviders(providers.map(p => p.id === id ? { ...p, ...patch } : p));
  }

  function addProvider(preset: any) {
    if (providers.some(p => p.id === preset.id)) { toast.toast(t('provider already exists', getLang())); return; }
    setProviders([...providers, { ...preset, apiKey: '', enabled: true }]);
  }

  async function save() {
    try {
      await api.put('/ai/settings', { providers, defaultProvider, allowedRoles, toolPermissions });
      toast.toast(t('saved', getLang()));
    } catch (e: any) { toast.toast(e.response?.data?.error || t('save failed', getLang()), 'error'); }
  }

  async function test(id: string) {
    const p = providers.find(x => x.id === id);
    if (!p || !p.apiKey) { toast.toast(t('enter api key first', getLang()), 'error'); return; }
    setTesting(id);
    try {
      const r = await api.post('/ai/test', { provider: { type: p.type, baseUrl: p.baseUrl, apiKey: p.apiKey, model: p.model } });
      setTestResult({ ...testResult, [id]: r.data });
    } catch (e: any) {
      setTestResult({ ...testResult, [id]: { ok: false, message: e.response?.data?.error || 'error' } });
    } finally { setTesting(null); }
  }

  function toggleRole(role: string) {
    setAllowedRoles(allowedRoles.includes(role) ? allowedRoles.filter(r => r !== role) : [...allowedRoles, role]);
  }

  function toggleTool(role: string, tool: string) {
    const cur = toolPermissions[role] || [];
    const next = cur.includes(tool) ? cur.filter(x => x !== tool) : [...cur, tool];
    setToolPermissions({ ...toolPermissions, [role]: next });
  }

  return React.createElement('div', null,
    React.createElement('div', { className: 'flex items-center justify-between mb-6' },
      React.createElement('h2', { className: 'text-2xl font-bold text-gray-900' }, t('ai settings', getLang())),
      React.createElement('button', { onClick: save, className: 'btn-primary' }, React.createElement(Save, { size: 16 }), t('save', getLang()))
    ),

    // ---- Providers ----
    React.createElement('div', { className: 'card p-6 mb-6' },
      React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 mb-1 uppercase tracking-wider' }, t('model providers', getLang())),
      React.createElement('p', { className: 'text-xs text-gray-400 mb-4' }, t('ai providers hint', getLang())),

      // Preset quick-add
      React.createElement('div', { className: 'flex flex-wrap gap-2 mb-5' },
        presets.map(p => React.createElement('button', {
          key: p.id,
          onClick: () => addProvider(p),
          className: 'flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-gray-200 text-gray-600 hover:border-primary-400 hover:text-primary-600 transition-colors',
        }, React.createElement(Plus, { size: 12 }), p.name))
      ),

      providers.length === 0 && React.createElement('p', { className: 'text-sm text-gray-400' }, t('no providers yet', getLang())),

      React.createElement('div', { className: 'space-y-4' },
        providers.map(p => React.createElement('div', { key: p.id, className: 'border border-gray-200 rounded-xl p-4' },
          React.createElement('div', { className: 'flex items-center justify-between mb-3' },
            React.createElement('div', { className: 'flex items-center gap-2' },
              React.createElement('span', { className: 'font-medium text-gray-900 text-sm' }, p.name),
              React.createElement('span', { className: 'text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500' }, p.type === 'anthropic' ? 'Anthropic' : 'OpenAI 兼容'),
              p.id === defaultProvider && React.createElement('span', { className: 'text-[10px] px-1.5 py-0.5 rounded bg-primary-50 text-primary-600' }, t('default', getLang())),
            ),
            React.createElement('div', { className: 'flex items-center gap-2' },
              React.createElement('button', { onClick: () => test(p.id), disabled: testing === p.id, className: 'flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50' }, React.createElement(Zap, { size: 12 }), testing === p.id ? t('testing', getLang()) + '...' : t('test', getLang())),
              React.createElement('button', { onClick: () => setDefaultProvider(p.id), className: 'text-xs px-2.5 py-1 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50' }, t('set default', getLang())),
              React.createElement('label', { className: 'flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer' },
                React.createElement('input', { type: 'checkbox', checked: p.enabled, onChange: e => updateProvider(p.id, { enabled: e.target.checked }), className: 'rounded border-gray-300 text-primary-600' }),
                t('enabled', getLang())),
              React.createElement('button', { onClick: () => setProviders(providers.filter(x => x.id !== p.id)), className: 'p-1 text-gray-400 hover:text-red-600' }, React.createElement(Trash2, { size: 14 })),
            )
          ),
          testResult[p.id] && React.createElement('p', { className: 'text-xs mb-3 ' + (testResult[p.id].ok ? 'text-green-600' : 'text-red-600') }, (testResult[p.id].ok ? '✓ ' : '✗ ') + testResult[p.id].message),
          React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-3 gap-3' },
            React.createElement('div', null,
              React.createElement('label', { className: 'block text-xs text-gray-500 mb-1 flex items-center gap-1' }, React.createElement(KeyRound, { size: 10 }), t('api key', getLang())),
              React.createElement('input', { type: 'password', value: p.hasKey && !p.apiKey ? '' : p.apiKey, placeholder: p.hasKey ? '•••••••• (已保存)' : 'sk-...', onChange: e => updateProvider(p.id, { apiKey: e.target.value }), className: 'input-field text-xs' })),
            React.createElement('div', null,
              React.createElement('label', { className: 'block text-xs text-gray-500 mb-1 flex items-center gap-1' }, React.createElement(Server, { size: 10 }), t('base url', getLang())),
              React.createElement('input', { value: p.baseUrl, onChange: e => updateProvider(p.id, { baseUrl: e.target.value }), className: 'input-field text-xs' })),
            React.createElement('div', null,
              React.createElement('label', { className: 'block text-xs text-gray-500 mb-1' }, t('model', getLang())),
              React.createElement('input', { value: p.model, onChange: e => updateProvider(p.id, { model: e.target.value }), className: 'input-field text-xs' })),
          )
        ))
      )
    ),

    // ---- Permissions ----
    React.createElement('div', { className: 'grid grid-cols-1 lg:grid-cols-2 gap-6' },
      React.createElement('div', { className: 'card p-6' },
        React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider' }, t('allowed roles', getLang())),
        React.createElement('p', { className: 'text-xs text-gray-400 mb-4' }, t('ai roles hint', getLang())),
        React.createElement('div', { className: 'flex flex-wrap gap-2' },
          roles.map(r => React.createElement('label', { key: r, className: 'flex items-center gap-1.5 px-3 py-2 rounded-lg border cursor-pointer ' + (allowedRoles.includes(r) ? 'border-primary-400 bg-primary-50' : 'border-gray-200') },
            React.createElement('input', { type: 'checkbox', checked: allowedRoles.includes(r) || r === 'admin', disabled: r === 'admin', onChange: () => toggleRole(r), className: 'rounded border-gray-300 text-primary-600' }),
            React.createElement('span', { className: 'text-sm text-gray-700' }, r)
          ))
        ),
        React.createElement('p', { className: 'text-[10px] text-gray-400 mt-2' }, t('admin always allowed', getLang()))
      ),
      React.createElement('div', { className: 'card p-6' },
        React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider' }, t('tool permissions', getLang())),
        React.createElement('p', { className: 'text-xs text-gray-400 mb-4' }, t('tool perms hint', getLang())),
        React.createElement('div', { className: 'space-y-3 max-h-80 overflow-y-auto' },
          roles.filter(r => r !== 'admin').map(r =>
            React.createElement('div', { key: r, className: 'border border-gray-100 rounded-lg p-3' },
              React.createElement('p', { className: 'text-xs font-medium text-gray-700 mb-2 capitalize' }, r),
              React.createElement('div', { className: 'flex flex-wrap gap-1.5' },
                TOOL_NAMES.map(tool =>
                  React.createElement('button', {
                    key: tool,
                    onClick: () => toggleTool(r, tool),
                    disabled: !allowedRoles.includes(r) && r !== 'admin',
                    className: 'text-[10px] px-2 py-1 rounded-md border transition-colors ' +
                      ((toolPermissions[r] || []).includes(tool)
                        ? 'border-primary-400 bg-primary-50 text-primary-600'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300') + (allowedRoles.includes(r) ? '' : ' opacity-40 cursor-not-allowed'),
                  }, tool)
                )
              )
            )
          )
        )
      )
    )
  );
}
