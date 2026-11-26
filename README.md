# Wallpaper Engine for Antigravity (`agy-skins` v2.2.1)

> Bring Wallpaper Engine (`Scene`, `Web`, `Video`, `Picture`), unified two-stage readability **iOS Liquid Glass**, frosted right-click context menus, typography customization, cursor FX, and 3D parallax to **Google Antigravity** — cleanly, natively, and without patching application binaries.

**[中文文档](./README.zh.md)** · **[Installation Guide](./docs/INSTALL.md)** · **[Architecture & Parity](./docs/PARITY.zh.md)**

> [!NOTE]
> **Attribution & Open-Source Origin**: `agy-skins` is a free, open-source community port adapted from **[`elysia395/dsh-wallpaper-engine`](https://github.com/elysia395/dsh-wallpaper-engine)** (**MIT License**, `Copyright © 2026 elysia395`) for **Google Antigravity**, with `.pkg` Scene/Web rendering powered by **[`oneincase/webwallgl`](https://github.com/oneincase/webwallgl)** (**MIT License**, `Copyright © 2026 oneincase`). Released under the **MIT License** with all upstream copyright and permission notices preserved; this independent project is not affiliated with or endorsed by upstream authors or Google.

## Highlights

- **Full-Surface Unified Liquid Glass + Beautified Right-Click Menus**: Clears Antigravity shell/titlebar/body/sheet layers onto one continuous backdrop and replaces Electron's unstyled OS-native popup menus (text `Copy`, editable `Cut / Copy / Paste / Select All`, sidebar conversation menus, link menus) with frosted **iOS Liquid Glass** menus & submenus, alongside `.agy-overlay`, Overview popovers, tooltips, selection pills, toasts & dialogs.
- **Two-Stage Readability Liquid Glass (Modeled on [`elysia395/dsh-wallpaper-engine`](https://github.com/elysia395/dsh-wallpaper-engine))**: Luminance-clamped readability floors (`READABILITY_FLOOR = 0.48` light / `READABILITY_FLOOR_DARK = 0.59` dark) blended via `color-mix` guarantee ≥ 4.5:1 contrast with 5 factory presets and up to 8 user preset slots + JSON import/export.
- **Native In-Host `we-picker` Settings UI (Zero `<iframe>`)**: Mounts `.we-picker` directly inside Antigravity Settings under the English **`Wallpaper`** nav item (matching native sidebar typography with no icon), presenting full Simplified Chinese controls inside, with spinning `.we-vinyl` cover disc, drill-down library modal, CD-rack / grid layouts, collapsible sections, and bottom tab resets.
- **WebWallGL 3.0.1 Scene & Web Engine**: Runs Wallpaper Engine `.pkg` scenes, Web wallpapers, videos (MP4/WebM/MKV), Picture slideshows, URLs, and Bing daily wallpapers inside a sandboxed media frame with GPU auto-quality and `15 / 30 / 60 FPS` caps.
- **Signed Loopback Media Origin (HTTP 206 Range)**: Ephemeral `127.0.0.1:0` server secured by HMAC-SHA256 (`we-media.key`, mode `0600`) with CORS preflight for Antigravity's native host origin and `studioToken` API authentication — zero `file:///` failures and zero `BypassCSP` hacks.

## Installing from GitHub

> Prerequisite: **Node.js 22+** ([nodejs.org](https://nodejs.org)). Never modifies Antigravity binaries.

### Option 1: One-Sentence Prompt for Your Antigravity Agent (Recommended)

Copy and paste this single sentence straight into **Antigravity** chat:

```text
Please install the agy-skins Wallpaper & Liquid Glass plugin from https://github.com/CaptainMusX/agy-skins by cloning the repository, running npm install && node scripts/install.mjs --no-launch to deploy it to Antigravity's global plugins directory (patching Windows shortcuts with --remote-debugging-port=0 if needed), and replying with the clickable [Wallpaper](customization://agy-skins) toggle link.
```

Once the agent finishes:
1. Click the **`Wallpaper`** link to toggle **Customizations → Plugins → Wallpaper** **ON**;
2. If `--remote-debugging-port=0` was newly added to your shortcut, restart Antigravity once from that shortcut. From then on, UI beautification starts automatically whenever Antigravity opens.

---

### Option 2: Simple 3-Step Manual Install

1. **Download or clone**:
   ```bash
   git clone https://github.com/CaptainMusX/agy-skins.git
   cd agy-skins
   ```
   *(Or click `Code → Download ZIP` on GitHub and extract it.)*
2. **Build & install**:
   - **Windows**: Double-click **`install.bat`** (or run `npm install && npm run install:agy`). It stages the plugin and automatically checks/adds `--remote-debugging-port=0` to Antigravity Windows `.lnk` shortcuts.
   - **macOS / Linux**: Run `./install.sh` (or `npm install && npm run install:agy`).
3. **Enable in Antigravity**:
   - Open **`Customizations → Plugins`** and switch **`Wallpaper`** **ON**;
   - Restart Antigravity once via its shortcut (on macOS/Linux, ensure `--remote-debugging-port=0` is included on launch).

See **[docs/INSTALL.md](./docs/INSTALL.md)** for troubleshooting and uninstall instructions.

## Architecture Overview

| Component | Path | Purpose |
| --- | --- | --- |
| Antigravity Plugin Manifest | [`plugin.json`](./plugin.json) | Registers **`Wallpaper`** (`agy-skins`) v2.2.1 metadata |
| Sidecar & Standalone Daemon | [`sidecars/wallpaper_engine/server.mjs`](./sidecars/wallpaper_engine/server.mjs) | Hosts `sidecar_sdk` Aux UI, Studio API, CDP injector, rotation & media server |
| Signed Media Origin | [`sidecars/wallpaper_engine/media_server.mjs`](./sidecars/wallpaper_engine/media_server.mjs) | HMAC-SHA256 range streaming + token-authenticated loopback `/studio-api/*` CORS |
| Workshop Scanner | [`sidecars/wallpaper_engine/we_scanner.mjs`](./sidecars/wallpaper_engine/we_scanner.mjs) | Async Steam/Workshop discovery + `.pkg` / PNG / JPEG / GIF parsing |
| Frontend Runtime | [`src/engine/runtime-entry.js`](./src/engine/runtime-entry.js) | Backdrop, Glass (`GlassController`), Right-Click (`ContextMenuController`), Fonts, FX, Parallax, Titlebar, Native `HostEntries` |
| Shared `we-picker` UI | [`src/ui/we-picker-app.js`](./src/ui/we-picker-app.js) | Shared 7-tab `dsh-wallpaper-engine` UI across Settings, `Alt+Shift+W`, and Aux Sidecar |

## License & Acknowledgements

- Licensed freely under the **MIT License** ([`LICENSE`](./LICENSE)).
- UI design system, two-stage readability Liquid Glass floor (`READABILITY_FLOOR`), presets, rotation, typography, FX & parallax model are adapted from **[`elysia395/dsh-wallpaper-engine`](https://github.com/elysia395/dsh-wallpaper-engine)** (`MIT License`, `Copyright © 2026 elysia395` — retained in [`third_party/dsh-wallpaper-engine/LICENSE`](./third_party/dsh-wallpaper-engine/LICENSE)).
- Wallpaper Engine `.pkg` Scene runtime is powered by **[`oneincase/webwallgl`](https://github.com/oneincase/webwallgl)** v3.0.1 (`MIT License`, `Copyright © 2026 oneincase` — retained in [`third_party/webwallgl/LICENSE`](./third_party/webwallgl/LICENSE)).
- See [`LICENSING.md`](./LICENSING.md) and [`THIRD-PARTY-NOTICES.md`](./THIRD-PARTY-NOTICES.md) for full license scope and notices.
