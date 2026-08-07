import React, { useEffect, useState } from 'react';
import api from '../lib/api';

export default function CommentBadge() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const fetch = () => api.get('/comments/admin?status=pending&limit=1').then(r => setCount(r.data.total)).catch(() => {});
    fetch();
    const interval = setInterval(fetch, 60000);
    return () => clearInterval(interval);
  }, []);
  if (count === 0) return null;
  return React.createElement('span', { className: 'ml-auto bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center' }, count > 99 ? '99+' : '' + count);
}
