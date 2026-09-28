import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Folder, Clock, MessageSquare, User, Eye } from 'lucide-react';
import Breadcrumbs from '../../components/Breadcrumbs';
import CommentThread, { CommentReplyBanner, CommentClasses } from '../../components/CommentThread';
import Toc from '../../components/Toc';
import { cdnUrl, cdnHtml } from '../../lib/cdn';
import { embedContent } from '../../lib/embed';
import { sanitizeCss } from '../../lib/safeCss';
import { readingTime } from '../../lib/time';
import { t } from '../../lib/i18n';
import { purify } from '../../lib/purify';
import { SideTabs, NoticeBar, TagPill, formatDate } from './Shared';

// Software detail page in huirj style: white content block on a light-gray
// page, breadcrumb, meta bar, cover, prose content, tags, comments.
export default function SoftstorePostLayout(props: any) {
  const { settings, post, comments, submitted, commentForm, submitComment, setCommentForm, commentError, slug: _slug, replyTo, startReply, cancelReply } = props;
  const contentRef = useRef<HTMLDivElement>(null);
  const author = post.author;
  const category = post.categories?.[0];
  const inputCls = 'w-full px-3.5 py-2.5 border border-[#ddd] rounded text-sm outline-none focus:border-primary-600 bg-white';

  const commentClasses: CommentClasses = {
    item: 'py-5 border-b border-[#eee] last:border-b-0',
    avatar: 'w-8 h-8 rounded-full bg-[#f1f1f1] flex items-center justify-center text-sm font-medium text-[#888]',
    avatarSmall: 'w-7 h-7 rounded-full bg-[#f1f1f1] flex items-center justify-center text-xs font-medium text-[#888]',
    author: 'font-medium text-sm text-[#333]',
    date: 'text-xs text-[#999]',
    body: 'text-sm text-[#555] leading-relaxed',
    reply: 'text-xs text-[#999] hover:text-primary-600',
    avatarMode: 'initial',
  };
  const commentList = comments.map((c: any) =>
    React.createElement(CommentThread, { key: c.id, comment: c, classes: commentClasses, settings, onReply: startReply })
  );

  const commentFormEl = React.createElement('form', { id: 'comment-form', onSubmit: submitComment, noValidate: true, className: 'space-y-3 mt-4 p-5 bg-[#f8f8f9] border border-[#eee] rounded' },
    React.createElement('h4', { className: 'text-sm font-semibold text-[#333]' }, replyTo ? t('leave a reply', settings) : t('leave a comment', settings)),
    React.createElement(CommentReplyBanner, { replyTo, cancelReply, settings }),
    commentError && React.createElement('div', { role: 'alert', className: 'p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded' }, commentError),
    React.createElement('input', { type: 'text', name: 'website_url', style: { position: 'absolute', left: '-9999px' }, tabIndex: -1, autoComplete: 'off' }),
    React.createElement('div', { className: 'grid grid-cols-1 sm:grid-cols-2 gap-3' },
      React.createElement('input', { value: commentForm.author, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setCommentForm({ ...commentForm, author: e.target.value }), placeholder: t('name', settings), 'aria-label': t('name', settings), className: inputCls, autoComplete: 'name' }),
      React.createElement('input', { value: commentForm.email, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setCommentForm({ ...commentForm, email: e.target.value }), placeholder: t('email', settings), type: 'email', 'aria-label': t('email', settings), className: inputCls, autoComplete: 'email' })),
    React.createElement('textarea', { value: commentForm.content, onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => setCommentForm({ ...commentForm, content: e.target.value }), placeholder: t('your comment', settings) + '...', 'aria-label': t('your comment', settings), className: inputCls, rows: 3, required: true }),
    React.createElement('button', { type: 'submit', className: 'w-full py-2.5 rounded text-white text-sm font-medium transition-opacity hover:opacity-90', style: { background: 'var(--primary-color, #5066e1)' } }, t('submit comment', settings))
  );

  const meta = (icon: React.ReactNode, children: React.ReactNode) =>
    React.createElement('span', { className: 'flex items-center gap-1.5' }, icon, children);

  // The reference page has no background of its own (white body), so the cards
  // read by their 1px #dedede border — that is what removes the header/content
  // colour step entirely, instead of blending two different colours.
  const breadcrumb = settings.theme_show_breadcrumb !== '0';

  return React.createElement('div', { className: 'min-h-screen bg-[#fff]' },
    React.createElement('div', { className: 'max-w-6xl mx-auto px-4' },
      // reference: the notice strip sits at the top of every page's content
      React.createElement(NoticeBar, { settings }),
      // Article and sidebar share the first grid row, so the sidebar cell is
      // exactly as tall as the article card and SideTabs (fill) can stretch to
      // match it. Comments go on the next row, spanning the content columns —
      // keeping them inside the article's cell was what made the sidebar stop
      // short: its cell then covered article + comments.
      React.createElement('div', { className: 'grid grid-cols-1 lg:grid-cols-12 gap-4' },
      React.createElement('div', { className: 'lg:col-span-8 min-w-0' },
        React.createElement('article', { className: 'bg-white rounded-[5px] border border-[#dedede] px-[25px] py-[20px]' },
          // Reference .post_bread lives inside the article card, under the title
          // area's top edge, and is separated by a bottom border.
          breadcrumb && React.createElement('div', { className: 'border-b border-[#dedede] pb-[10px] mb-[8px] h-[34px] leading-[24px] text-[15px] text-[#696969] overflow-hidden' },
            React.createElement(Breadcrumbs, { items: [
              { label: t('home', settings), to: '/' },
              ...(category ? [{ label: category.name, to: '/category/' + category.slug }] : []),
              { label: post.title || t('post', settings) },
            ] })),
          React.createElement('h1', { className: 'font-bold text-[#1d1d1d] leading-[34px] tracking-tight mb-4', style: { fontSize: 'var(--heading-max-size, 24px)' } },
            post.format && post.format !== 'standard' ? React.createElement('span', { className: 'block text-xs font-normal text-[#999] mb-1 uppercase tracking-wider' }, post.format) : null,
            post.title),
          // reference .post-meta: 15px/500 #666, date first, then author; views and
          // the comment count follow (shown even at 0). It carries a dashed rule
          // underneath rather than the boxed border this used to have.
          React.createElement('div', { className: 'flex flex-wrap items-center gap-x-[10px] gap-y-1 text-[15px] font-medium text-[#666] border-b border-dashed border-[#dedede] pb-[6px] mb-[12px]' },
            meta(React.createElement(Calendar, { size: 15 }), formatDate(post.publishedAt || post.createdAt)),
            author?.username && meta(React.createElement(User, { size: 15 }), React.createElement(Link, { to: '/author/' + author.username, className: 'hover:text-primary-600' }, author.username)),
            category && meta(React.createElement(Folder, { size: 15 }), React.createElement(Link, { to: '/category/' + category.slug, className: 'hover:text-primary-600' }, category.name)),
            meta(React.createElement(Eye, { size: 15 }), String(post.views || 0)),
            meta(React.createElement(MessageSquare, { size: 15 }), String(post.commentCount || 0)),
            meta(React.createElement(Clock, { size: 15 }), readingTime(post.content || ''))),
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
          // Body copy follows the reference's base type: 15px / 26px / #666
          // (prose-lg rendered 18px). The utilities win over .prose's own
          // font-size because Tailwind emits them after the plugin layer.
          React.createElement('div', { ref: contentRef, className: 'prose prose-gray max-w-none text-[15px] leading-[26px] text-[#666]', dangerouslySetInnerHTML: { __html: cdnHtml(embedContent(purify(post.content || '')), settings) } }),
          // inline flow (like the tag bar) so the label and the pills share a
          // baseline — a flex row would centre the pills' 10px bottom margin box
          // and float them off the label
          post.tags?.length > 0 && React.createElement('div', { className: 'mt-8 pt-6 border-t border-[#eee]' },
            React.createElement('span', { className: 'text-[18px] font-bold text-[#666] mr-[5px]' }, t('tags', settings) + ' :'),
            post.tags.map((tg: any) => tg.slug ? React.createElement(TagPill, { key: tg.tagId, tag: tg, shrink: false }) : null)
          ),
        )),
        // Sidebar — same grid row as the article (col-lg-4, as the reference),
        // stretched to the article's height by SideTabs' fill.
        React.createElement('aside', { className: 'lg:col-span-4 min-w-0 flex flex-col' },
          React.createElement(SideTabs, { settings, fill: true })
        ),
        // Comments: next row, content columns only.
        React.createElement('div', { className: 'lg:col-span-8 min-w-0' },
          React.createElement('section', { className: 'bg-white rounded-[5px] border border-[#dedede] px-[25px] py-[20px]' },
            React.createElement('h3', { className: 'text-[16px] font-medium text-[#333] mb-4' }, t('comments', settings) + (comments.length ? ' (' + comments.length + ')' : '')),
            comments.length === 0 && !submitted && React.createElement('p', { className: 'text-sm text-[#999] mb-4' }, t('no comments yet', settings)),
            commentList,
            submitted ? React.createElement('p', { className: 'text-sm text-green-600' }, t('comment submitted and pending review', settings)) : commentFormEl
          )
        )
      )
    )
  );
}
