interface LightboxImage {
  src: string;
  caption: string;
  element: HTMLImageElement;
}

let currentImages: LightboxImage[] = [];
let currentIndex = 0;
let overlay: HTMLDivElement | null = null;

function getCaption(img: HTMLImageElement): string {
  // Try data-caption attr first (gallery items), then figcaption parent, then alt/title
  if (img.dataset.caption) return img.dataset.caption;
  const figure = img.closest('figure');
  if (figure) {
    const figcaption = figure.querySelector('figcaption');
    if (figcaption?.textContent?.trim()) return figcaption.textContent.trim();
  }
  return img.alt || img.title || '';
}

function buildOverlay(): HTMLDivElement {
  const div = document.createElement('div');
  div.className = 'mortar-lightbox';
  div.innerHTML = `
    <button class="mortar-lightbox-close" aria-label="Close">&times;</button>
    <button class="mortar-lightbox-prev" aria-label="Previous">&lsaquo;</button>
    <button class="mortar-lightbox-next" aria-label="Next">&rsaquo;</button>
    <div class="mortar-lightbox-inner">
      <img src="" alt="">
      <p class="mortar-lightbox-caption"></p>
    </div>
    <span class="mortar-lightbox-counter"></span>
  `;
  return div;
}

function updateOverlay() {
  if (!overlay) return;
  const img = overlay.querySelector('img') as HTMLImageElement;
  const caption = overlay.querySelector('.mortar-lightbox-caption') as HTMLElement;
  const counter = overlay.querySelector('.mortar-lightbox-counter') as HTMLElement;
  const prevBtn = overlay.querySelector('.mortar-lightbox-prev') as HTMLElement;
  const nextBtn = overlay.querySelector('.mortar-lightbox-next') as HTMLElement;

  const item = currentImages[currentIndex];
  img.src = item.src;
  img.alt = item.caption;
  caption.textContent = item.caption;
  counter.textContent = `${currentIndex + 1} / ${currentImages.length}`;

  prevBtn.style.display = currentImages.length > 1 ? '' : 'none';
  nextBtn.style.display = currentImages.length > 1 ? '' : 'none';
  counter.style.display = currentImages.length > 1 ? '' : 'none';
}

function showOverlay(images: LightboxImage[], index: number) {
  currentImages = images;
  currentIndex = index;

  if (!overlay) {
    overlay = buildOverlay();
    document.body.appendChild(overlay);
  }

  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
  updateOverlay();
}

function hideOverlay() {
  if (!overlay) return;
  overlay.classList.remove('active');
  document.body.style.overflow = '';
}

function navigate(dir: number) {
  currentIndex = (currentIndex + dir + currentImages.length) % currentImages.length;
  updateOverlay();
}

function injectStyles() {
  if (document.getElementById('mortar-lightbox-styles')) return;
  const style = document.createElement('style');
  style.id = 'mortar-lightbox-styles';
  style.textContent = `
    .mortar-lightbox {
      position: fixed; inset: 0; z-index: 9999;
      background: rgba(0,0,0,0.85);
      display: flex; align-items: center; justify-content: center;
      opacity: 0; pointer-events: none;
      transition: opacity 0.25s ease;
    }
    .mortar-lightbox.active { opacity: 1; pointer-events: auto; }
    .mortar-lightbox img {
      max-width: 90vw; max-height: 85vh;
      object-fit: contain; border-radius: 6px;
      box-shadow: 0 8px 40px rgba(0,0,0,0.5);
    }
    .mortar-lightbox-inner {
      display: flex; flex-direction: column; align-items: center;
      max-width: 92vw; max-height: 92vh;
    }
    .mortar-lightbox-caption {
      color: #ccc; font-size: 14px; margin-top: 12px;
      max-width: 90vw; text-align: center; line-height: 1.5;
    }
    .mortar-lightbox-counter {
      position: absolute; top: 16px; left: 50%; transform: translateX(-50%);
      color: rgba(255,255,255,0.7); font-size: 13px;
      background: rgba(0,0,0,0.4); padding: 4px 12px; border-radius: 20px;
    }
    .mortar-lightbox-close {
      position: absolute; top: 16px; right: 20px;
      background: rgba(0,0,0,0.5); color: #fff; border: none;
      font-size: 32px; line-height: 1; width: 44px; height: 44px;
      border-radius: 50%; cursor: pointer; z-index: 10;
      display: flex; align-items: center; justify-content: center;
      transition: background 0.15s;
    }
    .mortar-lightbox-close:hover { background: rgba(255,255,255,0.2); }
    .mortar-lightbox-prev, .mortar-lightbox-next {
      position: absolute; top: 50%; transform: translateY(-50%);
      background: rgba(0,0,0,0.5); color: #fff; border: none;
      font-size: 48px; line-height: 1; width: 52px; height: 72px;
      cursor: pointer; z-index: 10;
      display: flex; align-items: center; justify-content: center;
      transition: background 0.15s;
    }
    .mortar-lightbox-prev { left: 8px; border-radius: 0 8px 8px 0; }
    .mortar-lightbox-next { right: 8px; border-radius: 8px 0 0 8px; }
    .mortar-lightbox-prev:hover, .mortar-lightbox-next:hover { background: rgba(255,255,255,0.25); }
    @media (max-width: 640px) {
      .mortar-lightbox-prev, .mortar-lightbox-next { font-size: 36px; width: 40px; height: 56px; }
    }
  `;
  document.head.appendChild(style);
}

export function initLightbox() {
  injectStyles();

  const seen = new Set<HTMLImageElement>();
  document.querySelectorAll('.prose img, article img, .gallery img, .gallery-item img').forEach(img => {
    if (img.closest('.lightbox-initialized')) return;
    img.classList.add('lightbox-initialized');
    if ((img as HTMLElement).classList.contains('cursor-pointer')) return;
    (img as HTMLElement).style.cursor = 'zoom-in';
    seen.add(img as HTMLImageElement);
  });

  // Delegate click handler so dynamically loaded content works
  const handlerAttr = 'data-lightbox-delegate';
  if (document.body.hasAttribute(handlerAttr)) return;
  document.body.setAttribute(handlerAttr, '');

  document.body.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const img = target.closest('img') as HTMLImageElement | null;
    if (!img) return;

    // Check if this image should participate: it's in prose/article/gallery, or has lightbox-initialized class
    const isGallery = img.closest('.gallery');
    const isContent = img.closest('.prose, article');
    if (!isGallery && !isContent && !img.classList.contains('lightbox-initialized')) return;
    if (img.closest('a')) return; // let linked images follow their href

    e.preventDefault();
    e.stopPropagation();

    // Collect images for navigation: if in a gallery, only images in that gallery
    let container: HTMLElement | null = null;
    if (isGallery) {
      container = img.closest('.gallery') as HTMLElement;
      // Also check if gallery has a data-gallery-id for cross-gallery grouping
      const gid = container.dataset.galleryId;
      if (gid) container = document.querySelector('.gallery[data-gallery-id="' + gid + '"]') as HTMLElement || container;
    } else {
      container = document.querySelector('.prose, article') as HTMLElement || document.body;
    }

    const imgs: HTMLImageElement[] = [];
    if (container) {
      const candidates = container.querySelectorAll('img');
      candidates.forEach((el) => {
        if ((el as HTMLImageElement).classList.contains('lightbox-initialized')) {
          imgs.push(el as HTMLImageElement);
        }
      });
    }
    if (imgs.length === 0) {
      imgs.push(img); // fallback: just this image
    }

    const images: LightboxImage[] = imgs.map((el) => ({
      src: el.dataset.src || el.src || '',
      caption: getCaption(el),
      element: el,
    })).filter((item) => item.src);

    if (images.length === 0) return;

    const idx = images.findIndex((item) => item.element === img);
    showOverlay(images, idx >= 0 ? idx : 0);
  });

  // Keyboard handler
  document.addEventListener('keydown', (e) => {
    if (!overlay || !overlay.classList.contains('active')) return;
    if (e.key === 'Escape') { hideOverlay(); return; }
    if (e.key === 'ArrowLeft') { navigate(-1); return; }
    if (e.key === 'ArrowRight') { navigate(1); return; }
  });

  // Overlay click handlers (attached once)
  if (overlay) return; // already built
  overlay = buildOverlay();

  overlay.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains('mortar-lightbox-close') || target === overlay) {
      hideOverlay();
    }
    if (target.classList.contains('mortar-lightbox-prev')) navigate(-1);
    if (target.classList.contains('mortar-lightbox-next')) navigate(1);
  });

  // Images inside overlay shouldn't close it
  overlay.querySelector('.mortar-lightbox-inner')?.addEventListener('click', (e) => {
    e.stopPropagation();
  });
}
