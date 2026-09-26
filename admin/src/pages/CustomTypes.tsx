import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2, Layers, Pencil, List } from 'lucide-react';
import api from '../lib/api';
import { t, getLang, serverMessage } from '../lib/i18n';
import { dialog } from '../lib/dialog';

const SUPPORTS_OPTIONS = ['title', 'editor', 'excerpt', 'featured', 'categories', 'tags', 'comments'];

export default function CustomTypes() {
  const [types, setTypes] = useState<any[]>([]);
  const [slug, setSlug] = useState('');
  const [label, setLabel] = useState('');
  const [supports, setSupports] = useState<string[]>(['title', 'editor']);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  // Inline edit of a registered type (the slug is immutable: content is keyed
  // by it, so renaming would orphan every entry).
  const [editing, setEditing] = useState<{ slug: string; label: string; supports: string[] } | null>(null);

  useEffect(() => { api.get('/post-types').then(r => setTypes(r.data || [])).catch(() => {}); }, []);

  async function addType() {
    if (!slug.trim() || !label.trim()) { setError(t('fill required fields', getLang())); return; }
    setSaving(true); setError('');
    try {
      await api.post('/post-types', { slug: slug.trim(), label: label.trim(), supports });
      setSlug(''); setLabel(''); setSupports(['title', 'editor']);
      const r = await api.get('/post-types');
      setTypes(r.data || []);
    } catch (e: any) { setError(serverMessage(e.response?.data?.error || '', getLang()) || t('save failed', getLang())); }
    setSaving(false);
  }

  async function saveType() {
    if (!editing) return;
    setSaving(true); setError('');
    try {
      await api.put('/post-types/' + editing.slug, { label: editing.label.trim(), supports: editing.supports });
      const r = await api.get('/post-types');
      setTypes(r.data || []);
      setEditing(null);
    } catch (e: any) { setError(serverMessage(e.response?.data?.error || '', getLang()) || t('save failed', getLang())); }
    setSaving(false);
  }

  async function removeType(s: string) {
    if (!(await dialog.confirm(t('delete custom type confirm', getLang()) + '「' + s + '」？', { danger: true }))) return;
    try {
      await api.delete('/post-types/' + s);
      setTypes(types.filter(x => x.slug !== s));
    } catch (e: any) { setError(serverMessage(e.response?.data?.error || '', getLang()) || t('delete failed', getLang())); }
  }

  return React.createElement('div', { className: 'space-y-6' },
    React.createElement('div', { className: 'flex items-center gap-3' },
      React.createElement(Layers, { size: 20, className: 'text-primary-600' }),
      React.createElement('h2', { className: 'text-xl font-semibold text-gray-900 dark:text-white' }, t('custom post types', getLang()))
    ),
    error && React.createElement('div', { className: 'p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg' }, error),

    React.createElement('div', { className: 'card p-6' },
      React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 dark:text-white mb-4' }, t('register new type', getLang())),
      React.createElement('div', { className: 'grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4' },
        React.createElement('div', null,
          React.createElement('label', { className: 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1' }, 'slug'),
          React.createElement('input', { value: slug, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setSlug(e.target.value), placeholder: 'portfolio', className: 'input-field' })),
        React.createElement('div', null,
          React.createElement('label', { className: 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1' }, t('label', getLang())),
          React.createElement('input', { value: label, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setLabel(e.target.value), placeholder: 'Portfolio', className: 'input-field' }))
      ),
      React.createElement('p', { className: 'text-sm font-medium text-gray-700 dark:text-gray-300 mb-2' }, t('supports', getLang())),
      React.createElement('div', { className: 'flex flex-wrap gap-3 mb-4' },
        SUPPORTS_OPTIONS.map(o =>
          React.createElement('label', { key: o, className: 'flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300 cursor-pointer' },
            React.createElement('input', { type: 'checkbox', checked: supports.includes(o), onChange: (e: React.ChangeEvent<HTMLInputElement>) => setSupports(e.target.checked ? [...supports, o] : supports.filter(x => x !== o)), className: 'rounded border-gray-300 text-primary-600' }),
            o)
        )
      ),
      React.createElement('button', { onClick: addType, disabled: saving, className: 'btn-primary text-sm flex items-center gap-1.5' }, React.createElement(Plus, { size: 14 }), t('register', getLang()))
    ),

    React.createElement('div', { className: 'card p-6' },
      React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 dark:text-white mb-4' }, t('registered types', getLang())),
      types.length === 0 && React.createElement('p', { className: 'text-sm text-gray-400' }, t('no custom types yet', getLang())),
      React.createElement('div', { className: 'space-y-2' },
        types.map((tp: any) =>
          React.createElement('div', { key: tp.slug, className: 'flex items-center gap-3 p-3 rounded-lg border border-gray-100 dark:border-gray-700' },
            React.createElement('code', { className: 'text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-primary-700 dark:text-primary-300' }, tp.slug),
            React.createElement('span', { className: 'text-sm font-medium text-gray-800 dark:text-gray-100 flex-1' }, tp.label),
            React.createElement('div', { className: 'hidden sm:flex flex-wrap gap-1' },
              (tp.supports || []).map((s: string) => React.createElement('span', { key: s, className: 'text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500' }, s))
            ),
            React.createElement(Link, { to: '/posts?type=' + encodeURIComponent(tp.slug), title: t('view entries', getLang()), className: 'p-1.5 text-gray-400 hover:text-primary-600' }, React.createElement(List, { size: 14 })),
            !['post', 'page'].includes(tp.slug) && React.createElement(React.Fragment, null,
              React.createElement('button', { onClick: () => setEditing({ slug: tp.slug, label: tp.label, supports: tp.supports || [] }), title: t('edit', getLang()), 'aria-label': t('edit', getLang()), className: 'p-1.5 text-gray-400 hover:text-primary-600' }, React.createElement(Pencil, { size: 14 })),
              React.createElement('button', { onClick: () => removeType(tp.slug), className: 'p-1.5 text-gray-300 hover:text-red-500', 'aria-label': t('delete', getLang())}, React.createElement(Trash2, { size: 14 }))
            )
          )
        )
      )
    ),
    React.createElement('p', { className: 'text-xs text-gray-400' }, t('custom types hint', getLang())),

    editing && React.createElement('div', { className: 'card p-6' },
      React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 dark:text-white mb-4' }, t('edit type', getLang()) + ': ' + editing.slug),
      React.createElement('div', { className: 'grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4' },
        React.createElement('div', null,
          React.createElement('label', { className: 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1' }, t('label', getLang())),
          React.createElement('input', { value: editing.label, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setEditing({ ...editing, label: e.target.value }), className: 'input-field' }))
      ),
      React.createElement('p', { className: 'text-sm font-medium text-gray-700 dark:text-gray-300 mb-2' }, t('supports', getLang())),
      React.createElement('div', { className: 'flex flex-wrap gap-3 mb-4' },
        SUPPORTS_OPTIONS.map(o =>
          React.createElement('label', { key: o, className: 'flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300 cursor-pointer' },
            React.createElement('input', { type: 'checkbox', checked: editing.supports.includes(o), onChange: (e: React.ChangeEvent<HTMLInputElement>) => setEditing({ ...editing, supports: e.target.checked ? [...editing.supports, o] : editing.supports.filter(x => x !== o) }), className: 'rounded border-gray-300 text-primary-600' }),
            o)
        )
      ),
      React.createElement('div', { className: 'flex gap-2' },
        React.createElement('button', { onClick: saveType, disabled: saving, className: 'btn-primary text-sm' }, t('save', getLang())),
        React.createElement('button', { onClick: () => setEditing(null), className: 'btn-secondary text-sm' }, t('cancel', getLang()))
      )
    )
  );
}
