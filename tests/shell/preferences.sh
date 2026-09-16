#!/usr/bin/env bash
set -euo pipefail
export GI_TYPELIB_PATH="/usr/lib/gnome-shell/girepository-1.0${GI_TYPELIB_PATH:+:$GI_TYPELIB_PATH}"
export LD_LIBRARY_PATH="/usr/lib/gnome-shell${LD_LIBRARY_PATH:+:$LD_LIBRARY_PATH}"
export GSETTINGS_SCHEMA_DIR=/usr/share/glib-2.0/schemas
export XDG_DATA_DIRS="$XDG_DATA_HOME"

export GITIFY_PREFS_ACTIONS="$XDG_RUNTIME_DIR/prefs-actions"
export GITIFY_PREFS_SCREENSHOT_PREFIX="${GITIFY_PREFS_SCREENSHOT_PREFIX:-$XDG_RUNTIME_DIR/preferences}"
mkdir -p "$XDG_DATA_HOME/applications" "$XDG_CONFIG_HOME"
cat >"$XDG_DATA_HOME/applications/test-browser.desktop" <<EOF
[Desktop Entry]
Type=Application
Name=Test browser
Exec=python3 $PWD/tests/shell/open-action.py %u
MimeType=x-scheme-handler/https;
EOF
cat >"$XDG_CONFIG_HOME/mimeapps.list" <<'EOF'
[Default Applications]
x-scheme-handler/https=test-browser.desktop
EOF
timeout 30 gjs -m tests/shell/preferences.js missing
rm "$GITIFY_PREFS_ACTIONS"
cat >"$XDG_DATA_HOME/applications/gitify.desktop" <<EOF
[Desktop Entry]
Type=Application
Name=Gitify
Exec=python3 $PWD/tests/shell/open-action.py launch-gitify
StartupWMClass=Gitify
EOF
timeout 30 gjs -m tests/shell/preferences.js installed
