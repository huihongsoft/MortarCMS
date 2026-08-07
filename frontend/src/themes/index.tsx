// Runtime theme loader (self-contained themes: one directory = config + layouts).
// The default theme is bundled with the app (no flash); other themes are
// dynamically imported from /themes/<name>/theme.js (served by the server).
import React, { createContext, useContext, useEffect, useState } from 'react';
import DefaultHeader from './default/Header';
import DefaultFooter from './default/Footer';
import DefaultHomeLayout from './default/HomeLayout';
import DefaultCategoryLayout from './default/CategoryLayout';
import DefaultTagLayout from './default/TagLayout';
import DefaultArchiveLayout from './default/ArchiveLayout';
import DefaultSearchLayout from './default/SearchLayout';
import DefaultAuthorLayout from './default/AuthorLayout';
import DefaultPostLayout from './default/PostLayout';
import DefaultPageLayout from './default/PageLayout';

export interface Theme {
  name: string;
  Header: React.ComponentType<any>;
  Footer: React.ComponentType<any>;
  HomeLayout: React.ComponentType<any>;
  CategoryLayout: React.ComponentType<any>;
  TagLayout: React.ComponentType<any>;
  ArchiveLayout: React.ComponentType<any>;
  SearchLayout: React.ComponentType<any>;
  AuthorLayout: React.ComponentType<any>;
  PostLayout: React.ComponentType<any>;
  PageLayout: React.ComponentType<any>;
}

export const defaultTheme: Theme = {
  name: 'default',
  Header: DefaultHeader,
  Footer: DefaultFooter,
  HomeLayout: DefaultHomeLayout,
  CategoryLayout: DefaultCategoryLayout,
  TagLayout: DefaultTagLayout,
  ArchiveLayout: DefaultArchiveLayout,
  SearchLayout: DefaultSearchLayout,
  AuthorLayout: DefaultAuthorLayout,
  PostLayout: DefaultPostLayout,
  PageLayout: DefaultPageLayout,
};

// Merge partial remote themes over the defaults
function mergeTheme(name: string, mod: any): Theme {
  const t = mod?.default || mod || {};
  return {
    name: t.name || name,
    Header: t.Header || defaultTheme.Header,
    Footer: t.Footer || defaultTheme.Footer,
    HomeLayout: t.HomeLayout || defaultTheme.HomeLayout,
    CategoryLayout: t.CategoryLayout || defaultTheme.CategoryLayout,
    TagLayout: t.TagLayout || defaultTheme.TagLayout,
    ArchiveLayout: t.ArchiveLayout || defaultTheme.ArchiveLayout,
    SearchLayout: t.SearchLayout || defaultTheme.SearchLayout,
    AuthorLayout: t.AuthorLayout || defaultTheme.AuthorLayout,
    PostLayout: t.PostLayout || defaultTheme.PostLayout,
    PageLayout: t.PageLayout || defaultTheme.PageLayout,
  };
}

const cache: Record<string, Theme> = { default: defaultTheme };
const loading: Record<string, Promise<Theme>> = {};

export function loadTheme(name?: string): Promise<Theme> {
  const key = name || 'default';
  if (cache[key]) return Promise.resolve(cache[key]);
  const pending = loading[key];
  if (pending !== undefined) return pending;
  loading[key] = import(/* @vite-ignore */ '/themes/' + key + '/theme.js')
    .then((mod) => {
      const theme = mergeTheme(key, mod);
      cache[key] = theme;
      return theme;
    })
    .catch((e) => {
      console.warn('[Theme] Failed to load "' + key + '", falling back to default:', e);
      cache[key] = defaultTheme;
      return defaultTheme;
    });
  return loading[key];
}

// ---- Theme context (asynchronous, defaults to the default theme) ----
const ThemeContext = createContext<Theme>(defaultTheme);

export function ThemeProvider({ themeName, children }: { themeName?: string; children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);

  useEffect(() => {
    let cancelled = false;
    loadTheme(themeName).then((t) => { if (!cancelled) setTheme(t); });
    return () => { cancelled = true; };
  }, [themeName]);

  return React.createElement(ThemeContext.Provider, { value: theme }, children);
}

export function useTheme(): Theme {
  return useContext(ThemeContext);
}

// Backwards-compatible sync helper for places that render immediately (default theme)
export function getTheme(_name?: string): Theme {
  return defaultTheme;
}
