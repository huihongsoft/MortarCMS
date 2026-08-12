import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import api from '../lib/api';
import { t } from '../lib/i18n';
import useSEO from '../hooks/useSEO';

export default function Login() {
  useSEO({ title: 'Login', url: '/login', noindex: true });
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const r = await api.post('/auth/login', { email, password });
      if (r.data.twoFactorRequired) {
        setError('2FA required on this account — please use the admin panel.');
        return;
      }
      localStorage.setItem('mortar_token', r.data.token);
      navigate('/');
      window.location.reload();
    } catch (err: any) {
      setError(err.response?.data?.error || t('login failed'));
    } finally { setLoading(false); }
  }

  const inputCls = 'w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/15 focus:border-indigo-400 text-sm transition-all bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100';

  return React.createElement('div', { className: 'min-h-[72vh] flex items-center justify-center px-4 py-16 relative overflow-hidden' },
    // Ambient gradient blobs
    React.createElement('div', { className: 'absolute inset-0 pointer-events-none', 'aria-hidden': 'true' },
      React.createElement('div', { className: 'absolute -top-32 -left-32 w-[26rem] h-[26rem] rounded-full blur-3xl opacity-20', style: { background: 'var(--primary-color, #6366f1)' } }),
      React.createElement('div', { className: 'absolute -bottom-40 -right-32 w-[30rem] h-[30rem] rounded-full blur-3xl opacity-10', style: { background: 'var(--primary-color, #6366f1)' } }),
    ),
    React.createElement('div', { className: 'w-full max-w-md' },
      React.createElement('div', { className: 'bg-white dark:bg-gray-900 rounded-3xl border border-gray-900/[0.06] dark:border-gray-700 shadow-2xl shadow-gray-900/10 p-10' },
        // Logo + heading
        React.createElement('div', { className: 'text-center mb-8' },
          React.createElement('div', { className: 'w-12 h-12 mx-auto rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30 mb-5 flex items-center justify-center' },
            React.createElement('span', { className: 'text-white text-lg font-bold' }, 'M')),
          React.createElement('h1', { className: 'text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100' }, t('welcome back')),
          React.createElement('p', { className: 'text-sm text-gray-500 dark:text-gray-400 mt-2' }, t('sign in to continue')),
        ),
        error && React.createElement('div', { role: 'alert', className: 'p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl mb-5' }, error),
        React.createElement('form', { onSubmit: handleSubmit, className: 'space-y-4' },
          React.createElement('div', null,
            React.createElement('label', { htmlFor: 'login-email', className: 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5' }, t('email')),
            React.createElement('input', { id: 'login-email', type: 'email', value: email, onChange: e => setEmail(e.target.value), className: inputCls, required: true, autoComplete: 'email' }),
          ),
          React.createElement('div', null,
            React.createElement('label', { htmlFor: 'login-password', className: 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5' }, t('password')),
            React.createElement('input', { id: 'login-password', type: 'password', value: password, onChange: e => setPassword(e.target.value), className: inputCls, required: true, autoComplete: 'current-password' }),
          ),
          React.createElement('button', {
            type: 'submit',
            disabled: loading,
            className: 'w-full py-3 rounded-xl text-white text-sm font-medium transition-all hover:opacity-90 disabled:opacity-50 shadow-lg shadow-indigo-500/25 inline-flex items-center justify-center gap-2',
            style: { background: 'var(--primary-color, #6366f1)' },
          }, loading ? t('signing in') + '...' : React.createElement(React.Fragment, null, t('sign in'), React.createElement(ArrowRight, { size: 15 }))),
        ),
        React.createElement('div', { className: 'flex items-center justify-between mt-6 text-sm' },
          React.createElement(Link, { to: '/register', className: 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 transition-colors' }, t('create an account')),
          React.createElement(Link, { to: '/admin', className: 'font-medium transition-colors', style: { color: 'var(--primary-color, #6366f1)' } }, t('admin login')),
        ),
      ),
    ),
  );
}
