import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { t } from '../lib/i18n';

export default function SearchWidget() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) navigate('/search?q=' + encodeURIComponent(query.trim()));
  };

  return React.createElement('div', { className: 'rounded-lg border border-gray-200 p-4' },
    React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider' }, t('search')),
    React.createElement('form', { onSubmit: handleSubmit, className: 'flex gap-2' },
      React.createElement('input', {
        type: 'text',
        value: query,
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value),
        placeholder: t('search placeholder'),
        className: 'flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none',
      }),
      React.createElement('button', {
        type: 'submit',
        className: 'px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors',
      }, React.createElement(Search, { size: 16 }))
    )
  );
}
