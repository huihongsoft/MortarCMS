import React from 'react';
import CommentLike from './CommentLike';
import { gravatarUrl } from '../lib/gravatar';
import { t } from '../lib/i18n';

// One comment plus its replies, recursively. Themes own the styling (they pass a
// class map) while the behaviour — nesting, the like button, the reply button —
// lives here, so a reply to a reply shows up in every theme that renders
// comments instead of being dropped at the second level.
export interface CommentClasses {
  /** Wrapper for one comment (card / row). */
  item: string;
  /** Wrapper around a comment's replies (indent + connector). */
  nested: string;
  avatar: string;
  avatarSmall: string;
  author: string;
  date: string;
  body: string;
  reply: string;
  /** 'initial' renders the author's first letter in a coloured circle instead
   *  of a gravatar image (softstore / aurora style). Defaults to 'gravatar'. */
  avatarMode?: 'gravatar' | 'initial';
}

const INDENT_LIMIT = 3;   // deeper threads stop indenting further (server caps depth too)

export default function CommentThread({ comment, classes, settings, onReply, depth = 0 }: {  comment: any;
  classes: CommentClasses;
  settings: any;
  onReply?: (c: any) => void;
  depth?: number;
}): any {
  const children: any[] = Array.isArray(comment.children) ? comment.children : [];
  const small = depth > 0;
  const avatarCls = small ? classes.avatarSmall : classes.avatar;
  const avatar = classes.avatarMode === 'initial'
    ? React.createElement('div', { className: avatarCls }, (comment.author || '?')[0].toUpperCase())
    : React.createElement('img', { src: gravatarUrl(comment.email || ''), alt: '', className: avatarCls, loading: 'lazy' });
  return React.createElement(React.Fragment, null,
    React.createElement('div', { className: classes.item },
      React.createElement('div', { className: 'flex items-center gap-2.5 mb-2' },
        avatar,
        React.createElement('div', null,
          React.createElement('p', { className: classes.author }, comment.author),
          React.createElement('p', { className: classes.date }, new Date(comment.createdAt).toLocaleDateString()))),
      React.createElement('p', { className: classes.body }, comment.content),
      React.createElement('div', { className: 'mt-2 flex items-center gap-3' },
        React.createElement(CommentLike, { commentId: comment.id, initial: comment.likes }),
        onReply && React.createElement('button', {
          type: 'button',
          onClick: () => onReply(comment),
          className: classes.reply,
        }, t('reply', settings)))),
    children.length > 0 && React.createElement('div', { className: depth < INDENT_LIMIT ? classes.nested : '' },
      children.map((child: any) => React.createElement(CommentThread, {
        key: child.id, comment: child, classes, settings, onReply,
        depth: depth < INDENT_LIMIT ? depth + 1 : depth,
      })))
  );
}

// "Replying to @name" strip shown above the comment form. Themes render it when
// a reply is in progress; the form itself stays in one place.
export function CommentReplyBanner({ replyTo, cancelReply, settings, className }: {
  replyTo: { id: string; author: string } | null;
  cancelReply?: () => void;
  settings: any;
  className?: string;
}): any {
  if (!replyTo) return null;
  return React.createElement('div', {
    className: 'flex items-center justify-between gap-3 px-3 py-2 rounded-lg bg-primary-50 text-sm text-primary-800 dark:bg-primary-900/30 dark:text-primary-200 ' + (className || ''),
  },
    React.createElement('span', null, t('replying to', settings) + ' @' + replyTo.author),
    cancelReply && React.createElement('button', { type: 'button', onClick: cancelReply, className: 'text-xs underline hover:no-underline' }, t('cancel reply', settings))
  );
}
