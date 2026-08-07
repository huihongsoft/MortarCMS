// Theme registry (WordPress-style template system).
// Each theme provides layout components: Header, Footer, HomeLayout, PostLayout, PageLayout.
// Missing layouts fall back to the default theme, so themes can be partial.

import DefaultHeader from './default/Header';
import DefaultFooter from './default/Footer';
import DefaultHomeLayout from './default/HomeLayout';
import DefaultCategoryLayout from './default/CategoryLayout';
import DefaultTagLayout from './default/TagLayout';
import DefaultPostLayout from './default/PostLayout';
import DefaultPageLayout from './default/PageLayout';
import DefaultArchiveLayout from './default/ArchiveLayout';
import DefaultSearchLayout from './default/SearchLayout';
import DefaultAuthorLayout from './default/AuthorLayout';

import MagazineHeader from './magazine/Header';
import MagazineFooter from './magazine/Footer';
import MagazineHomeLayout from './magazine/HomeLayout';

export interface Theme {
  name: string;
  Header: React.ComponentType<any>;
  Footer: React.ComponentType<any>;
  HomeLayout: React.ComponentType<any>;
  PostLayout: React.ComponentType<any>;
  PageLayout: React.ComponentType<any>;
  ArchiveLayout: React.ComponentType<any>;
  SearchLayout: React.ComponentType<any>;
  AuthorLayout: React.ComponentType<any>;
  CategoryLayout: React.ComponentType<any>;
  TagLayout: React.ComponentType<any>;
}

const themes: Record<string, Partial<Theme>> = {
  default: {
    name: 'default',
    Header: DefaultHeader,
    Footer: DefaultFooter,
    HomeLayout: DefaultHomeLayout,
    PostLayout: DefaultPostLayout,
    PageLayout: DefaultPageLayout,
    ArchiveLayout: DefaultArchiveLayout,
    SearchLayout: DefaultSearchLayout,
    AuthorLayout: DefaultAuthorLayout,
    CategoryLayout: DefaultCategoryLayout,
    TagLayout: DefaultTagLayout,
  },
  magazine: {
    name: 'magazine',
    Header: MagazineHeader,
    Footer: MagazineFooter,
    HomeLayout: MagazineHomeLayout,
  },
};

// Resolve a theme with fallback to default for any missing layout
export function getTheme(name?: string): Theme {
  const t = themes[name || 'default'] || themes.default;
  const base = themes.default as Theme;
  return {
    name: t.name || base.name,
    Header: t.Header || base.Header,
    Footer: t.Footer || base.Footer,
    HomeLayout: t.HomeLayout || base.HomeLayout,
    PostLayout: t.PostLayout || base.PostLayout,
    PageLayout: t.PageLayout || base.PageLayout,
    ArchiveLayout: t.ArchiveLayout || base.ArchiveLayout,
    SearchLayout: t.SearchLayout || base.SearchLayout,
    AuthorLayout: t.AuthorLayout || base.AuthorLayout,
    CategoryLayout: t.CategoryLayout || base.CategoryLayout,
    TagLayout: t.TagLayout || base.TagLayout,
  };
}

export { themes };
