import React, { useEffect, useState } from 'react';
import { RefreshCw, Trash2, ExternalLink, Link2, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { useToast } from '../lib/toast';
import { t, getLang } from '../lib/i18n';

interface BrokenLinkRow { id: string; postId: string | null; postTitle: string; url: string; anchor: string; status: string; statusCode: number | null; checkedAt: string }

const STATUS_META: Record<string, { cls: string; icon: any }> = {
  ok: { cls: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300', icon: CheckCircle2 },
  broken: { cls: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300', icon: XCircle },
  error: { cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300', icon: AlertTriangle },
};

export default function BrokenLinks() {
  const { toast } = useToast();
  const [links, setLinks] = useState<BrokenLinkRow[]>([]);
  const [total, setTotal] = useState(0);
  const [needsAttention, setNeedsAttention] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);

  const load = () => {
    setLoading(true);
    api.get(`/admin/broken-links?page=${page}&status=${statusFilter}`).then(r => {
      setLinks(r.data.links || []);
      setTotal(r.data.total || 0);
      setNeedsAttention(r.data.needsAttention || 0);
      setLoading(false);
    }).catch(() => setLoading(false));
  };
  useEffect(load, [page, statusFilter]);

  const scan = async () => {
    setScanning(true);
    try {
      const r = await api.post('/system/tasks/scan_broken_links/run');
      toast((r.data?.ok ? t('scan complete', getLang()) : t('scan failed', getLang())) + ' (' + (r.data?.ms || 0) + 'ms)');
      load();
    } catch (e: any) { toast(e?.response?.data?.error || String(e), 'error'); }
    finally { setScanning(false); }
  };

  const remove = async (l: BrokenLinkRow) => {
    try {
      await api.delete('/admin/broken-links/' + l.id);
      toast(t('link entry removed', getLang()));
      load();
    } catch (e: any) { toast(e?.response?.data?.error || String(e), 'error'); }
  };

  const pages = Math.max(1, Math.ceil(total / 15));

  return React.createElement('div', null,
    // Header
    React.createElement('div', { className: 'flex items-center justify-between mb-2' },
      React.createElement('h2', { className: 'text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2' },
        React.createElement(Link2, { size: 22, className: 'text-primary-600' }), t('broken links', getLang())),
      React.createElement('button', { onClick: scan, disabled: scanning, className: 'btn-primary text-sm' },
        React.createElement(RefreshCw, { size: 14, className: scanning ? 'animate-spin' : '' }), scanning ? t('scanning', getLang()) + '…' : t('scan now', getLang())),
    ),
    React.createElement('p', { className: 'text-sm text-gray-500 dark:text-gray-400 mb-4' }, t('broken links description', getLang())),

    // Filters
    React.createElement('div', { className: 'flex items-center gap-2 mb-4' },
      ['', 'broken', 'error', 'ok'].map(s =>
        React.createElement('button', {
          key: s || 'all',
          onClick: () => { setStatusFilter(s); setPage(1); },
          className: 'px-3 py-1.5 text-sm rounded-lg whitespace-nowrap ' + (statusFilter === s ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'),
        }, t(s || 'all', getLang()))),
      React.createElement('span', { className: 'text-xs text-gray-400 ml-auto' }, needsAttention + ' ' + t('needs attention', getLang())),
    ),

    loading
      ? React.createElement('p', { className: 'text-sm text-gray-400' }, t('loading', getLang()) + '…')
      : links.length === 0
        ? React.createElement('div', { className: 'card p-10 text-center' },
            React.createElement(CheckCircle2, { size: 32, className: 'mx-auto text-green-400 mb-2' }),
            React.createElement('p', { className: 'text-sm text-gray-400' }, t('no links checked yet', getLang())))
        : React.createElement('div', { className: 'card overflow-x-auto' },
            React.createElement('table', { className: 'w-full min-w-[640px]' },
              React.createElement('thead', null, React.createElement('tr', { className: 'border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800' },
                React.createElement('th', { className: 'text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase' }, t('post', getLang())),
                React.createElement('th', { className: 'text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase' }, t('link', getLang())),
                React.createElement('th', { className: 'text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase' }, t('status', getLang())),
                React.createElement('th', { className: 'text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase' }, t('checked at', getLang())),
                React.createElement('th', { className: 'text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase' }, t('actions', getLang())),
              )),
              React.createElement('tbody', null, links.map(l => {
                const meta = STATUS_META[l.status] || STATUS_META.error;
                return React.createElement('tr', { key: l.id, className: 'border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50' },
                  React.createElement('td', { className: 'px-5 py-3' },
                    l.postId
                      ? React.createElement(Link, { to: '/posts/' + l.postId + '/edit', className: 'text-sm text-gray-700 dark:text-gray-200 hover:text-primary-600 truncate block max-w-40' }, l.postTitle)
                      : React.createElement('span', { className: 'text-sm text-gray-400' }, l.postTitle)),
                  React.createElement('td', { className: 'px-5 py-3' },
                    React.createElement('div', { className: 'max-w-72' },
                      l.anchor && React.createElement('p', { className: 'text-xs text-gray-500 truncate' }, l.anchor),
                      React.createElement('a', { href: l.url, target: '_blank', rel: 'noopener noreferrer', className: 'text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1 break-all' }, React.createElement(ExternalLink, { size: 11 }), l.url))),
                  React.createElement('td', { className: 'px-5 py-3' },
                    React.createElement('span', { className: 'text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 w-fit ' + meta.cls },
                      React.createElement(meta.icon, { size: 10 }), t(l.status, getLang()) + (l.statusCode ? ' · ' + l.statusCode : ''))),
                  React.createElement('td', { className: 'px-5 py-3 text-xs text-gray-500' }, new Date(l.checkedAt).toLocaleDateString()),
                  React.createElement('td', { className: 'px-5 py-3 text-right' },
                    React.createElement('button', { onClick: () => remove(l), className: 'p-1.5 text-gray-400 hover:text-red-600', title: t('delete', getLang()) }, React.createElement(Trash2, { size: 15 }))),
                );
              }))
            ),
            React.createElement('div', { className: 'flex items-center justify-between px-5 py-3 border-t border-gray-200 dark:border-gray-700' },
              React.createElement('span', { className: 'text-sm text-gray-500' }, total + ' ' + t('link entries', getLang())),
              React.createElement('div', { className: 'flex gap-2' },
                React.createElement('button', { onClick: () => setPage(p => Math.max(1, p - 1)), disabled: page === 1, className: 'btn-secondary text-xs' }, t('previous', getLang())),
                React.createElement('button', { onClick: () => setPage(p => p + 1), disabled: page * 15 >= total, className: 'btn-secondary text-xs' }, t('next', getLang())))),
          ),
  );
}
