export function initLightbox() {
  document.querySelectorAll('.prose img, article img').forEach(img => {
    if (img.closest('.lightbox-initialized')) return;
    img.classList.add('lightbox-initialized', 'cursor-pointer', 'hover:opacity-90', 'transition-opacity');
    img.addEventListener('click', (e) => {
      const src = (e.target as HTMLImageElement).src;
      const overlay = document.createElement('div');
      overlay.className = 'fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4';
      overlay.onclick = () => overlay.remove();
      const bigImg = document.createElement('img');
      bigImg.src = src; bigImg.className = 'max-w-full max-h-[90vh] rounded-lg shadow-2xl';
      bigImg.onclick = (e) => e.stopPropagation();
      overlay.appendChild(bigImg);
      document.body.appendChild(overlay);
    });
  });
}
