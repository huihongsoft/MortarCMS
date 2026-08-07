import React, { useState, useEffect } from 'react';

export default function ReadingProgress() {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const handler = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setWidth(docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0);
    };
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);
  return React.createElement('div', { className: 'fixed top-0 left-0 h-1 bg-primary-500 z-50 transition-all', style: { width: width + '%' } });
}
