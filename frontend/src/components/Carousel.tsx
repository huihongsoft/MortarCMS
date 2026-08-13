import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { t } from '../lib/i18n';

// Carousel item: image + optional title/link (from the admin homepage banner
// settings, or the [carousel] shortcode)
export interface CarouselItem {
  image: string;
  title?: string;
  link?: string;
  alt?: string;
}

// Modern hero carousel: auto-play, fade/slide, dots + arrows, pause on hover
export default function Carousel({ items, settings }: { items: CarouselItem[]; settings?: Record<string, string> }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (items.length <= 1) return;
    timerRef.current = setInterval(() => {
      setIndex(i => (i + 1) % items.length);
    }, 5000);
    return () => clearInterval(timerRef.current);
  }, [items.length, paused]);

  if (!items || items.length === 0) return null;
  const cur = items[index % items.length];
  const go = (i: number) => setIndex((i + items.length) % items.length);

  const img = (item: CarouselItem) =>
    React.createElement('img', {
      src: item.image,
      alt: item.alt || item.title || '',
      className: 'w-full h-full object-cover',
      loading: index === 0 ? 'eager' : 'lazy',
      decoding: 'async',
    });

  const body = cur.link
    ? React.createElement(Link, { to: cur.link, className: 'block w-full h-full' }, img(cur))
    : img(cur);

  return React.createElement('div', {
    className: 'relative group rounded-2xl overflow-hidden shadow-xl shadow-gray-900/10 bg-gray-100',
    onMouseEnter: () => { setPaused(true); if (timerRef.current) clearInterval(timerRef.current); },
    onMouseLeave: () => setPaused(false),
  },
    React.createElement('div', { className: 'relative aspect-[21/9] sm:aspect-[21/8]' },
      body,
      // gradient overlay for legibility
      React.createElement('div', { className: 'absolute inset-0 bg-gradient-to-t from-gray-900/50 via-transparent to-transparent pointer-events-none' }),
      cur.title && React.createElement('div', { className: 'absolute bottom-0 left-0 right-0 p-6 sm:p-8' },
        React.createElement('h2', { className: 'text-xl sm:text-3xl font-bold text-white tracking-tight drop-shadow-sm' }, cur.title)),
      // arrows
      items.length > 1 && React.createElement(React.Fragment, null,
        React.createElement('button', {
          onClick: () => go(index - 1),
          className: 'absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 backdrop-blur text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/25',
          'aria-label': t('previous'),
        }, React.createElement(ChevronLeft, { size: 20 })),
        React.createElement('button', {
          onClick: () => go(index + 1),
          className: 'absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 backdrop-blur text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/25',
          'aria-label': t('next'),
        }, React.createElement(ChevronRight, { size: 20 })),
      ),
    ),
    // dots
    items.length > 1 && React.createElement('div', { className: 'absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5' },
      items.map((_, i) => React.createElement('button', {
        key: i,
        onClick: () => go(i),
        className: 'w-2 h-2 rounded-full transition-all ' + (i === index ? 'bg-white w-5' : 'bg-white/40 hover:bg-white/70'),
        'aria-label': t('slide') + ' ' + (i + 1),
      })),
    ),
  );
}
