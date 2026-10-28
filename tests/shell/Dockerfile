ARG GNOME_TEST_IMAGE=ubuntu:26.04@sha256:0e73b71479e7bc5f006bca872e25c3cd680dc052a0116f90d63ae363537db0dd
FROM ${GNOME_TEST_IMAGE}

RUN apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
    dbus-x11 gir1.2-gdkpixbuf-2.0 gir1.2-gtk-4.0 gnome-shell gnome-shell-extension-appindicator python3-gi \
    && rm -rf /var/lib/apt/lists/* \
    && rmdir /run/systemd/seats \
    && groupadd --system gitify \
    && useradd --create-home --system --gid gitify gitify \
    && mkdir -p /run/dbus \
    && chown gitify:gitify /run/dbus

WORKDIR /work
COPY LICENSE LICENSE
COPY gitify@gitify.io gitify@gitify.io
COPY tests/shell tests/shell
COPY scripts/test-shell.sh scripts/test-shell.sh

USER gitify

CMD ["bash", "-c", "dbus-daemon --system --fork && exec bash scripts/test-shell.sh"]
