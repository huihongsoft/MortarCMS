import crypto from 'crypto';

// Chat platforms a bot binding can point at.
//
// Each one authenticates differently (a shared header secret, a signed body, an
// AES-encrypted envelope) and delivers its reply differently (in the HTTP
// response, or through an active API call). This module holds just those two
// per-platform facts plus the send call, so the routes stay free of an
// if-ladder and the admin UI can render the credential fields from data.

export interface BindingLike {
  platform: string;
  label?: string;
  token: string;
  [k: string]: any;
}

export interface Inbound {
  // The text to hand the assistant.
  message: string;
  // Where to send the answer (platform-specific id/channel).
  replyTo: string;
}

export interface PlatformAdapter {
  id: string;
  label: string;
  // Rendered by the admin form; credentials are encrypted at rest with the rest
  // of the binding.
  credentialFields: { key: string; label: string; secret?: boolean; hint?: string }[];
  // A URL-verification handshake some platforms perform before delivering
  // events. Returns the body to answer with, or null when there is none.
  challenge?: (binding: BindingLike, req: any) => unknown | null;
  // False → the route answers 403 without touching the assistant.
  verify: (binding: BindingLike, req: any) => boolean;
  // null → nothing to answer (an edit, a bot's own message, a non-text event).
  parse: (req: any) => Inbound | null;
  // Deliver the reply. Errors are the caller's to log; they are not shown to
  // the platform.
  send: (binding: BindingLike, inbound: Inbound, reply: string) => Promise<{ ok: boolean; error?: string }>;
}

const rawBody = (req: any): Buffer =>
  Buffer.isBuffer(req.rawBody) ? req.rawBody : Buffer.from(typeof req.body === 'string' ? req.body : '');

// ---- Telegram ----
// The bot is configured with setWebhook(secret_token=…); Telegram then repeats
// that secret in a header on every delivery, which is the whole authentication
// story. No signature, no crypto.
export function verifyTelegramSecret(binding: BindingLike, req: any): boolean {
  const expected = String(binding.tgSecret || '');
  if (!expected) return false;
  const got = String(req.headers['x-telegram-bot-api-secret-token'] || '');
  if (got.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(got), Buffer.from(expected));
}

export async function sendTelegramMessage(botToken: string, chatId: string, text: string): Promise<{ ok: boolean; error?: string }> {
  if (!botToken) return { ok: false, error: 'Bot Token 未配置' };
  try {
    const r = await fetch('https://api.telegram.org/bot' + botToken + '/sendMessage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // Bounded like every other outbound call here: the reply is sent from a
      // fire-and-forget block after the ack, so a hung platform API would leave
      // the promise and its socket pending for the life of the process.
      signal: AbortSignal.timeout(10_000),
      // Telegram caps a message at 4096 characters; truncating beats a 400 that
      // silently loses the whole answer.
      body: JSON.stringify({ chat_id: chatId, text: text.slice(0, 4000), disable_web_page_preview: true }),
    });
    const d: any = await r.json().catch(() => ({}));
    return d?.ok ? { ok: true } : { ok: false, error: d?.description || 'HTTP ' + r.status };
  } catch (e: any) { return { ok: false, error: e.message }; }
}

// ---- Slack ----
// Slack signs `v0:<timestamp>:<raw body>` with the app's signing secret. The
// signature is over the exact bytes, so express.json has to hand them over
// (see the verify hook where it is mounted).
export function verifySlackSignature(signingSecret: string, timestamp: string, body: Buffer, signature: string, nowMs = Date.now()): boolean {
  if (!signingSecret || !timestamp || !signature) return false;
  // A replay of an old signed request must not be accepted. Five minutes is
  // Slack's own guidance.
  const ts = Number(timestamp);
  if (!Number.isFinite(ts) || Math.abs(nowMs / 1000 - ts) > 300) return false;
  const expected = 'v0=' + crypto.createHmac('sha256', signingSecret).update('v0:' + timestamp + ':').update(body).digest('hex');
  if (expected.length !== signature.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

export async function sendSlackMessage(botToken: string, channel: string, text: string): Promise<{ ok: boolean; error?: string }> {
  if (!botToken) return { ok: false, error: 'Bot Token 未配置' };
  try {
    const r = await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8', Authorization: 'Bearer ' + botToken },
      signal: AbortSignal.timeout(10_000),
      body: JSON.stringify({ channel, text: text.slice(0, 4000) }),
    });
    const d: any = await r.json().catch(() => ({}));
    return d?.ok ? { ok: true } : { ok: false, error: d?.error || 'HTTP ' + r.status };
  } catch (e: any) { return { ok: false, error: e.message }; }
}

export const ADAPTERS: Record<string, PlatformAdapter> = {
  telegram: {
    id: 'telegram',
    label: 'Telegram',
    credentialFields: [
      { key: 'tgToken', label: 'Bot Token', secret: true, hint: '来自 @BotFather' },
      { key: 'tgSecret', label: 'Webhook Secret', secret: true, hint: 'setWebhook 时填的 secret_token' },
    ],
    verify: verifyTelegramSecret,
    parse: (req) => {
      const msg = (req.body || {}).message || (req.body || {}).edited_message;
      const text = String(msg?.text || '').trim();
      if (!text || !msg?.chat?.id) return null;
      // A bot's own messages would otherwise answer each other forever.
      if (msg.from?.is_bot) return null;
      return { message: text, replyTo: String(msg.chat.id) };
    },
    send: (b, inbound, reply) => sendTelegramMessage(String(b.tgToken || ''), inbound.replyTo, reply),
  },
  slack: {
    id: 'slack',
    label: 'Slack',
    credentialFields: [
      { key: 'slackToken', label: 'Bot Token', secret: true, hint: 'xoxb-…，需要 chat:write' },
      { key: 'slackSecret', label: 'Signing Secret', secret: true, hint: 'App Credentials 里的 Signing Secret' },
    ],
    challenge: (binding, req) => {
      const body = req.body || {};
      if (body.type === 'url_verification') return { challenge: body.challenge };
      return null;
    },
    verify: (binding, req) => verifySlackSignature(
      String(binding.slackSecret || ''),
      String(req.headers['x-slack-request-timestamp'] || ''),
      rawBody(req),
      String(req.headers['x-slack-signature'] || ''),
    ),
    parse: (req) => {
      const body = req.body || {};
      if (body.type !== 'event_callback') return null;
      const ev = body.event || {};
      // Only plain user messages: skip edits, joins, and anything from a bot
      // (including this app), which is what keeps a reply from triggering itself.
      if (ev.type !== 'message' || ev.subtype || ev.bot_id) return null;
      const text = String(ev.text || '').trim();
      if (!text || !ev.channel) return null;
      return { message: text, replyTo: String(ev.channel) };
    },
    send: (b, inbound, reply) => sendSlackMessage(String(b.slackToken || ''), inbound.replyTo, reply),
  },
};

// Platforms a binding may name. Kept as a list so the route can reject unknown
// values before a binding is stored.
export const PLATFORM_IDS = ['wechat', 'dingtalk', ...Object.keys(ADAPTERS)];
