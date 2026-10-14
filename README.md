# 🐾 Gitify GNOME Shell extension

Anchors the [Gitify](https://gitify.io) window to its tray icon on GNOME.

Wayland leaves window placement entirely to the compositor. A native Wayland
client cannot ask to be placed next to a tray icon, so on GNOME the Gitify popup
opens wherever the shell decides to put it, usually the centre of the screen.
GNOME does not support the layer-shell protocol other compositors offer for
this, which leaves a shell extension as the only way to anchor the window.

This extension listens for the Gitify window being mapped and moves it directly
below the Gitify tray icon, falling back to the top-right corner of the primary
monitor when the icon cannot be located.

## 📋 Requirements

- GNOME Shell 50 or 51 on a Wayland session.
- Gitify 7.8 or newer.
- A tray. GNOME Shell has no tray of its own. Install the
  [AppIndicator and KStatusNotifierItem Support](https://extensions.gnome.org/extension/615/appindicator-support/)
  extension (or a distribution that ships it, such as Ubuntu). Without it the
  window is placed in the top-right corner instead of under the icon.

On an X11 session, or when Gitify's **Use X11 backend** setting is enabled,
Gitify positions its own window and this extension is not needed.

## 🚀 Install

After installing the extension, open its settings in GNOME Extensions or
Extension Manager for **Set up Gitify**. The page links to the Gitify download
and AppIndicator setup, and can open Gitify when a desktop installation is
detected. Portable AppImages may need to be opened from your files.

### 🌐 From extensions.gnome.org

[Gitify on GNOME Extensions](https://extensions.gnome.org/extension/10968/gitify/)
provides version 0.1.0 for GNOME Shell 50. For GNOME Shell 51, use a release
bundle whose metadata includes Shell 51 until that version is published on
extensions.gnome.org.

### 🎁 From a release bundle

Download `gitify@gitify.io.shell-extension.zip` from the
[latest release](https://github.com/gitify-app/gnome/releases/latest), then:

```shell
gnome-extensions install --force gitify@gitify.io.shell-extension.zip
```

GNOME Shell only discovers new extensions at login on Wayland, so log out and
back in, then enable it:

```shell
gnome-extensions enable gitify@gitify.io
```

Gitify 7.8.0 users should enable **Use white tray icon** in Tray settings for
the default dark GNOME panel. The automatic white-icon fix is in
[gitify#3297](https://github.com/gitify-app/gitify/pull/3297).

## 🔧 How it works

`extension.js` connects to the window manager's `map` signal. When the mapped
window belongs to Gitify (its app id contains `gitify`, or it is a development
build running under the stock Electron binary with the title `Gitify`), the
extension looks up the Gitify entry in the panel's status area, reads its screen
rectangle, and calls `move_frame` to centre the window below it, clamped to the
work area. Electron resizes its window shortly after mapping, so the placement
is re-applied a few times over the first half second. Pending timers are
cancelled when the window is unmanaged or the extension is disabled.

The tray lookup reads the `_indicator` field the AppIndicator extension stores
on each panel entry. That is a private field of a third-party extension, so it
is accessed defensively; if it goes away the extension degrades to corner
placement rather than failing.

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development, testing, and
release instructions.

## 👏 Credits

The original extension was written by [@SiriusCrain](https://github.com/SiriusCrain)
in [gitify-app/gitify#3297](https://github.com/gitify-app/gitify/pull/3297) and
moved here so it can be reviewed and distributed through extensions.gnome.org.

## 📄 License

[MIT](LICENSE)
