import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './lib/auth';
import Layout from './components/Layout';
import PageLoader from './components/PageLoader';

const Login = React.lazy(() => import('./pages/Login'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const StatsPage = React.lazy(() => import('./pages/Stats'));
const HomeEditor = React.lazy(() => import('./pages/HomeEditor'));
const Posts = React.lazy(() => import('./pages/Posts'));
const PostEditor = React.lazy(() => import('./pages/PostEditor'));
const Pages = React.lazy(() => import('./pages/Pages'));
const PageEditor = React.lazy(() => import('./pages/PageEditor'));
const Media = React.lazy(() => import('./pages/Media'));
const Menus = React.lazy(() => import('./pages/Menus'));
const MenuEditor = React.lazy(() => import('./pages/MenuEditor'));
const Comments = React.lazy(() => import('./pages/Comments'));
const Users = React.lazy(() => import('./pages/Users'));
const Profile = React.lazy(() => import('./pages/Profile'));
import { Guarded } from './components/NoAccess';
import { canOpen, firstAllowedPath } from './lib/access';
const PluginPage = React.lazy(() => import('./pages/PluginPage'));
const Appearance = React.lazy(() => import('./pages/Appearance'));
const SystemInfo = React.lazy(() => import('./pages/SystemInfo'));
const HooksBrowser = React.lazy(() => import('./pages/HooksBrowser'));
const ApiDocs = React.lazy(() => import('./pages/ApiDocs'));
const ActivityPage = React.lazy(() => import('./pages/Activity'));
const LoginAudit = React.lazy(() => import('./pages/LoginAudit'));
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
const Webhooks = React.lazy(() => import('./pages/Webhooks'));
const Forms = React.lazy(() => import('./pages/Forms'));
const FormSubmissions = React.lazy(() => import('./pages/FormSubmissions'));
const Subscribers = React.lazy(() => import('./pages/Subscribers'));
const Calendar = React.lazy(() => import('./pages/Calendar'));
const BrokenLinks = React.lazy(() => import('./pages/BrokenLinks'));


















function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return React.createElement(PageLoader, { label: 'Checking session...' });
  if (!user) return React.createElement(Navigate, { to: '/login', replace: true });
  return React.createElement(React.Fragment, null, children);
}


// Landing route: the dashboard is stats-driven (manage_options), so an account
// without it is sent to the first screen it can actually use instead of being
// shown a page it cannot load.
function HomeRoute() {
  const { user, can } = useAuth();
  if (!canOpen(user, can, '/')) {
    return React.createElement(Navigate, { to: firstAllowedPath(user, can), replace: true });
  }
  return React.createElement(Dashboard);
}

function AnimatedRoutes() {
  const location = useLocation();
  // `screen()` is the only way a route is declared: the access rule for its path
  // comes from lib/access, so a new screen cannot ship without a rule and the
  // sidebar/guard/buttons cannot drift apart.
  const screen = (path: string, el: React.ReactNode) =>
    React.createElement(Route, { key: path, path, element: React.createElement(Guarded, { path, children: el }) });
  return React.createElement(Routes, { location },
    React.createElement(Route, { path: '/login', element: React.createElement(Login) }),
    React.createElement(Route, { element: React.createElement(ProtectedRoute, null, React.createElement(Layout)) },
      // Not `screen()`: HomeRoute redirects an account that cannot use the
      // dashboard instead of showing it a "no permission" page on login.
      React.createElement(Route, { path: '/', element: React.createElement(HomeRoute) }),
      screen('/stats', React.createElement(StatsPage)),
      screen('/home-editor', React.createElement(HomeEditor)),
      screen('/posts', React.createElement(Posts)),
      screen('/calendar', React.createElement(Calendar)),
      screen('/broken-links', React.createElement(BrokenLinks)),
      screen('/posts/new', React.createElement(PostEditor)),
      screen('/posts/:id/edit', React.createElement(PostEditor)),
      screen('/pages', React.createElement(Pages)),
      screen('/pages/new', React.createElement(PageEditor)),
      screen('/pages/:id/edit', React.createElement(PageEditor)),
      screen('/menus', React.createElement(Menus)),
      screen('/menus/:id/edit', React.createElement(MenuEditor)),
      screen('/media', React.createElement(Media)),
      screen('/comments', React.createElement(Comments)),
      screen('/users', React.createElement(Users)),
      screen('/profile', React.createElement(Profile)),
      screen('/sysinfo', React.createElement(SystemInfo)),
      screen('/hooks', React.createElement(HooksBrowser)),
      screen('/api-docs', React.createElement(ApiDocs)),
      screen('/activity', React.createElement(ActivityPage)),
      screen('/import', React.createElement(Import)),
      screen('/plugins', React.createElement(Plugins)),
      // Screens registered by plugins (see server/src/utils/pluginApi.ts)
      screen('/plugin/:plugin/:page', React.createElement(PluginPage)),
      screen('/sites', React.createElement(Sites)),
      screen('/categories', React.createElement(Categories)),
      screen('/tags', React.createElement(Tags)),
      screen('/links', React.createElement(Links)),
      screen('/security', React.createElement(Security)),
      screen('/login-audit', React.createElement(LoginAudit)),
      screen('/widgets', React.createElement(Widgets)),
      screen('/appearance', React.createElement(Appearance)),
      screen('/post-types', React.createElement(CustomTypes)),
      screen('/settings', React.createElement(Settings)),
      screen('/ai', React.createElement(AIChat)),
      screen('/ai/bindings', React.createElement(AIBindings)),
      screen('/ai/settings', React.createElement(AISettings)),
      screen('/roles', React.createElement(Roles)),
      screen('/webhooks', React.createElement(Webhooks)),
      screen('/forms', React.createElement(Forms)),
      screen('/forms/:id/submissions', React.createElement(FormSubmissions)),
      screen('/subscribers', React.createElement(Subscribers)),
    ),
    React.createElement(Route, { path: '*', element: React.createElement(Navigate, { to: '/', replace: true }) })
  );
}
export default function App() {
  return React.createElement(Suspense, { fallback: React.createElement(PageLoader) },
    React.createElement(AnimatedRoutes, null));
}
