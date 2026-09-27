// The CSP nonce for this document.
//
// The server writes its inline scripts (the importmap and the render payload)
// with a per-response nonce, and an enforcing CSP blocks any inline script that
// does not carry it. The scripts the *client* re-creates — the header/footer code
// an admin pastes into Settings — need the same value, and the one place it is
// readable from is the tag that already has it.
let value = '';

export function detectScriptNonce(): void {
  if (typeof document === 'undefined') return;
  const el = document.querySelector('script[nonce]');
  value = el?.getAttribute('nonce') || '';
}

/** Stamp a script element this code is about to insert. */
export function applyNonce(el: HTMLScriptElement): void {
  if (value) el.setAttribute('nonce', value);
}
