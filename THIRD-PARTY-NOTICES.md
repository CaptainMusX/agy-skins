# Third-Party Notices & Attributions

`agy-skins` incorporates or draws architectural inspiration from the following open-source projects:

## 1. WebWallGL (`oneincase/webwallgl`)
- **Upstream**: [`oneincase/webwallgl`](https://github.com/oneincase/webwallgl) (v3.0.1)
- **License**: MIT License (Copyright © 2026 oneincase)
- **Details**: `sidecars/wallpaper_engine/webwallgl/engine/webwallgl.global.min.js` is bundled unmodified as the isolated Scene/Web renderer inside the `127.0.0.1` loopback media origin. Full license and notice are retained in [`third_party/webwallgl/`](./third_party/webwallgl/LICENSE).

## 2. `dsh-wallpaper-engine` (`elysia395/dsh-wallpaper-engine`)
- **Upstream**: [`elysia395/dsh-wallpaper-engine`](https://github.com/elysia395/dsh-wallpaper-engine) (`fd3e01fd11cd5ad83f46940ab4d61d971cfbcf91`)
- **License**: MIT License (Copyright © 2026 elysia395)
- **Details**: The two-stage luminance readability floor (`READABILITY_FLOOR` / `READABILITY_FLOOR_DARK`), preset management UX, spinning `.we-vinyl` cover disc, sliding `.we-tabs` navigation, drill-down `.we-picker__modal` gallery, rotation playlist lifecycle, typography/FX/parallax model, and backdrop layer lifecycle in `agy-skins` (v2.0.0–v2.2.0+) are adapted directly from `elysia395/dsh-wallpaper-engine` for Google Antigravity 2.0's `--onyx-*` design token architecture. Notice retained in [`third_party/dsh-wallpaper-engine/`](./third_party/dsh-wallpaper-engine/LICENSE).

## 3. `esbuild` (`evanw/esbuild`)
- **License**: MIT License retained in [`third_party/esbuild/LICENSE`](./third_party/esbuild/LICENSE).
