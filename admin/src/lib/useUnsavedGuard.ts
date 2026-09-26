import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dialog } from './dialog';
import { t, getLang } from './i18n';

// The admin SPA is mounted under this basename (see main.tsx).
const BASENAME = '/admin';

// Guard unsaved edits against both ways out of an editor:
//   - closing/reloading the tab (beforeunload)
//   - clicking a link in the admin (a capture-phase listener on <a href>)
// The admin uses a plain BrowserRouter and this react-router version has no
// useBlocker, so links are intercepted directly. Confirming navigates through
// the router rather than assigning location.href — a full page load would hit
// the beforeunload guard and prompt a second time.
export function useUnsavedGuard(dirty: boolean, messageKey = 'unsaved changes'): void {
  const navigate = useNavigate();
  useEffect(() => {
    if (!dirty) return;
    const beforeUnload = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ''; };
    const onClick = async (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement)?.closest?.('a[href]') as HTMLAnchorElement | null;
      if (!a) return;
      const href = a.getAttribute('href') || '';
      // Same-page anchors, external links (they open a new context anyway) and
      // the current route are none of our business.
      if (!href || href.startsWith('#') || href.startsWith('http') || a.target === '_blank') return;
      if (href === window.location.pathname + window.location.search) return;
      e.preventDefault();
      e.stopPropagation();
      if (!(await dialog.confirm(t(messageKey, getLang())))) return;
      // Keep the query string: /admin/posts?type=book is a different list.
      const path = (a.pathname.startsWith(BASENAME) ? a.pathname.slice(BASENAME.length) || '/' : a.pathname) + a.search;
      navigate(path);
    };
    window.addEventListener('beforeunload', beforeUnload);
    document.addEventListener('click', onClick, true);
    return () => {
      window.removeEventListener('beforeunload', beforeUnload);
      document.removeEventListener('click', onClick, true);
    };
  }, [dirty, messageKey, navigate]);
}
