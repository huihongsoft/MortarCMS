import React from 'react';
import { t, getLang } from '../lib/i18n';

interface State { error: Error | null }

// Top-level error boundary: a rendering error in any route must never blank
// the whole admin shell. It shows the error instead and offers a reload.
export default class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State { return { error }; }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error('[Admin] render error:', error, info);
  }

  render(): React.ReactNode {
    if (this.state.error) {
      return React.createElement('div', { className: 'min-h-screen flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-900' },
        React.createElement('div', { className: 'card max-w-lg w-full p-6 text-center' },
          React.createElement('h2', { className: 'text-lg font-semibold text-red-600 dark:text-red-400 mb-2' }, t('something went wrong', getLang())),
          React.createElement('p', { className: 'text-sm text-gray-600 dark:text-gray-300 mb-4 break-all' }, this.state.error.message || String(this.state.error)),
          React.createElement('button', { onClick: () => window.location.reload(), className: 'btn-primary text-sm' }, t('reload', getLang())),
        )
      );
    }
    return this.props.children;
  }
}
