import { listHomeLayout } from '../shared/listHome';

// Twenty Seventeen homepage: a flat, divided list with a right sidebar. The
// structure is shared with twentytwentyone (see themes/shared/listHome.tsx);
// these are the tokens that make it this theme.
export default listHomeLayout({
  pagePadding: 'py-10',
  listGap: 'space-y-10',
  bannerTitle: 'text-3xl font-normal text-gray-900 capitalize',
  article: 'pb-8 border-b border-gray-200',
  image: 'w-full h-56 object-cover mb-6',
  category: 'text-gray-500',
  title: 'text-2xl font-normal text-gray-900 hover:text-gray-600 mb-3',
  excerpt: 'text-gray-600 text-sm leading-relaxed mb-4',
  readMore: 'text-sm font-medium text-gray-900 border-b border-gray-900 pb-0.5 hover:text-gray-600',
});
