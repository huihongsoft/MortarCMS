import { t, getLang } from './i18n';

// A scheduled task's outcome, rendered in the admin's language.
//
// The task reports a *code* (`{ code: 'pruned activity entries', count: 3 }`)
// because it runs on the server, which does not know what language the operator
// reads; the sentence lives in the dictionary under `task result <code>`.
//
// An unknown code (a plugin task, or a code added without its translation) falls
// back to the code itself — English, but never a blank cell. `tests/taskI18n.test.ts`
// enforces that every code core can return has an entry.

export interface TaskResult { code: string; count?: number }

export function taskResultText(result: TaskResult | null | undefined): string {
  if (!result?.code) return '';
  const text = t('task result ' + result.code, getLang());
  return result.count === undefined ? text : text.replace('{n}', String(result.count));
}
