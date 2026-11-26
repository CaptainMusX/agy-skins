---
name: agy-skins
description: Install, verify, configure, and troubleshoot the agy-skins Wallpaper Engine, two-stage readability liquid glass, typography, click/trail FX, and 3D parallax plugin for Google Antigravity.
---

# agy-skins Wallpaper Engine Plugin (v2.2.1)

`agy-skins` brings full Wallpaper Engine (`Scene` `.pkg`, `Web`, `Video`, `Picture`), unified two-stage readability iOS **Liquid Glass** (including frosted Liquid Glass right-click context menus), typography customization, cursor FX, and 3D parallax to **Google Antigravity 2.0** without modifying Antigravity installation binaries or using `BypassCSP`.

## Entry Points
- **Antigravity Settings**: Open **Settings → `Wallpaper`** (left sidebar nav item matches Antigravity's native iconless English label `Wallpaper`; inner controls default to Simplified Chinese via native DOM `.we-picker` mount — zero `<iframe>`).
- **Global Hotkey**: Press **`Alt+Shift+W`** anywhere in the Antigravity window to toggle the floating glass dialog.
- **Aux Sidecar Pane**: Open **Wallpaper Engine** from Antigravity's plugin sidebar (`sidecar_sdk`).

## Installing from GitHub (`https://github.com/CaptainMusX/agy-skins`)
1. Clone `https://github.com/CaptainMusX/agy-skins.git` (or pull latest).
2. Run `npm install && node scripts/install.mjs --no-launch` inside the cloned folder to build and deploy into `~/.gemini/config/plugins/agy-skins` (on Windows, `install.mjs` also checks and patches `.lnk` shortcuts with `--remote-debugging-port=0` automatically).
3. Reply with the clickable `[Wallpaper](customization://agy-skins)` link so the user can toggle **`Wallpaper`** ON in Antigravity Customizations (and restart Antigravity once via its shortcut if `--remote-debugging-port=0` was newly added). Never hand-edit `~/.gemini/config/config.json`.

## Common Commands
- **Install & build**: `npm run install:agy` (or `node scripts/install.mjs --no-launch`). When enabled in Antigravity, the native `wallpaper_engine` sidecar (`restart_policy: "always"`) starts automatically whenever Antigravity launches with `--remote-debugging-port=0`.
- **Live health check**: `npm run verify:live` (verifies `DevToolsActivePort`, CDP connection, `#agy-skins-backdrop-root`, and `#agy-skins-runtime-css`)
- **Run test suite**: `npm test`
- **Uninstall**: `npm run uninstall:agy` (add `--purge-data` to wipe `~/.gemini/config/agy-skins`)

## Troubleshooting
- If **Settings → `Wallpaper`** does not appear or backdrop does not inject, check **System → Antigravity Integration & CDP Health** (`DevToolsActivePort` missing) and use the built-in Windows shortcut fixer (`--remote-debugging-port=0`), then restart Antigravity.
- Keep `~/.gemini/config/agy-skins/we-media.key` (mode `0600`) intact; restarted sidecars re-read or rotate tokens automatically on startup.
