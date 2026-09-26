import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { t } from '../lib/i18n';
import { currentLang, contentLangs, defaultLang } from '../lib/contentLang';

// The language switcher.
//
// Which languages a *piece of content* exists in is knowledge only the content
// endpoint has (the slug differs per language — that is the point of translated
// URLs), so the page that fetched the content publishes the list here and the
// switcher renders it. Content with no translations renders nothing, which is
// every page on a single-language site.

export interface LangAlternate { lang: string; path: string }

interface Alternates { list: LangAlternate[]; publish: (list: LangAlternate[]) => void }

const AlternatesContext = createContext<Alternates>({ list: [], publish: () => {} });

/**
 * Publish this content's other languages. Pass the API's `translations` array, or
 * nothing for content that has none.
 */
export function useContentAlternates(list?: LangAlternate[] | null): void {
  const { publish } = useContext(AlternatesContext);
  // Keyed by value, not identity: the array is rebuilt on every render, and
  // republishing it each time would re-render the switcher on every keystroke
  // elsewhere on the page.
  const key = JSON.stringify(list || []);
  useEffect(() => { publish(key === '[]' ? [] : JSON.parse(key)); }, [key, publish]);
  // A page that stays mounted across a route change (same route, new slug) would
  // otherwise keep showing the previous post's languages.
  useEffect(() => () => publish([]), [publish, key]);
}

// Language names are shown in their own language, as a language switcher is
// conventionally read; a tag with no name here falls back to its own uppercase
// code, which is at least not wrong in any language.
const NAMES: Record<string, string> = {
  zh: '中文', 'zh-cn': '中文', 'zh-tw': '繁體中文', en: 'English', ja: '日本語',
  ko: '한국어', fr: 'Français', de: 'Deutsch', es: 'Español', ru: 'Русский',
  pt: 'Português', it: 'Italiano', ar: 'العربية', nl: 'Nederlands',
};

const label = (lang: string): string => NAMES[lang] || lang.toUpperCase();

/** Holds the published alternates for the page currently rendered. */
export function AlternatesProvider({ children }: { children: React.ReactNode }) {
  const [list, setList] = useState<LangAlternate[]>([]);
  // Subscribing to the location keeps the highlighted language in step with the
  // address bar; without it a client-side language switch would leave the old
  // entry marked as current.
  useLocation();
  const value = useMemo(() => ({ list, publish: setList }), [list]);
  return React.createElement(AlternatesContext.Provider, { value }, children);
}

/** The switcher itself. Rendered by the layout, below the content it translates. */
export function AlternateLinks({ settings }: { settings: Record<string, string> }) {
  const { list } = useContext(AlternatesContext);
  if (list.length < 2) return null;
  const active = currentLang();
  // Languages this site publishes that this content has no version of are shown
  // too, greyed and unlinked: the reader can see the site is translated without
  // being sent to a page that does not exist.
  const missing = contentLangs().filter((l) => l !== defaultLang() && !list.some((a) => a.lang === l));
  return React.createElement('nav', { className: 'max-w-3xl mx-auto px-4 py-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm', 'aria-label': t('language', settings) },
    React.createElement('span', { className: 'text-gray-400' }, t('language', settings)),
    list.map((a) => a.lang === active
      ? React.createElement('span', { key: a.lang, className: 'font-medium text-gray-900 dark:text-gray-100', 'aria-current': 'true' }, label(a.lang))
      : React.createElement(Link, { key: a.lang, to: a.path, className: 'text-primary-600 hover:underline' }, label(a.lang))),
    missing.map((l) => React.createElement('span', { key: l, className: 'text-gray-300 dark:text-gray-600', title: t('not translated yet', settings) }, label(l)))
  );
}
