import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FileText, File } from 'lucide-react';
import api from '../lib/api';
import { t } from '../lib/i18n';

// Search box with live suggestions (debounced) and full-text search submit
export default function SearchWidget() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const boxRef = useRef<HTMLDivElement>(null);

  // Debounced suggestion fetch
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) { setSuggestions([]); setOpen(false); return; }
    setLoading(true);
    const timer = setTimeout(() => {
      api.get('/posts/suggest', { params: { q } })
        .then(r => { setSuggestions(r.data?.suggestions || []); setOpen(true); })
        .catch(() => { setSuggestions([]); })
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) navigate('/search?q=' + encodeURIComponent(query.trim()));
  };

  const goTo = (s: any) => {
    setOpen(false);
    navigate('/' + s.type + '/' + s.slug);
  };

  return React.createElement('div', { ref: boxRef, className: 'rounded-lg border border-gray-200 p-4 relative' },
    React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider' }, t('search')),
    React.createElement('form', { onSubmit: handleSubmit, className: 'flex gap-2' },
      React.createElement('input', {
        type: 'text',
        value: query,
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value),
        onFocus: () => { if (suggestions.length > 0) setOpen(true); },
        placeholder: t('search placeholder'),
        'aria-label': t('search posts'),
        className: 'flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none',
      }),
      React.createElement('button', {
        type: 'submit',
        className: 'px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors',
      }, React.createElement(Search, { size: 16 }))
    ),
    // Suggestions dropdown
    open && suggestions.length > 0 && React.createElement('div', { className: 'absolute left-4 right-4 top-[calc(100%-8px)] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden' },
      suggestions.map((s: any) =>
        React.createElement('button', {
          key: s.id,
          type: 'button',
          onMouseDown: (e: React.MouseEvent) => { e.preventDefault(); goTo(s); },
          className: 'w-full text-left px-3 py-2.5 flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors',
        },
          React.createElement(s.type === 'page' ? File : FileText, { size: 14, className: 'text-gray-400 shrink-0' }),
          React.createElement('span', { className: 'text-sm text-gray-800 dark:text-gray-100 truncate' }, s.title),
          React.createElement('span', { className: 'ml-auto text-[10px] uppercase text-gray-400 shrink-0' }, s.type)
        )
      )
    ),
    open && loading && suggestions.length === 0 && React.createElement('div', { className: 'absolute left-4 right-4 top-[calc(100%-8px)] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 px-3 py-2 text-xs text-gray-400' }, t('searching') + '…')
  );
}
