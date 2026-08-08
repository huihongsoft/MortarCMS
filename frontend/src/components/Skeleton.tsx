import React from 'react';

// Animated skeleton placeholders for content loading states
export function ContentSkeleton() {
  return React.createElement('div', { className: 'max-w-3xl mx-auto px-4 py-8 animate-pulse' },
    React.createElement('div', { className: 'h-3 w-32 bg-gray-200 rounded mb-6' }),
    React.createElement('div', { className: 'h-8 w-3/4 bg-gray-200 rounded mb-4' }),
    React.createElement('div', { className: 'h-4 w-1/2 bg-gray-200 rounded mb-8' }),
    React.createElement('div', { className: 'h-64 bg-gray-200 rounded-lg mb-8' }),
    React.createElement('div', { className: 'space-y-3' },
      React.createElement('div', { className: 'h-4 bg-gray-200 rounded' }),
      React.createElement('div', { className: 'h-4 bg-gray-200 rounded' }),
      React.createElement('div', { className: 'h-4 w-2/3 bg-gray-200 rounded' }),
    ),
  );
}

export function ListSkeleton({ count = 5 }: { count?: number }) {
  return React.createElement('div', { className: 'max-w-3xl mx-auto px-4 py-8 space-y-6 animate-pulse' },
    Array.from({ length: count }, (_, i) =>
      React.createElement('div', { key: i, className: 'flex gap-4' },
        React.createElement('div', { className: 'w-24 h-24 bg-gray-200 rounded-lg flex-shrink-0' }),
        React.createElement('div', { className: 'flex-1 space-y-2 py-1' },
          React.createElement('div', { className: 'h-4 w-2/3 bg-gray-200 rounded' }),
          React.createElement('div', { className: 'h-3 w-full bg-gray-200 rounded' }),
          React.createElement('div', { className: 'h-3 w-1/2 bg-gray-200 rounded' }),
        ),
      )
    ),
  );
}
