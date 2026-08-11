import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './lib/auth';
import Layout from './components/Layout';
import PageLoader from './components/PageLoader';

const Login = React.lazy(() => import('./pages/Login'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Posts = React.lazy(() => import('./pages/Posts'));
const PostEditor = React.lazy(() => import('./pages/PostEditor'));
const Pages = React.lazy(() => import('./pages/Pages'));
const PageEditor = React.lazy(() => import('./pages/PageEditor'));
const Media = React.lazy(() => import('./pages/Media'));
const Menus = React.lazy(() => import('./pages/Menus'));
const MenuEditor = React.lazy(() => import('./pages/MenuEditor'));
const Comments = React.lazy(() => import('./pages/Comments'));
const Users = React.lazy(() => import('./pages/Users'));
const Appearance = React.lazy(() => import('./pages/Appearance'));
const SystemInfo = React.lazy(() => import('./pages/SystemInfo'));
const HooksBrowser = React.lazy(() => import('./pages/HooksBrowser'));
const ApiDocs = React.lazy(() => import('./pages/ApiDocs'));
const ActivityPage = React.lazy(() => import('./pages/Activity'));
const CustomTypes = React.lazy(() => import('./pages/CustomTypes'));
const Import = React.lazy(() => import('./pages/Import'));
const Plugins = React.lazy(() => import('./pages/Plugins'));
const Widgets = React.lazy(() => import('./pages/Widgets'));
const Settings = React.lazy(() => import('./pages/Settings'));
const Sites = React.lazy(() => import('./pages/Sites'));
const Categories = React.lazy(() => import('./pages/Categories'));
const Tags = React.lazy(() => import('./pages/Tags'));
const Links = React.lazy(() => import('./pages/Links'));
const Security = React.lazy(() => import('./pages/Security'));
const AIChat = React.lazy(() => import('./pages/AIChat'));
const AISettings = React.lazy(() => import('./pages/AISettings'));
const AIBindings = React.lazy(() => import('./pages/AIBindings'));
const Roles = React.lazy(() => import('./pages/Roles'));


















function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return React.createElement(PageLoader, { label: 'Checking session...' });
  if (!user) return React.createElement(Navigate, { to: '/login', replace: true });
  return React.createElement(React.Fragment, null, children);
}

function AnimatedRoutes() {
  const location = useLocation();
  return React.createElement(Routes, { location },
    React.createElement(Route, { path: '/login', element: React.createElement(Login) }),
    React.createElement(Route, { element: React.createElement(ProtectedRoute, null, React.createElement(Layout)) },
      React.createElement(Route, { path: '/', element: React.createElement(Dashboard) }),
      React.createElement(Route, { path: '/posts', element: React.createElement(Posts) }),
      React.createElement(Route, { path: '/posts/new', element: React.createElement(PostEditor) }),
      React.createElement(Route, { path: '/posts/:id/edit', element: React.createElement(PostEditor) }),
      React.createElement(Route, { path: '/pages', element: React.createElement(Pages) }),
      React.createElement(Route, { path: '/pages/new', element: React.createElement(PageEditor) }),
      React.createElement(Route, { path: '/pages/:id/edit', element: React.createElement(PageEditor) }),
      React.createElement(Route, { path: '/menus', element: React.createElement(Menus) }),
      React.createElement(Route, { path: '/menus/:id/edit', element: React.createElement(MenuEditor) }),
      React.createElement(Route, { path: '/media', element: React.createElement(Media) }),
      React.createElement(Route, { path: '/comments', element: React.createElement(Comments) }),
      React.createElement(Route, { path: '/users', element: React.createElement(Users) }),
      React.createElement(Route, { path: '/sysinfo', element: React.createElement(SystemInfo) }),
      React.createElement(Route, { path: '/hooks', element: React.createElement(HooksBrowser) }),
      React.createElement(Route, { path: '/api-docs', element: React.createElement(ApiDocs) }),
      React.createElement(Route, { path: '/activity', element: React.createElement(ActivityPage) }),
      React.createElement(Route, { path: '/import', element: React.createElement(Import) }),
      React.createElement(Route, { path: '/plugins', element: React.createElement(Plugins) }),
      React.createElement(Route, { path: '/sites', element: React.createElement(Sites) }),
      React.createElement(Route, { path: '/categories', element: React.createElement(Categories) }),
      React.createElement(Route, { path: '/tags', element: React.createElement(Tags) }),
      React.createElement(Route, { path: '/links', element: React.createElement(Links) }),
      React.createElement(Route, { path: '/security', element: React.createElement(Security) }),
      React.createElement(Route, { path: '/widgets', element: React.createElement(Widgets) }),
      React.createElement(Route, { path: '/appearance', element: React.createElement(Appearance) }),
      React.createElement(Route, { path: '/post-types', element: React.createElement(CustomTypes) }),
      React.createElement(Route, { path: '/settings', element: React.createElement(Settings) }),
      React.createElement(Route, { path: '/ai', element: React.createElement(AIChat) }),
      React.createElement(Route, { path: '/ai/bindings', element: React.createElement(AIBindings) }),
      React.createElement(Route, { path: '/ai/settings', element: React.createElement(AISettings) }),
      React.createElement(Route, { path: '/roles', element: React.createElement(Roles) }),
    ),
    React.createElement(Route, { path: '*', element: React.createElement(Navigate, { to: '/', replace: true }) })
  );
}

export default function App() {
  return React.createElement(Suspense, { fallback: React.createElement(PageLoader) },
    React.createElement(AnimatedRoutes, null));
}
