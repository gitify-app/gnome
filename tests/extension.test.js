import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import vm from 'node:vm';

const source = await readFile(new URL('../gitify@gitify.io/extension.js', import.meta.url), 'utf8');

async function fixture({
  width = 400,
  icon = null,
  iconId = 'Gitify',
  wmClass = 'gitify',
  title = 'Gitify',
} = {}) {
  const timers = new Map();
  const signals = new Map();
  const moves = [];
  let nextId = 1;
  let mapped;
  const window = {
    get_wm_class: () => wmClass,
    get_title: () => title,
    is_fullscreen: () => false,
    maximized_horizontally: false,
    maximized_vertically: false,
    get_frame_rect: () => ({ width, height: 500 }),
    move_frame: (_user, x, y) => moves.push({ x, y }),
    connect: (_signal, callback) => {
      const id = nextId++;
      signals.set(id, callback);
      return id;
    },
    disconnect: (id) => signals.delete(id),
  };
  const context = vm.createContext({
    global: {
      window_manager: {
        connect: (_signal, callback) => {
          mapped = callback;
          return 1;
        },
        disconnect: () => {
          mapped = null;
        },
      },
    },
  });
  const imports = {
    'gi://GLib': {
      default: {
        PRIORITY_DEFAULT: 0,
        SOURCE_REMOVE: false,
        timeout_add: (_priority, _delay, callback) => {
          const id = nextId++;
          timers.set(id, callback);
          return id;
        },
        Source: { remove: (id) => timers.delete(id) },
      },
    },
    'resource:///org/gnome/shell/extensions/extension.js': { Extension: class {} },
    'resource:///org/gnome/shell/ui/main.js': {
      layoutManager: {
        primaryIndex: 0,
        getWorkAreaForMonitor: () => ({ x: 0, y: 32, width: 1000, height: 800 }),
      },
      panel: {
        statusArea: icon
          ? {
              gitify: {
                _indicator: { id: iconId },
                container: {
                  visible: true,
                  get_transformed_extents: () => ({ get_center: () => ({ x: icon }) }),
                },
              },
            }
          : {},
      },
    },
  };
  const module = new vm.SourceTextModule(source, { context });
  await module.link((specifier) => {
    const exports = imports[specifier];
    assert.ok(exports, `Unexpected import: ${specifier}`);
    return new vm.SyntheticModule(
      Object.keys(exports),
      function () {
        for (const [name, value] of Object.entries(exports)) {
          this.setExport(name, value);
        }
      },
      { context },
    );
  });
  await module.evaluate();
  const extension = new module.namespace.default();
  extension.enable();
  return {
    extension,
    window,
    timers,
    signals,
    moves,
    map: () => mapped(null, { meta_window: window }),
    flush: () => {
      for (const [id, callback] of timers) {
        timers.delete(id);
        callback();
      }
    },
  };
}

test('places Gitify at the primary work area corner without an indicator', async () => {
  const f = await fixture();
  f.map();
  f.flush();
  assert.equal(f.moves.length, 4);
  assert.deepEqual(f.moves.at(-1), { x: 592, y: 40 });
  assert.equal(f.signals.size, 0);
});

test('centres under the tray icon and clamps at either edge', async () => {
  for (const [icon, x] of [
    [500, 300],
    [10, 8],
    [990, 592],
  ]) {
    const f = await fixture({ icon });
    f.map();
    f.flush();
    assert.deepEqual(f.moves.at(-1), { x, y: 40 });
  }
});

test('recognises the status icon ID exported by packaged Electron', async () => {
  const f = await fixture({ icon: 500, iconId: 'gitify_status_icon_1' });
  f.map();
  f.flush();
  assert.deepEqual(f.moves.at(-1), { x: 300, y: 40 });
});

test('keeps oversized windows at the left margin with and without an indicator', async () => {
  for (const icon of [null, 500]) {
    const f = await fixture({ width: 1200, icon });
    f.map();
    f.flush();
    assert.deepEqual(f.moves.at(-1), { x: 8, y: 40 });
  }
});

test('ignores other apps and recognises Electron development windows', async () => {
  for (const [wmClass, title, count] of [
    ['firefox', 'Gitify', 0],
    ['electron', 'Other app', 0],
    ['electron', 'Gitify', 4],
  ]) {
    const f = await fixture({ wmClass, title });
    f.map();
    f.flush();
    assert.equal(f.moves.length, count);
  }
});

test('does not move maximized, fullscreen, or zero-sized windows', async () => {
  for (const override of [
    { maximized_horizontally: true },
    { maximized_vertically: true },
    { is_fullscreen: () => true },
    { get_frame_rect: () => ({ width: 0, height: 0 }) },
  ]) {
    const f = await fixture();
    Object.assign(f.window, override);
    f.map();
    f.flush();
    assert.equal(f.moves.length, 0);
  }
});

test('unmanaging cancels pending placements', async () => {
  const f = await fixture();
  f.map();
  for (const callback of f.signals.values()) {
    callback();
  }
  f.flush();
  assert.equal(f.moves.length, 0);
  assert.equal(f.signals.size, 0);
});

test('remapping replaces timers and disable cancels all pending work', async () => {
  const f = await fixture();
  f.map();
  f.map();
  assert.equal(f.timers.size, 4);
  assert.equal(f.signals.size, 1);
  f.extension.disable();
  f.flush();
  assert.equal(f.moves.length, 0);
  assert.equal(f.signals.size, 0);
  assert.equal(f.timers.size, 0);
  f.extension.enable();
  f.map();
  f.flush();
  assert.equal(f.moves.length, 4);
});
