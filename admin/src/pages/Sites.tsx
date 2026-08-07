import React, { useEffect, useState } from 'react';
import { Globe, Plus, Trash2, Star, Pencil, Check, X } from 'lucide-react';
import { useToast } from '../lib/toast';
import api from '../lib/api';
import { t, getLang } from '../lib/i18n';

export default function Sites() {
  const [sites, setSites] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: '', slug: '', domain: '', description: '' });
  const [settingsMap, setSettingsMap] = useState<Record<string, Record<string, string>>>({});
  const toast = useToast();

  useEffect(() => { fetchSites(); }, []);
  async function fetchSites() { api.get('/sites').then(r => setSites(r.data || [])).catch(() => {}); }

  async function save() {
    try {
      if (editing) { await api.put('/sites/' + editing.id, form); }
      else { await api.post('/sites', form); }
      toast.toast(editing ? t('site updated', getLang()) : t('site created', getLang()));
      setShowForm(false); setEditing(null); setForm({ name: '', slug: '', domain: '', description: '' });
      fetchSites();
    } catch (e: any) { toast.toast(e.response?.data?.error || t('save failed', getLang()), 'error'); }
  }

  async function toggleActive(s: any) {
    await api.put('/sites/' + s.id, { active: s.active ? 0 : 1 });
    fetchSites();
  }

  async function setPrimary(s: any) {
    await api.post('/sites/' + s.id + '/primary');
    toast.toast(s.name + ' ' + t('is now the primary site', getLang()));
    fetchSites();
  }

  async function remove(s: any) {
    if (!confirm(t('delete site', getLang()) + ' "' + s.name + '"?')) return;
    try {
      await api.delete('/sites/' + s.id);
      fetchSites();
    } catch (e: any) { toast.toast(e.response?.data?.error || t('delete failed', getLang()), 'error'); }
  }

  async function saveSettings(s: any) {
    try {
      const st = settingsMap[s.id] || {};
      await api.put('/sites/' + s.id + '/settings', { site_title: st.site_title || s.name, site_url: 'http://' + s.domain, site_description: st.site_description || '' });
      toast.toast(t('site settings saved', getLang()));
    } catch (e: any) { toast.toast(t('save failed', getLang()), 'error'); }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  void saveSettings;

  return React.createElement('div', null,
    React.createElement('div', { className: 'flex items-center justify-between mb-6' },
      React.createElement('div', null,
        React.createElement('h2', { className: 'text-2xl font-bold text-gray-900' }, t('sites', getLang())),
        React.createElement('p', { className: 'text-sm text-gray-500 mt-1' }, t('multi-site: register domains that render this content with their own site title and description.', getLang())),
      ),
      React.createElement('button', { onClick: () => { setEditing(null); setForm({ name: '', slug: '', domain: '', description: '' }); setShowForm(!showForm); }, className: 'btn-primary' }, React.createElement(Plus, { size: 16 }), t('new site', getLang()))
    ),
    showForm && React.createElement('div', { className: 'card p-5 mb-6' },
      React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 mb-4' }, editing ? t('edit site', getLang()) : t('new site', getLang())),
      React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-3' },
        React.createElement('input', { value: form.name, onChange: e => setForm({ ...form, name: e.target.value }), placeholder: t('site name', getLang()), className: 'input-field' }),
        React.createElement('input', { value: form.slug, onChange: e => setForm({ ...form, slug: e.target.value }), placeholder: t('slug (unique)', getLang()), className: 'input-field' }),
        React.createElement('input', { value: form.domain, onChange: e => setForm({ ...form, domain: e.target.value }), placeholder: t('domain (e.g. blog.example.com)', getLang()), className: 'input-field' }),
        React.createElement('input', { value: form.description, onChange: e => setForm({ ...form, description: e.target.value }), placeholder: t('description (optional)', getLang()), className: 'input-field' }),
      ),
      React.createElement('div', { className: 'flex gap-2 mt-4' },
        React.createElement('button', { onClick: save, className: 'btn-primary text-sm' }, React.createElement(Check, { size: 14 }), t('save', getLang())),
        React.createElement('button', { onClick: () => setShowForm(false), className: 'btn-secondary text-sm' }, t('cancel', getLang()))
      )
    ),
    sites.length === 0
      ? React.createElement('div', { className: 'card p-10 text-center' },
          React.createElement(Globe, { size: 40, className: 'mx-auto mb-3 text-gray-300' }),
          React.createElement('p', { className: 'text-gray-500' }, t('no sites yet. create your first site to enable multi-domain rendering.', getLang())))
      : React.createElement('div', { className: 'space-y-4' },
          sites.map((s: any) =>
            React.createElement('div', { key: s.id, className: 'card p-5' },
              React.createElement('div', { className: 'flex items-start justify-between gap-4' },
                React.createElement('div', { className: 'min-w-0' },
                  React.createElement('div', { className: 'flex items-center gap-2' },
                    React.createElement(Globe, { size: 16, className: 'text-gray-400' }),
                    React.createElement('span', { className: 'font-medium text-gray-900' }, s.name),
                    s.isPrimary === 1 && React.createElement('span', { className: 'px-1.5 py-0.5 text-[10px] rounded bg-amber-100 text-amber-700' }, t('primary', getLang())),
                    s.active ? React.createElement('span', { className: 'px-1.5 py-0.5 text-[10px] rounded bg-green-100 text-green-700' }, t('active', getLang())) : React.createElement('span', { className: 'px-1.5 py-0.5 text-[10px] rounded bg-gray-100 text-gray-500' }, t('inactive', getLang())),
                  ),
                  React.createElement('p', { className: 'text-xs text-gray-500 mt-1' }, s.domain + (s.description ? ' · ' + s.description : '')),
                ),
                React.createElement('div', { className: 'flex items-center gap-1 shrink-0' },
                  s.isPrimary !== 1 && React.createElement('button', { onClick: () => setPrimary(s), className: 'p-1.5 text-gray-400 hover:text-amber-500', title: t('set as primary', getLang()) }, React.createElement(Star, { size: 16 })),
                  React.createElement('button', { onClick: () => toggleActive(s), className: 'p-1.5 text-gray-400 hover:text-gray-700', title: s.active ? t('deactivate', getLang()) : t('activate', getLang()) }, s.active ? React.createElement(X, { size: 16 }) : React.createElement(Check, { size: 16 })),
                  React.createElement('button', { onClick: () => { setEditing(s); setForm({ name: s.name, slug: s.slug, domain: s.domain, description: s.description }); setShowForm(true); }, className: 'p-1.5 text-gray-400 hover:text-primary-600', title: t('edit', getLang()) }, React.createElement(Pencil, { size: 16 })),
                  React.createElement('button', { onClick: () => remove(s), className: 'p-1.5 text-gray-400 hover:text-red-600', title: t('delete', getLang()) }, React.createElement(Trash2, { size: 16 })),
                )
              ),
              React.createElement('div', { className: 'mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-3 items-end' },
                React.createElement('div', null,
                  React.createElement('label', { className: 'block text-[10px] text-gray-400 mb-1' }, t('site title (overrides global)', getLang())),
                  React.createElement('input', { value: (settingsMap[s.id] || {}).site_title || '', onChange: (e: React.ChangeEvent<HTMLInputElement>) => setSettingsMap({ ...settingsMap, [s.id]: { ...(settingsMap[s.id] || {}), site_title: e.target.value } }), placeholder: s.name, className: 'input-field text-xs' }),
                ),
                React.createElement('div', null,
                  React.createElement('label', { className: 'block text-[10px] text-gray-400 mb-1' }, t('site description', getLang())),
                  React.createElement('input', { value: (settingsMap[s.id] || {}).site_description || '', onChange: (e: React.ChangeEvent<HTMLInputElement>) => setSettingsMap({ ...settingsMap, [s.id]: { ...(settingsMap[s.id] || {}), site_description: e.target.value } }), placeholder: t('optional', getLang()), className: 'input-field text-xs' }),
                ),
                React.createElement('button', { onClick: () => saveSettings(s), className: 'btn-secondary text-xs' }, t('save site settings', getLang())),
              )
            )
          )
        )
  );
}
