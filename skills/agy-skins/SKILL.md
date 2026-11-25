---
name: agy-skins
description: Install, verify, configure, and troubleshoot the agy-skins Wallpaper Engine, two-stage readability liquid glass, typography, click/trail FX, and 3D parallax plugin for Google Antigravity.
---

# agy-skins Wallpaper Engine Plugin (v2.0.0)

`agy-skins` brings full Wallpaper Engine (`Scene` `.pkg`, `Web`, `Video`, `Picture`), unified two-stage readability iOS **Liquid Glass**, typography customization, cursor FX, and 3D parallax to **Google Antigravity 2.0** without modifying Antigravity installation binaries or using `BypassCSP`.

## Entry Points
- **Antigravity Settings**: Open **Settings → `Wallpaper Engine`** (left sidebar nav item stays English `Wallpaper Engine`; inner controls default to Simplified Chinese via native DOM `.we-picker` mount — zero `<iframe>`).
- **Global Hotkey**: Press **`Alt+Shift+W`** anywhere in the Antigravity window to toggle the floating glass dialog.
- **Aux Sidecar Pane**: Open **Wallpaper Engine** from Antigravity's plugin sidebar (`sidecar_sdk`).

## Common Commands
- **Install & build**: `npm run install:agy` (or `node scripts/install.mjs --no-launch`)
- **Live health check**: `npm run verify:live` (verifies `DevToolsActivePort`, CDP connection, `#agy-skins-backdrop-root`, and `#agy-skins-runtime-css`)
- **Run test suite**: `npm test`
- **Uninstall**: `npm run uninstall:agy` (add `--purge-data` to wipe `~/.agy-skins`)

## Troubleshooting
- If **Settings → `Wallpaper Engine`** does not appear or backdrop does not inject, check **System → Antigravity Integration & CDP Health** (`DevToolsActivePort` missing) and use the built-in Windows shortcut fixer (`--remote-debugging-port=0`), then restart Antigravity.
- Keep `~/.agy-skins/we-media.key` (mode `0600`) intact; restarted daemons re-read or rotate tokens automatically on startup.
