// Dependency-free SMTP mailer + email templates.
// Reads connection settings from the Setting table (smtp_* keys) and speaks
// plain SMTP with STARTTLS/SMTPS support via Node's net/tls modules.
import net from 'net';
import tls from 'tls';
import db from './db';

export interface MailSettings {
  host: string;
  port: number;
  user: string;
  pass: string;
  secure: string; // 'tls' | 'ssl' | 'none'
  from: string;
}

export function getMailSettings(): MailSettings {
  const row = (key: string) => (db.prepare('SELECT value FROM Setting WHERE key = ?').get(key) as any)?.value || '';
  const siteUrl = (row('site_url') || 'http://localhost').replace(/^https?:\/\//, '').replace(/\/$/, '');
  return {
    host: row('smtp_host'),
    port: parseInt(row('smtp_port')) || 587,
    user: row('smtp_user'),
    pass: row('smtp_pass'),
    secure: row('smtp_secure') || 'tls',
    from: row('smtp_from') || 'no-reply@' + siteUrl,
  };
}

// ---- Minimal SMTP client ----
export function smtpSend(cfg: MailSettings, from: string, to: string, subject: string, html: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!cfg.host) { reject(new Error('SMTP host is not configured')); return; }
    const isSsl = cfg.secure === 'ssl' || cfg.port === 465;
    const raw = net.connect({ port: cfg.port, host: cfg.host });
    let sock: any = isSsl ? tls.connect({ socket: raw, rejectUnauthorized: false }) : raw;

    let buf = '';
    let done = false;
    let current: { cmd?: string; expect: number[]; then?: () => void } | null = null;
    const steps: { cmd?: string; expect: number[]; then?: () => void }[] = [];

    const fail = (err: Error) => { if (!done) { done = true; sock.destroy(); reject(err); } };
    const finish = () => {
      if (done) return;
      done = true;
      try { send('QUIT'); } catch {}
      sock.end();
      resolve();
    };
    const send = (line: string) => sock.write(line + '\r\n');

    // Advance: take the next queued step and send its command (or wait silently)
    const run = () => {
      if (done) return;
      current = steps.shift() || null;
      if (!current) { finish(); return; }
      if (current.cmd !== undefined) send(current.cmd);
    };

    const onData = (chunk: Buffer) => {
      buf += chunk.toString('utf8');
      let idx: number;
      while ((idx = buf.indexOf('\r\n')) !== -1) {
        const line = buf.slice(0, idx);
        buf = buf.slice(idx + 2);
        if (line.length > 3 && line[3] === '-') continue; // multiline continuation
        const code = parseInt(line.slice(0, 3), 10);
        if (!current) continue;
        if (!current.expect.includes(code)) { fail(new Error('SMTP error ' + code + ': ' + line)); return; }
        const step = current;
        current = null;
        if (code === 354) {
          // Send the message body (headers + html) plus the terminator; the
          // next response line from the server is the DATA result (250).
          const msg = 'From: ' + from + '\r\nTo: ' + to + '\r\nSubject: ' + subject + '\r\nMIME-Version: 1.0\r\nContent-Type: text/html; charset=UTF-8\r\n\r\n' + html;
          send(msg.replace(/\r?\n/g, '\r\n') + '\r\n.');
          current = { expect: [250] };
          return;
        }
        step.then?.();
        run();
      }
    };
    sock.on('data', onData);
    sock.on('error', fail);
    sock.on('timeout', () => fail(new Error('SMTP connection timed out')));
    sock.setTimeout(15000);

    const ehlo = () => {
      steps.push({ cmd: 'EHLO ' + (cfg.host || 'localhost'), expect: [250], then: () => {
        if (!isSsl && cfg.secure === 'tls') {
          steps.push({ cmd: 'STARTTLS', expect: [220], then: () => {
            sock.removeAllListeners('data');
            sock = tls.connect({ socket: raw, rejectUnauthorized: false });
            sock.on('data', onData);
            sock.on('error', fail);
            sock.on('secureConnect', () => { buf = ''; ehlo(); run(); });
          }});
        } else {
          auth();
        }
      }});
    };

    const auth = () => {
      if (cfg.user) {
        steps.push({ cmd: 'AUTH PLAIN ' + Buffer.from('\0' + cfg.user + '\0' + cfg.pass).toString('base64'), expect: [235] });
      }
      steps.push({ cmd: 'MAIL FROM:<' + from + '>', expect: [250] });
      steps.push({ cmd: 'RCPT TO:<' + to + '>', expect: [250] });
      steps.push({ cmd: 'DATA', expect: [354] });
    };

    sock.on(isSsl ? 'secureConnect' : 'connect', () => {
      steps.push({ expect: [220], then: () => { ehlo(); } }); // greeting; handler run() sends EHLO
      run();
    });
  });
}

// ---- Templates ----
export interface MailTemplate {
  name: string;
  subject: string;
  desc: string;
  render: (vars: Record<string, string>) => string;
}

function layout(siteTitle: string, bodyHtml: string, footer: string): string {
  return '<div style="max-width:560px;margin:0 auto;font-family:-apple-system,Segoe UI,Roboto,sans-serif;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">' +
    '<div style="background:#2563eb;padding:18px 24px;color:#fff;font-size:18px;font-weight:600;">' + siteTitle + '</div>' +
    '<div style="padding:24px;font-size:14px;line-height:1.7;color:#1f2937;">' + bodyHtml + '</div>' +
    '<div style="padding:16px 24px;background:#f9fafb;font-size:12px;color:#9ca3af;">' + footer + '</div></div>';
}

const TEMPLATES: MailTemplate[] = [
  {
    name: 'test',
    subject: 'Test email from {{site_title}}',
    desc: 'Send a test message to verify SMTP configuration',
    render: (v) => layout(v.site_title, '<p>Hello ' + v.username + ',</p><p>This is a test email from <strong>' + v.site_title + '</strong>. If you are reading this, your SMTP settings work correctly.</p>', 'Sent by ' + v.site_title),
  },
  {
    name: 'welcome',
    subject: 'Welcome to {{site_title}}',
    desc: 'Sent to new registered users',
    render: (v) => layout(v.site_title, '<p>Hi ' + v.username + ',</p><p>Welcome to <strong>' + v.site_title + '</strong>! Your account has been created successfully.</p><p><a href="' + v.site_url + '" style="display:inline-block;padding:10px 20px;background:#2563eb;color:#fff;border-radius:8px;text-decoration:none;">Visit the site</a></p>', 'You received this because an account was registered with this address'),
  },
  {
    name: 'comment_notification',
    subject: 'New comment on "{{post_title}}"',
    desc: 'Notifies the admin when a comment is submitted',
    render: (v) => layout(v.site_title, '<p>A new comment was posted on <strong>' + v.post_title + '</strong>:</p><blockquote style="margin:12px 0;padding:12px 16px;background:#f3f4f6;border-left:4px solid #2563eb;border-radius:6px;">' + v.comment + '</blockquote><p><a href="' + v.site_url + '/admin#/comments" style="color:#2563eb;">Review in the admin panel</a></p>', 'Sent by ' + v.site_title),
  },
  {
    name: 'password_reset',
    subject: 'Reset your password for {{site_title}}',
    desc: 'Sent when a user requests a password reset',
    render: (v) => layout(v.site_title, '<p>Hi ' + v.username + ',</p><p>Someone requested a password reset for your account. Click below to choose a new password (valid for 30 minutes):</p><p><a href="' + v.reset_link + '" style="display:inline-block;padding:10px 20px;background:#2563eb;color:#fff;border-radius:8px;text-decoration:none;">Reset password</a></p><p>If you did not request this, you can safely ignore this email.</p>', 'Sent by ' + v.site_title),
  },
];

export function listTemplates(): { name: string; subject: string; desc: string; previewHtml: string }[] {
  return TEMPLATES.map(tp => ({
    name: tp.name,
    subject: tp.subject,
    desc: tp.desc,
    previewHtml: tp.render(sampleVars(tp.name)),
  }));
}

function sampleVars(name: string): Record<string, string> {
  const site = (db.prepare("SELECT value FROM Setting WHERE key = 'site_title'").get() as any)?.value || 'Mortar CMS';
  const url = (db.prepare("SELECT value FROM Setting WHERE key = 'site_url'").get() as any)?.value || 'http://localhost:3001';
  const base: Record<string, string> = { site_title: site, site_url: url, username: 'John', post_title: 'Hello world', comment: 'Great post, thanks for sharing!', reset_link: url + '/admin#/reset?token=DEMO_TOKEN' };
  return base;
}

export function renderTemplate(name: string, vars: Record<string, string>): { subject: string; html: string } | null {
  const tp = TEMPLATES.find(x => x.name === name);
  if (!tp) return null;
  const v = { ...sampleVars(name), ...vars };
  let subject = tp.subject;
  let html = tp.render(v);
  for (const [k, val] of Object.entries(v)) {
    subject = subject.split('{{' + k + '}}').join(val);
    html = html.split('{{' + k + '}}').join(val);
  }
  return { subject, html };
}

export async function sendEmail(to: string, subject: string, html: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const cfg = getMailSettings();
    await smtpSend(cfg, cfg.from, to, subject, html);
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err.message || 'Failed to send email' };
  }
}
