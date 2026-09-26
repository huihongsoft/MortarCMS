import React from 'react';
import { Link } from 'react-router-dom';
import useSEO from '../hooks/useSEO';
import { t } from '../lib/i18n';
import { useTheme } from '../themes';
import { siteOrigin } from '../lib/ssr';

export default function NotFound() {
  // Optional theme slot: a theme that ships NotFoundLayout styles its own 404
  // (the hook runs unconditionally, before any early return).
  const theme = useTheme();
  // A not-found page has nothing to index (the server answers 404 for unknown
  // paths and adds the same signal as a header).
  useSEO({ title: '404 - ' + t('page not found'), url: siteOrigin() + '/404', noindex: true });
  if (theme.NotFoundLayout) return React.createElement(theme.NotFoundLayout, null);
  return React.createElement('div', { className: 'max-w-md mx-auto px-4 py-20 text-center' },
    React.createElement('h1', { className: 'text-6xl font-bold text-gray-200 mb-4' }, '404'),
    React.createElement('h2', { className: 'text-xl font-semibold text-gray-900 mb-2' }, t('page not found')),
    React.createElement('p', { className: 'text-gray-500 mb-6' }, t('the page you are looking for might have been removed or is temporarily unavailable')),
    React.createElement(Link, { to: '/', className: 'inline-block px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700' }, t('back to home'))
  );
}
