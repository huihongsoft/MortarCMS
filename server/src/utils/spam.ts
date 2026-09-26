import db from './db';

// Local spam scoring, no external service.
//
// Before this, the only defence was a honeypot the *client* checked, so a POST
// straight to the API skipped it entirely, the `spam_words` setting had no reader
// on the server at all (a textarea in the admin and nothing else), and there was
// no rate limit on form submissions. Everything here is a signal the server can
// verify on its own, and the score decides between "moderate it" and "hide it".

export interface SpamSignals {
  content: string;
  author?: string;
  email?: string;
  website?: string;
  /** Hidden field a human never fills; any value means a bot. */
  honeypot?: string;
  /** When the form was rendered (ms). Absent = no timing signal. */
  startedAt?: number;
}

export interface SpamVerdict {
  score: number;
  reasons: string[];
  /** True when the submission should be hidden rather than queued for review. */
  spam: boolean;
}

/** At or above this score the submission is hidden outright. */
export const SPAM_THRESHOLD = 40;
/** A human cannot read a form, fill it and submit in under this long. */
export const MIN_FILL_MS = 1500;
/** Links beyond this many add to the score. */
export const FREE_LINKS = 1;

const LINK_RE = /(https?:\/\/|www\.)\S+/gi;

/** Words/phrases from the `spam_words` setting, one per line or comma-separated. */
export function spamWords(): string[] {
  try {
    const row = db.prepare("SELECT value FROM Setting WHERE key = 'spam_words'").get() as any;
    return String(row?.value || '')
      .split(/[\n,]/)
      .map((w) => w.trim().toLowerCase())
      .filter((w) => w.length > 1);
  } catch {
    return [];
  }
}

export function scoreSpam(signals: SpamSignals, words: string[] = spamWords()): SpamVerdict {
  let score = 0;
  const reasons: string[] = [];
  const add = (points: number, reason: string) => { score += points; reasons.push(reason); };

  // 1. Honeypot. Only a bot fills a field it cannot see.
  if (String(signals.honeypot || '').trim() !== '') add(100, 'honeypot');

  // 2. Timing. Only when the client told us when it rendered the form: an absent
  //    signal must not be treated as a fast submission, or every API client
  //    (the CMS's own tools included) would look like a bot.
  if (signals.startedAt && Number.isFinite(signals.startedAt)) {
    const elapsed = Date.now() - Number(signals.startedAt);
    if (elapsed >= 0 && elapsed < MIN_FILL_MS) add(40, 'submitted in ' + elapsed + 'ms');
  }

  // 3. Links. A comment with three links is an advertisement, not a reply.
  const links = (signals.content.match(LINK_RE) || []).length;
  if (links > FREE_LINKS) add(15 * (links - FREE_LINKS), 'links=' + links);

  // 4. A URL in a name or email field: nobody's name is a web address.
  for (const [field, value] of [['author', signals.author], ['email', signals.email]] as const) {
    if (value && LINK_RE.test(String(value))) { add(25, 'url in ' + field); LINK_RE.lastIndex = 0; }
  }

  // 5. Operator's own list — the setting that finally has a reader. A listed word
  //    is decisive on its own: the operator said "this is spam", and scoring it as
  //    one signal among several would mean the setting quietly does nothing until
  //    a submission happens to trip something else too.
  const haystack = [signals.content, signals.author, signals.website].filter(Boolean).join(' ').toLowerCase();
  const hits = words.filter((w) => haystack.includes(w));
  if (hits.length) add(25 * Math.min(hits.length, 4), 'spam words: ' + hits.slice(0, 4).join(', '));

  // 6. Size. Long bodies are either essays or link farms; combined with anything
  //    else above, this tips them over.
  if (signals.content.length > 5000) add(10, 'length=' + signals.content.length);

  return { score, reasons, spam: score >= SPAM_THRESHOLD || hits.length > 0 };
}
