import React from 'react';
import { Link } from 'react-router-dom';
import useSEO from '../hooks/useSEO';
import { t } from '../lib/i18n';

export default function NotFound() {
  useSEO({ title: '404 - ' + t('page not found'), url: window.location.origin + '/404' });
  return React.createElement('div', { className: 'max-w-md mx-auto px-4 py-20 text-center' },
    React.createElement('h1', { className: 'text-6xl font-bold text-gray-200 mb-4' }, '404'),
    React.createElement('h2', { className: 'text-xl font-semibold text-gray-900 mb-2' }, t('page not found')),
    React.createElement('p', { className: 'text-gray-500 mb-6' }, t('the page you are looking for might have been removed or is temporarily unavailable')),
    React.createElement(Link, { to: '/', className: 'inline-block px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700' }, t('back to home'))
  );
}
