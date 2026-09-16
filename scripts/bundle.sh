#!/usr/bin/env bash
# Build the zip that extensions.gnome.org and `gnome-extensions install` accept.
#
# Uses `gnome-extensions pack` when the GNOME Shell tooling is available and a
# plain zip otherwise, so CI runners without a desktop produce the same bundle.
set -euo pipefail

cd "$(dirname "$0")/.."

UUID=$(node -p "JSON.parse(require('node:fs').readFileSync('gitify@gitify.io/metadata.json', 'utf8')).uuid")
SRC_DIR="$UUID"
OUT_DIR="dist"
OUT_FILE="$OUT_DIR/$UUID.shell-extension.zip"

# Syntax check only. The `gi://` and `resource:///` imports resolve inside
# GNOME Shell, not Node, so this cannot execute the file.
node --check "$SRC_DIR/extension.js"
node --check "$SRC_DIR/prefs.js"

mkdir -p "$OUT_DIR"
rm -f "$OUT_FILE"

if command -v gnome-extensions >/dev/null 2>&1; then
  gnome-extensions pack --force --extra-source="$PWD/LICENSE" --out-dir "$OUT_DIR" "$SRC_DIR"
else
  (cd "$SRC_DIR" && zip -q -r "../$OUT_FILE" extension.js prefs.js metadata.json)
  zip -q -j "$OUT_FILE" LICENSE
fi

echo "Packed $OUT_FILE"
unzip -l "$OUT_FILE"
