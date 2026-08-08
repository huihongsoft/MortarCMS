import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Bot, User, MessageSquare } from 'lucide-react';
import api from '../lib/api';
import useSEO from '../hooks/useSEO';

export default function ShareView({ settings }: { settings: Record<string, string> }) {
  const { token } = useParams();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.get('/ai/share/' + token).then(r => setData(r.data)).catch(() => setError(true));
  }, [token]);

  useSEO({ title: error ? '分享不存在' : (data ? (data.username || 'AI') + ' 的 AI 对话' : 'AI 对话分享'), url: window.location.origin + '/share/ai/' + token });

  if (error) return React.createElement('div', { className: 'max-w-2xl mx-auto px-4 py-20 text-center' },
    React.createElement('h1', { className: 'text-2xl font-bold text-gray-900 mb-2' }, '分享不存在'),
    React.createElement('p', { className: 'text-gray-500 mb-6' }, '该分享链接可能已失效。'),
    React.createElement(Link, { to: '/', className: 'text-primary-600 text-sm' }, '← 返回首页'));

  if (!data) return React.createElement('div', { className: 'max-w-2xl mx-auto px-4 py-20 text-center' },
    React.createElement('p', { className: 'text-gray-400' }, '加载中...'));

  return React.createElement('div', { className: 'max-w-2xl mx-auto px-4 py-8' },
    React.createElement('div', { className: 'flex items-center justify-between mb-6' },
      React.createElement('div', { className: 'flex items-center gap-2' },
        React.createElement(MessageSquare, { size: 18, className: 'text-primary-600' }),
        React.createElement('h1', { className: 'text-xl font-bold text-gray-900' }, data.username + ' 的 AI 对话'),
      ),
      React.createElement(Link, { to: '/', className: 'text-sm text-gray-400 hover:text-gray-600' }, '← 返回首页'),
    ),
    React.createElement('p', { className: 'text-xs text-gray-400 mb-6' }, '分享于 ' + new Date(data.createdAt).toLocaleString()),
    React.createElement('div', { className: 'space-y-4' },
      (data.messages || []).map((m: any, i: number) => React.createElement('div', { key: i, className: 'flex gap-3 ' + (m.role === 'user' ? 'justify-end' : '') },
        m.role === 'assistant' && React.createElement('div', { className: 'w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0' },
          React.createElement(Bot, { size: 15, className: 'text-white' })),
        React.createElement('div', { className: 'max-w-[75%] ' + (m.role === 'user' ? 'bg-primary-600 text-white rounded-2xl rounded-br-md px-4 py-2.5' : 'bg-white border border-gray-100 rounded-2xl rounded-tl-md px-4 py-2.5 shadow-sm') },
          React.createElement('p', { className: 'text-sm whitespace-pre-wrap leading-relaxed' }, m.content)),
        m.role === 'user' && React.createElement('div', { className: 'w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0' },
          React.createElement(User, { size: 15, className: 'text-gray-500' })),
      ))
    )
  );
}
