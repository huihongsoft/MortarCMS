import React, { useEffect, useState } from 'react';
import { formatDateTime } from '../lib/format';
import { Workflow, Play, RefreshCw } from 'lucide-react';
import api from '../lib/api';
import { t, getLang } from '../lib/i18n';
import { useToast } from '../lib/toast';
import { taskResultText } from '../lib/taskResult';

// Scheduled tasks: the backend has registered and run these for a while, but the
// only way to see them was the API. A task that stopped running, or one whose
// last run errored, is exactly the kind of thing an operator needs to find
// without reading logs.
function humanInterval(ms: number): string {
  if (ms % 86_400_000 === 0) return (ms / 86_400_000) + ' ' + t('days', getLang());
  if (ms % 3_600_000 === 0) return (ms / 3_600_000) + ' ' + t('hours', getLang());
  if (ms % 60_000 === 0) return (ms / 60_000) + ' ' + t('minutes', getLang());
  return Math.round(ms / 1000) + ' ' + t('seconds', getLang());
}

export default function SystemTasks() {
  const toast = useToast();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string>('');

  useEffect(() => { load(); }, []);

  function load() {
    setLoading(true);
    api.get('/system/tasks').then((r) => setTasks(r.data.tasks || [])).catch(() => {}).finally(() => setLoading(false));
  }

  async function toggle(task: any) {
    setBusy(task.id);
    try {
      await api.put('/system/tasks/' + encodeURIComponent(task.id) + '/enabled', { enabled: !task.enabled });
      await load();
    } catch (e: any) { toast.toast(e.response?.data?.error || t('save failed', getLang()), 'error'); }
    finally { setBusy(''); }
  }

  async function runNow(task: any) {
    setBusy(task.id);
    try {
      const r = await api.post('/system/tasks/' + encodeURIComponent(task.id) + '/run');
      const body = r.data || {};
      // Lead with what it did: "task ran" alone is exactly the message that made a
      // working task and a no-op task look the same.
      const did = taskResultText(body.result);
      if (body.skipped) toast.toast(t('task skipped', getLang()) + ': ' + (body.error || ''), 'error');
      else if (body.success) toast.toast((did || t('task ran', getLang())) + ' (' + (body.ms || 0) + 'ms)');
      else toast.toast(t('task failed', getLang()) + ': ' + (body.error || ''), 'error');
      await load();
    } catch (e: any) { toast.toast(e.response?.data?.error || t('run failed', getLang()), 'error'); }
    finally { setBusy(''); }
  }

  return React.createElement('div', null,
    React.createElement('div', { className: 'flex items-center justify-between mb-6' },
      React.createElement('h2', { className: 'text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2' },
        React.createElement(Workflow, { size: 22, className: 'text-primary-500' }), t('scheduled tasks', getLang())),
      React.createElement('button', { onClick: load, className: 'btn-secondary text-sm' }, React.createElement(RefreshCw, { size: 14 }), t('refresh', getLang()))),
    React.createElement('p', { className: 'text-sm text-gray-500 dark:text-gray-400 mb-4' }, t('recurring maintenance jobs run in the background; trigger any of them manually here.', getLang())),

    React.createElement('div', { className: 'card overflow-hidden' },
      loading && tasks.length === 0
        ? React.createElement('p', { className: 'text-sm text-gray-400 p-8 text-center' }, t('loading', getLang()) + '…')
        : React.createElement('div', { className: 'overflow-x-auto' },
            React.createElement('table', { className: 'w-full min-w-[820px]' },
              React.createElement('thead', null, React.createElement('tr', { className: 'border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-left' },
                React.createElement('th', { className: 'px-4 py-3 text-[11px] uppercase text-gray-400 font-medium' }, t('task', getLang())),
                React.createElement('th', { className: 'px-4 py-3 text-[11px] uppercase text-gray-400 font-medium' }, t('interval', getLang())),
                React.createElement('th', { className: 'px-4 py-3 text-[11px] uppercase text-gray-400 font-medium' }, t('last run', getLang())),
                React.createElement('th', { className: 'px-4 py-3 text-[11px] uppercase text-gray-400 font-medium' }, t('next run', getLang())),
                React.createElement('th', { className: 'px-4 py-3 text-[11px] uppercase text-gray-400 font-medium' }, t('run count', getLang())),
                React.createElement('th', { className: 'px-4 py-3 text-[11px] uppercase text-gray-400 font-medium text-right' }, t('actions', getLang())))),
              React.createElement('tbody', null, tasks.map((task: any) =>
                React.createElement('tr', { key: task.id, className: 'border-b border-gray-50 dark:border-gray-800' },
                  React.createElement('td', { className: 'px-4 py-3' },
                    // Through t(): the API sends the English name/description and the
                    // dictionary is keyed by them, so a plugin task with a name nobody
                    // translated simply falls back to its own text.
                    React.createElement('p', { className: 'text-sm text-gray-800 dark:text-gray-100 font-medium' }, t(task.name, getLang())),
                    React.createElement('p', { className: 'text-xs text-gray-400 mt-0.5' }, t(task.desc, getLang())),
                    // What the last run actually accomplished — including "nothing
                    // to do", which is the answer an operator is looking for when a
                    // task appears to have done nothing.
                    taskResultText(task.lastResult) && React.createElement('p', { className: 'text-xs text-gray-600 dark:text-gray-300 mt-1' },
                      t('last result', getLang()) + ': ' + taskResultText(task.lastResult)),
                    React.createElement('p', { className: 'text-[10px] text-gray-400 font-mono mt-0.5' }, task.id + ' · ' + t(task.source, getLang())),
                    // The raw failure text stays visible — this screen exists so an
                    // operator can find the task that stopped working — but it is
                    // labelled in their language, and only manage_options can read
                    // the endpoint at all. The same failure is in the server log.
                    task.lastStatus === 'error' && task.lastError && React.createElement('p', { className: 'text-[11px] text-red-500 mt-1 break-all' },
                      t('last error', getLang()) + ': ' + task.lastError)),
                  React.createElement('td', { className: 'px-4 py-3 text-xs text-gray-500 whitespace-nowrap' }, humanInterval(task.intervalMs)),
                  React.createElement('td', { className: 'px-4 py-3 text-xs text-gray-500 whitespace-nowrap' },
                    task.lastRun ? formatDateTime(task.lastRun) : t('never', getLang()),
                    task.lastDurationMs != null && React.createElement('span', { className: 'text-gray-400' }, ' · ' + task.lastDurationMs + 'ms')),
                  React.createElement('td', { className: 'px-4 py-3 text-xs whitespace-nowrap ' + (task.due ? 'text-amber-600' : 'text-gray-500') },
                    task.enabled ? (task.nextRun ? formatDateTime(task.nextRun) : t('as soon as possible', getLang())) : t('disabled', getLang())),
                  React.createElement('td', { className: 'px-4 py-3 text-xs text-gray-500 whitespace-nowrap' }, String(task.runCount ?? 0)),
                  React.createElement('td', { className: 'px-4 py-3 text-right whitespace-nowrap' },
                    React.createElement('button', {
                      onClick: () => runNow(task), disabled: busy === task.id,
                      className: 'btn-secondary text-xs mr-2 disabled:opacity-40',
                    }, React.createElement(Play, { size: 12 }), t('run now', getLang())),
                    React.createElement('button', {
                      onClick: () => toggle(task), disabled: busy === task.id,
                      className: 'text-xs px-2.5 py-1 rounded-lg disabled:opacity-40 ' + (task.enabled ? 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300' : 'bg-primary-50 text-primary-700'),
                    }, task.enabled ? t('disable', getLang()) : t('enable', getLang())))))) )))
  );
}
