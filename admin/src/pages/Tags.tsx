import React, { useEffect, useState } from 'react';
import { formatNumber } from '../lib/format';
import { Plus, Trash2, Pencil, Check, X, Tag as TagIcon, Merge } from 'lucide-react';
import { t, getLang } from '../lib/i18n';
import api from '../lib/api';
import { useToast } from '../lib/toast';
import { dialog } from '../lib/dialog';
import Select from '../components/Select';

export default function Tags() {
  const [tags, setTags] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [editing, setEditing] = useState<any>(null);
  // Which row is choosing a merge target (null = none).
  const [merging, setMerging] = useState<string>('');
  const [mergeInto, setMergeInto] = useState<string>('');
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

  // "javascript" and "JavaScript" are the same tag; merging moves the posts to
  // the target before the source goes, which deleting did not.
  async function merge(tag: any) {
    if (!mergeInto) return;
    const target = tags.find((x: any) => x.id === mergeInto);
    if (!(await dialog.confirm(t('merge confirm', getLang()).replace('{from}', tag.name).replace('{into}', target?.name || ''), { danger: true }))) return;
    try {
      const r = await api.post('/tags/' + tag.id + '/merge', { intoId: mergeInto });
      toast.toast(t('merged', getLang()).replace('{n}', String(r.data?.moved ?? 0)).replace('{into}', target?.name || ''));
      setMerging(''); setMergeInto(''); fetchTags();
    } catch (e: any) { toast.toast(e.response?.data?.error || t('merge failed', getLang()), 'error'); }
  }

  async function del(tg: any) {
    if (!(await dialog.confirm(t('delete tag', getLang()) + ' "' + tg.name + '"?', { danger: true }))) return;
    try { await api.delete('/tags/' + tg.id); toast.toast(t('tag deleted', getLang())); fetchTags(); }
    catch (e: any) { toast.toast(e.response?.data?.error || t('delete failed', getLang()), 'error'); }
  }

  return React.createElement('div', null,
    React.createElement('h2', { className: 'text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2' }, React.createElement(TagIcon, { size: 22 }), t('tags', getLang())),
    React.createElement('div', { className: 'grid grid-cols-1 lg:grid-cols-3 gap-6' },
      React.createElement('div', { className: 'card p-5' },
        React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 mb-4' }, editing ? t('edit tag', getLang()) : t('new tag', getLang())),
        React.createElement('div', { className: 'space-y-3' },
          React.createElement('div', null,
            React.createElement('label', { className: 'block text-xs font-medium text-gray-600 mb-1' }, t('name', getLang())),
            React.createElement('input', { value: name, onChange: e => setName(e.target.value), placeholder: t('name', getLang()), className: 'input-field' })),
          React.createElement('div', null,
            React.createElement('label', { className: 'block text-xs font-medium text-gray-600 mb-1' }, t('slug (unique)', getLang())),
            React.createElement('input', { value: slug, onChange: e => setSlug(e.target.value), placeholder: t('slug (unique)', getLang()), className: 'input-field' })),
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
                  React.createElement('td', { className: 'px-4 py-3 text-sm text-gray-500' }, formatNumber(tg._count?.views || 0)),
                  React.createElement('td', { className: 'px-4 py-3' },
                    React.createElement('div', { className: 'flex justify-end items-center gap-1' },
                      merging === tg.id
                        ? React.createElement(React.Fragment, null,
                            React.createElement(Select, { value: mergeInto, onChange: (v: string) => setMergeInto(v), className: 'input-field text-xs w-40' },
                              React.createElement('option', { value: '' }, t('merge into', getLang()) + '…'),
                              tags.filter((x: any) => x.id !== tg.id).map((x: any) => React.createElement('option', { key: x.id, value: x.id }, x.name))),
                            React.createElement('button', { onClick: () => merge(tg), disabled: !mergeInto, className: 'p-1.5 text-gray-400 hover:text-primary-600 disabled:opacity-40', title: t('merge', getLang()), 'aria-label': t('merge', getLang())}, React.createElement(Check, { size: 16 })),
                            React.createElement('button', { onClick: () => { setMerging(''); setMergeInto(''); }, className: 'p-1.5 text-gray-400 hover:text-gray-700', title: t('cancel', getLang()), 'aria-label': t('cancel', getLang())}, React.createElement(X, { size: 16 })))
                        : React.createElement(React.Fragment, null,
                            React.createElement('button', { onClick: () => { setMerging(tg.id); setMergeInto(''); }, className: 'p-1.5 text-gray-400 hover:text-primary-600', title: t('merge into', getLang()), 'aria-label': t('merge into', getLang())}, React.createElement(Merge, { size: 16 })),
                            React.createElement('button', { onClick: () => startEdit(tg), className: 'p-1.5 text-gray-400 hover:text-primary-600', title: t('edit', getLang()), 'aria-label': t('edit', getLang())}, React.createElement(Pencil, { size: 16 })),
                            React.createElement('button', { onClick: () => del(tg), className: 'p-1.5 text-gray-400 hover:text-red-600', title: t('delete', getLang()), 'aria-label': t('delete', getLang())}, React.createElement(Trash2, { size: 16 })))
                    )
                  )
                )
              ))
            )
      )
    )
  );
}
