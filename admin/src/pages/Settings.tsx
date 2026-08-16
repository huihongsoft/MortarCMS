import React, { useEffect, useState } from 'react';
import { Save, Download, Upload, Mail, ShieldCheck, Wrench, Settings2, FileJson, Trash2 } from 'lucide-react';
import api from '../lib/api';
import { t, getLang } from '../lib/i18n';

type TabKey = 'general' | 'reading' | 'discussion' | 'privacy' | 'smtp' | 'maintenance' | 'tools';

export default function Settings() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState<TabKey>('general');
  const [pages, setPages] = useState<any[]>([]);
  const [cacheInfo, setCacheInfo] = useState<any>(null);
  const [cacheTtl, setCacheTtl] = useState(60);
  const [mailTemplates, setMailTemplates] = useState<any[]>([]);
  const [previewTpl, setPreviewTpl] = useState('');
  const [tasks, setTasks] = useState<any[]>([]);
  const [dbStatus, setDbStatus] = useState<any>(null);
  const [dbCheck, setDbCheck] = useState<any>(null);
  const [gdprUsers, setGdprUsers] = useState<any[]>([]);
  const [dbBackups, setDbBackups] = useState<any[]>([]);
  async function loadBackups() { api.get('/db/backups').then(r => setDbBackups(r.data?.backups || [])).catch(() => {}); }
  useEffect(() => {
    api.get('/settings').then(r => setSettings(r.data));
    api.get('/pages').then(r => setPages(r.data)).catch(() => {});
    api.get('/system/cache').then(r => { setCacheInfo(r.data); setCacheTtl(r.data?.ttlSeconds || 60); }).catch(() => {});
    api.get('/mailer/templates').then(r => setMailTemplates(r.data?.templates || [])).catch(() => {});
    api.get('/users').then(r => setGdprUsers(r.data || [])).catch(() => {});
    loadTasks();
    api.get('/db/status').then(r => setDbStatus(r.data)).catch(() => {});
    loadBackups();
  }, []);

  async function loadTasks() { api.get('/system/tasks').then(r => setTasks(r.data?.tasks || [])).catch(() => {}); }
  async function runTask(id: string) { await api.post('/system/tasks/' + id + '/run'); loadTasks(); }
  async function toggleTask(t: any) { await api.put('/system/tasks/' + t.id + '/enabled', { enabled: !t.enabled }); loadTasks(); }

  const fmtInterval = (ms: number) => {
    if (ms >= 7 * 86400000) return t('weekly', getLang());
    if (ms >= 86400000) return t('daily', getLang());
    if (ms >= 3600000) return Math.round(ms / 3600000) + 'h';
    return Math.round(ms / 60000) + 'm';
  };

  async function saveCache() {
    try {
      await api.put('/system/cache', { enabled: cacheInfo?.enabled !== false, ttl: cacheTtl });
      const r = await api.get('/system/cache');
      setCacheInfo(r.data);
      alert(t('cache settings saved', getLang()));
    } catch { alert(t('save failed', getLang())); }
  }

  async function purgeCache() {
    try {
      const r = await api.post('/system/cache/purge');
      const s = await api.get('/system/cache');
      setCacheInfo(s.data);
      alert(t('cache purged', getLang()) + ' (' + r.data?.purged + ')');
    } catch { alert(t('purge failed', getLang())); }
  }

  async function saveSettings() {
    try {
      await api.put('/settings', settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      // Let the sidebar re-read dev_mode so the developer-mode menu entries
      // appear/disappear immediately
      window.dispatchEvent(new CustomEvent('mortar-settings-saved'));
    } catch (e: any) {
      alert(e.response?.data?.error || t('save failed', getLang()));
    }
  }

  const field = (key: string, label: string, type = 'text') =>
    React.createElement('div', { key: key, 'data-setting-key': key },
      React.createElement('label', { className: 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1' }, label),
      type === 'textarea'
        ? React.createElement('textarea', { value: settings[key] || '', onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => setSettings({ ...settings, [key]: e.target.value }), rows: 4, className: 'input-field font-mono text-xs' })
        : React.createElement('input', { type: type, value: settings[key] || '', onChange: (e: React.ChangeEvent<HTMLInputElement>) => setSettings({ ...settings, [key]: e.target.value }), className: 'input-field' })
    );

  const tabs: { key: TabKey; label: string; icon: any }[] = [
    { key: 'general', label: t('general', getLang()), icon: Settings2 },
    { key: 'reading', label: t('reading settings', getLang()), icon: FileJson },
    { key: 'discussion', label: t('discussion', getLang()), icon: ShieldCheck },
    { key: 'privacy', label: t('privacy', getLang()), icon: ShieldCheck },
    { key: 'smtp', label: t('email / smtp', getLang()), icon: Mail },
    { key: 'maintenance', label: t('maintenance mode', getLang()), icon: Wrench },
    { key: 'tools', label: t('tools', getLang()), icon: Download },
  ];

  return React.createElement('div', null,
    // Header (in flow — not sticky, so it never covers the content)
    React.createElement('div', { className: 'flex items-center justify-between py-4 mb-6' },
      React.createElement('h2', { className: 'text-2xl font-bold text-gray-900 dark:text-gray-100' }, t('settings', getLang())),
      React.createElement('button', { onClick: saveSettings, className: 'btn-primary' }, React.createElement(Save, { size: 16 }), saved ? t('saved!', getLang()) : t('save changes', getLang()))
    ),
    // Tab bar
    React.createElement('div', { className: 'flex gap-2 mb-6 overflow-x-auto pb-1' },
      tabs.map(tb =>
        React.createElement('button', {
          key: tb.key, onClick: () => setTab(tb.key),
          className: 'px-3 py-1.5 text-sm rounded-lg flex items-center gap-1.5 whitespace-nowrap transition-colors ' + (tab === tb.key ? 'bg-primary-600 text-white shadow-sm' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'),
        }, React.createElement(tb.icon, { size: 14 }), tb.label)
      )
    ),
    // Tab content
    tab === 'general' && React.createElement('div', { className: 'card p-6' },
      React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4' },
        field('site_title', t('site title', getLang())),
        field('site_description', t('site description', getLang())),
        field('site_url', t('site url', getLang())),
        field('cdn_url', t('cdn url (optional, e.g. https://cdn.example.com)', getLang())),
        field('admin_email', t('admin email', getLang()), 'email'),
        field('timezone', t('timezone', getLang())),
        field('date_format', t('date format', getLang())),
        React.createElement('div', { className: 'flex items-center gap-2' },
          React.createElement('label', { className: 'flex items-center gap-2 cursor-pointer text-sm text-gray-700 dark:text-gray-300' },
            React.createElement('input', { type: 'checkbox', checked: (settings.users_can_register || '1') !== '0', onChange: (e: React.ChangeEvent<HTMLInputElement>) => setSettings({ ...settings, users_can_register: e.target.checked ? '1' : '0' }), className: 'rounded border-gray-300 text-primary-600' }),
            t('allow public registration', getLang()))),
        React.createElement('div', null,
          React.createElement('label', { className: 'flex items-center gap-2 cursor-pointer text-sm text-gray-700 dark:text-gray-300' },
            React.createElement('input', { type: 'checkbox', checked: settings.dev_mode === '1', onChange: (e: React.ChangeEvent<HTMLInputElement>) => setSettings({ ...settings, dev_mode: e.target.checked ? '1' : '0' }), className: 'rounded border-gray-300 text-primary-600' }),
            t('developer mode', getLang())),
          React.createElement('p', { className: 'text-xs text-gray-400 mt-1' }, t('developer mode hint', getLang()))),
        React.createElement('div', null,
          React.createElement('label', { className: 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1' }, t('default site language', getLang())),
          React.createElement('select', { value: settings.site_lang || '', onChange: (e: React.ChangeEvent<HTMLSelectElement>) => setSettings({ ...settings, site_lang: e.target.value }), className: 'input-field' },
            React.createElement('option', { value: '' }, t('follow visitor preference', getLang())),
            React.createElement('option', { value: 'en' }, 'English'),
            React.createElement('option', { value: 'zh' }, '中文'))
        ),
      ),
      React.createElement('div', { className: 'mt-5 pt-5 border-t border-gray-100 dark:border-gray-700' },
        React.createElement('label', { className: 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1' }, t('translation overrides (json)', getLang())),
        React.createElement('p', { className: 'text-xs text-gray-400 mb-2' }, t('override any frontend UI string, e.g. {"search": "Find"}', getLang())),
        React.createElement('textarea', { value: settings.translations_override || '', onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => setSettings({ ...settings, translations_override: e.target.value }), rows: 4, className: 'input-field font-mono text-xs w-full' })
      )
    ),
    tab === 'reading' && React.createElement('div', { className: 'card p-6' },
      React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4' },
        // WordPress "Your homepage displays"
        React.createElement('div', null,
          React.createElement('label', { className: 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1' }, t('your homepage displays', getLang())),
          React.createElement('select', { value: settings.show_on_front || 'posts', onChange: (e: React.ChangeEvent<HTMLSelectElement>) => setSettings({ ...settings, show_on_front: e.target.value }), className: 'input-field' },
            React.createElement('option', { value: 'posts' }, t('your latest posts', getLang())),
            React.createElement('option', { value: 'page' }, t('a static page', getLang())))),
        settings.show_on_front === 'page' && React.createElement('div', null,
          React.createElement('label', { className: 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1' }, t('homepage', getLang())),
          React.createElement('select', { value: settings.page_on_front || '', onChange: (e: React.ChangeEvent<HTMLSelectElement>) => setSettings({ ...settings, page_on_front: e.target.value }), className: 'input-field' },
            React.createElement('option', { value: '' }, t('select a page', getLang()) + '...'),
            pages.filter((p: any) => p.status === 'published').map((p: any) => React.createElement('option', { key: p.id, value: p.slug }, p.title)))),
        field('posts_per_page', t('posts per page', getLang()), 'number'),
        field('permalink_structure', t('permalink structure (/post/%slug%)', getLang())),
        field('default_role', t('default user role', getLang())),
      )
    ),
    tab === 'discussion' && React.createElement('div', { className: 'card p-6' },
      React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4' },
        field('comment_moderation', t('comment moderation (1/0)', getLang())),
        field('default_comment_status', t('default comment status', getLang())),
        React.createElement('div', { className: 'md:col-span-2' },
          React.createElement('label', { className: 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1' }, t('spam words (comma separated)', getLang())),
          React.createElement('p', { className: 'text-xs text-gray-400 mb-1' }, t('comments containing these words are flagged as spam automatically.', getLang())),
          React.createElement('textarea', { value: settings.spam_words || '', onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => setSettings({ ...settings, spam_words: e.target.value }), rows: 3, className: 'input-field text-sm w-full', placeholder: 'viagra, casino, buy now' })
        ),
      )
    ),
    tab === 'privacy' && React.createElement('div', { className: 'space-y-4' },
      React.createElement('div', { className: 'card p-6' },
        React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4' }, t('privacy settings', getLang())),
        React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4' },
          React.createElement('div', { className: 'flex items-center gap-2' },
            React.createElement('label', { className: 'flex items-center gap-2 cursor-pointer text-sm text-gray-700 dark:text-gray-300' },
              React.createElement('input', { type: 'checkbox', checked: (settings.cookie_consent_enabled || '1') !== '0', onChange: (e: React.ChangeEvent<HTMLInputElement>) => setSettings({ ...settings, cookie_consent_enabled: e.target.checked ? '1' : '0' }), className: 'rounded border-gray-300 text-primary-600' }),
              t('show cookie consent banner', getLang()))),
          React.createElement('div', { className: 'flex items-center gap-2' },
            React.createElement('label', { className: 'flex items-center gap-2 cursor-pointer text-sm text-gray-700 dark:text-gray-300' },
              React.createElement('input', { type: 'checkbox', checked: (settings.visit_logging || '1') !== '0', onChange: (e: React.ChangeEvent<HTMLInputElement>) => setSettings({ ...settings, visit_logging: e.target.checked ? '1' : '0' }), className: 'rounded border-gray-300 text-primary-600' }),
              t('log visitor ip addresses for stats', getLang()))),
          React.createElement('div', { className: 'md:col-span-2' },
            React.createElement('label', { className: 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1' }, t('cookie consent text', getLang())),
            React.createElement('textarea', { value: settings.cookie_consent_text || '', onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => setSettings({ ...settings, cookie_consent_text: e.target.value }), rows: 2, className: 'input-field text-sm' })),
          field('privacy_policy_slug', t('privacy policy page slug', getLang())),
        ),
        React.createElement('button', { onClick: saveSettings, className: 'btn-primary text-sm mt-4' }, t('save changes', getLang()))
      ),
      React.createElement('div', { className: 'card p-6' },
        React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3' }, t('my data (gdpr)', getLang())),
        React.createElement('p', { className: 'text-sm text-gray-500 dark:text-gray-400 mb-4' }, t('download everything the site stores about you, or erase your account and personal data.', getLang())),
        React.createElement('div', { className: 'flex flex-wrap gap-3' },
          React.createElement('button', { onClick: async () => {
            try {
              const r = await api.get('/gdpr/export');
              const blob = new Blob([JSON.stringify(r.data, null, 2)], { type: 'application/json' });
              const a = document.createElement('a');
              a.href = URL.createObjectURL(blob);
              a.download = 'my-data.json';
              a.click();
            } catch { alert(t('export failed', getLang())); }
          }, className: 'btn-secondary text-sm' }, React.createElement(Download, { size: 14 }), t('export my data', getLang())),
          React.createElement('button', { onClick: async () => {
            if (!confirm(t('erase my data', getLang()) + '?')) return;
            try { await api.post('/gdpr/erase'); alert(t('data erased', getLang())); localStorage.removeItem('mortar_token'); window.location.href = '/admin/login'; }
            catch (e: any) { alert(e.response?.data?.error || t('erase failed', getLang())); }
          }, className: 'btn-danger text-sm' }, t('erase my data', getLang()))
        )
      ),
      React.createElement('div', { className: 'card p-6' },
        React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3' }, t('manage user data', getLang())),
        React.createElement('p', { className: 'text-sm text-gray-500 dark:text-gray-400 mb-4' }, t('export or erase the personal data of any registered user.', getLang())),
        React.createElement('div', { className: 'flex items-center gap-2 flex-wrap' },
          React.createElement('select', { id: 'gdpr-user', className: 'input-field w-56 text-sm' },
            gdprUsers.map((u: any) => React.createElement('option', { key: u.id, value: u.id }, u.username + ' (' + u.email + ')')))),
        React.createElement('div', { className: 'flex gap-2 mt-3' },
          React.createElement('button', { onClick: async () => {
            const id = (document.getElementById('gdpr-user') as HTMLSelectElement)?.value;
            if (!id) return;
            const r = await api.get('/gdpr/admin/export/' + id);
            const blob = new Blob([JSON.stringify(r.data, null, 2)], { type: 'application/json' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = 'user-data.json';
            a.click();
          }, className: 'btn-secondary text-sm' }, t('export user data', getLang())),
          React.createElement('button', { onClick: async () => {
            const id = (document.getElementById('gdpr-user') as HTMLSelectElement)?.value;
            if (!id) return;
            if (!confirm(t('erase this user data?', getLang()))) return;
            try { await api.post('/gdpr/admin/erase/' + id); alert(t('data erased', getLang())); }
            catch (e: any) { alert(e.response?.data?.error || t('erase failed', getLang())); }
          }, className: 'btn-danger text-sm' }, t('erase user data', getLang()))
        )
      )
    ),
    tab === 'smtp' && React.createElement('div', { className: 'space-y-4' },
      React.createElement('div', { className: 'card p-6' },
        React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4' },
          field('smtp_host', t('smtp host', getLang())),
          field('smtp_port', t('port', getLang())),
          field('smtp_user', t('username', getLang())),
          React.createElement('div', null,
            React.createElement('label', { className: 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1' }, t('password', getLang())),
            React.createElement('input', { type: 'password', value: settings.smtp_pass || '', onChange: (e: React.ChangeEvent<HTMLInputElement>) => setSettings({ ...settings, smtp_pass: e.target.value }), className: 'input-field' })),
          field('smtp_from', t('from email', getLang())),
          React.createElement('div', null,
            React.createElement('label', { className: 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1' }, t('security', getLang())),
            React.createElement('select', { value: settings.smtp_secure || 'tls', onChange: (e: React.ChangeEvent<HTMLSelectElement>) => setSettings({ ...settings, smtp_secure: e.target.value }), className: 'input-field' },
              React.createElement('option', { value: 'tls' }, t('tls', getLang())), React.createElement('option', { value: 'ssl' }, t('ssl', getLang())), React.createElement('option', { value: 'none' }, t('none', getLang()))))
        ),
        // Save + send test email
        React.createElement('div', { className: 'mt-5 pt-5 border-t border-gray-100 dark:border-gray-700 flex flex-wrap items-end gap-3' },
          React.createElement('button', { onClick: saveSettings, className: 'btn-primary text-sm' }, t('save changes', getLang())),
          React.createElement('div', { className: 'flex items-center gap-2' },
            React.createElement('input', { id: 'smtp-test-to', defaultValue: settings.admin_email || '', placeholder: t('recipient email', getLang()), className: 'input-field w-56 text-sm' }),
            React.createElement('button', { onClick: async () => {
              const to = (document.getElementById('smtp-test-to') as HTMLInputElement).value.trim();
              if (!to) { alert(t('enter a recipient email', getLang())); return; }
              try { await api.post('/mailer/test', { to }); alert(t('test email sent', getLang()) + ': ' + to); }
              catch (e: any) { alert(e.response?.data?.error || t('send failed', getLang())); }
            }, className: 'btn-secondary text-sm' }, t('send test email', getLang())))
        )
      ),
      // Template previews
      React.createElement('div', { className: 'card p-6' },
        React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4' }, t('email templates', getLang())),
        React.createElement('div', { className: 'space-y-4' },
          mailTemplates.map((tp: any) =>
            React.createElement('div', { key: tp.name, className: 'border border-gray-100 dark:border-gray-700 rounded-lg overflow-hidden' },
              React.createElement('div', { className: 'flex items-center gap-3 px-4 py-2.5 bg-gray-50 dark:bg-gray-800 flex-wrap' },
                React.createElement('code', { className: 'text-xs font-semibold text-gray-800 dark:text-gray-100' }, tp.name),
                React.createElement('span', { className: 'text-xs text-gray-500 flex-1 min-w-0 truncate' }, tp.desc),
                React.createElement('button', { onClick: () => setPreviewTpl(previewTpl === tp.name ? '' : tp.name), className: 'text-xs text-primary-600 hover:text-primary-700' }, t('preview', getLang())),
                React.createElement('button', { onClick: () => {
                  const to = prompt(t('recipient email', getLang()));
                  if (!to) return;
                  api.post('/mailer/send', { to, template: tp.name }).then(() => alert(t('template sent', getLang()))).catch((e: any) => alert(e.response?.data?.error || t('send failed', getLang())));
                }, className: 'text-xs text-primary-600 hover:text-primary-700' }, t('send template', getLang()))
              ),
              previewTpl === tp.name && React.createElement('div', { className: 'p-4 bg-white dark:bg-gray-900' },
                React.createElement('p', { className: 'text-[10px] uppercase text-gray-400 mb-2' }, tp.subject),
                React.createElement('div', { className: 'border border-gray-100 dark:border-gray-700 rounded-lg overflow-hidden', dangerouslySetInnerHTML: { __html: tp.previewHtml } })
              )
            )
          )
        )
      )
    ),
    tab === 'maintenance' && React.createElement('div', { className: 'space-y-4' },
      React.createElement('div', { className: 'card p-6' },
        React.createElement('div', { className: 'flex items-center gap-4' },
          React.createElement('label', { className: 'flex items-center gap-2 cursor-pointer' },
            React.createElement('input', { type: 'checkbox', checked: (settings.maintenance_mode || '0') === '1', onChange: (e: React.ChangeEvent<HTMLInputElement>) => setSettings({ ...settings, maintenance_mode: e.target.checked ? '1' : '0' }), className: 'rounded border-gray-300 text-primary-600' }),
            React.createElement('span', { className: 'text-sm text-gray-700 dark:text-gray-300' }, t('enable maintenance mode', getLang()))
          )
        ),
        React.createElement('div', { className: 'mt-3' },
          React.createElement('input', { value: settings.maintenance_message || '', onChange: (e: React.ChangeEvent<HTMLInputElement>) => setSettings({ ...settings, maintenance_message: e.target.value }), placeholder: t('maintenance message', getLang()), className: 'input-field' })
        )
      ),
      React.createElement('div', { className: 'card p-6' },
        React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1' }, t('scheduled maintenance window', getLang())),
        React.createElement('p', { className: 'text-xs text-gray-400 mb-4' }, t('the site enters maintenance automatically between these times, even when the toggle above is off.', getLang())),
        (() => {
          let sch: any = null;
          try { sch = settings.maintenance_schedule ? JSON.parse(settings.maintenance_schedule) : null; } catch {}
          const startVal = sch?.start ? new Date(sch.start).toISOString().slice(0, 16) : '';
          const endVal = sch?.end ? new Date(sch.end).toISOString().slice(0, 16) : '';
          const toLocal = (v: string) => v ? new Date(v).toISOString() : '';
          return React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-3 gap-3 items-end' },
            React.createElement('label', { className: 'flex items-center gap-2 cursor-pointer text-sm text-gray-700 dark:text-gray-300' },
              React.createElement('input', { type: 'checkbox', checked: !!sch?.start, onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                if (e.target.checked) {
                  const start = new Date(Date.now() + 60000).toISOString();
                  const end = new Date(Date.now() + 3600000).toISOString();
                  setSettings({ ...settings, maintenance_schedule: JSON.stringify({ start, end }) });
                } else { setSettings({ ...settings, maintenance_schedule: '' }); }
              }, className: 'rounded border-gray-300 text-primary-600' }),
              t('enable schedule', getLang())
            ),
            React.createElement('div', null,
              React.createElement('label', { className: 'block text-[10px] text-gray-400 mb-1' }, t('start', getLang())),
              React.createElement('input', { type: 'datetime-local', value: startVal, onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                const s = e.target.value ? toLocal(e.target.value) : '';
                const cur: any = (() => { try { return settings.maintenance_schedule ? JSON.parse(settings.maintenance_schedule) : {}; } catch { return {}; } })();
                if (s) setSettings({ ...settings, maintenance_schedule: JSON.stringify({ ...cur, start: s }) });
              }, className: 'input-field text-sm' })),
            React.createElement('div', null,
              React.createElement('label', { className: 'block text-[10px] text-gray-400 mb-1' }, t('end', getLang())),
              React.createElement('input', { type: 'datetime-local', value: endVal, onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                const en = e.target.value ? toLocal(e.target.value) : '';
                const cur: any = (() => { try { return settings.maintenance_schedule ? JSON.parse(settings.maintenance_schedule) : {}; } catch { return {}; } })();
                if (en) setSettings({ ...settings, maintenance_schedule: JSON.stringify({ ...cur, end: en }) });
              }, className: 'input-field text-sm' }))
          );
        })()
      ),
      React.createElement('div', { className: 'card p-6' },
        React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1' }, t('maintenance whitelist', getLang())),
        React.createElement('p', { className: 'text-xs text-gray-400 mb-3' }, t('IP addresses that can always access the site during maintenance (comma or newline separated).', getLang())),
        React.createElement('textarea', { value: settings.maintenance_whitelist || '', onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => setSettings({ ...settings, maintenance_whitelist: e.target.value }), rows: 3, className: 'input-field font-mono text-xs w-full', placeholder: '127.0.0.1, 203.0.113.5' })
      )
    ),
    tab === 'tools' && React.createElement('div', { className: 'space-y-4' },
      React.createElement('div', { className: 'card p-6' },
        React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3' }, t('page cache', getLang())),
        React.createElement('p', { className: 'text-sm text-gray-500 dark:text-gray-400 mb-4' }, t('cache public pages for faster loading; cleared automatically when content changes.', getLang())),
        cacheInfo && React.createElement('div', { className: 'flex flex-wrap items-center gap-4 mb-4' },
          React.createElement('div', { className: 'flex items-center gap-2' },
            React.createElement('label', { className: 'flex items-center gap-2 cursor-pointer text-sm text-gray-700 dark:text-gray-300' },
              React.createElement('input', { type: 'checkbox', checked: cacheInfo.enabled !== false, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setCacheInfo({ ...cacheInfo, enabled: e.target.checked }), className: 'rounded border-gray-300 text-primary-600' }),
              t('cache enabled', getLang()))),
          React.createElement('div', { className: 'flex items-center gap-2 whitespace-nowrap' },
            React.createElement('label', { className: 'text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap' }, t('cache ttl (seconds)', getLang())),
            React.createElement('input', { type: 'number', min: 5, max: 3600, value: cacheTtl, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setCacheTtl(parseInt(e.target.value) || 60), className: 'input-field w-24 text-sm shrink-0' })),
          React.createElement('span', { className: 'text-xs text-gray-400' }, t('cache entries', getLang()) + ': ' + cacheInfo.entries + ' · ' + t('cache hits', getLang()) + ': ' + cacheInfo.hits + ' · ' + t('cache misses', getLang()) + ': ' + cacheInfo.misses),
        ),
        React.createElement('div', { className: 'flex flex-wrap gap-3' },
          React.createElement('button', { onClick: saveCache, className: 'btn-secondary text-sm' }, t('save cache settings', getLang())),
          React.createElement('button', { onClick: purgeCache, className: 'btn-secondary text-sm' }, t('purge cache', getLang())),
        )
      ),
      React.createElement('div', { className: 'card p-6' },
        React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3' }, t('scheduled tasks', getLang())),
        React.createElement('p', { className: 'text-sm text-gray-500 dark:text-gray-400 mb-4' }, t('recurring maintenance jobs run in the background; trigger any of them manually here.', getLang())),
        tasks.length === 0
          ? React.createElement('p', { className: 'text-sm text-gray-400' }, t('loading', getLang()) + '…')
          : React.createElement('div', { className: 'space-y-2' },
              tasks.map((tk: any) =>
                React.createElement('div', { key: tk.id, className: 'flex items-center gap-3 py-2 border-b border-gray-50 dark:border-gray-800 last:border-0 flex-wrap' },
                  React.createElement('div', { className: 'flex-1 min-w-0' },
                    React.createElement('div', { className: 'flex items-center gap-2' },
                      React.createElement('span', { className: 'text-sm font-medium text-gray-900 dark:text-gray-100' }, tk.name),
                      tk.enabled ? React.createElement('span', { className: 'text-[10px] px-1.5 py-0.5 rounded bg-green-100 text-green-700' }, t('enabled', getLang())) : React.createElement('span', { className: 'text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500' }, t('disabled', getLang())),
                      tk.lastStatus === 'error' && React.createElement('span', { className: 'text-[10px] px-1.5 py-0.5 rounded bg-red-100 text-red-700', title: tk.lastError || '' }, t('error', getLang()))
                    ),
                    React.createElement('p', { className: 'text-xs text-gray-400 mt-0.5' }, tk.desc),
                    React.createElement('p', { className: 'text-[10px] text-gray-400 mt-0.5' },
                      t('interval', getLang()) + ': ' + fmtInterval(tk.intervalMs) + ' · ' + t('last run', getLang()) + ': ' + (tk.lastRun ? new Date(tk.lastRun).toLocaleString() : t('never', getLang())) + ' · ' + t('run count', getLang()) + ': ' + tk.runCount + (tk.lastDurationMs != null ? ' · ' + tk.lastDurationMs + 'ms' : ''))
                  ),
                  React.createElement('button', { onClick: () => runTask(tk.id), disabled: tk.running, className: 'btn-secondary text-xs disabled:opacity-40' }, t('run now', getLang())),
                  React.createElement('label', { className: 'flex items-center gap-1.5 cursor-pointer text-xs text-gray-500' },
                    React.createElement('input', { type: 'checkbox', checked: tk.enabled, onChange: () => toggleTask(tk), className: 'rounded border-gray-300 text-primary-600' }), t('enabled', getLang()))
                )
              )
            )
      ),
      React.createElement('div', { className: 'card p-6' },
        React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3' }, t('content', getLang())),
        React.createElement('p', { className: 'text-sm text-gray-500 dark:text-gray-400 mb-4' }, t('export all content as json or import from a previously exported file.', getLang())),
        React.createElement('div', { className: 'flex flex-wrap gap-3' },
          React.createElement('a', { href: '/api/export/export', className: 'btn-secondary text-sm', target: '_blank' }, React.createElement(Download, { size: 14 }), t('download export', getLang())),
          React.createElement('a', { href: '/api/db/backup', className: 'btn-secondary text-sm', target: '_blank' }, React.createElement(Download, { size: 14 }), t('download db backup', getLang())),
        React.createElement('button', { onClick: () => {
          const input = document.createElement('input');
          input.type = 'file'; input.accept = '.json';
          input.onchange = async (e: any) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const text = await file.text();
            try {
              const data = JSON.parse(text);
              // Preview first, then confirm import
              const preview = await api.post('/export/import/preview', data).then(r => r.data).catch(() => null);
              const summary = preview
                ? t('users', getLang()) + ': ' + preview.counts.users + ' · ' + t('posts', getLang()) + ': ' + preview.counts.posts + ' · ' + t('pages', getLang()) + ': ' + preview.counts.pages + ' · ' + t('comments', getLang()) + ': ' + preview.counts.comments + (preview.conflicts > 0 ? ' · ⚠ ' + preview.conflicts + ' ' + t('slug conflicts', getLang()) : '')
                : '';
              if (!confirm(t('import preview', getLang()) + (summary ? '\n\n' + summary : '') + '\n\n' + t('continue with import?', getLang()))) return;
              await api.post('/export/import', data);
              alert(t('import successful!', getLang()));
            } catch { alert(t('import failed. check file format.', getLang())); }
          };
          input.click();
        }, className: 'btn-secondary text-sm' }, React.createElement(Upload, { size: 14 }), t('import json', getLang()))
        )
      ),
      React.createElement('div', { className: 'card p-6 border-red-200 dark:border-red-900/50' },
        React.createElement('h3', { className: 'text-sm font-semibold text-red-600 dark:text-red-400 mb-3' }, t('reset site', getLang())),
        React.createElement('p', { className: 'text-sm text-gray-500 dark:text-gray-400 mb-4' }, t('reset site hint', getLang())),
        React.createElement('button', {
          onClick: async () => {
            if (!confirm(t('reset site confirm', getLang()))) return;
            try {
              const r = await api.post('/db/reset-content');
              const total = r.data?.stats ? Object.values(r.data.stats).reduce((a: number, b: any) => a + (Number(b) || 0), 0) : 0;
              alert(t('site reset successful', getLang()) + (total > 0 ? ' (' + total + ' ' + t('rows deleted', getLang()) + ')' : ''));
              window.location.reload();
            } catch { alert(t('site reset failed', getLang())); }
          },
          className: 'btn-danger text-sm',
        }, React.createElement(Trash2, { size: 14 }), t('reset site', getLang()))
      ),
      React.createElement('div', { className: 'card p-6' },
        React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3' }, t('database', getLang())),
        dbStatus && React.createElement('div', { className: 'grid grid-cols-2 md:grid-cols-4 gap-3 mb-4' },
          React.createElement('div', { className: 'bg-gray-50 dark:bg-gray-800 rounded-lg p-3' },
            React.createElement('p', { className: 'text-[10px] uppercase text-gray-400' }, t('driver', getLang())),
            React.createElement('p', { className: 'text-sm font-semibold text-gray-900 dark:text-gray-100 mt-0.5' }, dbStatus.driver)),
          React.createElement('div', { className: 'bg-gray-50 dark:bg-gray-800 rounded-lg p-3' },
            React.createElement('p', { className: 'text-[10px] uppercase text-gray-400' }, t('database size', getLang())),
            React.createElement('p', { className: 'text-sm font-semibold text-gray-900 dark:text-gray-100 mt-0.5' }, (dbStatus.size / 1048576).toFixed(2) + ' MB' + (dbStatus.walSize ? ' (+' + (dbStatus.walSize / 1048576).toFixed(2) + ' MB WAL)' : ''))),
          React.createElement('div', { className: 'bg-gray-50 dark:bg-gray-800 rounded-lg p-3' },
            React.createElement('p', { className: 'text-[10px] uppercase text-gray-400' }, t('journal mode', getLang())),
            React.createElement('p', { className: 'text-sm font-semibold text-gray-900 dark:text-gray-100 mt-0.5' }, dbStatus.journal)),
          React.createElement('div', { className: 'bg-gray-50 dark:bg-gray-800 rounded-lg p-3' },
            React.createElement('p', { className: 'text-[10px] uppercase text-gray-400' }, t('total rows', getLang())),
            React.createElement('p', { className: 'text-sm font-semibold text-gray-900 dark:text-gray-100 mt-0.5' }, dbStatus.totalRows + ' · ' + dbStatus.tables.length + ' ' + t('tables', getLang())))
        ),
        // Last maintenance info
        React.createElement('div', { className: 'text-xs text-gray-400 mb-4' },
          t('last optimized', getLang()) + ': ' + (dbStatus.lastOptimized ? new Date(dbStatus.lastOptimized).toLocaleString() : t('never', getLang())) +
          ' · ' + t('last backup', getLang()) + ': ' + (dbStatus.lastBackup ? new Date(dbStatus.lastBackup).toLocaleString() : t('never', getLang()))
        ),
        // Table sizes
        dbStatus.tables && React.createElement('div', { className: 'mb-4 max-h-40 overflow-y-auto rounded-lg border border-gray-100 dark:border-gray-700' },
          React.createElement('table', { className: 'w-full text-xs' },
            React.createElement('thead', null, React.createElement('tr', { className: 'bg-gray-50 dark:bg-gray-800 text-left text-gray-400' },
              React.createElement('th', { className: 'px-3 py-1.5 font-medium' }, t('table', getLang())),
              React.createElement('th', { className: 'px-3 py-1.5 font-medium text-right' }, t('rows', getLang())),
              React.createElement('th', { className: 'px-3 py-1.5 font-medium text-right' }, t('indexes', getLang()))
            )),
            React.createElement('tbody', null, dbStatus.tables.map((tb: any) =>
              React.createElement('tr', { key: tb.name, className: 'border-t border-gray-50 dark:border-gray-800' },
                React.createElement('td', { className: 'px-3 py-1.5 font-mono text-gray-700 dark:text-gray-200' }, tb.name),
                React.createElement('td', { className: 'px-3 py-1.5 text-right text-gray-500' }, tb.rows),
                React.createElement('td', { className: 'px-3 py-1.5 text-right text-gray-500' }, tb.indexes)
              )
            ))
          )
        ),
        dbCheck && React.createElement('div', { className: 'mb-4 text-xs ' + (dbCheck.ok ? 'text-green-600' : 'text-red-600') },
          dbCheck.ok ? t('integrity ok', getLang()) : t('integrity failed', getLang()) + ': ' + dbCheck.detail
        ),
        React.createElement('div', { className: 'flex flex-wrap gap-3' },
          React.createElement('button', { onClick: async () => { try { const r = await api.get('/db/optimize'); alert(r.data?.message || t('database optimized', getLang())); api.get('/db/status').then(x => setDbStatus(x.data)); } catch (e: any) { alert(e.response?.data?.error || t('optimize failed', getLang())); } }, className: 'btn-secondary text-sm' }, React.createElement(Download, { size: 14 }), t('optimize database', getLang())),
          React.createElement('button', { onClick: async () => { try { const r = await api.get('/db/integrity'); setDbCheck(r.data); } catch (e: any) { alert(e.response?.data?.error || t('check failed', getLang())); } }, className: 'btn-secondary text-sm' }, React.createElement(Download, { size: 14 }), t('integrity check', getLang())),
          React.createElement('a', { href: '/api/db/backup', className: 'btn-secondary text-sm', target: '_blank' }, React.createElement(Download, { size: 14 }), t('download db backup', getLang())),
          React.createElement('a', { href: '/api/db/backup-full', className: 'btn-secondary text-sm', target: '_blank' }, React.createElement(Download, { size: 14 }), t('full backup (json)', getLang())),
          React.createElement('button', { onClick: async () => { try { await api.post('/system/tasks/backup_database/run'); loadBackups(); alert(t('backup created', getLang())); } catch (e: any) { alert(e.response?.data?.error || t('backup failed', getLang())); } }, className: 'btn-secondary text-sm' }, React.createElement(Download, { size: 14 }), t('backup now', getLang())),
        ),
        // Retention + backup list
        React.createElement('div', { className: 'mt-4 pt-4 border-t border-gray-100 dark:border-gray-700' },
          React.createElement('div', { className: 'flex items-center gap-2 mb-3' },
            React.createElement('label', { className: 'text-xs text-gray-500' }, t('backup retention (files)', getLang())),
            React.createElement('input', { type: 'number', min: 1, max: 100, value: settings.backup_retention || '10', onChange: (e: React.ChangeEvent<HTMLInputElement>) => setSettings({ ...settings, backup_retention: e.target.value }), className: 'input-field w-20 text-sm' })
          ),
          dbBackups.length === 0
            ? React.createElement('p', { className: 'text-xs text-gray-400' }, t('no backups yet. run the backup task or create one manually.', getLang()))
            : React.createElement('div', { className: 'space-y-1 max-h-40 overflow-y-auto' },
                dbBackups.map((b: any) =>
                  React.createElement('div', { key: b.name, className: 'flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300' },
                    React.createElement('span', { className: 'flex-1 truncate font-mono' }, b.name),
                    React.createElement('span', { className: 'text-gray-400' }, b.sizeKB + ' KB'),
                    React.createElement('span', { className: 'text-gray-400' }, new Date(b.at).toLocaleDateString()),
                    React.createElement('a', { href: '/api/db/backups/' + encodeURIComponent(b.name), className: 'text-primary-600 hover:text-primary-700' }, t('download', getLang())),
                    React.createElement('button', { onClick: async () => { if (!confirm(t('delete this backup?', getLang()))) return; await api.delete('/db/backups/' + encodeURIComponent(b.name)); loadBackups(); }, className: 'text-red-500 hover:text-red-700' }, t('delete', getLang()))
                  )
                )
              )
        )
      ),
      React.createElement('div', { className: 'card p-6' },
        React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3' }, t('site health', getLang())),
        React.createElement('p', { className: 'text-sm text-gray-500 dark:text-gray-400 mb-4' }, t('check server and database health, plugin/theme status', getLang())),
        React.createElement('a', { href: '/admin/sysinfo', className: 'btn-secondary text-sm' }, t('run site health check', getLang()))
      ),
    )
  );
}
