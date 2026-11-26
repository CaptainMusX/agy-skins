/* global __AGY_SKINS_OWNER__, __AGY_SKINS_HASH__ */
import { BackdropManager } from './backdrop-manager.js'
import { GlassController } from './glass-controller.js'
import { FontController } from './font-controller.js'
import { FxOverlay } from './fx-overlay.js'
import { ParallaxController } from './parallax-controller.js'
import { ThemeFollowController } from './theme-follow-controller.js'
import { ThemeWatcher, detectIsDark } from './theme-watcher.js'
import { TitlebarController } from './titlebar-controller.js'
import { HostEntries } from './host-entries.js'

const OWNER = typeof __AGY_SKINS_OWNER__ === 'number' ? __AGY_SKINS_OWNER__ : Date.now()
const HASH = typeof __AGY_SKINS_HASH__ === 'string' ? __AGY_SKINS_HASH__ : 'dev'

function teardownLegacyThemes() {
  try {
    globalThis.__AGY_MODAL_OBSERVER__?.disconnect?.()
    globalThis.__AGY_MODAL_OBSERVER__ = null
    globalThis.__AGY_SHELL_RO__?.disconnect?.()
    globalThis.__AGY_SHELL_RO__ = null
    globalThis.__AGY_SCROLL_AC__?.abort?.()
    if (globalThis.__AGY_TICK_TIMER__) {
      clearTimeout(globalThis.__AGY_TICK_TIMER__)
      globalThis.__AGY_TICK_TIMER__ = 0
    }
    if (globalThis.__AGY_TICK_RAF__) {
      cancelAnimationFrame(globalThis.__AGY_TICK_RAF__)
      globalThis.__AGY_TICK_RAF__ = 0
    }
    globalThis.__AGY_SCENE_ENGINE__?.pause?.()
    globalThis.__AGY_SCENE_ENGINE__ = null
    globalThis.__ANTIGRAVITY_REMOVE_CUSTOM_THEME__?.()
  } catch {}
  if (typeof document !== 'undefined') {
    const liveLayer = document.getElementById('agy-live-wp-layer')
    const oldVid = liveLayer?.querySelector?.('video')
    if (oldVid) {
      try { oldVid.pause(); oldVid.removeAttribute('src'); oldVid.load() } catch {}
    }
    for (const legacyId of [
      'antigravity-custom-theme-active',
      'agy-live-wp-layer',
      'agy-live-wp-video',
      'agy-live-wp-scrim',
      'agy-custom-theme-sidebar-btn',
      'agy-custom-theme-settings-btn',
      'agy-custom-theme-modal-backdrop',
      'agy-wallpaper-backdrop'
    ]) {
      document.getElementById(legacyId)?.remove()
    }
    const shell = document.querySelector('.agy-shell')
    if (shell) {
      delete shell.dataset?.agyHoleActive
      shell.style?.removeProperty?.('--agy-hole-clip')
      shell.style?.removeProperty?.('--agy-l-glass-bg')
      shell.style?.removeProperty?.('--agy-static-wp')
    }
  }
}

function createRuntime() {
  if (globalThis.__agySkinsRuntime && typeof globalThis.__agySkinsRuntime.owner === 'number' && globalThis.__agySkinsRuntime.owner > OWNER) {
    return 'superseded'
  }
  try {
    globalThis.__agySkinsRuntime?.dispose?.()
  } catch {}
  teardownLegacyThemes()

  let lastPayload = null
  let currentIsDark = detectIsDark()

  const glass = new GlassController()
  const fonts = new FontController()
  const fx = new FxOverlay()
  const parallax = new ParallaxController()
  const themeFollow = new ThemeFollowController()
  const titlebar = new TitlebarController()
  const hostEntries = new HostEntries()

  const backdrop = new BackdropManager({
    onMediaEnd: () => {
      const origin = lastPayload?.runtimeOrigin
      const token = lastPayload?.runtimeToken
      if (!origin || !token) return
      void fetch(`${origin}/runtime-event`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-agy-runtime-token': token
        },
        body: JSON.stringify({ type: 'videoEnd' })
      }).catch(() => {})
    }
  })

  let lastCoreVisualKey = ''
  let lastVisualWasPreview = false

  const buildFlatSceneProps = cfg => {
    const out = {}
    const props = cfg?.weSelection?.properties
    if (Array.isArray(props)) {
      for (const p of props) {
        if (p && typeof p.name === 'string' && p.value !== undefined && p.value !== null) {
          out[p.name] = p.value
        }
      }
    }
    const selId = cfg?.weSelection?.id
    const overrides = selId && cfg?.userProps && typeof cfg.userProps === 'object' ? cfg.userProps[selId] : null
    if (overrides && typeof overrides === 'object' && !Array.isArray(overrides)) {
      for (const [k, v] of Object.entries(overrides)) {
        if (v !== undefined && v !== null) out[k] = v
      }
    }
    return out
  }

  const applyVisuals = (cfg, res, nowPlaying = null, { isPreview = false } = {}) => {
    const isDark = detectIsDark()
    currentIsDark = isDark
    const coreKey = JSON.stringify({
      cfg,
      src: res.resolvedSrc || null,
      preview: res.previewUrl || null,
      sceneDir: res.scenePayload?.dir || null,
      weAssets: Boolean(res.scenePayload?.weAssetsAvailable),
      isDark,
      np: nowPlaying?.title || ''
    })
    if (coreKey === lastCoreVisualKey && (isPreview || !lastVisualWasPreview)) {
      return
    }
    const active = cfg.wallpaperEnabled === true && Boolean(res.resolvedSrc)
    const sceneProps = buildFlatSceneProps(cfg)

    backdrop.setMediaSnapshot(nowPlaying)
    backdrop.update({
      enabled: active,
      type: cfg.wallpaperType,
      src: res.resolvedSrc,
      scenePayload: res.scenePayload,
      webPreview: res.previewUrl,
      blur: cfg.wallpaperBlur,
      occlusion: cfg.maskOcclusion,
      isDark,
      mode: cfg.wallpaperMode,
      fit: cfg.wallpaperFit,
      opacity: cfg.wallpaperOpacity,
      pauseOnHidden: cfg.pauseOnHidden,
      pauseOnBlur: cfg.pauseOnBlur,
      pauseOnBattery: cfg.pauseOnBattery,
      sound: cfg.wallpaperSound,
      volume: cfg.wallpaperVolume,
      playbackRate: cfg.videoPlaybackRate,
      sceneLive: cfg.sceneLive,
      sceneLiveFps: cfg.sceneLiveFps,
      sceneAutoQuality: cfg.sceneAutoQuality,
      sceneRenderDpr: cfg.sceneRenderDpr,
      sceneVideoTexScale: cfg.sceneVideoTexScale,
      liveBootDelay: cfg.liveBootDelay,
      slides: res.slides,
      slideIntervalMs: cfg.weSelection?.slideIntervalMs,
      transition: cfg.wallpaperTransition,
      transitionDir: cfg.wallpaperTransitionDir,
      transitionSpeed: cfg.wallpaperTransitionSpeed,
      brightness: cfg.backgroundBrightness,
      contrast: cfg.backgroundContrast,
      saturate: cfg.backgroundSaturate,
      flip: cfg.wallpaperFlip,
      layerPositionX: cfg.layerPositionX,
      layerPositionY: cfg.layerPositionY,
      layerScale: cfg.layerScale,
      userProps: cfg.userProps,
      sceneProps,
      paused: cfg.wallpaperPaused === true,
      browserHoleCutout: cfg.browserHoleCutout
    })

    glass.update({
      enabled: active,
      glassTransparency: cfg.panelGlass,
      bubbleOpacity: cfg.bubbleOpacity,
      composerFrost: cfg.composerFrost,
      surfaceFrost: cfg.surfaceFrost,
      saturation: cfg.glassSaturation,
      border: cfg.glassBorder,
      highlight: cfg.glassHighlight,
      accent: cfg.accent,
      glassColor: cfg.glassColor,
      glassDarkSeparate: cfg.glassDarkSeparate,
      glassFidelity: cfg.glassFidelity,
      chatGlassFidelity: cfg.chatGlassFidelity,
      settingsWindowTransparency: cfg.settingsWindowTransparency,
      settingsWindowBlur: cfg.settingsWindowBlur,
      sidebarGlass: cfg.sidebarGlass,
      sidebarFollowGlobal: cfg.sidebarFollowGlobal,
      sidebarBlur: cfg.sidebarBlur,
      sidebarAlpha: cfg.sidebarAlpha,
      sidebarColor: cfg.sidebarColor,
      leftSidebarGlass: cfg.leftSidebarGlass,
      leftSidebarCornerRadius: cfg.leftSidebarCornerRadius,
      leftSidebarSquareTL: cfg.leftSidebarSquareTL,
      leftSidebarSquareTR: cfg.leftSidebarSquareTR,
      leftSidebarSquareBR: cfg.leftSidebarSquareBR,
      leftSidebarSquareBL: cfg.leftSidebarSquareBL,
      rightSidebarCornerRadius: cfg.rightSidebarCornerRadius,
      rightSidebarSquareTL: cfg.rightSidebarSquareTL,
      rightSidebarSquareTR: cfg.rightSidebarSquareTR,
      rightSidebarSquareBR: cfg.rightSidebarSquareBR,
      rightSidebarSquareBL: cfg.rightSidebarSquareBL,
      titlebarGlass: cfg.titlebarGlass,
      wallpaperEnabled: active,
      glassEnabled: cfg.glassEnabled !== false,
      sidebarFullClear: cfg.sidebarFullClear === true,
      thinkingMode: cfg.thinkingMode,
      floaterSolidBase: cfg.floaterSolidBase !== false,
      settingsMaskStrength: cfg.settingsMaskStrength,
      glassMode: cfg.glassMode,
      leftSidebarTransparency: cfg.leftSidebarTransparency,
      leftSidebarBlur: cfg.leftSidebarBlur,
      titlebarTransparency: cfg.titlebarTransparency,
      titlebarBlur: cfg.titlebarBlur,
      sidebarContentAlpha: cfg.sidebarContentAlpha,
      sidebarContentColor: cfg.sidebarContentColor,
      conversationColor: cfg.conversationColor,
      settingsWindowColor: cfg.settingsWindowColor,
      isPreview,
      isDark
    })

    fonts.update(cfg)
    fx.update(cfg)
    parallax.update({ ...cfg, wallpaperEnabled: active })
    themeFollow.update({
      enabled: active && cfg.themeFollow === true,
      previewUrl: res.previewUrl,
      isDark
    })
    titlebar.update({ enabled: active, isDark })
    lastCoreVisualKey = coreKey
    lastVisualWasPreview = isPreview
  }

  let previewRaf = 0
  let pendingPreviewCfg = null

  const applyAll = (payload, { isPreview = false } = {}) => {
    if (!payload || typeof payload !== 'object') return
    lastPayload = payload
    const cfg = payload.config || {}
    const res = payload.resolved || {}
    applyVisuals(cfg, res, payload.nowPlaying || null, { isPreview: Boolean(isPreview) })
    hostEntries.update({
      studioUrl: payload.studioUrl,
      runtimeOrigin: payload.runtimeOrigin,
      studioToken: payload.studioToken,
      systemLocale: payload.systemLocale,
      cdp: payload.cdp,
      shortcutEnabled: cfg.studioShortcut !== false,
      config: cfg
    })

    if (payload.runtimeOrigin && payload.runtimeToken && typeof fetch === 'function') {
      const slotList = [...document.querySelectorAll('[data-slot]')]
        .map(el => el.getAttribute('data-slot')?.trim())
        .filter(Boolean)
      const uniqueSlots = [...new Set(slotList)]
      const key = uniqueSlots.join('|')
      if (uniqueSlots.length && window.__AGY_SKINS_LAST_SLOTS__ !== key) {
        window.__AGY_SKINS_LAST_SLOTS__ = key
        void fetch(`${payload.runtimeOrigin}/runtime-event`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-agy-runtime-token': payload.runtimeToken
          },
          body: JSON.stringify({ type: 'slots', slots: uniqueSlots })
        }).catch(() => {})
      }
    }
  }

  const watcher = new ThemeWatcher(isDark => {
    if (isDark === currentIsDark) return
    currentIsDark = isDark
    if (lastPayload) applyAll(lastPayload)
  })
  watcher.start()
  hostEntries.start()

  const api = {
    owner: OWNER,
    hash: HASH,
    readState(callerOwner) {
      if (typeof callerOwner === 'number' && callerOwner < OWNER) return 'superseded'
      return { ok: true, owner: OWNER, hash: HASH, active: Boolean(lastPayload) }
    },
    apply(payload, callerOwner, isPreview = false) {
      if (typeof callerOwner === 'number' && callerOwner < OWNER) return 'superseded'
      applyAll(payload, { isPreview: Boolean(isPreview) })
      return { ok: true, owner: OWNER }
    },
    previewConfig(nextCfg) {
      if (!lastPayload || !nextCfg || typeof nextCfg !== 'object') return false
      pendingPreviewCfg = { ...(lastPayload.config || {}), ...nextCfg }
      lastPayload = { ...lastPayload, config: pendingPreviewCfg }
      if (previewRaf) return true
      const schedule = typeof requestAnimationFrame === 'function' ? requestAnimationFrame : cb => setTimeout(cb, 0)
      previewRaf = schedule(() => {
        previewRaf = 0
        const cfg = pendingPreviewCfg
        pendingPreviewCfg = null
        if (cfg && lastPayload) applyVisuals(cfg, lastPayload.resolved || {}, lastPayload.nowPlaying || null, { isPreview: true })
      })
      return true
    },
    dispose() {
      if (previewRaf && typeof cancelAnimationFrame === 'function') cancelAnimationFrame(previewRaf)
      previewRaf = 0
      watcher.destroy()
      hostEntries.destroy()
      titlebar.destroy()
      themeFollow.destroy()
      parallax.destroy()
      fx.destroy()
      fonts.destroy()
      glass.destroy()
      backdrop.destroy()
      if (globalThis.__agySkinsRuntime === api) {
        delete globalThis.__agySkinsRuntime
      }
    }
  }

  globalThis.__agySkinsRuntime = api
  return api
}

createRuntime()
