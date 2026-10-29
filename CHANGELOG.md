# Changelog

## [0.2.1](https://github.com/gitify-app/gnome/compare/v0.2.0...v0.2.1) (2026-10-29)


### 🐛 Bug Fixes

* **ci:** secure shared Renovate validator workflow ([8a3eccf](https://github.com/gitify-app/gnome/commit/8a3eccf8ff75c67ac8cb7cb9ea5c48cf289a0666))
* format VS Code settings to unblock CI ([81e87b1](https://github.com/gitify-app/gnome/commit/81e87b1985365a787c1ee8ee8aa24b6664c8719f))
* **sonar:** await outside loops in preferences smoke test (javascript:S9382) ([df3d565](https://github.com/gitify-app/gnome/commit/df3d5653c01fa09f10b908e368c9f3bad95260ca))
* **sonar:** await outside loops in preferences smoke test (javascript:S9382) ([5a577c2](https://github.com/gitify-app/gnome/commit/5a577c2e16330d78b625022081f3396d418dc8ea))
* **sonar:** explicitly ignore unhandled screenshot promise (javascript:S9383) ([11de8c5](https://github.com/gitify-app/gnome/commit/11de8c5c5ea1224ff0e8c6659378279ea1cb999a))
* **sonar:** explicitly ignore unhandled screenshot promise (javascript:S9383) ([9798e76](https://github.com/gitify-app/gnome/commit/9798e768e9c0cb8606dc98b318683f8d2943daca))
* **sonar:** pin base image by digest with version comment (docker:S8431) ([ba20a62](https://github.com/gitify-app/gnome/commit/ba20a622e609eb145efa5302423ca740c8be703e))
* **sonar:** run container smoke test as non-root user (docker:S6471) ([7735b37](https://github.com/gitify-app/gnome/commit/7735b3727292aaf37cf2a74e046a4b3dfb436123))
* **sonar:** run container smoke test as non-root user (docker:S6471) ([9538315](https://github.com/gitify-app/gnome/commit/95383159089fe2c815aae5b1235aaadd871fa9ae))
* **sonar:** sort apt packages alphabetically in test image (docker:S7018) ([276c7a1](https://github.com/gitify-app/gnome/commit/276c7a1ec48203335b69a0358ff4d942e2189840))
* **sonar:** sort apt packages alphabetically in test image (docker:S7018) ([f130509](https://github.com/gitify-app/gnome/commit/f1305095b256a3d06391ba2e7c69800d2197033a))
* **sonar:** use renovate-native tag pin and suppress confusing digest smell (docker:S8431) ([71b8a76](https://github.com/gitify-app/gnome/commit/71b8a76f482c14a562cc63d2d9cf266b49d03684))


### 📚 Documentation

* add emoji headings and a contributing guide ([222ec6d](https://github.com/gitify-app/gnome/commit/222ec6d0a914f38ccd70b8214719e2313cc2ec11))
* add emoji headings and a contributing guide ([2e7f256](https://github.com/gitify-app/gnome/commit/2e7f2569a04751964a821e56267814fbd63a0fa9))
* apply oxfmt formatting to the contributing guide ([ecf3062](https://github.com/gitify-app/gnome/commit/ecf3062435041fadee6170b3fcbca0969585981b))
* keep the title plain and emoji every section heading ([04e87e1](https://github.com/gitify-app/gnome/commit/04e87e120c6be96a447041ce9e89740dae8e40ea))
* keep the title plain and emoji every section heading ([f83f8ef](https://github.com/gitify-app/gnome/commit/f83f8ef9478c394367d19943177cb38afca41c41))
* use the organization profile's brand emoji in the README title ([6b53190](https://github.com/gitify-app/gnome/commit/6b5319031af394a519b90f8684e8e1fa26e940c2))


### 🤖 Continuous Integration

* allow trusted Renovate validator to follow main\n\nCo-authored-by: Copilot App &lt;223556219+Copilot@users.noreply.github.com&gt; ([8e17eeb](https://github.com/gitify-app/gnome/commit/8e17eeb88929942c5a29ac7d261dd798600ccbba))
* document Renovate validator ref-pin exception ([9e33deb](https://github.com/gitify-app/gnome/commit/9e33deb7e58c3b62bb4bd12fe21ca8da471cd3d6))
* normalize YAML file endings ([9ea8248](https://github.com/gitify-app/gnome/commit/9ea8248989e80e11d670a0d1bd16af3954d4cb7e))
* preserve YAML trailing newlines ([42cd753](https://github.com/gitify-app/gnome/commit/42cd753e1a15998d9ce75d0a0ad2b7a79ad84d05))
* **renovate:** use the shared Renovate config validator ([cbed8b7](https://github.com/gitify-app/gnome/commit/cbed8b745cb04459ef4504a34b44c3381dae69c6))
* **renovate:** use the shared Renovate config validator ([571147d](https://github.com/gitify-app/gnome/commit/571147d4be2324d55368ab55245abc218ccbd8eb))
* trust Renovate validator on main ([35940f7](https://github.com/gitify-app/gnome/commit/35940f793cc96d6bede652b4447b9ae5b229acb5))

## [0.2.0](https://github.com/gitify-app/gnome/compare/v0.1.0...v0.2.0) (2026-09-30)


### 🚀 Features

* guide users through Gitify setup from extension preferences ([8274bde](https://github.com/gitify-app/gnome/commit/8274bde23f6ef94efe302e53b554f5575239e523))
* support GNOME Shell 51 ([2bf24fa](https://github.com/gitify-app/gnome/commit/2bf24faa139d8ba2c2c1239c84fcddfd98928472))


### 📚 Documentation

* link the GNOME extension submission ([6318d37](https://github.com/gitify-app/gnome/commit/6318d37317ad771dbf6626fd7e60433623a2edd9))

## 0.1.0 (2026-09-16)


### 🚀 Features

* add Gitify GNOME Shell extension and repository tooling ([7717dfd](https://github.com/gitify-app/gnome/commit/7717dfddd94d7b02db9020004bfd107aa59bf873))


### 🐛 Bug Fixes

* prepare GNOME 50 extension submission ([612ec7a](https://github.com/gitify-app/gnome/commit/612ec7a8f5277c79ef58a2fb7076a999537d2592))
* validate tray placement on GNOME 46 and 50 ([a740912](https://github.com/gitify-app/gnome/commit/a740912b92c28839518f9153f450f8d402e69b21))


### 🤖 Continuous Integration

* start releases at 0.1.0 ([518df85](https://github.com/gitify-app/gnome/commit/518df8546a21365be038c507e37a5ec7acea3b25))
