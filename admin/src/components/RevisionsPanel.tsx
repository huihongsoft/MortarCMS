import React, { useEffect, useState } from 'react';
import { diffLines } from 'diff';
import { RotateCcw, GitCompare, X } from 'lucide-react';
import api from '../lib/api';
import { t, getLang } from '../lib/i18n';

function stripHtml(html: string): string {
  try {
    const doc = new DOMParser().parseFromString(html || '', 'text/html');
    return doc.body.textContent || '';
  } catch { return html || ''; }
}

interface RevisionsPanelProps {
  postId: string;
  onRestore: (post: any) => void;
}

export default function RevisionsPanel({ postId, onRestore }: RevisionsPanelProps) {
  const [revisions, setRevisions] = useState<any[]>([]);
  const [compare, setCompare] = useState<{ a: any; b: any } | null>(null);

  useEffect(() => {
    if (!postId) return;
    api.get('/posts/' + postId + '/revisions').then(r => setRevisions(r.data || [])).catch(() => {});
  }, [postId]);

  async function restore(revId: string) {
    if (!confirm(t('restore this revision? the current state will be kept as a revision.', getLang()))) return;
    const r = await api.put('/posts/' + postId + '/revisions/' + revId + '/restore');
    onRestore(r.data.post);
    api.get('/posts/' + postId + '/revisions').then(x => setRevisions(x.data || [])).catch(() => {});
  }

  function renderDiff(aHtml: string, bHtml: string) {
    const parts = diffLines(stripHtml(aHtml), stripHtml(bHtml));
    return React.createElement('div', { className: 'grid grid-cols-2 gap-0 text-xs font-mono' },
      React.createElement('div', { className: 'p-2 min-w-0 overflow-hidden' },
        parts.map((p, i) =>
          p.removed
            ? React.createElement('div', { key: i, className: 'bg-red-100 text-red-800 p-0.5 whitespace-pre-wrap break-words' }, p.value)
            : React.createElement('div', { key: i, className: 'p-0.5 whitespace-pre-wrap break-words text-gray-700' }, p.value)
        )
      ),
      React.createElement('div', { className: 'p-2 border-l border-gray-200 min-w-0 overflow-hidden' },
        parts.map((p, i) =>
          p.added
            ? React.createElement('div', { key: i, className: 'bg-green-100 text-green-800 p-0.5 whitespace-pre-wrap break-words' }, p.value)
            : React.createElement('div', { key: i, className: 'p-0.5 whitespace-pre-wrap break-words text-gray-700' }, p.value)
        )
      ),
    );
  }

  return React.createElement('div', { className: 'card p-4' },
    React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 mb-3' }, t('revisions', getLang())),
    revisions.length === 0
      ? React.createElement('p', { className: 'text-xs text-gray-500' }, t('no revisions yet', getLang()))
      : React.createElement('ul', { className: 'space-y-2 max-h-64 overflow-auto' },
          revisions.map((r: any, i: number) =>
            React.createElement('li', { key: r.id, className: 'flex items-center justify-between gap-2' },
              React.createElement('div', { className: 'min-w-0' },
                React.createElement('p', { className: 'text-xs text-gray-800 truncate' }, i === 0 ? t('current', getLang()) : (r.title || t('(no title)', getLang()))),
                React.createElement('p', { className: 'text-[10px] text-gray-400' }, new Date(r.createdAt).toLocaleString()),
              ),
              React.createElement('div', { className: 'flex items-center gap-1 shrink-0' },
                i !== 0 && React.createElement('button', { onClick: () => restore(r.id), className: 'p-1 text-gray-400 hover:text-green-600', title: t('restore', getLang()) }, React.createElement(RotateCcw, { size: 14 })),
                i !== 0 && React.createElement('button', { onClick: () => setCompare(compare && compare.a.id === r.id ? null : { a: r, b: revisions[0] }), className: 'p-1 text-gray-400 hover:text-primary-600', title: t('compare with current', getLang()) }, React.createElement(GitCompare, { size: 14 })),
              ),
            )
          )
        ),
    compare && React.createElement('div', { className: 'mt-3 border-t border-gray-200 pt-3' },
      React.createElement('div', { className: 'flex items-center justify-between mb-2' },
        React.createElement('p', { className: 'text-[10px] text-gray-400' }, t('old', getLang()) + ': ' + new Date(compare.a.createdAt).toLocaleString() + '  ' + t('vs', getLang()) + '  ' + t('current', getLang()) + ': ' + new Date(compare.b.createdAt).toLocaleString()),
        React.createElement('button', { onClick: () => setCompare(null), className: 'p-0.5 text-gray-400 hover:text-gray-600', title: t('close', getLang()) }, React.createElement(X, { size: 12 })),
      ),
      renderDiff(compare.a.content, compare.b.content),
    ),
  );
}
