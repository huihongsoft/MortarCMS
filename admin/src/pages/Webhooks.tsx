import React, { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Send, KeyRound, Copy, CheckCircle2, XCircle, Info } from 'lucide-react';
import api from '../lib/api';
import { useToast } from '../lib/toast';
import { t, getLang } from '../lib/i18n';

interface Webhook {
  id: string; name: string; url: string; events: string[]; active: number;
  lastStatus: number | null; lastError: string; lastSentAt: string | null;
  secretSet: boolean; createdAt: string;
}

const EVENTS = ['post_published', 'post_created', 'post_updated', 'delete_post', 'comment_added', 'comment_approved', 'comment_spam', 'delete_comment', 'user_register', 'media_uploaded'];
const CHIP_CLS = ['bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300', 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300', 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300', 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300', 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'];
const chipCls = (i: number): string => CHIP_CLS[i % CHIP_CLS.length];

export default function Webhooks() {
  const { toast } = useToast();
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<{ id: string | null; name: string; url: string; events: string[] } | null>(null);
  const [oneTimeSecret, setOneTimeSecret] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    api.get('/admin/webhooks').then(r => { setWebhooks(Array.isArray(r.data?.webhooks) ? r.data.webhooks : []); setLoading(false); })
      .catch(() => setLoading(false));
  };
  useEffect(load, []);

  const save = async () => {
    if (!editing) return;
    if (!editing.name.trim()) { toast(t('webhook name required', getLang()), 'error'); return; }
    if (!/^https?:\/\//i.test(editing.url.trim())) { toast(t('valid http url required', getLang()), 'error'); return; }
    if (editing.events.length === 0) { toast(t('at least one event required', getLang()), 'error'); return; }
    try {
      if (editing.id) {
        await api.put('/admin/webhooks/' + editing.id, { name: editing.name, url: editing.url, events: editing.events });
        toast(t('webhook updated', getLang()));
      } else {
        const r = await api.post('/admin/webhooks', { name: editing.name, url: editing.url, events: editing.events });
        if (r.data?.secret) setOneTimeSecret(r.data.secret);
        toast(t('webhook created', getLang()));
      }
      setEditing(null);
      load();
    } catch (e: any) { toast(e?.response?.data?.error || String(e), 'error'); }
  };

  const toggleActive = async (w: Webhook) => {
    try {
      await api.put('/admin/webhooks/' + w.id, { active: !w.active });
      load();
    } catch (e: any) { toast(e?.response?.data?.error || String(e), 'error'); }
  };

  const testWebhook = async (w: Webhook) => {
    try {
      const r = await api.post('/admin/webhooks/' + w.id + '/test');
      if (r.data?.ok) { toast(t('test sent', getLang())); load(); }
      else toast(r.data?.error || t('failed', getLang()), 'error');
    } catch (e: any) { toast(e?.response?.data?.error || String(e), 'error'); }
  };

  const resetSecret = async (w: Webhook) => {
    try {
      const r = await api.post('/admin/webhooks/' + w.id + '/reset-secret');
      if (r.data?.secret) setOneTimeSecret(r.data.secret);
      toast(t('reset secret', getLang()));
      load();
    } catch (e: any) { toast(e?.response?.data?.error || String(e), 'error'); }
  };

  const remove = async (w: Webhook) => {
    if (!window.confirm(t('delete webhook confirm', getLang()))) return;
    try {
      await api.delete('/admin/webhooks/' + w.id);
      toast(t('webhook deleted', getLang()));
      load();
    } catch (e: any) { toast(e?.response?.data?.error || String(e), 'error'); }
  };

  const copySecret = () => {
    if (!oneTimeSecret) return;
    navigator.clipboard.writeText(oneTimeSecret).then(() => toast(t('secret copied', getLang()))).catch(() => {});
  };

  const openCreate = () => { setEditing({ id: null, name: '', url: '', events: ['post_published'] }); setOneTimeSecret(null); };
  const openEdit = (w: Webhook) => { setEditing({ id: w.id, name: w.name, url: w.url, events: Array.isArray(w.events) ? [...w.events] : [] }); setOneTimeSecret(null); };
  const toggleEvent = (ev: string, checked: boolean) => {
    if (!editing) return;
    setEditing({ ...editing, events: checked ? [...editing.events, ev] : editing.events.filter(x => x !== ev) });
  };

  // ---- Render pieces (split so React keeps a flat tree) ----
  const statusBadge = (w: Webhook) => {
    if (w.lastStatus === null) {
      return React.createElement('span', { className: 'text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400' }, t('never sent', getLang()));
    }
    if (w.lastStatus >= 200 && w.lastStatus < 300) {
      return React.createElement('span', { className: 'text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 flex items-center gap-1' }, React.createElement(CheckCircle2, { size: 10 }), t('success', getLang()) + ' · ' + w.lastStatus);
    }
    return React.createElement('span', { className: 'text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 flex items-center gap-1' }, React.createElement(XCircle, { size: 10 }), t('failed', getLang()) + ' · ' + w.lastStatus);
  };

  const headerEl = React.createElement('div', { className: 'flex items-center justify-between mb-2' },
    React.createElement('h2', { className: 'text-2xl font-bold text-gray-900 dark:text-gray-100' }, t('webhooks', getLang())),
    React.createElement('button', { onClick: openCreate, className: 'btn-primary text-sm' }, React.createElement(Plus, { size: 15 }), t('new webhook', getLang())),
  );

  const hintEl = React.createElement('p', { className: 'text-sm text-gray-500 dark:text-gray-400 mb-4' }, t('webhooks description', getLang()));

  const payloadEl = React.createElement('div', { className: 'text-xs text-gray-400 dark:text-gray-500 mb-6 flex items-start gap-1.5' },
    React.createElement(Info, { size: 13, className: 'mt-0.5 shrink-0' }),
    t('payload format note', getLang()),
  );

  const secretEl = oneTimeSecret ? React.createElement('div', { className: 'card p-4 mb-6 border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20' },
    React.createElement('p', { className: 'text-sm font-medium text-amber-800 dark:text-amber-200 mb-2' }, t('secret shown once', getLang())),
    React.createElement('div', { className: 'flex items-center gap-2' },
      React.createElement('code', { className: 'flex-1 text-xs break-all bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-gray-800 dark:text-gray-200' }, oneTimeSecret),
      React.createElement('button', { onClick: copySecret, className: 'btn-secondary text-xs whitespace-nowrap' }, React.createElement(Copy, { size: 13 }), t('copy secret', getLang())),
    ),
  ) : null;

  const listEl = webhooks.map((w) => React.createElement('div', { key: w.id, className: 'card p-5' },
    React.createElement('div', { className: 'flex items-start gap-3' },
      React.createElement('button', {
        onClick: () => toggleActive(w), title: t('active', getLang()), role: 'switch', 'aria-checked': !!w.active,
        className: 'mt-0.5 relative w-9 h-5 rounded-full transition-colors shrink-0 ' + (w.active ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-700'),
      }, React.createElement('span', { style: { position: 'absolute', top: 2, left: w.active ? 18 : 2, width: 16, height: 16 }, className: 'rounded-full bg-white shadow transition-all' })),
      React.createElement('div', { className: 'flex-1 min-w-0' },
        React.createElement('div', { className: 'flex items-center gap-2 flex-wrap' },
          React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 dark:text-gray-100' }, w.name),
          statusBadge(w),
          !w.secretSet && React.createElement('span', { className: 'text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' }, t('signing secret', getLang()) + ' —'),
        ),
        React.createElement('code', { className: 'block text-xs text-gray-500 dark:text-gray-400 mt-1.5 break-all' }, w.url),
        React.createElement('div', { className: 'flex flex-wrap gap-1.5 mt-2' },
          (Array.isArray(w.events) ? w.events : []).map((ev, i) => React.createElement('span', { key: ev, className: 'text-[10px] px-2 py-0.5 rounded-full font-medium ' + chipCls(i) }, t('event ' + ev, getLang())))),
        typeof w.lastError === 'string' && w.lastError !== '' && React.createElement('p', { className: 'text-xs text-red-500 dark:text-red-400 mt-2' }, t('last error', getLang()) + ': ' + w.lastError),
        w.lastSentAt && !isNaN(Date.parse(w.lastSentAt)) && React.createElement('p', { className: 'text-[11px] text-gray-400 mt-1' }, t('last delivery', getLang()) + ': ' + new Date(w.lastSentAt).toLocaleString()),
      ),
      React.createElement('div', { className: 'flex flex-col gap-1.5 shrink-0' },
        React.createElement('button', { onClick: () => testWebhook(w), title: t('test webhook', getLang()), className: 'btn-secondary text-xs px-2.5 py-1' }, React.createElement(Send, { size: 12 }), t('test webhook', getLang())),
        React.createElement('div', { className: 'flex gap-1.5' },
          React.createElement('button', { onClick: () => openEdit(w), title: t('edit', getLang()), className: 'btn-secondary text-xs px-2.5 py-1' }, React.createElement(Pencil, { size: 12 })),
          React.createElement('button', { onClick: () => resetSecret(w), title: t('reset secret', getLang()), className: 'btn-secondary text-xs px-2.5 py-1' }, React.createElement(KeyRound, { size: 12 })),
          React.createElement('button', { onClick: () => remove(w), title: t('delete', getLang()), className: 'btn-danger text-xs px-2.5 py-1' }, React.createElement(Trash2, { size: 12 })),
        ),
      ),
    ),
  ));

  const bodyEl = loading
    ? React.createElement('p', { className: 'text-sm text-gray-400' }, t('loading', getLang()) + '…')
    : webhooks.length === 0
      ? React.createElement('div', { className: 'card p-10 text-center' }, React.createElement('p', { className: 'text-sm text-gray-400' }, t('no webhooks yet', getLang())))
      : React.createElement('div', { className: 'space-y-4' }, listEl);

  const modalEl = editing ? React.createElement('div', { className: 'fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-4', onClick: (e: React.MouseEvent) => { if (e.target === e.currentTarget) setEditing(null); } },
    React.createElement('div', { className: 'card w-full max-w-lg p-6' },
      React.createElement('h3', { className: 'text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4' }, t(editing.id ? 'edit webhook' : 'new webhook', getLang())),
      React.createElement('label', { className: 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1' }, t('webhook name', getLang())),
      React.createElement('input', { value: editing.name, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setEditing({ ...editing, name: e.target.value }), placeholder: 'My receiver', className: 'input-field mb-3' }),
      React.createElement('label', { className: 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1' }, t('endpoint url', getLang())),
      React.createElement('input', { value: editing.url, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setEditing({ ...editing, url: e.target.value }), placeholder: 'https://example.com/hook', className: 'input-field mb-3' }),
      React.createElement('label', { className: 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2' }, t('trigger events', getLang())),
      React.createElement('div', { className: 'grid grid-cols-2 gap-1.5 mb-6 max-h-56 overflow-y-auto pr-1' },
        EVENTS.map((ev, i) => React.createElement('label', { key: ev, className: 'flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg px-2 py-1.5' },
          React.createElement('input', { type: 'checkbox', checked: editing.events.includes(ev), onChange: (e: React.ChangeEvent<HTMLInputElement>) => toggleEvent(ev, e.target.checked), className: 'accent-primary-600' }),
          React.createElement('span', { className: 'inline-block w-2 h-2 rounded-full mr-1 ' + chipCls(i) }),
          t('event ' + ev, getLang()),
        )),
      ),
      React.createElement('div', { className: 'flex justify-end gap-2' },
        React.createElement('button', { onClick: () => setEditing(null), className: 'btn-secondary text-sm' }, t('cancel', getLang())),
        React.createElement('button', { onClick: save, className: 'btn-primary text-sm' }, t('save', getLang())),
      ),
    ),
  ) : null;

  return React.createElement('div', null, headerEl, hintEl, payloadEl, secretEl, bodyEl, modalEl);
}
