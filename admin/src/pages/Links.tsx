import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Pencil, Check, X, Link2 } from 'lucide-react';
import { t, getLang } from '../lib/i18n';
import api from '../lib/api';
import { useToast } from '../lib/toast';

export default function Links() {
  const [links, setLinks] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [avatar, setAvatar] = useState('');
  const [editing, setEditing] = useState<any>(null);
  const toast = useToast();

  useEffect(() => { fetchLinks(); }, []);
  async function fetchLinks() { api.get('/links').then(r => setLinks(r.data || [])).catch(() => {}); }

  async function save() {
    if (!name || !url) return;
    try {
      if (editing) await api.put('/links/' + editing.id, { name, url, description, avatar });
      else await api.post('/links', { name, url, description, avatar });
      toast.toast(editing ? t('link updated', getLang()) : t('link created', getLang()));
      reset(); fetchLinks();
    } catch (e: any) { toast.toast(e.response?.data?.error || t('save failed', getLang()), 'error'); }
  }

  function reset() { setName(''); setUrl(''); setDescription(''); setAvatar(''); setEditing(null); }
  function startEdit(l: any) { setEditing(l); setName(l.name); setUrl(l.url); setDescription(l.description || ''); setAvatar(l.avatar || ''); }

  async function del(l: any) {
    if (!confirm(t('delete link', getLang()) + ' "' + l.name + '"?')) return;
    try { await api.delete('/links/' + l.id); toast.toast(t('link deleted', getLang())); fetchLinks(); }
    catch (e: any) { toast.toast(e.response?.data?.error || t('delete failed', getLang()), 'error'); }
  }

  return React.createElement('div', null,
    React.createElement('h2', { className: 'text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2' }, React.createElement(Link2, { size: 22 }), t('links', getLang())),
    React.createElement('div', { className: 'grid grid-cols-1 lg:grid-cols-3 gap-6' },
      React.createElement('div', { className: 'card p-5' },
        React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 mb-4' }, editing ? t('edit link', getLang()) : t('new link', getLang())),
        React.createElement('div', { className: 'space-y-3' },
          React.createElement('input', { value: name, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value), placeholder: t('name', getLang()), className: 'input-field' }),
          React.createElement('input', { value: url, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setUrl(e.target.value), placeholder: 'https://...', className: 'input-field' }),
          React.createElement('input', { value: description, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setDescription(e.target.value), placeholder: t('description (optional)', getLang()), className: 'input-field' }),
          React.createElement('input', { value: avatar, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setAvatar(e.target.value), placeholder: t('avatar url', getLang()), className: 'input-field' }),
          React.createElement('div', { className: 'flex gap-2' },
            React.createElement('button', { onClick: save, disabled: !name || !url, className: 'btn-primary text-sm' }, React.createElement(Check, { size: 14 }), editing ? t('update', getLang()) : t('add', getLang())),
            editing && React.createElement('button', { onClick: reset, className: 'btn-secondary text-sm' }, React.createElement(X, { size: 14 }), t('cancel', getLang()))
          )
        )
      ),
      React.createElement('div', { className: 'card overflow-hidden lg:col-span-2' },
        links.length === 0
          ? React.createElement('p', { className: 'text-sm text-gray-400 p-6' }, t('no links yet', getLang()))
          : React.createElement('table', { className: 'w-full' },
              React.createElement('thead', null, React.createElement('tr', { className: 'border-b border-gray-200 bg-gray-50 dark:bg-gray-800' },
                React.createElement('th', { className: 'text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase' }, t('name', getLang())),
                React.createElement('th', { className: 'text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase' }, t('url', getLang())),
                React.createElement('th', { className: 'text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase' }, t('actions', getLang())),
              )),
              React.createElement('tbody', null, links.map(l =>
                React.createElement('tr', { key: l.id, className: 'border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800' },
                  React.createElement('td', { className: 'px-4 py-3' },
                    React.createElement('div', { className: 'flex items-center gap-2' },
                      l.avatar ? React.createElement('img', { src: l.avatar, alt: '', className: 'w-7 h-7 rounded-full object-cover' }) : React.createElement('div', { className: 'w-7 h-7 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-medium' }, l.name.charAt(0).toUpperCase()),
                      React.createElement('div', null,
                        React.createElement('p', { className: 'font-medium text-gray-900' }, l.name),
                        l.description && React.createElement('p', { className: 'text-xs text-gray-400' }, l.description)
                      )
                    )
                  ),
                  React.createElement('td', { className: 'px-4 py-3' }, React.createElement('a', { href: l.url, target: '_blank', rel: 'noopener noreferrer', className: 'text-sm text-primary-600 hover:underline truncate block max-w-[200px]' }, l.url)),
                  React.createElement('td', { className: 'px-4 py-3' },
                    React.createElement('div', { className: 'flex justify-end gap-1' },
                      React.createElement('button', { onClick: () => startEdit(l), className: 'p-1.5 text-gray-400 hover:text-primary-600', title: t('edit', getLang()) }, React.createElement(Pencil, { size: 16 })),
                      React.createElement('button', { onClick: () => del(l), className: 'p-1.5 text-gray-400 hover:text-red-600', title: t('delete', getLang()) }, React.createElement(Trash2, { size: 16 }))
                    )
                  )
                )
              ))
            )
      )
    )
  );
}
