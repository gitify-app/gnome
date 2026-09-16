ARG GNOME_TEST_IMAGE=ubuntu:24.04@sha256:69cecf4bbf72d2d44a9eef1b71fb98c7fb973d78af11399deccef19beb008ad9
FROM ${GNOME_TEST_IMAGE}

RUN apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
    gnome-shell dbus-x11 python3-gi gir1.2-gtk-4.0 gir1.2-gdkpixbuf-2.0 gnome-shell-extension-appindicator \
    && rm -rf /var/lib/apt/lists/* \
    && rmdir /run/systemd/seats

WORKDIR /work
COPY gitify@gitify.io gitify@gitify.io
COPY tests/shell tests/shell
COPY scripts/test-shell.sh scripts/test-shell.sh

CMD ["bash", "-c", "mkdir -p /run/dbus && dbus-daemon --system --fork && exec bash scripts/test-shell.sh"]
