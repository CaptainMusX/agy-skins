# Third-Party Notices

This repository incorporates or adapts software from the following open-source projects. Full license texts are stored under `third_party/`.

1. **WebWallGL 3.0.1** (`oneincase/webwallgl`)
   - License: MIT (`third_party/webwallgl/LICENSE`)
   - Notice: `third_party/webwallgl/NOTICE.md`
   - Location: `sidecars/wallpaper_engine/webwallgl/engine/webwallgl.global.min.js`

2. **hermes-skins** (`CaptainMusX/hermes-skins`)
   - License: MIT (`third_party/hermes-skins/LICENSE`)
   - Notice: `third_party/hermes-skins/NOTICE.md`
   - Adapted into `src/shared/`, `src/engine/`, `src/ui/`, and `sidecars/wallpaper_engine/`.

3. **dsh-wallpaper-engine** (`elysia395/dsh-wallpaper-engine`, commit `fd3e01fd11cd5ad83f46940ab4d61d971cfbcf91`)
   - License: MIT (`third_party/dsh-wallpaper-engine/LICENSE`)
   - Notice: `third_party/dsh-wallpaper-engine/NOTICE.md`
   - Wallpaper lifecycle, WebWallGL renderer wrapper, transition geometry, rotation groups, font sets, FX, and 3D parallax architecture adapted for Antigravity.

4. **esbuild** (`evanw/esbuild`)
   - License: MIT (`third_party/esbuild/LICENSE`)
   - Used as build-time bundler for `dist/runtime.js` and `dist/panel.js`.
