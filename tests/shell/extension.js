import GLib from 'gi://GLib';
import Gio from 'gi://Gio';
import Shell from 'gi://Shell';
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

Gio._promisify(Shell.Screenshot.prototype, 'screenshot', 'screenshot_finish');

export default class SmokeTest extends Extension {
  enable() {
    this._sources = new Set();
    this._desktopTest = GLib.getenv('GITIFY_DESKTOP_TEST') === '1';
    this._maps = 0;
    this._mapId = global.window_manager.connect('map', (_wm, actor) => {
      const window = actor.meta_window;
      if (!window.get_wm_class()?.toLowerCase().includes('gitify')) {
        return;
      }
      this._later(1000, () => {
        const frame = window.get_frame_rect();
        const area = Main.layoutManager.getWorkAreaForMonitor(Main.layoutManager.primaryIndex);
        const indicator = Object.values(Main.panel.statusArea).find((item) =>
          /^gitify(?:_status_icon_\d+)?$/i.test(item?._indicator?.id ?? ''),
        );
        const actor = indicator?.container ?? indicator;
        const icon = actor?.visible ? actor.get_transformed_extents().get_center() : null;
        const maxX = Math.max(area.x + 8, area.x + area.width - frame.width - 8);
        const expected = {
          x: Math.max(area.x + 8, area.x + area.width - frame.width - 8),
          y: area.y + 8,
        };
        if (icon) {
          expected.x = Math.max(area.x + 8, Math.min(maxX, Math.round(icon.x - frame.width / 2)));
        }
        const result = {
          passed:
            frame.width > 0 && frame.height > 0 && frame.x === expected.x && frame.y === expected.y,
          actual: { x: frame.x, y: frame.y, width: frame.width, height: frame.height },
          expected,
          trayFound: icon !== null,
          trayCenter: icon ? { x: icon.x, y: icon.y } : null,
          maps: ++this._maps,
        };
        if (this._desktopTest) {
          result.passed &&= icon !== null;
          if (this._initialSize) {
            result.passed &&=
              frame.width === this._initialSize.width && frame.height === this._initialSize.height;
          }
          GLib.file_set_contents(
            `${GLib.getenv('GITIFY_TEST_RESULT')}.progress`,
            JSON.stringify(result),
          );
          if (result.passed && this._maps === 1) {
            this._initialSize = { width: frame.width, height: frame.height };
            actor.get_parent().remove_child(actor);
            Main.panel._centerBox.add_child(actor);
            window.delete(global.get_current_time());
            this._later(700, () => this._activateTray());
            return;
          }
          this._capture(result);
          return;
        }
        GLib.file_set_contents(GLib.getenv('GITIFY_TEST_RESULT'), JSON.stringify(result));
      });
    });
    this._later(2000, () => {
      Main.overview.hide();
      this._client = Gio.Subprocess.new(
        this._desktopTest
          ? ['gitify', '--no-sandbox', '--ozone-platform=wayland', '--disable-gpu']
          : ['python3', GLib.getenv('GITIFY_TEST_CLIENT')],
        Gio.SubprocessFlags.NONE,
      );
      if (this._desktopTest) {
        this._later(4000, () => {
          Main.overview.hide();
          this._later(1000, () => this._openFromTray());
        });
      }
    });
  }

  _openFromTray() {
    const entry = Object.values(Main.panel.statusArea).find((item) =>
      /^gitify(?:_status_icon_\d+)?$/i.test(item?._indicator?.id ?? ''),
    );
    const actor = entry?.container ?? entry;
    if (!actor?.visible) {
      GLib.file_set_contents(
        GLib.getenv('GITIFY_TEST_RESULT'),
        JSON.stringify({
          passed: false,
          error: 'Gitify tray icon not found',
          entries: Object.entries(Main.panel.statusArea).map(([key, item]) => ({
            key,
            id: item?._indicator?.id,
            title: item?._indicator?.title,
            visible: item?.visible,
            containerVisible: item?.container?.visible,
          })),
        }),
      );
      return;
    }
    this._activateTray();
  }

  _activateTray() {
    const entry = Object.values(Main.panel.statusArea).find((item) =>
      /^gitify(?:_status_icon_\d+)?$/i.test(item?._indicator?.id ?? ''),
    );
    const actor = entry?.container ?? entry;
    const point = actor.get_transformed_extents().get_center();
    entry._indicator.open(point.x, point.y, global.get_current_time());
  }

  async _capture(result) {
    try {
      await this._snapshot();
      GLib.file_set_contents(GLib.getenv('GITIFY_TEST_RESULT'), JSON.stringify(result));
    } catch (error) {
      GLib.file_set_contents(
        GLib.getenv('GITIFY_TEST_RESULT'),
        JSON.stringify({ passed: false, error: String(error) }),
      );
    }
  }

  async _snapshot() {
    const stream = Gio.File.new_for_path(GLib.getenv('GITIFY_TEST_SCREENSHOT')).replace(
      null,
      false,
      Gio.FileCreateFlags.REPLACE_DESTINATION,
      null,
    );
    try {
      await new Shell.Screenshot().screenshot(false, stream);
    } finally {
      stream.close(null);
    }
  }

  _later(delay, callback) {
    const id = GLib.timeout_add(GLib.PRIORITY_DEFAULT, delay, () => {
      this._sources.delete(id);
      callback();
      return GLib.SOURCE_REMOVE;
    });
    this._sources.add(id);
  }

  disable() {
    global.window_manager.disconnect(this._mapId);
    for (const id of this._sources) {
      GLib.Source.remove(id);
    }
    this._client?.force_exit();
  }
}
