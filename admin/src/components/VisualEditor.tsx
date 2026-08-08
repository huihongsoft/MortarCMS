import React, { useEffect, useRef, useCallback } from 'react';
import grapesjs, { Editor, EditorConfig } from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';

interface VisualEditorProps {
  content: string;       // HTML content to load
  css?: string;          // CSS styles to load
  onChange: (html: string, css: string) => void;  // Called when content changes
  height?: string;
}

// CMS data block definitions: rendered as placeholder shortcodes in the editor,
// processed server-side to display real data.
function cmsPlaceholder(id: string, label: string, desc: string, icon: string): string {
  return '<div class="cms-' + id + '" data-cms="' + id + '" data-gjs-type="cms-' + id + '">' +
    '<div style="display:flex;flex-direction:column;align-items:center;gap:6px;padding:28px 16px;background:linear-gradient(135deg,#f8fafc,#eef2f7);border:2px dashed #94a3b8;border-radius:12px;text-align:center;">' +
    icon +
    '<span style="font-size:13px;font-weight:600;color:#475569;letter-spacing:.02em;">' + label + '</span>' +
    '<span style="font-size:11px;color:#94a3b8;">' + desc + '</span>' +
    '</div></div>';
}

const CMS_BLOCKS = [
  {
    id: 'post-list',
    label: 'Post List',
    category: 'CMS Data',
    media: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',
    content: cmsPlaceholder('post-list', 'Post List', 'Auto-displays latest site posts', '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>'),
  },
  {
    id: 'categories',
    label: 'Categories',
    category: 'CMS Data',
    media: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h6l2 2h8a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z"/></svg>',
    content: cmsPlaceholder('categories', 'Categories', 'Auto-generated category list', '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h6l2 2h8a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z"/></svg>'),
  },
  {
    id: 'comments',
    label: 'Comments',
    category: 'CMS Data',
    media: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
    content: cmsPlaceholder('comments', 'Comments', 'Latest approved site comments', '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>'),
  },
  {
    id: 'search',
    label: 'Search',
    category: 'CMS Data',
    media: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>',
    content: cmsPlaceholder('search', 'Search', 'Site search form', '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>'),
  },
  {
    id: 'archive',
    label: 'Archive',
    category: 'CMS Data',
    media: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="5" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/><path d="M10 12h4"/></svg>',
    content: cmsPlaceholder('archive', 'Archive', 'Monthly post archive', '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="5" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/><path d="M10 12h4"/></svg>'),
  },
  {
    id: 'tag-cloud',
    label: 'Tag Cloud',
    category: 'CMS Data',
    media: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>',
    content: cmsPlaceholder('tag-cloud', 'Tag Cloud', 'All site tags by popularity', '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>'),
  },
];

// Layout blocks: common page structure elements
const LAYOUT_BLOCKS = [
  {
    id: 'section',
    label: 'Section',
    category: 'Layout',
    media: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>',
    content: '<section style="padding:60px 24px;"><div data-gjs-type="text" style="text-align:center;"><h2>Section Title</h2><p>Section content goes here...</p></div></section>',
  },
  {
    id: 'container',
    label: 'Container',
    category: 'Layout',
    media: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="1" width="22" height="22" rx="3"/><rect x="5" y="5" width="14" height="14" rx="1"/></svg>',
    content: '<div style="max-width:1200px;margin:0 auto;padding:0 16px;" data-gjs-type="text"><p>Container content...</p></div>',
  },
  {
    id: 'two-columns',
    label: '2 Columns',
    category: 'Layout',
    media: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="9" height="16" rx="1"/><rect x="13" y="4" width="9" height="16" rx="1"/></svg>',
    content: '<div style="display:flex;gap:32px;flex-wrap:wrap;"><div style="flex:1;min-width:250px;" data-gjs-type="text"><p>Left column content...</p></div><div style="flex:1;min-width:250px;" data-gjs-type="text"><p>Right column content...</p></div></div>',
  },
  {
    id: 'three-columns',
    label: '3 Columns',
    category: 'Layout',
    media: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="5" height="14" rx="1"/><rect x="9.5" y="5" width="5" height="14" rx="1"/><rect x="17" y="5" width="5" height="14" rx="1"/></svg>',
    content: '<div style="display:flex;gap:24px;flex-wrap:wrap;"><div style="flex:1;min-width:200px;" data-gjs-type="text"><p>Column 1...</p></div><div style="flex:1;min-width:200px;" data-gjs-type="text"><p>Column 2...</p></div><div style="flex:1;min-width:200px;" data-gjs-type="text"><p>Column 3...</p></div></div>',
  },
  {
    id: 'hero',
    label: 'Hero Banner',
    category: 'Layout',
    media: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h3M6 13h6"/></svg>',
    content: '<div style="padding:80px 24px;background:linear-gradient(135deg,#667eea,#764ba2);border-radius:12px;text-align:center;color:#fff;"><h1 style="color:#fff;font-size:2.5rem;margin-bottom:16px;">Hero Heading</h1><p style="color:rgba(255,255,255,0.9);font-size:1.2rem;margin-bottom:32px;">Compelling subtitle text here</p><a style="display:inline-block;padding:12px 32px;background:#fff;color:#667eea;border-radius:8px;font-weight:600;text-decoration:none;">Call to Action</a></div>',
  },
];

// Content blocks: common page content elements
const CONTENT_BLOCKS = [
  {
    id: 'quote',
    label: 'Quote',
    category: 'Content',
    media: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21c3-5 4-9 4-13H3a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2c0 6-2 10-8 13z"/><path d="M13 21c3-5 4-9 4-13h-4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2c0 6-2 10-8 13z"/></svg>',
    content: '<blockquote style="margin:0;padding:16px 24px;border-left:4px solid #3b82f6;background:#f8fafc;border-radius:0 8px 8px 0;font-style:italic;color:#475569;">"A quote worth remembering."<footer style="margin-top:8px;font-style:normal;font-size:13px;color:#94a3b8;">— Author</footer></blockquote>',
  },
  {
    id: 'divider',
    label: 'Divider',
    category: 'Content',
    media: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12h18"/></svg>',
    content: '<hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0;">',
  },
  {
    id: 'button',
    label: 'Button',
    category: 'Content',
    media: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="8" width="20" height="8" rx="2"/><path d="M12 8v8"/></svg>',
    content: '<div style="text-align:center;"><a href="#" style="display:inline-block;padding:12px 32px;background:#3b82f6;color:#fff;border-radius:8px;font-weight:600;text-decoration:none;font-size:15px;">Click Me</a></div>',
  },
  {
    id: 'list',
    label: 'List',
    category: 'Content',
    media: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>',
    content: '<ul style="margin:0;padding-left:24px;line-height:1.8;color:#374151;"><li>First item</li><li>Second item</li><li>Third item</li></ul>',
  },
  {
    id: 'image-caption',
    label: 'Image with Caption',
    category: 'Content',
    media: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>',
    content: '<figure style="margin:0;"><img src="https://placehold.co/800x400/e2e8f0/64748b?text=Image" alt="Image" style="width:100%;max-width:800px;border-radius:8px;display:block;"><figcaption style="margin-top:8px;text-align:center;font-size:13px;color:#6b7280;">Your image caption here</figcaption></figure>',
  },
  {
    id: 'callout',
    label: 'Callout Box',
    category: 'Content',
    media: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    content: '<div style="padding:20px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;color:#1e40af;"><strong>Note:</strong> This is a callout box for important information.</div>',
  },
];

// All blocks merged
const ALL_BLOCKS = [...LAYOUT_BLOCKS, ...CONTENT_BLOCKS, ...CMS_BLOCKS];

export default function VisualEditor({ content, css, onChange, height }: VisualEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<Editor | null>(null);

  // Custom GrapesJS plugin that adds CMS blocks and customizations
  const cmsPlugin = useCallback((editor: Editor) => {
    // Register CMS data block component types with LIVE preview views.
    // The view fetches real data and renders it into the canvas only;
    // the model stays a placeholder, so the saved HTML keeps data-cms markers.
    CMS_BLOCKS.forEach(block => {
      editor.DomComponents.addType(`cms-${block.id}`, {
        model: {
          defaults: {
            tagName: 'div',
            draggable: true,
            droppable: false,
            traits: [
              { type: 'text', name: 'title', label: 'Title' },
            ],
          },
        },
        view: {
          init() {
            this.previewHtml = '';
            this.fetchPreview();
            // Re-apply the live preview when GrapesJS re-renders the component
            // (e.g. after editing styles), so it doesn't flash back to the placeholder.
            this.model.on('change', () => this.applyPreview());
          },
          fetchPreview() {
            const el = this.el as HTMLElement | undefined;
            if (!el) return;
            fetch('/api/editor/preview-cms/' + block.id)
              .then(r => r.json())
              .then((d: any) => {
                if (d.html && this.el && (this.el as HTMLElement).isConnected) {
                  this.previewHtml = d.html;
                  this.applyPreview();
                }
              })
              .catch(() => {});
          },
          applyPreview() {
            if (this.previewHtml && this.el) {
              (this.el as HTMLElement).innerHTML = this.previewHtml;
            }
          },
        },
      });
    });

    // Block search filter in the blocks panel
    editor.on('load', () => {
      const blocksEl = (containerRef.current as HTMLElement)?.querySelector('.gjs-blocks-c');
      if (!blocksEl || blocksEl.querySelector('.gjs-blocks-search')) return;
      const search = document.createElement('input');
      search.type = 'text';
      search.placeholder = 'Search blocks...';
      search.className = 'gjs-blocks-search';
      search.style.cssText = 'width:100%;margin:0 0 10px;padding:8px 12px;border:1px solid #e5e7eb;border-radius:8px;font-size:12px;outline:none;background:#fff;color:#374151;';
      search.addEventListener('input', () => {
        const q = search.value.toLowerCase().trim();
        blocksEl.querySelectorAll('.gjs-block').forEach((b: Element) => {
          const label = (b as HTMLElement).textContent?.toLowerCase() || '';
          (b as HTMLElement).style.display = !q || label.includes(q) ? '' : 'none';
        });
      });
      blocksEl.prepend(search);
    });

    // Add custom blocks to the block manager
    const bm = editor.BlockManager;
    ALL_BLOCKS.forEach(block => {
      // Remove default blocks in the same category to avoid duplicates
      const existing = bm.get(block.id);
      if (!existing) {
        bm.add(block.id, {
          label: block.label,
          category: block.category,
          media: block.media,
          content: block.content,
        });
      }
    });

    // Style the canvas to match the frontend feel (theme colors + typography)
    editor.on('load', () => {
      const canvas = editor.Canvas.getDocument();
      if (!canvas) return;
      const style = canvas.createElement('style');
      style.textContent = `
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin:0; }
        .cms-post-list, .cms-categories, .cms-comments, .cms-search, .cms-archive, .cms-tag-cloud { min-height: 40px; }
      `;
      canvas.head.appendChild(style);
      // Inject active theme color variables so the preview matches the real site
      fetch('/api/settings')
        .then(r => r.json())
        .then(s => {
          const vars: Record<string, string> = {
            '--primary-color': s.theme_primary_color || '#3b82f6',
            '--background': s.theme_background || '#ffffff',
            '--text-color': s.theme_text_color || '#111827',
            '--link-color': s.theme_link_color || '#2563eb',
            '--heading-font': s.theme_heading_font || 'inherit',
            '--body-font': s.theme_body_font || 'inherit',
          };
          const vStyle = canvas.createElement('style');
          vStyle.textContent = ':root{' + Object.entries(vars).map(([k, v]) => k + ':' + v + ';').join('') + '}';
          canvas.head.appendChild(vStyle);
        })
        .catch(() => {});
    });
  }, []);

  // Always-最新 onChange，避免 effect 依赖导致重建
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  // Editor 当前已加载内容的镜像，用于区分「内部编辑回传」与「外部加载」
  const lastContentRef = useRef(content);

  // Initialize the editor ONCE on mount. Re-init on every prop change would
  // destroy the instance mid-edit (the property panel flashing bug).
  useEffect(() => {
    if (!containerRef.current || editorRef.current) return;

    const config: EditorConfig = {
      container: containerRef.current,
      height: height || '100%',
      width: 'auto',
      storageManager: false,
      autorender: true,
      noticeOnUnload: false,
      showOffsets: true,
      showOffsetsSelected: true,
      forceClass: false,
      // Canvas configuration — smooth drag, snap guides, responsive breakpoints
      canvas: {
        styles: [
          'https://cdnjs.cloudflare.com/ajax/libs/tailwindcss/2.2.19/tailwind.min.css',
        ],
        frameStyle: `
          :root { --primary: #3b82f6; --primary-soft: rgba(59,130,246,0.08); }
          body {
            -webkit-font-smoothing: antialiased;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            color: #111827;
          }
          /* Smooth drag transitions */
          .gjs-dashed * { transition: none !important; }
          [data-gjs-highlightable] { transition: box-shadow 0.15s ease; }
          /* Drop indicator — magnetic snap visual */
          .gjs-placeholder,
          .gjs-placeholder-int,
          .gjs-placeholder-vert {
            background: var(--primary-soft) !important;
            border: 2px dashed var(--primary) !important;
            border-radius: 4px;
            transition: all 0.12s ease;
          }
          /* Drop above/below guide line */
          .gjs-placeholder-int { height: 4px !important; }
          /* Hover highlight on components */
          [data-gjs-highlightable]:hover {
            outline: 1px dashed rgba(59,130,246,0.35) !important;
            outline-offset: 2px;
          }
          /* Rich text defaults inside the canvas */
          .gjs-text { line-height: 1.7; }
          h1, h2, h3 { line-height: 1.3; }
        `,
      },
      // Plugin options
      plugins: [cmsPlugin],
      // Style manager: simplified property groups
      styleManager: {
        sectors: [
          {
            name: 'Typography',
            open: false,
            properties: [
              { property: 'font-size', type: 'select', defaults: 'inherit', options: [
                { id: 'inherit', value: 'inherit', label: 'Default' }, { id: '12px', value: '12px' }, { id: '14px', value: '14px' }, { id: '16px', value: '16px' }, { id: '18px', value: '18px' }, { id: '24px', value: '24px' }, { id: '32px', value: '32px' }, { id: '48px', value: '48px' },
              ]},
              { property: 'font-weight', type: 'select', defaults: 'inherit', options: [
                { id: 'inherit', value: 'inherit', label: 'Default' }, { id: '300', value: '300', label: 'Light' }, { id: '400', value: '400', label: 'Regular' }, { id: '500', value: '500', label: 'Medium' }, { id: '600', value: '600', label: 'Semi Bold' }, { id: '700', value: '700', label: 'Bold' },
              ]},
              { property: 'text-align', type: 'radio', defaults: 'left', options: [
                { id: 'left', value: 'left' }, { id: 'center', value: 'center' }, { id: 'right', value: 'right' },
              ]},
              { property: 'color', type: 'color' },
              { property: 'line-height' },
              { property: 'letter-spacing' },
            ],
          },
          {
            name: 'Spacing',
            open: false,
            properties: [
              { property: 'padding', type: 'composite', properties: [
                { property: 'padding-top' }, { property: 'padding-right' }, { property: 'padding-bottom' }, { property: 'padding-left' },
              ]},
              { property: 'margin', type: 'composite', properties: [
                { property: 'margin-top' }, { property: 'margin-right' }, { property: 'margin-bottom' }, { property: 'margin-left' },
              ]},
            ],
          },
          {
            name: 'Background',
            open: false,
            properties: [
              { property: 'background-color', type: 'color' },
              { property: 'background', type: 'file' },
            ],
          },
          {
            name: 'Border',
            open: false,
            properties: [
              { property: 'border-radius', type: 'slider', defaults: '0', min: 0, max: 100, unit: 'px' },
              { property: 'border', type: 'composite', properties: [
                { property: 'border-width' }, { property: 'border-style' }, { property: 'border-color' },
              ]},
            ],
          },
          {
            name: 'Size',
            open: false,
            properties: [
              { property: 'width', type: 'slider', min: 0, max: 1200, unit: 'px', defaults: 'auto' },
              { property: 'max-width', type: 'slider', min: 0, max: 1200, unit: 'px' },
              { property: 'height', type: 'slider', min: 0, max: 1200, unit: 'px' },
            ],
          },
          {
            name: 'Layout',
            open: false,
            properties: [
              { property: 'display', type: 'select', defaults: 'block', options: [
                { id: 'block', value: 'block', label: 'Block' }, { id: 'inline-block', value: 'inline-block', label: 'Inline Block' }, { id: 'flex', value: 'flex', label: 'Flex' }, { id: 'grid', value: 'grid', label: 'Grid' }, { id: 'none', value: 'none', label: 'None' },
              ]},
              { property: 'flex-direction', type: 'select', defaults: 'row', options: [
                { id: 'row', value: 'row', label: 'Row' }, { id: 'column', value: 'column', label: 'Column' },
              ]},
              { property: 'justify-content', type: 'select', defaults: 'flex-start', options: [
                { id: 'flex-start', value: 'flex-start', label: 'Start' }, { id: 'center', value: 'center', label: 'Center' }, { id: 'flex-end', value: 'flex-end', label: 'End' }, { id: 'space-between', value: 'space-between', label: 'Space Between' },
              ]},
              { property: 'align-items', type: 'select', defaults: 'stretch', options: [
                { id: 'stretch', value: 'stretch', label: 'Stretch' }, { id: 'flex-start', value: 'flex-start', label: 'Start' }, { id: 'center', value: 'center', label: 'Center' }, { id: 'flex-end', value: 'flex-end', label: 'End' },
              ]},
              { property: 'text-align', type: 'select', defaults: 'left', options: [
                { id: 'left', value: 'left', label: 'Left' }, { id: 'center', value: 'center', label: 'Center' }, { id: 'right', value: 'right', label: 'Right' },
              ]},
            ],
          },
          {
            name: 'Effects',
            open: false,
            properties: [
              { property: 'opacity', type: 'slider', defaults: '1', min: 0, max: 1, step: 0.05 },
              { property: 'box-shadow', type: 'shadow' },
              { property: 'transform', type: 'select', defaults: 'none', options: [
                { id: 'none', value: 'none', label: 'None' }, { id: 'rotate(90deg)', value: 'rotate(90deg)', label: 'Rotate 90°' }, { id: 'rotate(180deg)', value: 'rotate(180deg)', label: 'Rotate 180°' }, { id: 'scale(1.1)', value: 'scale(1.1)', label: 'Scale 1.1×' },
              ]},
            ],
          },
        ],
      },
    };

    const editor = grapesjs.init(config);
    editorRef.current = editor;

    // Remove default blocks we don't need
    const bm = editor.BlockManager;
    // Remove default blocks we don't want (quote/video are overridden by our custom blocks)
    ['map', 'link'].forEach(id => bm.remove(id));
    // Keep: text, image, columns, column1, column2, column3, etc.

    // Load initial content
    if (content) {
      try {
        editor.setComponents(content);
      } catch {
        editor.setComponents('<p>Start building your page...</p>');
      }
    }
    if (css) {
      try {
        editor.setStyle(css);
      } catch { /* ignore invalid CSS */ }
    }
    lastContentRef.current = content;

    // Notify parent of changes on key events (debounced)
    let changeTimer: ReturnType<typeof setTimeout>;
    const notifyChange = () => {
      clearTimeout(changeTimer);
      changeTimer = setTimeout(() => {
        const ed = editorRef.current;
        if (!ed) return;
        const html = ed.getHtml();
        const styles = ed.getCss();
        // Mark as internally-produced BEFORE notifying so the watch effect
        // below doesn't reload the editor with the same content.
        lastContentRef.current = html;
        onChangeRef.current(html, styles || '');
      }, 500);
    };

    editor.on('component:update', notifyChange);
    editor.on('component:add', notifyChange);
    editor.on('component:remove', notifyChange);
    editor.on('styleable:change', notifyChange);
    editor.on('change:device', notifyChange);

    return () => {
      clearTimeout(changeTimer);
      editor.destroy();
      editorRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Watch for EXTERNAL content changes (e.g. template load from the parent).
  // Skips reload when the change originated from the editor itself.
  useEffect(() => {
    const ed = editorRef.current;
    if (!ed) return;
    if (content !== lastContentRef.current) {
      lastContentRef.current = content;
      try { ed.setComponents(content || ''); } catch { /* ignore */ }
      try { ed.setStyle(css || ''); } catch { /* ignore invalid CSS */ }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content, css]);

  return React.createElement('div', {
    ref: containerRef,
    className: 'visual-editor-container',
    style: { height: height || 'calc(100vh - 200px)', minHeight: '500px' },
  });
}
