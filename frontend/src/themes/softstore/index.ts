import Header from './Header';
import Footer from './Footer';
import HomeLayout from './HomeLayout';
import PostLayout from './PostLayout';

// Softstore theme entry (bundled as themes/softstore.js at build time).
// Inspired by the classic software-download-site layout: hero carousel,
// category-tabbed software list with thumbnails, hot ranking sidebar.
export default {
  name: 'softstore',
  typography: { cap: 2, max: 26 },
  Header,
  Footer,
  HomeLayout,
  PostLayout,
};
