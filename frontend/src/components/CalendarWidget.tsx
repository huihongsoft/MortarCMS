import Widget from './Widget';
import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar as CalendarIcon } from 'lucide-react';
import { t, getSiteLang } from '../lib/i18n';
import { renderNow } from '../lib/ssr';

// Monthly calendar (WordPress-style): days link to the monthly archive.
// The clock is the render-time one (lib/ssr.ts): reading `new Date()` here would
// stamp a different month/day on the client than the server rendered.
export default function CalendarWidget() {
  const now = new Date(renderNow());
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth(); // 0-based
  const firstDay = new Date(Date.UTC(year, month, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const today = now.getUTCDate();
  const weekdayNames = getSiteLang() === 'zh' ? ['日', '一', '二', '三', '四', '五', '六'] : ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const cells: React.ReactNode[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(React.createElement('div', { key: 'b' + i }));
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(React.createElement(Link, {
      key: d,
      to: '/archive/' + year + '/' + String(month + 1).padStart(2, '0'),
      className: 'flex items-center justify-center h-7 text-xs rounded ' + (d === today ? 'bg-primary-600 text-white font-medium' : 'text-gray-600 hover:bg-gray-100'),
      title: t('view monthly archive'),
    }, d));
  }
  return React.createElement(Widget, { title: t('calendar'), icon: CalendarIcon },
    React.createElement('div', { className: 'grid grid-cols-7 gap-0.5 text-center' },
      weekdayNames.map((w, i) => React.createElement('div', { key: i, className: 'text-[10px] text-gray-400 py-1' }, w)),
      cells
    )
  );
}
