# Installing & Running `agy-skins` (v2.2.0)

## 1. Local Plugin Installation

```bash
npm install
npm run install:agy
```

This bundles `sidecars/wallpaper_engine/dist/{runtime.js,panel.js,panel.css}` and stages the plugin under:

- **Windows**: `%USERPROFILE%\.gemini\config\plugins\agy-skins`
- **macOS / Linux**: `~/.gemini/config/plugins/agy-skins`

Pass `node scripts/install.mjs --no-launch` to build and stage only, or enable `agy-skins` in Antigravity so its native `wallpaper_engine` sidecar (`restart_policy: "always"`) starts automatically whenever Antigravity launches with `--remote-debugging-port=0`.

## 2. Opening **Wallpaper Engine**

1. **Antigravity Settings**: Open **Settings → Wallpaper** (sidebar label matches Antigravity's native iconless English nav style; inner controls display in Chinese by default).
2. **Global Modal Shortcut**: Press **`Alt+Shift+W`** anywhere inside the Antigravity window for the frosted Studio dialog.
3. **Antigravity Aux Sidecar Pane**: Open **Wallpaper Engine** in Antigravity's plugin sidebar.

## 3. Enabling CDP When Missing (`DevToolsActivePort` not found)

If Antigravity was started without `--remote-debugging-port=0`:

- Open **Wallpaper Engine → System (系统)** → **Antigravity Integration & CDP Health**.
- Click **Add `--remote-debugging-port=0` to Windows shortcuts**, then restart Antigravity normally.
- This never modifies Antigravity binaries or kills running windows.

## 4. Uninstalling

```bash
npm run uninstall:agy
```

Add `--purge-data` to also remove `~/.gemini/config/agy-skins` (`config.json`, `uploads`, `we_cache.json`).
