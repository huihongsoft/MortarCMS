import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Pencil, Check, X, FolderTree } from 'lucide-react';
import { t, getLang } from '../lib/i18n';
import api from '../lib/api';
import { useToast } from '../lib/toast';

export default function Categories() {
  const [cats, setCats] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [parentId, setParentId] = useState('');
  const [editing, setEditing] = useState<any>(null);
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

  async function del(c: any) {
    if (!confirm(t('delete category', getLang()) + ' "' + c.name + '"?')) return;
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
          React.createElement('input', { value: name, onChange: e => setName(e.target.value), placeholder: t('name', getLang()), className: 'input-field' }),
          React.createElement('input', { value: slug, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setSlug(e.target.value), placeholder: t('slug (unique)', getLang()), className: 'input-field' }),
          React.createElement('textarea', { value: description, onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value), placeholder: t('description (optional)', getLang()), rows: 3, className: 'input-field' }),
          React.createElement('select', { value: parentId, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => setParentId(e.target.value), className: 'input-field' },
            React.createElement('option', { value: '' }, t('no parent', getLang())),
            cats.filter(c => c.id !== editing?.id).map(c => React.createElement('option', { key: c.id, value: c.id }, c.name))
          ),
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
              React.createElement('tbody', null, cats.map(c =>
                React.createElement('tr', { key: c.id, className: 'border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800' },
                  React.createElement('td', { className: 'px-4 py-3' },
                    React.createElement('p', { className: 'font-medium text-gray-900' }, c.name),
                    c.parent && React.createElement('p', { className: 'text-xs text-gray-400' }, '— ' + c.parent.name)
                  ),
                  React.createElement('td', { className: 'px-4 py-3 text-sm text-gray-500' }, '/' + c.slug),
                  React.createElement('td', { className: 'px-4 py-3 text-sm text-gray-500' }, c._count?.posts || 0),
                  React.createElement('td', { className: 'px-4 py-3' },
                    React.createElement('div', { className: 'flex justify-end gap-1' },
                      React.createElement('button', { onClick: () => startEdit(c), className: 'p-1.5 text-gray-400 hover:text-primary-600', title: t('edit', getLang()) }, React.createElement(Pencil, { size: 16 })),
                      React.createElement('button', { onClick: () => del(c), className: 'p-1.5 text-gray-400 hover:text-red-600', title: t('delete', getLang()) }, React.createElement(Trash2, { size: 16 }))
                    )
                  )
                )
              ))
            )
      )
    )
  );
}
