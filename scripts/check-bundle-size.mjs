#!/usr/bin/env node
// Bundle-size gate.
//
// A CMS front end grows one convenient import at a time — the block editor alone
// is a megabyte — and nobody notices until the first paint is measured on a slow
// connection. This makes the size part of the build: budgets with a little
// headroom over today's numbers, so a regression fails CI instead of being found
// by a visitor.
//
// Raise a budget only when the growth is the point, and say why in the commit.
//
//   node scripts/check-bundle-size.mjs            # check (used by CI)
//   node scripts/check-bundle-size.mjs --report   # print the table, never fail
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const reportOnly = process.argv.includes('--report');

// gzip is what actually crosses the wire, so that is what is budgeted. Raw size
// is reported for context (parse cost) but not enforced.
const BUDGETS = [
  { dir: 'admin/dist', gzipKB: 900, what: 'admin SPA (everything it can load)' },
  { dir: 'frontend/dist', gzipKB: 280, what: 'public site (all routes + themes loader)' },
  { dir: 'frontend/dist-ssr', gzipKB: 460, what: 'server renderer (loaded by the server, not the visitor)' },
];

// Single files that dominate their bundle, so a change to them is visible on its
// own rather than hidden inside the total. Matched by suffix.
const FILE_BUDGETS = [
  { match: /grapesjs-.*\.js$/, gzipKB: 320, what: 'block editor vendor bundle' },
  { match: /assets\/editor-.*\.js$/, gzipKB: 145, what: 'editor app code' },
];

function measure(dir) {
  const abs = path.join(root, dir);
  if (!fs.existsSync(abs)) return null;
  const files = [];
  let gzip = 0;
  const walk = (d) => {
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, entry.name);
      if (entry.isDirectory()) { walk(p); continue; }
      if (!/\.(js|css)$/.test(entry.name)) continue;
      const buf = fs.readFileSync(p);
      const gz = zlib.gzipSync(buf).length;
      gzip += gz;
      files.push({ file: path.relative(root, p), gzipKB: gz / 1024, rawKB: buf.length / 1024 });
    }
  };
  walk(abs);
  return { gzipKB: gzip / 1024, files };
}

let failed = 0;
console.log('bundle-size check (gzip)\n');
for (const b of BUDGETS) {
  const m = measure(b.dir);
  if (!m) {
    // A directory that was not built is not a size failure — the caller may be
    // checking one app at a time.
    console.log(`  ${b.dir.padEnd(20)} not built (skipped)`);
    continue;
  }
  const over = m.gzipKB > b.gzipKB;
  if (over) failed++;
  console.log(
    `  ${over ? 'OVER ' : 'ok   '} ${b.dir.padEnd(20)} ${m.gzipKB.toFixed(0).padStart(5)} KB / ${String(b.gzipKB).padStart(4)} KB  ${b.what}`
  );
  for (const fb of FILE_BUDGETS) {
    const hit = m.files.find((f) => fb.match.test(f.file));
    if (!hit) continue;
    const fileOver = hit.gzipKB > fb.gzipKB;
    if (fileOver) failed++;
    console.log(
      `         ${fileOver ? 'OVER ' : '     '} ${path.basename(hit.file).padEnd(20)} ${hit.gzipKB.toFixed(0).padStart(5)} KB / ${String(fb.gzipKB).padStart(4)} KB  ${fb.what}`
    );
  }
}

console.log('');
if (failed && !reportOnly) {
  console.error(`${failed} budget(s) exceeded. Either shrink the change or raise the budget on purpose.`);
  process.exit(1);
}
console.log(`${failed} budget(s) exceeded.`);
