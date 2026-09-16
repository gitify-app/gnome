import json
import os
from pathlib import Path

result_path = Path(os.environ["GITIFY_TEST_RESULT"])
result = json.loads(result_path.read_text())

if result["passed"] and os.environ.get("GITIFY_DESKTOP_TEST") == "1":
    import gi

    gi.require_version("GdkPixbuf", "2.0")
    from gi.repository import GdkPixbuf

    screenshot = GdkPixbuf.Pixbuf.new_from_file(os.environ["GITIFY_TEST_SCREENSHOT"])
    pixels = screenshot.get_pixels()
    stride = screenshot.get_rowstride()
    channels = screenshot.get_n_channels()
    cx = round(result["trayCenter"]["x"])
    cy = round(result["trayCenter"]["y"])
    bright_pixels = 0
    # The test desktop is unscaled, with a black panel and a 16px tray icon.
    for y in range(max(0, cy - 8), min(screenshot.get_height(), cy + 8)):
        for x in range(max(0, cx - 8), min(screenshot.get_width(), cx + 8)):
            offset = y * stride + x * channels
            if min(pixels[offset : offset + 3]) >= 160:
                bright_pixels += 1

    result["trayBrightPixels"] = bright_pixels
    result["trayIconVisible"] = bright_pixels >= 8
    result["passed"] = result["trayIconVisible"]
    result_path.write_text(json.dumps(result))

print(json.dumps(result))
raise SystemExit(0 if result["passed"] else 1)
