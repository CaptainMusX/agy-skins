# Antigravity Wallpaper Engine (`agy-skins`)

> Bring Wallpaper Engine (`Scene`, `Web`, `Video`, `Picture`), single-rule CSSOM **Liquid Glass**, typography customization, cursor FX, and 3D parallax to **Google Antigravity** — cleanly, safely, and without patching application binaries.

**[中文文档](./README.zh.md)** · **[Installation Guide](./docs/INSTALL.md)** · **[Parity Matrix](./docs/PARITY.zh.md)**

## Highlights

- **WebWallGL 3.0.1 Scene & Web Engine**: Runs Wallpaper Engine `.pkg` scenes, Web wallpapers, videos (MP4/WebM/MKV), Picture slideshows, URLs, and Bing daily wallpapers inside a sandboxed iframe with automatic GPU quality scaling and frame-rate capping (`15 / 30 / 60 FPS`).
- **Signed Loopback Media Origin (HTTP 206 Range)**: Ephemeral `127.0.0.1:0` server secured by HMAC-SHA256 tokens (`we-media.key`, mode `0600`) with real-path & anti-symlink confinement — zero `file:///` failures and zero CSP bypass hacks.
- **Single-Rule CSSOM Liquid Glass**: Uses Antigravity's own theme variables (`--background`, `--sidebar`, `--card`, `--primary`) and mutates CSSOM properties directly on a single `<style>` rule for zero-flicker sliders, plus React Fiber xterm transparency.
- **Split-Browser Even-Odd Cutout**: Automatically tracks Antigravity's `[data-has-browser-hole="true"]` / `[data-browser-hole]` split panel using an `evenodd` `clip-path` polygon so embedded web previews never look washed out.
- **Antigravity Native Surfaces**:
  - **Aux Sidecar Pane** (`sidecar_sdk`) integrated directly into Antigravity's plugin sidebar.
  - **`Settings → Appearance` Entry Card** + global **`Alt+Shift+W`** Studio Modal.
  - **`electronNative.setTitleBarOverlay`** theme-adaptive window controls sync.
  - **Non-destructive CDP Shortcut Fixer** checks `.lnk` / start shortcuts for `--remote-debugging-port=0` with a one-click fix button.

## Quick Start

### Prerequisites
- Node.js **22+**
- Google Antigravity running with `--remote-debugging-port=0` (standard for Antigravity IDE/Manager; see **Advanced → CDP Health** in Studio if needed).

### Install

```bash
npm install
npm run install:agy
```

Or on Windows: double-click `install.bat` (or pass `--no-launch` if restarting Antigravity's built-in plugin host to load the sidecar automatically).

## Architecture Overview

| Component | Path | Purpose |
| --- | --- | --- |
| Antigravity Plugin Manifest | [`plugin.json`](./plugin.json) | Registers `agy-skins` plugin metadata and prompt hints |
| Sidecar & Standalone Daemon | [`sidecars/wallpaper_engine/server.mjs`](./sidecars/wallpaper_engine/server.mjs) | Hosts `sidecar_sdk` Aux UI, Studio API, CDP injector, rotation & media server |
| Signed Media Origin | [`sidecars/wallpaper_engine/media_server.mjs`](./sidecars/wallpaper_engine/media_server.mjs) | HMAC-SHA256 signed range streaming + token-gated `/studio/<token>/` |
| Workshop Scanner | [`sidecars/wallpaper_engine/we_scanner.mjs`](./sidecars/wallpaper_engine/we_scanner.mjs) | Async Steam/Workshop discovery + `.pkg` / PNG / JPEG / GIF parsing |
| Frontend Runtime | [`src/engine/runtime-entry.js`](./src/engine/runtime-entry.js) | Backdrop, Glass, Fonts, FX, Parallax, ThemeFollow, Titlebar, HostEntries |
| 7-Tab Studio & Aux UI | [`src/ui/panel.js`](./src/ui/panel.js) | Full UI covering Library, Appearance, FX, Audio & Rotation, Advanced, Extensions, About |

## Security & Privacy

- All user config (`~/.agy-skins/config.json`) and signing secrets (`~/.agy-skins/we-media.key`) are stored outside the Antigravity app directory with restrictive permissions and atomic writes.
- Zero writes to Antigravity binary files or `~/.gemini/config/config.json`.
- Zero `Page.setBypassCSP` usage; all local assets stream over authenticated loopback HTTP (`127.0.0.1`).

## License & Third-Party Notices

Licensed under the MIT License ([`LICENSE`](./LICENSE)). Please review [`LICENSING.md`](./LICENSING.md) and [`THIRD-PARTY-NOTICES.md`](./THIRD-PARTY-NOTICES.md) for bundled WebWallGL and attribution details.
