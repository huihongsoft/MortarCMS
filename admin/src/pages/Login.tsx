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
  // Password reset mode: /admin#/reset?token=xxx
  const resetToken = new URLSearchParams((window.location.hash.split('?')[1]) || '').get('token');
  const [newPwd, setNewPwd] = useState('');
  const [newPwd2, setNewPwd2] = useState('');
  const [resetMsg, setResetMsg] = useState('');
  const [resetErr, setResetErr] = useState('');

  if (user) { navigate('/', { replace: true }); return null; }

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetErr(''); setResetMsg('');
    if (newPwd.length < 8) { setResetErr(t('password must be at least 8 characters', getLang())); return; }
    if (newPwd !== newPwd2) { setResetErr(t('passwords do not match', getLang())); return; }
    try {
      await fetch('/api/auth/reset-password', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetToken, password: newPwd }),
      });
      setResetMsg(t('password has been reset. you can now sign in.', getLang()));
      window.location.hash = '';
    } catch (err: any) { setResetErr(err.response?.data?.error || t('reset failed', getLang())); }
  };

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
      resetToken ? React.createElement('form', { onSubmit: handleReset, className: 'space-y-4' },
        React.createElement('p', { className: 'text-sm text-gray-500' }, t('choose a new password for your account', getLang())),
        resetErr && React.createElement('div', { className: 'p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg' }, resetErr),
        resetMsg && React.createElement('div', { className: 'p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg' }, resetMsg),
        React.createElement('div', null, React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, t('new password', getLang())), React.createElement('input', { type: 'password', value: newPwd, onChange: e => setNewPwd(e.target.value), className: 'input-field', placeholder: '********', required: true })),
        React.createElement('div', null, React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, t('confirm new password', getLang())), React.createElement('input', { type: 'password', value: newPwd2, onChange: e => setNewPwd2(e.target.value), className: 'input-field', placeholder: '********', required: true })),
        React.createElement('button', { type: 'submit', className: 'btn-primary w-full justify-center' }, t('reset password', getLang())),
      ) : React.createElement('form', { onSubmit: handleSubmit, className: 'space-y-4' },
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
