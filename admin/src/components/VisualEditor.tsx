import React, { useEffect, useRef, useCallback } from 'react';
import grapesjs, { Editor, EditorConfig } from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';
import { t, getLang } from '../lib/i18n';

// WordPress Gutenberg SVG icons (from @wordpress/icons)
const S = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">';
const E = '</svg>';
const WPI = {
  plus:       S+'<path d="M11 12.5V17.5H12.5V12.5H17.5V11H12.5V6H11V11H6V12.5H11Z"/>'+E,
  arrowLeft:  S+'<path d="M20 11.2H6.8l3.7-3.7-1-1L3.9 12l5.6 5.5 1-1-3.7-3.7H20z"/>'+E,
  undo:       S+'<path d="M18.3 11.7c-.6-.6-1.4-.9-2.3-.9H6.7l2.9-3.3-1.1-1-4.5 5L8.5 16l1-1-2.7-2.7H16c.5 0 .9.2 1.3.5 1 1 1 3.4 1 4.5v.3h1.5v-.2c0-1.5 0-4.3-1.5-5.7z"/>'+E,
  redo:       S+'<path d="M15.6 6.5l-1.1 1 2.9 3.3H8c-.9 0-1.7.3-2.3.9-1.4 1.5-1.4 4.2-1.4 5.6v.2h1.5v-.3c0-1.1 0-3.5 1-4.5.3-.3.7-.5 1.3-.5h9.2L14.5 15l1.1 1.1 4.6-4.6-4.6-5z"/>'+E,
  listView:   S+'<path d="M3 6h11v1.5H3V6Zm3.5 5.5h11V13h-11v-1.5ZM21 17H10v1.5h11V17Z"/>'+E,
  cog:        S+'<path fill-rule="evenodd" clip-rule="evenodd" d="M10.289 4.836A1 1 0 0111.275 4h1.306a1 1 0 01.987.836l.244 1.466c.787.26 1.503.679 2.108 1.218l1.393-.522a1 1 0 011.216.437l.653 1.13a1 1 0 01-.23 1.273l-1.148.944a6.025 6.025 0 010 2.435l1.149.946a1 1 0 01.23 1.272l-.653 1.13a1 1 0 01-1.216.437l-1.394-.522c-.605.54-1.32.958-2.108 1.218l-.244 1.466a1 1 0 01-.987.836h-1.306a1 1 0 01-.986-.836l-.244-1.466a5.995 5.995 0 01-2.108-1.218l-1.394.522a1 1 0 01-1.217-.436l-.653-1.131a1 1 0 01.23-1.272l1.149-.946a6.026 6.026 0 010-2.435l-1.148-.944a1 1 0 01-.23-1.272l.653-1.131a1 1 0 011.217-.437l1.393.522a5.994 5.994 0 012.108-1.218l.244-1.466zM14.929 12a3 3 0 11-6 0 3 3 0 016 0z"/>'+E,
  close:      S+'<path d="m13.06 12 6.47-6.47-1.06-1.06L12 10.94 5.53 4.47 4.47 5.53 10.94 12l-6.47 6.47 1.06 1.06L12 13.06l6.47 6.47 1.06-1.06L13.06 12Z"/>'+E,
  external:   S+'<path d="M19.5 4.5h-7V6h4.44l-5.97 5.97 1.06 1.06L18 7.06v4.44h1.5v-7Zm-13 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3H17v3a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h3V5.5h-3Z"/>'+E,
  chevronDown:S+'<path d="M17.5 11.6L12 16l-5.5-4.4.9-1.2L12 14l4.5-3.6 1 1.2z"/>'+E,
  moreVert:   S+'<path d="M13 19h-2v-2h2v2zm0-6h-2v-2h2v2zm0-6h-2V5h2v2z"/>'+E,
  desktop:    S+'<path d="M20 3H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h6v2H7v2h10v-2h-3v-2h6c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 13H4V5h16v11z"/>'+E,
  tablet:     S+'<path d="M18 4H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-8 14v-1.5h4V18h-4zm8-3H6V6h12v9z"/>'+E,
  mobile:     S+'<path d="M15.5 1h-8C6.12 1 5 2.12 5 3.5v17C5 21.88 6.12 23 7.5 23h8c1.38 0 2.5-1.12 2.5-2.5v-17C18 2.12 16.88 1 15.5 1zm-4 21c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4.5-4H7V4h9v14z"/>'+E,
  // Block type icons
  blockDefault:S+'<path d="M19 8h-1V6h-5v2h-2V6H6v2H5c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-8c0-1.1-.9-2-2-2zm.5 10c0 .3-.2.5-.5.5H5c-.3 0-.5-.2-.5-.5v-8c0-.3.2-.5.5-.5h14c.3 0 .5.2.5.5v8z"/>'+E,
  paragraph:  S+'<path d="m9.99609 14v-.2251l.00391.0001v6.225h1.5v-14.5h2.5v14.5h1.5v-14.5h3v-1.5h-8.50391c-2.76142 0-5 2.23858-5 5 0 2.7614 2.23858 5 5 5z"/>'+E,
  heading:    S+'<path d="M6 5V18.5911L12 13.8473L18 18.5911V5H6Z"/>'+E,
  image:      S+'<path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM5 4.5h14c.3 0 .5.2.5.5v8.4l-3-2.9c-.3-.3-.8-.3-1 0L11.9 14 9 12c-.3-.2-.6-.2-.8 0l-3.6 2.6V5c-.1-.3.1-.5.4-.5zm14 15H5c-.3 0-.5-.2-.5-.5v-2.4l4.1-3 3 1.9c.3.2.7.2.9-.1L16 12l3.5 3.4V19c0 .3-.2.5-.5.5z"/>'+E,
  gallery:    S+'<path fill-rule="evenodd" clip-rule="evenodd" d="M16.375 4.5H4.625a.125.125 0 0 0-.125.125v8.254l2.859-1.54a.75.75 0 0 1 .68-.016l2.384 1.142 2.89-2.074a.75.75 0 0 1 .874 0l2.313 1.66V4.625a.125.125 0 0 0-.125-.125Zm.125 9.398-2.75-1.975-2.813 2.02a.75.75 0 0 1-.76.067l-2.444-1.17L4.5 14.583v1.792c0 .069.056.125.125.125h11.75a.125.125 0 0 0 .125-.125v-2.477ZM4.625 3C3.728 3 3 3.728 3 4.625v11.75C3 17.273 3.728 18 4.625 18h11.75c.898 0 1.625-.727 1.625-1.625V4.625C18 3.728 17.273 3 16.375 3H4.625ZM20 8v11c0 .69-.31 1-.999 1H6v1.5h13.001c1.52 0 2.499-.982 2.499-2.5V8H20Z"/>'+E,
  listBlock:  S+'<path d="M4 4v1.5h16V4H4zm8 8.5h8V11h-8v1.5zM4 20h16v-1.5H4V20zm4-8c0-1.1-.9-2-2-2s-2 .9-2 2 .9 2 2 2 2-.9 2-2z"/>'+E,
  quoteBlock: S+'<path d="M13 6v6h5.2v4c0 .8-.2 1.4-.5 1.7-.6.6-1.6.6-2.5.5h-.3v1.5h.5c1 0 2.3-.1 3.3-1 .6-.6 1-1.6 1-2.8V6H13zm-9 6h5.2v4c0 .8-.2 1.4-.5 1.7-.6.6-1.6.6-2.5.5h-.3v1.5h.5c1 0 2.3-.1 3.3-1 .6-.6 1-1.6 1-2.8V6H4v6z"/>'+E,
  columns:    S+'<path fill-rule="evenodd" clip-rule="evenodd" d="M15 7.5h-5v10h5v-10Zm1.5 0v10H19a.5.5 0 0 0 .5-.5V8a.5.5 0 0 0-.5-.5h-2.5ZM6 7.5h2.5v10H6a.5.5 0 0 1-.5-.5V8a.5.5 0 0 1 .5-.5ZM6 6h13a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z"/>'+E,
  group:      S+'<path d="M18 4h-7c-1.1 0-2 .9-2 2v3H6c-1.1 0-2 .9-2 2v7c0 1.1.9 2 2 2h7c1.1 0 2-.9 2-2v-3h3c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-4.5 14c0 .3-.2.5-.5.5H6c-.3 0-.5-.2-.5-.5v-7c0-.3.2-.5.5-.5h3V13c0 1.1.9 2 2 2h2.5v3zm0-4.5H11c-.3 0-.5-.2-.5-.5v-2.5H13c.3 0 .5.2.5.5v2.5zm5-.5c0 .3-.2.5-.5.5h-3V11c0-1.1-.9-2-2-2h-2.5V6c0-.3.2-.5.5-.5h7c.3 0 .5.2.5.5v7z"/>'+E,
  button:     S+'<path d="M8 12.5h8V11H8v1.5Z M19 6.5H5a2 2 0 0 0-2 2V15a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.5a2 2 0 0 0-2-2ZM5 8h14a.5.5 0 0 1 .5.5V15a.5.5 0 0 1-.5.5H5a.5.5 0 0 1-.5-.5V8.5A.5.5 0 0 1 5 8Z"/>'+E,
  separator:  S+'<path d="M4.5 12.5v4H3V7h1.5v3.987h15V7H21v9.5h-1.5v-4h-15Z"/>'+E,
  searchBlock:S+'<path d="M13 5c-3.3 0-6 2.7-6 6 0 1.4.5 2.7 1.3 3.7l-3.8 3.8 1.1 1.1 3.8-3.8c1 .8 2.3 1.3 3.7 1.3 3.3 0 6-2.7 6-6S16.3 5 13 5zm0 10.5c-2.5 0-4.5-2-4.5-4.5s2-4.5 4.5-4.5 4.5 2 4.5 4.5-2 4.5-4.5 4.5z"/>'+E,
  video:      S+'<path d="M18.7 3H5.3C4 3 3 4 3 5.3v13.4C3 20 4 21 5.3 21h13.4c1.3 0 2.3-1 2.3-2.3V5.3C21 4 20 3 18.7 3zm.8 15.7c0 .4-.4.8-.8.8H5.3c-.4 0-.8-.4-.8-.8V5.3c0-.4.4-.8.8-.8h13.4c.4 0 .8.4.8.8v13.4zM10 15l5-3-5-3v6z"/>'+E,
};

interface VisualEditorProps {
  content: string;
  css?: string;
  onChange: (html: string, css: string) => void;
  height?: string;
  onSaveShortcut?: () => void;    // Ctrl+S or Save draft button
  onPublish?: () => void;         // Publish button
  onBack?: () => void;            // Back to rich-text mode (shown as icon button at far left of the header)
  saveState?: 'saved' | 'saving' | 'dirty';  // drives the save snackbar
  /** Post/Page settings shown in the "Post" tab of the sidebar */
  pageSettings?: {
    status?: string;
    onStatusChange?: (v: string) => void;
    parentId?: string;
    onParentIdChange?: (v: string) => void;
    parentPages?: { id: string; title: string }[];
    menuOrder?: number;
    onMenuOrderChange?: (v: number) => void;
    slug?: string;
    showPreview?: () => void;
    featuredImage?: string;
    onFeaturedImageChange?: (url: string) => void;
    showMediaPicker?: () => void;
    excerpt?: string;
    onExcerptChange?: (v: string) => void;
    allowComments?: boolean;
    onAllowCommentsChange?: (v: boolean) => void;
    password?: string;
    onPasswordChange?: (v: string) => void;
  };
}

// --- Block Definitions ---

function cmsPlaceholder(id: string, label: string, desc: string, icon: string): string {
  return '<div class="cms-' + id + '" data-cms="' + id + '" data-gjs-type="cms-' + id + '">' +
    '<div style="display:flex;flex-direction:column;align-items:center;gap:6px;padding:28px 16px;background:linear-gradient(135deg,#f8fafc,#eef2f7);border:2px dashed #94a3b8;border-radius:12px;text-align:center;">' +
    icon +
    '<span style="font-size:13px;font-weight:600;color:#475569;letter-spacing:.02em;">' + label + '</span>' +
    '<span style="font-size:11px;color:#94a3b8;">' + desc + '</span>' +
    '</div></div>';
}

const CMS_BLOCKS = [
  { id: 'post-list', label: 'Post List', category: 'CMS Data', media: WPI.listBlock, content: cmsPlaceholder('post-list', 'Post List', 'Auto-displays latest site posts', '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>') },
  { id: 'categories', label: 'Categories', category: 'CMS Data', media: WPI.blockDefault, content: cmsPlaceholder('categories', 'Categories', 'Auto-generated category list', '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h6l2 2h8a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z"/></svg>') },
  { id: 'comments', label: 'Comments', category: 'CMS Data', media: WPI.blockDefault, content: cmsPlaceholder('comments', 'Comments', 'Latest approved site comments', '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>') },
  { id: 'search', label: 'Search', category: 'CMS Data', media: WPI.searchBlock, content: cmsPlaceholder('search', 'Search', 'Site search form', '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>') },
  { id: 'archive', label: 'Archive', category: 'CMS Data', media: WPI.blockDefault, content: cmsPlaceholder('archive', 'Archive', 'Monthly post archive', '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="5" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/><path d="M10 12h4"/></svg>') },
  { id: 'tag-cloud', label: 'Tag Cloud', category: 'CMS Data', media: WPI.blockDefault, content: cmsPlaceholder('tag-cloud', 'Tag Cloud', 'All site tags by popularity', '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>') },
];

const LAYOUT_BLOCKS = [
  { id: 'section', label: 'Section', category: 'Layout', media: WPI.group, content: '<section style="padding:60px 24px;"><div data-gjs-type="text" style="text-align:center;"><h2>Section Title</h2><p>Section content goes here...</p></div></section>' },
  { id: 'container', label: 'Container', category: 'Layout', media: WPI.group, content: '<div style="max-width:1200px;margin:0 auto;padding:0 16px;" data-gjs-type="text"><p>Container content...</p></div>' },
  { id: 'two-columns', label: '2 Columns', category: 'Layout', media: WPI.columns, content: '<div style="display:flex;gap:32px;flex-wrap:wrap;"><div style="flex:1;min-width:250px;" data-gjs-type="text"><p>Left column content...</p></div><div style="flex:1;min-width:250px;" data-gjs-type="text"><p>Right column content...</p></div></div>' },
  { id: 'three-columns', label: '3 Columns', category: 'Layout', media: WPI.columns, content: '<div style="display:flex;gap:24px;flex-wrap:wrap;"><div style="flex:1;min-width:200px;" data-gjs-type="text"><p>Column 1...</p></div><div style="flex:1;min-width:200px;" data-gjs-type="text"><p>Column 2...</p></div><div style="flex:1;min-width:200px;" data-gjs-type="text"><p>Column 3...</p></div></div>' },
  { id: 'hero', label: 'Hero Banner', category: 'Layout', media: WPI.blockDefault, content: '<div style="padding:80px 24px;background:linear-gradient(135deg,#667eea,#764ba2);border-radius:12px;text-align:center;color:#fff;"><h1 style="color:#fff;font-size:2.5rem;margin-bottom:16px;">Hero Heading</h1><p style="color:rgba(255,255,255,0.9);font-size:1.2rem;margin-bottom:32px;">Compelling subtitle text here</p><a style="display:inline-block;padding:12px 32px;background:#fff;color:#667eea;border-radius:8px;font-weight:600;text-decoration:none;">Call to Action</a></div>' },
];

const CONTENT_BLOCKS = [
  { id: 'quote', label: 'Quote', category: 'Content', media: WPI.quoteBlock, content: '<blockquote style="margin:0;padding:16px 24px;border-left:4px solid #3b82f6;background:#f8fafc;border-radius:0 8px 8px 0;font-style:italic;color:#475569;">"A quote worth remembering."<footer style="margin-top:8px;font-style:normal;font-size:13px;color:#94a3b8;">— Author</footer></blockquote>' },
  { id: 'divider', label: 'Divider', category: 'Content', media: WPI.separator, content: '<hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0;">' },
  { id: 'button', label: 'Button', category: 'Content', media: WPI.button, content: '<div style="text-align:center;"><a href="#" style="display:inline-block;padding:12px 32px;background:#3b82f6;color:#fff;border-radius:8px;font-weight:600;text-decoration:none;font-size:15px;">Click Me</a></div>' },
  { id: 'list', label: 'List', category: 'Content', media: WPI.listBlock, content: '<ul style="margin:0;padding-left:24px;line-height:1.8;color:#374151;"><li>First item</li><li>Second item</li><li>Third item</li></ul>' },
  { id: 'image-caption', label: 'Image with Caption', category: 'Content', media: WPI.image, content: '<figure style="margin:0;"><img src="https://placehold.co/800x400/e2e8f0/64748b?text=Image" alt="Image" style="width:100%;max-width:800px;border-radius:8px;display:block;"><figcaption style="margin-top:8px;text-align:center;font-size:13px;color:#6b7280;">Your image caption here</figcaption></figure>' },
  { id: 'callout', label: 'Callout Box', category: 'Content', media: WPI.blockDefault, content: '<div style="padding:20px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;color:#1e40af;"><strong>Note:</strong> This is a callout box for important information.</div>' },
];

const SECTIONS_BLOCKS = [
  { id: 'sec-pricing', label: 'Pricing Table', category: 'Sections', media: WPI.blockDefault, content: '<div style="display:flex;gap:24px;flex-wrap:wrap;padding:40px 24px;">' + ['Basic', 'Pro', 'Premium'].map((name, i) => { const f = i === 1; return '<div style="flex:1;min-width:200px;border:2px solid ' + (f ? '#3b82f6' : '#e5e7eb') + ';border-radius:16px;padding:28px 20px;text-align:center;' + (f ? 'background:#eff6ff;' : '') + '"><p style="font-size:13px;font-weight:600;color:#6b7280;margin:0 0 8px;text-transform:uppercase;letter-spacing:.05em;">' + name + '</p><p style="font-size:36px;font-weight:800;color:#111827;margin:0 0 16px;">$' + (9 + i * 10) + '<span style="font-size:14px;color:#9ca3af;font-weight:400;">/mo</span></p><p style="font-size:13px;color:#6b7280;line-height:2;margin:0 0 20px;">Feature one<br>Feature two<br>Feature three</p><div style="display:inline-block;padding:10px 28px;border-radius:8px;background:' + (f ? '#3b82f6' : '#f3f4f6') + ';color:' + (f ? '#fff' : '#374151') + ';font-size:14px;font-weight:600;">Choose ' + name + '</div></div>'; }).join('') + '</div>' },
  { id: 'sec-team', label: 'Team', category: 'Sections', media: WPI.blockDefault, content: '<div style="padding:48px 24px;text-align:center;"><h2 style="margin:0 0 8px;font-size:28px;color:#111827;">Meet the Team</h2><p style="margin:0 0 32px;color:#6b7280;font-size:15px;">The people behind the product</p><div style="display:flex;gap:32px;flex-wrap:wrap;justify-content:center;">' + ['Jane Doe', 'John Smith', 'Ana Liu'].map((n, i) => '<div style="width:180px;text-align:center;"><div style="width:96px;height:96px;margin:0 auto 12px;border-radius:50%;background:linear-gradient(135deg,#c7d2fe,#a5b4fc);display:flex;align-items:center;justify-content:center;font-size:32px;color:#4f46e5;font-weight:700;">' + n[0] + '</div><p style="margin:0;font-size:15px;font-weight:600;color:#111827;">' + n + '</p><p style="margin:4px 0 0;font-size:12px;color:#9ca3af;">' + ['Founder', 'Engineer', 'Designer'][i] + '</p></div>').join('') + '</div></div>' },
  { id: 'sec-stats', label: 'Stats Bar', category: 'Sections', media: WPI.blockDefault, content: '<div style="display:flex;gap:16px;flex-wrap:wrap;padding:40px 24px;background:#111827;border-radius:16px;justify-content:space-around;">' + [['10K+', 'Users'], ['120+', 'Countries'], ['99.9%', 'Uptime'], ['4.9★', 'Rating']].map(([v, l]) => '<div style="text-align:center;"><p style="margin:0;font-size:32px;font-weight:800;color:#fff;">' + v + '</p><p style="margin:4px 0 0;font-size:13px;color:#9ca3af;">' + l + '</p></div>').join('') + '</div>' },
  { id: 'sec-testimonial', label: 'Testimonial', category: 'Sections', media: WPI.quoteBlock, content: '<div style="padding:48px 24px;text-align:center;background:#f9fafb;"><p style="font-size:48px;line-height:1;margin:0 0 16px;color:#c7d2fe;">&ldquo;</p><p style="max-width:640px;margin:0 auto 24px;font-size:18px;line-height:1.8;color:#374151;font-style:italic;">This product completely changed how we work. Highly recommended!</p><div style="width:56px;height:56px;margin:0 auto 8px;border-radius:50%;background:linear-gradient(135deg,#a5b4fc,#818cf8);display:flex;align-items:center;justify-content:center;font-size:22px;color:#fff;font-weight:700;">J</div><p style="margin:0;font-size:14px;font-weight:600;color:#111827;">Jane Doe</p><p style="margin:2px 0 0;font-size:12px;color:#9ca3af;">CEO, Acme Inc.</p></div>' },
  { id: 'sec-cta', label: 'CTA Banner', category: 'Sections', media: WPI.blockDefault, content: '<div style="padding:64px 24px;background:linear-gradient(135deg,#2563eb,#7c3aed);border-radius:16px;text-align:center;color:#fff;"><h2 style="margin:0 0 12px;font-size:30px;color:#fff;">Ready to get started?</h2><p style="margin:0 0 28px;font-size:16px;color:rgba(255,255,255,0.85);">Join thousands of happy customers today</p><div style="display:inline-block;padding:14px 40px;background:#fff;color:#2563eb;border-radius:10px;font-size:16px;font-weight:700;">Get Started Free</div></div>' },
  { id: 'sec-newsletter', label: 'Newsletter', category: 'Sections', media: WPI.blockDefault, content: '<div style="padding:48px 24px;text-align:center;"><h2 style="margin:0 0 8px;font-size:26px;color:#111827;">Stay in the loop</h2><p style="margin:0 0 24px;font-size:14px;color:#6b7280;">Subscribe to our newsletter for the latest updates</p><form style="display:flex;flex-wrap:wrap;gap:8px;max-width:420px;margin:0 auto;justify-content:center;"><input type="email" placeholder="Your email" style="flex:1;min-width:200px;padding:12px 16px;border:1px solid #d1d5db;border-radius:10px;font-size:14px;outline:none;"><button style="padding:12px 24px;background:#3b82f6;color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;">Subscribe</button></form></div>' },
  { id: 'sec-video', label: 'Video Embed', category: 'Sections', media: WPI.video, content: '<div style="position:relative;padding-top:56.25%;border-radius:12px;overflow:hidden;background:#111827;margin:16px 0;"><div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;"><div style="width:72px;height:72px;border-radius:50%;background:rgba(255,255,255,0.9);display:flex;align-items:center;justify-content:center;font-size:28px;color:#111827;">&#9654;</div></div></div>' },
  { id: 'sec-gallery', label: 'Image Gallery', category: 'Sections', media: WPI.gallery, content: '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:8px;padding:16px 0;">' + Array.from({ length: 6 }, () => '<img src="https://placehold.co/400x300/e2e8f0/64748b?text=Gallery" alt="Gallery" style="width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:8px;display:block;">').join('') + '</div>' },
];

const MORE_BLOCKS = [
  { id: 'table', label: 'Table', category: 'Content', media: WPI.blockDefault, content: '<table style="width:100%;border-collapse:collapse;font-size:14px;color:#374151;"><thead><tr style="background:#f8fafc;"><th style="border:1px solid #e2e8f0;padding:10px 14px;text-align:left;font-weight:600;color:#0f172a;">Header 1</th><th style="border:1px solid #e2e8f0;padding:10px 14px;text-align:left;font-weight:600;color:#0f172a;">Header 2</th><th style="border:1px solid #e2e8f0;padding:10px 14px;text-align:left;font-weight:600;color:#0f172a;">Header 3</th></tr></thead><tbody><tr><td style="border:1px solid #e2e8f0;padding:10px 14px;">Cell A1</td><td style="border:1px solid #e2e8f0;padding:10px 14px;">Cell A2</td><td style="border:1px solid #e2e8f0;padding:10px 14px;">Cell A3</td></tr><tr style="background:#f8fafc;"><td style="border:1px solid #e2e8f0;padding:10px 14px;">Cell B1</td><td style="border:1px solid #e2e8f0;padding:10px 14px;">Cell B2</td><td style="border:1px solid #e2e8f0;padding:10px 14px;">Cell B3</td></tr></tbody></table>' },
  { id: 'buttons-group', label: 'Buttons', category: 'Content', media: WPI.button, content: '<div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center;margin:16px 0;"><a href="#" style="display:inline-block;padding:12px 28px;background:#3b82f6;color:#fff;border-radius:8px;font-weight:600;text-decoration:none;">Primary</a><a href="#" style="display:inline-block;padding:12px 28px;background:#fff;color:#3b82f6;border:2px solid #3b82f6;border-radius:8px;font-weight:600;text-decoration:none;">Secondary</a></div>' },
  { id: 'social-links', label: 'Social Icons', category: 'Content', media: WPI.blockDefault, content: '<div style="display:flex;gap:12px;justify-content:center;padding:16px 0;"><a href="#" style="width:40px;height:40px;border-radius:50%;background:#0f172a;color:#fff;display:flex;align-items:center;justify-content:center;text-decoration:none;font-size:16px;">X</a><a href="#" style="width:40px;height:40px;border-radius:50%;background:#1877f2;color:#fff;display:flex;align-items:center;justify-content:center;text-decoration:none;font-size:16px;">f</a><a href="#" style="width:40px;height:40px;border-radius:50%;background:#0a66c2;color:#fff;display:flex;align-items:center;justify-content:center;text-decoration:none;font-size:16px;">in</a><a href="#" style="width:40px;height:40px;border-radius:50%;background:#171515;color:#fff;display:flex;align-items:center;justify-content:center;text-decoration:none;font-size:16px;">GH</a></div>' },
  { id: 'code', label: 'Code Block', category: 'Content', media: WPI.blockDefault, content: '<pre style="background:#0f172a;color:#e2e8f0;border-radius:10px;padding:20px;font-size:13px;line-height:1.7;overflow-x:auto;margin:16px 0;"><code>const greet = (name) =&gt; {&#10;  return `Hello, ${name}!`;&#10;};&#10;&#10;greet("world");</code></pre>' },
  { id: 'columns-4', label: '4 Columns', category: 'Layout', media: WPI.columns, content: '<div style="display:flex;gap:16px;flex-wrap:wrap;"><div style="flex:1;min-width:140px;" data-gjs-type="text"><p>Column 1...</p></div><div style="flex:1;min-width:140px;" data-gjs-type="text"><p>Column 2...</p></div><div style="flex:1;min-width:140px;" data-gjs-type="text"><p>Column 3...</p></div><div style="flex:1;min-width:140px;" data-gjs-type="text"><p>Column 4...</p></div></div>' },
  { id: 'contact-form', label: 'Contact Form', category: 'Sections', media: WPI.blockDefault, content: '<div style="max-width:480px;margin:16px auto;padding:32px;border:1px solid #e5e7eb;border-radius:16px;background:#fff;"><h3 style="margin:0 0 20px;font-size:20px;color:#111827;text-align:center;">Contact Us</h3><form style="display:flex;flex-direction:column;gap:12px;"><input type="text" placeholder="Your name" style="padding:12px 16px;border:1px solid #d1d5db;border-radius:10px;font-size:14px;outline:none;"><input type="email" placeholder="Your email" style="padding:12px 16px;border:1px solid #d1d5db;border-radius:10px;font-size:14px;outline:none;"><textarea rows="4" placeholder="Your message" style="padding:12px 16px;border:1px solid #d1d5db;border-radius:10px;font-size:14px;outline:none;resize:vertical;"></textarea><button style="padding:13px 24px;background:#3b82f6;color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;">Send Message</button></form></div>' },
];

const ALL_BLOCKS = [...LAYOUT_BLOCKS, ...CONTENT_BLOCKS, ...SECTIONS_BLOCKS, ...MORE_BLOCKS, ...CMS_BLOCKS];

// ============================================================
//  VisualEditor Component — Gutenberg-style skeleton layout
// ============================================================

export default function VisualEditor({ content, css, onChange, height, onSaveShortcut, onPublish, onBack, saveState, pageSettings }: VisualEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<Editor | null>(null);
  const pageSettingsRef = useRef(pageSettings);
  pageSettingsRef.current = pageSettings;

  // i18n helper
  const lang = getLang();
  const __ = (key: string) => t(key, lang);

  // --- CMS Plugin (block definitions, canvas styles, theme injection, assets) ---
  const cmsPlugin = useCallback((editor: Editor) => {
    // Register CMS data block component types with live preview
    CMS_BLOCKS.forEach(block => {
      editor.DomComponents.addType(`cms-${block.id}`, {
        model: { defaults: { tagName: 'div', draggable: true, droppable: false, traits: [{ type: 'text', name: 'title', label: 'Title' }] } },
        view: {
          init() {
            this.previewHtml = '';
            this.fetchPreview();
            this.model.on('change', () => this.applyPreview());
          },
          fetchPreview() {
            const h = new Headers();
            const tk = localStorage.getItem('mortar_token');
            if (tk) h.set('Authorization', 'Bearer ' + tk);
            fetch('/api/editor/preview-cms/' + block.id, { headers: h })
              .then(r => r.json())
              .then((d: any) => { if (d.html && this.el && (this.el as HTMLElement).isConnected) { this.previewHtml = d.html; this.applyPreview(); } })
              .catch(() => {});
          },
          applyPreview() { if (this.previewHtml && this.el) { (this.el as HTMLElement).innerHTML = this.previewHtml; } },
        },
      });
    });

    // Add custom blocks to BlockManager
    const bm = editor.BlockManager;
    ALL_BLOCKS.forEach(block => { if (!bm.get(block.id)) { bm.add(block.id, { label: block.label, category: block.category, media: block.media, content: block.content }); } });

    // Canvas theme styles
    editor.on('load', () => {
      const canvas = editor.Canvas.getDocument();
      if (!canvas) return;

      const h = new Headers();
      const tk = localStorage.getItem('mortar_token');
      if (tk) h.set('Authorization', 'Bearer ' + tk);
      fetch('/api/editor/canvas-css', { headers: h })
        .then(r => r.json()).then((d: any) => {
          const urls = (d?.styles || []) as string[];
          if (urls.length === 0) { const link = canvas.createElement('link'); link.rel = 'stylesheet'; link.href = 'https://cdnjs.cloudflare.com/ajax/libs/tailwindcss/2.2.19/tailwind.min.css'; canvas.head.appendChild(link); return; }
          urls.forEach((href: string) => { if (!canvas.querySelector('link[href="' + href + '"]')) { const link = canvas.createElement('link'); link.rel = 'stylesheet'; link.href = href; canvas.head.appendChild(link); } });
        }).catch(() => {});

      const style = canvas.createElement('style');
      style.textContent = `html,body{margin:0!important;padding:0!important;width:100%!important;max-width:none!important;box-sizing:border-box!important;display:block!important;position:static!important}html{height:100%!important;overflow:visible!important;background:#fff;color-scheme:light}body{min-height:100%!important;height:auto!important;overflow:visible!important;background:#fff}.cms-post-list,.cms-categories,.cms-comments,.cms-search,.cms-archive,.cms-tag-cloud{min-height:40px}`;
      canvas.head.appendChild(style);

      fetch('/api/settings').then(r => r.json()).then(s => {
        const vars: Record<string, string> = { '--primary-color': s.theme_primary_color || '#3b82f6', '--background': s.theme_background || '#ffffff', '--text-color': s.theme_text_color || '#111827', '--link-color': s.theme_link_color || '#2563eb', '--heading-font': s.theme_heading_font || 'inherit', '--body-font': s.theme_body_font || 'inherit' };
        const adminPrimary = getComputedStyle(document.documentElement).getPropertyValue('--admin-primary').trim() || '#3b82f6';
        const vStyle = canvas.createElement('style');
        vStyle.textContent = ':root{' + Object.entries(vars).map(([k, v]) => k + ':' + v + ';').join('') + '--primary:' + adminPrimary + ';--primary-soft:' + adminPrimary + '22;}';
        canvas.head.appendChild(vStyle);
        if (s.theme_custom_css) { const tStyle = canvas.createElement('style'); tStyle.textContent = s.theme_custom_css; canvas.head.appendChild(tStyle); }
      }).catch(() => {});
    });

    // Pre-populate Asset Manager
    editor.on('load', () => {
      const token = localStorage.getItem('mortar_token') || '';
      fetch('/api/media?limit=60', { headers: { Authorization: 'Bearer ' + token } })
        .then(r => r.json()).then((d: any) => {
          const imgs = (d?.media || []).filter((m: any) => m.mimeType?.startsWith('image/'));
          if (imgs.length > 0) editor.AssetManager.add(imgs.map((m: any) => ({ src: m.url, name: m.original, type: 'image' })));
        }).catch(() => {});
    });

    // Empty-state overlay
    editor.on('load', () => {
      const root = containerRef.current?.querySelector('.ve-guten-content') as HTMLElement;
      if (!root) return;
      const emptyState = document.createElement('div');
      emptyState.className = 've-empty-state';
      emptyState.innerHTML = '<div class="ve-empty-card"><div class="ve-empty-icon">✦</div><p class="ve-empty-title">' + __('click + to add your first block') + '</p><p class="ve-empty-sub">' + __('or start with a template') + ':</p><div class="ve-empty-actions"><button data-add="hero">' + __('hero banner') + '</button><button data-add="two-columns">' + __('2 columns') + '</button><button data-add="sec-pricing">' + __('pricing') + '</button><button data-add="post-list">' + __('post list') + '</button></div></div>';
      root.appendChild(emptyState);
      const updateEmptyState = () => { let hc = false; try { hc = editor.getComponents().length > 0; } catch {} emptyState.style.display = hc ? 'none' : 'flex'; };
      updateEmptyState();
      editor.on('component:add', updateEmptyState);
      editor.on('component:remove', updateEmptyState);
      editor.on('component:reset', updateEmptyState);
      emptyState.addEventListener('click', (e) => {
        const btn = (e.target as HTMLElement).closest('button');
        if (!btn?.dataset.add) return;
        const block = ALL_BLOCKS.find(b => b.id === btn.dataset.add);
        if (block) editor.addComponents(block.content);
      });
    });
  }, []);

  // --- Refs for stable callbacks ---
  const onChangeRef = useRef(onChange); onChangeRef.current = onChange;
  const onSaveRef = useRef(onSaveShortcut); onSaveRef.current = onSaveShortcut;
  const onPublishRef = useRef(onPublish); onPublishRef.current = onPublish;
  const onBackRef = useRef(onBack); onBackRef.current = onBack;
  const lastContentRef = useRef(content);
  // Bridge for the snackbar function defined inside the main useEffect
  const snackbarFnRef = useRef<(msg: string) => void>(() => {});

  // ============================================================
  //  MAIN INIT — Build Gutenberg skeleton + init GrapesJS
  // ============================================================
  useEffect(() => {
    if (!containerRef.current || editorRef.current) return;
    const ct = containerRef.current;

    // --- Build Gutenberg skeleton ---
    ct.innerHTML = `
      <div class="ve-guten-skeleton">
        <div class="ve-guten-header">
          <div class="ve-guten-header-left">
            ${onBack ? `<button id="ve-back-btn" class="ve-guten-icon-btn" title="${__('back to rich text')}" aria-label="${__('back to rich text')}">${WPI.arrowLeft}</button>` : ''}
            <button id="ve-inserter-btn" class="ve-guten-icon-btn" title="Toggle block inserter" aria-label="Add block">${WPI.plus}</button>
            <button id="ve-undo-btn" class="ve-guten-icon-btn" title="Undo" aria-label="Undo">${WPI.undo}</button>
            <button id="ve-redo-btn" class="ve-guten-icon-btn" title="Redo" aria-label="Redo">${WPI.redo}</button>
            <button id="ve-list-btn" class="ve-guten-icon-btn" title="Document Overview" aria-label="Document Overview">${WPI.listView}</button>
          </div>
          <div class="ve-guten-header-center">
            <div class="ve-guten-block-breadcrumb" id="ve-header-breadcrumb"></div>
          </div>
          <div class="ve-guten-header-right">
            <div class="ve-guten-device-switcher" id="ve-device-switcher">
              <button data-device="desktop" class="ve-guten-device-btn is-active" title="Desktop" aria-label="Desktop">${WPI.desktop}</button>
              <button data-device="tablet" class="ve-guten-device-btn" title="Tablet" aria-label="Tablet">${WPI.tablet}</button>
              <button data-device="mobile" class="ve-guten-device-btn" title="Mobile" aria-label="Mobile">${WPI.mobile}</button>
            </div>
            <button id="ve-preview-btn" class="ve-guten-text-btn${pageSettingsRef.current?.slug ? '' : ' is-disabled'}" title="${pageSettingsRef.current?.slug ? '' : __('save first to preview')}">${__('preview')}</button>
            <button id="ve-save-btn" class="ve-guten-text-btn">${__('save draft')}</button>
            <button id="ve-publish-btn" class="ve-guten-primary-btn">${__('publish')}</button>
            <button id="ve-settings-btn" class="ve-guten-icon-btn" title="Settings" aria-label="Settings">${WPI.cog}</button>
            <button id="ve-more-btn" class="ve-guten-icon-btn" title="More options" aria-label="More options">${WPI.moreVert}</button>
          </div>
        </div>
        <div class="ve-guten-body">
          <div class="ve-guten-inserter-sidebar" id="ve-guten-inserter" style="display:none">
            <div class="ve-guten-panel-hdr">
              <div class="ve-guten-inserter-tabs">
                <button class="ve-guten-inserter-tab is-active" data-itab="blocks">${__('blocks')}</button>
                <button class="ve-guten-inserter-tab" data-itab="media">${__('media')}</button>
                <button class="ve-guten-inserter-tab" data-itab="shortcodes">${__('shortcodes')}</button>
              </div>
              <button class="ve-guten-close-sm" data-close="inserter" aria-label="${__('close')}">${WPI.close}</button>
            </div>
            <div class="ve-guten-inserter-search" data-isearch="blocks">
              <input type="text" placeholder="${__('search blocks')}" id="ve-inserter-search" />
            </div>
            <div class="ve-guten-inserter-body" data-ipanel="blocks">
              ${(() => {
                let html = '';
                // "Recent" blocks first (WordPress behavior)
                try {
                  const recentIds = JSON.parse(sessionStorage.getItem('mortar_recent_blocks') || '[]');
                  const recentBlocks = recentIds.map((id: string) => ALL_BLOCKS.find(b => b.id === id)).filter(Boolean);
                  if (recentBlocks.length > 0) {
                    html += '<div class="ve-guten-inserter-cat"><div class="ve-guten-inserter-cat-title">' + __('recent') + '</div><div class="ve-guten-inserter-grid">' +
                      recentBlocks.map((b: any) => `<button class="ve-guten-inserter-block" data-block="${b.id}"><span class="ve-guten-inserter-icon">${b.media}</span><span class="ve-guten-inserter-label">${__('block ' + b.id)}</span></button>`).join('') +
                      '</div></div>';
                  }
                } catch {}
                // Categorized blocks
                html += Object.entries(ALL_BLOCKS.reduce((acc: Record<string, any[]>, b) => { (acc[b.category] ||= []).push(b); return acc; }, {})).map(([cat, blocks]) => `
                  <div class="ve-guten-inserter-cat">
                    <div class="ve-guten-inserter-cat-title">${__('block category ' + cat)}</div>
                    <div class="ve-guten-inserter-grid">
                      ${blocks.map(b => `<button class="ve-guten-inserter-block" data-block="${b.id}" data-label="${b.label}"><span class="ve-guten-inserter-icon">${b.media}</span><span class="ve-guten-inserter-label">${__('block ' + b.id)}</span></button>`).join('')}
                    </div>
                  </div>
                `).join('');
                return html;
              })()}
            </div>
            <div class="ve-guten-inserter-media" data-ipanel="media" style="display:none">
              <div class="ve-guten-inserter-media-grid" id="ve-inserter-media-grid">
                <div class="ve-guten-inserter-media-empty">${__('loading media')}…</div>
              </div>
            </div>
            <div class="ve-guten-inserter-media" data-ipanel="shortcodes" style="display:none">
              <div class="ve-guten-inserter-cat">
                <div class="ve-guten-inserter-cat-title">${__('shortcodes')}</div>
                <div class="ve-guten-inserter-grid" id="ve-inserter-shortcode-grid">
                  <div class="ve-guten-inserter-media-empty">${__('loading shortcodes')}…</div>
                </div>
              </div>
            </div>
          </div>
          <div class="ve-guten-secondary-sidebar" id="ve-guten-list" style="display:none">
            <div class="ve-guten-panel-hdr">
              <span>${__('document overview')}</span>
              <button class="ve-guten-close-sm" data-close="list" aria-label="${__('close')}">${WPI.close}</button>
            </div>
            <div class="ve-guten-list-body"></div>
          </div>
          <div class="ve-guten-content" id="ve-guten-content"></div>
        </div>
        <div class="ve-guten-footer" id="ve-guten-footer" style="display:none">
          <div class="ve-guten-footer-breadcrumb"></div>
        </div>
      </div>
      <div class="ve-guten-more-menu" id="ve-more-menu" style="display:none">
        <button data-more="code-view">${__('code view')}</button>
        <button data-more="style-book">${__('style book')}</button>
        <button data-more="fullscreen">${__('fullscreen')}</button>
        <button data-more="refresh">${__('refresh')}</button>
      </div>
      <div class="ve-style-book" id="ve-style-book" style="display:none">
        <div class="ve-style-book-hdr">
          <span class="ve-style-book-title">${__('style book')}</span>
          <div class="ve-style-book-devices">
            <button data-sbw="desktop" class="is-active">${WPI.desktop}</button>
            <button data-sbw="tablet">${WPI.tablet}</button>
            <button data-sbw="mobile">${WPI.mobile}</button>
          </div>
          <button class="ve-style-book-close">${WPI.close}</button>
        </div>
        <div class="ve-style-book-body"></div>
      </div>
      <div class="ve-snackbar" id="ve-snackbar" style="display:none"></div>
    `;

    // --- GrapesJS config ---
    const contentEl = ct.querySelector('#ve-guten-content') as HTMLElement;
    const config: EditorConfig = {
      container: contentEl,
      height: '100%',
      width: 'auto',
      storageManager: false,
      autorender: true,
      noticeOnUnload: false,
      forceClass: false,
      canvas: {
        styles: [],
        frameStyle: `
          :root{--primary:#3b82f6;--primary-soft:rgba(59,130,246,.08)}
          html,body{margin:0!important;padding:0!important;width:100%!important;max-width:none!important;box-sizing:border-box!important;display:block!important;position:static!important}
          html{height:100%!important;overflow:visible!important;background:#fff;color-scheme:light}
          body{min-height:100%!important;height:auto!important;overflow:visible!important;background:#fff;-webkit-font-smoothing:antialiased;font-family:var(--body-font,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif);color:#111827}
          h1,h2,h3{font-family:var(--heading-font,inherit);line-height:1.3}
          [data-gjs-highlightable]{outline:none!important;transition:box-shadow .15s ease}
          .gjs-highlighted{outline:1px solid rgba(0,124,186,.35)!important;outline-offset:-1px}
          .gjs-selected{outline:1px solid rgba(0,124,186,.6)!important;outline-offset:-1px}
          .gjs-dashed *[data-gjs-highlightable]{outline:none!important}
          .gjs-placeholder,.gjs-placeholder-int,.gjs-placeholder-vert{background:var(--primary-soft)!important;border:2px dashed var(--primary)!important;border-radius:4px;transition:all .12s ease}
          .gjs-placeholder-int{height:4px!important}
          .gjs-text{line-height:1.7}
        `,
      },
      plugins: [cmsPlugin],
      styleManager: {
        sectors: [
          { name: 'Typography', open: false, properties: [{ property: 'font-size', type: 'select', defaults: 'inherit', options: [{ id: 'inherit', value: 'inherit', label: 'Default' }, { id: '12px', value: '12px' }, { id: '14px', value: '14px' }, { id: '16px', value: '16px' }, { id: '18px', value: '18px' }, { id: '24px', value: '24px' }, { id: '32px', value: '32px' }, { id: '48px', value: '48px' }] }, { property: 'font-weight', type: 'select', defaults: 'inherit', options: [{ id: 'inherit', value: 'inherit', label: 'Default' }, { id: '300', value: '300', label: 'Light' }, { id: '400', value: '400', label: 'Regular' }, { id: '500', value: '500', label: 'Medium' }, { id: '600', value: '600', label: 'Semi Bold' }, { id: '700', value: '700', label: 'Bold' }] }, { property: 'text-align', type: 'radio', defaults: 'left', options: [{ id: 'left', value: 'left' }, { id: 'center', value: 'center' }, { id: 'right', value: 'right' }] }, { property: 'color', type: 'color' }, { property: 'line-height' }, { property: 'letter-spacing' }] },
          { name: 'Spacing', open: false, properties: [{ property: 'padding', type: 'composite', properties: [{ property: 'padding-top' }, { property: 'padding-right' }, { property: 'padding-bottom' }, { property: 'padding-left' }] }, { property: 'margin', type: 'composite', properties: [{ property: 'margin-top' }, { property: 'margin-right' }, { property: 'margin-bottom' }, { property: 'margin-left' }] }] },
          { name: 'Background', open: false, properties: [{ property: 'background-color', type: 'color' }, { property: 'background', type: 'file' }] },
          { name: 'Border', open: false, properties: [{ property: 'border-radius', type: 'slider', defaults: '0', min: 0, max: 100, unit: 'px' }, { property: 'border', type: 'composite', properties: [{ property: 'border-width' }, { property: 'border-style' }, { property: 'border-color' }] }] },
          { name: 'Size', open: false, properties: [{ property: 'width', type: 'slider', min: 0, max: 1200, unit: 'px', defaults: 'auto' }, { property: 'max-width', type: 'slider', min: 0, max: 1200, unit: 'px' }, { property: 'height', type: 'slider', min: 0, max: 1200, unit: 'px' }] },
          { name: 'Layout', open: false, properties: [{ property: 'display', type: 'select', defaults: 'block', options: [{ id: 'block', value: 'block', label: 'Block' }, { id: 'inline-block', value: 'inline-block', label: 'Inline Block' }, { id: 'flex', value: 'flex', label: 'Flex' }, { id: 'grid', value: 'grid', label: 'Grid' }, { id: 'none', value: 'none', label: 'None' }] }, { property: 'flex-direction', type: 'select', defaults: 'row', options: [{ id: 'row', value: 'row' }, { id: 'column', value: 'column' }] }, { property: 'justify-content', type: 'select', defaults: 'flex-start', options: [{ id: 'flex-start', value: 'flex-start' }, { id: 'center', value: 'center' }, { id: 'flex-end', value: 'flex-end' }, { id: 'space-between', value: 'space-between' }] }, { property: 'align-items', type: 'select', defaults: 'stretch', options: [{ id: 'stretch', value: 'stretch' }, { id: 'flex-start', value: 'flex-start' }, { id: 'center', value: 'center' }, { id: 'flex-end', value: 'flex-end' }] }, { property: 'text-align', type: 'select', defaults: 'left', options: [{ id: 'left', value: 'left' }, { id: 'center', value: 'center' }, { id: 'right', value: 'right' }] }] },
          { name: 'Effects', open: false, properties: [{ property: 'opacity', type: 'slider', defaults: '1', min: 0, max: 1, step: 0.05 }, { property: 'box-shadow', type: 'shadow' }, { property: 'transform', type: 'select', defaults: 'none', options: [{ id: 'none', value: 'none' }, { id: 'rotate(90deg)', value: 'rotate(90deg)' }, { id: 'rotate(180deg)', value: 'rotate(180deg)' }, { id: 'scale(1.1)', value: 'scale(1.1)' }] }] },
        ],
      },
    };

    const editor = grapesjs.init(config);
    editorRef.current = editor;

    // Hide GrapesJS panels (we provide our own chrome)
    // Never show component outlines (wireframe view) — force off permanently.
    // stopCommand must run AFTER the canvas body exists (i.e. on 'load'),
    // otherwise the gjs-dashed class is re-added by the default active command.
    const disableOutline = () => {
      try { editor.stopCommand('core:component-outline'); } catch {}
      try {
        const b = editor.Canvas.getBody();
        if (b) b.classList.remove('gjs-dashed');
      } catch {}
      // Also deactivate the toolbar toggle button if present
      try {
        const btn = ct.querySelector('.gjs-pn-btn[title="View components"]');
        btn?.classList.remove('gjs-pn-active');
      } catch {}
    };
    disableOutline();
    editor.on('load', disableOutline);
    editor.on('run:core:component-outline', disableOutline);
    editor.on('stop:core:component-outline', disableOutline);

    // CRITICAL FIX: Clear widthMedia on ALL devices so component CSS rules
    // (extracted from inline styles, e.g. display:flex on a 2-column block)
    // stay GLOBAL. Otherwise GrapesJS scopes the rule to the device's media
    // query (e.g. @media (max-width:480px)) and it stops applying after
    // switching to a wider device — flex blocks then render as stacked rows.
    try {
      editor.Devices.getAll().forEach((d: any) => d.set('widthMedia', ''));
    } catch {}

    // Remove default blocks we don't need
    ['map', 'link'].forEach(id => editor.BlockManager.remove(id));

    // Force-hide views container initially (GrapesJS may set inline styles)
    setTimeout(() => {
      const vc = ct.querySelector('.gjs-pn-views-container') as HTMLElement;
      if (vc) vc.style.display = 'none';
    }, 300);

    // Force canvas to fill the entire content area
    editor.on('load', () => {
      const canvasDoc = editor.Canvas.getDocument();
      if (!canvasDoc) return;

      // Override body styles with JS (highest priority)
      const body = canvasDoc.body;
      const html = canvasDoc.documentElement;
      [body, html].forEach(el => {
        el.style.setProperty('margin', '0', 'important');
        el.style.setProperty('padding', '0', 'important');
        el.style.setProperty('max-width', 'none', 'important');
        el.style.setProperty('width', '100%', 'important');
        el.style.setProperty('box-sizing', 'border-box', 'important');
        el.style.setProperty('display', 'block', 'important');
        el.style.setProperty('position', 'static', 'important');
      });
      html.style.setProperty('height', '100%', 'important');
      html.style.setProperty('overflow', 'visible', 'important');
      body.style.setProperty('min-height', '100%', 'important');
      body.style.setProperty('height', 'auto', 'important');

      // Force iframe to fill its wrapper — set it directly
      const frameEl = editor.Canvas.getElement() as HTMLElement;
      if (frameEl) {
        const wrapper = frameEl.closest('.gjs-frame-wrapper') as HTMLElement;
        const iframe = wrapper?.querySelector('iframe') as HTMLIFrameElement;
        if (iframe) {
          // NOTE: do NOT force iframe height — GrapesJS auto-sizes it to the
          // body content height so zoomed-in content is never clipped.
          iframe.style.display = 'block';
          iframe.style.margin = '0';
          iframe.style.padding = '0';
          iframe.style.border = 'none';
        }
        // Force wrapper to fill canvas
        const framesDiv = wrapper?.parentElement as HTMLElement;
        if (framesDiv) {
          framesDiv.style.width = '100%';
          framesDiv.style.height = '100%';
        }
      }

      // Refresh canvas dimensions
      try { editor.Canvas.refresh?.(); } catch {}

      // Continuously force full-width and full-height
      const forceFullLayout = () => {
        const cd = editor.Canvas.getDocument();
        if (!cd) return;
        // Body inside iframe
        cd.body.style.setProperty('max-width', 'none', 'important');
        cd.body.style.setProperty('width', '100%', 'important');
        cd.documentElement.style.setProperty('height', '100%', 'important');
        // Force iframe height (width is managed by GrapesJS device switching)
        const w = ct.querySelector('.gjs-frame-wrapper') as HTMLElement;
        const f = w?.querySelector('iframe') as HTMLElement;
        // NOTE: do not set w.style.margin — GrapesJS uses margin:auto to center the frame.
        // Do not force heights either — GrapesJS auto-sizes the frame to content.
        if (w) { w.style.padding = '0'; }
        if (f) { f.style.display = 'block'; f.style.border = 'none'; }
        // Force canvas element to fill editor from the very top —
        // GrapesJS offsets the canvas by --gjs-canvas-top / --gjs-left-width
        // to make room for its hidden toolbars; zero them out.
        const cv = ct.querySelector('.gjs-cv-canvas') as HTMLElement;
        if (cv) {
          cv.style.display = 'flex';
          cv.style.flex = '1 1 0%';
          cv.style.margin = '0';
          cv.style.padding = '0';
          cv.style.top = '0';
          cv.style.left = '0';
          cv.style.width = '100%';
          cv.style.height = '100%';
          cv.style.setProperty('--gjs-canvas-top', '0px');
          cv.style.setProperty('--gjs-left-width', '0px');
        }
        // Force gjs-editor to have no gaps
        const ed = ct.querySelector('.gjs-editor') as HTMLElement;
        if (ed) { ed.style.padding = '0'; ed.style.margin = '0'; ed.style.gap = '0'; ed.style.display = 'flex'; ed.style.flexDirection = 'column'; }
        // Kill any leftover top toolbar strip / panels that create a blank
        // band between our header and the canvas
        const panelsEl = ct.querySelector('.gjs-pn-panels') as HTMLElement;
        if (panelsEl) { panelsEl.style.display = 'none'; panelsEl.style.height = '0'; panelsEl.style.padding = '0'; panelsEl.style.margin = '0'; }
        // Ensure canvas starts at the very top of the editor
        const framesEl = ct.querySelector('.gjs-cv-canvas__frames') as HTMLElement;
        if (framesEl) { framesEl.style.top = '0'; framesEl.style.marginTop = '0'; }
        // Re-apply body width rules (only inside iframe; no wrapper width forcing)
        const b = cd.body;
        if (b) { b.style.setProperty('max-width', 'none', 'important'); b.style.setProperty('width', '100%', 'important'); }
      };
      forceFullLayout();
      editor.on('component:add', forceFullLayout);
      editor.on('component:update', forceFullLayout);
      editor.on('styleable:change', forceFullLayout);
      // Also run on load to correct GrapesJS's initial size calculation
      setTimeout(forceFullLayout, 100);
      setTimeout(forceFullLayout, 500);
    });

    // Load initial content
    if (content) { try { editor.setComponents(content); } catch { editor.setComponents('<p>Start building your page...</p>'); } }
    if (css) { try { editor.setStyle(css); } catch {} }
    lastContentRef.current = content;

    // --- Change notification ---
    let changeTimer: ReturnType<typeof setTimeout>;
    const notifyChange = () => {
      clearTimeout(changeTimer);
      changeTimer = setTimeout(() => {
        const ed = editorRef.current; if (!ed) return;
        const html = ed.getHtml(); const styles = ed.getCss();
        lastContentRef.current = html; onChangeRef.current(html, styles || '');
      }, 500);
    };
    editor.on('component:update', notifyChange);
    editor.on('component:add', notifyChange);
    editor.on('component:remove', notifyChange);
    editor.on('styleable:change', notifyChange);
    editor.on('change:device', notifyChange);

    // --- Canvas keyboard shortcuts ---
    const canvasDoc = editor.Canvas.getDocument();
    // Clipboard for block copy/paste
    let clipHtml: string | null = null;
    const canvasKeyHandler = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if ((e.ctrlKey || e.metaKey) && k === 's') { e.preventDefault(); onSaveRef.current?.(); return; }
      if ((e.ctrlKey || e.metaKey) && k === 'z') { e.preventDefault(); try { editor.runCommand('core:undo'); } catch {} return; }
      if ((e.ctrlKey || e.metaKey) && k === 'y') { e.preventDefault(); try { editor.runCommand('core:redo'); } catch {} return; }
      const comp = editor.getSelected() as any;
      if ((e.ctrlKey || e.metaKey) && k === 'c') { e.preventDefault(); if (comp) { try { clipHtml = comp.toHTML?.() || ''; } catch {} } return; }
      if ((e.ctrlKey || e.metaKey) && k === 'v') { e.preventDefault(); if (clipHtml) { try { editor.addComponents(clipHtml); notifyChange(); } catch {} } return; }
      if (!comp) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') { e.preventDefault(); const p = comp.parent(); if (p) { const s = p.components(); const i = s.indexOf(comp); if (i > -1) { const c = comp.clone(); s.add(c, { at: i + 1 }); editor.select(c); } } return; }
      if (e.altKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) { e.preventDefault(); const p = comp.parent(); if (p) { const s = p.components(); const i = s.indexOf(comp); const t = e.key === 'ArrowUp' ? i - 1 : i + 1; if (i > -1 && t >= 0 && t < s.length) { s.remove(comp); s.add(comp, { at: t }); editor.select(comp); } } }
    };
    canvasDoc?.addEventListener('keydown', canvasKeyHandler);

    // --- Zoom control (fully custom, no GrapesJS zoom API) ---
    // We resize the frame's ACTUAL pixel size. This never fights with
    // GrapesJS's own transform-based zoom, so the +/− buttons always work.
    let currentZoom = 100;
    // Sync frames height to the iframe content so the canvas scroll area
    // always contains the full content when zoomed in.
    const syncFramesHeight = () => {
      const frames = ct.querySelector('.gjs-cv-canvas__frames') as HTMLElement;
      const wrapper = frames?.querySelector('.gjs-frame-wrapper') as HTMLElement;
      const canvas = ct.querySelector('.gjs-cv-canvas') as HTMLElement;
      if (frames && wrapper) {
        const h = wrapper.offsetHeight;
        const canvasH = canvas?.clientHeight || 0;
        if (h > 0) frames.style.height = Math.max(h, canvasH) + 'px';
        else if (canvasH > 0) frames.style.height = canvasH + 'px';
      }
    };
    // Apply the zoom by resizing frames to an absolute pixel width.
    // Top-left anchored: growth goes right and down; canvas scrollbars
    // cover the full zoomed area; scrollLeft=0 shows the leftmost content.
    const applyZoom = () => {
      const frames = ct.querySelector('.gjs-cv-canvas__frames') as HTMLElement;
      const canvas = ct.querySelector('.gjs-cv-canvas') as HTMLElement;
      if (!frames || !canvas) return;
      const z = currentZoom / 100;
      // Base width = the CURRENT DEVICE width (desktop = full canvas width;
      // tablet/mobile = their fixed px width), so switching devices changes
      // the frame size. Then multiply by the zoom factor.
      let baseW = canvas.clientWidth;
      try {
        const devices = editor.Devices.getAll();
        const cur = editor.getDevice();
        const dev = devices.find((d: any) => d.id === cur);
        const dw = dev?.get?.('width');
        if (dw && !String(dw).includes('%')) baseW = parseFloat(dw);
      } catch {}
      const cw = canvas.clientWidth;
      const w = Math.max(1, Math.round(baseW * z));
      frames.style.transform = 'none';
      frames.style.transformOrigin = 'top left';
      frames.style.top = '0';
      frames.style.width = w + 'px';
      if (w <= cw) {
        // Not yet full-width (zoomed out, or zoomed in on a device view where
        // the frame is still narrower than the canvas): horizontally CENTERED,
        // top-aligned. Device switches re-run this, so the frame re-centers.
        frames.style.left = Math.max(0, Math.round((cw - w) / 2)) + 'px';
      } else {
        // Wider than the canvas: anchor TOP-LEFT so the scrollbars cover the
        // full content and scrollLeft=0 shows the leftmost part.
        frames.style.left = '0';
      }
      const wrapper = frames.querySelector('.gjs-frame-wrapper') as HTMLElement;
      if (wrapper) {
        // The iframe follows the wrapper (width:100%), and wrapper width
        // changes apply SYNCHRONOUSLY — setting the iframe width directly is
        // async (its internal document reflows with a delay), which caused
        // device switches to lag one step behind.
        wrapper.style.width = '100%';
        wrapper.style.left = '0';
        wrapper.style.right = 'auto';
        wrapper.style.margin = '0';
      }
      canvas.scrollLeft = 0;
      canvas.scrollTop = 0;
      syncFramesHeight();
      // The iframe reflows after the width change — re-sync height later.
      setTimeout(syncFramesHeight, 50);
      setTimeout(syncFramesHeight, 200);
      const v = zoomBar?.querySelector('.ve-zoom-value') as HTMLElement;
      if (v) v.textContent = currentZoom + '%';
    };
    const setZoom = (z: number) => {
      currentZoom = Math.max(30, Math.min(300, Math.round(z)));
      applyZoom();
    };
    editor.on('component:add', syncFramesHeight);
    editor.on('component:update', syncFramesHeight);
    editor.on('component:remove', syncFramesHeight);
    // Re-apply zoom after device switches (device width changes, so the
    // frame + iframe must resize and re-center/re-anchor accordingly).
    editor.on('change:device', () => {
      setTimeout(applyZoom, 50);
      setTimeout(applyZoom, 200);
    });
    setTimeout(applyZoom, 300);
    setTimeout(applyZoom, 800);

    // --- Ctrl+wheel zoom ---
    const wheelHandler = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      setZoom(currentZoom + (e.deltaY < 0 ? 10 : -10));
    };
    ct.addEventListener('wheel', wheelHandler, { passive: false });

    // --- Zoom bar ---
    const zoomBar = document.createElement('div');
    zoomBar.className = 've-zoom-bar';
    zoomBar.innerHTML = '<button data-zoom="out" title="Zoom out">−</button><span class="ve-zoom-value">100%</span><button data-zoom="in" title="Zoom in">+</button><button data-zoom="fit" title="Reset zoom (100%)">⤢</button>';
    ct.appendChild(zoomBar);
    zoomBar.addEventListener('click', (e) => {
      const btn = (e.target as HTMLElement).closest('button');
      if (!btn?.dataset.zoom) return;
      const d = btn.dataset.zoom;
      if (d === 'in') setZoom(currentZoom + 10);
      else if (d === 'out') setZoom(currentZoom - 10);
      else setZoom(100);
    });
    setTimeout(applyZoom, 300);
    setTimeout(applyZoom, 800);

    // ============================================================
    //  GUTENBERG CHROME — Header buttons
    // ============================================================

    // --- Block Inserter (side panel, pushes canvas right) ---
    const inserterEl = ct.querySelector('#ve-guten-inserter') as HTMLElement;
    const inserterSearch = ct.querySelector('#ve-inserter-search') as HTMLInputElement;
    const inserterBtn = ct.querySelector('#ve-inserter-btn') as HTMLElement;
    const showInserter = () => { inserterEl.style.display = ''; inserterBtn?.classList.add('is-pressed'); inserterSearch?.focus(); };
    const hideInserter = () => { inserterEl.style.display = 'none'; inserterBtn?.classList.remove('is-pressed'); };
    const toggleInserter = () => { if (inserterEl.style.display === 'none') showInserter(); else hideInserter(); };
    ct.querySelector('[data-close="inserter"]')?.addEventListener('click', hideInserter);
    inserterSearch?.addEventListener('input', () => {
      const q = inserterSearch.value.toLowerCase().trim();
      inserterEl.querySelectorAll('.ve-guten-inserter-block').forEach((b: Element) => { const l = (b as HTMLElement).textContent?.toLowerCase() || ''; (b as HTMLElement).style.display = !q || l.includes(q) ? '' : 'none'; });
      inserterEl.querySelectorAll('.ve-guten-inserter-cat').forEach((cat: Element) => { const hidden = cat.querySelectorAll('.ve-guten-inserter-block[style*="display: none"]').length; const total = cat.querySelectorAll('.ve-guten-inserter-block').length; (cat as HTMLElement).style.display = q && hidden >= total ? 'none' : ''; });
    });
    inserterEl.addEventListener('click', (e) => {
      const btn = (e.target as HTMLElement).closest('.ve-guten-inserter-block') as HTMLElement;
      if (!btn || btn.dataset.shortcode) return;
      const block = ALL_BLOCKS.find(b => b.id === btn.dataset.block);
      if (block) {
        const sel = editor.getSelected() as any;
        if (sel) { const p = sel.parent?.(); if (p) { const s = p.components(); s.add(block.content, { at: s.indexOf(sel) + 1 }); } else editor.addComponents(block.content); }
        else editor.addComponents(block.content);
        // Record recent block usage (WordPress "Recent" section)
        try {
          const recent = JSON.parse(sessionStorage.getItem('mortar_recent_blocks') || '[]');
          const list = [block.id, ...recent.filter((x: string) => x !== block.id)].slice(0, 6);
          sessionStorage.setItem('mortar_recent_blocks', JSON.stringify(list));
        } catch {}
      }
      hideInserter();
    });
    const escHandler = (e: KeyboardEvent) => { if (e.key === 'Escape' && inserterEl.style.display !== 'none') hideInserter(); };
    document.addEventListener('keydown', escHandler);
    // Selecting a block on the canvas closes the inserter (WordPress behavior)
    editor.on('component:selected', () => { if (inserterEl.style.display !== 'none') hideInserter(); });
    // Clicking the canvas blank area selects the root "Body" component —
    // deselect it so the selection can always be cleared (WordPress behavior).
    editor.on('component:selected', (comp: any) => {
      if (comp && (comp.get?.('type') === 'wrapper' || comp.get?.('tagName') === 'body')) {
        try { (editor as any).select(null); } catch {}
      }
    });

    // --- Inserter tab switching (Blocks / Media / Shortcodes) ---
    let mediaLoaded = false;
    let shortcodeLoaded = false;
    inserterEl.querySelector('.ve-guten-inserter-tabs')?.addEventListener('click', (e) => {
      const tab = (e.target as HTMLElement).closest('.ve-guten-inserter-tab') as HTMLElement;
      if (!tab?.dataset.itab) return;
      inserterEl.querySelectorAll('.ve-guten-inserter-tab').forEach(t => t.classList.toggle('is-active', t === tab));
      const tabName = tab.dataset.itab;
      inserterEl.querySelectorAll('[data-ipanel]').forEach((p: Element) => {
        (p as HTMLElement).style.display = p.getAttribute('data-ipanel') === tabName ? '' : 'none';
      });
      const searchEl = inserterEl.querySelector('[data-isearch]') as HTMLElement;
      if (searchEl) {
        searchEl.style.display = (tabName === 'blocks' || tabName === 'shortcodes') ? '' : 'none';
        const searchInput = searchEl.querySelector('input') as HTMLInputElement;
        if (searchInput) {
          searchInput.placeholder = tabName === 'shortcodes' ? __('search shortcodes') : __('search blocks');
          searchInput.value = '';
          searchInput.dispatchEvent(new Event('input'));
        }
      }
      if (tabName === 'media' && !mediaLoaded) loadMediaTab();
      if (tabName === 'shortcodes' && !shortcodeLoaded) loadShortcodeTab();
    });

    // Load media library into the Media tab
    const loadMediaTab = () => {
      mediaLoaded = true;
      const grid = ct.querySelector('#ve-inserter-media-grid') as HTMLElement;
      if (!grid) return;
      grid.innerHTML = '<div class="ve-guten-inserter-media-empty">' + __('loading media') + '…</div>';
      const token = localStorage.getItem('mortar_token') || '';
      fetch('/api/media?limit=48', { headers: { Authorization: 'Bearer ' + token } })
        .then(r => r.json())
        .then((d: any) => {
          const imgs = (d?.media || []).filter((m: any) => m.mimeType?.startsWith('image/'));
          if (imgs.length === 0) {
            grid.innerHTML = '<div class="ve-guten-inserter-media-empty">' + __('no media found') + '</div>';
            return;
          }
          grid.innerHTML = '';
          // Multi-select state: pick several images, then insert them as a gallery
          const picked = new Set<string>();
          const galleryBtn = document.createElement('button');
          galleryBtn.className = 've-guten-inserter-gallery-btn';
          galleryBtn.style.display = 'none';
          galleryBtn.textContent = __('insert as gallery') + ' (0)';
          grid.parentElement?.appendChild(galleryBtn);
          const updateGalleryBtn = () => {
            galleryBtn.style.display = picked.size > 0 ? 'block' : 'none';
            galleryBtn.textContent = __('insert as gallery') + ' (' + picked.size + ')';
          };
          galleryBtn.addEventListener('click', () => {
            const items = imgs.filter((m: any) => picked.has(m.id));
            const galleryHtml = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px;">' +
              items.map((m: any) => `<img src="${m.thumbnail || m.url}" alt="${m.original || ''}" style="width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:6px;display:block;" />`).join('') +
              '</div>';
            const sel = editor.getSelected() as any;
            if (sel) { const p = sel.parent?.(); if (p) { const s = p.components(); s.add(galleryHtml, { at: s.indexOf(sel) + 1 }); } else editor.addComponents(galleryHtml); }
            else editor.addComponents(galleryHtml);
            hideInserter();
          });
          imgs.forEach((m: any) => {
            const item = document.createElement('button');
            item.className = 've-guten-inserter-media-item';
            // Thumbnail first, fall back to the original, then to an extension
            // placeholder — a broken file never renders as a broken image.
            const ext = String(m.original || '').split('.').pop()?.toUpperCase().replace(/[^A-Z0-9]/g, '') || 'FILE';
            const placeholder = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='80' height='60'><rect width='100%25' height='100%25' fill='%23e5e7eb' rx='6'/><text x='50%25' y='55%25' font-size='18' fill='%239ca3af' text-anchor='middle'>" + ext + '</text></svg>';
            item.innerHTML = `<img src="${m.thumbnail || m.url}" alt="${m.original || ''}" loading="lazy" data-orig="${m.url}" onerror="this.onerror=null;if(this.src!==this.dataset.orig)this.src=this.dataset.orig;else this.src='${placeholder}'" />`;
            item.addEventListener('click', () => {
              // Toggle multi-select if the gallery bar is visible; otherwise single insert
              if (galleryBtn.style.display !== 'none') {
                if (picked.has(m.id)) { picked.delete(m.id); item.classList.remove('is-picked'); }
                else { picked.add(m.id); item.classList.add('is-picked'); }
                updateGalleryBtn();
                return;
              }
              const html = `<img src="${m.url}" alt="${m.original || ''}" style="width:100%;max-width:800px;height:auto;display:block;" />`;
              const sel = editor.getSelected() as any;
              if (sel) { const p = sel.parent?.(); if (p) { const s = p.components(); s.add(html, { at: s.indexOf(sel) + 1 }); } else editor.addComponents(html); }
              else editor.addComponents(html);
              hideInserter();
            });
            grid.appendChild(item);
          });
        })
        .catch(() => { grid.innerHTML = '<div class="ve-guten-inserter-media-empty">' + __('no media found') + '</div>'; });
    };

    // Load registered shortcodes into the Shortcodes tab (click to insert the tag text)
    const loadShortcodeTab = () => {
      shortcodeLoaded = true;
      const grid = ct.querySelector('#ve-inserter-shortcode-grid') as HTMLElement;
      if (!grid) return;
      const token = localStorage.getItem('mortar_token') || '';
      fetch('/api/editor/shortcodes', { headers: { Authorization: 'Bearer ' + token } })
        .then(r => r.json())
        .then((d: any) => {
          const list = d?.shortcodes || [];
          if (list.length === 0) { grid.innerHTML = '<div class="ve-guten-inserter-media-empty">' + __('no shortcodes') + '</div>'; return; }
          grid.innerHTML = '';
          list.forEach((sc: any) => {
            const btn = document.createElement('button');
            btn.className = 've-guten-inserter-block ve-guten-inserter-shortcode';
            btn.dataset.shortcode = sc.name;
            btn.title = sc.desc || '';
            btn.innerHTML = '<span class="ve-guten-inserter-icon" style="font-family:ui-monospace,Menlo,Consolas,monospace;font-size:11px;font-weight:600;">[]</span>' +
              '<span class="ve-guten-inserter-label">' + sc.name + (sc.desc ? '<br><span style="font-size:11px;color:#757575;font-weight:400;">' + sc.desc + '</span>' : '') + '</span>';
            btn.addEventListener('click', () => insertShortcode(sc.name));
            grid.appendChild(btn);
          });
        })
        .catch(() => { grid.innerHTML = '<div class="ve-guten-inserter-media-empty">' + __('no shortcodes') + '</div>'; });
    };

    // Insert the raw shortcode marker as a highlighted placeholder paragraph, so
    // the saved content stays dynamic and renders server-side on the live site.
    const insertShortcode = (name: string) => {
      const html = '<p style="background:#f0f0f0;border-radius:4px;padding:10px 14px;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:13px;color:#757575;margin:0 0 1em;">[' + name + ']</p>';
      const sel = editor.getSelected() as any;
      if (sel) { const p = sel.parent?.(); if (p) { const s = p.components(); s.add(html, { at: s.indexOf(sel) + 1 }); } else editor.addComponents(html); }
      else editor.addComponents(html);
      hideInserter();
    };

    // --- List View (collapsible tree like WordPress) ---
    const listEl = ct.querySelector('#ve-guten-list') as HTMLElement;
    const renderListView = () => {
      const body = listEl.querySelector('.ve-guten-list-body') as HTMLElement;
      if (!body) return;
      body.innerHTML = '';
      const expanded = new Set<string>();
      try { (JSON.parse(sessionStorage.getItem('mortar_list_expanded') || '[]') as string[]).forEach(id => expanded.add(id)); } catch {}
      const saveState = () => { sessionStorage.setItem('mortar_list_expanded', JSON.stringify([...expanded])); };
      const buildTree = (components: any, depth: number, container: HTMLElement) => {
        components.forEach((comp: any) => {
          const name = comp.getName?.() || comp.get('type') || comp.get('tagName') || 'Element';
          const cid = comp.cid || '';
          const children = comp.components?.() || [];
          const hasChildren = children.length > 0;

          const row = document.createElement('div');
          row.className = 've-guten-list-item';
          row.style.paddingLeft = (12 + depth * 16) + 'px';
          const sel = editor.getSelected();
          if (sel && (sel as any).cid === cid) row.classList.add('is-active');

          const icon = comp.get('type') === 'text' ? '¶' : comp.get('tagName') === 'img' ? '🖼' : comp.get('tagName') === 'section' ? '⊞' : '▣';

          if (hasChildren) {
            const isOpen = expanded.has(cid);
            const arrow = document.createElement('span');
            arrow.className = 've-guten-list-arrow' + (isOpen ? ' is-open' : '');
            arrow.textContent = isOpen ? '▾' : '▸';
            arrow.addEventListener('click', (e) => {
              e.stopPropagation();
              if (expanded.has(cid)) expanded.delete(cid); else expanded.add(cid);
              saveState();
              renderListView();
            });
            row.appendChild(arrow);
          } else {
            const spacer = document.createElement('span');
            spacer.className = 've-guten-list-arrow';
            spacer.style.visibility = 'hidden';
            spacer.textContent = '▸';
            row.appendChild(spacer);
          }

          const iconSpan = document.createElement('span');
          iconSpan.className = 've-guten-list-icon';
          iconSpan.textContent = icon;
          row.appendChild(iconSpan);
          const nameSpan = document.createElement('span');
          nameSpan.className = 've-guten-list-name';
          nameSpan.textContent = name;
          row.appendChild(nameSpan);
          row.addEventListener('click', (e) => { e.stopPropagation(); try { editor.select(comp); } catch {} });
          container.appendChild(row);

          if (hasChildren && expanded.has(cid)) {
            const childContainer = document.createElement('div');
            childContainer.className = 've-guten-list-children';
            container.appendChild(childContainer);
            buildTree(children, depth + 1, childContainer);
          }
        });
      };
      try { buildTree(editor.getComponents(), 0, body); } catch {}
    };
    ct.querySelector('[data-close="list"]')?.addEventListener('click', () => { listEl.style.display = 'none'; ct.classList.remove('ve-list-open'); });
    editor.on('component:add', () => { if (listEl.style.display !== 'none') renderListView(); });
    editor.on('component:remove', () => { if (listEl.style.display !== 'none') renderListView(); });
    editor.on('component:selected', () => { if (listEl.style.display !== 'none') renderListView(); });

    // --- Settings Sidebar (uses GrapesJS's built-in views container) ---
    // Inject the Gutenberg tabs + Post panel into the GrapesJS views container
    editor.on('load', () => {
      setTimeout(() => {
        const viewsEl = ct.querySelector('.gjs-pn-views-container') as HTMLElement;
        if (!viewsEl || viewsEl.querySelector('.ve-guten-injected')) return;
        viewsEl.classList.add('ve-guten-injected');

        // Insert Gutenberg-style sidebar header with tabs
        const sidebarHdr = document.createElement('div');
        sidebarHdr.className = 've-guten-sidebar-hdr';
        sidebarHdr.innerHTML = `
          <div class="ve-guten-tabs">
            <button class="ve-guten-tab is-active" data-gtab="post">${__('post')}</button>
            <button class="ve-guten-tab" data-gtab="block">${__('block')}</button>
          </div>
          <button class="ve-guten-close-sm ve-guten-sidebar-close" title="${__('close settings')}" aria-label="${__('close settings')}">${WPI.close}</button>
        `;
        // Insert the Post panel after the header
        const postPanel = document.createElement('div');
        postPanel.className = 've-guten-tab-panel is-active';
        postPanel.setAttribute('data-gpanel', 'post');
        postPanel.innerHTML = '<div class="ve-guten-post-panel" id="ve-post-panel"></div>';

        // Wrap style manager + traits in a block-panel div
        const smSectors = viewsEl.querySelector('.gjs-sm-sectors') as HTMLElement;
        const trTraits = viewsEl.querySelector('.gjs-trt-traits') as HTMLElement;
        const blockPanel = document.createElement('div');
        blockPanel.className = 've-guten-tab-panel';
        blockPanel.setAttribute('data-gpanel', 'block');
        blockPanel.style.display = 'none';
        if (smSectors) { smSectors.style.display = ''; blockPanel.appendChild(smSectors); }
        if (trTraits) { trTraits.style.display = ''; blockPanel.appendChild(trTraits); }

        // Insert into views container: header first, then panels
        // The views container already has the sectors/traits, we wrapped them in blockPanel
        viewsEl.prepend(sidebarHdr);
        viewsEl.appendChild(postPanel);
        // Make sure blockPanel is the last one (after postPanel)
        if (blockPanel.children.length > 0) viewsEl.appendChild(blockPanel);

        // Tab switching
        sidebarHdr.querySelector('.ve-guten-tabs')?.addEventListener('click', (e) => {
          const btn = (e.target as HTMLElement).closest('.ve-guten-tab') as HTMLElement;
          if (!btn) return;
          sidebarHdr.querySelectorAll('.ve-guten-tab').forEach(b => b.classList.remove('is-active'));
          btn.classList.add('is-active');
          const tab = btn.getAttribute('data-gtab');
          viewsEl.querySelectorAll('.ve-guten-tab-panel[data-gpanel]').forEach((p: Element) => {
            (p as HTMLElement).style.display = p.getAttribute('data-gpanel') === tab ? '' : 'none';
          });
          if (tab === 'post') injectPagePanel();
        });

        // Close button
        sidebarHdr.querySelector('.ve-guten-sidebar-close')?.addEventListener('click', () => {
          viewsEl.style.display = 'none';
        });

        // Auto-switch to Block tab when a component is selected (WordPress behavior),
        // back to Post tab when nothing is selected.
        const setTab = (tab: string) => {
          const btn = viewsEl.querySelector('.ve-guten-tab[data-gtab="' + tab + '"]') as HTMLElement;
          if (btn) btn.click();
        };
        editor.on('component:selected', () => {
          if (viewsEl.style.display === 'none') return;
          setTab('block');
        });
        editor.on('component:deselected', () => {
          if (viewsEl.style.display === 'none') return;
          setTab('post');
        });
      }, 300);
    });

    // --- Inject page settings into the Post tab panel ---
    const injectPagePanel = () => {
      const panel = ct.querySelector('#ve-post-panel') as HTMLElement;
      if (!panel || panel.dataset.injected === '1') return;
      panel.dataset.injected = '1';
      const ps = pageSettingsRef.current;
      panel.innerHTML = `
        ${ps?.showMediaPicker ? `
        <div class="components-panel__body is-opened">
          <h2 class="components-panel__body-title"><button>${__('featured image')}</button></h2>
          <div class="ve-guten-field">
            <div class="ve-guten-featured" id="ve-featured-wrap">
              ${ps?.featuredImage
                ? `<img src="${ps.featuredImage}" alt="Featured" class="ve-guten-featured-img" data-action="featured-remove" />`
                : `<button class="ve-guten-featured-btn" data-action="featured-pick">${__('set featured image')}</button>`}
            </div>
          </div>
        </div>` : ''}
        ${ps?.excerpt !== undefined || ps?.onExcerptChange ? `
        <div class="components-panel__body is-opened">
          <h2 class="components-panel__body-title"><button>${__('excerpt')}</button></h2>
          <div class="ve-guten-field">
            <textarea data-field="excerpt" class="ve-guten-input" rows="3" placeholder="${__('write a short excerpt')}">${ps?.excerpt || ''}</textarea>
          </div>
        </div>` : ''}
        <div class="components-panel__body is-opened">
          <h2 class="components-panel__body-title"><button>${__('status & visibility')}</button></h2>
          <div class="ve-guten-field">
            <select data-field="status" class="ve-guten-select">
              <option value="draft" ${ps?.status === 'draft' ? 'selected' : ''}>${__('draft')}</option>
              <option value="published" ${ps?.status === 'published' && !ps?.password ? 'selected' : ''}>${__('published')}</option>
              <option value="password" ${ps?.status === 'password' || (ps?.status === 'published' && ps?.password) ? 'selected' : ''}>${__('password protected')}</option>
              <option value="private" ${ps?.status === 'private' ? 'selected' : ''}>${__('private')}</option>
            </select>
          </div>
          ${ps?.onPasswordChange ? `
          <div class="ve-guten-field" style="margin-top:8px;">
            <input type="password" data-field="password" value="${ps?.password || ''}" autocomplete="new-password" class="ve-guten-input" placeholder="${__('password protect this page')}" />
            <span class="ve-guten-field-hint">${__('visitors need this password to view the page; clear it to remove protection')}</span>
          </div>` : ''}
        </div>
        <div class="components-panel__body is-opened">
          <h2 class="components-panel__body-title"><button>${__('permalink')}</button></h2>
          <div class="ve-guten-field">
            <span class="ve-guten-slug">/page/<strong id="ve-slug-val">${ps?.slug || '—'}</strong></span>
            ${ps?.slug ? '<a class="ve-guten-link" id="ve-preview-link" href="#">' + __('view page') + '</a>' : ''}
          </div>
        </div>
        ${ps?.parentPages?.length ? `
        <div class="components-panel__body is-opened">
          <h2 class="components-panel__body-title"><button>${__('parent page')}</button></h2>
          <div class="ve-guten-field">
            <select data-field="parentId" class="ve-guten-select">
              <option value="">${__('no parent')}</option>
              ${ps.parentPages.map((p: any) => `<option value="${p.id}" ${ps.parentId === p.id ? 'selected' : ''}>${p.title}</option>`).join('')}
            </select>
          </div>
        </div>` : ''}
        ${ps?.onAllowCommentsChange ? `
        <div class="components-panel__body is-opened">
          <h2 class="components-panel__body-title"><button>${__('discussion')}</button></h2>
          <div class="ve-guten-field">
            <label class="ve-guten-toggle-row">
              <input type="checkbox" data-field="allowComments" ${ps?.allowComments ? 'checked' : ''} />
              <span>${__('allow comments')}</span>
            </label>
          </div>
        </div>` : ''}
        <div class="components-panel__body is-opened">
          <h2 class="components-panel__body-title"><button>${__('menu order')}</button></h2>
          <div class="ve-guten-field">
            <input type="number" data-field="menuOrder" value="${ps?.menuOrder ?? 0}" class="ve-guten-input" min="0" />
          </div>
        </div>
      `;
      panel.addEventListener('change', (e) => {
        const el = e.target as HTMLElement;
        const ps = pageSettingsRef.current;
        if (el.dataset.field === 'status') ps?.onStatusChange?.((el as HTMLSelectElement).value);
        else if (el.dataset.field === 'parentId') ps?.onParentIdChange?.((el as HTMLSelectElement).value);
        else if (el.dataset.field === 'menuOrder') ps?.onMenuOrderChange?.(parseInt((el as HTMLInputElement).value) || 0);
        else if (el.dataset.field === 'excerpt') ps?.onExcerptChange?.((el as HTMLTextAreaElement).value);
        else if (el.dataset.field === 'allowComments') ps?.onAllowCommentsChange?.((el as HTMLInputElement).checked);
        else if (el.dataset.field === 'password') ps?.onPasswordChange?.((el as HTMLInputElement).value);
      });
      panel.addEventListener('input', (e) => {
        const el = e.target as HTMLElement;
        if (el.dataset.field === 'excerpt') pageSettingsRef.current?.onExcerptChange?.((el as HTMLTextAreaElement).value);
      });
      panel.querySelector('#ve-preview-link')?.addEventListener('click', (e) => { e.preventDefault(); pageSettingsRef.current?.showPreview?.(); });
      // Featured image actions
      const featuredWrap = panel.querySelector('#ve-featured-wrap') as HTMLElement;
      featuredWrap?.addEventListener('click', (e) => {
        const el = (e.target as HTMLElement).closest('[data-action]') as HTMLElement;
        if (!el) return;
        if (el.dataset.action === 'featured-pick') {
          pageSettingsRef.current?.showMediaPicker?.();
        } else if (el.dataset.action === 'featured-remove') {
          pageSettingsRef.current?.onFeaturedImageChange?.('');
        }
      });
    };

    // --- Floating block toolbar ---
    const blockBar = document.createElement('div');
    blockBar.className = 've-block-bar';
    blockBar.innerHTML =
      '<span class="ve-block-bar-name">Block</span>' +
      '<button data-act="up" title="' + __('move up') + '">↑</button>' +
      '<button data-act="down" title="' + __('move down') + '">↓</button>' +
      '<button data-act="transform" title="' + __('transform') + '">↔</button>' +
      '<button data-act="align-left" title="' + __('align left') + '">⇤</button>' +
      '<button data-act="align-center" title="' + __('align center') + '">⇹</button>' +
      '<button data-act="align-right" title="' + __('align right') + '">⇥</button>' +
      '<button data-act="more" title="' + __('more options') + '">' + WPI.moreVert + '</button>';

    // Block-level more menu (duplicate / copy HTML / delete)
    const blockMoreMenu = document.createElement('div');
    blockMoreMenu.className = 've-block-transform-menu';
    blockMoreMenu.style.display = 'none';
    blockMoreMenu.innerHTML =
      '<div class="ve-block-transform-title">' + __('more options') + '</div>' +
      '<button data-bmore="copy">' + __('duplicate') + '</button>' +
      '<button data-bmore="html">' + __('copy html') + '</button>' +
      '<button data-bmore="del">' + __('delete') + '</button>';
    ct.appendChild(blockMoreMenu);
    blockMoreMenu.addEventListener('click', (e) => {
      const btn = (e.target as HTMLElement).closest('button');
      if (!btn?.dataset.bmore) return;
      const comp = editor.getSelected() as any;
      if (!comp) return;
      if (btn.dataset.bmore === 'copy') duplicateComp(comp);
      else if (btn.dataset.bmore === 'html') { try { navigator.clipboard?.writeText(comp.toHTML?.() || ''); } catch {} }
      else if (btn.dataset.bmore === 'del') comp.remove();
      blockMoreMenu.style.display = 'none';
      notifyChange();
    });
    document.addEventListener('click', (e) => {
      if (blockMoreMenu.style.display !== 'none' && !blockMoreMenu.contains(e.target as Node) && !(e.target as HTMLElement).closest('[data-act="more"]')) {
        blockMoreMenu.style.display = 'none';
      }
    });

    // Transform menu (converts selected block to another type)
    const transformMenu = document.createElement('div');
    transformMenu.className = 've-block-transform-menu';
    transformMenu.style.display = 'none';
    transformMenu.innerHTML =
      '<div class="ve-block-transform-title">' + __('transform to') + '</div>' +
      '<button data-transform="p"><span>¶</span>' + __('paragraph') + '</button>' +
      '<button data-transform="h1"><span>H1</span>' + __('heading 1') + '</button>' +
      '<button data-transform="h2"><span>H2</span>' + __('heading 2') + '</button>' +
      '<button data-transform="h3"><span>H3</span>' + __('heading 3') + '</button>' +
      '<button data-transform="blockquote"><span>❝</span>' + __('quote') + '</button>' +
      '<button data-transform="ul"><span>≡</span>' + __('list') + '</button>';
    ct.appendChild(transformMenu);

    const doTransform = (tag: string) => {
      const comp = editor.getSelected() as any;
      if (!comp) return;
      const html = comp.toHTML?.() || '';
      // Extract inner text if it's a simple text block
      const el = document.createElement('div');
      el.innerHTML = html;
      let inner = el.innerHTML;
      // If wrapped in a single element, use its inner content
      const first = el.firstElementChild;
      if (first && el.children.length === 1) inner = first.innerHTML;
      let newHtml = '';
      if (tag === 'p') newHtml = '<p>' + inner + '</p>';
      else if (tag === 'h1') newHtml = '<h1>' + inner + '</h1>';
      else if (tag === 'h2') newHtml = '<h2>' + inner + '</h2>';
      else if (tag === 'h3') newHtml = '<h3>' + inner + '</h3>';
      else if (tag === 'blockquote') newHtml = '<blockquote style="margin:0;padding:16px 24px;border-left:4px solid #3b82f6;background:#f8fafc;border-radius:0 8px 8px 0;font-style:italic;color:#475569;">' + inner + '</blockquote>';
      else if (tag === 'ul') newHtml = '<ul style="margin:0;padding-left:24px;line-height:1.8;color:#374151;"><li>' + inner + '</li></ul>';
      try {
        const newComp = comp.replaceWith(newHtml);
        if (newComp) editor.select(newComp);
        notifyChange();
      } catch {}
      transformMenu.style.display = 'none';
    };
    ct.appendChild(blockBar);
    const moveComp = (comp: any, dir: number) => { const p = comp.parent(); if (!p) return; const s = p.components(); const i = s.indexOf(comp); const t = i + dir; if (i > -1 && t >= 0 && t < s.length) { s.remove(comp); s.add(comp, { at: t }); editor.select(comp); } };
    const duplicateComp = (comp: any) => { const p = comp.parent(); if (!p) return; const s = p.components(); const i = s.indexOf(comp); if (i > -1) { const c = comp.clone(); s.add(c, { at: i + 1 }); editor.select(c); } };
    const positionBlockBar = () => {
      const comp = editor.getSelected() as any;
      if (!comp) { blockBar.style.display = 'none'; return; }
      const el = comp.getEl?.() as HTMLElement; if (!el) { blockBar.style.display = 'none'; return; }
      const iframeEl = editor.Canvas.getElement() as HTMLElement;
      const iframeRect = iframeEl.getBoundingClientRect();
      const rect = el.getBoundingClientRect();
      const ctRect = ct.getBoundingClientRect();
      const canvasLeft = iframeRect.left - ctRect.left;
      const canvasTop = iframeRect.top - ctRect.top;
      const canvasBottom = iframeRect.bottom - ctRect.top;
      const barH = blockBar.offsetHeight || 36;
      const barW = blockBar.offsetWidth || 160;

      blockBar.style.display = 'flex';
      blockBar.style.transform = 'none';
      // Clamp horizontal position inside the canvas, leaving room for the
      // right scrollbar when zoomed in
      const left = Math.max(canvasLeft + 4, Math.min(canvasLeft + rect.left, canvasLeft + iframeRect.width - barW - 16));
      blockBar.style.left = left + 'px';
      // Flip below the block when there isn't enough room above (e.g. at the
      // top of the canvas, where the header would otherwise overlap)
      const rectTop = canvasTop + rect.top;
      const rectBottom = canvasTop + rect.bottom;
      if (rectTop - barH - 8 >= canvasTop + 4) {
        blockBar.style.top = (rectTop - barH - 4) + 'px';
      } else {
        // Keep clear of the bottom scrollbar (14px)
        blockBar.style.top = Math.min(rectBottom + 8, canvasBottom - barH - 14) + 'px';
      }
      (blockBar.querySelector('.ve-block-bar-name') as HTMLElement).textContent = comp.getName?.() || comp.get('type') || 'Block';
    };

    // --- Snackbar (bottom-right toast, like WordPress) ---
    const snackbarEl = ct.querySelector('#ve-snackbar') as HTMLElement;
    let snackbarTimer: ReturnType<typeof setTimeout>;
    const showSnackbar = (msg: string) => {
      snackbarEl.textContent = msg;
      snackbarEl.style.display = 'flex';
      snackbarEl.classList.remove('ve-snackbar-out');
      clearTimeout(snackbarTimer);
      snackbarTimer = setTimeout(() => {
        snackbarEl.classList.add('ve-snackbar-out');
        setTimeout(() => { snackbarEl.style.display = 'none'; }, 300);
      }, 2500);
    };
    snackbarFnRef.current = showSnackbar;

    blockBar.addEventListener('click', (e) => {
      const btn = (e.target as HTMLElement).closest('button');
      if (!btn?.dataset.act) return;
      const comp = editor.getSelected() as any;
      if (!comp) return;
      const act = btn.dataset.act;
      if (act === 'up') moveComp(comp, -1);
      else if (act === 'down') moveComp(comp, 1);
      else if (act === 'copy') duplicateComp(comp);
      else if (act === 'del') { transformMenu.style.display = 'none'; comp.remove(); }
      else if (act === 'transform' || act === 'more') {
        // Position the appropriate menu near the block bar
        const menu = act === 'transform' ? transformMenu : blockMoreMenu;
        const rect = blockBar.getBoundingClientRect();
        const ctRect = ct.getBoundingClientRect();
        (transformMenu.style as any).display = act === 'transform' ? 'block' : 'none';
        (blockMoreMenu.style as any).display = act === 'more' ? 'block' : 'none';
        menu.style.top = (rect.bottom - ctRect.top + 4) + 'px';
        menu.style.left = Math.max(8, rect.left - ctRect.left) + 'px';
        return;
      }
      else if (act === 'align-left') comp.addStyle({ 'text-align': 'left' });
      else if (act === 'align-center') comp.addStyle({ 'text-align': 'center' });
      else if (act === 'align-right') comp.addStyle({ 'text-align': 'right' });
      transformMenu.style.display = 'none';
      blockMoreMenu.style.display = 'none';
      notifyChange();
    });
    // Transform menu actions
    transformMenu.addEventListener('click', (e) => {
      const btn = (e.target as HTMLElement).closest('button');
      if (!btn?.dataset.transform) return;
      doTransform(btn.dataset.transform);
    });
    // Close transform menu when clicking elsewhere
    document.addEventListener('click', (e) => {
      if (transformMenu.style.display !== 'none' && !transformMenu.contains(e.target as Node) && !(e.target as HTMLElement).closest('[data-act="transform"]')) {
        transformMenu.style.display = 'none';
      }
    });
    editor.on('component:selected', positionBlockBar);
    editor.on('component:update', positionBlockBar);
    editor.on('component:styleUpdate', positionBlockBar);
    editor.on('component:deselected', () => { blockBar.style.display = 'none'; transformMenu.style.display = 'none'; blockMoreMenu.style.display = 'none'; });
    const canvasWrapper = ct.querySelector('.gjs-cv-canvas');
    canvasWrapper?.addEventListener('scroll', positionBlockBar);
    window.addEventListener('scroll', positionBlockBar, true);

    // --- Bottom breadcrumb ---
    const footerEl = ct.querySelector('#ve-guten-footer') as HTMLElement;
    const footerBreadcrumb = ct.querySelector('.ve-guten-footer-breadcrumb') as HTMLElement;
    const headerBreadcrumb = ct.querySelector('#ve-header-breadcrumb') as HTMLElement;
    const updateBreadcrumbs = () => {
      const comp = editor.getSelected() as any;
      if (!comp) { footerEl.style.display = 'none'; if (headerBreadcrumb) headerBreadcrumb.textContent = ''; return; }
      const path: { comp: any; name: string }[] = [];
      let cur = comp;
      while (cur) { path.unshift({ comp: cur, name: cur.getName?.() || cur.get('type') || cur.get('tagName') || 'Element' }); cur = cur.parent?.(); }
      const html = path.map((p, i) => `<span class="ve-guten-breadcrumb-item${i === path.length - 1 ? ' is-current' : ''}" data-cid="${p.comp.cid}">${p.name}</span>`).join('<span class="ve-guten-breadcrumb-sep">›</span>');
      if (footerBreadcrumb) { footerBreadcrumb.innerHTML = html; footerEl.style.display = ''; }
      if (headerBreadcrumb) headerBreadcrumb.innerHTML = html;
    };
    footerEl.addEventListener('click', (e) => {
      const item = (e.target as HTMLElement).closest('.ve-guten-breadcrumb-item') as HTMLElement;
      if (!item?.dataset.cid) return;
      const findComp = (components: any): any => { for (const c of components) { if (c.cid === item.dataset.cid) return c; const f = findComp(c.components?.() || []); if (f) return f; } return null; };
      try { const t = findComp(editor.getComponents()); if (t) editor.select(t); } catch {}
    });
    headerBreadcrumb?.addEventListener('click', (e) => {
      const item = (e.target as HTMLElement).closest('.ve-guten-breadcrumb-item') as HTMLElement;
      if (!item?.dataset.cid) return;
      const findComp = (components: any): any => { for (const c of components) { if (c.cid === item.dataset.cid) return c; const f = findComp(c.components?.() || []); if (f) return f; } return null; };
      try { const t = findComp(editor.getComponents()); if (t) editor.select(t); } catch {}
    });
    editor.on('component:selected', updateBreadcrumbs);
    editor.on('component:deselected', () => { footerEl.style.display = 'none'; if (headerBreadcrumb) headerBreadcrumb.textContent = ''; });
    editor.on('component:update', updateBreadcrumbs);

    // --- Undo/Redo button state (disabled when nothing to undo/redo) ---
    const updateUndoRedo = () => {
      const undoBtn = ct.querySelector('#ve-undo-btn') as HTMLElement;
      const redoBtn = ct.querySelector('#ve-redo-btn') as HTMLElement;
      try {
        const um = (editor as any).UndoManager;
        undoBtn?.classList.toggle('is-disabled', !(um?.getStack?.()?.length > 0));
        redoBtn?.classList.toggle('is-disabled', !(um?.getNext?.()?.length > 0));
      } catch {}
    };
    editor.on('component:add', updateUndoRedo);
    editor.on('component:update', updateUndoRedo);
    editor.on('component:remove', updateUndoRedo);
    editor.on('undo:undo', updateUndoRedo);
    editor.on('undo:redo', updateUndoRedo);
    setTimeout(updateUndoRedo, 500);

    // --- Header action buttons (event delegation on header) ---
    const headerEl = ct.querySelector('.ve-guten-header') as HTMLElement;
    headerEl?.addEventListener('click', (e) => {
      const btn = (e.target as HTMLElement).closest('button') as HTMLElement;
      if (!btn) return;
      const id = btn.id;
      if (id === 've-back-btn') onBackRef.current?.();
      else if (id === 've-inserter-btn') toggleInserter();
      else if (id === 've-undo-btn') { try { editor.runCommand('core:undo'); } catch {} updateUndoRedo(); }
      else if (id === 've-redo-btn') { try { editor.runCommand('core:redo'); } catch {} updateUndoRedo(); }
      else if (id === 've-list-btn') {
        if (listEl.style.display === 'none') { renderListView(); listEl.style.display = ''; ct.classList.add('ve-list-open'); }
        else { listEl.style.display = 'none'; ct.classList.remove('ve-list-open'); }
      }
      else if (id === 've-preview-btn') {
        const ps = pageSettingsRef.current;
        if (!ps?.slug) { showSnackbar(__('save first to preview')); }
        else ps.showPreview?.();
      }
      else if (id === 've-save-btn') {
        showSnackbar(__('saving'));
        onSaveRef.current?.();
      }
      else if (id === 've-publish-btn') {
        showSnackbar(__('publishing'));
        onPublishRef.current?.();
      }
      else if (id === 've-settings-btn') {
        const viewsEl = ct.querySelector('.gjs-pn-views-container') as HTMLElement;
        if (!viewsEl) return;
        if (viewsEl.style.display === 'none') { viewsEl.style.display = ''; injectPagePanel(); }
        else viewsEl.style.display = 'none';
      }
      else if (id === 've-more-btn') {
        const menu = ct.querySelector('#ve-more-menu') as HTMLElement;
        if (menu) menu.style.display = menu.style.display === 'none' ? '' : 'none';
      }
      // Device switch
      const device = btn.dataset.device;
      if (device) {
        ct.querySelectorAll('.ve-guten-device-btn').forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        try {
          const d = device === 'desktop' ? 'desktop' : device === 'tablet' ? 'tablet' : 'mobilePortrait';
          editor.setDevice(d);
        } catch {}
        // GrapesJS updates the device width asynchronously — re-apply our
        // zoom layout several times so the iframe width (device width × zoom)
        // takes effect and the content reflows for the new device.
        setTimeout(applyZoom, 60);
        setTimeout(applyZoom, 250);
        setTimeout(applyZoom, 600);
      }
    });

    // --- More menu actions ---
    const moreMenu = ct.querySelector('#ve-more-menu') as HTMLElement;
    moreMenu?.addEventListener('click', (e) => {
      const btn = (e.target as HTMLElement).closest('button') as HTMLElement;
      if (!btn?.dataset.more) return;
      const act = btn.dataset.more;
      try {
        if (act === 'code-view') { try { editor.runCommand('core:open-code'); } catch { try { editor.runCommand('open-code'); } catch {} } }
        else if (act === 'style-book') { toggleStyleBook(); }
        else if (act === 'fullscreen') {
          if (document.fullscreenElement) { try { document.exitFullscreen(); } catch {} }
          else { try { ct.requestFullscreen?.(); } catch {} }
        }
        else if (act === 'refresh') editor.refresh();
      } catch {}
      moreMenu.style.display = 'none';
    });

    // --- Style book (visual style preview of all blocks) ---
    const styleBook = ct.querySelector('#ve-style-book') as HTMLElement;
    const styleBookBody = styleBook?.querySelector('.ve-style-book-body') as HTMLElement;
    let sbWidth = 'desktop';
    const renderStyleBook = () => {
      if (!styleBookBody) return;
      const w = sbWidth === 'mobile' ? 320 : sbWidth === 'tablet' ? 768 : '100%';
      styleBookBody.innerHTML = Object.entries(ALL_BLOCKS.reduce((acc: Record<string, any[]>, b) => { (acc[b.category] ||= []).push(b); return acc; }, {})).map(([cat, blocks]) => `
        <div class="ve-sb-cat">
          <div class="ve-sb-cat-title">${__('block category ' + cat)}</div>
          ${blocks.map(b => `
            <div class="ve-sb-item">
              <div class="ve-sb-label">${__('block ' + b.id)}</div>
              <div class="ve-sb-frame" style="${w !== '100%' ? 'width:' + w + 'px' : ''}">${b.content}</div>
            </div>`).join('')}
        </div>`).join('');
    };
    const toggleStyleBook = () => {
      if (!styleBook) return;
      const open = styleBook.style.display === 'none';
      styleBook.style.display = open ? 'flex' : 'none';
      if (open) renderStyleBook();
    };
    styleBook?.querySelector('.ve-style-book-close')?.addEventListener('click', () => { styleBook.style.display = 'none'; });
    styleBook?.querySelectorAll('[data-sbw]').forEach((btn) => {
      btn.addEventListener('click', () => {
        styleBook.querySelectorAll('[data-sbw]').forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        sbWidth = btn.getAttribute('data-sbw') || 'desktop';
        renderStyleBook();
      });
    });
    // Close more menu on outside click
    document.addEventListener('click', (e) => {
      if (moreMenu && moreMenu.style.display !== 'none' && !moreMenu.contains(e.target as Node) && !(e.target as HTMLElement).closest('#ve-more-btn')) {
        moreMenu.style.display = 'none';
      }
    });

    // --- Cleanup ---
    return () => {
      clearTimeout(changeTimer);
      zoomBar.remove();
      blockBar.remove();
      document.removeEventListener('keydown', escHandler);
      canvasWrapper?.removeEventListener('scroll', positionBlockBar);
      window.removeEventListener('scroll', positionBlockBar, true);
      ct.removeEventListener('wheel', wheelHandler);
      canvasDoc?.removeEventListener('keydown', canvasKeyHandler);
      editor.destroy();
      editorRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Save snackbar driven by the parent's save state ---
  useEffect(() => {
    if (saveState === 'saving') snackbarFnRef.current?.(t('saving', getLang()));
    else if (saveState === 'saved') snackbarFnRef.current?.(t('saved', getLang()));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saveState]);

  // --- Sync external content changes ---
  useEffect(() => {
    const ed = editorRef.current; if (!ed) return;
    if (content !== lastContentRef.current) {
      lastContentRef.current = content;
      try { ed.setComponents(content || ''); } catch {}
      try { ed.setStyle(css || ''); } catch {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content, css]);

  // --- Sync pageSettings to Post tab panel ---
  useEffect(() => {
    if (!containerRef.current || !pageSettings) return;
    const panel = containerRef.current.querySelector('#ve-post-panel') as HTMLElement;
    if (!panel || panel.dataset.injected !== '1') return;
    const s = panel.querySelector('[data-field="status"]') as HTMLSelectElement;
    const p = panel.querySelector('[data-field="parentId"]') as HTMLSelectElement;
    const m = panel.querySelector('[data-field="menuOrder"]') as HTMLInputElement;
    const slugEl = panel.querySelector('#ve-slug-val') as HTMLElement;
    const previewLink = panel.querySelector('#ve-preview-link') as HTMLElement;
    if (s && pageSettings.status !== undefined && s.value !== pageSettings.status) s.value = pageSettings.status;
    if (p && pageSettings.parentId !== undefined && p.value !== pageSettings.parentId) p.value = pageSettings.parentId;
    if (m && pageSettings.menuOrder !== undefined && parseInt(m.value) !== pageSettings.menuOrder) m.value = String(pageSettings.menuOrder);
    if (slugEl) slugEl.textContent = pageSettings.slug || '—';
    if (previewLink) previewLink.style.display = pageSettings.slug ? '' : 'none';
    // Password field sync (e.g. changed from text-mode editor)
    const pwInput = panel.querySelector('[data-field="password"]') as HTMLInputElement;
    if (pwInput && pageSettings.password !== undefined && pwInput.value !== pageSettings.password) pwInput.value = pageSettings.password;
    // Featured image sync (e.g. after picking from media library)
    const featuredWrap = panel.querySelector('#ve-featured-wrap') as HTMLElement;
    if (featuredWrap && pageSettings.featuredImage !== undefined) {
      const img = featuredWrap.querySelector('img') as HTMLElement;
      const btn = featuredWrap.querySelector('.ve-guten-featured-btn') as HTMLElement;
      if (pageSettings.featuredImage && !img) {
        featuredWrap.innerHTML = `<img src="${pageSettings.featuredImage}" alt="Featured" class="ve-guten-featured-img" data-action="featured-remove" />`;
      } else if (!pageSettings.featuredImage && img) {
        featuredWrap.innerHTML = `<button class="ve-guten-featured-btn" data-action="featured-pick">${t('set featured image', getLang())}</button>`;
      } else if (img && pageSettings.featuredImage) {
        img.setAttribute('src', pageSettings.featuredImage);
      }
      void btn;
    }
  }, [pageSettings]);

  return React.createElement('div', {
    ref: containerRef,
    className: 'visual-editor-container',
    style: { height: height || 'calc(100vh - 200px)', minHeight: '500px' },
  });
}
