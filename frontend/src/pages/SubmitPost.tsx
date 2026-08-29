import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Send } from 'lucide-react';
import api from '../lib/api';
import { t } from '../lib/i18n';
import useSEO from '../hooks/useSEO';

export default function SubmitPost() {
  useSEO({ title: t('submit a post'), url: '/submit-post', noindex: true });
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem('mortar_token'));
  const [form, setForm] = useState({ title: '', excerpt: '', content: '' });
  const [categories, setCategories] = useState<any[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/categories').then(r => setCategories(r.data || [])).catch(() => {});
  }, []);

  function toggleCat(id: string) {
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!form.title.trim()) { setError(t('post title required')); return; }
    if (!form.content.trim()) { setError(t('post content required')); return; }
    setLoading(true);
    try {
      await api.post('/frontend/submit-post', { title: form.title, excerpt: form.excerpt, content: form.content, categoryIds: selected });
      setDone(true);
    } catch (err: any) {
      setError(err.response?.data?.error || t('submission failed'));
    } finally { setLoading(false); }
  }

  if (!loggedIn) {
    return React.createElement('div', { className: 'max-w-md mx-auto px-4 py-16 text-center' },
      React.createElement('h1', { className: 'text-2xl font-bold text-gray-900 mb-4' }, t('submit a post')),
      React.createElement('p', { className: 'text-sm text-gray-500 mb-6' }, t('login to submit')),
      React.createElement(Link, { to: '/login', className: 'btn-primary inline-flex' }, t('sign in')));
  }

  if (done) {
    return React.createElement('div', { className: 'max-w-md mx-auto px-4 py-16 text-center' },
      React.createElement('div', { className: 'w-14 h-14 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center' },
        React.createElement(Send, { size: 24, className: 'text-green-600' })),
      React.createElement('h1', { className: 'text-xl font-bold text-gray-900 mb-3' }, t('submission received')),
      React.createElement('p', { className: 'text-sm text-gray-500 mb-6' }, t('your submission is pending review')),
      React.createElement(Link, { to: '/my-posts', className: 'btn-secondary inline-flex' }, t('my submissions')));
  }

  return React.createElement('div', { className: 'max-w-2xl mx-auto px-4 py-12' },
    React.createElement('h1', { className: 'text-2xl font-bold text-gray-900 mb-2' }, t('submit a post')),
    React.createElement('p', { className: 'text-sm text-gray-500 mb-8' }, t('submit post description')),
    React.createElement('form', { onSubmit: handleSubmit, className: 'space-y-4' },
      error && React.createElement('div', { role: 'alert', className: 'p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg' }, error),
      React.createElement('div', null,
        React.createElement('label', { htmlFor: 'sp-title', className: 'block text-sm font-medium text-gray-700 mb-1' }, t('post title')),
        React.createElement('input', { id: 'sp-title', value: form.title, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, title: e.target.value }), className: 'input-field', required: true, maxLength: 200 })
      ),
      React.createElement('div', null,
        React.createElement('label', { htmlFor: 'sp-excerpt', className: 'block text-sm font-medium text-gray-700 mb-1' }, t('excerpt (optional)')),
        React.createElement('textarea', { id: 'sp-excerpt', value: form.excerpt, onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => setForm({ ...form, excerpt: e.target.value }), className: 'input-field', rows: 2, maxLength: 300 })
      ),
      React.createElement('div', null,
        React.createElement('label', { htmlFor: 'sp-content', className: 'block text-sm font-medium text-gray-700 mb-1' }, t('post content')),
        React.createElement('textarea', { id: 'sp-content', value: form.content, onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => setForm({ ...form, content: e.target.value }), className: 'input-field', rows: 12, required: true })
      ),
      categories.length > 0 && React.createElement('div', null,
        React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-2' }, t('category')),
        React.createElement('div', { className: 'flex flex-wrap gap-2' },
          categories.map(c =>
            React.createElement('label', { key: c.id, className: 'flex items-center gap-1.5 text-sm text-gray-700 cursor-pointer px-3 py-1.5 rounded-lg border ' + (selected.includes(c.id) ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 hover:border-gray-300') },
              React.createElement('input', { type: 'checkbox', checked: selected.includes(c.id), onChange: () => toggleCat(c.id), className: 'accent-primary-600' }), c.name))
        )
      ),
      React.createElement('button', { type: 'submit', disabled: loading, className: 'btn-primary justify-center' }, React.createElement(Send, { size: 16 }), loading ? t('loading') : t('submit for review')),
      React.createElement('p', { className: 'text-xs text-gray-400' }, t('submit post note'))
    )
  );
}
