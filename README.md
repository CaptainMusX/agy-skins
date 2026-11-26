# Wallpaper Engine for Antigravity (`agy-skins`)

> Bring Wallpaper Engine (`Scene`, `Web`, `Video`, `Picture`), unified two-stage readability **iOS Liquid Glass**, typography customization, cursor FX, and 3D parallax to **Google Antigravity** — cleanly, natively, and without patching application binaries.

**[中文文档](./README.zh.md)** · **[Installation Guide](./docs/INSTALL.md)** · **[Architecture & Parity](./docs/PARITY.zh.md)**

## Highlights

- **Unified Workbench Surface (Zero Visual Seams)**: Clears Antigravity shell/titlebar/body/sheet layers onto one continuous wallpaper+scrim backdrop, remaps `--onyx-*` theme tokens (`--onyx-frame: transparent`, `--onyx-raised`, `--onyx-selected`, `--sidebar-secondary`), strips the opaque gradient strip above `.surface-composer`, and hosts frosted composer glass on `::before` so floating popups keep exact anchoring.
- **Two-Stage Readability Liquid Glass (Modeled on [`elysia395/dsh-wallpaper-engine`](https://github.com/elysia395/dsh-wallpaper-engine))**: Luminance-clamped readability floors (`READABILITY_FLOOR = 0.48` light / `READABILITY_FLOOR_DARK = 0.59` dark) blended via `color-mix` guarantee ≥ 4.5:1 contrast with 5 factory presets and up to 8 user preset slots + JSON import/export.
- **Native In-Host `we-picker` Settings UI (Zero `<iframe>`)**: Mounts `.we-picker` directly inside Antigravity Settings under the English **`Wallpaper`** nav item (matching native sidebar typography with no icon), presenting full Simplified Chinese controls inside, with spinning `.we-vinyl` cover disc, in-page drill-down library modal, CD-rack / grid layouts, collapsible sections, and bottom tab resets.
- **WebWallGL 3.0.1 Scene & Web Engine**: Runs Wallpaper Engine `.pkg` scenes, Web wallpapers, videos (MP4/WebM/MKV), Picture slideshows, URLs, and Bing daily wallpapers inside a sandboxed media frame with GPU auto-quality and `15 / 30 / 60 FPS` caps.
- **Signed Loopback Media Origin (HTTP 206 Range)**: Ephemeral `127.0.0.1:0` server secured by HMAC-SHA256 (`we-media.key`, mode `0600`) with CORS preflight for Antigravity's native host origin and `studioToken` API authentication — zero `file:///` failures and zero `BypassCSP` hacks.
- **Split-Browser Even-Odd Cutout & TitleBarOverlay**: Automatically cuts crisp holes around `[data-has-browser-hole="true"]` panes and syncs native window controls.

## Quick Start

```bash
npm install
npm run install:agy
```

On Windows you can also double-click `install.bat`, or run `node scripts/install.mjs --no-launch` to build and deploy into `%USERPROFILE%\.gemini\config\plugins\agy-skins`. When enabled in Antigravity, the built-in `wallpaper_engine` sidecar (`restart_policy: "always"`) starts automatically alongside Antigravity whenever launched with `--remote-debugging-port=0`.

## Architecture Overview

| Component | Path | Purpose |
| --- | --- | --- |
| Antigravity Plugin Manifest | [`plugin.json`](./plugin.json) | Registers **`Wallpaper`** (`agy-skins`) v2.1.4 metadata |
| Sidecar & Standalone Daemon | [`sidecars/wallpaper_engine/server.mjs`](./sidecars/wallpaper_engine/server.mjs) | Hosts `sidecar_sdk` Aux UI, Studio API, CDP injector, rotation & media server |
| Signed Media Origin | [`sidecars/wallpaper_engine/media_server.mjs`](./sidecars/wallpaper_engine/media_server.mjs) | HMAC-SHA256 range streaming + token-authenticated loopback `/studio-api/*` CORS |
| Workshop Scanner | [`sidecars/wallpaper_engine/we_scanner.mjs`](./sidecars/wallpaper_engine/we_scanner.mjs) | Async Steam/Workshop discovery + `.pkg` / PNG / JPEG / GIF parsing |
| Frontend Runtime | [`src/engine/runtime-entry.js`](./src/engine/runtime-entry.js) | Backdrop, Glass (`GlassController`), Fonts, FX, Parallax, ThemeFollow, Titlebar, Native `HostEntries` |
| Shared `we-picker` UI | [`src/ui/we-picker-app.js`](./src/ui/we-picker-app.js) | Shared 7-tab `dsh-wallpaper-engine` UI across Settings, `Alt+Shift+W`, and Aux Sidecar |

## License & Third-Party Notices

Licensed under the MIT License ([`LICENSE`](./LICENSE)). Please review [`LICENSING.md`](./LICENSING.md) and [`THIRD-PARTY-NOTICES.md`](./THIRD-PARTY-NOTICES.md) for [`elysia395/dsh-wallpaper-engine`](https://github.com/elysia395/dsh-wallpaper-engine) and WebWallGL attribution details.
