import { useEffect } from 'react';

interface SEOOptions {
  title?: string;
  description?: string;
  image?: string;       // absolute URL
  url?: string;         // path like /post/slug
  type?: string;        // article | website
  jsonLd?: object[];    // structured data (JSON-LD)
}

const SITE_TITLE = 'Mortar CMS';

function ensureMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

/**
 * 动态管理页面 SEO:title、description、OG、twitter card、canonical。
 * 页面卸载时保留当前设置(SPA 内由下一页面覆盖);title 始终设置。
 */
export default function useSEO(opts: SEOOptions = {}) {
  useEffect(() => {
    const title = opts.title ? opts.title + ' - ' + SITE_TITLE : SITE_TITLE;
    document.title = title;
    ensureMeta('name', 'description', opts.description || 'A modern WordPress-like CMS built with TypeScript.');

    // Open Graph
    ensureMeta('property', 'og:title', opts.title || SITE_TITLE);
    ensureMeta('property', 'og:description', opts.description || 'A modern WordPress-like CMS built with TypeScript.');
    ensureMeta('property', 'og:type', opts.type || 'website');
    if (opts.image) ensureMeta('property', 'og:image', opts.image);
    if (opts.url) ensureMeta('property', 'og:url', opts.url);

    // Twitter card
    ensureMeta('name', 'twitter:card', opts.image ? 'summary_large_image' : 'summary');
    ensureMeta('name', 'twitter:title', opts.title || SITE_TITLE);
    ensureMeta('name', 'twitter:description', opts.description || '');
    if (opts.image) ensureMeta('name', 'twitter:image', opts.image);

    // Structured data (JSON-LD)
    let ldEl = document.getElementById('mortar-jsonld') as HTMLScriptElement | null;
    if (opts.jsonLd && opts.jsonLd.length > 0) {
      if (!ldEl) {
        ldEl = document.createElement('script');
        ldEl.id = 'mortar-jsonld';
        ldEl.type = 'application/ld+json';
        document.head.appendChild(ldEl);
      }
      ldEl.textContent = JSON.stringify(opts.jsonLd);
    } else if (ldEl) {
      ldEl.remove();
    }

    // Canonical
    if (opts.url) {
      let link = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'canonical';
        document.head.appendChild(link);
      }
      link.href = opts.url;
    }
  }, [opts.title, opts.description, opts.image, opts.url, opts.type, JSON.stringify(opts.jsonLd)]);
}
