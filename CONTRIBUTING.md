# Contributing to Gitify GNOME Shell extension

Thanks for your interest in contributing to the Gitify GNOME Shell extension!

This repository holds the GNOME Shell extension only. See the [README](README.md)
for what it does and how to install it, and [Gitify][gitify-repo] for the app
itself.

## Development

Tooling is unified through [Vite+](https://vite.plus) (oxlint and oxfmt), the
same setup as the main Gitify repository.

```shell
pnpm install

# Lint and format checks
pnpm check

# Auto-fix formatting and lint issues
pnpm check:fix

# Placement and lifecycle regression tests
pnpm test

# Real GNOME Wayland smoke test, with GNOME Shell and PyGObject installed
pnpm test:shell

# Build dist/gitify@gitify.io.shell-extension.zip
pnpm bundle
```

The extension itself can only run inside GNOME Shell. To try a change without
logging out, install it into your user extensions directory and start a nested
shell:

```shell
ln -s "$PWD/gitify@gitify.io" ~/.local/share/gnome-shell/extensions/gitify@gitify.io
dbus-run-session -- gnome-shell --devkit --wayland
```

GNOME 45–48 use `--nested` instead of `--devkit`. GNOME 49 and newer may
require the `mutter-devkit` package. See the
[GNOME debugging guide](https://gjs.guide/extensions/development/debugging.html).

See [desktop validation](docs/testing.md) for the isolated compositor test,
Gitify tray test, and VM checks before release.

Then enable it inside the nested session and launch Gitify from a terminal in
that session. Shell logs, including anything the extension prints, are
available with:

```shell
journalctl -f -o cat /usr/bin/gnome-shell
```

## Releasing

Releases are cut by [release-please](https://github.com/googleapis/release-please)
from conventional commits on `main`. Merging the release PR tags the repo,
updates `CHANGELOG.md` and the `version-name` in `metadata.json`, and attaches
the packed `.shell-extension.zip` to the GitHub release.

Publishing to extensions.gnome.org is a manual step: upload the zip from the
release at <https://extensions.gnome.org/upload/>. The site assigns the integer
`version` in `metadata.json` itself, so that field is omitted here.

<!-- LINK LABELS -->
[gitify-repo]: https://github.com/gitify-app/gitify
