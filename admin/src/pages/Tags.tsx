import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Pencil, Check, X, Tag as TagIcon } from 'lucide-react';
import { t, getLang } from '../lib/i18n';
import api from '../lib/api';
import { useToast } from '../lib/toast';

export default function Tags() {
  const [tags, setTags] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [editing, setEditing] = useState<any>(null);
  const toast = useToast();

  useEffect(() => { fetchTags(); }, []);
  async function fetchTags() { api.get('/tags').then(r => setTags(r.data || [])).catch(() => {}); }

  async function save() {
    if (!name) return;
    try {
      if (editing) { await api.put('/tags/' + editing.id, { name, slug }); }
      else { await api.post('/tags', { name, slug }); }
      toast.toast(editing ? t('tag updated', getLang()) : t('tag created', getLang()));
      reset(); fetchTags();
    } catch (e: any) { toast.toast(e.response?.data?.error || t('save failed', getLang()), 'error'); }
  }

  function reset() { setName(''); setSlug(''); setEditing(null); }
  function startEdit(tg: any) { setEditing(tg); setName(tg.name); setSlug(tg.slug); }

  async function del(tg: any) {
    if (!confirm(t('delete tag', getLang()) + ' "' + tg.name + '"?')) return;
    try { await api.delete('/tags/' + tg.id); toast.toast(t('tag deleted', getLang())); fetchTags(); }
    catch (e: any) { toast.toast(e.response?.data?.error || t('delete failed', getLang()), 'error'); }
  }

  return React.createElement('div', null,
    React.createElement('h2', { className: 'text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2' }, React.createElement(TagIcon, { size: 22 }), t('tags', getLang())),
    React.createElement('div', { className: 'grid grid-cols-1 lg:grid-cols-3 gap-6' },
      React.createElement('div', { className: 'card p-5' },
        React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 mb-4' }, editing ? t('edit tag', getLang()) : t('new tag', getLang())),
        React.createElement('div', { className: 'space-y-3' },
          React.createElement('input', { value: name, onChange: e => setName(e.target.value), placeholder: t('name', getLang()), className: 'input-field' }),
          React.createElement('input', { value: slug, onChange: e => setSlug(e.target.value), placeholder: t('slug (unique)', getLang()), className: 'input-field' }),
          React.createElement('div', { className: 'flex gap-2' },
            React.createElement('button', { onClick: save, disabled: !name, className: 'btn-primary text-sm' }, React.createElement(Check, { size: 14 }), editing ? t('update', getLang()) : t('add', getLang())),
            editing && React.createElement('button', { onClick: reset, className: 'btn-secondary text-sm' }, React.createElement(X, { size: 14 }), t('cancel', getLang()))
          )
        )
      ),
      React.createElement('div', { className: 'card overflow-hidden lg:col-span-2' },
        tags.length === 0
          ? React.createElement('p', { className: 'text-sm text-gray-400 p-6' }, t('no tags', getLang()))
          : React.createElement('table', { className: 'w-full' },
              React.createElement('thead', null, React.createElement('tr', { className: 'border-b border-gray-200 bg-gray-50 dark:bg-gray-800' },
                React.createElement('th', { className: 'text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase' }, t('name', getLang())),
                React.createElement('th', { className: 'text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase' }, t('slug (unique)', getLang())),
                React.createElement('th', { className: 'text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase' }, t('posts', getLang())),
                React.createElement('th', { className: 'text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase' }, t('views', getLang())),
                React.createElement('th', { className: 'text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase' }, t('actions', getLang())),
              )),
              // Hot tags first: order by the aggregated published-post views
              React.createElement('tbody', null, [...tags].sort((a: any, b: any) => (b._count?.views || 0) - (a._count?.views || 0)).map(tg =>
                React.createElement('tr', { key: tg.id, className: 'border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800' },
                  React.createElement('td', { className: 'px-4 py-3 font-medium text-gray-900' }, tg.name),
                  React.createElement('td', { className: 'px-4 py-3 text-sm text-gray-500' }, '/' + tg.slug),
                  React.createElement('td', { className: 'px-4 py-3 text-sm text-gray-500' }, tg._count?.posts || 0),
                  React.createElement('td', { className: 'px-4 py-3 text-sm text-gray-500' }, (tg._count?.views || 0).toLocaleString()),
                  React.createElement('td', { className: 'px-4 py-3' },
                    React.createElement('div', { className: 'flex justify-end gap-1' },
                      React.createElement('button', { onClick: () => startEdit(tg), className: 'p-1.5 text-gray-400 hover:text-primary-600', title: t('edit', getLang()) }, React.createElement(Pencil, { size: 16 })),
                      React.createElement('button', { onClick: () => del(tg), className: 'p-1.5 text-gray-400 hover:text-red-600', title: t('delete', getLang()) }, React.createElement(Trash2, { size: 16 }))
                    )
                  )
                )
              ))
            )
      )
    )
  );
}
