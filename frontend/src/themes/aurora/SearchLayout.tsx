import React from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { AuroraList } from './Shared';
import { t } from '../../lib/i18n';

export default function SearchLayout(props: any) {
  const { settings, query, error } = props;
  return React.createElement('div', { className: 'max-w-3xl mx-auto px-6 pb-4' },
    React.createElement('div', { className: 'py-16 text-center' },
      React.createElement('p', { className: 'text-xs font-medium uppercase tracking-[0.2em] text-indigo-600 mb-3' }, t('search', settings)),
      React.createElement('h1', { className: 'text-4xl font-bold tracking-tight text-gray-900' }, query ? t('results for', settings) + ' "' + query + '"' : t('search', settings)),
    ),
    error
      ? React.createElement('div', { className: 'text-center py-16' }, React.createElement('h3', { className: 'text-lg font-semibold text-gray-900 mb-2' }, t('search failed', settings)))
      : React.createElement(React.Fragment, null,
          props.loading ? React.createElement('p', { className: 'text-gray-500 text-center py-16' }, t('searching', settings))
          : props.posts.length === 0
            ? React.createElement('div', { className: 'text-center py-16' },
                React.createElement(Search, { size: 40, className: 'mx-auto text-gray-300 mb-4' }),
                React.createElement('h3', { className: 'text-lg font-semibold text-gray-900 mb-2' }, t('no results for', settings) + ' "' + query + '"'),
                React.createElement(Link, { to: '/', className: 'text-indigo-600 text-sm' }, '\u2190 ' + t('browse all posts', settings)))
            : React.createElement(AuroraList, props),
        ),
  );
}
