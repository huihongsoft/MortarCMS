import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface Crumb { label: string; to?: string; }

export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  return React.createElement('nav', { className: 'flex items-center gap-1 text-sm text-gray-500 mb-6', 'aria-label': 'Breadcrumb' },
    React.createElement(Link, { to: '/', className: 'hover:text-gray-700 flex items-center gap-1' }, React.createElement(Home, { size: 14 })),
    items.map((item, i) => React.createElement(React.Fragment, { key: i },
      React.createElement(ChevronRight, { size: 12, className: 'text-gray-300' }),
      i === items.length - 1 || !item.to
        ? React.createElement('span', { className: 'text-gray-900 font-medium' }, item.label)
        : React.createElement(Link, { to: item.to, className: 'hover:text-gray-700' }, item.label)
    ))
  );
}
