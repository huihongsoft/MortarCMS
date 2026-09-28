import { listHomeLayout } from '../shared/listHome';

// Twenty Twenty-One homepage: the same list as twentyseventeen, as rounded cards
// with an orange accent, and with the archive list in the sidebar.
export default listHomeLayout({
  pagePadding: 'py-12',
  listGap: 'space-y-8',
  bannerExtra: 'border-b border-gray-200',
  bannerTitle: 'text-3xl font-bold text-gray-900 capitalize',
  article: 'bg-white rounded-3xl border border-gray-100 shadow-sm p-8 hover:shadow-md transition-shadow',
  image: 'w-full h-52 object-cover rounded-2xl mb-6',
  category: 'text-orange-600',
  title: 'text-2xl font-medium tracking-tight text-gray-900 hover:text-orange-600 mb-3',
  excerpt: 'text-gray-500 text-sm leading-relaxed mb-4',
  readMore: 'inline-block text-sm font-medium text-orange-600 hover:text-orange-500',
  archiveWidget: true,
});
