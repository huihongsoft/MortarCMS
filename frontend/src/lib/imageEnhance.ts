import { useEffect, RefObject } from 'react';

// Enhance <img> tags inside rendered content: lazy-load images below the fold,
// decode asynchronously, and reserve the aspect ratio once dimensions are known
// so resizes don't cause layout shift.
export function useContentImageEnhancer(ref: RefObject<HTMLElement | null>, deps: any[] = []): void {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.querySelectorAll('img').forEach((img) => {
      if (!img.hasAttribute('loading')) img.setAttribute('loading', 'lazy');
      img.setAttribute('decoding', 'async');
      if (!img.hasAttribute('width') && !img.style.aspectRatio) {
        img.addEventListener('load', () => {
          if (img.naturalWidth && !img.style.aspectRatio) {
            img.style.aspectRatio = String(img.naturalWidth / img.naturalHeight);
          }
        }, { once: true });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
