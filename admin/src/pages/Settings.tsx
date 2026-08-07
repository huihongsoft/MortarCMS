import React, { useEffect, useState } from 'react';
import { Save, Download, Upload, Mail, ShieldCheck, Wrench, Settings2, FileJson } from 'lucide-react';
import api from '../lib/api';
import { t, getLang } from '../lib/i18n';

type TabKey = 'general' | 'reading' | 'discussion' | 'smtp' | 'maintenance' | 'tools';

export default function Settings() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState<TabKey>('general');
  useEffect(() => { api.get('/settings').then(r => setSettings(r.data)); }, []);

  async function saveSettings() { await api.put('/settings', settings); setSaved(true); setTimeout(() => setSaved(false), 2000); }

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
    { key: 'smtp', label: t('email / smtp', getLang()), icon: Mail },
    { key: 'maintenance', label: t('maintenance mode', getLang()), icon: Wrench },
    { key: 'tools', label: t('tools', getLang()), icon: Download },
  ];

  return React.createElement('div', null,
    // Header with sticky save
    React.createElement('div', { className: 'sticky top-12 z-30 bg-gray-50/90 dark:bg-gray-900/90 backdrop-blur-md py-4 mb-6 flex items-center justify-between' },
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
      )
    ),
    tab === 'reading' && React.createElement('div', { className: 'card p-6' },
      React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4' },
        field('posts_per_page', t('posts per page', getLang()), 'number'),
        field('permalink_structure', t('permalink structure (/post/%slug%)', getLang())),
        field('default_role', t('default user role', getLang())),
      )
    ),
    tab === 'discussion' && React.createElement('div', { className: 'card p-6' },
      React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4' },
        field('comment_moderation', t('comment moderation (1/0)', getLang())),
        field('default_comment_status', t('default comment status', getLang())),
      )
    ),
    tab === 'smtp' && React.createElement('div', { className: 'card p-6' },
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
      )
    ),
    tab === 'maintenance' && React.createElement('div', { className: 'card p-6' },
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
    tab === 'tools' && React.createElement('div', { className: 'card p-6' },
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
              await api.post('/export/import', data);
              alert(t('import successful!', getLang()));
            } catch { alert(t('import failed. check file format.', getLang())); }
          };
          input.click();
        }, className: 'btn-secondary text-sm' }, React.createElement(Upload, { size: 14 }), t('import json', getLang()))
      ),
      React.createElement('p', { className: 'text-xs text-gray-400 dark:text-gray-500 mt-4' }, t('full backup & restore', getLang()) + ' → ' + t('system info', getLang()))
    )
  );
}
