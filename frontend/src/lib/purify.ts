import DOMPurify from 'dompurify';

// The one HTML sanitizer, on both sides of the render.
//
// DOMPurify needs a DOM, and the server renderer has none — importing it there
// yields the createDOMPurify *factory* rather than an instance, and calling
// `.sanitize()` on it throws. That threw inside the route's Suspense boundary,
// which React answers by client-rendering the whole boundary: the prerendered
// page came out as a spinner.
//
// entry-server.tsx therefore installs an instance built on a lightweight DOM
// (linkedom), so the server and the browser run the *same* sanitizer on the same
// input. Anything else — a different sanitizer server-side, or skipping it —
// would either emit unsanitized HTML into the page or produce markup that does
// not match what hydration renders.

let instance: { sanitize: (html: string, config?: any) => string } | null = null;

/** Install the DOM-backed instance. Called by the server renderer only. */
export function setPurifyInstance(p: typeof instance): void {
  instance = p;
}

export function purify(html: string | undefined | null, config?: any): string {
  const active = instance || (DOMPurify as unknown as typeof instance);
  // No DOM and no installed instance: the renderer failed to set one up. Return
  // nothing rather than the input — emitting unsanitized HTML is the one outcome
  // that must never happen.
  if (!active || typeof active.sanitize !== 'function') return '';
  return active.sanitize(html || '', config);
}
