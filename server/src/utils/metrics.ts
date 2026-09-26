// Prometheus text exposition, hand-written.
//
// No client library: the app exposes a handful of series, they are cheap to
// count as plain objects, and a dependency that only formats text would be more
// to audit than to write. Scrape-time work is limited to walking the collected
// series — nothing here does I/O.
//
// Every series is process-local, which is what Prometheus expects: scrape each
// instance, aggregate in the query. Nothing user-identifying is exposed (no
// paths, no IPs, no addresses) — see docs/monitoring.md.

type Labels = Record<string, string>;

interface Series { name: string; help: string; type: 'counter' | 'gauge'; labels: Labels; value: number }

const counters = new Map<string, Series>();
const gauges = new Map<string, Series>();

function keyOf(name: string, labels: Labels): string {
  const pairs = Object.keys(labels).sort().map((k) => k + '=' + labels[k]).join(',');
  return name + '{' + pairs + '}';
}

/** Add to a counter series. */
export function incCounter(name: string, help: string, labels: Labels = {}, by = 1): void {
  const key = keyOf(name, labels);
  const existing = counters.get(key);
  if (existing) { existing.value += by; return; }
  counters.set(key, { name, help, type: 'counter', labels, value: by });
}

/** Set a gauge series (this process's current value). */
export function setGauge(name: string, help: string, value: number, labels: Labels = {}): void {
  gauges.set(keyOf(name, labels), { name, help, type: 'gauge', labels, value });
}

/** Read a counter series (metrics screen, tests). */
export function readCounter(name: string, labels: Labels = {}): number {
  return counters.get(keyOf(name, labels))?.value || 0;
}

export function resetMetrics(): void {
  counters.clear();
  gauges.clear();
  for (const g of lateGauges) g();
}

// Series that are collected when the scrape happens rather than pushed on every
// change (process memory, scheduler state): a scrape is once every 15s, and
// nothing in the request path should pay for it.
const lateGauges: (() => void)[] = [];
export function registerLateGauge(collect: () => void): void { lateGauges.push(collect); }

const escapeLabel = (v: string) => String(v).replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');

function renderSeries(s: Series): string {
  const keys = Object.keys(s.labels);
  const labels = keys.length ? '{' + keys.map((k) => k + '="' + escapeLabel(s.labels[k]) + '"').join(',') + '}' : '';
  // Prometheus requires an integer or float; a bare NaN/Infinity would break the
  // scraper, so guard the value instead of trusting the arithmetic.
  const value = Number.isFinite(s.value) ? s.value : 0;
  return s.name + labels + ' ' + value;
}

/** The full exposition body. */
export function renderMetrics(): string {
  for (const collect of lateGauges) { try { collect(); } catch { /* a failing collector must not break the scrape */ } }
  const all = [...counters.values(), ...gauges.values()];
  const byName = new Map<string, Series[]>();
  for (const s of all) {
    if (!byName.has(s.name)) byName.set(s.name, []);
    byName.get(s.name)!.push(s);
  }
  const lines: string[] = [];
  for (const name of [...byName.keys()].sort()) {
    const group = byName.get(name)!;
    lines.push('# HELP ' + name + ' ' + group[0].help);
    lines.push('# TYPE ' + name + ' ' + group[0].type);
    for (const s of group.sort((a, b) => renderSeries(a).localeCompare(renderSeries(b)))) lines.push(renderSeries(s));
  }
  return lines.join('\n') + '\n';
}

// ---- HTTP counters ----

const START_TIME = Date.now();

export function startMetrics(): void {
  setGauge('mortar_process_start_time_seconds', 'Unix time the process started', Math.floor(START_TIME / 1000));
  registerLateGauge(() => {
    const mem = process.memoryUsage();
    setGauge('mortar_process_resident_memory_bytes', 'Resident set size', mem.rss);
    setGauge('mortar_process_heap_used_bytes', 'V8 heap used', mem.heapUsed);
    setGauge('mortar_process_uptime_seconds', 'Seconds since process start', (Date.now() - START_TIME) / 1000);
  });
}

export function countRequest(method: string, status: number): void {
  incCounter('mortar_http_requests_total', 'HTTP responses by method and status class', {
    method: String(method || 'GET').toUpperCase(),
    // Status class rather than the exact code: the label set stays bounded, and
    // alerting on 5xx is what an operator actually does.
    status: String(status || 0).charAt(0) + 'xx',
  });
}
