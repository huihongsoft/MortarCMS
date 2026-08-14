import React, { useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent, NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react';
import { Node, mergeAttributes } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import MarkdownIt from 'markdown-it';
import TurndownService from 'turndown';
import DOMPurify from 'dompurify';
import { Bold, Italic, Strikethrough, Heading1, Heading2, Heading3, List, ListOrdered, Quote, Code, Link2, ImagePlus, Undo2, Redo2, Eye, PenLine, Code2, X, LayoutGrid as BlocksIcon, Braces, LayoutTemplate, Check as CheckIcon, Trash2 as TrashIcon } from 'lucide-react';
import api from '../lib/api';
import { t, getLang } from '../lib/i18n';

export type EditorMode = 'rich' | 'markdown' | 'html';

const mdIt = new MarkdownIt({ html: true, linkify: true });
const turndown = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' });
turndown.keep(['iframe', 'figure', 'video', 'audio']);
turndown.remove(['script', 'style']);

export function htmlToMarkdown(html: string): string {
  try { return turndown.turndown(html || ''); } catch { return html || ''; }
}

export function markdownToHtml(md: string): string {
  try { return DOMPurify.sanitize(mdIt.render(md || '')); } catch { return md || ''; }
}

// ---- Custom HTML block (raw HTML snippet with preview/edit modes) ----
function CustomHtmlView({ node, updateAttributes, deleteNode }: any) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(node.attrs.html || '');

  return React.createElement(NodeViewWrapper, { className: 'custom-html-block relative group my-2' },
    React.createElement('div', { className: 'absolute top-1 right-1 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity' },
      React.createElement('button', { onClick: () => { setEditing(!editing); setDraft(node.attrs.html || ''); }, className: 'p-1 bg-white border border-gray-200 rounded text-gray-500 hover:text-primary-600 shadow-sm', title: editing ? t('done', getLang()) : t('edit html', getLang()) },
        editing ? React.createElement(CheckIcon, { size: 12 }) : React.createElement(Braces, { size: 12 })),
      React.createElement('button', { onClick: () => deleteNode(), className: 'p-1 bg-white border border-gray-200 rounded text-gray-500 hover:text-red-600 shadow-sm', title: t('delete block', getLang()) },
        React.createElement(TrashIcon, { size: 12 })),
    ),
    editing
      ? React.createElement('div', { className: 'border border-dashed border-gray-300 rounded p-2 bg-gray-50' },
          React.createElement('textarea', {
            value: draft, rows: 4,
            onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => setDraft(e.target.value),
            className: 'w-full text-xs font-mono p-2 border border-gray-200 rounded focus:outline-none focus:border-primary-400 bg-white',
            placeholder: t('paste any html snippet...', getLang()),
          }),
          React.createElement('button', { onClick: () => { updateAttributes({ html: draft }); setEditing(false); }, className: 'mt-1 text-xs bg-primary-600 text-white px-2 py-1 rounded hover:bg-primary-700' }, t('save', getLang())),
        )
      : React.createElement('div', { className: 'border border-gray-200 rounded p-3 hover:border-gray-300 transition-colors', dangerouslySetInnerHTML: { __html: DOMPurify.sanitize(node.attrs.html || '') } }),
  );
}

const CustomHtml = Node.create({
  name: 'customHtml',
  group: 'block',
  atom: true,
  addAttributes() {
    return { html: { default: '' } };
  },
  parseHTML() {
    return [{ tag: 'div[data-custom-html]', getAttrs: (el: HTMLElement) => ({ html: el.innerHTML }) }];
  },
  renderHTML({ node, HTMLAttributes }) {
    // Keep the raw snippet as innerHTML inside the wrapper so it survives serialization
    const div = document.createElement('div');
    for (const [k, v] of Object.entries(HTMLAttributes)) if (k !== 'html' && v) div.setAttribute(k, String(v));
    div.setAttribute('data-custom-html', '');
    div.innerHTML = DOMPurify.sanitize(node.attrs.html || '');
    return { dom: div };
  },
  addNodeView() {
    return ReactNodeViewRenderer(CustomHtmlView);
  },
});

// ---- Block template library ----
const BLOCK_TEMPLATES = [
  { name: t('two columns', getLang()), html: '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;"><div><p>Left column content</p></div><div><p>Right column content</p></div></div>' },
  { name: t('callout note', getLang()), html: '<div style="background:#fef3c7;border-left:4px solid #f59e0b;padding:12px 16px;border-radius:4px;"><p><strong>Note:</strong> Replace this callout text.</p></div>' },
  { name: t('image + caption', getLang()), html: '<figure><img src="/uploads/placeholder.jpg" alt=""><figcaption style="text-align:center;color:#6b7280;font-size:13px;margin-top:6px;">Caption text</figcaption></figure>' },
  { name: t('info box', getLang()), html: '<div style="background:#eff6ff;border-left:4px solid #3b82f6;padding:12px 16px;border-radius:4px;"><p><strong>Info:</strong> Replace this info text.</p></div>' },
  { name: t('highlight card', getLang()), html: '<div style="background:linear-gradient(135deg,#f9a8d4,#c4b5fd);padding:20px;border-radius:12px;color:#fff;text-align:center;"><h3 style="margin:0 0 8px;">Highlight Title</h3><p style="margin:0;">Highlight description text.</p></div>' },
];

interface RichEditorProps {
  value: string;          // HTML
  onChange: (html: string) => void;
  placeholder?: string;
}

export default function RichEditor({ value, onChange, placeholder }: RichEditorProps) {
  const [mode, setMode] = useState<EditorMode>('rich');
  const [mdBuffer, setMdBuffer] = useState('');
  const [htmlBuffer, setHtmlBuffer] = useState('');
  const [showMedia, setShowMedia] = useState(false);
  const [mediaList, setMediaList] = useState<any[]>([]);
  const [showBlocks, setShowBlocks] = useState(false);
  const [blocks, setBlocks] = useState<any[]>([]);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [selImage, setSelImage] = useState<{ pos: number; alt: string } | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [customTemplates, setCustomTemplates] = useState<any[]>([]);
  const [newTplName, setNewTplName] = useState('');
  const [newTplHtml, setNewTplHtml] = useState('');
  const [showTplForm, setShowTplForm] = useState(false);
  const lastEmitted = useRef<string>(value || '');

  const editor = useEditor({
    extensions: [StarterKit, Link.configure({ openOnClick: false }), Image, CustomHtml],
    content: value || '',
    onUpdate: ({ editor }) => {
      lastEmitted.current = editor.getHTML();
      onChange(editor.getHTML());
      refreshBlocks(editor);
    },
    immediatelyRender: false,
  });

  // Block outline: top-level nodes with positions
  function refreshBlocks(ed: any) {
    if (!ed) return;
    const list: any[] = [];
    ed.state.doc.forEach((node: any, offset: number) => {
      const type = node.type.name;
      const text = (node.textContent || '').slice(0, 40);
      const icon = type === 'heading' ? 'H' + node.attrs.level : type === 'paragraph' ? 'P' : type === 'blockquote' ? '\u275E' : type === 'codeBlock' ? '{ }' : type === 'image' ? '\u{1F5BC}' : type === 'bulletList' ? '\u2022' : type === 'orderedList' ? '1.' : '·';
      list.push({ pos: offset, type, text, icon });
    });
    setBlocks(list);
  }

  // Track image selection for block settings
  useEffect(() => {
    if (!editor || mode !== 'rich') return;
    const onSel = () => {
      const { from } = editor.state.selection;
      const node = editor.state.doc.nodeAt(from);
      if (node && node.type.name === 'image') setSelImage({ pos: from, alt: node.attrs.alt || '' });
      else setSelImage(null);
    };
    editor.on('selectionUpdate', onSel);
    return () => { editor.off('selectionUpdate', onSel); };
  }, [editor, mode]);

  // External value changes (load post / revision restore) sync into current view
  useEffect(() => {
    const v = value || '';
    if (lastEmitted.current === v) return;
    lastEmitted.current = v;
    if (editor && mode === 'rich' && v !== editor.getHTML()) {
      editor.commands.setContent(v, { emitUpdate: false });
      refreshBlocks(editor);
    }
    if (mode === 'markdown') setMdBuffer(htmlToMarkdown(v));
    if (mode === 'html') setHtmlBuffer(v);
  }, [value, mode, editor]);

  const emit = (html: string) => {
    lastEmitted.current = html;
    onChange(html);
  };

  const switchMode = (m: EditorMode) => {
    if (m === mode) return;
    const cur = (() => {
      if (mode === 'rich') return editor ? editor.getHTML() : value || '';
      if (mode === 'markdown') return markdownToHtml(mdBuffer);
      return htmlBuffer;
    })();
    if (m === 'markdown') { setMdBuffer(htmlToMarkdown(cur)); emit(cur); }
    else if (m === 'html') { setHtmlBuffer(cur); emit(cur); }
    else { // rich: feed back into editor via value effect
      emit(cur);
      if (editor) editor.commands.setContent(cur, { emitUpdate: false });
    }
    setMode(m);
  };

  async function openMedia() {
    try { const r = await api.get('/media'); setMediaList(r.data || []); } catch {}
    setShowMedia(true);
  }

  // Block panel operations: reorder / remove / locate / image settings
  function moveBlock(from: number, to: number) {
    if (!editor || from === to) return;
    const json = editor.getJSON();
    const arr = json.content || [];
    if (from < 0 || from >= arr.length || to < 0 || to >= arr.length) return;
    const [item] = arr.splice(from, 1);
    arr.splice(to, 0, item);
    json.content = arr;
    editor.commands.setContent(json);
  }

  function removeBlock(idx: number) {
    if (!editor) return;
    const json = editor.getJSON();
    const arr = json.content || [];
    if (idx < 0 || idx >= arr.length) return;
    arr.splice(idx, 1);
    json.content = arr;
    editor.commands.setContent(json);
  }

  function locateBlock(pos: number) {
    if (!editor) return;
    editor.chain().focus().setTextSelection({ from: pos, to: pos }).run();
  }

  function updateImageAlt(alt: string) {
    if (!editor || !selImage) return;
    editor.chain().focus().setTextSelection({ from: selImage.pos, to: selImage.pos }).updateAttributes('image', { alt }).run();
    setSelImage({ ...selImage, alt });
  }

  const blockTypeLabel: Record<string, string> = {
    paragraph: t('paragraph', getLang()), heading: t('heading', getLang()), blockquote: t('quote', getLang()), codeBlock: t('code', getLang()), image: t('image', getLang()),
    bulletList: t('list', getLang()), orderedList: t('numbered list', getLang()), horizontalRule: t('divider', getLang()), hardBreak: t('break', getLang()),
  };

  async function loadCustomTemplates() {
    try { const r = await api.get('/editor/templates'); setCustomTemplates(r.data.templates || []); } catch {}
  }

  async function saveCustomTemplate() {
    if (!newTplName.trim() || !newTplHtml.trim()) return;
    try {
      const r = await api.post('/editor/templates', { name: newTplName, html: newTplHtml });
      setCustomTemplates([...customTemplates, r.data]);
      setNewTplName(''); setNewTplHtml(''); setShowTplForm(false);
    } catch {}
  }

  async function exportTemplates() {
    try {
      const r = await api.get('/editor/templates/export');
      const blob = new Blob([JSON.stringify(r.data, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'mortar-templates.json';
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {}
  }

  async function importTemplates(file: File | undefined) {
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const r = await api.post('/editor/templates/import', { templates: data.templates || [data] });
      loadCustomTemplates();
      alert(t('imported', getLang()) + ' ' + r.data.imported + ' template(s)');
    } catch { alert(t('invalid template file', getLang())); }
  }

  async function deleteCustomTemplate(id: string) {
    try { await api.delete('/editor/templates/' + id); setCustomTemplates(customTemplates.filter(t => t.id !== id)); } catch {}
  }

  function insertTemplate(tpl: any) {
    if (!editor) return;
    // Templates carry custom styling — wrap as a customHtml block to preserve it exactly
    editor.chain().focus().insertContent({ type: 'customHtml', attrs: { html: tpl.html } }).run();
    setShowTemplates(false);
  }

  function insertHtmlBlock() {
    if (!editor) return;
    editor.chain().focus().insertContent({ type: 'customHtml', attrs: { html: '<p style="color:#6b7280;">Your custom HTML block — click the braces icon to edit.</p>' } }).run();
  }

  function insertMedia(m: any) {
    if (mode === 'rich' && editor) {
      editor.chain().focus().setImage({ src: m.url, alt: m.alt || m.title || '' }).run();
    } else if (mode === 'markdown') {
      // Escape markdown syntax chars so a crafted file name cannot break out
      // of the image syntax and inject markup
      const mdEsc = (s: string) => String(s ?? '').replace(/([\\[\]()])/g, '\\$1');
      const add = '\n\n![' + mdEsc(m.alt || m.title || 'image') + '](' + mdEsc(m.url) + ')\n\n';
      setMdBuffer(b => { const nb = b + add; emit(markdownToHtml(nb)); return nb; });
    } else {
      const escAttr = (s: any) => String(s ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const add = '<img src="' + escAttr(m.url) + '" alt="' + escAttr(m.alt || '') + '">';
      setHtmlBuffer(b => { const nb = b + add; emit(nb); return nb; });
    }
    setShowMedia(false);
  }

  const btn = (title: string, onClick: () => void, active = false, icon?: React.ReactNode) =>
    React.createElement('button', {
      type: 'button', key: title, title, onClick,
      className: `p-1.5 rounded hover:bg-gray-100 ${active ? 'text-primary-600 bg-gray-100' : 'text-gray-500'}`,
    }, icon || title);

  return React.createElement('div', { className: 'border border-gray-300 rounded-lg overflow-hidden focus-within:border-primary-500 bg-white' },
    // Mode bar
    React.createElement('div', { className: 'flex items-center justify-between bg-gray-50 border-b border-gray-200 px-2 py-1' },
      React.createElement('div', { className: 'flex items-center gap-0.5' },
        btn(t('visual', getLang()), () => switchMode('rich'), mode === 'rich', React.createElement(Eye, { size: 14 })),
        btn(t('markdown', getLang()), () => switchMode('markdown'), mode === 'markdown', React.createElement(PenLine, { size: 14 })),
        btn(t('html', getLang()), () => switchMode('html'), mode === 'html', React.createElement(Code2, { size: 14 })),
      ),
    ),
    mode === 'rich' && editor && React.createElement(React.Fragment, null,
      React.createElement('div', { className: 'flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-gray-200' },
        btn(t('bold', getLang()), () => editor.chain().focus().toggleBold().run(), editor.isActive('bold'), React.createElement(Bold, { size: 14 })),
        btn(t('italic', getLang()), () => editor.chain().focus().toggleItalic().run(), editor.isActive('italic'), React.createElement(Italic, { size: 14 })),
        btn(t('strike', getLang()), () => editor.chain().focus().toggleStrike().run(), editor.isActive('strike'), React.createElement(Strikethrough, { size: 14 })),
        React.createElement('span', { className: 'w-px h-4 bg-gray-200 mx-1' }),
        btn(t('heading', getLang()) + ' 1', () => editor.chain().focus().toggleHeading({ level: 1 }).run(), editor.isActive('heading', { level: 1 }), React.createElement(Heading1, { size: 14 })),
        btn(t('heading', getLang()) + ' 2', () => editor.chain().focus().toggleHeading({ level: 2 }).run(), editor.isActive('heading', { level: 2 }), React.createElement(Heading2, { size: 14 })),
        btn(t('heading', getLang()) + ' 3', () => editor.chain().focus().toggleHeading({ level: 3 }).run(), editor.isActive('heading', { level: 3 }), React.createElement(Heading3, { size: 14 })),
        React.createElement('span', { className: 'w-px h-4 bg-gray-200 mx-1' }),
        btn(t('bullet list', getLang()), () => editor.chain().focus().toggleBulletList().run(), editor.isActive('bulletList'), React.createElement(List, { size: 14 })),
        btn(t('numbered list', getLang()), () => editor.chain().focus().toggleOrderedList().run(), editor.isActive('orderedList'), React.createElement(ListOrdered, { size: 14 })),
        btn(t('blockquote', getLang()), () => editor.chain().focus().toggleBlockquote().run(), editor.isActive('blockquote'), React.createElement(Quote, { size: 14 })),
        btn(t('code block', getLang()), () => editor.chain().focus().toggleCodeBlock().run(), editor.isActive('codeBlock'), React.createElement(Code, { size: 14 })),
        React.createElement('span', { className: 'w-px h-4 bg-gray-200 mx-1' }),
        btn(t('link', getLang()), () => {
          const url = prompt('URL:');
          if (url && !/^javascript:|^data:/i.test(url)) editor.chain().focus().setLink({ href: url }).run();
        }, editor.isActive('link'), React.createElement(Link2, { size: 14 })),
        btn(t('image', getLang()), () => openMedia(), false, React.createElement(ImagePlus, { size: 14 })),
        btn(t('html block', getLang()), () => insertHtmlBlock(), false, React.createElement(Braces, { size: 14 })),
        btn(t('templates', getLang()), () => { setShowTemplates(!showTemplates); if (!showTemplates) loadCustomTemplates(); }, showTemplates, React.createElement(LayoutTemplate, { size: 14 })),
        React.createElement('span', { className: 'w-px h-4 bg-gray-200 mx-1' }),
        btn(t('undo', getLang()), () => editor.chain().focus().undo().run(), false, React.createElement(Undo2, { size: 14 })),
        btn(t('redo', getLang()), () => editor.chain().focus().redo().run(), false, React.createElement(Redo2, { size: 14 })),
        React.createElement('span', { className: 'w-px h-4 bg-gray-200 mx-1' }),
        btn(t('blocks', getLang()), () => { setShowBlocks(!showBlocks); refreshBlocks(editor); }, showBlocks, React.createElement(BlocksIcon, { size: 14 })),
      ),
      // Block outline panel: drag to reorder, click to locate, delete to remove
      showBlocks && React.createElement('div', { className: 'border-b border-gray-200 bg-gray-50' },
        React.createElement('div', { className: 'px-2 py-1.5 text-[10px] uppercase tracking-wider text-gray-400 font-medium flex items-center justify-between' },
          React.createElement('span', null, t('blocks', getLang()) + ' (' + blocks.length + ') — ' + t('drag to reorder', getLang())),
          React.createElement('button', { onClick: () => setShowBlocks(false), className: 'text-gray-400 hover:text-gray-600' }, '\u00d7'),
        ),
        React.createElement('div', { className: 'max-h-48 overflow-auto px-1 pb-1.5 space-y-0.5' },
          blocks.map((b: any, i: number) =>
            React.createElement('div', {
              key: b.pos + '-' + i,
              draggable: true,
              onDragStart: () => setDragIdx(i),
              onDragOver: (e: React.DragEvent) => e.preventDefault(),
              onDrop: (e: React.DragEvent) => { e.preventDefault(); if (dragIdx !== null) { moveBlock(dragIdx, i); setDragIdx(null); } },
              onClick: () => locateBlock(b.pos),
              className: 'group flex items-center gap-1.5 px-2 py-1 rounded bg-white border border-gray-200 cursor-grab hover:border-primary-400 text-xs',
            },
              React.createElement('span', { className: 'text-gray-300 cursor-grab select-none' }, '\u2630'),
              React.createElement('span', { className: 'w-5 text-center font-mono text-[10px] text-gray-400' }, b.icon),
              React.createElement('span', { className: 'flex-1 truncate text-gray-700' }, (blockTypeLabel[b.type] || b.type) + (b.text ? ': ' + b.text : '')),
              React.createElement('button', { onClick: (e: React.MouseEvent) => { e.stopPropagation(); moveBlock(i, Math.max(0, i - 1)); }, className: 'opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-700', title: t('move up', getLang()) }, '\u2191'),
              React.createElement('button', { onClick: (e: React.MouseEvent) => { e.stopPropagation(); moveBlock(i, Math.min(blocks.length - 1, i + 1)); }, className: 'opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-700', title: t('move down', getLang()) }, '\u2193'),
              React.createElement('button', { onClick: (e: React.MouseEvent) => { e.stopPropagation(); removeBlock(i); }, className: 'opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600', title: t('delete block', getLang()) }, '\u00d7'),
            )
          ),
          blocks.length === 0 && React.createElement('p', { className: 'text-[10px] text-gray-400 px-2 py-1' }, t('empty document — start typing to create blocks', getLang())),
        ),
        // Image block settings
        selImage && React.createElement('div', { className: 'px-2 pb-2 flex items-center gap-2' },
          React.createElement('label', { className: 'text-[10px] text-gray-500 shrink-0' }, t('image alt', getLang()) + ':'),
          React.createElement('input', {
            value: selImage.alt, placeholder: t('describe the image...', getLang()),
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => updateImageAlt(e.target.value),
            className: 'flex-1 text-xs px-2 py-1 border border-gray-200 rounded bg-white focus:outline-none focus:border-primary-400',
          }),
        ),
      ),
      React.createElement(EditorContent, { editor, className: 'prose max-w-none px-3 py-2 min-h-[300px] focus:outline-none' }),
    ),
    mode === 'markdown' && React.createElement('div', { className: 'grid grid-cols-2 gap-0' },
      React.createElement('textarea', {
        className: 'p-3 min-h-[300px] font-mono text-sm focus:outline-none border-r border-gray-200 resize-y',
        value: mdBuffer,
        placeholder: placeholder || t('write in markdown...', getLang()),
        onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => { setMdBuffer(e.target.value); emit(markdownToHtml(e.target.value)); },
      }),
      React.createElement('div', { className: 'prose max-w-none p-3 min-h-[300px] overflow-auto', dangerouslySetInnerHTML: { __html: markdownToHtml(mdBuffer) } }),
    ),
    mode === 'html' && React.createElement('textarea', {
      className: 'p-3 min-h-[300px] font-mono text-sm w-full focus:outline-none resize-y',
      value: htmlBuffer,
      placeholder: placeholder || t('write html...', getLang()),
      onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => { setHtmlBuffer(e.target.value); emit(DOMPurify.sanitize(e.target.value)); },
    }),
    // Media picker modal
    showMedia && React.createElement('div', { className: 'fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4' },
      React.createElement('div', { className: 'bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col' },
        React.createElement('div', { className: 'flex items-center justify-between px-4 py-3 border-b border-gray-200' },
          React.createElement('h3', { className: 'font-semibold text-gray-900' }, t('insert media', getLang())),
          React.createElement('button', { onClick: () => setShowMedia(false), className: 'p-1 text-gray-400 hover:text-gray-600' }, React.createElement(X, { size: 18 })),
        ),
        React.createElement('div', { className: 'p-4 overflow-auto grid grid-cols-3 gap-3' },
          mediaList.length === 0
            ? React.createElement('p', { className: 'col-span-3 text-sm text-gray-400 text-center py-10' }, t('no media uploaded yet', getLang()))
            : mediaList.map((m: any) =>
                React.createElement('button', {
                  key: m.id, onClick: () => insertMedia(m), className: 'group border border-gray-200 rounded-lg overflow-hidden hover:border-primary-500 transition-colors',
                },
                  m.mimeType && m.mimeType.startsWith('image/')
                    ? React.createElement('img', { src: m.thumbnail || m.url, alt: m.alt || m.title || '', className: 'w-full h-24 object-cover' })
                    : React.createElement('div', { className: 'w-full h-24 bg-gray-100 flex items-center justify-center text-2xl' }, '\u{1F4C4}'),
                  React.createElement('p', { className: 'px-2 py-1 text-xs text-gray-600 truncate' }, m.title || m.filename),
                )
              ),
        ),
      ),
    ),
    // Template library modal
    showTemplates && React.createElement('div', { className: 'fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4' },
      React.createElement('div', { className: 'bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col' },
        React.createElement('div', { className: 'flex items-center justify-between px-4 py-3 border-b border-gray-200' },
          React.createElement('h3', { className: 'font-semibold text-gray-900' }, t('block templates', getLang())),
          React.createElement('div', { className: 'flex items-center gap-2' },
            React.createElement('button', { onClick: exportTemplates, className: 'text-xs text-gray-500 hover:text-primary-600', title: t('export custom templates', getLang()) }, t('export', getLang())),
            React.createElement('label', { className: 'text-xs text-gray-500 hover:text-primary-600 cursor-pointer', title: t('import custom templates', getLang()) },
              t('import', getLang()),
              React.createElement('input', { type: 'file', accept: '.json', className: 'hidden', onChange: (e: React.ChangeEvent<HTMLInputElement>) => importTemplates(e.target.files?.[0]) }),
            ),
            React.createElement('button', { onClick: () => setShowTemplates(false), className: 'p-1 text-gray-400 hover:text-gray-600' }, React.createElement(X, { size: 18 })),
          ),
        ),
        React.createElement('div', { className: 'p-4 overflow-auto' },
          React.createElement('div', { className: 'flex items-center justify-between mb-2' },
            React.createElement('p', { className: 'text-[10px] uppercase tracking-wider text-gray-400 font-medium' }, t('built-in', getLang())),
            React.createElement('button', { onClick: () => setShowTplForm(!showTplForm), className: 'text-[10px] text-primary-600 hover:text-primary-700 font-medium' }, showTplForm ? t('cancel', getLang()) : '+ ' + t('new template', getLang())),
          ),
          showTplForm && React.createElement('div', { className: 'mb-3 p-3 bg-gray-50 rounded-lg space-y-2' },
            React.createElement('input', { value: newTplName, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setNewTplName(e.target.value), placeholder: t('template name', getLang()), className: 'input-field text-xs' }),
            React.createElement('textarea', { value: newTplHtml, onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => setNewTplHtml(e.target.value), placeholder: t('html snippet...', getLang()), rows: 3, className: 'input-field text-xs font-mono' }),
            React.createElement('button', { onClick: saveCustomTemplate, disabled: !newTplName.trim() || !newTplHtml.trim(), className: 'text-xs bg-primary-600 text-white px-2.5 py-1 rounded hover:bg-primary-700 disabled:opacity-50' }, t('save template', getLang())),
          ),
          React.createElement('div', { className: 'grid grid-cols-1 sm:grid-cols-2 gap-3' },
            BLOCK_TEMPLATES.map((t: any) =>
              React.createElement('button', {
                key: t.name, onClick: () => insertTemplate(t),
                className: 'group border border-gray-200 rounded-lg p-3 text-left hover:border-primary-500 transition-colors',
              },
                React.createElement('p', { className: 'text-sm font-medium text-gray-800 mb-1 flex items-center gap-1.5' }, React.createElement(LayoutTemplate, { size: 14, className: 'text-gray-400' }), t.name),
                React.createElement('div', { className: 'text-[10px] text-gray-400' }, 'Insert a ' + t.name.toLowerCase() + ' block'),
              )
            ),
          ),
          customTemplates.length > 0 && React.createElement(React.Fragment, null,
            React.createElement('p', { className: 'text-[10px] uppercase tracking-wider text-gray-400 font-medium mt-4 mb-2' }, t('custom', getLang()) + ' (' + customTemplates.length + ')'),
            React.createElement('div', { className: 'grid grid-cols-1 sm:grid-cols-2 gap-3' },
              customTemplates.map((t: any) =>
                React.createElement('div', { key: t.id, className: 'group border border-gray-200 rounded-lg p-3 text-left hover:border-primary-500 transition-colors flex items-start justify-between gap-2' },
                  React.createElement('button', { onClick: () => insertTemplate(t), className: 'flex-1 min-w-0 text-left' },
                    React.createElement('p', { className: 'text-sm font-medium text-gray-800 mb-1 flex items-center gap-1.5' }, React.createElement(LayoutTemplate, { size: 14, className: 'text-gray-400' }), t.name),
                    React.createElement('div', { className: 'text-[10px] text-gray-400 truncate' }, t.html.slice(0, 60)),
                  ),
                  React.createElement('button', { onClick: () => deleteCustomTemplate(t.id), className: 'text-gray-300 hover:text-red-500 shrink-0', title: t('delete template', getLang()) }, '\u00d7'),
                )
              ),
            ),
          ),
        ),
      ),
    ),
  );
}
