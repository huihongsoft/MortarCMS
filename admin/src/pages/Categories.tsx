import React, { useEffect, useState } from 'react';
import { Trash2, Pencil, Check, X, FolderTree, Merge } from 'lucide-react';
import { t, getLang } from '../lib/i18n';
import api from '../lib/api';
import { useToast } from '../lib/toast';
import Select from '../components/Select';
import { dialog } from '../lib/dialog';

export default function Categories() {
  const [cats, setCats] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [parentId, setParentId] = useState('');
  const [editing, setEditing] = useState<any>(null);
  // Which row is choosing a merge target (null = none). Inline rather than a
  // dialog: the target list is the rest of the table, and picking from it in place
  // avoids a prompt that cannot show it.
  const [merging, setMerging] = useState<string>('');
  const [mergeInto, setMergeInto] = useState<string>('');
  const toast = useToast();

  useEffect(() => { fetchCats(); }, []);
  async function fetchCats() { api.get('/categories').then(r => setCats(r.data || [])).catch(() => {}); }

  async function save() {
    if (!name) return;
    try {
      if (editing) { await api.put('/categories/' + editing.id, { name, slug, description, parentId: parentId || null }); }
      else { await api.post('/categories', { name, slug, description, parentId: parentId || null }); }
      toast.toast(editing ? t('category updated', getLang()) : t('category created', getLang()));
      reset(); fetchCats();
    } catch (e: any) { toast.toast(e.response?.data?.error || t('save failed', getLang()), 'error'); }
  }

  function reset() { setName(''); setSlug(''); setDescription(''); setParentId(''); setEditing(null); }

  function startEdit(c: any) { setEditing(c); setName(c.name); setSlug(c.slug); setDescription(c.description || ''); setParentId(c.parentId || ''); }

  // Consolidating a duplicate: the posts move to the target first, then this row
  // goes. Deleting it was previously the only tool, which lost the posts' filing.
  async function merge(c: any) {
    if (!mergeInto) return;
    const target = cats.find((x: any) => x.id === mergeInto);
    if (!(await dialog.confirm(t('merge confirm', getLang()).replace('{from}', c.name).replace('{into}', target?.name || ''), { danger: true }))) return;
    try {
      const r = await api.post('/categories/' + c.id + '/merge', { intoId: mergeInto });
      toast.toast(t('merged', getLang()).replace('{n}', String(r.data?.moved ?? 0)).replace('{into}', target?.name || ''));
      setMerging(''); setMergeInto(''); fetchCats();
    } catch (e: any) { toast.toast(e.response?.data?.error || t('merge failed', getLang()), 'error'); }
  }

  async function del(c: any) {
    if (!(await dialog.confirm(t('delete category', getLang()) + ' "' + c.name + '"?', { danger: true }))) return;
    try { await api.delete('/categories/' + c.id); toast.toast(t('category deleted', getLang())); fetchCats(); }
    catch (e: any) { toast.toast(e.response?.data?.error || t('delete failed', getLang()), 'error'); }
  }

  return React.createElement('div', null,
    React.createElement('div', { className: 'flex items-center justify-between mb-6' },
      React.createElement('h2', { className: 'text-2xl font-bold text-gray-900 flex items-center gap-2' }, React.createElement(FolderTree, { size: 22 }), t('categories', getLang())),
    ),
    React.createElement('div', { className: 'grid grid-cols-1 lg:grid-cols-3 gap-6' },
      React.createElement('div', { className: 'card p-5' },
        React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 mb-4' }, editing ? t('edit category', getLang()) : t('new category', getLang())),
        React.createElement('div', { className: 'space-y-3' },
          React.createElement('div', null,
            React.createElement('label', { className: 'block text-xs font-medium text-gray-600 mb-1' }, t('name', getLang())),
            React.createElement('input', { value: name, onChange: e => setName(e.target.value), placeholder: t('name', getLang()), className: 'input-field' })),
          React.createElement('div', null,
            React.createElement('label', { className: 'block text-xs font-medium text-gray-600 mb-1' }, t('slug (unique)', getLang())),
            React.createElement('input', { value: slug, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setSlug(e.target.value), placeholder: t('slug (unique)', getLang()), className: 'input-field' })),
          React.createElement('div', null,
            React.createElement('label', { className: 'block text-xs font-medium text-gray-600 mb-1' }, t('description (optional)', getLang())),
            React.createElement('textarea', { value: description, onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value), placeholder: t('description (optional)', getLang()), rows: 3, className: 'input-field' })),
          React.createElement('div', null,
            React.createElement('label', { className: 'block text-xs font-medium text-gray-600 mb-1' }, t('parent category', getLang())),
            React.createElement(Select, { value: parentId, onChange: (v: string) => setParentId(v), className: 'input-field' },
              React.createElement('option', { value: '' }, t('no parent', getLang())),
              cats.filter(c => c.id !== editing?.id).map(c => React.createElement('option', { key: c.id, value: c.id }, c.name))
            )),
          React.createElement('div', { className: 'flex gap-2' },
            React.createElement('button', { onClick: save, disabled: !name, className: 'btn-primary text-sm' }, React.createElement(Check, { size: 14 }), editing ? t('update', getLang()) : t('add', getLang())),
            editing && React.createElement('button', { onClick: reset, className: 'btn-secondary text-sm' }, React.createElement(X, { size: 14 }), t('cancel', getLang()))
          )
        )
      ),
      React.createElement('div', { className: 'card overflow-hidden lg:col-span-2' },
        cats.length === 0
          ? React.createElement('p', { className: 'text-sm text-gray-400 p-6' }, t('no categories', getLang()))
          : React.createElement('table', { className: 'w-full' },
              React.createElement('thead', null, React.createElement('tr', { className: 'border-b border-gray-200 bg-gray-50 dark:bg-gray-800' },
                React.createElement('th', { className: 'text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase' }, t('name', getLang())),
                React.createElement('th', { className: 'text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase' }, t('slug (unique)', getLang())),
                React.createElement('th', { className: 'text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase' }, t('posts', getLang())),
                React.createElement('th', { className: 'text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase' }, t('actions', getLang())),
              )),
              React.createElement('tbody', null, (() => {
                // Build a tree so child categories render indented under parents
                const childrenOf: Record<string, any[]> = {};
                cats.forEach((c: any) => { (childrenOf[c.parentId || ''] ||= []).push(c); });
                const rows: any[] = [];
                const walk = (list: any[], depth: number) => {
                  list.forEach((c: any) => {
                    rows.push(React.createElement('tr', { key: c.id, className: 'border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800' },
                      React.createElement('td', { className: 'px-4 py-3' },
                        React.createElement('div', { className: 'flex items-center gap-2' },
                          depth > 0 && React.createElement('span', { className: 'text-gray-300 text-xs' }, '└─'),
                          React.createElement('span', { style: { paddingLeft: depth * 14 } }),
                          React.createElement('p', { className: 'font-medium text-gray-900' }, c.name),
                          c.parent && React.createElement('span', { className: 'text-xs text-gray-400' }, '· ' + c.parent.name))),
                      React.createElement('td', { className: 'px-4 py-3 text-sm text-gray-500' }, '/' + c.slug),
                      React.createElement('td', { className: 'px-4 py-3 text-sm text-gray-500' }, c._count?.posts || 0),
                      React.createElement('td', { className: 'px-4 py-3' },
                        React.createElement('div', { className: 'flex justify-end items-center gap-1' },
                          merging === c.id
                            ? React.createElement(React.Fragment, null,
                                React.createElement(Select, { value: mergeInto, onChange: (v: string) => setMergeInto(v), className: 'input-field text-xs w-40' },
                                  React.createElement('option', { value: '' }, t('merge into', getLang()) + '…'),
                                  cats.filter((x: any) => x.id !== c.id).map((x: any) => React.createElement('option', { key: x.id, value: x.id }, x.name))),
                                React.createElement('button', { onClick: () => merge(c), disabled: !mergeInto, className: 'p-1.5 text-gray-400 hover:text-primary-600 disabled:opacity-40', title: t('merge', getLang()), 'aria-label': t('merge', getLang())}, React.createElement(Check, { size: 16 })),
                                React.createElement('button', { onClick: () => { setMerging(''); setMergeInto(''); }, className: 'p-1.5 text-gray-400 hover:text-gray-700', title: t('cancel', getLang()), 'aria-label': t('cancel', getLang())}, React.createElement(X, { size: 16 })))
                            : React.createElement(React.Fragment, null,
                                React.createElement('button', { onClick: () => { setMerging(c.id); setMergeInto(''); }, className: 'p-1.5 text-gray-400 hover:text-primary-600', title: t('merge into', getLang()), 'aria-label': t('merge into', getLang())}, React.createElement(Merge, { size: 16 })),
                                React.createElement('button', { onClick: () => startEdit(c), className: 'p-1.5 text-gray-400 hover:text-primary-600', title: t('edit', getLang()), 'aria-label': t('edit', getLang())}, React.createElement(Pencil, { size: 16 })),
                                React.createElement('button', { onClick: () => del(c), className: 'p-1.5 text-gray-400 hover:text-red-600', title: t('delete', getLang()), 'aria-label': t('delete', getLang())}, React.createElement(Trash2, { size: 16 })))
                        )
                      )
                    ));
                    const kids = childrenOf[c.id] || [];
                    if (kids.length) walk(kids, depth + 1);
                  });
                };
                walk(childrenOf[''] || [], 0);
                return rows;
              })())
            )
      )
    )
  );
}
