import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { t, getLang } from '../lib/i18n';
import { LogIn } from 'lucide-react';

export default function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [code, setCode] = useState('');
  const [twoFactor, setTwoFactor] = useState(false);
  const [loading, setLoading] = useState(false);

  if (user) { navigate('/', { replace: true }); return null; }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      await login(email, password, code);
      navigate('/');
    } catch (err: any) {
      if (err.response?.data?.twoFactorRequired) {
        setTwoFactor(true);
        setError('');
      } else {
        setError(err.response?.data?.error || t('login failed', getLang()));
      }
    } finally { setLoading(false); }
  };

  return React.createElement('div', { className: 'min-h-screen flex items-center justify-center bg-gray-100' },
    React.createElement('div', { className: 'w-full max-w-sm card p-8' },
      React.createElement('div', { className: 'text-center mb-6' },
        React.createElement('div', { className: 'w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25 mx-auto mb-3' },
          React.createElement('span', { className: 'text-white font-black text-xl select-none' }, 'M'),
        ),
        React.createElement('h1', { className: 'text-2xl font-bold text-gray-900' }, 'Mortar'),
        React.createElement('p', { className: 'text-sm text-gray-500 mt-1' }, t('sign in to your admin panel', getLang()))
      ),
      React.createElement('form', { onSubmit: handleSubmit, className: 'space-y-4' },
        error && React.createElement('div', { className: 'p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg' }, error),
        React.createElement('div', null, React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, t('email', getLang())), React.createElement('input', { id: 'login-email', type: 'email', value: email, onChange: e => setEmail(e.target.value), className: 'input-field', placeholder: 'admin@mortar.dev', required: true })),
        React.createElement('div', null, React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, t('password', getLang())), React.createElement('input', { type: 'password', value: password, onChange: e => setPassword(e.target.value), className: 'input-field', placeholder: t('enter password', getLang()), required: true })),
        twoFactor && React.createElement('div', null, React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, t('2fa code', getLang())), React.createElement('input', { type: 'text', value: code, onChange: e => setCode(e.target.value), className: 'input-field text-center text-lg tracking-widest', placeholder: '000000', maxLength: 6, required: true })),
        React.createElement('button', { type: 'submit', disabled: loading, className: 'btn-primary w-full justify-center' }, React.createElement(LogIn, { size: 16 }), loading ? t('sign in', getLang()) + '...' : twoFactor ? t('verify 2fa', getLang()) : t('sign in', getLang())),
      
      React.createElement('p', { className: 'text-sm text-gray-500 text-center mt-4' }, t('forgot password', getLang()) + '? ', React.createElement('a', { href: '#', onClick: async (e: React.MouseEvent) => { e.preventDefault(); const em = (document.getElementById('login-email') as HTMLInputElement)?.value; if (em) { await fetch('/api/auth/forgot-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: em }) }); alert(t('if the email exists, a reset link has been sent.', getLang())); } else { alert(t('enter your email first.', getLang())); } }, className: 'text-primary-600 hover:text-primary-700' }, t('restore', getLang()))),
      )
    )
  );
}
