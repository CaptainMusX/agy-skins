# Installing & Running `agy-skins` (v2.2.1)

> Prerequisite: **[Node.js 22+](https://nodejs.org)**. `agy-skins` never modifies Antigravity's application binaries.

---

## 1. Option 1: One-Sentence Prompt for Your Antigravity Agent (Recommended)

Copy and paste this single sentence directly into **Antigravity** chat:

```text
Please install the agy-skins Wallpaper & Liquid Glass plugin from https://github.com/CaptainMusX/agy-skins by cloning the repository, running npm install && node scripts/install.mjs --no-launch to deploy it to Antigravity's global plugins directory (patching Windows shortcuts with --remote-debugging-port=0 if needed), and replying with the clickable [Wallpaper](customization://agy-skins) toggle link.
```

Then:
1. Click the **`Wallpaper`** link returned by the agent to toggle **Customizations → Plugins → Wallpaper** **ON**.
2. If `--remote-debugging-port=0` was newly added to your shortcut, restart Antigravity once from that shortcut so UI beautification auto-loads on every startup.

---

## 2. Option 2: Simple 3-Step Manual Install

1. **Get the repository**:
   ```bash
   git clone https://github.com/CaptainMusX/agy-skins.git
   cd agy-skins
   ```
   *(Or click `Code → Download ZIP` on GitHub and extract it.)*
2. **Build & stage the plugin**:
   - **Windows**: Double-click **`install.bat`** (or run `npm install && npm run install:agy`). This builds `sidecars/wallpaper_engine/dist/{runtime.js,panel.js,panel.css}`, stages into `%USERPROFILE%\.gemini\config\plugins\agy-skins`, and automatically checks/adds `--remote-debugging-port=0` to Antigravity `.lnk` shortcuts.
   - **macOS / Linux**: Run `./install.sh` (or `npm install && npm run install:agy`), staging into `~/.gemini/config/plugins/agy-skins`.
3. **Enable in Antigravity**:
   - Open **`Customizations → Plugins`** and switch **`Wallpaper`** **ON**.
   - Restart Antigravity once via its shortcut (on macOS/Linux, ensure `--remote-debugging-port=0` is passed on launch). From then on, the built-in `wallpaper_engine` sidecar (`restart_policy: "always"`) starts automatically alongside Antigravity.

Pass `node scripts/install.mjs --no-launch` to build & stage only, or `--no-shortcut-fix` to skip shortcut inspection. Personal settings (`config.json`), HMAC secrets, and uploads live in `~/.gemini/config/agy-skins/` and are preserved across upgrades (`update.bat` / `./update.sh`).

---

## 3. Opening **Wallpaper Engine**

1. **Antigravity Settings**: Open **Settings → Wallpaper** (sidebar label matches Antigravity's native iconless English nav style; inner controls display in Chinese by default).
2. **Global Modal Shortcut**: Press **`Alt+Shift+W`** anywhere inside the Antigravity window for the frosted Studio dialog.
3. **Antigravity Aux Sidecar Pane**: Open **Wallpaper Engine** in Antigravity's plugin sidebar.

*(Tip: Hold **`Shift + Right-Click`** anywhere to temporarily bypass the Liquid Glass context menu.)*

---

## 4. Enabling CDP When Missing (`DevToolsActivePort` not found)

If Antigravity was started without `--remote-debugging-port=0`:

- Open **Wallpaper Engine → System (系统)** → **Antigravity Integration & CDP Health**.
- Click **Add `--remote-debugging-port=0` to Windows shortcuts**, then restart Antigravity normally.
- On macOS/Linux, launch Antigravity with `--remote-debugging-port=0`.

---

## 5. Uninstalling

```bash
npm run uninstall:agy
```

Add `--purge-data` to also remove `~/.gemini/config/agy-skins` (`config.json`, `uploads`, `we_cache.json`).
