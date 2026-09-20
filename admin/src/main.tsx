import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './lib/auth';
import { ToastProvider } from './lib/toast';
import { DialogHost } from './lib/dialog';
import ErrorBoundary from './components/ErrorBoundary';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  React.createElement(React.StrictMode, null,
    React.createElement(ErrorBoundary, null,
      React.createElement(BrowserRouter, { basename: '/admin' },
        React.createElement(ToastProvider, null, React.createElement(AuthProvider, null,
          React.createElement(React.Fragment, null, React.createElement(App), React.createElement(DialogHost))))
      )
    )
  )
);
