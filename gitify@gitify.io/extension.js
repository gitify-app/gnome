import GLib from 'gi://GLib';
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

/** Gap between the window and the panel or screen edge, in logical pixels. */
const MARGIN = 8;

/**
 * Electron resizes its window shortly after the surface is mapped, which would
 * undo a single placement. Re-apply a few times over the first half second
 * rather than guess when it has settled.
 */
const REAPPLY_DELAYS_MS = [0, 60, 180, 400];

export default class GitifyExtension extends Extension {
  enable() {
    /** @type {Map<import('gi://Meta').Window, { ids: Set<number>, unmanagingId: number }>} */
    this._pending = new Map();
    this._mapId = global.window_manager.connect('map', (_wm, actor) =>
      this._onWindowMapped(actor.meta_window),
    );
  }

  disable() {
    if (this._mapId) {
      global.window_manager.disconnect(this._mapId);
      this._mapId = null;
    }

    for (const window of this._pending.keys()) {
      this._cancel(window);
    }
    this._pending = null;
  }

  _onWindowMapped(window) {
    if (!isGitifyWindow(window)) {
      return;
    }

    // A window that is mapped again before its previous placement finished
    // (hide, then show) starts over.
    this._cancel(window);

    const ids = new Set();
    // Electron destroys the surface on hide. Drop pending timers so they never
    // touch a window the shell has already let go of.
    const unmanagingId = window.connect('unmanaging', () => this._cancel(window));
    this._pending.set(window, { ids, unmanagingId });

    for (const delay of REAPPLY_DELAYS_MS) {
      const id = GLib.timeout_add(GLib.PRIORITY_DEFAULT, delay, () => {
        ids.delete(id);
        place(window);
        if (ids.size === 0) {
          this._cancel(window);
        }
        return GLib.SOURCE_REMOVE;
      });
      ids.add(id);
    }
  }

  _cancel(window) {
    const entry = this._pending.get(window);
    if (!entry) {
      return;
    }

    for (const id of entry.ids) {
      GLib.Source.remove(id);
    }
    window.disconnect(entry.unmanagingId);
    this._pending.delete(window);
  }
}

/**
 * Move the window directly below the tray icon, or into the top-right corner
 * of the work area when the icon cannot be found.
 *
 * @param {import('gi://Meta').Window} window
 */
function place(window) {
  if (window.is_fullscreen() || window.get_maximized()) {
    return;
  }

  const frame = window.get_frame_rect();
  if (frame.width === 0 || frame.height === 0) {
    return;
  }

  const workArea = Main.layoutManager.getWorkAreaForMonitor(Main.layoutManager.primaryIndex);
  const minX = workArea.x + MARGIN;
  const maxX = workArea.x + workArea.width - frame.width - MARGIN;
  const icon = trayIconRect();

  const x =
    icon === null ? maxX : clamp(Math.round(icon.get_center().x - frame.width / 2), minX, maxX);

  window.move_frame(false, x, workArea.y + MARGIN);
}

/**
 * Packaged builds expose the `gitify` app id. Development builds run under the
 * stock Electron binary, so fall back to the window title for those.
 *
 * @param {import('gi://Meta').Window} window
 * @returns {boolean}
 */
function isGitifyWindow(window) {
  const wmClass = window.get_wm_class()?.toLowerCase() ?? '';

  return wmClass.includes('gitify') || (wmClass === 'electron' && window.get_title() === 'Gitify');
}

/**
 * Screen rectangle of the Gitify tray icon, or `null` when it is not showing.
 *
 * GNOME Shell has no tray of its own. The icon is drawn by the AppIndicator
 * extension, which stores its StatusNotifierItem on each panel entry as
 * `_indicator`. That is a private field, so it is read defensively and its
 * absence simply means "no anchor".
 *
 * @returns {import('gi://Graphene').Rect | null}
 */
function trayIconRect() {
  const entry = Object.values(Main.panel.statusArea).find(
    (item) => item?._indicator?.id?.toLowerCase() === 'gitify',
  );
  const actor = entry?.container ?? entry;

  return actor?.visible ? actor.get_transformed_extents() : null;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
