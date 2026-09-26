import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, UserPlus, UserCircle2, ChevronDown } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { t, getLang } from '../lib/i18n';
import api from '../lib/api';
import Select from '../components/Select';
import { dialog } from '../lib/dialog';

const roles = ['admin', 'editor', 'author', 'contributor', 'subscriber'];

export default function Users() {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<any[]>([]);
  const [newRole, setNewRole] = useState('author');
  const [roleFilter, setRoleFilter] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => { api.get('/users').then(r => { setUsers(r.data); setLoaded(true); }).catch(() => { setLoaded(true); setError(t('failed to load users', getLang())); }); }, []);
  const filteredUsers = roleFilter ? users.filter((u: any) => u.role === roleFilter) : users;

  // Site access for this user (utils/userSites.ts on the server): no selection
  // means unrestricted, which is what every pre-existing user looks like.
  const [sites, setSites] = useState<any[]>([]);
  useEffect(() => { api.get('/sites').then(r => setSites(r.data?.sites || r.data || [])).catch(() => {}); }, []);
  async function updateSites(id: string, siteIds: string[]) {
    try { await api.put(`/users/${id}`, { siteIds }); setUsers(users.map((u: any) => u.id === id ? { ...u, siteIds } : u)); }
    catch (e: any) { dialog.alert(e.response?.data?.error || t('update failed', getLang())); }
  }
  async function updateRole(id: string, role: string) {
    try { await api.put(`/users/${id}`, { role }); setUsers(users.map((u: any) => u.id === id ? { ...u, role } : u)); }
    catch (e: any) { dialog.alert(e.response?.data?.error || t('update failed', getLang())); }
  }
  async function del(id: string) { if (!(await dialog.confirm(t('delete this user?', getLang()), { danger: true }))) return; try { await api.delete(`/users/${id}`); setUsers(users.filter((u: any) => u.id !== id)); } catch (e: any) { dialog.alert(e.response?.data?.error || t('delete failed', getLang())); } }

  // The self-service account panels (profile, password, 2FA, application
  // passwords) moved to their own page: this route is admin-only, but every
  // role needs to manage its own account.
  async function createUser() {
    const u = (document.getElementById('new-username') as HTMLInputElement).value;
    const e = (document.getElementById('new-email') as HTMLInputElement).value;
    const p = (document.getElementById('new-password') as HTMLInputElement).value;
    const r = newRole;
    if (!u || !e || !p) return dialog.alert(t('fill all fields', getLang()));
    try {
      await api.post('/auth/register', { username: u, email: e, password: p, role: r });
      window.location.reload();
    } catch (err: any) { dialog.alert(err.response?.data?.error || t('create failed', getLang())); }
  }

  const roleColors: Record<string, string> = {
    admin: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    editor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    author: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    contributor: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
    subscriber: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
  };

  return React.createElement('div', null,
    React.createElement('h2', { className: 'text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6' }, t('users', getLang())),
    React.createElement('div', { className: 'grid grid-cols-1 lg:grid-cols-3 gap-6' },
      // Left column: add user + my profile
      React.createElement('div', { className: 'space-y-6' },
        React.createElement('div', { className: 'card p-5' },
          React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2' }, React.createElement(UserPlus, { size: 16, className: 'text-primary-500' }), t('add new user', getLang())),
          React.createElement('div', { className: 'space-y-3' },
            React.createElement('input', { id: 'new-username', placeholder: t('username', getLang()), className: 'input-field' }),
            React.createElement('input', { id: 'new-email', placeholder: t('email', getLang()), type: 'email', className: 'input-field' }),
            React.createElement('input', { id: 'new-password', placeholder: t('password', getLang()), type: 'password', autoComplete: 'new-password', className: 'input-field' }),
            React.createElement(Select, { value: newRole, onChange: (v: string) => setNewRole(v), className: 'input-field' },
              roles.map(r => React.createElement('option', { key: r, value: r }, t(r, getLang())))
            ),
            React.createElement('button', { onClick: createUser, className: 'btn-primary w-full justify-center text-sm' }, React.createElement(UserPlus, { size: 14 }), t('create user', getLang()))
          )
        ),
        React.createElement('div', { className: 'card p-5' },
          React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2' }, React.createElement(UserCircle2, { size: 16, className: 'text-primary-500' }), t('my profile', getLang())),
          React.createElement('p', { className: 'text-xs text-gray-400 mb-4' }, t('profile page hint', getLang())),
          React.createElement('button', { onClick: () => navigate('/profile'), className: 'btn-secondary w-full justify-center text-sm' }, t('my profile', getLang()))
        ),
      ),
      // Right column: user table
      React.createElement('div', { className: 'card overflow-x-auto lg:col-span-2' },
        // Role filter tabs (WordPress user role filter)
        React.createElement('div', { className: 'flex items-center gap-1 p-3 border-b border-gray-100 dark:border-gray-700 flex-wrap' },
          ['', ...roles].map(r => React.createElement('button', {
            key: r || 'all',
            onClick: () => setRoleFilter(r),
            className: 'px-3 py-1 text-xs rounded-lg border ' + (roleFilter === r ? 'border-primary-400 bg-primary-50 text-primary-700 font-medium' : 'border-gray-200 text-gray-500 hover:text-gray-700'),
          }, r ? t(r, getLang()) : t('all roles', getLang()))),
        ),
        error ? React.createElement('p', { className: 'text-sm text-red-500 p-6' }, error)
        : !loaded ? React.createElement('p', { className: 'text-sm text-gray-400 p-6' }, t('loading...', getLang()))
        : filteredUsers.length === 0
          ? React.createElement('p', { className: 'text-sm text-gray-400 p-6' }, t('no users', getLang()))
          : React.createElement('table', { className: 'w-full min-w-[920px]' },
              React.createElement('thead', null, React.createElement('tr', { className: 'border-b border-gray-200 bg-gray-50 dark:bg-gray-800' },
                React.createElement('th', { className: 'text-left px-4 py-3' }, t('user', getLang())),
                React.createElement('th', { className: 'text-left px-4 py-3' }, t('email', getLang())),
                React.createElement('th', { className: 'text-left px-4 py-3' }, t('role', getLang())),
                React.createElement('th', { className: 'text-left px-4 py-3' }, t('posts', getLang())),
                sites.length > 0 && React.createElement('th', { className: 'text-left px-4 py-3 hidden lg:table-cell' }, t('site access', getLang())),
                // Hide less critical columns on narrow windows so the table
                // fits without clipping the actions column
                React.createElement('th', { className: 'text-left px-4 py-3 hidden md:table-cell' }, t('2fa', getLang())),
                React.createElement('th', { className: 'text-left px-4 py-3 hidden lg:table-cell' }, t('registered', getLang())),
                React.createElement('th', { className: 'text-right px-4 py-3' }, t('actions', getLang())),
              )),
              React.createElement('tbody', null, filteredUsers.map((u: any) =>
                React.createElement('tr', { key: u.id, className: 'border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800' },
                  React.createElement('td', { className: 'px-4 py-3' },
                    React.createElement('div', { className: 'flex items-center gap-2' },
                      React.createElement('div', { className: 'w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-medium shadow-sm' }, (u.username || '?')[0].toUpperCase()),
                      React.createElement('div', { className: 'flex items-center gap-1.5' },
                        React.createElement('p', { className: 'font-medium text-sm text-gray-900 dark:text-gray-100' }, u.username),
                        // Inline, not a second line: it used to stack under the name
                        // and made the row look broken.
                        u.id === currentUser?.id && React.createElement('span', { className: 'px-1.5 py-0.5 rounded bg-primary-50 text-primary-600 text-[10px] leading-none dark:bg-primary-900/40 dark:text-primary-300' }, t('you', getLang()))
                      )
                    )
                  ),
                  React.createElement('td', { className: 'px-4 py-3 text-sm text-gray-500 dark:text-gray-400' }, u.email),
                  React.createElement('td', { className: 'px-4 py-3' },
                    React.createElement('div', { className: 'flex items-center gap-2 whitespace-nowrap' },
                      React.createElement('span', { className: 'px-2 py-0.5 text-[11px] rounded-full font-medium capitalize shrink-0 ' + (roleColors[u.role] || 'bg-gray-100 text-gray-600') }, t(u.role, getLang())),
                      // inline width/padding: .input-field's w-full/py-2.5 override utility classes
                      React.createElement(Select, { value: u.role, onChange: (v: string) => updateRole(u.id, v), className: 'input-field text-xs shrink-0', style: { width: 96, paddingTop: 5, paddingBottom: 5 } },
                        roles.map(r => React.createElement('option', { key: r, value: r }, r))
                      )
                    )
                  ),
                  React.createElement('td', { className: 'px-4 py-3 text-sm text-gray-500 dark:text-gray-400' }, u._count?.posts || 0),
                  sites.length > 0 && React.createElement('td', { className: 'px-4 py-3 hidden lg:table-cell' },
                    (() => {
                      // Admins are never scoped, and neither is a user with no
                      // assignment — both read as "all sites".
                      if (u.role === 'admin') return React.createElement('span', { className: 'text-[10px] text-gray-400' }, t('all sites (no scope)', getLang()));
                      const selected: string[] = u.siteIds || [];
                      const names = sites.filter((s: any) => selected.includes(s.id)).map((s: any) => s.name);
                      return React.createElement('details', { className: 'text-xs relative' },
                        React.createElement('summary', {
                          className: 'cursor-pointer list-none flex items-center gap-1 flex-wrap hover:text-primary-600',
                          title: t('site access hint', getLang()),
                        },
                          names.length
                            ? names.map((n: string) => React.createElement('span', { key: n, className: 'px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-[10px] text-gray-600 dark:text-gray-300 whitespace-nowrap' }, n))
                            : React.createElement('span', { className: 'text-[10px] text-gray-400 whitespace-nowrap' }, t('all sites (no scope)', getLang())),
                          React.createElement(ChevronDown, { size: 12, className: 'text-gray-400 shrink-0' })),
                        React.createElement('div', { className: 'mt-1.5 space-y-1 border border-gray-200 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-800 shadow-sm' },
                          sites.map((s: any) => React.createElement('label', { key: s.id, className: 'flex items-center gap-1.5 whitespace-nowrap cursor-pointer' },
                            React.createElement('input', {
                              type: 'checkbox',
                              checked: selected.includes(s.id),
                              onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                                updateSites(u.id, e.target.checked ? [...selected, s.id] : selected.filter(x => x !== s.id)),
                              className: 'rounded border-gray-300 text-primary-600 shrink-0',
                            }),
                            React.createElement('span', { className: 'text-[11px] text-gray-700 dark:text-gray-200' }, s.name))),
                          React.createElement('p', { className: 'text-[10px] text-gray-400 pt-1' }, t('site access hint', getLang()))));
                    })()),
                  React.createElement('td', { className: 'px-4 py-3 hidden md:table-cell' },
                    React.createElement('span', { className: 'px-2 py-0.5 text-[11px] rounded-full font-medium ' + (u.two_factor_enabled ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400') },
                      u.two_factor_enabled ? t('2fa enabled', getLang()) : t('2fa disabled', getLang()))),
                  React.createElement('td', { className: 'px-4 py-3 text-sm text-gray-400 dark:text-gray-500 hidden lg:table-cell' }, u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '-'),
                  React.createElement('td', { className: 'px-4 py-3' },
                    React.createElement('div', { className: 'flex justify-end' },
                      React.createElement('button', { onClick: () => del(u.id), disabled: u.id === currentUser?.id, className: 'p-1.5 text-gray-400 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed', title: t('delete', getLang()) }, React.createElement(Trash2, { size: 16 })))
                  )
                )
              ))
            )
      )
    )
  );
}
