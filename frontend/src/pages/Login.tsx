import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import api from '../lib/api';
import { t } from '../lib/i18n';

export default function Login() {
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

  return React.createElement('div', { className: 'max-w-sm mx-auto px-4 py-16' },
    React.createElement('div', { className: 'card p-8' },
      React.createElement('h1', { className: 'text-2xl font-bold text-gray-900 text-center mb-6' }, t('sign in')),
      error && React.createElement('div', { className: 'p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg mb-4' }, error),
      React.createElement('form', { onSubmit: handleSubmit, className: 'space-y-4' },
        React.createElement('div', null,
          React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, t('email')),
          React.createElement('input', { type: 'email', value: email, onChange: e => setEmail(e.target.value), className: 'input-field', required: true }),
        ),
        React.createElement('div', null,
          React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, t('password')),
          React.createElement('input', { type: 'password', value: password, onChange: e => setPassword(e.target.value), className: 'input-field', required: true }),
        ),
        React.createElement('button', { type: 'submit', disabled: loading, className: 'btn-primary w-full justify-center' },
          React.createElement(LogIn, { size: 16 }), loading ? '...' : t('sign in')),
      ),
      React.createElement('p', { className: 'text-sm text-gray-500 text-center mt-4' },
        t('register') + '? ', React.createElement(Link, { to: '/register', className: 'text-primary-600 hover:text-primary-700' }, t('create an account'))),
    ),
  );
}
