import React, { useEffect, useState } from 'react';
import { ThumbsUp } from 'lucide-react';
import api from '../lib/api';
import { t } from '../lib/i18n';

// Comment like button: one like per browser (localStorage dedup), optimistic
// count update, best-effort (never blocks the page on network errors).
export default function CommentLike({ commentId, initial = 0 }: { commentId: string; initial?: number }) {
  const [likes, setLikes] = useState(initial || 0);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    try {
      const list: string[] = JSON.parse(localStorage.getItem('mortar_liked_comments') || '[]');
      setLiked(list.includes(commentId));
    } catch {}
  }, [commentId]);

  const like = () => {
    if (liked) return;
    setLikes(l => l + 1);
    setLiked(true);
    try {
      const list: string[] = JSON.parse(localStorage.getItem('mortar_liked_comments') || '[]');
      localStorage.setItem('mortar_liked_comments', JSON.stringify([...list, commentId]));
    } catch {}
    api.post('/comments/' + commentId + '/like').then(r => { if (typeof r.data?.likes === 'number') setLikes(r.data.likes); }).catch(() => {});
  };

  return React.createElement('button', {
    onClick: like,
    disabled: liked,
    className: 'inline-flex items-center gap-1 text-xs ' + (liked ? 'text-primary-600' : 'text-gray-400 hover:text-primary-600 transition-colors'),
    title: liked ? t('liked') : t('like'),
  },
    React.createElement(ThumbsUp, { size: 12 }),
    likes > 0 && React.createElement('span', null, likes),
  );
}
