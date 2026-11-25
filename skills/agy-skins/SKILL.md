---
name: agy-skins
description: Install, verify, configure, and troubleshoot the agy-skins Wallpaper Engine, liquid glass, typography, click/trail FX, and 3D parallax plugin for Google Antigravity.
---

# agy-skins (Antigravity Wallpaper Engine)

Manages the `agy-skins` plugin for Google Antigravity:
- Real-time Wallpaper Engine **Scene**, **Web**, **Video**, and **Picture/Image** backdrops rendered cleanly via **WebWallGL 3.0.1** and an **HMAC-SHA256 signed loopback HTTP 206 Range media server** (Steam Workshop files stay strictly read-only).
- Single-veil CSSOM **Liquid Glass**, **Font Sets & Typography**, **Click/Trail FX**, **3D Parallax**, **Split-Browser Hole Cutout** (`evenodd` `clip-path`), and **Titlebar Overlay sync**.
- Zero LLM prompt/tool injection overhead and zero `Page.setBypassCSP` or forced `Antigravity.exe` restarts.

## Common Tasks

### 1. Install or Update Locally
From the repository root:
```sh
node scripts/install.mjs
```
This builds the runtime/panel bundles if needed and syncs the plugin to `~/.gemini/config/plugins/agy-skins/` without editing `~/.gemini/config/config.json`.
To launch the standalone CDP daemon immediately for the current session, run `node ~/.gemini/config/plugins/agy-skins/sidecars/wallpaper_engine/server.mjs --standalone` (or enable `[agy-skins](customization://agy-skins)` in Antigravity Customizations so Antigravity manages its sidecar lifecycle natively).

### 2. Verify Live Status
```sh
node scripts/verify-live.mjs
```
Checks `DevToolsActivePort`, confirms `window.__agySkinsRuntime` is active on open Antigravity workbench targets, checks `legacyActive: false`, and verifies the signed loopback WebWallGL media server.

### 3. Open the Studio UI
- **Aux Pane**: Open `… → Extensions → agy-skins` (or click the sidecar pill `[agy-skins](sidecar://agy-skins/wallpaper_engine/)` when the sidecar is enabled).
- **Settings Entry**: Open `Settings → Appearance` and click **Open Wallpaper Engine / 打开壁纸引擎**.
- **Keyboard Shortcut**: Press `Alt + Shift + W` anywhere inside Antigravity.

### 4. Troubleshooting CDP Connection
If Antigravity was launched without `--remote-debugging-port=0`, open the **Advanced** tab inside `agy-skins` and click the **Fix Windows Shortcuts** button (or run the non-destructive shortcut helper) and restart Antigravity normally.
