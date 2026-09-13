import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { User, KeyRound, MessageSquare } from 'lucide-react';
import api from '../lib/api';
import { t } from '../lib/i18n';
import useSEO from '../hooks/useSEO';

interface MyComment { id: string; content: string; createdAt: string; postTitle: string; postSlug: string }

export default function Profile() {
  useSEO({ title: t('profile'), url: '/profile', noindex: true });
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem('mortar_token'));
  const [me, setMe] = useState<any>(null);
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');
  const [pw, setPw] = useState({ old: '', next: '', confirm: '' });
  const [comments, setComments] = useState<MyComment[]>([]);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!loggedIn) return;
    api.get('/auth/me').then(r => { setMe(r.data); setBio(r.data.bio || ''); setAvatar(r.data.avatar || ''); })
      .catch(() => { setLoggedIn(false); }).finally(() => setLoading(false));
    api.get('/auth/me/comments').then(r => setComments(r.data.comments || [])).catch(() => {});
  }, [loggedIn]);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    try {
      await api.put('/auth/me', { bio, avatar });
      setMsg({ ok: true, text: t('profile saved') });
    } catch (err: any) { setMsg({ ok: false, text: err.response?.data?.error || t('save failed') }); }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    if (pw.next.length < 8 || !/[a-zA-Z]/.test(pw.next) || !/\d/.test(pw.next)) { setMsg({ ok: false, text: t('password must be at least 8 characters with letters and numbers') }); return; }
    if (pw.next !== pw.confirm) { setMsg({ ok: false, text: t('passwords do not match') }); return; }
    try {
      await api.put('/auth/me/password', { oldPassword: pw.old, newPassword: pw.next });
      setPw({ old: '', next: '', confirm: '' });
      setMsg({ ok: true, text: t('password changed') });
    } catch (err: any) { setMsg({ ok: false, text: err.response?.data?.error || t('save failed') }); }
  };

  if (!loggedIn) {
    return React.createElement('div', { className: 'max-w-md mx-auto px-4 py-16 text-center' },
      React.createElement('h1', { className: 'text-2xl font-bold text-gray-900 mb-4' }, t('profile')),
      React.createElement('p', { className: 'text-sm text-gray-500 mb-6' }, t('login to submit')),
      React.createElement(Link, { to: '/login', className: 'btn-primary inline-flex' }, t('sign in')));
  }

  if (loading || !me) {
    return React.createElement('div', { className: 'max-w-2xl mx-auto px-4 py-16 text-center' },
      React.createElement('p', { className: 'text-sm text-gray-400' }, t('loading') + '…'));
  }

  return React.createElement('div', { className: 'max-w-2xl mx-auto px-4 py-12' },
    // Header with avatar
    React.createElement('div', { className: 'flex items-center gap-4 mb-8' },
      me.avatar
        ? React.createElement('img', { src: me.avatar, alt: me.username, className: 'w-16 h-16 rounded-full object-cover' })
        : React.createElement('div', { className: 'w-16 h-16 rounded-full bg-primary-600 flex items-center justify-center text-white text-xl font-medium' }, (me.username || '?').charAt(0).toUpperCase()),
      React.createElement('div', null,
        React.createElement('h1', { className: 'text-2xl font-bold text-gray-900' }, me.username),
        React.createElement('p', { className: 'text-sm text-gray-500' }, me.email + ' · ' + t(me.role || 'user')))),
    msg && React.createElement('div', { role: 'alert', className: 'mb-4 p-3 text-sm rounded-lg ' + (msg.ok ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700') }, msg.text),

    // Profile form
    React.createElement('div', { className: 'card p-6 mb-6' },
      React.createElement('h2', { className: 'text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2' }, React.createElement(User, { size: 15 }), t('my profile')),
      React.createElement('form', { onSubmit: saveProfile, className: 'space-y-4' },
        React.createElement('div', null,
          React.createElement('label', { htmlFor: 'pf-bio', className: 'block text-sm font-medium text-gray-700 mb-1' }, t('bio')),
          React.createElement('textarea', { id: 'pf-bio', value: bio, onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => setBio(e.target.value), rows: 3, maxLength: 500, className: 'input-field' })),
        React.createElement('div', null,
          React.createElement('label', { htmlFor: 'pf-avatar', className: 'block text-sm font-medium text-gray-700 mb-1' }, t('avatar url')),
          React.createElement('input', { id: 'pf-avatar', value: avatar, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setAvatar(e.target.value), placeholder: 'https://…', className: 'input-field' })),
        React.createElement('button', { type: 'submit', className: 'btn-primary text-sm' }, t('save profile'))),
    ),

    // Change password
    React.createElement('div', { className: 'card p-6 mb-6' },
      React.createElement('h2', { className: 'text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2' }, React.createElement(KeyRound, { size: 15 }), t('change password')),
      React.createElement('form', { onSubmit: changePassword, className: 'space-y-4' },
        React.createElement('div', null,
          React.createElement('label', { htmlFor: 'pw-old', className: 'block text-sm font-medium text-gray-700 mb-1' }, t('current password')),
          React.createElement('input', { id: 'pw-old', type: 'password', value: pw.old, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setPw({ ...pw, old: e.target.value }), className: 'input-field', required: true, autoComplete: 'current-password' })),
        React.createElement('div', { className: 'grid grid-cols-1 sm:grid-cols-2 gap-4' },
          React.createElement('div', null,
            React.createElement('label', { htmlFor: 'pw-next', className: 'block text-sm font-medium text-gray-700 mb-1' }, t('new password')),
            React.createElement('input', { id: 'pw-next', type: 'password', value: pw.next, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setPw({ ...pw, next: e.target.value }), className: 'input-field', required: true, minLength: 8, autoComplete: 'new-password' })),
          React.createElement('div', null,
            React.createElement('label', { htmlFor: 'pw-confirm', className: 'block text-sm font-medium text-gray-700 mb-1' }, t('confirm new password')),
            React.createElement('input', { id: 'pw-confirm', type: 'password', value: pw.confirm, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setPw({ ...pw, confirm: e.target.value }), className: 'input-field', required: true, autoComplete: 'new-password' }))),
        React.createElement('button', { type: 'submit', className: 'btn-secondary text-sm' }, t('change password'))),
    ),

    // My comments
    React.createElement('div', { className: 'card p-6' },
      React.createElement('h2', { className: 'text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2' }, React.createElement(MessageSquare, { size: 15 }), t('my comments')),
      comments.length === 0
        ? React.createElement('p', { className: 'text-sm text-gray-400' }, t('no comments yet'))
        : React.createElement('div', { className: 'space-y-3' },
            comments.map(c =>
              React.createElement('div', { key: c.id, className: 'border-b border-gray-100 pb-3 last:border-0' },
                React.createElement('p', { className: 'text-sm text-gray-800' }, c.content),
                React.createElement('p', { className: 'text-xs text-gray-400 mt-1' },
                  new Date(c.createdAt).toLocaleDateString() + ' · ',
                  React.createElement(Link, { to: '/post/' + c.postSlug, className: 'text-primary-600 hover:text-primary-700' }, c.postTitle || t('post')))))),
    ),
  );
}
