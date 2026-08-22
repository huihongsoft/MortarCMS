import React, { useEffect, useState } from 'react';
import { Globe, Plus, Trash2, Star, Pencil, Check, X, Copy, Layers, RefreshCw } from 'lucide-react';
import { useToast } from '../lib/toast';
import api from '../lib/api';
import { t, getLang } from '../lib/i18n';

type ContentType = 'posts' | 'pages' | 'media' | 'comments';

export default function Sites() {
  const [sites, setSites] = useState<any[]>([]);
  const [global, setGlobal] = useState<Record<string, number>>({});
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: '', slug: '', domain: '', description: '' });
  const [settingsMap, setSettingsMap] = useState<Record<string, Record<string, string>>>({});
  // Content management modal state
  const [contentSite, setContentSite] = useState<any>(null);
  const [contentData, setContentData] = useState<Record<string, any[]>>({});
  const [contentType, setContentType] = useState<ContentType>('posts');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [contentLoading, setContentLoading] = useState(false);
  const toast = useToast();

  useEffect(() => { fetchSites(); }, []);
  async function fetchSites() {
    api.get('/sites').then(r => {
      setSites(r.data?.sites || []);
      setGlobal(r.data?.global || {});
    }).catch(() => {});
  }

  // Prefill per-site settings overrides when the page loads
  useEffect(() => {
    if (sites.length === 0) return;
    let alive = true;
    sites.forEach((s: any) => {
      api.get('/sites/' + s.id + '/settings').then(r => {
        if (alive) setSettingsMap(prev => ({ ...prev, [s.id]: r.data || {} }));
      }).catch(() => {});
    });
    return () => { alive = false; };
  }, [sites.length]); // eslint-disable-line react-hooks/exhaustive-deps

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

  async function duplicate(s: any) {
    try {
      const r = await api.post('/sites/' + s.id + '/duplicate');
      toast.toast(t('site duplicated', getLang()) + ': ' + (r.data?.name || ''));
      fetchSites();
    } catch (e: any) { toast.toast(e.response?.data?.error || t('duplicate failed', getLang()), 'error'); }
  }

  async function saveSettings(s: any) {
    try {
      const st = settingsMap[s.id] || {};
      await api.put('/sites/' + s.id + '/settings', {
        site_title: st.site_title || s.name,
        site_url: 'http://' + s.domain,
        site_description: st.site_description || '',
      });
      toast.toast(t('site settings saved', getLang()));
    } catch (e: any) { toast.toast(t('save failed', getLang()), 'error'); }
  }

  // ---- Content management modal ----
  const openContent = async (s: any) => {
    setContentSite(s); setContentType('posts'); setSelected(new Set());
    setContentLoading(true);
    try {
      const r = await api.get('/sites/' + s.id + '/content');
      setContentData(r.data || {});
    } catch { setContentData({}); }
    setContentLoading(false);
  };

  const contentList = contentData[contentType] || [];
  const contentKey: Record<ContentType, string> = { posts: 'post', pages: 'page', media: 'media', comments: 'comment' };
  const typeLabels: ContentType[] = ['posts', 'pages', 'media', 'comments'];

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };

  const applyContent = async (kind: 'assign' | 'global') => {
    if (selected.size === 0 || !contentSite) return;
    try {
      await api.post('/sites/' + contentSite.id + '/content/' + kind, { type: contentKey[contentType], ids: [...selected] });
      toast.toast(kind === 'assign' ? t('assigned to site', getLang()) : t('made global', getLang()));
      setSelected(new Set());
      const r = await api.get('/sites/' + contentSite.id + '/content');
      setContentData(r.data || {});
      fetchSites();
    } catch (e: any) { toast.toast(e.response?.data?.error || t('save failed', getLang()), 'error'); }
  };

  const badge = (item: any, siteId: string) => {
    if (item.siteId === siteId) return React.createElement('span', { className: 'text-[10px] px-1.5 py-0.5 rounded bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' }, t('assigned', getLang()));
    if (!item.siteId) return React.createElement('span', { className: 'text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' }, t('global', getLang()));
    return React.createElement('span', { className: 'text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400' }, t('other site', getLang()));
  };

  const statCell = (label: string, value: number) =>
    React.createElement('div', { className: 'text-center' },
      React.createElement('p', { className: 'text-lg font-semibold text-gray-900 dark:text-gray-100' }, value),
      React.createElement('p', { className: 'text-[10px] text-gray-400 uppercase tracking-wide' }, label));

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
          // Global content summary
          React.createElement('div', { className: 'card p-4 flex items-center gap-6 flex-wrap' },
            React.createElement('span', { className: 'text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide' }, t('global content (visible everywhere)', getLang())),
            statCell(t('posts', getLang()), global.posts || 0),
            statCell(t('pages', getLang()), global.pages || 0),
            statCell(t('comments', getLang()), global.comments || 0),
            statCell(t('media', getLang()), global.media || 0),
            statCell(t('menus', getLang()), global.menus || 0),
          ),
          sites.map((s: any) =>
            React.createElement('div', { key: s.id, className: 'card p-5' },
              React.createElement('div', { className: 'flex items-start justify-between gap-4' },
                React.createElement('div', { className: 'min-w-0' },
                  React.createElement('div', { className: 'flex items-center gap-2 flex-wrap' },
                    React.createElement(Globe, { size: 16, className: 'text-gray-400' }),
                    React.createElement('span', { className: 'font-medium text-gray-900' }, s.name),
                    s.isPrimary === 1 && React.createElement('span', { className: 'px-1.5 py-0.5 text-[10px] rounded bg-amber-100 text-amber-700' }, t('primary', getLang())),
                    s.active ? React.createElement('span', { className: 'px-1.5 py-0.5 text-[10px] rounded bg-green-100 text-green-700' }, t('active', getLang())) : React.createElement('span', { className: 'px-1.5 py-0.5 text-[10px] rounded bg-gray-100 text-gray-500' }, t('inactive', getLang())),
                  ),
                  React.createElement('p', { className: 'text-xs text-gray-500 mt-1' }, s.domain + (s.description ? ' · ' + s.description : '')),
                  // Stats row
                  React.createElement('div', { className: 'flex items-center gap-5 mt-3 flex-wrap' },
                    statCell(t('posts', getLang()), s.stats?.posts || 0),
                    statCell(t('pages', getLang()), s.stats?.pages || 0),
                    statCell(t('comments', getLang()), s.stats?.comments || 0),
                    statCell(t('media', getLang()), s.stats?.media || 0),
                    statCell(t('menus', getLang()), s.stats?.menus || 0),
                  )
                ),
                React.createElement('div', { className: 'flex items-center gap-1 shrink-0' },
                  s.isPrimary !== 1 && React.createElement('button', { onClick: () => setPrimary(s), className: 'p-1.5 text-gray-400 hover:text-amber-500', title: t('set as primary', getLang()) }, React.createElement(Star, { size: 16 })),
                  React.createElement('button', { onClick: () => openContent(s), className: 'p-1.5 text-gray-400 hover:text-primary-600', title: t('manage content', getLang()) }, React.createElement(Layers, { size: 16 })),
                  React.createElement('button', { onClick: () => duplicate(s), className: 'p-1.5 text-gray-400 hover:text-primary-600', title: t('duplicate', getLang()) }, React.createElement(Copy, { size: 16 })),
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
        ),
    // ---- Content management modal ----
    contentSite && React.createElement('div', { className: 'fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-4', onClick: (e: React.MouseEvent) => { if (e.target === e.currentTarget) setContentSite(null); } },
      React.createElement('div', { className: 'card w-full max-w-2xl max-h-[80vh] flex flex-col' },
        React.createElement('div', { className: 'flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700' },
          React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 dark:text-gray-100' }, t('manage content', getLang()) + ': ' + contentSite.name),
          React.createElement('button', { onClick: () => setContentSite(null), className: 'p-1.5 text-gray-400 hover:text-gray-700', title: t('close', getLang()) }, React.createElement(X, { size: 16 }))
        ),
        // Type tabs
        React.createElement('div', { className: 'flex gap-1 px-5 pt-4' },
          typeLabels.map(ty =>
            React.createElement('button', {
              key: ty,
              onClick: () => { setContentType(ty); setSelected(new Set()); },
              className: 'px-3 py-1.5 text-xs rounded-lg border ' + (contentType === ty ? 'border-primary-400 bg-primary-50 text-primary-700 font-medium' : 'border-gray-200 text-gray-500 hover:text-gray-700'),
            }, t(ty, getLang()) + ' (' + (contentData[ty]?.length || 0) + ')')
          )
        ),
        // Content list
        React.createElement('div', { className: 'flex-1 overflow-y-auto p-5' },
          contentLoading
            ? React.createElement('p', { className: 'text-sm text-gray-400 text-center py-8' }, t('loading', getLang()) + '…')
            : contentList.length === 0
              ? React.createElement('p', { className: 'text-sm text-gray-400 text-center py-8' }, t('no content', getLang()))
              : contentList.map((item: any) =>
                  React.createElement('label', { key: item.id, className: 'flex items-center gap-3 py-2 border-b border-gray-50 dark:border-gray-800 last:border-0 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded px-2 -mx-2' },
                    React.createElement('input', { type: 'checkbox', checked: selected.has(item.id), onChange: () => toggleSelect(item.id), className: 'rounded border-gray-300 text-primary-600' }),
                    React.createElement('span', { className: 'flex-1 text-sm text-gray-700 dark:text-gray-200 truncate' }, item.title || item.id),
                    badge(item, contentSite.id)
                  )
                )
        ),
        // Actions
        React.createElement('div', { className: 'flex items-center gap-2 p-5 border-t border-gray-100 dark:border-gray-700' },
          React.createElement('button', { onClick: () => applyContent('assign'), disabled: selected.size === 0, className: 'btn-primary text-sm disabled:opacity-40' }, React.createElement(Check, { size: 14 }), t('assign to this site', getLang()) + ' (' + selected.size + ')'),
          React.createElement('button', { onClick: () => applyContent('global'), disabled: selected.size === 0, className: 'btn-secondary text-sm disabled:opacity-40' }, React.createElement(Globe, { size: 14 }), t('make global', getLang())),
          React.createElement('button', { onClick: () => openContent(contentSite), className: 'btn-secondary text-sm ml-auto', title: t('refresh', getLang()) }, React.createElement(RefreshCw, { size: 14 }))
        )
      )
    )
  );
}
