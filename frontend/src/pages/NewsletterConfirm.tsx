import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, XCircle } from 'lucide-react';
import api from '../lib/api';
import { t } from '../lib/i18n';
import useSEO from '../hooks/useSEO';

// Handles both /newsletter/confirm?token=... and /newsletter/unsubscribe?token=...
// (single page, mode derived from the route path)
export default function NewsletterConfirm({ mode }: { mode: 'confirm' | 'unsubscribe' }) {
  useSEO({ title: t(mode === 'confirm' ? 'confirm subscription' : 'unsubscribe'), url: '/newsletter/' + mode, noindex: true });
  const [params] = useSearchParams();
  const [state, setState] = useState<'loading' | 'done' | 'error'>('loading');

  useEffect(() => {
    const token = params.get('token');
    if (!token) { setState('error'); return; }
    api.post('/newsletter/' + mode, { token }).then(() => setState('done')).catch(() => setState('error'));
  }, [params, mode]);

  return React.createElement('div', { className: 'max-w-md mx-auto px-4 py-20 text-center' },
    state === 'loading'
      ? React.createElement('p', { className: 'text-sm text-gray-400' }, t('loading') + '…')
      : state === 'done'
        ? React.createElement(React.Fragment, null,
            React.createElement(CheckCircle2, { size: 40, className: 'mx-auto text-green-500 mb-4' }),
            React.createElement('h1', { className: 'text-xl font-bold text-gray-900 mb-3' }, t(mode === 'confirm' ? 'subscription confirmed' : 'unsubscribed')),
            React.createElement('p', { className: 'text-sm text-gray-500 mb-6' }, t(mode === 'confirm' ? 'subscription confirmed note' : 'unsubscribed note')),
            React.createElement(Link, { to: '/', className: 'btn-primary inline-flex' }, t('back to home')))
        : React.createElement(React.Fragment, null,
            React.createElement(XCircle, { size: 40, className: 'mx-auto text-red-500 mb-4' }),
            React.createElement('h1', { className: 'text-xl font-bold text-gray-900 mb-3' }, t('invalid token')),
            React.createElement('p', { className: 'text-sm text-gray-500 mb-6' }, t('invalid token note')),
            React.createElement(Link, { to: '/', className: 'btn-primary inline-flex' }, t('back to home'))),
  );
}
