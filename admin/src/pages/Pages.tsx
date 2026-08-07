import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import api from '../lib/api';
import { t, getLang } from '../lib/i18n';

export default function Pages() {
  const [pages, setPages] = useState<any[]>([]);
  useEffect(() => { api.get('/pages').then(r => setPages(r.data)).catch(() => {}); }, []);
  async function del(id: string) { if (!confirm(t('delete this page', getLang()))) return; await api.delete(`/pages/${id}`); setPages(pages.filter((p: any) => p.id !== id)); }
  return React.createElement('div', null,
    React.createElement('div', { className: 'flex items-center justify-between mb-6' },
      React.createElement('h2', { className: 'text-2xl font-bold text-gray-900' }, t('pages', getLang())),
      React.createElement(Link, { to: '/pages/new', className: 'btn-primary' }, React.createElement(Plus, { size: 16 }), t('new page', getLang()))
    ),
    pages.length === 0 ? React.createElement('p', { className: 'text-gray-500' }, t('no pages yet', getLang()))
    : React.createElement('div', { className: 'card overflow-hidden' },
        React.createElement('table', { className: 'w-full' },
          React.createElement('thead', null, React.createElement('tr', { className: 'border-b border-gray-200 bg-gray-50' },
            React.createElement('th', { className: 'text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase' }, t('title', getLang())),
            React.createElement('th', { className: 'text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase' }, t('status', getLang())),
            React.createElement('th', { className: 'text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase' }, t('order', getLang())),
            React.createElement('th', { className: 'text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase' }, t('actions', getLang())),
          )),
          React.createElement('tbody', null, pages.map((p: any) =>
            React.createElement('tr', { key: p.id, className: 'border-b border-gray-100 hover:bg-gray-50' },
              React.createElement('td', { className: 'px-4 py-3 font-medium' }, p.title),
              React.createElement('td', { className: 'px-4 py-3' }, React.createElement('span', { className: `px-2 py-1 text-xs rounded-full font-medium ${p.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}` }, p.status)),
              React.createElement('td', { className: 'px-4 py-3 text-sm text-gray-500' }, p.menuOrder),
              React.createElement('td', { className: 'px-4 py-3' },
                React.createElement('div', { className: 'flex items-center justify-end gap-2' },
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
