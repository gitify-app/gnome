#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

for command in gnome-shell gnome-extensions gsettings dbus-run-session python3; do
  command -v "$command" >/dev/null || { echo "Missing prerequisite: $command" >&2; exit 1; }
done

test_root=$(mktemp -d)
trap 'rm -rf "$test_root"' EXIT
export XDG_DATA_HOME="$test_root/data"
export XDG_CONFIG_HOME="$test_root/config"
export XDG_CACHE_HOME="$test_root/cache"
export XDG_RUNTIME_DIR="$test_root/runtime"
export GITIFY_TEST_RESULT="$test_root/result.json"
export GITIFY_TEST_SCREENSHOT="${GITIFY_TEST_SCREENSHOT:-$test_root/desktop.png}"
export GITIFY_TEST_CLIENT="$PWD/tests/shell/client.py"
export GITIFY_TEST_CHECK="$PWD/tests/shell/check-result.py"
export GITIFY_TEST_BUNDLE="$test_root/gitify@gitify.io.shell-extension.zip"
export WAYLAND_DISPLAY=wayland-gitify-test
export XDG_SESSION_TYPE=wayland
export XDG_CURRENT_DESKTOP=GNOME
export GDK_BACKEND=wayland
export LIBGL_ALWAYS_SOFTWARE=1
mkdir -p "$XDG_DATA_HOME/gnome-shell/extensions" "$XDG_RUNTIME_DIR"
chmod 700 "$XDG_RUNTIME_DIR"
gnome-extensions pack --force --out-dir "$test_root" gitify@gitify.io
cp -r tests/shell "$XDG_DATA_HOME/gnome-shell/extensions/smoke-test@gitify.io"

dbus-run-session -- bash -eu -o pipefail <<'SESSION'
gnome-extensions install "$GITIFY_TEST_BUNDLE"
if [[ "${GITIFY_DESKTOP_TEST:-0}" == 1 ]]; then
  gsettings set org.gnome.shell enabled-extensions "['ubuntu-appindicators@ubuntu.com', 'gitify@gitify.io', 'smoke-test@gitify.io']"
else
  gsettings set org.gnome.shell enabled-extensions "['gitify@gitify.io', 'smoke-test@gitify.io']"
fi
gsettings set org.gnome.shell disable-user-extensions false
gsettings set org.gnome.desktop.notifications show-banners false
gnome-shell --headless --wayland --no-x11 --virtual-monitor 1280x800 --wayland-display "$WAYLAND_DISPLAY" >"$XDG_RUNTIME_DIR/shell.log" 2>&1 &
shell_pid=$!
trap 'kill "$shell_pid" 2>/dev/null || true; wait "$shell_pid" 2>/dev/null || true' EXIT
for ((attempt = 0; attempt < 45; attempt++)); do
  if [[ -f "$GITIFY_TEST_RESULT" ]]; then
    if ! python3 "$GITIFY_TEST_CHECK"; then
      cat "$XDG_RUNTIME_DIR/shell.log" >&2
      exit 1
    fi
    exit 0
  fi
  kill -0 "$shell_pid" 2>/dev/null || break
  sleep 1
done
cat "$XDG_RUNTIME_DIR/shell.log" >&2
if [[ -f "$GITIFY_TEST_RESULT.progress" ]]; then
  cat "$GITIFY_TEST_RESULT.progress" >&2
fi
echo 'GNOME smoke test did not produce a result.' >&2
exit 1
SESSION
