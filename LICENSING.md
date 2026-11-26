# Licensing Scope

Original `agy-skins` code and original SVG artwork (`assets/logo.svg`) are licensed under the project MIT license in [LICENSE](LICENSE). That license does not replace third-party licenses or assert ownership of third-party source.

## Included & Adapted Third-Party Material

| Material | Upstream & Revision | License & Treatment |
| --- | --- | --- |
| `WebWallGL` 3.0.1 (`sidecars/wallpaper_engine/webwallgl/engine/webwallgl.global.min.js`) | `oneincase/webwallgl` | MIT License. Shipped unmodified once in `sidecars/wallpaper_engine/webwallgl/engine/` with full license and notice retained in `third_party/webwallgl/`. |
| `dsh-wallpaper-engine` UI system, two-stage readability glass, rotation, typography, FX & parallax model | `elysia395/dsh-wallpaper-engine` (`fd3e01fd11cd5ad83f46940ab4d61d971cfbcf91`) | MIT License. Adapted natively for Google Antigravity DOM/SDK without pets, mascots, or avatars; notice retained in `third_party/dsh-wallpaper-engine/`. |
| `esbuild` emitted helper boilerplate | `evanw/esbuild` | MIT License retained in `third_party/esbuild/LICENSE`. The esbuild binary is a devDependency and is not redistributed in git. |

## Asset & Runtime Policy

- Steam Workshop wallpapers, images, videos, and fonts are **never** bundled or redistributed in this repository.
- Workshop directories are accessed strictly **read-only** via HMAC-SHA256 signed local loopback endpoints; `project.json` and Wallpaper Engine global settings are never modified.
- No Antigravity application binaries are ever modified, and running Antigravity windows are never forcibly killed or restarted.
