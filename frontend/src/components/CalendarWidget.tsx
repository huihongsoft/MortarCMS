import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar as CalendarIcon } from 'lucide-react';
import { t } from '../lib/i18n';

// Monthly calendar (WordPress-style): days link to the monthly archive
export default function CalendarWidget() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-based
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = now.getDate();
  const weekdayNames = ['日', '一', '二', '三', '四', '五', '六'];
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
  return React.createElement('div', { className: 'rounded-lg border border-gray-200 p-4' },
    React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider flex items-center gap-1.5' }, React.createElement(CalendarIcon, { size: 14, className: 'text-gray-400' }), t('calendar')),
    React.createElement('div', { className: 'grid grid-cols-7 gap-0.5 text-center' },
      weekdayNames.map((w, i) => React.createElement('div', { key: i, className: 'text-[10px] text-gray-400 py-1' }, w)),
      cells
    )
  );
}
