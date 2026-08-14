// Flat config for the whole repo (server / admin / frontend).
// `no-explicit-any` and `no-unused-vars` are warnings for now: the codebase
// has legacy debt that needs incremental typing, and CI must not be blocked.
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

export default tseslint.config(
  { ignores: ['**/dist/**', '**/node_modules/**', '**/esm/**', '**/dist-esm/**', 'server/data/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['server/**/*.ts', 'admin/**/*.ts', 'admin/**/*.tsx', 'frontend/**/*.ts', 'frontend/**/*.tsx'],
    plugins: { 'react-hooks': reactHooks },
    languageOptions: {
      globals: { ...globals.node, ...globals.browser },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-unused-vars': 'off', // TS rule handles it
      'no-undef': 'off', // TS handles it
      '@typescript-eslint/no-require-imports': 'off', // legacy dynamic requires in server
      '@typescript-eslint/no-unused-expressions': 'off',
      'no-empty': 'off', // `catch {}` is an intentional best-effort idiom here
      'no-control-regex': 'off', // sanitizers deliberately match control chars
      // Classic hooks rules only. The new compiler-era rules (set-state-in-effect,
      // refs-during-render, immutability, ...) require a full refactor of legacy
      // components, so they stay off until that happens.
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  }
);
