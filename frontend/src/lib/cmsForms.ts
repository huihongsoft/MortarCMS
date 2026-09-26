// Visitor-facing form submissions for `[form]` blocks in post/page content.
//
// The content is injected as HTML (innerHTML + DOMPurify), so a <script> inside
// it never runs and DOMPurify strips it anyway. One delegated listener on the
// document therefore handles every .cms-form the site renders, in any theme,
// without each theme having to know about forms.

let installed = false;

// When a form was put in front of the reader, so the server can tell a typed
// answer from an instant machine post. Stamped when the script runs (for forms
// already in the DOM) and on first focus (for forms injected later) — a bot
// never focuses a field, and pays the price for it.
function stampForm(form: Element | null): void {
  const el = form as HTMLElement | null;
  if (el && !el.dataset.mortarShown) el.dataset.mortarShown = String(Date.now());
}

export function installCmsForms(): void {
  if (installed || typeof document === 'undefined') return;
  installed = true;

  document.querySelectorAll('.cms-form form, .cms-newsletter form').forEach(stampForm);
  document.addEventListener('focusin', (e) => stampForm((e.target as Element | null)?.closest('form') || null), true);

  document.addEventListener('submit', async (e) => {
    const form = e.target as HTMLFormElement | null;
    if (!form || form.tagName !== 'FORM') return;
    // Two shortcodes render forms: [form slug=...] and [newsletter].
    const formWrap = form.closest('.cms-form') as HTMLElement | null;
    const newsWrap = form.closest('.cms-newsletter') as HTMLElement | null;
    const wrap = formWrap || newsWrap;
    if (!wrap) return;
    e.preventDefault();
    if (newsWrap && !formWrap) { await submitNewsletter(form, newsWrap); return; }

    const slug = wrap.dataset.form || '';
    if (!slug) return;
    const button = form.querySelector('button[type="submit"]') as HTMLButtonElement | null;
    const msgEl = form.querySelector('.cms-form-msg') as HTMLElement | null;
    const original = button ? button.textContent : '';
    if (button) { button.disabled = true; button.textContent = original ? original + '…' : '…'; }
    if (msgEl) { msgEl.hidden = true; }

    const fail = (text: string) => {
      if (msgEl) {
        msgEl.textContent = text;
        msgEl.style.color = '#b91c1c';
        msgEl.style.padding = '10px 14px';
        msgEl.style.border = '1px solid #fecaca';
        msgEl.style.borderRadius = '8px';
        msgEl.style.background = '#fef2f2';
        msgEl.hidden = false;
      }
    };

    try {
      // Keys come from data-field: sanitising the injected markup drops a
      // `name` that would shadow a DOM global (e.g. a field called "name"),
      // which silently emptied the submission.
      // Null prototype: a field may legitimately be named __proto__, and
      // assigning that key on a plain object silently drops it.
      const payload: Record<string, string> = Object.create(null);
      form.querySelectorAll('[data-field]').forEach((el: any) => {
        payload[el.getAttribute('data-field')] = el.value == null ? '' : String(el.value);
      });
      const honeypot = form.querySelector('input[name="_hp"]') as HTMLInputElement | null;
      if (honeypot) payload._hp = honeypot.value;
      const shown = Number((form as HTMLElement).dataset.mortarShown);
      if (Number.isFinite(shown) && shown > 0) payload._t = String(shown);
      // No data-field markup (an older cached render): fall back to FormData.
      if (Object.keys(payload).length === 0) new FormData(form).forEach((v, k) => { payload[k] = String(v); });
      const r = await fetch('/api/forms/' + encodeURIComponent(slug) + '/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok || !data?.success) { fail(data?.error || '提交失败，请稍后再试'); return; }
      // Success: replace the fields with the form's own confirmation message.
      form.innerHTML = '';
      const ok = document.createElement('p');
      ok.setAttribute('role', 'status');
      ok.textContent = data.message || wrap.dataset.success || '提交成功';
      ok.style.cssText = 'padding:14px 16px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;color:#166534;font-size:14px;';
      form.appendChild(ok);
    } catch {
      fail('网络错误，请检查连接后重试');
    } finally {
      if (button && button.isConnected) { button.disabled = false; button.textContent = original; }
    }
  });
}

// [newsletter] subscribe form: same delegated-handler reasoning as [form].
async function submitNewsletter(form: HTMLFormElement, wrap: HTMLElement): Promise<void> {
  const button = form.querySelector('button[type="submit"]') as HTMLButtonElement | null;
  const msgEl = form.querySelector('.cms-form-msg') as HTMLElement | null;
  const original = button ? button.textContent : '';
  const show = (text: string, ok: boolean) => {
    if (!msgEl) return;
    msgEl.textContent = text;
    msgEl.hidden = false;
    msgEl.style.cssText = ok
      ? 'margin:0;font-size:14px;padding:12px 14px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;color:#166534;'
      : 'margin:0;font-size:14px;padding:12px 14px;background:#fef2f2;border:1px solid #fecaca;border-radius:8px;color:#b91c1c;';
  };
  if (button) { button.disabled = true; if (original) button.textContent = original + '\u2026'; }
  if (msgEl) msgEl.hidden = true;
  try {
    const body: Record<string, string> = Object.create(null);
    form.querySelectorAll('[data-field]').forEach((el: any) => {
      body[el.getAttribute('data-field')] = el.value == null ? '' : String(el.value);
    });
    if (!body.email) { show('\u8bf7\u586b\u5199\u90ae\u7bb1', false); return; }
    const r = await fetch('/api/newsletter/subscribe', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok || !d?.success) { show(d?.error || '\u8ba2\u9605\u5931\u8d25\uff0c\u8bf7\u7a0d\u540e\u518d\u8bd5', false); return; }
    // The server tells us whether a confirmation email went out or the address
    // is already subscribed (no SMTP configured).
    show(d.message === 'confirmation_sent' ? (wrap.dataset.confirm || '') : (wrap.dataset.sent || ''), true);
  } catch {
    show('\u7f51\u7edc\u9519\u8bef\uff0c\u8bf7\u68c0\u67e5\u8fde\u63a5\u540e\u91cd\u8bd5', false);
  } finally {
    if (button && button.isConnected) { button.disabled = false; button.textContent = original; }
  }
}
