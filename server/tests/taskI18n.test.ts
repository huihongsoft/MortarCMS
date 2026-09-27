import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

// Every scheduled task's name and description is a *display* string: the API sends
// the English text and the admin dictionary is keyed by it (`t(task.name)`), which
// is how the task list was translated when it lived inside Settings.
//
// That coupling is invisible from either side — the scheduler does not know the
// dictionary exists, and a missing entry does not error, it just renders English in
// a Chinese admin. It had already drifted: six task names, seven descriptions and
// the word "core" had no entry, so most of the detail column was English. This
// reads both files and fails when a task is registered without its translations,
// which is the only moment anyone has the context to write them.

const root = path.resolve(__dirname, '../..');
const scheduler = fs.readFileSync(path.join(root, 'server/src/utils/scheduler.ts'), 'utf8');
const dict = fs.readFileSync(path.join(root, 'admin/src/lib/i18n.ts'), 'utf8');

/** The name/desc pairs from every registerTask call in core. */
function registeredTasks(): { id: string; name: string; desc: string }[] {
  const out: { id: string; name: string; desc: string }[] = [];
  for (const block of scheduler.matchAll(/registerTask\(\{([\s\S]*?)\n  \}\);/g)) {
    const body = block[1];
    const id = /id:\s*'([^']+)'/.exec(body)?.[1];
    const name = /name:\s*'([^']+)'/.exec(body)?.[1];
    const desc = /desc:\s*'([^']+)'/.exec(body)?.[1];
    if (id && name && desc) out.push({ id, name, desc });
  }
  return out;
}

/** Every outcome code `registerBuiltinTasks` can return. */
function outcomeCodes(): string[] {
  // Comments carry code examples, so strip them before scanning — otherwise the
  // documentation block itself would demand a translation.
  const source = scheduler.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  return [...new Set([...source.matchAll(/code:\s*'([^']+)'/g)].map((m) => m[1]))];
}

/** Is this English string a key in the admin dictionary? */
function translated(key: string): boolean {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp("^\\s*'" + escaped + "':\\s*\\S", 'm').test(dict);
}

describe('scheduled task translations', () => {
  it('reads the task registry', () => {
    const tasks = registeredTasks();
    // If the parser stops matching (a reformatted registerTask call), the test
    // below would pass vacuously.
    expect(tasks.length).toBeGreaterThanOrEqual(10);
    expect(tasks.map((x) => x.id)).toContain('backup_database');
  });

  it('has a Chinese entry for every task name and description', () => {
    const missing = registeredTasks().flatMap(({ id, name, desc }) => [
      ...(translated(name) ? [] : [{ id, field: 'name', text: name }]),
      ...(translated(desc) ? [] : [{ id, field: 'desc', text: desc }]),
    ]);
    expect(missing, 'untranslated task metadata: ' + JSON.stringify(missing, null, 1)).toEqual([]);
  });

  it('has a Chinese entry for every outcome a task can report', () => {
    // The screen renders `t('task result ' + code)`; a missing entry shows the raw
    // code, which is the same silent failure the task names had.
    const codes = outcomeCodes();
    expect(codes.length).toBeGreaterThanOrEqual(15);
    expect(codes).toContain('nothing to do');
    const missing = codes.filter((c) => !translated('task result ' + c));
    expect(missing, 'untranslated task outcomes: ' + JSON.stringify(missing)).toEqual([]);
  });

  it('translates the word the task source column shows', () => {
    // `source` defaults to 'core' for every task; a plugin that ever registers one
    // supplies its own name, which falls back to itself.
    expect(scheduler).toContain("def.source || 'core'");
    expect(translated('core')).toBe(true);
  });
});
