import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { AuroraList } from './Shared';
import { t } from '../../lib/i18n';

export default function AuthorLayout(props: any) {
  const { settings, username, error } = props;
  return React.createElement('div', { className: 'max-w-3xl mx-auto px-6 pb-4' },
    React.createElement(Link, { to: '/', className: 'inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mt-14 transition-colors' }, React.createElement(ArrowLeft, { size: 15 }), t('back', settings)),
    React.createElement('div', { className: 'py-10' },
      React.createElement('div', { className: 'flex items-center gap-4' },
        React.createElement('div', { className: 'w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-2xl font-bold' }, (username || '?')[0].toUpperCase()),
        React.createElement('div', null,
          React.createElement('h1', { className: 'text-3xl font-bold tracking-tight text-gray-900' }, username),
          React.createElement('p', { className: 'text-sm text-gray-500 mt-1' }, props.posts.length + ' ' + t('posts', settings)),
        ),
      ),
    ),
    error ? React.createElement('p', { className: 'text-gray-500' }, t('author not found', settings))
      : React.createElement(AuroraList, props),
  );
}
