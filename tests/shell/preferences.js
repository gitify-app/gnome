import Adw from 'gi://Adw';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Gtk from 'gi://Gtk';

Gio.resources_register(
  Gio.Resource.load('/usr/share/gnome-shell/org.gnome.Shell.Extensions.src.gresource'),
);
const { default: Preferences } = await import(
  `file://${GLib.getenv('XDG_DATA_HOME')}/gnome-shell/extensions/gitify@gitify.io/prefs.js`
);

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function widgets(root) {
  const result = [root];
  for (let child = root.get_first_child(); child; child = child.get_next_sibling()) {
    result.push(...widgets(child));
  }
  return result;
}

const delay = (ms) =>
  new Promise((resolve) => {
    GLib.timeout_add(GLib.PRIORITY_DEFAULT, ms, () => {
      resolve();
      return GLib.SOURCE_REMOVE;
    });
  });

const application = new Adw.Application({ application_id: 'io.gitify.PreferencesTest' });
let failure;
application.connect('activate', () => {
  const window = new Adw.PreferencesWindow({
    application,
    default_width: 640,
    default_height: 650,
  });
  const preferences = new Preferences({
    uuid: 'gitify@gitify.io',
    name: 'Gitify',
    path: `${GLib.getenv('XDG_DATA_HOME')}/gnome-shell/extensions/gitify@gitify.io`,
    dir: Gio.File.new_for_path(
      `${GLib.getenv('XDG_DATA_HOME')}/gnome-shell/extensions/gitify@gitify.io`,
    ),
  });
  preferences.fillPreferencesWindow(window);
  window.present();
  (async () => {
    await delay(500);
    const all = widgets(window);
    const open = all.find(
      (widget) => widget instanceof Gtk.Button && widget.label === 'Open Gitify',
    );
    const appRow = all.find(
      (widget) => widget instanceof Adw.ActionRow && widget.title === 'Gitify app',
    );
    const installed = ARGV[0] === 'installed';
    assert(open, 'Open Gitify button is missing');
    assert(
      open.sensitive === installed,
      'App detection does not match the installed desktop entry',
    );
    assert(
      installed || appRow.subtitle.includes('AppImage'),
      'Missing-app guidance must mention portable AppImages',
    );
    if (installed) {
      open.emit('clicked');
    }
    for (const title of ['Get Gitify', 'Set up AppIndicator']) {
      const link = all.find(
        (widget) => widget instanceof Gtk.Button && widget.tooltip_text === title,
      );
      assert(link, `Missing link: ${title}`);
      link.emit('clicked');
      await delay(500);
    }
    const actionsPath = GLib.getenv('GITIFY_PREFS_ACTIONS');
    for (let attempt = 0; attempt < 20; attempt++) {
      if (GLib.file_test(actionsPath, GLib.FileTest.EXISTS)) {
        const [, bytes] = GLib.file_get_contents(actionsPath);
        const actions = new TextDecoder().decode(bytes);
        if (
          actions.includes('https://gitify.io/') &&
          actions.includes('https://extensions.gnome.org/extension/615/appindicator-support/') &&
          (!installed || actions.includes('launch-gitify'))
        ) {
          const snapshot = new Gtk.Snapshot();
          Gtk.WidgetPaintable.new(window).snapshot(
            snapshot,
            window.get_width(),
            window.get_height(),
          );
          const texture = window.get_renderer().render_texture(snapshot.to_node(), null);
          texture.save_to_png(`${GLib.getenv('GITIFY_PREFS_SCREENSHOT_PREFIX')}-${ARGV[0]}.png`);
          print(`Preferences ${ARGV[0]}: detection, launch and links passed`);
          window.close();
          return;
        }
      }
      await delay(100);
    }
    throw new Error('Expected app/browser launches did not reach the desktop handlers');
  })().catch((error) => {
    failure = error;
    application.quit();
  });
});
await application.runAsync([]);
if (failure) {
  throw failure;
}
