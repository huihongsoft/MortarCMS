import Header from './Header';
import Footer from './Footer';
import HomeLayout from './HomeLayout';
import PostLayout from './PostLayout';
import ArchiveView from './ArchiveLayout';
import NotFoundLayout from './NotFoundLayout';
import PageLayout from './PageLayout';
import { BackToTop } from './Shared';

// Softstore theme entry (bundled as themes/softstore.js at build time).
// Inspired by the classic software-download-site layout: hero carousel,
// category-tabbed software list with hot ranking sidebar, plus the reference's
// archive pages (card list + widget sidebar) for every listing route.
//
// Pages the reference has no equivalent for (date archive, author, search) get
// the same archive layout with a heading, which is where the query/page context
// would otherwise be invisible.
// Every listing route hands its layout a different set of props, so each wrapper
// forwards what its page actually provides (including loading/error, otherwise a
// cold load paints "no posts yet" instead of a spinner).
const listProps = (p: any) => ({
  settings: p.settings,
  posts: p.posts || [],
  total: p.total || 0,
  page: p.page || 1,
  setPage: p.setPage,
  categories: p.categories || [],
  loading: p.loading,
  // Home passes `loadError`; Archive/Author/Search pass `error`.
  error: p.error ?? p.loadError,
});

const CategoryLayout = (p: any) => ArchiveView(listProps(p));
const TagLayout = (p: any) => ArchiveView(listProps(p));
// Archive/Author/Search own their state on the page side (page/total/setPage)
// now that they paginate; the heading differs per route.
const ArchiveLayout = (p: any) => ArchiveView({
  settings: p.settings,
  posts: p.data?.posts || [],
  total: p.data?.total || 0,
  page: p.data?.page || 1,
  setPage: undefined,          // the page hands over a ready-made pager instead
  pagination: p.pagination,
  error: p.data?.error,
  heading: p.year && p.month ? p.year + '-' + String(p.month).padStart(2, '0') : (p.year || null),
});
const AuthorLayout = (p: any) => ArchiveView({ settings: p.settings, posts: p.posts || [], total: p.total, page: p.page, pagination: p.pagination, loading: p.loading, error: p.error, heading: p.author?.username || p.username, author: p.author });
const SearchLayout = (p: any) => ArchiveView({ settings: p.settings, posts: p.posts || [], total: p.total, page: p.page, pagination: p.pagination, loading: p.loading, error: p.error, heading: p.query });

export default {
  name: 'softstore',
  typography: { cap: 2, max: 24 },
  Header,
  Footer,
  HomeLayout,
  PostLayout,
  CategoryLayout,
  TagLayout,
  ArchiveLayout,
  NotFoundLayout,
  AuthorLayout,
  SearchLayout,
  PageLayout,
  // Owns the corner instead of the app's plain button (see themes/index.tsx).
  BackToTop,
};
