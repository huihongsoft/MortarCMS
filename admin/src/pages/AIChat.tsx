import React, { useEffect, useRef, useState } from 'react';
import { Send, Bot, User, Sparkles, Wand2, FileText, BarChart3, MessageSquare, Copy, RotateCcw, Square, Check, Plus, Trash2, ListChecks, Loader2, CheckCircle2, XCircle, Ban } from 'lucide-react';
import api from '../lib/api';
import { t, getLang } from '../lib/i18n';

interface ChatMsg {
  role: 'user' | 'assistant';
  content: string;
  tools?: string[];
  ts?: number;
}

interface AiTask {
  id: string;
  username: string;
  prompt: string;
  status: string;
  steps?: any[];
  result?: string;
  error?: string;
  createdAt: string;
  finishedAt?: string | null;
}

interface Session {
  id: string;
  title: string;
  messages: ChatMsg[];
  ts: number;
}

const SUGGESTIONS = [
  { icon: BarChart3, text: '查看一下站点的统计数据' },
  { icon: FileText, text: '帮我列出最近发布的 5 篇文章' },
  { icon: Wand2, text: '撰写一篇关于内存涨价历史的文章并保存为草稿' },
  { icon: MessageSquare, text: '查看待审核的评论' },
];

const HISTORY_KEY = 'mortar_ai_sessions';
const HELP_TEXT = '**可用命令**\n' +
  '- `/stats` 查看站点统计\n' +
  '- `/posts [数量]` 列出最近文章\n' +
  '- `/draft 主题` 撰写文章并保存草稿\n' +
  '- `/comments` 查看待审核评论\n' +
  '- `/context` 查看站点概况\n' +
  '- `/help` 显示本帮助\n\n' +
  '也可以直接对话，例如：\n"写一篇关于内存涨价历史的文章并保存为草稿"';
const LAST_KEY = 'mortar_ai_last_session';

// Lightweight Markdown renderer for assistant replies
function renderMd(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const parts = text.split(/(```[\s\S]*?```)/g);
  let key = 0;
  parts.forEach((p) => {
    if (p.startsWith('```')) {
      nodes.push(React.createElement('pre', { key: key++, className: 'bg-gray-900 text-gray-100 text-xs rounded-lg p-3 overflow-x-auto my-2' },
        React.createElement('code', null, p.replace(/```/g, '').trim())));
      return;
    }
    const lines = p.split('\n');
    let inList = false;
    lines.forEach((line) => {
      const isList = /^[-*] /.test(line);
      if (isList) {
        if (!inList) { nodes.push(React.createElement('ul', { key: key++, className: 'list-disc pl-4 my-1 space-y-0.5' })); inList = true; }
        const inner = line.replace(/^[-*] /, '');
        (nodes[nodes.length - 1] as React.ReactElement).props.children = [
          ...((nodes[nodes.length - 1] as React.ReactElement).props.children || []),
          React.createElement('li', { key: key++, className: 'text-sm' }, inlineMd(inner)),
        ];
      } else {
        if (inList) inList = false;
        if (line.trim()) {
          nodes.push(React.createElement('p', { key: key++, className: 'text-sm leading-relaxed my-1' }, inlineMd(line)));
        }
      }
    });
  });
  return nodes;
}

function inlineMd(s: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  // bold **text**
  const boldParts = s.split(/(\*\*[^*]+\*\*)/g);
  boldParts.forEach((bp, i) => {
    if (bp.startsWith('**') && bp.endsWith('**')) {
      out.push(React.createElement('strong', { key: i }, bp.slice(2, -2)));
    } else {
      // inline code `code`
      const codeParts = bp.split(/(`[^`]+`)/g);
      codeParts.forEach((cp, j) => {
        if (cp.startsWith('`') && cp.endsWith('`')) {
          out.push(React.createElement('code', { key: i + '-' + j, className: 'bg-gray-100 text-pink-600 rounded px-1 text-xs' }, cp.slice(1, -1)));
        } else {
          out.push(React.createElement(React.Fragment, { key: i + '-' + j }, cp));
        }
      });
    }
  });
  return out;
}

export default function AIChat() {
  const [sessions, setSessions] = useState<Session[]>(() => {
    try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); } catch { return []; }
  });
  const [sessionId, setSessionId] = useState<string>(() => {
    try { return localStorage.getItem(LAST_KEY) || ''; } catch { return ''; }
  });
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState<string | null>(null);
  const [tab, setTab] = useState<'chat' | 'tasks'>('chat');
  const [tasks, setTasks] = useState<AiTask[]>([]);
  const [taskDetail, setTaskDetail] = useState<AiTask | null>(null);
  const [tasksLoading, setTasksLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Ensure at least one session exists
  useEffect(() => {
    if (sessions.length === 0) {
      const s: Session = { id: 's' + Date.now(), title: t('new chat', getLang()), messages: [], ts: Date.now() };
      setSessions([s]);
      setSessionId(s.id);
    }
  }, []);

  useEffect(() => {
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(sessions)); } catch {}
  }, [sessions]);

  useEffect(() => {
    try { localStorage.setItem(LAST_KEY, sessionId); } catch {}
  }, [sessionId]);

  const active = sessions.find(s => s.id === sessionId) || sessions[sessions.length - 1];
  const messages = active?.messages || [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, busy]);

  async function fetchTasks() {
    try {
      const r = await api.get('/ai/tasks');
      setTasks(r.data.tasks || []);
    } catch {}
  }

  useEffect(() => {
    if (tab !== 'tasks') return;
    setTasksLoading(true);
    fetchTasks().finally(() => setTasksLoading(false));
    const iv = setInterval(fetchTasks, 3000);
    return () => clearInterval(iv);
  }, [tab]);

  async function startTask() {
    const msg = input.trim();
    if (!msg || busy) return;
    setInput('');
    try {
      await api.post('/ai/task', { message: msg });
      setTab('tasks');
      setTimeout(fetchTasks, 500);
    } catch (e: any) { setError(e.response?.data?.error || '任务创建失败'); }
  }

  async function openTask(id: string) {
    try {
      const r = await api.get('/ai/tasks/' + id);
      setTaskDetail(r.data);
    } catch {}
  }

  async function cancelTask(id: string) {
    await api.post('/ai/tasks/' + id + '/cancel');
    fetchTasks();
    if (taskDetail?.id === id) setTaskDetail({ ...taskDetail, status: 'cancelled' });
  }

  async function retryTask(id: string) {
    try {
      const r = await api.post('/ai/tasks/' + id + '/retry');
      setTaskDetail(null);
      setTimeout(fetchTasks, 500);
    } catch (e: any) { setError(e.response?.data?.error || '重试失败'); }
  }

  async function deleteTask(id: string) {
    await api.delete('/ai/tasks/' + id);
    if (taskDetail?.id === id) setTaskDetail(null);
    fetchTasks();
  }

  function newSession() {
    const s: Session = { id: 's' + Date.now(), title: t('new chat', getLang()), messages: [], ts: Date.now() };
    setSessions([s, ...sessions]);
    setSessionId(s.id);
  }

  function deleteSession(id: string) {
    const rest = sessions.filter(x => x.id !== id);
    setSessions(rest);
    if (sessionId === id) {
      if (rest.length > 0) setSessionId(rest[0].id);
      else {
        const s: Session = { id: 's' + Date.now(), title: t('new chat', getLang()), messages: [], ts: Date.now() };
        setSessions([s]);
        setSessionId(s.id);
      }
    }
  }

  function renameSession(id: string, title: string) {
    setSessions(sessions.map(x => x.id === id ? { ...x, title } : x));
  }

  function copy(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(text.slice(0, 20));
    setTimeout(() => setCopied(null), 1500);
  }

  function stop() {
    abortRef.current?.abort();
  }

  function updateSession(id: string, updater: (s: Session) => Session) {
    setSessions(prev => prev.map(x => x.id === id ? updater(x) : x));
  }

  // Slash command map: /stats /posts /draft /comments /help
  function expandCommand(raw: string): string | null {
    const m = raw.match(/^\/(\w+)\s*(.*)$/s);
    if (!m) return null;
    const [, cmd, rest] = m;
    const r = rest.trim();
    switch (cmd) {
      case 'stats': return '查看一下站点的统计数据';
      case 'posts': return '列出最近发布的 ' + (r || '5') + ' 篇文章，只列标题和发布日期';
      case 'draft': return '撰写一篇关于「' + (r || '这个主题') + '」的文章并保存为草稿';
      case 'comments': return '查看待审核的评论';
      case 'context': return '请根据站点上下文简要总结当前站点的概况';
      case 'help':
        if (active) updateSession(active.id, x => ({ ...x, messages: [...x.messages, { role: 'assistant', content: HELP_TEXT, ts: Date.now() }] }));
        return null;
      default: return null; // unknown -> send as-is
    }
  }

  async function send(text?: string) {
    const raw = (text ?? input).trim();
    if (!raw || busy) return;
    const msg = expandCommand(raw) || raw;
    if (!msg) { setInput(''); return; }
    setInput('');
    setError('');
    const sid = active?.id || '';
    const history = [...messages, { role: 'user' as const, content: msg, ts: Date.now() }];
    updateSession(sid, x => ({
      ...x,
      title: x.title === t('new chat', getLang()) ? msg.slice(0, 24) : x.title,
      messages: history,
    }));
    setBusy(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + (localStorage.getItem('mortar_token') || '') },
        body: JSON.stringify({ message: msg }),
        signal: controller.signal,
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
              updateSession(sid, x => ({ ...x, messages: [...history, { role: 'assistant', content: full, tools: lastTools, ts: Date.now() }] }));
            } else if (j.type === 'tools') {
              lastTools = j.tools || [];
              updateSession(sid, x => ({ ...x, messages: [...history, { role: 'assistant', content: full, tools: lastTools, ts: Date.now() }] }));
            } else if (j.type === 'done') {
              full = j.content || full;
            } else if (j.type === 'error') {
              throw new Error(j.error || 'AI 错误');
            }
          } catch {}
        }
      }
      updateSession(sid, x => ({ ...x, messages: [...history, { role: 'assistant', content: full, tools: lastTools, ts: Date.now() }] }));
    } catch (e: any) {
      if (e.name === 'AbortError') {
        updateSession(sid, x => ({ ...x, messages: history }));
        setError(t('generation stopped', getLang()));
      } else {
        setError(e.message || '请求失败');
        updateSession(sid, x => ({ ...x, messages: history }));
      }
    } finally {
      setBusy(false);
      abortRef.current = null;
    }
  }

  async function regenerate(lastUserMsg: string) {
    if (busy || !active) return;
    const idx = [...messages].map(m => m.role).lastIndexOf('user');
    const trimmed = messages.slice(0, idx);
    updateSession(active.id, x => ({ ...x, messages: trimmed }));
    await sendFrom(lastUserMsg, active.id, trimmed);
  }

  async function sendFrom(msg: string, sid: string, history: ChatMsg[]) {
    if (!msg || busy) return;
    setError('');
    setBusy(true);
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + (localStorage.getItem('mortar_token') || '') },
        body: JSON.stringify({ message: msg }),
        signal: controller.signal,
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error || '请求失败'); }
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buf = ''; let full = ''; let lastTools: string[] = [];
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split('\n\n'); buf = lines.pop() || '';
        for (const chunk of lines) {
          const line = chunk.trim();
          if (!line.startsWith('data:')) continue;
          try {
            const j = JSON.parse(line.slice(5).trim());
            if (j.type === 'delta') { full += j.text; updateSession(sid, x => ({ ...x, messages: [...history, { role: 'assistant', content: full, tools: lastTools }] })); }
            else if (j.type === 'tools') { lastTools = j.tools || []; updateSession(sid, x => ({ ...x, messages: [...history, { role: 'assistant', content: full, tools: lastTools }] })); }
            else if (j.type === 'done') { full = j.content || full; }
            else if (j.type === 'error') throw new Error(j.error || 'AI 错误');
          } catch {}
        }
      }
      updateSession(sid, x => ({ ...x, messages: [...history, { role: 'assistant', content: full, tools: lastTools }] }));
    } catch (e: any) {
      if (e.name !== 'AbortError') setError(e.message || '请求失败');
      updateSession(sid, x => ({ ...x, messages: history }));
    } finally { setBusy(false); abortRef.current = null; }
  }

  return React.createElement('div', { className: 'flex gap-4 h-[calc(100vh-140px)]' },
    // ---- Sessions sidebar ----
    React.createElement('div', { className: 'w-56 flex-shrink-0 flex flex-col bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl overflow-hidden' },
      React.createElement('div', { className: 'p-2 border-b border-gray-100' },
        React.createElement('button', { onClick: newSession, className: 'w-full flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-lg bg-primary-50 text-primary-600 hover:bg-primary-100 transition-colors' },
          React.createElement('Plus', { size: 13 }), t('new chat', getLang()))),
      React.createElement('div', { className: 'flex-1 overflow-y-auto p-2 space-y-1' },
        sessions.map(sess => React.createElement('div', {
          key: sess.id,
          onClick: () => setSessionId(sess.id),
          className: 'group flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer transition-colors ' +
            (sess.id === sessionId ? 'bg-primary-50 dark:bg-primary-500/20 text-primary-700 dark:text-primary-300' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'),
        },
          React.createElement(MessageSquare, { size: 13, className: 'flex-shrink-0 opacity-60' }),
          React.createElement('span', { className: 'flex-1 text-xs truncate' }, sess.title),
          React.createElement('button', {
            onClick: (e: React.MouseEvent) => { e.stopPropagation(); deleteSession(sess.id); },
            className: 'opacity-0 group-hover:opacity-100 p-0.5 text-gray-300 hover:text-red-500 flex-shrink-0',
          }, React.createElement(Trash2, { size: 12 }))
        ))
      ),
    ),
    // ---- Chat column ----
    React.createElement('div', { className: 'flex-1 flex flex-col min-w-0' },
    React.createElement('div', { className: 'flex items-center justify-between mb-4' },
      React.createElement('div', { className: 'flex items-center gap-2' },
        React.createElement('div', { className: 'w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center' },
          React.createElement(Bot, { size: 18, className: 'text-white' })),
        React.createElement('div', null,
          React.createElement('h2', { className: 'text-xl font-bold text-gray-900' }, t('ai assistant', getLang())),
          React.createElement('p', { className: 'text-xs text-gray-400' }, t('ai assistant subtitle', getLang()))),
      ),
      React.createElement('div', { className: 'flex items-center gap-2' },
        error && React.createElement(React.Fragment, null,
          React.createElement('p', { className: 'text-xs text-red-600' }, error),
          React.createElement('button', {
            onClick: () => { const last = [...messages].filter(m => m.role === 'user').pop(); if (last) send(last.content); },
            className: 'text-xs px-2 py-0.5 rounded border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-300 hover:border-primary-400 hover:text-primary-600',
          }, React.createElement(RotateCcw, { size: 11 }), ' ' + t('retry', getLang())),
        ),
        active?.messages.length ? React.createElement('button', {
          onClick: () => updateSession(active.id, x => ({ ...x, messages: [] })),
          className: 'text-xs text-gray-400 hover:text-red-600',
        }, t('clear history', getLang())) : null,
      ),
    ),

    // Messages
    React.createElement('div', { className: 'flex-1 overflow-y-auto space-y-4 pr-2' },
      messages.length === 0 && React.createElement('div', { className: 'h-full flex flex-col items-center justify-center text-center' },
        React.createElement(Sparkles, { size: 40, className: 'text-primary-400 mb-4' }),
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
      messages.map((m, i) => {
        const lastUserIdx = [...messages].map(x => x.role).lastIndexOf('user');
        const canRegen = m.role === 'assistant' && i === messages.length - 1 && !busy;
        return React.createElement('div', { key: i, className: 'flex gap-3 ' + (m.role === 'user' ? 'justify-end' : '') },
          m.role === 'assistant' && React.createElement('div', { className: 'w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0' },
            React.createElement(Bot, { size: 15, className: 'text-white' })),
          React.createElement('div', { className: 'max-w-[75%] ' + (m.role === 'user' ? 'bg-primary-600 text-white rounded-2xl rounded-br-md px-4 py-2.5' : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl rounded-tl-md px-4 py-2.5 shadow-sm group') },
            m.tools && m.tools.length > 0 && React.createElement('div', { className: 'mb-2 flex flex-wrap gap-1' },
              m.tools.map((tool, j) => React.createElement('span', { key: j, className: 'text-[10px] px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-500/20 text-purple-600 dark:text-purple-300 border border-purple-100 dark:border-purple-500/30' }, '⚡ ' + tool))),
            m.role === 'assistant' && !m.content && busy
              ? React.createElement('div', { className: 'flex gap-1 py-1' },
                  [0, 1, 2].map(d => React.createElement('span', { key: d, className: 'w-1.5 h-1.5 rounded-full bg-gray-300 animate-bounce', style: { animationDelay: d * 0.15 + 's' } })))
              : React.createElement('div', { className: m.role === 'user' ? 'text-sm' : undefined },
                  m.role === 'user' ? m.content : renderMd(m.content)),
            // Actions
            m.role === 'assistant' && m.content && React.createElement('div', { className: 'flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity' },
              React.createElement('button', { onClick: () => copy(m.content), title: t('copy', getLang()), className: 'p-1 text-gray-400 hover:text-primary-600' },
                copied === m.content.slice(0, 20) ? React.createElement(Check, { size: 13 }) : React.createElement(Copy, { size: 13 })),
              canRegen && React.createElement('button', { onClick: () => regenerate(messages[lastUserIdx]?.content || ''), title: t('regenerate', getLang()), className: 'p-1 text-gray-400 hover:text-primary-600' },
                React.createElement(RotateCcw, { size: 13 })),
            ),
            m.ts && React.createElement('p', { className: 'text-[10px] text-gray-300 dark:text-gray-600 mt-1' }, new Date(m.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })),
          ),
          m.role === 'user' && React.createElement('div', { className: 'w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0' },
            React.createElement(User, { size: 15, className: 'text-gray-500' })),
        );
      }),
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
      busy
        ? React.createElement('button', { onClick: stop, className: 'btn-danger' }, React.createElement(Square, { size: 16 }), t('stop', getLang()))
        : React.createElement('button', { onClick: () => send(), disabled: !input.trim(), className: 'btn-primary' },
            React.createElement(Send, { size: 16 }), t('send', getLang()))
    )
    )
  );
}
