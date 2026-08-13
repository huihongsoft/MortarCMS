import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, Menu as MenuIcon } from 'lucide-react';
import { t, getLang } from '../lib/i18n';
import api from '../lib/api';

export default function Menus() {
  const [menus, setMenus] = useState<any[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newLocation, setNewLocation] = useState('primary');
  const [newSiteId, setNewSiteId] = useState('');
  const [showLogin, setShowLogin] = useState(true);
  const [sites, setSites] = useState<any[]>([]);

  useEffect(() => { api.get('/menus').then(r => setMenus(r.data)).catch(() => {}); api.get('/sites').then(r => setSites(r.data?.sites || r.data || [])).catch(() => {}); api.get('/settings').then(r => setShowLogin(r.data?.frontend_show_login !== '0')).catch(() => {}); }, []);

  async function createMenu() {
    if (!newName) return;
    await api.post('/menus', { name: newName, location: newLocation, items: [], siteId: newSiteId || null });
    setShowNew(false); setNewName('');
    const r = await api.get('/menus'); setMenus(r.data);
  }

  async function deleteMenu(id: string) {
    await api.delete('/menus/' + id);
    setMenus(menus.filter(m => m.id !== id));
  }

  return React.createElement('div', null,
    React.createElement('div', { className: 'flex items-center justify-between mb-6' },
      React.createElement('h2', { className: 'text-2xl font-bold text-gray-900' }, t('menus', getLang())),
      React.createElement('button', { onClick: () => setShowNew(true), className: 'btn-primary' },
        React.createElement(Plus, { size: 16 }), t('new menu', getLang())
      )
    ),
    React.createElement('div', { className: 'card p-4 mb-6 max-w-md' },
      React.createElement('h3', { className: 'text-sm font-semibold mb-2' }, t('frontend login entry', getLang())),
      React.createElement('label', { className: 'flex items-center gap-2 cursor-pointer text-sm text-gray-700 dark:text-gray-300' },
        React.createElement('input', { type: 'checkbox', checked: showLogin, onChange: () => { setShowLogin(!showLogin); api.put('/settings', { frontend_show_login: showLogin ? '0' : '1' }).catch(() => setShowLogin(!showLogin)); }, className: 'rounded border-gray-300 text-primary-600' }),
        t('show login entry on frontend', getLang())),
      React.createElement('p', { className: 'text-xs text-gray-400 mt-1' }, t('frontend login entry hint', getLang()))
    ),
    showNew && React.createElement('div', { className: 'card p-4 mb-6 max-w-md' },
      React.createElement('h3', { className: 'text-sm font-semibold mb-3' }, t('create menu', getLang())),
      React.createElement('div', { className: 'space-y-3' },
        React.createElement('input', { value: newName, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setNewName(e.target.value), placeholder: t('menu name', getLang()), className: 'input-field' }),
        React.createElement('select', { value: newLocation, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => setNewLocation(e.target.value), className: 'input-field' },
          React.createElement('option', { value: 'primary' }, t('primary (header)', getLang())),
          React.createElement('option', { value: 'footer' }, t('footer', getLang())),
          React.createElement('option', { value: 'sidebar' }, t('sidebar', getLang()))
        ),
        sites.length > 0 && React.createElement('select', { value: newSiteId, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => setNewSiteId(e.target.value), className: 'input-field' },
          React.createElement('option', { value: '' }, t('global (all sites)', getLang())),
          sites.map((st: any) => React.createElement('option', { key: st.id, value: st.id }, st.name))
        ),
        React.createElement('div', { className: 'flex gap-2' },
          React.createElement('button', { onClick: createMenu, className: 'btn-primary' }, t('create', getLang())),
          React.createElement('button', { onClick: () => setShowNew(false), className: 'btn-secondary' }, t('cancel', getLang()))
        )
      )
    ),
    menus.length === 0 ? React.createElement('p', { className: 'text-gray-500' }, t('no menus yet', getLang()))
    : React.createElement('div', { className: 'space-y-4' }, menus.map((m: any) =>
        React.createElement('div', { key: m.id, className: 'card p-4' },
          React.createElement('div', { className: 'flex items-center justify-between' },
            React.createElement('div', { className: 'flex items-center gap-3' },
              React.createElement(MenuIcon, { size: 20, className: 'text-gray-400' }),
              React.createElement('div', null,
                React.createElement('h3', { className: 'font-medium text-gray-900' }, m.name),
                React.createElement('p', { className: 'text-xs text-gray-500' }, `${t('location', getLang())}: ${m.location} · ${m.items?.length || 0} ${t('items', getLang())}`)
              )
            ),
            React.createElement('div', { className: 'flex items-center gap-2' },
              React.createElement(Link, { to: '/menus/' + m.id + '/edit', className: 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 text-gray-600 hover:border-primary-400 hover:text-primary-600 transition-colors' }, React.createElement(Edit2, { size: 14 }), t('edit', getLang())),
              React.createElement('button', { onClick: () => deleteMenu(m.id), className: 'p-2 text-gray-400 hover:text-red-600' }, React.createElement(Trash2, { size: 16 }))
            )
          )
        )
      ))
  );
}
