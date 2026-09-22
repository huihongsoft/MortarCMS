import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Eye } from 'lucide-react';
import Breadcrumbs from '../../components/Breadcrumbs';
import Toc from '../../components/Toc';
import { cdnHtml } from '../../lib/cdn';
import { embedContent } from '../../lib/embed';
import { sanitizeCss } from '../../lib/safeCss';
import DOMPurify from 'dompurify';
import { t } from '../../lib/i18n';
import { NoticeBar, SideTabs, formatDate } from './Shared';

// Static page in the reference's style: the post page's card without the article
// meta/tags/comments, plus the same rail. Pages are not part of the themed
// listings, but a front page (Settings → your homepage displays → a static page)
// and /page/<slug> land here, and they used to render inside the *default*
// theme's layout — a different design wrapped in softstore's header and footer.
export default function SoftstorePageLayout(props: any) {
  const { settings = {}, page } = props;
  const contentRef = useRef<HTMLDivElement>(null);
  const breadcrumb = settings.theme_show_breadcrumb !== '0';

  return React.createElement('div', { className: 'min-h-screen bg-[#fff]' },
    React.createElement('div', { className: 'max-w-6xl mx-auto px-4' },
      React.createElement(NoticeBar, { settings }),
      React.createElement('div', { className: 'grid grid-cols-1 lg:grid-cols-12 gap-4' },
        React.createElement('div', { className: 'lg:col-span-8 min-w-0' },
          React.createElement('article', { className: 'bg-white rounded-[5px] border border-[#dedede] px-[25px] py-[20px]' },
            breadcrumb && React.createElement('div', { className: 'border-b border-[#dedede] pb-[10px] mb-[8px] h-[34px] leading-[24px] text-[15px] text-[#696969] overflow-hidden' },
              // ('page' in the dictionary is the pagination word "第", so the
              // crumb falls back to omitting the last item, not to that.)
              React.createElement(Breadcrumbs, { items: [
                { label: t('home', settings), to: '/' },
                ...(page?.title ? [{ label: page.title }] : []),
              ] })),
            React.createElement('h1', { className: 'font-bold text-[#1d1d1d] leading-[34px] tracking-tight mb-4', style: { fontSize: 'var(--heading-max-size, 24px)' } },
              page?.title),
            (page?.publishedAt || page?.createdAt) && React.createElement('div', { className: 'flex flex-wrap items-center gap-x-[10px] text-[15px] font-medium text-[#666] border-b border-dashed border-[#dedede] pb-[6px] mb-[12px]' },
              React.createElement('span', { className: 'flex items-center gap-1.5' }, React.createElement(Calendar, { size: 15 }), formatDate(page.publishedAt || page.createdAt)),
              page.views > 0 && React.createElement('span', { className: 'flex items-center gap-1.5' }, React.createElement(Eye, { size: 15 }), String(page.views))),
            page?.meta?._visual_css && React.createElement('style', { dangerouslySetInnerHTML: { __html: sanitizeCss(page.meta._visual_css) } }),
            React.createElement(Toc, { containerRef: contentRef, settings }),
            // Same body typography as the post page (reference base type).
            React.createElement('div', { ref: contentRef, className: 'prose prose-gray max-w-none text-[15px] leading-[26px] text-[#666]', dangerouslySetInnerHTML: { __html: cdnHtml(embedContent(DOMPurify.sanitize(page?.content || '')), settings) } })
          )),
        React.createElement('aside', { className: 'lg:col-span-4 min-w-0 flex flex-col' },
          React.createElement(SideTabs, { settings, fill: true }))
      )
    )
  );
}
