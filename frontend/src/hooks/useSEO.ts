import { useEffect } from 'react';

interface SEOOptions {
  title?: string;
  description?: string;
  image?: string;       // absolute URL
  url?: string;         // path like /post/slug
  type?: string;        // article | website
  jsonLd?: object[];    // structured data (JSON-LD)
  noindex?: boolean;    // robots noindex
  canonical?: string;   // custom canonical URL override
  siteTitle?: string;   // site name (from settings); falls back to the default
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

// Set a meta tag, or remove it when the value is falsy — otherwise a page
// without an image/canonical keeps the previous page's stale tag.
function setOrRemoveMeta(attr: 'name' | 'property', key: string, value?: string) {
  const el = document.head.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
  if (value) {
    if (!el) {
      const meta = document.createElement('meta');
      meta.setAttribute(attr, key);
      document.head.appendChild(meta);
      meta.setAttribute('content', value);
    } else {
      el.setAttribute('content', value);
    }
  } else if (el) {
    el.remove();
  }
}

/**
 * 动态管理页面 SEO:title、description、OG、twitter card、canonical。
 * 每次切换页面先清理上一页可能残留的 og:image / canonical，避免 stale meta。
 */
export default function useSEO(opts: SEOOptions = {}) {
  useEffect(() => {
    const siteTitle = opts.siteTitle || SITE_TITLE;
    const title = opts.title ? opts.title + ' - ' + siteTitle : siteTitle;
    document.title = title;
    ensureMeta('name', 'description', opts.description || '');
    ensureMeta('property', 'og:title', opts.title || siteTitle);
    ensureMeta('property', 'og:description', opts.description || '');
    ensureMeta('property', 'og:type', opts.type || 'website');
    setOrRemoveMeta('property', 'og:image', opts.image);
    setOrRemoveMeta('property', 'og:url', opts.url);

    // Twitter card
    ensureMeta('name', 'twitter:card', opts.image ? 'summary_large_image' : 'summary');
    ensureMeta('name', 'twitter:title', opts.title || siteTitle);
    ensureMeta('name', 'twitter:description', opts.description || '');
    setOrRemoveMeta('name', 'twitter:image', opts.image);

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

    // Robots: noindex (per-post SEO setting)
    let robotsEl = document.head.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    if (opts.noindex) {
      if (!robotsEl) {
        robotsEl = document.createElement('meta');
        robotsEl.name = 'robots';
        document.head.appendChild(robotsEl);
      }
      robotsEl.content = 'noindex, nofollow';
    } else if (robotsEl) {
      robotsEl.remove();
    }

    // Canonical: set when the page has a URL, otherwise remove the stale link
    let link = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (opts.url) {
      if (!link) {
        link = document.createElement('link');
        link.rel = 'canonical';
        document.head.appendChild(link);
      }
      link.href = opts.canonical || opts.url;
    } else if (link) {
      link.remove();
    }
  }, [opts.title, opts.description, opts.image, opts.url, opts.type, opts.noindex, opts.canonical, opts.siteTitle, JSON.stringify(opts.jsonLd)]);
}
