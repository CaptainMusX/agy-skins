# Installing & Running `agy-skins`

## 1. Local Plugin Installation

```bash
npm install
npm run install:agy
```

By default this builds `sidecars/wallpaper_engine/dist/{runtime.js,panel.js,panel.css}` and copies the plugin into:

- **Windows**: `%USERPROFILE%\.gemini\config\plugins\agy-skins`
- **macOS / Linux**: `~/.gemini/config/plugins/agy-skins`

Pass `--no-launch` (`node scripts/install.mjs --no-launch`) if you prefer Antigravity's built-in Sidecar supervisor to spawn the plugin on demand.

## 2. Opening the Studio UI

1. **Antigravity Plugin Sidecar Pane**: Open the Antigravity sidebar and launch **Wallpaper Engine (`agy-skins`)**.
2. **Global Modal Shortcut**: Press **`Alt+Shift+W`** anywhere inside the Antigravity window.
3. **Settings Entry**: Open **Antigravity Settings → Appearance** and click **Open Studio**.

## 3. Enabling CDP When Missing (`DevToolsActivePort` not found)

If Antigravity was launched without `--remote-debugging-port=0`:

- Open Studio → **Advanced** → **Antigravity CDP Injection Health**.
- Click **Add `--remote-debugging-port=0` to Windows shortcuts**, then restart Antigravity normally.
- This never edits Antigravity binaries or kills running windows.

## 4. Uninstalling

```bash
npm run uninstall:agy
```

Add `--purge-data` to also remove `~/.agy-skins` (`config.json`, `uploads`, `we_cache.json`).
