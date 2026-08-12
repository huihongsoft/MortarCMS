import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, FileText, Eye } from 'lucide-react';
import EmptyState from '../components/EmptyState';
import api from '../lib/api';
import { t, getLang } from '../lib/i18n';

export default function Pages() {
  const [pages, setPages] = useState<any[]>([]);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { api.get('/pages').then(r => { setPages(r.data); setLoaded(true); }).catch(() => setLoaded(true)); }, []);
  async function del(id: string) { if (!confirm(t('delete this page', getLang()))) return; await api.delete(`/pages/${id}`); setPages(pages.filter((p: any) => p.id !== id)); }
  return React.createElement('div', null,
    React.createElement('div', { className: 'flex items-center justify-between mb-6' },
      React.createElement('h2', { className: 'text-2xl font-bold text-gray-900' }, t('pages', getLang())),
      React.createElement(Link, { to: '/pages/new', className: 'btn-primary' }, React.createElement(Plus, { size: 16 }), t('new page', getLang()))
    ),
    !loaded ? React.createElement('p', { className: 'text-gray-500' }, t('loading...', getLang()))
    : pages.length === 0 ? React.createElement(EmptyState, {
        icon: FileText,
        title: t('no pages yet', getLang()),
        description: t('create pages for static content like about or contact', getLang()),
        action: React.createElement(Link, { to: '/pages/new', className: 'btn-primary text-sm' }, React.createElement(Plus, { size: 15 }), t('new page', getLang())),
      })
    : React.createElement('div', { className: 'card overflow-x-auto' },
        React.createElement('table', { className: 'w-full min-w-[640px]' },
          React.createElement('thead', null, React.createElement('tr', { className: 'border-b border-gray-200 bg-gray-50' },
            React.createElement('th', { className: 'text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase' }, t('title', getLang())),
            React.createElement('th', { className: 'text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase' }, t('status', getLang())),
            React.createElement('th', { className: 'text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase' }, t('comments', getLang())),
            React.createElement('th', { className: 'text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase' }, t('order', getLang())),
            React.createElement('th', { className: 'text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase' }, t('actions', getLang())),
          )),
          React.createElement('tbody', null, pages.map((p: any) =>
            React.createElement('tr', { key: p.id, className: 'border-b border-gray-100 hover:bg-gray-50' },
              React.createElement('td', { className: 'px-4 py-3 font-medium' }, p.title),
              React.createElement('td', { className: 'px-4 py-3' }, (() => {
                const isPwd = p.status === 'published' && p.password;
                const cls = isPwd ? 'bg-purple-100 text-purple-700' : p.status === 'published' ? 'bg-green-100 text-green-700' : p.status === 'private' ? 'bg-gray-100 text-gray-600' : 'bg-yellow-100 text-yellow-700';
                return React.createElement('span', { className: `px-2 py-1 text-xs rounded-full font-medium ${cls}` }, isPwd ? t('password protected', getLang()) : t(p.status, getLang()));
              })()),
              React.createElement('td', { className: 'px-4 py-3 text-sm text-gray-500' }, p.commentCount || 0),
              React.createElement('td', { className: 'px-4 py-3 text-sm text-gray-500' }, p.menuOrder),
              React.createElement('td', { className: 'px-4 py-3' },
                React.createElement('div', { className: 'flex items-center justify-end gap-2' },
                  p.slug && p.status !== 'draft' ? React.createElement('a', {
                    href: window.location.origin + '/page/' + p.slug,
                    target: '_blank', rel: 'noopener',
                    title: t('preview', getLang()),
                    className: 'p-1.5 text-gray-400 hover:text-blue-600',
                  }, React.createElement(Eye, { size: 16 })) : null,
                  React.createElement(Link, { to: `/pages/${p.id}/edit`, className: 'p-1.5 text-gray-400 hover:text-primary-600' }, React.createElement(Edit2, { size: 16 })),
                  React.createElement('button', { onClick: () => del(p.id), className: 'p-1.5 text-gray-400 hover:text-red-600' }, React.createElement(Trash2, { size: 16 }))
                )
              )
            )
          ))
        )
      )
  );
}
