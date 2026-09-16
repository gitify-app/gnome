import gi

gi.require_version("Gtk", "4.0")
from gi.repository import Gtk

app = Gtk.Application(application_id="io.gitify.SmokeTest")


def activate(application):
    window = Gtk.ApplicationWindow(application=application, title="Gitify smoke test")
    window.set_default_size(400, 500)
    window.present()


app.connect("activate", activate)
app.run(None)
