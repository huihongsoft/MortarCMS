import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import api from '../lib/api';
import { t } from '../lib/i18n';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
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

  function validate(): string {
    if (form.username.length < 3) return t('username must be at least 3 characters');
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) return t('enter a valid email address');
    if (form.password.length < 8 || !/\d/.test(form.password)) return t('password must be at least 8 characters with letters and numbers');
    if (form.password !== form.confirm) return t('passwords do not match');
    return '';
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const v = validate();
    if (v) { setError(v); return; }
    setLoading(true);
    try {
      await api.post('/auth/register', { username: form.username, email: form.email, password: form.password });
      window.location.href = '/admin#/login';
    } catch (err: any) {
      setError(err.response?.data?.error || t('registration failed'));
    } finally { setLoading(false); }
  }

  return React.createElement('div', { className: 'max-w-md mx-auto px-4 py-16' },
    React.createElement('h1', { className: 'text-2xl font-bold text-gray-900 mb-6 text-center' }, t('create an account')),
    React.createElement('form', { onSubmit: handleSubmit, noValidate: true, className: 'space-y-4' },
      error && React.createElement('div', { role: 'alert', className: 'p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg' }, error),
      React.createElement('div', null,
        React.createElement('label', { htmlFor: 'reg-username', className: 'block text-sm font-medium text-gray-700 mb-1' }, t('username')),
        React.createElement('input', { id: 'reg-username', value: form.username, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, username: e.target.value }), className: 'input-field', required: true, minLength: 3, autoComplete: 'username' })
      ),
      React.createElement('div', null,
        React.createElement('label', { htmlFor: 'reg-email', className: 'block text-sm font-medium text-gray-700 mb-1' }, t('email')),
        React.createElement('input', { id: 'reg-email', type: 'email', value: form.email, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, email: e.target.value }), className: 'input-field', required: true, autoComplete: 'email' })
      ),
      React.createElement('div', null,
        React.createElement('label', { htmlFor: 'reg-password', className: 'block text-sm font-medium text-gray-700 mb-1' }, t('enter password')),
        React.createElement('input', { id: 'reg-password', type: 'password', value: form.password, onChange: (e: React.ChangeEvent<HTMLInputElement>) => { setForm({ ...form, password: e.target.value }); checkPwdStrength(e.target.value); }, className: 'input-field', required: true, minLength: 8, autoComplete: 'new-password' }),
        pwdScore > 0 && React.createElement('div', { className: 'flex items-center gap-2 mt-1.5' },
          React.createElement('div', { className: 'flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden' },
            React.createElement('div', { className: 'h-full rounded-full transition-all ' + (pwdScore >= 4 ? 'bg-green-500' : pwdScore >= 3 ? 'bg-yellow-500' : 'bg-red-500'), style: { width: (pwdScore / 5) * 100 + '%' } })),
          React.createElement('span', { className: 'text-[10px] ' + (pwdScore >= 4 ? 'text-green-600' : pwdScore >= 3 ? 'text-yellow-600' : 'text-red-500') }, t('password strength') + ': ' + pwdScore + '/5'))
      ),
      React.createElement('div', null,
        React.createElement('label', { htmlFor: 'reg-confirm', className: 'block text-sm font-medium text-gray-700 mb-1' }, t('confirm new password')),
        React.createElement('input', { id: 'reg-confirm', type: 'password', value: form.confirm, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, confirm: e.target.value }), className: 'input-field', required: true, autoComplete: 'new-password' })
      ),
      React.createElement('button', { type: 'submit', disabled: loading, className: 'btn-primary w-full justify-center' }, React.createElement(UserPlus, { size: 16 }), loading ? t('loading') : t('register')),
      React.createElement('p', { className: 'text-sm text-gray-500 text-center mt-4' }, t('already have an account?') + ' ', React.createElement(Link, { to: '/admin/login', className: 'text-primary-600 hover:text-primary-700' }, t('sign in')))
    )
  );
}
