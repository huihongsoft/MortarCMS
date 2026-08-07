import React from 'react';
import { Link } from 'react-router-dom';
import Breadcrumbs from '../../components/Breadcrumbs';
import { t } from '../../lib/i18n';
import DOMPurify from 'dompurify';

// Default single-page template
export default function PageLayout(props: any) {
  const { settings, page } = props;
  if (!page) return null;

  return React.createElement('div', { className: 'max-w-3xl mx-auto px-4 py-8' },
    React.createElement(Breadcrumbs, { items: [{ label: t('home', settings), to: '/' }, { label: page.title }] }),
    React.createElement('h1', { className: 'text-3xl font-bold text-gray-900 my-6' }, page.title),
    React.createElement('div', { className: 'prose prose-gray max-w-none', dangerouslySetInnerHTML: { __html: DOMPurify.sanitize(page.content || '') } }),
    page.parent && React.createElement(Link, { to: '/page/' + page.parent.slug, className: 'inline-block mt-8 text-sm text-gray-500 hover:text-primary-600' }, '\u2190 ' + page.parent.title)
  );
}
