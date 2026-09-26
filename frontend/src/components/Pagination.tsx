import React from 'react';
import { t } from '../lib/i18n';

// Shared pager for the list screens (archive / author / search). The homepage
// themes keep their own markup, but these pages had no pager at all even though
// the API has always returned total/page — the second page of a search or an
// archive was simply unreachable.
export default function Pagination({ page, total, perPage, onChange, settings, className }: {
  page: number;
  total: number;
  perPage: number;
  onChange: (page: number) => void;
  settings: any;
  className?: string;
}): any {
  const pages = Math.max(1, Math.ceil((total || 0) / Math.max(1, perPage || 10)));
  if (pages <= 1) return null;
  const btn = 'px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-transparent';
  return React.createElement('nav', { className: 'flex items-center justify-center gap-4 pt-6 ' + (className || ''), 'aria-label': t('pagination', settings) },
    React.createElement('button', { onClick: () => onChange(Math.max(1, page - 1)), disabled: page <= 1, className: btn }, '\u2190 ' + t('previous', settings)),
    React.createElement('span', { className: 'text-sm text-gray-500' }, t('page', settings) + ' ' + page + ' ' + t('of', settings) + ' ' + pages),
    React.createElement('button', { onClick: () => onChange(Math.min(pages, page + 1)), disabled: page >= pages, className: btn }, t('next', settings) + ' \u2192')
  );
}
