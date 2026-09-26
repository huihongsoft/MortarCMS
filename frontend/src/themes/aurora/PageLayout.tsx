import React, { useRef } from 'react';
import Breadcrumbs from '../../components/Breadcrumbs';
import { t } from '../../lib/i18n';
import { cdnHtml } from '../../lib/cdn';
import { embedContent } from '../../lib/embed';
import { sanitizeCss } from '../../lib/safeCss';
import { purify } from '../../lib/purify';

// Aurora page: centered, clean, minimal
export default function PageLayout(props: any) {
  const { settings, page, submitted: _submitted, commentForm: _commentForm, setCommentForm: _setCommentForm, submitComment: _submitComment, commentError: _commentError } = props;
  const contentRef = useRef<HTMLDivElement>(null);

  return React.createElement('div', { className: 'max-w-5xl mx-auto px-6 py-14' },
    settings.theme_show_breadcrumb !== '0' && React.createElement(Breadcrumbs, { items: [{ label: t('home', settings), to: '/' }, { label: page.title || t('page', settings) }] }),
    React.createElement('h1', { className: 'font-bold tracking-tight text-gray-900 leading-tight mb-8', style: { fontSize: 'var(--heading-max-size, 36px)' } }, page.title),
    page.meta?._visual_css && React.createElement('style', { dangerouslySetInnerHTML: { __html: sanitizeCss(page.meta._visual_css) } }),
    React.createElement('div', { ref: contentRef, className: 'prose prose-gray prose-lg max-w-none', dangerouslySetInnerHTML: { __html: cdnHtml(embedContent(purify(page.content || '')), settings) } }),
  );
}
