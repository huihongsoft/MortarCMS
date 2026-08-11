import React, { useEffect, useState, RefObject } from 'react';
import { List } from 'lucide-react';
import { t } from '../lib/i18n';

interface TocItem { id: string; text: string; level: number }

function slugify(text: string): string {
  return text.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9\u4e00-\u9fa5-]/g, '').slice(0, 80);
}

// Table of contents built from the rendered content (h2/h3 headings).
// Assigns stable ids to headings so the links scroll correctly.
export default function Toc({ containerRef, settings }: { containerRef: RefObject<HTMLElement | null>; settings?: Record<string, string> }) {
  const [items, setItems] = useState<TocItem[]>([]);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const heads = el.querySelectorAll('h2, h3');
    const list: TocItem[] = [];
    const used = new Set<string>();
    heads.forEach((h) => {
      const text = (h.textContent || '').trim();
      if (!text) return;
      let id = h.id || slugify(text);
      if (!id) id = 'sec-' + list.length;
      if (used.has(id)) id = id + '-' + list.length;
      used.add(id);
      h.id = id;
      list.push({ id, text, level: h.tagName === 'H2' ? 2 : 3 });
    });
    setItems(list);
  }, [containerRef]);

  if (items.length < 3) return null;

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return React.createElement('div', { className: 'mb-8 rounded-xl border border-gray-100 bg-gray-50/70 overflow-hidden' },
    React.createElement('button', {
      onClick: () => setOpen(!open),
      className: 'w-full flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-gray-800 hover:bg-gray-100/80 transition-colors',
    },
      React.createElement(List, { size: 15, className: 'text-gray-400' }),
      t('table of contents', settings || {}),
      React.createElement('span', { className: 'ml-auto text-gray-400 text-xs' }, open ? '\u25B2' : '\u25BC')
    ),
    open && React.createElement('nav', { className: 'px-2 pb-2 max-h-64 overflow-y-auto' },
      items.map((it) =>
        React.createElement('button', {
          key: it.id,
          onClick: () => scrollTo(it.id),
          className: 'w-full text-left px-3 py-1.5 rounded-lg text-sm hover:bg-gray-100 transition-colors ' + (it.level === 3 ? 'pl-7 text-gray-500' : 'text-gray-800 font-medium'),
        }, it.text)
      )
    )
  );
}
