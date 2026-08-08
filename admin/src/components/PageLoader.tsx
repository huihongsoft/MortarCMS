import React from 'react';

// Branded full-page loading state (Suspense fallback / auth check)
export default function PageLoader({ label }: { label?: string }) {
  return React.createElement('div', {
    className: 'fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900',
  },
    React.createElement('div', { className: 'relative mb-6' },
      // Pulsing logo mark
      React.createElement('div', {
        className: 'w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25',
      },
        React.createElement('span', { className: 'text-white font-black text-2xl select-none' }, 'M'),
      ),
      // Orbit ring
      React.createElement('div', {
        className: 'absolute -inset-2 rounded-3xl border-2 border-transparent border-t-blue-500 border-r-blue-300 animate-spin',
        style: { animationDuration: '1.2s' },
      }),
    ),
    React.createElement('div', { className: 'h-1 w-32 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden' },
      React.createElement('div', {
        className: 'h-full w-1/3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 animate-loading-bar',
      }),
    ),
    label && React.createElement('p', { className: 'mt-3 text-xs text-gray-400' }, label),
  );
}
