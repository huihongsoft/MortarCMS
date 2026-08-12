import React, { useEffect, useRef, useState } from 'react';
import { Send, Bot, User, Sparkles, Wand2, FileText, BarChart3, MessageSquare, Copy, RotateCcw, Square, Check, Plus, Trash2, ListChecks, Loader2, CheckCircle2, XCircle, Ban, Bell, Download, Settings2, Share2, Mic, BookOpen, X, Upload, Menu, Rocket, MoreHorizontal, LayoutTemplate, Bookmark } from 'lucide-react';
import api from '../lib/api';
import { t, getLang } from '../lib/i18n';

interface ChatMsg {
  role: 'user' | 'assistant';
  content: string;
  tools?: string[];
  toolResults?: { name: string; output: string }[];
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

const PROMPT_LIBRARY = [
  { label: '✍️ 写文章', text: '撰写一篇关于【主题】的深度文章并保存为草稿' },
  { label: '📊 站点统计', text: '查看一下站点的统计数据' },
  { label: '📰 最近文章', text: '列出最近发布的 5 篇文章' },
  { label: '🔍 站内检索', text: '在站内搜索关于【关键词】的内容并总结' },
  { label: '🌐 联网调研', text: '搜索互联网上关于【主题】的最新信息并总结要点' },
  { label: '🏷️ 标签建议', text: '为文章《【标题】》推荐合适的标签' },
  { label: '💡 选题建议', text: '根据我站点的内容推荐 5 个新选题' },
  { label: '🧠 记住偏好', text: '记住：我更喜欢【简洁的写作风格】' },
  { label: '🖼️ 生成配图', text: '为文章《【标题】》生成一张封面配图' },
  { label: '📝 评论审核', text: '帮我审核待处理的评论' },
];

// One-click task templates: clicking one fills the task input so the model
// gets a precise, structured instruction instead of a vague free-form prompt.
// Task templates grouped by category: the picker button next to the task
// input opens a two-level menu (category -> template).
const TASK_TEMPLATE_GROUPS: { category: string; icon: string; templates: { label: string; prompt: string }[] }[] = [
  {
    category: '写作', icon: '✍️', templates: [
      { label: '撰写并发布文章', prompt: '请撰写一篇关于【主题】的文章并发布。要求：结构清晰，使用小标题分节，字数不少于 800 字，内容有深度，并分配合理的分类和标签。' },
      { label: '生成文章草稿', prompt: '请撰写一篇关于【主题】的文章草稿（保存为草稿，不要发布）。要求：结构清晰，使用小标题分节，字数不少于 600 字。' },
      { label: '写文章并生成封面', prompt: '请撰写一篇关于【主题】的文章并发布，同时用 generate_image 生成一张与主题匹配的封面图，把返回的 url 传给 write_post 的 featured 参数设为文章封面。' },
    ],
  },
  {
    category: '调研', icon: '🔍', templates: [
      { label: '调研后写文章', prompt: '请先用 web_search 搜索【主题】的最新信息（多搜索几个关键词），再基于调研结果撰写一篇有深度、有数据支撑的文章并保存为草稿。' },
    ],
  },
  {
    category: '内容运营', icon: '📊', templates: [
      { label: '翻译文章', prompt: '请把文章【文章标题或链接】翻译成【目标语言】，翻译后创建为新文章（保留封面图），标题带语言标记。' },
      { label: '完善文章 SEO', prompt: '请为文章【文章标题或链接】调用 complete_post：自动生成摘要、SEO 标题、SEO 描述，并推荐合适的标签。' },
      { label: '站点数据报告', prompt: '请查询站点的文章、页面、评论、分类、标签等统计信息，整理成一份简洁清晰的报告。' },
      { label: '整理分类标签', prompt: '请查看站内所有文章的分类和标签使用情况，检查是否有遗漏或不当之处，并给出具体的整理建议（不要直接修改）。' },
    ],
  },
  {
    category: '主题设计', icon: '🎨', templates: [
      { label: '仿制网站主题', prompt: '请用 analyze_web_theme 分析【参考网站链接】的配色和字体，然后用 apply_theme_style 把类似的风格应用到当前站点主题（主色、背景、文字、链接、字体），如需圆角/间距等细节可附带 custom_css。' },
      { label: '自定义主题风格', prompt: '请把站点主题调整为【风格描述，如：深色简洁 / 温暖杂志风】。用 apply_theme_style 设置主色、背景、文字、链接颜色和字体，并用 custom_css 补充细节。' },
    ],
  },
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
// Render a markdown table block (lines starting with |)
function renderTable(lines: string[], keyStart: number): React.ReactNode {
  const rows = lines.map(l => l.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map(c => c.trim()));
  const header = rows[0] || [];
  const body = rows.slice(2); // skip separator row (|---|---|)
  return React.createElement('table', { key: keyStart, className: 'text-xs my-2 border-collapse w-full' },
    React.createElement('thead', null, React.createElement('tr', null, header.map((h, i) =>
      React.createElement('th', { key: i, className: 'border border-gray-200 dark:border-gray-600 px-2 py-1 text-left bg-gray-50 dark:bg-gray-800' }, inlineMd(h))))),
    React.createElement('tbody', null, body.map((r, ri) =>
      React.createElement('tr', { key: ri }, r.map((c, ci) =>
        React.createElement('td', { key: ci, className: 'border border-gray-200 dark:border-gray-600 px-2 py-1' }, inlineMd(c))))))
  );
}

function renderMd(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const parts = text.split(/(```[\s\S]*?```)/g);
  let key = 0;
  parts.forEach((p) => {
    if (p.startsWith('```')) {
      const code = p.replace(/```/g, '').trim();
      nodes.push(React.createElement('div', { key: key++, className: 'relative group my-2' },
        React.createElement('button', {
          onClick: () => { navigator.clipboard.writeText(code).catch(() => {}); },
          title: '复制',
          className: 'absolute top-1.5 right-1.5 p-1 rounded bg-gray-700 text-gray-300 opacity-0 group-hover:opacity-100 hover:bg-gray-600 transition-opacity',
        }, React.createElement(Copy, { size: 12 })),
        React.createElement('pre', { className: 'bg-gray-900 text-gray-100 text-xs rounded-lg p-3 overflow-x-auto' },
          React.createElement('code', null, code))));
      return;
    }
    const lines = p.split('\n');
    let inList = false;
    let tableBuf: string[] = [];
    const flushTable = () => {
      if (tableBuf.length >= 2) nodes.push(renderTable(tableBuf, key++));
      tableBuf = [];
    };
    lines.forEach((line) => {
      const isTableLine = line.trim().startsWith('|') && line.trim().endsWith('|');
      if (isTableLine) { tableBuf.push(line); return; }
      flushTable();
      const heading = line.match(/^(#{1,4})\s+(.*)$/);
      if (heading) {
        if (inList) inList = false;
        nodes.push(React.createElement('h' + heading[1].length, { key: key++, className: 'text-sm font-bold my-1.5 text-gray-900 dark:text-gray-100' }, inlineMd(heading[2])));
        return;
      }
      if (line.trim().startsWith('>')) {
        if (inList) inList = false;
        nodes.push(React.createElement('blockquote', { key: key++, className: 'border-l-2 border-gray-300 dark:border-gray-600 pl-2 my-1 text-gray-500 dark:text-gray-400 text-sm italic' }, inlineMd(line.trim().replace(/^>\s?/, ''))));
        return;
      }
      if (/^---+$/.test(line.trim())) {
        if (inList) inList = false;
        nodes.push(React.createElement('hr', { key: key++, className: 'border-gray-200 dark:border-gray-700 my-2' }));
        return;
      }
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
    flushTable();
  });
  return nodes;
}

// Render a tool's output: JSON-shaped results stay in a monospace <pre>,
// markdown-shaped text (headings/lists/tables/code fences) is rendered.
function renderToolOutput(out: string): React.ReactNode {
  const s = String(out || '');
  const trimmed = s.trim();
  const looksLikeJson = trimmed.startsWith('{') || trimmed.startsWith('[');
  const looksLikeMarkdown = /```/.test(s) || /(^|\n)\s*(#{1,4}\s+|\||[-*] |>\s)/.test(s);
  if (looksLikeJson || !looksLikeMarkdown) {
    return React.createElement('pre', { className: 'mt-1 whitespace-pre-wrap break-words text-gray-500 dark:text-gray-400 max-h-32 overflow-y-auto bg-white dark:bg-gray-900 rounded p-2' }, s.slice(0, 2000));
  }
  return React.createElement('div', { className: 'mt-1 max-h-48 overflow-y-auto bg-white dark:bg-gray-900 rounded p-2' }, renderMd(s.slice(0, 2000)));
}

function safeHref(url: string): string {
  const u = String(url || '').trim();
  if (u.startsWith('/') || u.startsWith('http://') || u.startsWith('https://')) return u;
  return '#';
}

// Auto-link bare URLs in plain text (https://... and /uploads/... paths)
function urlify(text: string, key: string | number): React.ReactNode[] {
  const re = /(https?:\/\/[^\s<>"']+|\/uploads\/[^\s<>"']+)/g;
  const out: React.ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push(React.createElement(React.Fragment, { key: key + '-u' + last }, text.slice(last, m.index)));
    out.push(React.createElement('a', { key: key + '-u' + m.index, href: safeHref(m[1]), target: '_blank', rel: 'noopener noreferrer', className: 'text-blue-600 hover:underline break-all' }, m[1]));
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(React.createElement(React.Fragment, { key: key + '-u' + last }, text.slice(last)));
  return out;
}

// Render inline code + markdown links [text](url)
function linkAndCode(s: string, key: string | number): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  const linkRe = /\[([^\]]+)\]\(([^)\s]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  const parts: { t: string; link?: [string, string] }[] = [];
  while ((m = linkRe.exec(s)) !== null) {
    if (m.index > last) parts.push({ t: s.slice(last, m.index) });
    parts.push({ t: '', link: [m[1], m[2]] });
    last = m.index + m[0].length;
  }
  if (last < s.length) parts.push({ t: s.slice(last) });
  parts.forEach((p, pi) => {
    if (p.link) {
      out.push(React.createElement('a', { key: key + '-' + pi, href: safeHref(p.link[1]), target: '_blank', rel: 'noopener noreferrer', className: 'text-blue-600 hover:underline' }, p.link[0]));
      return;
    }
    const codeParts = p.t.split(/(`[^`]+`)/g);
    codeParts.forEach((cp, j) => {
      if (cp.startsWith('`') && cp.endsWith('`')) {
        out.push(React.createElement('code', { key: key + '-' + pi + '-' + j, className: 'bg-gray-100 text-pink-600 rounded px-1 text-xs' }, cp.slice(1, -1)));
      } else if (cp.trim()) {
        out.push(...urlify(cp, key + '-' + pi + '-' + j));
      } else {
        out.push(React.createElement(React.Fragment, { key: key + '-' + pi + '-' + j }, cp));
      }
    });
  });
  return out;
}

function inlineMd(s: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  // bold **text** (may contain links/code inside)
  const boldParts = s.split(/(\*\*[^*]+\*\*)/g);
  boldParts.forEach((bp, i) => {
    if (bp.startsWith('**') && bp.endsWith('**')) {
      out.push(React.createElement('strong', { key: i }, inlineMd(bp.slice(2, -2))));
      return;
    }
    // images ![alt](url)
    const imgRe = /!\[([^\]]*)\]\(([^)\s]+)\)/g;
    const pieces: { t: string; img?: [string, string] }[] = [];
    let last = 0;
    let im: RegExpExecArray | null;
    while ((im = imgRe.exec(bp)) !== null) {
      if (im.index > last) pieces.push({ t: bp.slice(last, im.index) });
      pieces.push({ t: '', img: [im[1], im[2]] });
      last = im.index + im[0].length;
    }
    if (last < bp.length) pieces.push({ t: bp.slice(last) });
    if (pieces.length === 1) {
      out.push(...linkAndCode(bp, i));
    } else {
      pieces.forEach((p, pi) => {
        const img = p.img;
        if (img) {
          const src = safeHref(img[1]);
          out.push(React.createElement('img', { key: i + '-' + pi, src, alt: img[0] || '', loading: 'lazy', className: 'max-w-full rounded-lg my-1 cursor-zoom-in', onClick: () => window.open(src, '_blank') }));
        } else {
          out.push(...linkAndCode(p.t, i + '-' + pi));
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
  const [sessionSearch, setSessionSearch] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [cmdOpen, setCmdOpen] = useState(false);
  const [taskFilter, setTaskFilter] = useState('');
  const [taskSearch, setTaskSearch] = useState('');
  const [moreOpen, setMoreOpen] = useState(false);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState<string | null>(null);
  const [paramsOpen, setParamsOpen] = useState(false);
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(4096);
  const [includeContext, setIncludeContext] = useState(true);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const [promptsOpen, setPromptsOpen] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const promptsRef = useRef<HTMLDivElement>(null);

  // Voice input (Web Speech API)
  function toggleVoice() {
    const SR: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { alert(t('voice not supported', getLang())); return; }
    if (listening) { recognitionRef.current?.stop(); setListening(false); return; }
    const rec = new SR();
    rec.lang = 'zh-CN';
    rec.continuous = false;
    rec.interimResults = true;
    rec.onresult = (e: any) => {
      let t = '';
      for (let i = 0; i < e.results.length; i++) t += e.results[i][0].transcript;
      setInput(t);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recognitionRef.current = rec;
    rec.start();
    setListening(true);
  }

  useEffect(() => {
    const onDoc = (e: MouseEvent) => { if (promptsRef.current && !promptsRef.current.contains(e.target as Node)) setPromptsOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);
  const paramsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => { if (paramsRef.current && !paramsRef.current.contains(e.target as Node)) setParamsOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);
  const [tab, setTab] = useState<'chat' | 'tasks'>('chat');
  const [tasks, setTasks] = useState<AiTask[]>([]);
  const [taskDetail, setTaskDetail] = useState<AiTask | null>(null);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  // R2: user-defined task templates (persisted locally)
  const [myTemplates, setMyTemplates] = useState<{ name: string; prompt: string }[]>(() => {
    try { return JSON.parse(localStorage.getItem('mortar_task_templates') || '[]'); } catch { return []; }
  });
  const taskInputRef = useRef<HTMLTextAreaElement>(null);
  // Template picker: button next to the task input, two-level menu
  const [tplOpen, setTplOpen] = useState(false);
  const [tplGroup, setTplGroup] = useState(0);
  const tplRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onDoc = (e: MouseEvent) => { if (tplRef.current && !tplRef.current.contains(e.target as Node)) setTplOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);
  useEffect(() => { try { localStorage.setItem('mortar_task_templates', JSON.stringify(myTemplates)); } catch {} }, [myTemplates]);
  function applyTemplate(prompt: string) { setInput(prompt); setTimeout(() => taskInputRef.current?.focus(), 0); }
  // Saving a template opens a small dialog asking for a display name and the
  // template content (pre-filled with the current input, editable)
  const [tplModal, setTplModal] = useState(false);
  const [tplName, setTplName] = useState('');
  const [tplContent, setTplContent] = useState('');
  function openTplModal() {
    const p = input.trim();
    if (!p) return;
    if (myTemplates.length >= 8) { setError(t('max 8 templates', getLang())); return; }
    setTplContent(p);
    setTplName('');
    setTplModal(true);
  }
  function confirmSaveTemplate() {
    const name = tplName.trim();
    if (!name) { setError(t('template name required', getLang())); return; }
    setMyTemplates([...myTemplates, { name: name.slice(0, 30), prompt: tplContent.trim() }]);
    setError('');
    setTplModal(false);
  }
  const [unread, setUnread] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.get('/ai/notifications').then(r => { setNotifications(r.data.notifications || []); setUnread(r.data.unread || 0); }).catch(() => {});
    const iv = setInterval(() => { api.get('/ai/notifications').then(r => { setNotifications(r.data.notifications || []); setUnread(r.data.unread || 0); }).catch(() => {}); }, 15000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => { if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  async function openNotification(n: any) {
    setNotifOpen(false);
    if (n.taskId) { setTab('tasks'); openTask(n.taskId); }
    await api.post('/ai/notifications/read-all');
    setUnread(0);
  }
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

  function startRename(id: string, current: string) {
    setRenamingId(id); setRenameValue(current);
  }

  function commitRename() {
    if (renamingId && renameValue.trim()) {
      updateSession(renamingId, x => ({ ...x, title: renameValue.trim().slice(0, 40) }));
    }
    setRenamingId(null);
  }

  // Poll task detail while it is running
  useEffect(() => {
    if (!taskDetail || taskDetail.status !== 'running') return;
    const iv = setInterval(async () => {
      try {
        const r = await api.get('/ai/tasks/' + taskDetail.id);
        setTaskDetail(r.data);
      } catch {}
    }, 2000);
    return () => clearInterval(iv);
  }, [taskDetail?.id, taskDetail?.status]);

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
      const r = await api.post('/ai/task', { message: msg });
      const newId = r.data?.id;
      setTab('tasks');
      // Switch to the task just created so the running task is in view
      if (newId) openTask(newId);
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

  // R7: retry now pre-fills the original prompt into the input so the user
  // can tweak it before re-submitting, instead of blindly re-running.
  async function retryTask(id: string) {
    const tk = tasks.find(x => x.id === id);
    if (tk?.prompt) { setInput(tk.prompt); setTimeout(() => taskInputRef.current?.focus(), 0); setError(''); }
  }

  async function deleteTask(id: string) {
    if (!confirm(t('delete this task?', getLang()))) return;
    await api.delete('/ai/tasks/' + id);
    if (taskDetail?.id === id) setTaskDetail(null);
    fetchTasks();
  }

  // Server-side session persistence (localStorage stays as an offline cache)
  const serverIdsRef = useRef<Set<string>>(new Set());

  async function loadServerSessions() {
    try {
      const r = await api.get('/ai/sessions');
      const server = r.data?.sessions || [];
      serverIdsRef.current = new Set(server.map((x: any) => x.id));
      setSessions(prev => {
        const localMap = new Map(prev.map(x => [x.id, x]));
        const merged = server.map((ss: any) => {
          const local = localMap.get(ss.id);
          return local ? { ...local, title: local.title === t('new chat', getLang()) ? ss.title : local.title } : { id: ss.id, title: ss.title, messages: [], ts: new Date(ss.updatedAt || ss.createdAt || Date.now()).getTime() };
        });
        const localOnly = prev.filter(x => !serverIdsRef.current.has(x.id));
        return [...localOnly, ...merged];
      });
    } catch { /* offline: keep localStorage sessions */ }
  }

  // Lazy-load full messages when opening a session that only has a summary
  function openSessionFull(id: string) {
    setSessionId(id);
    const s = sessions.find(x => x.id === id);
    if (s && s.messages.length === 0 && serverIdsRef.current.has(id)) {
      api.get('/ai/sessions/' + id).then(r => {
        setSessions(prev => prev.map(x => x.id === id ? { ...x, messages: r.data?.messages || [], ts: Date.now() } : x));
      }).catch(() => {});
    }
  }

  // Debounced sync of changed sessions to the server
  useEffect(() => {
    const t = setTimeout(() => {
      sessions.forEach(x => {
        if (!x.messages || x.messages.length === 0) return;
        const body = { title: x.title, messages: x.messages };
        if (serverIdsRef.current.has(x.id)) {
          api.put('/ai/sessions/' + x.id, body).catch(() => {});
        } else {
          api.post('/ai/sessions', { id: x.id, ...body }).then(() => serverIdsRef.current.add(x.id)).catch(() => {});
        }
      });
    }, 1500);
    return () => clearTimeout(t);
  }, [sessions]);

  useEffect(() => {
    loadServerSessions();
  }, []);

  useEffect(() => {
    if (!moreOpen) return;
    const onDoc = () => setMoreOpen(false);
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, [moreOpen]);

  function newSession() {
    const s: Session = { id: 's' + Date.now(), title: t('new chat', getLang()), messages: [], ts: Date.now() };
    setSessions([s, ...sessions]);
    setSessionId(s.id);
  }

  function deleteSession(id: string) {
    if (serverIdsRef.current.has(id)) {
      api.delete('/ai/sessions/' + id).then(() => serverIdsRef.current.delete(id)).catch(() => {});
    }
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

  async function clearAllSessions() {
    if (!confirm(t('clear all sessions?', getLang()))) return;
    try { await api.delete('/ai/sessions'); } catch {}
    serverIdsRef.current.clear();
    const s: Session = { id: 's' + Date.now(), title: t('new chat', getLang()), messages: [], ts: Date.now() };
    setSessions([s]);
    setSessionId(s.id);
  }

  function downloadFile(name: string, content: string) {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function shareSession() {
    if (!active?.messages.length) return;
    try {
      const r = await api.post('/ai/share', { messages: active.messages });
      const url = window.location.origin + r.data.url;
      navigator.clipboard.writeText(url);
      setError('');
      setCopied('share');
      setTimeout(() => setCopied(null), 1500);
      alert(t('share link copied', getLang()) + ': ' + url);
    } catch (e: any) { setError(e.response?.data?.error || '分享失败'); }
  }

  function exportSession() {
    if (!active?.messages.length) return;
    const md = active.messages.map(m =>
      (m.role === 'user' ? '## 👤 我\n' : '## 🤖 AI' + (m.tools?.length ? '（调用了: ' + m.tools.join(', ') + '）' : '') + '\n') + '\n' + m.content + '\n'
    ).join('\n---\n\n');
    downloadFile('AI对话-' + active.title + '.md', '# ' + active.title + '\n\n' + md);
  }

  function exportTask(task: any) {
    let md = '# AI 任务: ' + task.prompt + '\n\n- 状态: ' + task.status + '\n- 用户: ' + task.username + '\n- 创建: ' + new Date(task.createdAt).toLocaleString() + '\n\n';
    if (task.steps) {
      md += '## 执行步骤\n\n' + task.steps.map((st: any, i: number) =>
        '### 步骤 ' + (i + 1) + '\n' + (st.type === 'think' ? st.content : '工具 `' + st.name + '`\n```json\n' + JSON.stringify(st.output, null, 1) + '\n```')
      ).join('\n\n');
    }
    if (task.result) md += '\n\n## 结果\n\n' + task.result;
    if (task.error) md += '\n\n## 错误\n\n' + task.error;
    downloadFile('AI任务-' + task.prompt.slice(0, 20) + '.md', md);
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
      case 'seo': return '为站点最近发布的文章生成 SEO 标题和描述建议（列出文章标题与对应的 SEO 建议即可，不要修改文章）';
      case 'memory': return '告诉我你记住了关于我的哪些信息（调用回忆工具）';
      case 'tasks': return '查看最近的 AI 任务状态并总结';
      case 'translate': return '将文章《' + (r || '最近的草稿文章') + '》翻译成英文并保存为草稿';
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

    // Multi-turn context: previous messages (excluding the one being sent)
    let historyPayload = messages
      .filter((m: any) => m.role === 'user' || m.role === 'assistant')
      .map((m: any) => ({ role: m.role, content: String(m.content || '') }));

    // Long conversation: compress the older part into a summary (keeps context, saves tokens)
    if (historyPayload.length > 24) {
      const keep = historyPayload.slice(-10);
      const old = historyPayload.slice(0, -10);
      const oldText = old.map((m: any) => (m.role === 'user' ? '用户: ' : 'AI: ') + m.content).join('\n').slice(0, 12000);
      try {
        const sr = await fetch('/api/ai/summarize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + (localStorage.getItem('mortar_token') || '') },
          body: JSON.stringify({ text: oldText }),
        });
        const sj = await sr.json();
        if (sj.summary) historyPayload = [{ role: 'assistant', content: '【历史摘要】' + sj.summary }, ...keep];
      } catch { /* fall back to the recent messages only */ }
    }

    try {
      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + (localStorage.getItem('mortar_token') || '') },
        body: JSON.stringify({ message: msg, temperature, maxTokens, includeContext, history: historyPayload }),
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
      let lastToolResults: { name: string; output: string }[] = [];
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
              updateSession(sid, x => ({ ...x, messages: [...history, { role: 'assistant', content: full, tools: lastTools, toolResults: lastToolResults, ts: Date.now() }] }));
            } else if (j.type === 'tools') {
              lastTools = j.tools || [];
              updateSession(sid, x => ({ ...x, messages: [...history, { role: 'assistant', content: full, tools: lastTools, toolResults: lastToolResults, ts: Date.now() }] }));
            } else if (j.type === 'tool_result') {
              lastToolResults = [...lastToolResults, { name: String(j.name || 'tool'), output: String(j.output || '') }];
            } else if (j.type === 'done') {
              full = j.content || full;
            } else if (j.type === 'error') {
              throw new Error(j.error || 'AI 错误');
            }
          } catch {}
        }
      }
      updateSession(sid, x => ({ ...x, messages: [...history, { role: 'assistant', content: full, tools: lastTools, toolResults: lastToolResults, ts: Date.now() }] }));
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
        body: JSON.stringify({ message: msg, temperature, maxTokens, includeContext }),
        signal: controller.signal,
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error || '请求失败'); }
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buf = ''; let full = ''; let lastTools: string[] = [];
      let lastToolResults: { name: string; output: string }[] = [];
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
            if (j.type === 'delta') { full += j.text; updateSession(sid, x => ({ ...x, messages: [...history, { role: 'assistant', content: full, tools: lastTools, toolResults: lastToolResults }] })); }
            else if (j.type === 'tools') { lastTools = j.tools || []; updateSession(sid, x => ({ ...x, messages: [...history, { role: 'assistant', content: full, tools: lastTools, toolResults: lastToolResults }] })); }
            else if (j.type === 'tool_result') { lastToolResults = [...lastToolResults, { name: String(j.name || 'tool'), output: String(j.output || '') }]; }
            else if (j.type === 'done') { full = j.content || full; }
            else if (j.type === 'error') throw new Error(j.error || 'AI 错误');
          } catch {}
        }
      }
      updateSession(sid, x => ({ ...x, messages: [...history, { role: 'assistant', content: full, tools: lastTools, toolResults: lastToolResults }] }));
    } catch (e: any) {
      if (e.name !== 'AbortError') setError(e.message || '请求失败');
      updateSession(sid, x => ({ ...x, messages: history }));
    } finally { setBusy(false); abortRef.current = null; }
  }

  // Reusable sessions sidebar (desktop inline + mobile drawer)
  const renderSidebar = (widthCls: string) =>
    React.createElement('div', { className: widthCls + ' flex flex-col bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl overflow-hidden' },
      // Chat / Tasks switcher pinned to the top of the sidebar
      React.createElement('div', { className: 'flex items-center gap-1 p-2 border-b border-gray-100 dark:border-gray-700' },
        (['chat', 'tasks'] as const).map(tk =>
          React.createElement('button', {
            key: tk,
            onClick: () => { setTab(tk); setSidebarOpen(false); },
            className: 'flex-1 px-2 py-1.5 text-xs rounded-lg border transition-colors ' + (tab === tk ? 'border-primary-400 bg-primary-50 text-primary-700 font-medium dark:bg-primary-900/30 dark:text-primary-300' : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'),
          }, tk === 'chat' ? '💬 ' + t('chat', getLang()) : '⚙️ ' + t('tasks', getLang()))
        )
      ),
      // Chat tab: new chat + session search + session list (unchanged)
      tab === 'chat' && React.createElement('div', { className: 'p-2 border-b border-gray-100 dark:border-gray-700' },
        React.createElement('div', { className: 'flex items-center rounded-lg bg-primary-50 text-primary-600 hover:bg-primary-100 transition-colors overflow-visible' },
          React.createElement('button', { onClick: () => { newSession(); setSidebarOpen(false); }, className: 'flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium min-w-0' },
            React.createElement(Plus, { size: 13 }), t('new chat', getLang())),
          React.createElement('div', { className: 'relative border-l border-primary-200/60 flex-shrink-0' },
            React.createElement('button', { onClick: (e: React.MouseEvent) => { e.stopPropagation(); setMoreOpen(!moreOpen); }, className: 'px-1.5 py-2 text-primary-400 hover:text-primary-600', title: t('more actions', getLang()) },
              React.createElement(MoreHorizontal, { size: 13 })),
            moreOpen && React.createElement('div', { className: 'absolute right-0 top-full mt-1 w-44 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 py-1' },
              sessions.length > 1 && React.createElement('button', {
                onClick: () => { setMoreOpen(false); clearAllSessions(); },
                className: 'w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700',
              }, React.createElement(Trash2, { size: 12, className: 'text-red-400' }), t('clear all', getLang())),
              sessions.length > 0 && React.createElement('button', {
                onClick: () => {
                  setMoreOpen(false);
                  const blob = new Blob([JSON.stringify(sessions, null, 2)], { type: 'application/json' });
                  const a = document.createElement('a');
                  a.href = URL.createObjectURL(blob);
                  a.download = 'ai-sessions.json';
                  a.click();
                  URL.revokeObjectURL(a.href);
                },
                className: 'w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700',
              }, React.createElement(Download, { size: 12, className: 'text-gray-400' }), t('export all', getLang())),
              React.createElement('button', {
                onClick: () => {
                  setMoreOpen(false);
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = '.json';
                  input.onchange = async (e: any) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    try {
                      const data = JSON.parse(await file.text());
                      const imported = Array.isArray(data) ? data : [];
                      const valid = imported.filter((x: any) => x && typeof x.id === 'string' && Array.isArray(x.messages));
                      if (valid.length === 0) { alert(t('invalid sessions file', getLang())); return; }
                      for (const x of valid) {
                        api.post('/ai/sessions', { id: x.id, title: x.title || 'Imported', messages: x.messages }).then(() => serverIdsRef.current.add(x.id)).catch(() => {});
                      }
                      setSessions(prev => [...valid.map((x: any) => ({ id: x.id, title: x.title || 'Imported', messages: x.messages, ts: Date.now() })), ...prev]);
                      alert(t('imported sessions', getLang()) + ': ' + valid.length);
                    } catch { alert(t('invalid sessions file', getLang())); }
                  };
                  input.click();
                },
                className: 'w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700',
              }, React.createElement(Upload, { size: 12, className: 'text-gray-400' }), t('import', getLang()))
            )
          )
        ),
        React.createElement('div', { className: 'mt-1.5' },
          React.createElement('input', { value: sessionSearch, onChange: e => setSessionSearch(e.target.value), placeholder: t('search sessions', getLang()), className: 'input-field text-xs' })
        )
      ),
      // Tasks tab: status filter (in place of the new-chat row) + task search + task list
      tab === 'tasks' && React.createElement('div', { className: 'p-2 border-b border-gray-100 dark:border-gray-700' },
        React.createElement('div', { className: 'grid grid-cols-4 gap-1 mb-1.5' },
          (['', 'running', 'done', 'abnormal'] as const).map(s =>
            React.createElement('button', {
              key: s,
              onClick: () => setTaskFilter(s),
              className: 'px-1 py-1 text-[10px] rounded-lg border transition-colors text-center ' + (taskFilter === s ? 'border-primary-400 bg-primary-50 text-primary-700 font-medium dark:bg-primary-900/30 dark:text-primary-300' : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'),
            }, s ? t(s, getLang()) : t('all', getLang()))
          )
        ),
        React.createElement('input', { value: taskSearch, onChange: e => setTaskSearch(e.target.value), placeholder: t('search tasks', getLang()), className: 'input-field text-xs' })
      ),
      tab === 'tasks' && React.createElement('div', { className: 'flex-1 overflow-y-auto p-2 space-y-1' },
        tasksLoading && tasks.length === 0
          ? React.createElement('p', { className: 'text-xs text-gray-400 py-4 text-center' }, t('loading', getLang()) + '…')
          : (() => {
              const q = taskSearch.toLowerCase();
              const filtered = tasks.filter((tk: any) => (!taskFilter || (taskFilter === 'abnormal' ? (tk.status === 'failed' || tk.status === 'cancelled') : tk.status === taskFilter)) && tk.prompt.toLowerCase().includes(q));
              if (filtered.length === 0) return React.createElement('p', { className: 'text-xs text-gray-400 py-4 text-center' }, t('no tasks yet', getLang()));
              return filtered.map((tk: any) =>
                React.createElement('button', {
                  key: tk.id,
                  onClick: () => openTask(tk.id),
                  className: 'w-full text-left px-2.5 py-2 rounded-lg border transition-colors ' + (taskDetail?.id === tk.id ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/30' : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-700'),
                },
                  React.createElement('div', { className: 'flex items-center gap-2' },
                    React.createElement('span', { className: 'w-1.5 h-1.5 rounded-full shrink-0 ' + (tk.status === 'done' ? 'bg-green-500' : tk.status === 'failed' ? 'bg-red-500' : tk.status === 'cancelled' ? 'bg-gray-400' : 'bg-blue-500 animate-pulse') }),
                    React.createElement('span', { className: 'flex-1 text-xs text-gray-700 dark:text-gray-200 truncate' }, tk.prompt)
                  ),
                  React.createElement('div', { className: 'flex items-center gap-2 mt-1 pl-3.5' },
                    React.createElement('span', { className: 'text-[9px] text-gray-400' }, t(tk.status, getLang())),
                    React.createElement('span', { className: 'text-[9px] text-gray-400' }, new Date(tk.createdAt).toLocaleString()),
                    tk.status === 'failed' && React.createElement('button', { onClick: (e: React.MouseEvent) => { e.stopPropagation(); retryTask(tk.id); }, className: 'text-[9px] text-primary-600 hover:underline flex items-center gap-0.5' }, React.createElement(RotateCcw, { size: 9 }), t('retry', getLang())),
                    tk.status === 'running' && React.createElement('button', { onClick: (e: React.MouseEvent) => { e.stopPropagation(); cancelTask(tk.id); }, className: 'text-[9px] text-gray-400 hover:text-red-500' }, t('cancel', getLang())),
                    React.createElement('button', { onClick: (e: React.MouseEvent) => { e.stopPropagation(); deleteTask(tk.id); }, className: 'text-[9px] text-gray-300 hover:text-red-500' }, t('delete', getLang()))
                  )
                )
              );
            })()
      ),
      tab === 'chat' && React.createElement('div', { className: 'flex-1 overflow-y-auto p-2 space-y-1' },
        (() => {
          const now = Date.now();
          const day = 86_400_000;
          const filtered = sessions.filter(sess => sess.title.toLowerCase().includes(sessionSearch.toLowerCase()));
          const groups: [string, any[]][] = [
            [t('today', getLang()), filtered.filter(x => now - x.ts < day)],
            [t('yesterday', getLang()), filtered.filter(x => now - x.ts >= day && now - x.ts < 2 * day)],
            [t('earlier', getLang()), filtered.filter(x => now - x.ts >= 2 * day)],
          ];
          return groups.filter(([, list]) => list.length > 0).map(([label, list]) =>
            React.createElement('div', { key: label },
              React.createElement('p', { className: 'text-[10px] uppercase tracking-wide text-gray-400 px-2.5 pt-2 pb-1' }, label),
              list.map(sess =>
          renamingId === sess.id
            ? React.createElement('input', {
                key: sess.id,
                value: renameValue,
                autoFocus: true,
                onChange: (e: React.ChangeEvent<HTMLInputElement>) => setRenameValue(e.target.value),
                onKeyDown: (e: React.KeyboardEvent) => {
                  if (e.key === 'Enter') { renameSession(sess.id, renameValue.trim() || sess.title); setRenamingId(null); }
                  if (e.key === 'Escape') setRenamingId(null);
                },
                onBlur: () => { renameSession(sess.id, renameValue.trim() || sess.title); setRenamingId(null); },
                className: 'w-full px-2.5 py-1.5 text-xs rounded-lg border border-primary-300 outline-none',
              })
            : React.createElement('div', {
          key: sess.id,
          onClick: () => { openSessionFull(sess.id); setSidebarOpen(false); },
          onDoubleClick: () => { setRenamingId(sess.id); setRenameValue(sess.title); },
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
              )
            )
          ;
        })()
      ),
    );

  return React.createElement('div', { className: 'flex gap-4 h-[calc(100vh-140px)]' },
    // ---- Sessions sidebar (desktop) ----
    renderSidebar('w-56 flex-shrink-0 hidden md:flex'),
    // ---- Sessions drawer (mobile) ----
    sidebarOpen && React.createElement('div', { className: 'fixed inset-0 z-40 md:hidden bg-black/30', onClick: () => setSidebarOpen(false) },
      React.createElement('div', { className: 'absolute left-0 top-0 bottom-0 w-64 shadow-xl', onClick: (e: React.MouseEvent) => e.stopPropagation() }, renderSidebar('w-64 h-full rounded-none border-r'))
    ),
    // ---- Chat column ----
    React.createElement('div', { className: 'flex-1 flex flex-col min-w-0' },
    // (Chat/Tasks switcher lives at the top of the left sidebar)
    React.createElement('button', { onClick: () => setSidebarOpen(true), className: 'md:hidden self-start p-1.5 mb-2 text-gray-400 hover:text-primary-600 rounded-lg border border-gray-200 dark:border-gray-700' }, React.createElement(Menu, { size: 14 })),
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
        active?.messages.length ? React.createElement(React.Fragment, null,
          React.createElement('button', { onClick: exportSession, className: 'text-xs text-gray-400 hover:text-primary-600 flex items-center gap-1' },
            React.createElement(Download, { size: 12 }), t('export', getLang())),
          React.createElement('button', { onClick: shareSession, className: 'text-xs text-gray-400 hover:text-primary-600 flex items-center gap-1' },
            React.createElement(Share2, { size: 12 }), t('share', getLang())),
          React.createElement('button', {
            onClick: () => updateSession(active.id, x => ({ ...x, messages: [] })),
            className: 'text-xs text-gray-400 hover:text-red-600',
          }, t('clear history', getLang()))) : null,
        React.createElement('button', {
          onClick: () => setIncludeContext(!includeContext),
          title: t('site context', getLang()),
          className: 'text-[11px] px-2 py-1 rounded-lg border ' + (includeContext ? 'border-primary-300 bg-primary-50 text-primary-600' : 'border-gray-200 dark:border-gray-700 text-gray-400'),
        }, includeContext ? '🧠 ' + t('context on', getLang()) : t('context off', getLang())),
        React.createElement('div', { ref: paramsRef, className: 'relative' },
          React.createElement('button', { onClick: () => setParamsOpen(!paramsOpen), className: 'p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700', title: t('generation params', getLang()) },
            React.createElement(Settings2, { size: 16 })),
          paramsOpen && React.createElement('div', { className: 'absolute right-0 top-full mt-1 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 p-3 space-y-3' },
            React.createElement('div', null,
              React.createElement('label', { className: 'block text-[11px] text-gray-500 mb-1' }, t('temperature', getLang()) + ': ' + temperature.toFixed(1)),
              React.createElement('input', { type: 'range', min: 0, max: 2, step: 0.1, value: temperature, onChange: e => setTemperature(parseFloat(e.target.value)), className: 'w-full' })),
            React.createElement('div', null,
              React.createElement('label', { className: 'block text-[11px] text-gray-500 mb-1' }, t('max tokens', getLang())),
              React.createElement('select', { value: maxTokens, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => setMaxTokens(parseInt(e.target.value)), className: 'input-field text-xs' },
                [512, 1024, 2048, 4096, 8192, 16384].map(v => React.createElement('option', { key: v, value: v }, v))))
          ),
        ),
        React.createElement('div', { ref: notifRef, className: 'relative' },
          React.createElement('button', { onClick: () => setNotifOpen(!notifOpen), className: 'relative p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700' },
            React.createElement(Bell, { size: 16 }),
            unread > 0 && React.createElement('span', { className: 'absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[9px] flex items-center justify-center' }, unread)),
          notifOpen && React.createElement('div', { className: 'absolute right-0 top-full mt-1 w-72 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden' },
            React.createElement('div', { className: 'px-3 py-2 border-b border-gray-100 dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-200' }, t('notifications', getLang())),
            notifications.length === 0 && React.createElement('p', { className: 'p-3 text-xs text-gray-400' }, t('no notifications', getLang())),
            React.createElement('div', { className: 'max-h-72 overflow-y-auto' },
              notifications.map(n => React.createElement('button', {
                key: n.id,
                onClick: () => openNotification(n),
                className: 'w-full text-left px-3 py-2.5 border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors',
              },
                React.createElement('p', { className: 'text-xs text-gray-700 dark:text-gray-200 whitespace-pre-line' + (n.read ? ' opacity-60' : ' font-medium') }, n.message),
                React.createElement('p', { className: 'text-[10px] text-gray-400 mt-0.5' }, new Date(n.createdAt).toLocaleString())))),
          ),
        ),
      ),
    ),

    // Tasks panel (tab === 'tasks'): the left sidebar shows status filter +
    // search + task list; this column renders the selected task's detail and
    // the fixed input row (template picker button + textarea + run).
    tab === 'tasks' && React.createElement('div', { className: 'flex-1 flex flex-col min-h-0' },
      React.createElement('div', { className: 'flex-1 overflow-y-auto space-y-3 pr-2' },
        taskDetail
          ? React.createElement('div', { className: 'rounded-xl border border-gray-200 dark:border-gray-600 p-4 bg-gray-50 dark:bg-gray-800' },
              React.createElement('div', { className: 'flex items-center justify-between mb-2' },
                React.createElement('p', { className: 'text-sm font-semibold text-gray-800 dark:text-gray-100 break-words' }, taskDetail.prompt),
                React.createElement('button', { onClick: () => setTaskDetail(null), className: 'p-1 text-gray-400 hover:text-gray-700' }, React.createElement(X, { size: 14 }))
              ),
              React.createElement('div', { className: 'flex items-center gap-2 mb-3' },
                React.createElement('span', { className: 'px-1.5 py-0.5 text-[10px] rounded-full font-medium ' + (taskDetail.status === 'done' ? 'bg-green-100 text-green-700' : taskDetail.status === 'failed' ? 'bg-red-100 text-red-700' : taskDetail.status === 'cancelled' ? 'bg-gray-100 text-gray-500' : 'bg-blue-100 text-blue-700 animate-pulse') }, t(taskDetail.status, getLang())),
                taskDetail.error && React.createElement('span', { className: 'text-xs text-red-600 break-words' }, '✗ ' + taskDetail.error)
              ),
              taskDetail.steps && taskDetail.steps.length > 0 && React.createElement('div', { className: 'space-y-1.5 max-h-56 overflow-y-auto mb-2' },
                taskDetail.steps.map((st: any, i: number) =>
                  st.type === 'think'
                    ? React.createElement('div', { key: i, className: 'text-xs text-gray-600 dark:text-gray-300' }, '💭 ' + String(st.content || '').slice(0, 300))
                    : React.createElement('details', { key: i, open: taskDetail.status === 'running', className: 'text-xs text-gray-600 dark:text-gray-300' },
                        React.createElement('summary', { className: 'cursor-pointer' }, '🔧 ' + st.name + ' ' + JSON.stringify(st.args || {}).slice(0, 100)),
                        st.output !== undefined && renderToolOutput(String(st.output).slice(0, 2000))
                      )
                )
              ),
              taskDetail.result && React.createElement('div', { className: 'text-xs text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-900 rounded-lg p-2.5 max-h-52 overflow-y-auto' }, renderMd(taskDetail.result))
            )
          : React.createElement('div', { className: 'h-full flex flex-col items-center justify-center text-center' },
              React.createElement(ListChecks, { size: 36, className: 'text-gray-300 dark:text-gray-600 mb-3' }),
              React.createElement('p', { className: 'text-sm text-gray-400 max-w-xs' }, t('select task hint', getLang()))
            )
      ),
      // Task creation input (tasks tab, fixed at the bottom)
      React.createElement('div', { className: 'mt-4' },
        // Char counter on its own row above the buttons (does not consume
        // the run button's height)
        React.createElement('div', { className: 'flex justify-end mb-1' },
          React.createElement('span', { className: 'text-[9px] text-gray-400 leading-none' }, input.length + '/2000')
        ),
        React.createElement('div', { ref: tplRef, className: 'relative flex gap-2 items-stretch' },
          React.createElement('button', {
            onClick: () => setTplOpen(!tplOpen),
            title: t('task templates', getLang()),
            className: 'w-10 px-0 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 text-gray-400 hover:text-primary-600 hover:bg-gray-50 dark:hover:bg-gray-700 flex-shrink-0',
          }, React.createElement(LayoutTemplate, { size: 16 })),
          React.createElement('textarea', {
            ref: taskInputRef,
            value: input,
            onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value.slice(0, 2000)),
            onKeyDown: (e: React.KeyboardEvent) => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); startTask(); } },
            placeholder: t('describe a task to run', getLang()),
            rows: 2,
            maxLength: 2000,
            className: 'input-field flex-1 resize-none min-w-0',
          }),
          React.createElement('button', {
            onClick: openTplModal,
            disabled: !input.trim() || myTemplates.length >= 8,
            title: t('save input as template', getLang()),
            className: 'w-10 px-0 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 text-gray-400 hover:text-primary-600 hover:bg-gray-50 dark:hover:bg-gray-700 flex-shrink-0 disabled:opacity-40',
          }, React.createElement(Bookmark, { size: 14 })),
          React.createElement('button', { onClick: startTask, disabled: !input.trim() || busy, className: 'btn-primary w-28 justify-center flex-shrink-0' }, React.createElement(Rocket, { size: 14 }), t('run task', getLang())),
          tplOpen && React.createElement('div', { className: 'absolute bottom-full left-0 mb-2 w-96 max-w-[calc(100vw-2rem)] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden flex' },
            React.createElement('div', { className: 'w-32 shrink-0 border-r border-gray-100 dark:border-gray-700 py-1 max-h-72 overflow-y-auto' },
              [...TASK_TEMPLATE_GROUPS, ...(myTemplates.length ? [{ category: t('my templates', getLang()), icon: '📌', templates: myTemplates.map(m => ({ label: m.name, prompt: m.prompt })) }] : [])].map((g, gi) =>
                React.createElement('button', {
                  key: g.category,
                  onClick: () => setTplGroup(gi),
                  className: 'w-full text-left px-3 py-2 text-xs flex items-center gap-2 transition-colors ' + (tplGroup === gi ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-medium' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'),
                }, React.createElement('span', null, g.icon), React.createElement('span', { className: 'truncate' }, g.category))
              )
            ),
            React.createElement('div', { className: 'flex-1 py-1 max-h-72 overflow-y-auto' },
              (() => {
                const all = [...TASK_TEMPLATE_GROUPS, ...(myTemplates.length ? [{ category: t('my templates', getLang()), icon: '📌', templates: myTemplates.map(m => ({ label: m.name, prompt: m.prompt })) }] : [])];
                const g = all[Math.min(tplGroup, all.length - 1)];
                return g.templates.map((tt: any) =>
                  React.createElement('button', {
                    key: tt.label,
                    onClick: () => { applyTemplate(tt.prompt); setTplOpen(false); },
                    title: tt.prompt,
                    className: 'w-full text-left px-3 py-2 text-xs text-gray-600 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-gray-700 hover:text-primary-700 flex items-center gap-2',
                  },
                    React.createElement('span', { className: 'truncate' }, tt.label)
                  )
                );
              })()
            )
          )
        ),
      )
    ),
    // Save-template dialog (name + content)
    tplModal && React.createElement('div', { className: 'fixed inset-0 z-[100] bg-black/40 flex items-center justify-center p-4', onClick: () => setTplModal(false) },
      React.createElement('div', { className: 'bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-5', onClick: (e: React.MouseEvent) => e.stopPropagation() },
        React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 dark:text-white mb-4' }, t('save input as template', getLang())),
        React.createElement('label', { className: 'block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1' }, t('template name', getLang())),
        React.createElement('input', {
          value: tplName,
          onChange: (e: React.ChangeEvent<HTMLInputElement>) => setTplName(e.target.value),
          placeholder: t('template name placeholder', getLang()),
          autoFocus: true,
          className: 'input-field text-sm mb-3',
        }),
        React.createElement('label', { className: 'block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1' }, t('template content', getLang())),
        React.createElement('textarea', {
          value: tplContent,
          onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => setTplContent(e.target.value),
          rows: 5,
          className: 'input-field text-sm mb-4 resize-none',
        }),
        React.createElement('div', { className: 'flex justify-end gap-2' },
          React.createElement('button', { onClick: () => setTplModal(false), className: 'btn-secondary text-sm' }, t('cancel', getLang())),
          React.createElement('button', { onClick: confirmSaveTemplate, disabled: !tplName.trim() || !tplContent.trim(), className: 'btn-primary text-sm' }, t('save', getLang()))
        )
      )
    ),

    // Messages (chat tab only)
    tab === 'chat' && React.createElement('div', { className: 'flex-1 overflow-y-auto overflow-x-hidden space-y-4 pr-2' },
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
        return React.createElement('div', { key: i, className: 'flex gap-3 min-w-0 ' + (m.role === 'user' ? 'justify-end' : '') },
          m.role === 'assistant' && React.createElement('div', { className: 'w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0' },
            React.createElement(Bot, { size: 15, className: 'text-white' })),
          React.createElement('div', { className: 'max-w-[75%] min-w-0 break-words ' + (m.role === 'user' ? 'bg-primary-600 text-white rounded-2xl rounded-br-md px-4 py-2.5' : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl rounded-tl-md px-4 py-2.5 shadow-sm group') },
            m.tools && m.tools.length > 0 && React.createElement('div', { className: 'mb-2 flex flex-wrap gap-1' },
              m.tools.map((tool, j) => React.createElement('span', { key: j, className: 'text-[10px] px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-500/20 text-purple-600 dark:text-purple-300 border border-purple-100 dark:border-purple-500/30' }, '⚡ ' + tool))),
            m.role === 'assistant' && m.toolResults && m.toolResults.length > 0 && React.createElement('div', { className: 'mb-1 space-y-0.5' },
              m.toolResults.map((tr: any, ti: number) =>
                React.createElement('details', { key: ti, open: busy && i === messages.length - 1, className: 'text-[10px] rounded-lg bg-gray-50 dark:bg-gray-800/60 px-2 py-1' },
                  React.createElement('summary', { className: 'cursor-pointer text-gray-500 dark:text-gray-400' }, '🔧 ' + tr.name + ' ' + t('result', getLang())),
                  renderToolOutput(String(tr.output || ''))
                )
              )),
            m.role === 'assistant' && !m.content && busy
              ? React.createElement('div', { className: 'flex gap-1 py-1' },
                  [0, 1, 2].map(d => React.createElement('span', { key: d, className: 'w-1.5 h-1.5 rounded-full bg-gray-300 animate-bounce', style: { animationDelay: d * 0.15 + 's' } })))
              : React.createElement('div', { className: m.role === 'user' ? 'text-sm break-words min-w-0' : 'min-w-0 break-words' },
                  m.role === 'user' ? m.content : (() => {
                    const msgKey = String(m.ts || '') + '-' + i;
                    const isLong = m.content.length > 600;
                    const showFull = !isLong || expanded[msgKey];
                    const preview = m.content.slice(0, 300) + '…';
                    return React.createElement(React.Fragment, null,
                      React.createElement('div', { className: 'min-w-0 break-words' }, showFull ? renderMd(m.content) : renderMd(preview)),
                      isLong && React.createElement('button', {
                        onClick: () => setExpanded({ ...expanded, [msgKey]: !showFull }),
                        className: 'text-xs text-primary-600 hover:text-primary-700 mt-1',
                      }, showFull ? t('collapse', getLang()) : t('expand all', getLang()))
                    );
                  })()),
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

    // Input (chat tab only): same height/width rhythm as the task input row
    // so switching tabs never shifts the bottom controls
    tab === 'chat' && React.createElement('div', { className: 'mt-4' },
      React.createElement('div', { className: 'flex justify-end mb-1' },
        React.createElement('span', { className: 'text-[9px] text-gray-400 leading-none' }, t('enter to send hint', getLang()))
      ),
      React.createElement('div', { ref: promptsRef, className: 'relative flex gap-2 items-stretch' },
        React.createElement('button', {
          onClick: () => setPromptsOpen(!promptsOpen),
          title: t('prompt library', getLang()),
          className: 'w-10 px-0 flex items-center justify-center flex-shrink-0 text-gray-400 hover:text-primary-600 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700',
        }, React.createElement(BookOpen, { size: 16 })),
        promptsOpen && React.createElement('div', { className: 'absolute bottom-full left-0 mb-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 py-1 max-h-72 overflow-y-auto' },
          PROMPT_LIBRARY.map((p, i) => React.createElement('button', {
            key: i,
            onClick: () => { setInput(p.text); setPromptsOpen(false); },
            className: 'w-full text-left px-3 py-2 text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700',
          }, p.label))
        ),
        React.createElement('textarea', {
          value: input,
          onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => { setInput(e.target.value); setCmdOpen(e.target.value.trim().startsWith('/')); },
          onKeyDown: (e: React.KeyboardEvent) => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); send(); setCmdOpen(false); } },
          placeholder: t('ask ai something', getLang()),
          rows: 2,
          className: 'input-field flex-1 resize-none min-w-0',
        }),
        // Slash-command quick palette
        cmdOpen && React.createElement('div', { className: 'absolute bottom-full left-0 mb-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 py-1 max-h-64 overflow-y-auto' },
          ([
            ['/stats', t('view site stats', getLang())],
            ['/posts', t('recent posts', getLang())],
            ['/draft ', t('write a draft', getLang())],
            ['/comments', t('pending comments', getLang())],
            ['/context', t('site overview', getLang())],
            ['/seo', t('seo suggestions', getLang())],
            ['/memory', t('my memory', getLang())],
            ['/tasks', t('task status', getLang())],
            ['/translate ', t('translate a post', getLang())],
            ['/help', t('show help', getLang())],
          ] as [string, string][]).map(([cmd, desc]) =>
            React.createElement('button', {
              key: cmd,
              onClick: () => { setInput(cmd); setCmdOpen(false); },
              className: 'w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700',
            },
              React.createElement('code', { className: 'text-xs text-primary-600 font-semibold' }, cmd),
              React.createElement('span', { className: 'text-xs text-gray-500 truncate' }, desc)
            )
          )
        ),
        React.createElement('button', {
          onClick: toggleVoice,
          title: t('voice input', getLang()),
          className: 'w-10 px-0 flex items-center justify-center flex-shrink-0 rounded-lg border ' + (listening ? 'border-red-400 bg-red-50 text-red-600 animate-pulse' : 'border-gray-200 dark:border-gray-700 text-gray-400 hover:text-primary-600 hover:bg-gray-50 dark:hover:bg-gray-700'),
        }, React.createElement(Mic, { size: 16 })),
        busy
          ? React.createElement('button', { onClick: stop, className: 'btn-danger w-28 justify-center flex-shrink-0' }, React.createElement(Square, { size: 16 }), t('stop', getLang()))
          : React.createElement('button', { onClick: () => send(), disabled: !input.trim(), className: 'btn-primary w-28 justify-center flex-shrink-0' },
              React.createElement(Send, { size: 16 }), t('send', getLang()))
      )
    )
  )
  );
}
