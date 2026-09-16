// SPDX-License-Identifier: MIT
import Adw from 'gi://Adw';
import Gio from 'gi://Gio';
import GioUnix from 'gi://GioUnix';
import Gtk from 'gi://Gtk';
import { ExtensionPreferences } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class GitifyPreferences extends ExtensionPreferences {
  fillPreferencesWindow(window) {
    window.title = 'Set up Gitify';
    const page = new Adw.PreferencesPage({
      title: 'Set up Gitify',
      icon_name: 'dialog-information-symbolic',
    });
    window.add(page);

    const appGroup = new Adw.PreferencesGroup({
      title: 'Gitify on GNOME',
      description:
        'Gitify brings your GitHub notifications to the desktop. This companion extension places its window below the tray icon on GNOME Wayland. Install the Gitify app separately to get started.',
    });
    page.add(appGroup);

    const appRow = new Adw.ActionRow({ title: 'Gitify app' });
    const openButton = new Gtk.Button({ label: 'Open Gitify', valign: Gtk.Align.CENTER });
    appRow.add_suffix(openButton);
    appRow.activatable_widget = openButton;
    appGroup.add(appRow);

    let app;
    const refresh = () => {
      app = Gio.AppInfo.get_all().find(
        (info) =>
          info instanceof GioUnix.DesktopAppInfo &&
          (['gitify.desktop', 'com.electron.gitify.desktop'].includes(info.get_id()) ||
            info.get_startup_wm_class()?.toLowerCase() === 'gitify'),
      );
      openButton.sensitive = Boolean(app);
      appRow.subtitle = app
        ? 'Gitify is ready to open.'
        : 'Gitify wasn’t detected. If you use a portable AppImage, open it from your files.';
    };
    refresh();
    window.connect('notify::is-active', () => {
      if (window.is_active) {
        refresh();
      }
    });
    openButton.connect('clicked', () => {
      try {
        app?.launch([], window.get_display().get_app_launch_context());
      } catch {
        window.add_toast(
          new Adw.Toast({ title: 'Could not open Gitify. Try opening it from your apps.' }),
        );
      }
    });

    addLink(
      appGroup,
      window,
      'Get Gitify',
      'Download Gitify for Linux from the official website.',
      'https://gitify.io/',
      'Download',
    );

    const trayGroup = new Adw.PreferencesGroup({
      title: 'Tray support',
      description:
        'GNOME needs AppIndicator support to show Gitify’s tray icon. Ubuntu may already include it. Without a tray icon, this extension places Gitify in the top-right corner.',
    });
    page.add(trayGroup);
    addLink(
      trayGroup,
      window,
      'Set up AppIndicator',
      'Open the extension page for installation instructions.',
      'https://extensions.gnome.org/extension/615/appindicator-support/',
      'View extension',
    );
  }
}

function addLink(group, window, title, subtitle, uri, label) {
  const row = new Adw.ActionRow({ title, subtitle });
  const button = new Gtk.Button({
    label,
    tooltip_text: title,
    valign: Gtk.Align.CENTER,
  });
  button.update_property([Gtk.AccessibleProperty.LABEL], [title]);
  button.connect('clicked', () => {
    const launcher = new Gtk.UriLauncher({ uri });
    launcher.launch(window, null, (source, result) => {
      try {
        source.launch_finish(result);
      } catch (error) {
        if (!error.matches(Gtk.DialogError, Gtk.DialogError.DISMISSED)) {
          window.add_toast(
            new Adw.Toast({ title: 'Could not open the link. Check your default browser.' }),
          );
        }
      }
    });
  });
  row.add_suffix(button);
  row.activatable_widget = button;
  group.add(row);
}
