import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'fs';
import { initDB } from '../src/utils/db';
import { addAction, listHooks, removeAction, removeAllHooks, withHookSource } from '../src/utils/hooks';
import { loadPlugin, setPluginActive } from '../src/plugins/manager';
import { addPluginInterval, clearPluginIntervals, setPluginContext, removePluginRegistrations } from '../src/utils/pluginApi';
import { registerTool, removeToolsBySource, listToolSchemas } from '../src/utils/aiTools';

// Listeners registered by a plugin used to be labelled 'core' unless the plugin
// passed the source argument by hand (most don't), which made the hooks browser
// lie and made removeAllHooks() unable to reset them.
const DB_FILE = process.env.MORTAR_DB_PATH || '/tmp/mortar-vitest-hooks.db';

beforeAll(() => { initDB(); });
afterAll(() => {
  for (const s of ['', '-wal', '-shm']) { try { fs.unlinkSync(DB_FILE + s); } catch {} }
});

const listenersOf = (name: string) => listHooks().actions.find(h => h.name === name)?.listeners || [];

describe('hook source attribution', () => {
  it('labels listeners registered inside withHookSource', () => {
    const fn = () => {};
    withHookSource('plugin:demo', () => addAction('settings_saved', fn));
    expect(listenersOf('settings_saved').some(l => l.source === 'plugin:demo')).toBe(true);

    // The point of the label: resetting the hook can now drop it.
    removeAllHooks('settings_saved');
    expect(listenersOf('settings_saved')).toEqual([]);
  });

  it('keeps core listeners when a hook is reset', () => {
    const before = listenersOf('init').length;
    expect(before).toBeGreaterThan(0);                       // core registers one
    withHookSource('plugin:demo', () => addAction('init', () => {}));
    removeAllHooks('init');
    expect(listenersOf('init').every(l => l.source === 'core')).toBe(true);
    expect(listenersOf('init').length).toBe(before);
  });

  // NOTE: the real end-to-end case (a bundled plugin that omits the source
  // argument, e.g. auto-excerpt) cannot be asserted here: vitest loads the app
  // as ESM while the plugin is require()d through tsx as CJS, so the plugin
  // registers into a second instance of this module's registry. The shipped app
  // is CJS throughout (package.json has no "type"), so it has a single registry
  // — verified against a running server via GET /api/system/hooks.
  it('still loads a bundled plugin without breaking its registration', async () => {
    const r = await loadPlugin('auto-excerpt');
    expect(r.ok, r.error).toBe(true);
  });

  it('fires plugin_activated / plugin_deactivated', async () => {
    const seen: string[] = [];
    const act = (name: string, active: boolean) => { seen.push('activated:' + name + ':' + active); };
    const deact = (name: string, active: boolean) => { seen.push('deactivated:' + name + ':' + active); };
    addAction('plugin_activated', act);
    addAction('plugin_deactivated', deact);
    try {
      expect((await setPluginActive('auto-excerpt', true)).ok).toBe(true);
      expect((await setPluginActive('auto-excerpt', false)).ok).toBe(true);
    } finally {
      removeAction('plugin_activated', act);
      removeAction('plugin_deactivated', deact);
    }
    expect(seen).toEqual(['activated:auto-excerpt:true', 'deactivated:auto-excerpt:false']);
  });
});

// Deactivation used to leave a plugin's periodic work and AI tools running:
// media-cleanup kept deleting files, and a removed plugin's tool stayed callable
// by the model (which also blocked re-registration as a duplicate).
describe('plugin deactivation cleanup', () => {
  it('clears the timers a plugin registered', () => {
    let ticks = 0;
    setPluginContext('timer-demo');
    addPluginInterval(() => { ticks++; }, 1000);
    setPluginContext(null);
    expect(clearPluginIntervals('timer-demo')).toBe(1);
    expect(clearPluginIntervals('timer-demo')).toBe(0);   // idempotent
    void ticks;
  });

  it('removes the AI tools a plugin registered', () => {
    setPluginContext('tool-demo');
    registerTool('demo_tool', 'demo', { type: 'object', properties: {} }, async () => 'ok');
    setPluginContext(null);
    expect(listToolSchemas('admin').some(t => t.function.name === 'demo_tool')).toBe(true);

    expect(removeToolsBySource('tool-demo')).toBe(1);
    expect(listToolSchemas('admin').some(t => t.function.name === 'demo_tool')).toBe(false);

    // and the name is free again, so a re-enabled plugin can register it
    setPluginContext('tool-demo');
    registerTool('demo_tool', 'demo', { type: 'object', properties: {} }, async () => 'ok2');
    setPluginContext(null);
    expect(listToolSchemas('admin').some(t => t.function.name === 'demo_tool')).toBe(true);
    removeToolsBySource('tool-demo');
    removePluginRegistrations('tool-demo');
  });
});
