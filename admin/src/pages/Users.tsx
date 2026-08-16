import React, { useEffect, useState } from 'react';
import { Trash2, UserPlus, UserCircle2, Shield, ShieldCheck, Copy, Check } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { t, getLang } from '../lib/i18n';
import api from '../lib/api';

const roles = ['admin', 'editor', 'author', 'contributor', 'subscriber'];

export default function Users() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [roleFilter, setRoleFilter] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => { api.get('/users').then(r => { setUsers(r.data); setLoaded(true); }).catch(() => { setLoaded(true); setError(t('failed to load users', getLang())); }); }, []);
  const filteredUsers = roleFilter ? users.filter((u: any) => u.role === roleFilter) : users;

  async function updateRole(id: string, role: string) {
    try { await api.put(`/users/${id}`, { role }); setUsers(users.map((u: any) => u.id === id ? { ...u, role } : u)); }
    catch (e: any) { alert(e.response?.data?.error || t('update failed', getLang())); }
  }
  async function del(id: string) { if (!confirm(t('delete this user?', getLang()))) return; try { await api.delete(`/users/${id}`); setUsers(users.filter((u: any) => u.id !== id)); } catch (e: any) { alert(e.response?.data?.error || t('delete failed', getLang())); } }

  // ---- 2FA management (self-service: the API acts on the logged-in user) ----
  const [twoFa, setTwoFa] = useState<null | { enabled: boolean; secret?: string; otpauth?: string }>(null);
  const [twoFaCode, setTwoFaCode] = useState('');
  const [twoFaBusy, setTwoFaBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  async function open2fa() {
    try {
      const status = await api.get('/auth/2fa/status');
      if (status.data?.enabled) { setTwoFa({ enabled: true }); return; }
      const s = await api.post('/auth/2fa/setup');
      setTwoFa({ enabled: false, secret: s.data.secret, otpauth: s.data.otpauth });
    } catch (e: any) { alert(e.response?.data?.error || t('2fa setup failed', getLang())); }
  }

  async function enable2fa() {
    if (!twoFaCode.trim()) return;
    setTwoFaBusy(true);
    try {
      await api.post('/auth/2fa/enable', { code: twoFaCode.trim() });
      setTwoFa({ enabled: true });
      api.get('/users').then(r => setUsers(r.data)).catch(() => {});
    } catch (e: any) { alert(e.response?.data?.error || t('invalid 2fa code', getLang())); }
    finally { setTwoFaBusy(false); }
  }

  async function disable2fa() {
    if (!confirm(t('disable 2fa?', getLang()))) return;
    try {
      await api.post('/auth/2fa/disable');
      setTwoFa(null);
      api.get('/users').then(r => setUsers(r.data)).catch(() => {});
    } catch (e: any) { alert(e.response?.data?.error || t('2fa setup failed', getLang())); }
  }

  function copyText(v: string) {
    navigator.clipboard?.writeText(v).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); }).catch(() => {});
  }

  async function createUser() {
    const u = (document.getElementById('new-username') as HTMLInputElement).value;
    const e = (document.getElementById('new-email') as HTMLInputElement).value;
    const p = (document.getElementById('new-password') as HTMLInputElement).value;
    const r = (document.getElementById('new-role') as HTMLSelectElement).value;
    if (!u || !e || !p) return alert(t('fill all fields', getLang()));
    try {
      await api.post('/auth/register', { username: u, email: e, password: p, role: r });
      window.location.reload();
    } catch (err: any) { alert(err.response?.data?.error || t('create failed', getLang())); }
  }

  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatar || '');
  const [pwdScore, setPwdScore] = useState(0);

  function checkPwdStrength(v: string) {
    let s = 0;
    if (v.length >= 8) s++;
    if (v.length >= 12) s++;
    if (/[A-Z]/.test(v) && /[a-z]/.test(v)) s++;
    if (/\d/.test(v)) s++;
    if (/[^A-Za-z0-9]/.test(v)) s++;
    setPwdScore(s);
  }

  async function updateProfile() {
    const bio = (document.getElementById('profile-bio') as HTMLTextAreaElement)?.value;
    const pw = (document.getElementById('profile-pw') as HTMLInputElement)?.value;
    const data: any = {};
    if (bio) data.bio = bio;
    if (pw) data.password = pw;
    if (avatarUrl) data.avatar = avatarUrl;
    if (Object.keys(data).length > 0) {
      await api.put('/users/' + (currentUser?.id || ''), data);
      alert(t('profile updated', getLang()));
    }
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
            React.createElement('input', { id: 'new-password', placeholder: t('password', getLang()), type: 'password', className: 'input-field' }),
            React.createElement('select', { id: 'new-role', className: 'input-field', defaultValue: 'author' },
              roles.map(r => React.createElement('option', { key: r, value: r }, t(r, getLang())))
            ),
            React.createElement('button', { onClick: createUser, className: 'btn-primary w-full justify-center text-sm' }, React.createElement(UserPlus, { size: 14 }), t('create user', getLang()))
          )
        ),
        React.createElement('div', { className: 'card p-5' },
          React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2' }, React.createElement(UserCircle2, { size: 16, className: 'text-primary-500' }), t('edit your profile', getLang())),
          React.createElement('div', { className: 'space-y-3' },
            React.createElement('div', { className: 'flex items-center gap-3' },
              avatarUrl ? React.createElement('img', { src: avatarUrl, alt: 'avatar', className: 'w-12 h-12 rounded-full object-cover' }) : React.createElement('div', { className: 'w-12 h-12 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-medium' }, (currentUser?.username || '?')[0].toUpperCase()),
              React.createElement('input', { type: 'text', value: avatarUrl, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setAvatarUrl(e.target.value), placeholder: t('avatar url', getLang()), className: 'input-field text-sm flex-1' })
            ),
            React.createElement('textarea', { id: 'profile-bio', className: 'input-field', rows: 3, placeholder: t('tell us about yourself...', getLang()), defaultValue: currentUser?.bio || '' }),
            React.createElement('input', { id: 'profile-pw', type: 'password', className: 'input-field', placeholder: t('new password', getLang()), onChange: (e: React.ChangeEvent<HTMLInputElement>) => checkPwdStrength(e.target.value) }),
            pwdScore > 0 && React.createElement('div', { className: 'flex items-center gap-2' },
              React.createElement('div', { className: 'flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden' },
                React.createElement('div', { className: 'h-full rounded-full transition-all ' + (pwdScore >= 4 ? 'bg-green-500' : pwdScore >= 3 ? 'bg-yellow-500' : 'bg-red-500'), style: { width: (pwdScore / 5) * 100 + '%' } })),
              React.createElement('span', { className: 'text-[10px] ' + (pwdScore >= 4 ? 'text-green-600' : pwdScore >= 3 ? 'text-yellow-600' : 'text-red-500') }, t('password strength', getLang()) + ': ' + pwdScore + '/5')),
            React.createElement('button', { onClick: updateProfile, className: 'btn-secondary w-full justify-center text-sm' }, t('update profile', getLang())),
            React.createElement('button', {
              onClick: async () => {
                if (!confirm(t('log out everywhere?', getLang()))) return;
                await api.post('/auth/logout-all');
                alert(t('logged out everywhere', getLang()));
                localStorage.removeItem('mortar_token');
                window.location.href = '/login';
              },
              className: 'btn-danger w-full justify-center text-sm',
            }, t('log out everywhere', getLang()))
          )
        ),
        React.createElement('div', { className: 'card p-5' },
          React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2' }, React.createElement(Shield, { size: 16, className: 'text-primary-500' }), t('two-factor authentication', getLang())),
          React.createElement('p', { className: 'text-xs text-gray-400 mb-4' }, t('2fa hint', getLang())),
          React.createElement('button', { onClick: open2fa, className: 'btn-secondary w-full justify-center text-sm' }, React.createElement(ShieldCheck, { size: 14 }), t('manage 2fa', getLang()))
        ),
      ),
      // 2FA setup modal
      twoFa && React.createElement('div', { className: 'fixed inset-0 z-[100] bg-black/40 flex items-center justify-center p-4', onClick: () => setTwoFa(null) },
        React.createElement('div', { className: 'bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-5', onClick: (e: React.MouseEvent) => e.stopPropagation() },
          React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2' }, React.createElement(Shield, { size: 16, className: 'text-primary-500' }), t('two-factor authentication', getLang())),
          twoFa.enabled
            ? React.createElement(React.Fragment, null,
                React.createElement('div', { className: 'p-3 rounded-lg bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm mb-4 flex items-center gap-2' }, React.createElement(ShieldCheck, { size: 16 }), t('2fa enabled hint', getLang())),
                React.createElement('button', { onClick: disable2fa, className: 'btn-danger w-full justify-center text-sm' }, t('disable 2fa', getLang())))
            : React.createElement(React.Fragment, null,
                React.createElement('p', { className: 'text-xs text-gray-500 dark:text-gray-400 mb-2' }, t('scan or enter the secret', getLang())),
                React.createElement('div', { className: 'flex items-center gap-2 mb-3' },
                  React.createElement('code', { className: 'flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-900 rounded-lg text-sm font-mono break-all' }, twoFa.secret),
                  React.createElement('button', { onClick: () => copyText(twoFa.otpauth || twoFa.secret || ''), className: 'btn-secondary text-xs shrink-0' }, copied ? React.createElement(Check, { size: 14 }) : React.createElement(Copy, { size: 14 }), copied ? t('copied', getLang()) : t('copy', getLang()))
                ),
                twoFa.otpauth && React.createElement('a', { href: twoFa.otpauth, className: 'text-xs text-primary-600 dark:text-primary-400 break-all hover:underline' }, twoFa.otpauth),
                React.createElement('input', { type: 'text', value: twoFaCode, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setTwoFaCode(e.target.value), placeholder: t('enter 2fa code', getLang()), maxLength: 6, className: 'input-field text-center text-lg tracking-widest mt-3' }),
                React.createElement('button', { onClick: enable2fa, disabled: twoFaBusy || twoFaCode.length < 6, className: 'btn-primary w-full justify-center text-sm mt-3 disabled:opacity-50' }, t('verify and enable', getLang()))
              )
        )
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
          : React.createElement('table', { className: 'w-full' },
              React.createElement('thead', null, React.createElement('tr', { className: 'border-b border-gray-200 bg-gray-50 dark:bg-gray-800' },
                React.createElement('th', { className: 'text-left px-4 py-3' }, t('user', getLang())),
                React.createElement('th', { className: 'text-left px-4 py-3' }, t('email', getLang())),
                React.createElement('th', { className: 'text-left px-4 py-3' }, t('role', getLang())),
                React.createElement('th', { className: 'text-left px-4 py-3' }, t('posts', getLang())),
                React.createElement('th', { className: 'text-left px-4 py-3' }, t('2fa', getLang())),
                React.createElement('th', { className: 'text-left px-4 py-3' }, t('registered', getLang())),
                React.createElement('th', { className: 'text-right px-4 py-3' }, t('actions', getLang())),
              )),
              React.createElement('tbody', null, filteredUsers.map((u: any) =>
                React.createElement('tr', { key: u.id, className: 'border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800' },
                  React.createElement('td', { className: 'px-4 py-3' },
                    React.createElement('div', { className: 'flex items-center gap-2' },
                      React.createElement('div', { className: 'w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-medium shadow-sm' }, (u.username || '?')[0].toUpperCase()),
                      React.createElement('div', null,
                        React.createElement('p', { className: 'font-medium text-sm text-gray-900 dark:text-gray-100' }, u.username),
                        u.id === currentUser?.id && React.createElement('p', { className: 'text-[10px] text-primary-500' }, t('you', getLang()))
                      )
                    )
                  ),
                  React.createElement('td', { className: 'px-4 py-3 text-sm text-gray-500 dark:text-gray-400' }, u.email),
                  React.createElement('td', { className: 'px-4 py-3' },
                    React.createElement('div', { className: 'flex items-center gap-2' },
                      React.createElement('span', { className: 'px-2 py-0.5 text-[11px] rounded-full font-medium capitalize ' + (roleColors[u.role] || 'bg-gray-100 text-gray-600') }, t(u.role, getLang())),
                      React.createElement('select', { value: u.role, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => updateRole(u.id, e.target.value), className: 'input-field w-28 text-xs py-1' },
                        roles.map(r => React.createElement('option', { key: r, value: r }, r))
                      )
                    )
                  ),
                  React.createElement('td', { className: 'px-4 py-3 text-sm text-gray-500 dark:text-gray-400' }, u._count?.posts || 0),
                  React.createElement('td', { className: 'px-4 py-3' },
                    React.createElement('span', { className: 'px-2 py-0.5 text-[11px] rounded-full font-medium ' + (u.two_factor_enabled ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400') },
                      u.two_factor_enabled ? t('2fa enabled', getLang()) : t('2fa disabled', getLang()))),
                  React.createElement('td', { className: 'px-4 py-3 text-sm text-gray-400 dark:text-gray-500' }, u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '-'),
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
