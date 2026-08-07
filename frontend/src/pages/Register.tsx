import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import api from '../lib/api';
import { t } from '../lib/i18n';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      await api.post('/auth/register', form);
      window.location.href = '/admin#/login';
    } catch (err: any) {
      setError(err.response?.data?.error || t('registration failed'));
    } finally { setLoading(false); }
  }

  return React.createElement('div', { className: 'max-w-md mx-auto px-4 py-16' },
    React.createElement('h1', { className: 'text-2xl font-bold text-gray-900 mb-6 text-center' }, t('create an account')),
    React.createElement('form', { onSubmit: handleSubmit, className: 'space-y-4' },
      error && React.createElement('div', { className: 'p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg' }, error),
      React.createElement('div', null,
        React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, t('username')),
        React.createElement('input', { value: form.username, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, username: e.target.value }), className: 'input-field', required: true, minLength: 3 })
      ),
      React.createElement('div', null,
        React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, t('email')),
        React.createElement('input', { type: 'email', value: form.email, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, email: e.target.value }), className: 'input-field', required: true })
      ),
      React.createElement('div', null,
        React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, t('enter password')),
        React.createElement('input', { type: 'password', value: form.password, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, password: e.target.value }), className: 'input-field', required: true, minLength: 6 })
      ),
      React.createElement('button', { type: 'submit', disabled: loading, className: 'btn-primary w-full justify-center' }, React.createElement(UserPlus, { size: 16 }), loading ? t('loading') : t('register')),
      React.createElement('p', { className: 'text-sm text-gray-500 text-center mt-4' }, t('already have an account?') + ' ', React.createElement(Link, { to: '/admin/login', className: 'text-primary-600 hover:text-primary-700' }, t('sign in')))
    )
  );
}
