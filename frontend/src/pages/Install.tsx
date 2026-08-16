import React, { useEffect, useState } from 'react';
import { Database, HardDrive, Server, Globe, User, ArrowRight, ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';
import api from '../lib/api';
import useSEO from '../hooks/useSEO';
import { t } from '../lib/i18n';

export default function Install() {
  useSEO({ title: t('install mortar'), url: '/install', noindex: true });
  const [step, setStep] = useState(1);
  const [dbType, setDbType] = useState('sqlite');
  const [dbConfig, setDbConfig] = useState({ host: 'localhost', port: '3306', user: 'root', password: '', database: 'mortar' });
  const [site, setSite] = useState({ siteTitle: '', siteDescription: '', adminUsername: 'admin', adminEmail: '', adminPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [sampleData, setSampleData] = useState(true);
  // null = not requested, 'ok' / 'failed' = import result
  const [demoResult, setDemoResult] = useState<null | 'ok' | 'failed'>(null);

  useEffect(() => {
    // If already installed, bounce to the home page
    api.get('/install/status').then(r => { if (r.data.installed) window.location.href = '/'; }).catch(() => {});
  }, []);

  async function submit() {
    setError(''); setLoading(true);
    try {
      const r = await api.post('/install', {
        dbType, dbConfig: dbType === 'sqlite' ? undefined : dbConfig,
        siteTitle: site.siteTitle, siteDescription: site.siteDescription,
        adminEmail: site.adminEmail, adminPassword: site.adminPassword, adminUsername: site.adminUsername,
        sampleData,
      });
      setDemoResult(r.data?.demo?.ok ? 'ok' : 'failed');
      setDone(true);
      setTimeout(() => { window.location.href = '/admin'; }, 1500);
    } catch (e: any) {
      setError(e.response?.data?.error || t('installation failed'));
      setLoading(false);
    }
  }

  const dbOptions = [
    { key: 'sqlite', name: 'SQLite', desc: t('zero configuration, single file. best for small to medium sites.'), icon: HardDrive },
    { key: 'mysql', name: 'MySQL / MariaDB', desc: t('classic choice, widely hosted.'), icon: Database },
    { key: 'postgres', name: 'PostgreSQL', desc: t('modern, feature-rich relational database.'), icon: Server },
  ];

  if (done) return React.createElement('div', { className: 'min-h-screen flex items-center justify-center bg-gray-50' },
    React.createElement('div', { className: 'text-center' },
      React.createElement(CheckCircle2, { size: 56, className: 'mx-auto mb-4 text-green-500' }),
      React.createElement('h1', { className: 'text-2xl font-bold text-gray-900 mb-2' }, t('mortar installed')),
      React.createElement('p', { className: 'text-gray-500' }, t('redirecting to the admin panel')),
      demoResult === 'ok' && React.createElement('p', { className: 'text-sm text-green-600 mt-3' }, t('sample data imported')),
      demoResult === 'failed' && React.createElement('p', { className: 'text-sm text-amber-600 mt-3' }, t('sample data import failed')),
    ));

  return React.createElement('div', { className: 'min-h-screen bg-gray-50 flex items-center justify-center p-4' },
    React.createElement('div', { className: 'w-full max-w-xl' },
      React.createElement('div', { className: 'text-center mb-8' },
        React.createElement('div', { className: 'w-14 h-14 mx-auto mb-3 rounded-2xl bg-primary-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg' }, 'M'),
        React.createElement('h1', { className: 'text-3xl font-bold text-gray-900' }, t('install mortar')),
        React.createElement('p', { className: 'text-gray-500 mt-1' }, t('welcome! let us set up your new site — it only takes a minute.'))
      ),
      // Step indicator
      React.createElement('div', { className: 'flex items-center justify-center gap-2 mb-6' },
        [1, 2].map(i => React.createElement('div', { key: i, className: 'flex items-center gap-2' },
          React.createElement('div', { className: 'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ' + (step >= i ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500') }, i),
          i === 1 && React.createElement('div', { className: 'w-12 h-0.5 ' + (step >= 2 ? 'bg-primary-600' : 'bg-gray-200') })
        ))
      ),
      React.createElement('div', { className: 'card p-8' },
        error && React.createElement('div', { className: 'p-3 mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg' }, error),
        step === 1 && React.createElement(React.Fragment, null,
          React.createElement('h2', { className: 'text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2' }, React.createElement(Database, { size: 18 }), t('choose your database')),
          React.createElement('div', { className: 'space-y-3' },
            dbOptions.map(o =>
              React.createElement('button', {
                key: o.key, onClick: () => { setDbType(o.key); if (o.key !== 'sqlite') setDbConfig({ ...dbConfig, port: o.key === 'mysql' ? '3306' : '5432' }); },
                className: 'w-full text-left p-4 rounded-xl border-2 transition-all ' + (dbType === o.key ? 'border-primary-500 bg-primary-50/50 shadow-sm' : 'border-gray-200 hover:border-gray-300'),
              },
                React.createElement('div', { className: 'flex items-center gap-3' },
                  React.createElement(o.icon, { size: 20, className: dbType === o.key ? 'text-primary-600' : 'text-gray-400' }),
                  React.createElement('div', { className: 'flex-1' },
                    React.createElement('p', { className: 'font-medium text-gray-900' }, o.name),
                    React.createElement('p', { className: 'text-xs text-gray-500' }, o.desc)
                  ),
                  dbType === o.key && React.createElement(CheckCircle2, { size: 18, className: 'text-primary-600' })
                )
              )
            )
          ),
          dbType !== 'sqlite' && React.createElement('div', { className: 'grid grid-cols-2 gap-3 mt-4' },
            React.createElement('div', null, React.createElement('label', { className: 'block text-xs font-medium text-gray-600 mb-1' }, t('host')), React.createElement('input', { value: dbConfig.host, onChange: e => setDbConfig({ ...dbConfig, host: e.target.value }), className: 'input-field' })),
            React.createElement('div', null, React.createElement('label', { className: 'block text-xs font-medium text-gray-600 mb-1' }, t('port')), React.createElement('input', { value: dbConfig.port, onChange: e => setDbConfig({ ...dbConfig, port: e.target.value }), className: 'input-field' })),
            React.createElement('div', null, React.createElement('label', { className: 'block text-xs font-medium text-gray-600 mb-1' }, t('user')), React.createElement('input', { value: dbConfig.user, onChange: e => setDbConfig({ ...dbConfig, user: e.target.value }), className: 'input-field' })),
            React.createElement('div', null, React.createElement('label', { className: 'block text-xs font-medium text-gray-600 mb-1' }, t('password')), React.createElement('input', { type: 'password', value: dbConfig.password, onChange: e => setDbConfig({ ...dbConfig, password: e.target.value }), className: 'input-field' })),
            React.createElement('div', { className: 'col-span-2' }, React.createElement('label', { className: 'block text-xs font-medium text-gray-600 mb-1' }, t('database name')), React.createElement('input', { value: dbConfig.database, onChange: e => setDbConfig({ ...dbConfig, database: e.target.value }), className: 'input-field' })),
          ),
          React.createElement('button', { onClick: () => setStep(2), className: 'btn-primary w-full justify-center mt-6' }, t('continue'), React.createElement(ArrowRight, { size: 16 })),
        ),
        step === 2 && React.createElement(React.Fragment, null,
          React.createElement('h2', { className: 'text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2' }, React.createElement(Globe, { size: 18 }), t('site information')),
          React.createElement('div', { className: 'space-y-3' },
            React.createElement('div', null, React.createElement('label', { className: 'block text-xs font-medium text-gray-600 mb-1' }, t('site title') + ' *'), React.createElement('input', { value: site.siteTitle, onChange: e => setSite({ ...site, siteTitle: e.target.value }), className: 'input-field', placeholder: t('my mortar site') })),
            React.createElement('div', null, React.createElement('label', { className: 'block text-xs font-medium text-gray-600 mb-1' }, t('site description')), React.createElement('input', { value: site.siteDescription, onChange: e => setSite({ ...site, siteDescription: e.target.value }), className: 'input-field', placeholder: t('a short tagline') })),
            React.createElement('div', { className: 'border-t border-gray-100 pt-3' },
              React.createElement('p', { className: 'text-xs font-semibold text-gray-500 mb-3 flex items-center gap-1' }, React.createElement(User, { size: 12 }), t('admin account')),
              React.createElement('div', { className: 'grid grid-cols-2 gap-3' },
                React.createElement('div', null, React.createElement('label', { className: 'block text-xs font-medium text-gray-600 mb-1' }, t('username')), React.createElement('input', { value: site.adminUsername, onChange: e => setSite({ ...site, adminUsername: e.target.value }), className: 'input-field' })),
                React.createElement('div', null, React.createElement('label', { className: 'block text-xs font-medium text-gray-600 mb-1' }, t('email') + ' *'), React.createElement('input', { type: 'email', value: site.adminEmail, onChange: e => setSite({ ...site, adminEmail: e.target.value }), className: 'input-field' })),
                React.createElement('div', { className: 'col-span-2' }, React.createElement('label', { className: 'block text-xs font-medium text-gray-600 mb-1' }, t('password (min 8 chars)') + ' *'), React.createElement('input', { type: 'password', value: site.adminPassword, onChange: e => setSite({ ...site, adminPassword: e.target.value }), className: 'input-field' })),
              )
            )
          ),
          React.createElement('label', { className: 'flex items-center gap-2.5 mt-5 p-3.5 rounded-xl border border-gray-200 hover:border-primary-300 cursor-pointer transition-colors' },
            React.createElement('input', { type: 'checkbox', checked: sampleData, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setSampleData(e.target.checked), className: 'w-4 h-4 rounded border-gray-300 text-primary-600' }),
            React.createElement('div', null,
              React.createElement('p', { className: 'text-sm font-medium text-gray-800' }, t('import sample data')),
              React.createElement('p', { className: 'text-xs text-gray-400 mt-0.5' }, t('sample posts, categories and a theme demo to explore the site'))
            )
          ),
          React.createElement('div', { className: 'flex gap-3 mt-6' },
            React.createElement('button', { onClick: () => setStep(1), className: 'btn-secondary flex-1 justify-center' }, React.createElement(ArrowLeft, { size: 16 }), t('back')),
            React.createElement('button', { onClick: submit, disabled: loading || !site.siteTitle || !site.adminEmail || site.adminPassword.length < 8, className: 'btn-primary flex-1 justify-center' },
              loading ? React.createElement(Loader2, { size: 16, className: 'animate-spin' }) : React.createElement(CheckCircle2, { size: 16 }), loading ? t('installing') + '...' : t('install mortar')),
          ),
        )
      ),
      React.createElement('p', { className: 'text-center text-xs text-gray-400 mt-6' }, t('the database choice is saved and used on every restart. you can switch databases at any time by re-running the installer.'))
    )
  );
}
