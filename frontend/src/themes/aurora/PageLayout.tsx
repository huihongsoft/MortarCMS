import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft  } from 'lucide-react';
import Breadcrumbs from '../../components/Breadcrumbs';
import { t } from '../../lib/i18n';
import { cdnUrl, cdnHtml } from '../../lib/cdn';
import { embedContent } from '../../lib/embed';
import { sanitizeCss } from '../../lib/safeCss';
import DOMPurify from 'dompurify';

// Aurora page: centered, clean, minimal
export default function PageLayout(props: any) {
  const { settings, page, submitted, commentForm, setCommentForm, submitComment, commentError } = props;
  const contentRef = useRef<HTMLDivElement>(null);

  return React.createElement('div', { className: 'max-w-3xl mx-auto px-6 py-14' },
    React.createElement(Breadcrumbs, { items: [{ label: t('blog', settings), to: '/' }, { label: page.title || t('page', settings) }] }),
    React.createElement('h1', { className: 'text-3xl sm:text-5xl font-bold tracking-tight text-gray-900 leading-tight mb-8' }, page.title),
    page.meta?._visual_css && React.createElement('style', { dangerouslySetInnerHTML: { __html: sanitizeCss(page.meta._visual_css) } }),
    React.createElement('div', { ref: contentRef, className: 'prose prose-gray prose-lg max-w-none', dangerouslySetInnerHTML: { __html: cdnHtml(embedContent(DOMPurify.sanitize(page.content || '')), settings) } }),
  );
}
