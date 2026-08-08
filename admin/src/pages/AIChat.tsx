import React, { useEffect, useRef, useState } from 'react';
import { Send, Bot, User, Sparkles, Wand2, FileText, BarChart3, MessageSquare } from 'lucide-react';
import api from '../lib/api';
import { t, getLang } from '../lib/i18n';

interface ChatMsg {
  role: 'user' | 'assistant';
  content: string;
  tools?: string[];
}

const SUGGESTIONS = [
  { icon: BarChart3, text: '查看一下站点的统计数据' },
  { icon: FileText, text: '帮我列出最近发布的 5 篇文章' },
  { icon: Wand2, text: '撰写一篇关于内存涨价历史的文章并保存为草稿' },
  { icon: MessageSquare, text: '查看待审核的评论' },
];

export default function AIChat() {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, busy]);

  async function send(text?: string) {
    const msg = (text ?? input).trim();
    if (!msg || busy) return;
    setInput('');
    setError('');
    const history = [...messages, { role: 'user' as const, content: msg }];
    setMessages(history);
    setBusy(true);
    setMessages([...history, { role: 'assistant', content: '' }]);

    try {
      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + (localStorage.getItem('mortar_token') || '') },
        body: JSON.stringify({ message: msg }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || '请求失败 (' + res.status + ')');
      }
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buf = '';
      let full = '';
      let lastTools: string[] = [];
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split('\n\n');
        buf = lines.pop() || '';
        for (const chunk of lines) {
          const line = chunk.trim();
          if (!line.startsWith('data:')) continue;
          try {
            const j = JSON.parse(line.slice(5).trim());
            if (j.type === 'delta') {
              full += j.text;
              setMessages([...history, { role: 'assistant', content: full, tools: lastTools }]);
            } else if (j.type === 'tools') {
              lastTools = j.tools || [];
              setMessages([...history, { role: 'assistant', content: full, tools: lastTools }]);
            } else if (j.type === 'done') {
              full = j.content || full;
            } else if (j.type === 'error') {
              throw new Error(j.error || 'AI 错误');
            }
          } catch {}
        }
      }
      setMessages([...history, { role: 'assistant', content: full, tools: lastTools }]);
    } catch (e: any) {
      setError(e.message || '请求失败');
      setMessages(history);
    } finally {
      setBusy(false);
    }
  }

  function renderContent(text: string) {
    // Render simple markdown-ish: bold, code blocks, lists
    const parts = text.split(/(```[\s\S]*?```)/g);
    return parts.map((p, i) => {
      if (p.startsWith('```')) {
        return React.createElement('pre', { key: i, className: 'bg-gray-900 text-gray-100 text-xs rounded-lg p-3 overflow-x-auto my-2' },
          React.createElement('code', null, p.replace(/```/g, '').trim()));
      }
      return p.split('\n').map((line, j) =>
        line.startsWith('- ') || line.startsWith('* ')
          ? React.createElement('p', { key: i + '-' + j, className: 'pl-3 text-sm leading-relaxed' }, '• ' + line.slice(2))
          : React.createElement('p', { key: i + '-' + j, className: 'text-sm leading-relaxed' }, line)
      );
    });
  }

  return React.createElement('div', { className: 'flex flex-col h-[calc(100vh-140px)]' },
    React.createElement('div', { className: 'flex items-center justify-between mb-4' },
      React.createElement('div', { className: 'flex items-center gap-2' },
        React.createElement('div', { className: 'w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center' },
          React.createElement(Bot, { size: 18, className: 'text-white' })),
        React.createElement('div', null,
          React.createElement('h2', { className: 'text-xl font-bold text-gray-900' }, t('ai assistant', getLang())),
          React.createElement('p', { className: 'text-xs text-gray-400' }, t('ai assistant subtitle', getLang()))),
      ),
      error && React.createElement('p', { className: 'text-xs text-red-600' }, error),
    ),

    // Messages
    React.createElement('div', { className: 'flex-1 overflow-y-auto space-y-4 pr-2' },
      messages.length === 0 && React.createElement('div', { className: 'h-full flex flex-col items-center justify-center text-center' },
        React.createElement('Sparkles', { size: 40, className: 'text-primary-400 mb-4' }),
        React.createElement('p', { className: 'text-gray-500 mb-6 max-w-sm text-sm' }, t('ai chat hint', getLang())),
        React.createElement('div', { className: 'grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg w-full' },
          SUGGESTIONS.map((s, i) => React.createElement('button', {
            key: i,
            onClick: () => send(s.text),
            disabled: busy,
            className: 'flex items-center gap-2 p-3 rounded-xl border border-gray-200 text-left text-sm text-gray-600 hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50/50 transition-colors',
          }, React.createElement(s.icon, { size: 16 }), s.text))
        )
      ),
      messages.map((m, i) => React.createElement('div', { key: i, className: 'flex gap-3 ' + (m.role === 'user' ? 'justify-end' : '') },
        m.role === 'assistant' && React.createElement('div', { className: 'w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0' },
          React.createElement(Bot, { size: 15, className: 'text-white' })),
        React.createElement('div', { className: 'max-w-[75%] ' + (m.role === 'user' ? 'bg-primary-600 text-white rounded-2xl rounded-br-md px-4 py-2.5' : 'bg-white border border-gray-100 rounded-2xl rounded-tl-md px-4 py-2.5 shadow-sm') },
          m.tools && m.tools.length > 0 && React.createElement('div', { className: 'mb-2 flex flex-wrap gap-1' },
            m.tools.map((tool, j) => React.createElement('span', { key: j, className: 'text-[10px] px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 border border-purple-100' }, '⚡ ' + tool))),
          m.role === 'assistant' && !m.content && busy
            ? React.createElement('div', { className: 'flex gap-1 py-1' },
                [0, 1, 2].map(d => React.createElement('span', { key: d, className: 'w-1.5 h-1.5 rounded-full bg-gray-300 animate-bounce', style: { animationDelay: d * 0.15 + 's' } })))
            : React.createElement('div', { className: m.role === 'user' ? 'text-sm' : undefined },
                m.role === 'user' ? m.content : renderContent(m.content)),
        ),
        m.role === 'user' && React.createElement('div', { className: 'w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0' },
          React.createElement(User, { size: 15, className: 'text-gray-500' })),
      )),
      React.createElement('div', { ref: bottomRef })
    ),

    // Input
    React.createElement('div', { className: 'mt-4 flex gap-2' },
      React.createElement('input', {
        value: input,
        onChange: e => setInput(e.target.value),
        onKeyDown: e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } },
        placeholder: t('ask ai something', getLang()),
        className: 'input-field flex-1',
      }),
      React.createElement('button', { onClick: () => send(), disabled: busy || !input.trim(), className: 'btn-primary' },
        React.createElement(Send, { size: 16 }), t('send', getLang()))
    )
  );
}
