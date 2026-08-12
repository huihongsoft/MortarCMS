import Header from './Header';
import Footer from './Footer';
import HomeLayout from './HomeLayout';
import CategoryLayout from './CategoryLayout';
import TagLayout from './TagLayout';
import ArchiveLayout from './ArchiveLayout';
import SearchLayout from './SearchLayout';
import AuthorLayout from './AuthorLayout';
import PostLayout from './PostLayout';
import PageLayout from './PageLayout';

// Aurora — a minimal, editorial theme inspired by modern product brands
// (Vercel / Linear / Apple): generous whitespace, large type, hairline
// borders, soft shadows and an indigo accent.
export default {
  name: 'aurora',
  typography: { cap: 1, max: 36 },
  Header, Footer, HomeLayout, CategoryLayout, TagLayout,
  ArchiveLayout, SearchLayout, AuthorLayout, PostLayout, PageLayout,
};
