import React from 'react';
import { AuroraList } from './Shared';
import { t } from '../../lib/i18n';

export default function ArchiveLayout(props: any) {
  const { settings, year, month } = props;
  return React.createElement('div', { className: 'max-w-3xl mx-auto px-6 pb-4' },
    React.createElement('div', { className: 'py-16 text-center' },
      React.createElement('p', { className: 'text-xs font-medium uppercase tracking-[0.2em] text-indigo-600 mb-3' }, t('archive', settings)),
      React.createElement('h1', { className: 'text-4xl sm:text-5xl font-bold tracking-tight text-gray-900' }, year + (month ? ' / ' + month : '')),
    ),
    React.createElement(AuroraList, props),
  );
}
