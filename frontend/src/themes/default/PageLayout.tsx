import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import Breadcrumbs from '../../components/Breadcrumbs';
import { t } from '../../lib/i18n';
import DOMPurify from 'dompurify';

// Default single-page template — WordPress-style layout
export default function PageLayout(props: any) {
  const { settings, page } = props;
  if (!page) return null;

  return React.createElement('div', { className: 'max-w-3xl mx-auto px-4 py-8' },
    React.createElement(Breadcrumbs, { items: [{ label: t('home', settings), to: '/' }, { label: page.title }] }),
    React.createElement('h1', { className: 'text-3xl sm:text-4xl font-bold text-gray-900 leading-tight tracking-tight my-8' }, page.title),
    page.meta?._visual_css && React.createElement('style', { dangerouslySetInnerHTML: { __html: page.meta._visual_css } }),
    React.createElement('div', { className: 'prose prose-gray prose-lg max-w-none', dangerouslySetInnerHTML: { __html: DOMPurify.sanitize(page.content || '') } }),
    page.parent && React.createElement(Link, { to: '/page/' + page.parent.slug, className: 'inline-flex items-center gap-1 mt-10 text-sm text-gray-500 hover:text-primary-600' },
      React.createElement(ChevronLeft, { size: 15 }), page.parent.title)
  );
}
