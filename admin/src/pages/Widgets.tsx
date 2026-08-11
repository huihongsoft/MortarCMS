import React, { useEffect, useState } from 'react';
import { Save, GripVertical } from 'lucide-react';
import { t, getLang } from '../lib/i18n';
import api from '../lib/api';
import { useToast } from '../lib/toast';

const availableWidgets = [
  { id: 'search', name: t('search', getLang()), desc: t('a search form for your site', getLang()) },
  { id: 'categories', name: t('categories', getLang()), desc: t('a list of post categories', getLang()) },
  { id: 'recent_posts', name: t('recent posts', getLang()), desc: t('your most recent posts', getLang()) },
  { id: 'archives', name: t('archives', getLang()), desc: t('a monthly archive of your posts', getLang()) },
  { id: 'tag_cloud', name: t('tag cloud', getLang()), desc: t('a cloud of your most used tags', getLang()) },
  { id: 'html', name: t('custom html', getLang()), desc: t('free-form html block', getLang()) },
];

export default function Widgets() {
  const toast = useToast();
  const [active, setActive] = useState<string[]>(['search', 'categories']);
  const [config, setConfig] = useState<Record<string, { title?: string; html?: string }>>({});
  const [saved, setSaved] = useState(false);
  const [sites, setSites] = useState<any[]>([]);
  const [siteId, setSiteId] = useState('');

  useEffect(() => {
    api.get('/sites').then(r => setSites(r.data?.sites || r.data || [])).catch(() => {});
    load();
  }, []);

  async function load(sid?: string) {
    const target = sid !== undefined ? sid : siteId;
    try {
      const r = target
        ? await api.get('/sites/' + target + '/settings')
        : await api.get('/settings');
      const w = r.data.widgets_active;
      if (w) setActive(JSON.parse(w));
      const cfg = r.data.widgets_config;
      if (cfg) setConfig(JSON.parse(cfg));
    } catch {}
  }

  async function save() {
    const payload: any = {
      widgets_active: JSON.stringify(active),
      widgets_config: JSON.stringify(config),
    };
    if (siteId) await api.put('/sites/' + siteId + '/settings', payload);
    else await api.put('/settings', payload);
    toast.toast(siteId ? t('widgets saved for site', getLang()) : t('widgets saved globally', getLang()));
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  }

  function setCfg(id: string, patch: { title?: string; html?: string }) {
    setConfig(prev => ({ ...prev, [id]: { ...(prev[id] || {}), ...patch } }));
  }

  function toggle(id: string) {
    setActive(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  function moveUp(idx: number) {
    if (idx === 0) return;
    const next = [...active];
    [next[idx-1], next[idx]] = [next[idx], next[idx-1]];
    setActive(next);
  }

  function moveDown(idx: number) {
    if (idx === active.length - 1) return;
    const next = [...active];
    [next[idx], next[idx+1]] = [next[idx+1], next[idx]];
    setActive(next);
  }

  return React.createElement('div', null,
    React.createElement('div', { className: 'flex items-center justify-between mb-6' },
      React.createElement('h2', { className: 'text-2xl font-bold text-gray-900' }, t('widgets', getLang())),
      React.createElement('div', { className: 'flex items-center gap-3' },
        sites.length > 0 && React.createElement('select', { value: siteId, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => { setSiteId(e.target.value); load(e.target.value); }, className: 'input-field w-48' },
          React.createElement('option', { value: '' }, t('global (all sites)', getLang())),
          sites.map((st: any) => React.createElement('option', { key: st.id, value: st.id }, st.name))
        ),
        React.createElement('button', { onClick: save, className: 'btn-primary' }, React.createElement(Save, { size: 16 }), saved ? t('saved', getLang()) : t('save', getLang()))
      )
    ),
    React.createElement('div', { className: 'grid grid-cols-1 lg:grid-cols-2 gap-6' },
      React.createElement('div', { className: 'card p-5' },
        React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider' }, t('available widgets', getLang())),
        React.createElement('div', { className: 'space-y-2' },
          availableWidgets.filter(w => !active.includes(w.id)).map(w =>
            React.createElement('div', { key: w.id, onClick: () => toggle(w.id), className: 'flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 hover:border-primary-300 transition-colors' },
              React.createElement('div', { className: 'flex-1' },
                React.createElement('p', { className: 'text-sm font-medium text-gray-900' }, w.name),
                React.createElement('p', { className: 'text-xs text-gray-500' }, w.desc)
              ),
              React.createElement('span', { className: 'text-xs text-primary-600 font-medium' }, '+ ' + t('add', getLang()))
            )
          ),
          availableWidgets.filter(w => !active.includes(w.id)).length === 0 &&
            React.createElement('p', { className: 'text-sm text-gray-400 py-4' }, t('all widgets are active', getLang()))
        )
      ),
      React.createElement('div', { className: 'card p-5' },
        React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider' }, t('active widgets', getLang())),
        active.length === 0
          ? React.createElement('p', { className: 'text-sm text-gray-400 py-4' }, t('no active widgets. add some from the left', getLang()))
          : React.createElement('div', { className: 'space-y-2' },
              active.map((id, idx) => {
                const w = availableWidgets.find(x => x.id === id);
                if (!w) return null;
                return React.createElement('div', { key: id, className: 'p-3 border border-gray-200 rounded-lg bg-gray-50' },
                  React.createElement('div', { className: 'flex items-center gap-2' },
                    React.createElement('div', { className: 'flex flex-col gap-px' },
                      React.createElement('button', { onClick: () => moveUp(idx), className: 'p-px text-gray-400 hover:text-gray-600 leading-none' }, '\u25b2'),
                      React.createElement('button', { onClick: () => moveDown(idx), className: 'p-px text-gray-400 hover:text-gray-600 leading-none' }, '\u25bc')
                    ),
                    React.createElement(GripVertical, { size: 14, className: 'text-gray-300' }),
                    React.createElement('span', { className: 'flex-1 text-sm text-gray-900' }, w.name),
                    React.createElement('button', { onClick: () => toggle(id), className: 'text-xs text-red-500 hover:text-red-700 font-medium' }, t('remove', getLang()))
                  ),
                  // Per-widget configuration (title for all, custom HTML for html widgets)
                  React.createElement('div', { className: 'mt-2 space-y-2' },
                    id !== 'html' && React.createElement('input', {
                      type: 'text',
                      value: config[id]?.title || '',
                      onChange: (e: React.ChangeEvent<HTMLInputElement>) => setCfg(id, { title: e.target.value }),
                      placeholder: t('widget title (optional)', getLang()),
                      className: 'input-field text-xs',
                    }),
                    id === 'html' && React.createElement('textarea', {
                      value: config[id]?.html || '',
                      onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => setCfg(id, { html: e.target.value }),
                      placeholder: '<p>' + t('custom html content', getLang()) + '</p>',
                      rows: 3,
                      className: 'input-field text-xs font-mono',
                    })
                  )
                );
              })
            )
      )
    )
  );
}
