import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Folder, Tag, Clock, MessageSquare, User } from 'lucide-react';
import Breadcrumbs from '../../components/Breadcrumbs';
import Toc from '../../components/Toc';
import { cdnUrl, cdnHtml } from '../../lib/cdn';
import { embedContent } from '../../lib/embed';
import { sanitizeCss } from '../../lib/safeCss';
import { timeAgo, readingTime, useTimeTick } from '../../lib/time';
import { t } from '../../lib/i18n';
import DOMPurify from 'dompurify';
import { SideTabs } from './Shared';

// Software detail page in huirj style: white content block on a light-gray
// page, breadcrumb, meta bar, cover, prose content, tags, comments.
export default function SoftstorePostLayout(props: any) {
  useTimeTick();
  const { settings, post, comments, submitted, commentForm, submitComment, setCommentForm, commentError, slug } = props;
  const contentRef = useRef<HTMLDivElement>(null);
  const author = post.author;
  const category = post.categories?.[0];
  const inputCls = 'w-full px-3.5 py-2.5 border border-[#ddd] rounded text-sm outline-none focus:border-[#5066e1] bg-white';

  const commentList = comments.map((c: any) =>
    React.createElement('div', { key: c.id, className: 'py-5 border-b border-[#eee] last:border-b-0' },
      React.createElement('div', { className: 'flex items-center gap-2.5 mb-2' },
        React.createElement('div', { className: 'w-8 h-8 rounded-full bg-[#f1f1f1] flex items-center justify-center text-sm font-medium text-[#888]' }, (c.author || '?')[0].toUpperCase()),
        React.createElement('div', null,
          React.createElement('p', { className: 'font-medium text-sm text-[#333]' }, c.author),
          React.createElement('p', { className: 'text-xs text-[#999]' }, new Date(c.createdAt).toLocaleDateString()))),
      React.createElement('p', { className: 'text-sm text-[#555] leading-relaxed' }, c.content),
      (c.children || []).map((child: any) =>
        React.createElement('div', { key: child.id, className: 'ml-8 mt-3 pl-4 border-l-2 border-[#eee]' },
          React.createElement('p', { className: 'font-medium text-sm text-[#444] mb-1' }, child.author),
          React.createElement('p', { className: 'text-sm text-[#666]' }, child.content)))
    )
  );

  const commentFormEl = React.createElement('form', { onSubmit: submitComment, noValidate: true, className: 'space-y-3 mt-4 p-5 bg-[#f8f8f9] border border-[#eee] rounded' },
    React.createElement('h4', { className: 'text-sm font-semibold text-[#333]' }, t('leave a comment', settings)),
    commentError && React.createElement('div', { role: 'alert', className: 'p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded' }, commentError),
    React.createElement('input', { type: 'text', name: 'website_url', style: { position: 'absolute', left: '-9999px' }, tabIndex: -1, autoComplete: 'off' }),
    React.createElement('div', { className: 'grid grid-cols-1 sm:grid-cols-2 gap-3' },
      React.createElement('input', { value: commentForm.author, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setCommentForm({ ...commentForm, author: e.target.value }), placeholder: t('name', settings), 'aria-label': t('name', settings), className: inputCls, autoComplete: 'name' }),
      React.createElement('input', { value: commentForm.email, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setCommentForm({ ...commentForm, email: e.target.value }), placeholder: t('email', settings), type: 'email', 'aria-label': t('email', settings), className: inputCls, autoComplete: 'email' })),
    React.createElement('textarea', { value: commentForm.content, onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => setCommentForm({ ...commentForm, content: e.target.value }), placeholder: t('your comment', settings) + '...', 'aria-label': t('your comment', settings), className: inputCls, rows: 3, required: true }),
    React.createElement('button', { type: 'submit', className: 'w-full py-2.5 rounded text-white text-sm font-medium transition-opacity hover:opacity-90', style: { background: '#5066e1' } }, t('submit comment', settings))
  );

  const meta = (icon: React.ReactNode, children: React.ReactNode) =>
    React.createElement('span', { className: 'flex items-center gap-1.5' }, icon, children);

  return React.createElement('div', { className: 'bg-[#f5f5f5] min-h-screen' },
    React.createElement('div', { className: 'max-w-6xl mx-auto px-4 py-4 grid grid-cols-1 lg:grid-cols-3 gap-4' },
      React.createElement('div', { className: 'lg:col-span-2 min-w-0' },
        React.createElement(Breadcrumbs, { items: [
          { label: t('home', settings), to: '/' },
          ...(category ? [{ label: category.name, to: '/category/' + category.slug }] : []),
          { label: post.title || t('post', settings) },
        ] }),
        React.createElement('article', { className: 'bg-white rounded-lg border border-[#dedede] mt-3 p-5 sm:p-8' },
          React.createElement('h1', { className: 'font-bold text-[#222] leading-tight tracking-tight mb-4', style: { fontSize: 'var(--heading-max-size, 26px)' } },
            post.format && post.format !== 'standard' ? React.createElement('span', { className: 'block text-xs font-normal text-[#999] mb-1 uppercase tracking-wider' }, post.format) : null,
            post.title),
          React.createElement('div', { className: 'flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[#999] border-y border-[#eee] py-3 mb-6' },
            meta(React.createElement(User, { size: 14 }), React.createElement(Link, { to: '/author/' + (author?.username || ''), className: 'font-medium text-[#555] hover:text-[#5066e1]' }, author?.username)),
            meta(React.createElement(Calendar, { size: 14 }), timeAgo(post.publishedAt || post.createdAt)),
            category && meta(React.createElement(Folder, { size: 14 }), React.createElement(Link, { to: '/category/' + category.slug, className: 'hover:text-[#5066e1]' }, category.name)),
            meta(React.createElement(Clock, { size: 14 }), readingTime(post.content || '')),
            post.commentCount > 0 && meta(React.createElement(MessageSquare, { size: 14 }), post.commentCount)),
          post.featured && React.createElement('div', { className: 'mb-6' },
            React.createElement('img', {
              src: cdnUrl(post.featured, settings),
              alt: post.title,
              className: 'w-full max-h-96 object-cover rounded-lg',
              loading: 'eager',
              fetchPriority: 'high',
              decoding: 'async',
              srcSet: post.srcset ? Object.entries(post.srcset).map(([w, u]) => (cdnUrl(u as string, settings) as string) + ' ' + w + 'w').join(', ') : undefined,
            })),
          post.meta?._visual_css && React.createElement('style', { dangerouslySetInnerHTML: { __html: sanitizeCss(post.meta._visual_css) } }),
          React.createElement(Toc, { containerRef: contentRef, settings }),
          React.createElement('div', { ref: contentRef, className: 'prose prose-gray prose-lg max-w-none', dangerouslySetInnerHTML: { __html: cdnHtml(embedContent(DOMPurify.sanitize(post.content || '')), settings) } }),
          post.tags?.length > 0 && React.createElement('div', { className: 'flex flex-wrap items-center gap-2 mt-8 pt-6 border-t border-[#eee]' },
            React.createElement(Tag, { size: 15, className: 'text-[#999]' }),
            post.tags.map((tg: any) => tg.slug ? React.createElement(Link, { key: tg.tagId, to: '/tag/' + tg.slug, className: 'px-3 py-1 rounded text-xs bg-[#f5f5f5] text-[#555] hover:bg-[#5066e1] hover:text-white transition-colors' }, tg.name) : null)
          ),
        ),
        React.createElement('section', { className: 'bg-white rounded-lg border border-[#dedede] mt-4 p-5 sm:p-8' },
          React.createElement('h3', { className: 'text-[16px] font-medium text-[#333] mb-4' }, t('comments', settings) + (comments.length ? ' (' + comments.length + ')' : '')),
          comments.length === 0 && !submitted && React.createElement('p', { className: 'text-sm text-[#999] mb-4' }, t('no comments yet', settings)),
          commentList,
          submitted ? React.createElement('p', { className: 'text-sm text-green-600' }, t('comment submitted and pending review', settings)) : commentFormEl
        )
      ),
      React.createElement('aside', { className: 'space-y-4' },
        React.createElement(SideTabs, { settings })
      )
    )
  );
}
