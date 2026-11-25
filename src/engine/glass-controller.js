/**
 * Unified Two-Stage Readability Liquid Glass controller for Google Antigravity 2.0,
 * modeled directly on elysia395/dsh-wallpaper-engine (packages/glass/src/glass-css.js + glass.js).
 *
 * Eliminates Antigravity's disjointed seams:
 * - Clears main shell/header/chat/sheet wrappers to reveal ONE continuous wallpaper+scrim backdrop.
 * - Remaps Antigravity's `--onyx-*` and surface alias tokens on body[data-agy-skins-active="true"],
 *   eliminating the 4px solid `--onyx-frame` composer halo and solid sidebar pills.
 * - Strips the 48px white `from-background` fade strip above `.surface-composer`.
 * - Hosts composer backdrop-filter on `::before` so fixed popups never lose viewport anchoring.
 * - Styles `.settings-modal-container` and `.settings-modal-backdrop` as one unified frosted sheet.
 * - Mutates only CSSOM properties on rule[0] during slider drags without rebuilding stylesheet text.
 */
import { READABILITY_FLOOR, READABILITY_FLOOR_DARK, weClampSurfaceColor, weAccentInk } from '../shared/glass-presets.js'

const STYLE_ID = 'agy-skins-runtime-css'

export function parseSerializedColor(text) {
  if (typeof text !== 'string') return null
  let match = text.match(/^color\((?:srgb|srgb-linear) ([\d.]+) ([\d.]+) ([\d.]+)(?: \/ ([\d.]+))?\)$/)
  if (match) {
    const ch = v => Math.round(Number(v) * 255)
    return { r: ch(match[1]), g: ch(match[2]), b: ch(match[3]), a: match[4] === undefined ? 1 : Number(match[4]) }
  }
  match = text.match(/^rgba?\(([\d.]+),?\s*([\d.]+),?\s*([\d.]+)(?:\s*[,/]\s*([\d.]+))?\)$/)
  if (match) {
    return {
      r: Math.round(Number(match[1])), g: Math.round(Number(match[2])), b: Math.round(Number(match[3])),
      a: match[4] === undefined ? 1 : Number(match[4])
    }
  }
  match = text.match(/^#([0-9a-f]{6})$/i)
  if (match) {
    const n = parseInt(match[1], 16)
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255, a: 1 }
  }
  return null
}

function isXtermTerminal(value) {
  return Boolean(
    value && typeof value === 'object' &&
    value.options && value._core && typeof value.refresh === 'function' &&
    value._core.optionsService &&
    typeof value._core.optionsService.onSpecificOptionChange === 'function'
  )
}

function isXtermAddon(value) {
  return Boolean(
    value && typeof value === 'object' &&
    value._terminal && '_renderer' in value && typeof value.dispose === 'function'
  )
}

export function findXtermTerminal(host) {
  if (!host || typeof host !== 'object') return null
  const fiberKey = Object.keys(host).find(name => name.startsWith('__reactFiber$'))
  if (!fiberKey) return null
  let fiber = host[fiberKey]
  const seen = new Set()
  let terminal = null
  let addon = null
  for (let depth = 0; fiber && depth < 14; depth++, fiber = fiber.return) {
    for (const candidate of [fiber, fiber.alternate]) {
      if (!candidate || seen.has(candidate)) continue
      seen.add(candidate)
      let hook = candidate.memoizedState
      for (let i = 0; hook && i < 80; i++, hook = hook.next) {
        const value = hook.memoizedState?.current
        if (!terminal && isXtermTerminal(value)) terminal = value
        if (!addon && isXtermAddon(value)) addon = value
        if (terminal && addon) return { terminal, addon }
      }
    }
  }
  return terminal ? { terminal, addon } : null
}

function pct(v, fb) {
  const n = Number(v)
  return Number.isFinite(n) ? Math.min(100, Math.max(0, n)) : fb
}

function cornerRadiusString(mode, sqTL, sqTR, sqBR, sqBL) {
  const allDefault = mode === 'native' && !sqTL && !sqTR && !sqBR && !sqBL
  if (allDefault) return '0px'
  const c = sq => sq ? '0px' : mode === 'native' ? '0px' : `${mode}px`
  return `${c(sqTL)} ${c(sqTR)} ${c(sqBR)} ${c(sqBL)}`
}

export class GlassController {
  constructor() {
    this.styleEl = null
    this.materialRule = null
    this.lastMaterialKey = null
    this.seedKey = null
    this.seedColors = { bg: null, sidebar: null, card: null }
    this.terminalObserver = null
    this.terminalRecords = new Map()
  }

  readHostSeeds(root) {
    const key = `${document.body?.className || ''}:${root.style?.cssText || ''}`
    if (this.seedKey === key && this.seedColors.bg) return this.seedColors
    try {
      const cs = getComputedStyle(root)
      this.seedColors = {
        bg: parseSerializedColor(cs.getPropertyValue('--background').trim()),
        sidebar: parseSerializedColor(cs.getPropertyValue('--sidebar').trim()),
        card: parseSerializedColor(cs.getPropertyValue('--card').trim())
      }
      this.seedKey = key
    } catch {}
    return this.seedColors
  }

  update(params = {}) {
    if (typeof document === 'undefined') return
    const {
      enabled = false,
      wallpaperEnabled = enabled,
      glassEnabled = true,
      glassTransparency = 72,
      bubbleOpacity = 62,
      composerFrost = 22,
      surfaceFrost = 18,
      saturation = 175,
      border = 32,
      highlight = true,
      accent = '#4f8cff',
      glassColor = null,
      glassDarkSeparate = true,
      glassFidelity = 100,
      chatGlassFidelity = 100,
      settingsWindowTransparency = 24,
      settingsWindowBlur = 24,
      settingsMaskStrength = 80,
      sidebarGlass = true,
      sidebarFollowGlobal = true,
      sidebarBlur = 18,
      sidebarAlpha = 72,
      sidebarColor = '#ffffff',
      sidebarFullClear = false,
      leftSidebarGlass = true,
      leftSidebarCornerRadius = 'native',
      leftSidebarSquareTL = false,
      leftSidebarSquareTR = false,
      leftSidebarSquareBR = false,
      leftSidebarSquareBL = false,
      rightSidebarCornerRadius = 'native',
      rightSidebarSquareTL = false,
      rightSidebarSquareTR = false,
      rightSidebarSquareBR = false,
      rightSidebarSquareBL = false,
      titlebarGlass = false,
      thinkingMode = 'glass',
      floaterSolidBase = true,
      glassMode = {},
      leftSidebarTransparency = 72,
      leftSidebarBlur = 18,
      titlebarTransparency = 72,
      titlebarBlur = 18,
      sidebarContentAlpha = 20,
      sidebarContentColor = '',
      conversationColor = '',
      settingsWindowColor = '',
      isDark = true
    } = params

    const root = document.documentElement
    const body = document.body
    if (!body) return

    const active = Boolean(enabled) || Boolean(glassEnabled && wallpaperEnabled)
    if (!active && glassEnabled === false && !wallpaperEnabled) {
      this.clearAll(body)
      return
    }
    if (!enabled && !glassEnabled) {
      this.clearAll(body)
      return
    }

    if (!this.styleEl || !document.head.contains(this.styleEl)) {
      this.materialRule = null
      this.lastMaterialKey = null
      this.styleEl = document.getElementById(STYLE_ID) || document.createElement('style')
      this.styleEl.id = STYLE_ID
      this.styleEl.dataset.plugin = 'agy-skins'
      if (!this.styleEl.isConnected) document.head.appendChild(this.styleEl)
    }

    const glassOn = glassEnabled !== false
    const modeCustom = surface => glassMode && typeof glassMode === 'object' && glassMode[surface] === 'custom'
    const pick = (surface, customVal, globalVal) =>
      modeCustom(surface) && customVal !== undefined && customVal !== null && customVal !== ''
        ? customVal
        : globalVal

    const rawFid = Math.min(100, Math.max(0, pct(glassFidelity, 100)))
    const rawChatFid = Math.min(100, Math.max(0, pct(pick('conversation', chatGlassFidelity, rawFid), rawFid)))
    const floorBase = isDark ? READABILITY_FLOOR_DARK : READABILITY_FLOOR
    const floor = floorBase * (rawFid / 100)
    const chatFloor = floorBase * (rawChatFid / 100)

    const defaultTintLight = '#ffffff'
    const defaultTintDark = '#0d1524'
    const userLightColor = glassColor?.light || defaultTintLight
    const userDarkColor = glassDarkSeparate ? (glassColor?.dark || defaultTintDark) : userLightColor
    const globalColorRaw = isDark ? userDarkColor : userLightColor

    const clampedGlobal = weClampSurfaceColor(globalColorRaw, isDark, rawFid)
    const chatColorRaw = pick('conversation', conversationColor, globalColorRaw)
    const clampedChat = weClampSurfaceColor(chatColorRaw, isDark, rawChatFid)
    const settingsColorRaw = pick('settingsWindow', settingsWindowColor, globalColorRaw)
    const clampedSettings = weClampSurfaceColor(settingsColorRaw, isDark, rawFid)

    const transPct = pct(glassTransparency, 72)
    // Scale tint alpha softly while floor preserves readability
    const glassAlpha = glassOn ? Math.max(0.04, 1 - transPct / 100) * (isDark ? 0.62 : 0.78) : 0.92
    const bubbleAlpha = glassOn ? Math.max(0.04, pct(bubbleOpacity, 62) / 100) * (isDark ? 0.56 : 0.72) : 0.92

    const gBlur = Math.min(60, Math.max(0, pct(surfaceFrost, 18)))
    const cBlur = Math.min(60, Math.max(0, pct(composerFrost, 22)))
    const sBlur = Math.min(60, Math.max(0, pct(pick('settingsWindow', settingsWindowBlur, gBlur), gBlur)))
    const saturate = Math.min(220, Math.max(100, Number.isFinite(Number(saturation)) ? Number(saturation) : 175))

    const surfaceFrostCss = glassOn && gBlur > 0
      ? `blur(${gBlur}px) saturate(${saturate}%) brightness(${isDark ? 1.04 : 1.01}) contrast(1.01)`
      : 'none'
    const composerFrostCss = glassOn && cBlur > 0
      ? `blur(${cBlur}px) saturate(${saturate}%) brightness(${isDark ? 1.04 : 1.01}) contrast(1.01)`
      : 'none'
    const settingsFrostCss = glassOn && sBlur > 0
      ? `blur(${sBlur}px) saturate(${saturate}%) brightness(${isDark ? 1.04 : 1.01}) contrast(1.01)`
      : 'none'

    const borderRgb = isDark ? '255, 255, 255' : '15, 23, 42'
    const rawBorder = Math.min(0.9, Math.max(0, pct(border, 32) / 100))
    const borderAlpha = isDark ? rawBorder * 0.42 : rawBorder * 0.24
    const highlightAlpha = highlight ? (isDark ? 0.16 : 0.48) : 0
    const sheenTop = isDark ? 0.08 : 0.16
    const shadowAlpha = isDark ? 0.26 : 0.08

    const mixFormula = (baseHex, tintRgb, alphaVal, floorVal) =>
      `color-mix(in srgb, ${baseHex} ${(floorVal * 100).toFixed(1)}%, rgba(${tintRgb}, ${Math.min(1, Math.max(0, alphaVal)).toFixed(3)}) ${((1 - floorVal) * 100).toFixed(1)}%)`

    const layer1Tint = mixFormula(clampedGlobal.hex, clampedGlobal.rgb, glassAlpha * 0.85, floor)
    const layer2Tint = mixFormula(clampedGlobal.hex, clampedGlobal.rgb, glassAlpha, floor)
    const layer3Tint = mixFormula(clampedGlobal.hex, clampedGlobal.rgb, glassAlpha * 1.15, floor)
    const elevatedTint = mixFormula(clampedGlobal.hex, clampedGlobal.rgb, glassAlpha * 1.24, Math.max(floor, isDark ? 0.62 : 0.56))
    const floatingTint = mixFormula(clampedGlobal.hex, clampedGlobal.rgb, glassAlpha * 1.25, Math.max(floor, isDark ? 0.72 : 0.68))

    const inputMajorTint = mixFormula(clampedChat.hex, clampedChat.rgb, glassAlpha, chatFloor)
    const bubbleTint = mixFormula(clampedChat.hex, clampedChat.rgb, bubbleAlpha, chatFloor)
    const codeBlockTint = mixFormula(clampedGlobal.hex, clampedGlobal.rgb, glassAlpha * 0.85, floor)
    const capsuleTint = `rgba(${clampedGlobal.rgb}, ${Math.min(0.45, Math.max(0.08, glassAlpha * 0.45)).toFixed(3)})`

    const sTrans = pct(pick('settingsWindow', settingsWindowTransparency, transPct), 24)
    const sAlpha = glassOn ? Math.max(0.10, 1 - sTrans / 100) * (isDark ? 0.72 : 0.84) : 0.96
    const settingsTint = mixFormula(clampedSettings.hex, clampedSettings.rgb, sAlpha, floor)
    const maskStrength = (pct(settingsMaskStrength, 80) / 100).toFixed(2)

    // Left sidebar & Titlebar formulas
    const lsAlphaPct = pct(pick('leftSidebar', leftSidebarTransparency, transPct), transPct)
    const lsBlurPx = Math.min(60, Math.max(0, pct(pick('leftSidebar', leftSidebarBlur, gBlur), gBlur)))
    const lsAlpha = Math.max(0.04, 1 - lsAlphaPct / 100) * (isDark ? 0.62 : 0.78)
    const lsActive = glassOn && leftSidebarGlass && !sidebarFullClear
    const leftSidebarTint = !lsActive
      ? 'transparent'
      : mixFormula(clampedGlobal.hex, clampedGlobal.rgb, lsAlpha, floor)
    const leftSidebarFrost = lsActive && lsBlurPx > 0
      ? `blur(${lsBlurPx}px) saturate(${saturate}%) brightness(${isDark ? 1.04 : 1.01})`
      : 'none'
    const leftSidebarSheen = lsActive
      ? `linear-gradient(180deg, rgba(255, 255, 255, ${sheenTop}), rgba(255, 255, 255, 0.025) 38%, rgba(255, 255, 255, 0.015))`
      : 'none'

    const tbAlphaPct = pct(pick('titlebar', titlebarTransparency, transPct), transPct)
    const tbBlurPx = Math.min(60, Math.max(0, pct(pick('titlebar', titlebarBlur, gBlur), gBlur)))
    const tbAlpha = Math.max(0.04, 1 - tbAlphaPct / 100) * (isDark ? 0.62 : 0.78)
    const tbActive = glassOn && titlebarGlass && !sidebarFullClear
    const titlebarTint = !tbActive
      ? 'transparent'
      : mixFormula(clampedGlobal.hex, clampedGlobal.rgb, tbAlpha, floor)
    const titlebarFrost = tbActive && tbBlurPx > 0
      ? `blur(${tbBlurPx}px) saturate(${saturate}%) brightness(${isDark ? 1.04 : 1.01})`
      : 'none'
    // Constant sheen stop-to-stop so thin titlebar height doesn't produce brightness step against sidebar
    const titlebarSheen = tbActive
      ? `linear-gradient(180deg, rgba(255, 255, 255, ${sheenTop}), rgba(255, 255, 255, ${sheenTop}))`
      : 'none'

    // Right sidebar / panel
    const rsFollow = sidebarFollowGlobal !== false && !modeCustom('sidebar')
    const rsBlurPx = rsFollow ? gBlur : Math.min(60, Math.max(0, pct(sidebarBlur, 18)))
    const rsAlphaPct = rsFollow ? transPct : pct(sidebarAlpha, 72)
    const rsAlpha = Math.max(0.04, 1 - rsAlphaPct / 100) * (isDark ? 0.62 : 0.78)
    const rsColorClamped = weClampSurfaceColor(rsFollow ? globalColorRaw : (sidebarColor || globalColorRaw), isDark, rawFid)
    const rsActive = glassOn && sidebarGlass && !sidebarFullClear
    const rightSidebarTint = sidebarFullClear
      ? 'transparent'
      : !rsActive
        ? (isDark ? '#18191e' : '#ffffff')
        : mixFormula(rsColorClamped.hex, rsColorClamped.rgb, rsAlpha, floor)
    const rightSidebarFrost = rsActive && rsBlurPx > 0
      ? `blur(${rsBlurPx}px) saturate(${saturate}%) brightness(${isDark ? 1.04 : 1.01})`
      : 'none'

    const leftRadius = cornerRadiusString(
      leftSidebarCornerRadius, leftSidebarSquareTL, leftSidebarSquareTR, leftSidebarSquareBR, leftSidebarSquareBL
    )
    const rightRadius = cornerRadiusString(
      rightSidebarCornerRadius, rightSidebarSquareTL, rightSidebarSquareTR, rightSidebarSquareBR, rightSidebarSquareBL
    )

    const validAccent = /^#[0-9a-f]{6}$/i.test(accent || '') ? accent : '#4f8cff'
    const accentInk = weAccentInk(validAccent)
    const resolvedThinking = ['off', 'glass', 'native'].includes(thinkingMode) ? thinkingMode : 'glass'

    const materialKey = JSON.stringify({
      active, wallpaperEnabled: Boolean(wallpaperEnabled), glassOn, isDark,
      layer1Tint, layer2Tint, layer3Tint, elevatedTint, floatingTint,
      inputMajorTint, bubbleTint, codeBlockTint, capsuleTint,
      settingsTint, sBlur, maskStrength,
      surfaceFrostCss, composerFrostCss, settingsFrostCss,
      leftSidebarTint, leftSidebarFrost, leftSidebarSheen, lsActive,
      titlebarTint, titlebarFrost, titlebarSheen, tbActive,
      rightSidebarTint, rightSidebarFrost, rsActive,
      leftRadius, rightRadius, borderRgb, borderAlpha, highlightAlpha, sheenTop, shadowAlpha,
      validAccent, accentInk, resolvedThinking, floaterSolidBase: Boolean(floaterSolidBase),
      sidebarFullClear: Boolean(sidebarFullClear)
    })

    if (this.lastMaterialKey === materialKey && this.styleEl.isConnected) return

    this.readHostSeeds(root)
    body.setAttribute('data-agy-skins-active', 'true')
    if (wallpaperEnabled) body.setAttribute('data-agy-skins-wallpaper', 'true')
    else body.removeAttribute('data-agy-skins-wallpaper')
    body.setAttribute('data-agy-thinking-mode', resolvedThinking)
    if (floaterSolidBase !== false) body.setAttribute('data-agy-floater-solid', 'true')
    else body.removeAttribute('data-agy-floater-solid')
    if (sidebarFullClear) body.setAttribute('data-agy-sidebar-fullclear', 'true')
    else body.removeAttribute('data-agy-sidebar-fullclear')
    if (titlebarGlass && !sidebarFullClear) body.setAttribute('data-agy-titlebar-glass', 'true')
    else body.removeAttribute('data-agy-titlebar-glass')
    if (leftSidebarGlass && !sidebarFullClear) body.setAttribute('data-agy-left-sidebar', 'true')
    else body.removeAttribute('data-agy-left-sidebar')

    const vars = {
      '--we-readability-base': clampedGlobal.hex,
      '--we-readability-floor': String(floor.toFixed(3)),
      '--we-chat-readability-base': clampedChat.hex,
      '--we-chat-readability-floor': String(chatFloor.toFixed(3)),
      '--we-accent-src': validAccent,
      '--we-accent': validAccent,
      '--we-accent-ink': accentInk,
      '--agy-skins-accent': validAccent,

      '--we-layer-1': layer1Tint,
      '--we-layer-2': layer2Tint,
      '--we-layer-3': layer3Tint,
      '--we-elevated-fill': elevatedTint,
      '--we-floating-tint': floatingTint,
      '--we-input-major': inputMajorTint,
      '--we-bubble-fill': bubbleTint,
      '--we-code-block-fill': codeBlockTint,
      '--we-capsule-fill': capsuleTint,

      '--we-settings-tint': settingsTint,
      '--we-settings-frost': settingsFrostCss,
      '--we-settings-blur-px': `${sBlur}px`,
      '--we-mask-strength': maskStrength,

      '--we-surface-frost': surfaceFrostCss,
      '--we-composer-frost': composerFrostCss,

      '--we-sidebar-tint': leftSidebarTint,
      '--we-sidebar-frost': leftSidebarFrost,
      '--we-sidebar-sheen': leftSidebarSheen,
      '--we-titlebar-tint': titlebarTint,
      '--we-titlebar-frost': titlebarFrost,
      '--we-titlebar-sheen': titlebarSheen,
      '--we-right-sidebar-tint': rightSidebarTint,
      '--we-right-sidebar-frost': rightSidebarFrost,

      '--we-border-rgb': borderRgb,
      '--we-border-alpha': String(borderAlpha.toFixed(3)),
      '--we-highlight-alpha': String(highlightAlpha.toFixed(3)),
      '--we-sheen-top': String(sheenTop),
      '--we-shadow-alpha': String(shadowAlpha),
      '--we-left-radius': leftRadius,
      '--we-right-radius': rightRadius,

      // Legacy alias vars preserved for smooth diagnostics / tests
      '--agy-skins-chrome-tint': layer2Tint,
      '--agy-skins-card-tint': inputMajorTint,
      '--agy-skins-sidebar-tint': leftSidebarTint,
      '--agy-skins-floating-tint': floatingTint,
      '--agy-skins-overlay-tint': settingsTint,
      '--agy-skins-bubble-tint': bubbleTint,
      '--agy-skins-frost': surfaceFrostCss,
      '--agy-skins-composer-frost': composerFrostCss,
      '--agy-skins-overlay-frost': settingsFrostCss
    }

    if (this.materialRule) {
      for (const [k, v] of Object.entries(vars)) {
        if (this.materialRule.getPropertyValue(k).trim() !== v) {
          this.materialRule.setProperty(k, v)
        }
      }
      this.lastMaterialKey = materialKey
      return
    }

    const varLines = Object.entries(vars).map(([k, v]) => `  ${k}: ${v};`).join('\n')
    const css = `
/* Unified Antigravity token remap + material variables */
body[data-agy-skins-active="true"] {
${varLines}
  --onyx-frame: transparent;
  --onyx-well: color-mix(in srgb, var(--we-readability-base) 26%, rgba(128, 128, 128, 0.08));
  --onyx-raised: var(--we-elevated-fill);
  --onyx-selected: color-mix(in srgb, var(--we-accent-src) 18%, var(--we-elevated-fill));
  --onyx-key: var(--we-elevated-fill);
  --sidebar-secondary: color-mix(in srgb, var(--we-accent-src) 18%, rgba(128, 128, 128, 0.10));
  --sidebar-muted: color-mix(in srgb, var(--we-accent-src) 10%, rgba(128, 128, 128, 0.05));
  --secondary: var(--we-capsule-fill);
  --muted: var(--we-layer-1);
  --card: var(--we-layer-2);
  --glass: var(--we-input-major);
  --border: rgba(var(--we-border-rgb), var(--we-border-alpha));
  --card-border: rgba(var(--we-border-rgb), var(--we-border-alpha));
  --glass-border: rgba(var(--we-border-rgb), var(--we-border-alpha));
  --glass-highlight: rgba(255, 255, 255, var(--we-highlight-alpha));
}

/* Unified single-canvas wallpaper backdrop: remove ALL seams between shell, top bar, titlebar, and main chat */
body[data-agy-skins-active="true"][data-agy-skins-wallpaper="true"] {
  --background: transparent;
  --shell: transparent;
  --shell-canvas: transparent;
  --content: transparent;
  --home-glow: transparent;
  background-color: transparent !important;
}

body[data-agy-skins-active="true"][data-agy-skins-wallpaper="true"] :is(
  .agy-shell,
  .agy-sheet,
  .agy-inset-shell,
  [data-split-root],
  [data-split-fill-edge],
  [data-main-content-header],
  [data-main-content-body],
  [class*="@container/titlebar"],
  [data-tiling-pane]:not([data-browser-hole]),
  [data-pane-id]:not([data-browser-hole])
) {
  background: transparent !important;
  background-color: transparent !important;
  background-image: none !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
  border-color: transparent !important;
  box-shadow: none !important;
}

/* Remove inset sheet borders, rounded box margins, and right-column titlebar wrapper doubling */
body[data-agy-skins-active="true"][data-agy-skins-wallpaper="true"] .agy-sheet[data-sheet-inset] [data-main-content-body] {
  margin: 0 !important;
  border-radius: 0 !important;
}
body[data-agy-skins-active="true"][data-agy-skins-wallpaper="true"] .agy-sheet[data-sheet-inset] [data-main-content-body]::after,
body[data-agy-skins-active="true"][data-agy-skins-wallpaper="true"] .agy-sheet[data-sheet-inset] [data-main-content-body]::before,
body[data-agy-skins-active="true"][data-agy-skins-wallpaper="true"] [data-split-panes] .agy-sheet[data-sheet-inset] [data-tiling-pane]::after,
body[data-agy-skins-active="true"][data-agy-skins-wallpaper="true"] .agy-sheet[data-sheet-inset] [data-hoisted-slot-rim="side"] {
  content: none !important;
  display: none !important;
  box-shadow: none !important;
}
body[data-agy-skins-active="true"][data-agy-skins-wallpaper="true"] [data-split-fill-edge] > .shrink-0 {
  background: transparent !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
  box-shadow: none !important;
  border-color: transparent !important;
}
body[data-agy-skins-active="true"][data-agy-skins-wallpaper="true"] .agy-shell {
  position: relative !important;
  z-index: 1 !important;
}

/* Eliminate the 48px gradient bandage bar right above the composer */
body[data-agy-skins-active="true"][data-agy-skins-wallpaper="true"] [data-main-content-body] .pointer-events-none.absolute.bottom-0,
body[data-agy-skins-active="true"][data-agy-skins-wallpaper="true"] [data-main-content-body] [class*="from-background"],
body[data-agy-skins-active="true"][data-agy-skins-wallpaper="true"] [data-main-content-body] [class*="to-background"],
body[data-agy-skins-active="true"][data-agy-skins-wallpaper="true"] [data-main-content-body] :has(> .surface-composer),
body[data-agy-skins-active="true"][data-agy-skins-wallpaper="true"] [data-main-content-body] :has(> .surface-composer) > [class*="bg-gradient"] {
  background: transparent !important;
  background-color: transparent !important;
  background-image: none !important;
}

/* Top window bar ONLY when titlebarGlass is enabled (constant sheen -> no seam against left sidebar) */
body[data-agy-skins-active="true"] .agy-shell > .shrink-0 {
  background-color: var(--we-titlebar-tint) !important;
  background-image: var(--we-titlebar-sheen) !important;
  backdrop-filter: var(--we-titlebar-frost) !important;
  -webkit-backdrop-filter: var(--we-titlebar-frost) !important;
  border-bottom: none !important;
  box-shadow: none !important;
}
body[data-agy-skins-active="true"][data-agy-skins-wallpaper="true"]:not([data-agy-titlebar-glass="true"]) .agy-shell > .shrink-0 {
  background: transparent !important;
  background-image: none !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}

/* Left sidebar single unified structural veil + corner radii; clear all inner wrappers */
body[data-agy-skins-active="true"] [data-testid="sidebar-split"] > :first-child {
  background-color: var(--we-sidebar-tint) !important;
  background-image: var(--we-sidebar-sheen) !important;
  backdrop-filter: var(--we-sidebar-frost) !important;
  -webkit-backdrop-filter: var(--we-sidebar-frost) !important;
  border-radius: var(--we-left-radius) !important;
  border-right: none !important;
  box-shadow: none !important;
}
body[data-agy-skins-active="true"] [data-testid="sidebar-split"] .bg-sidebar,
body[data-agy-skins-active="true"] .agy-shell > .shrink-0 .bg-sidebar,
body[data-agy-skins-active="true"] [data-testid="conversation-list-sidebar"],
body[data-agy-skins-active="true"] [data-testid="sidebar-navigation-items"],
body[data-agy-skins-active="true"] .agy-sidebar-row .agy-row-actions,
body[data-agy-skins-active="true"] .agy-status-overflow {
  background: transparent !important;
  background-color: transparent !important;
  background-image: none !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
  box-shadow: none !important;
}

/* Sidebar elevated button & selected row -> cohesive glass pills instead of opaque white slabs */
body[data-agy-skins-active="true"] .agy-sidebar-raised,
body[data-agy-skins-active="true"] [data-testid="new-conversation-button"] {
  background-color: var(--we-elevated-fill) !important;
  border-color: rgba(var(--we-border-rgb), var(--we-border-alpha)) !important;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, var(--we-highlight-alpha)),
              inset 0 0 0 1px rgba(var(--we-border-rgb), var(--we-border-alpha)) !important;
}
body[data-agy-skins-active="true"] .agy-sidebar-row[data-selected="true"] {
  background-color: var(--sidebar-secondary) !important;
  --row-bg: transparent !important;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, calc(var(--we-highlight-alpha) * 0.6)),
              inset 0 0 0 1px color-mix(in srgb, var(--we-accent-src) 24%, rgba(var(--we-border-rgb), var(--we-border-alpha))) !important;
}

/* Right auxiliary / side panel (preserve split-browser cutout) */
body[data-agy-skins-active="true"] [data-side-panel-body]:not([data-has-browser-hole="true"]):not(:has([data-browser-hole]:not([data-browser-hole="false"]))) {
  background-color: var(--we-right-sidebar-tint) !important;
  background-image: var(--we-sidebar-sheen) !important;
  backdrop-filter: var(--we-right-sidebar-frost) !important;
  -webkit-backdrop-filter: var(--we-right-sidebar-frost) !important;
  border-radius: var(--we-right-radius) !important;
  box-shadow: none !important;
}
body[data-agy-skins-active="true"][data-has-browser-hole="true"] [data-has-browser-hole="true"],
body[data-agy-skins-active="true"][data-has-browser-hole="true"] [data-browser-hole]:not([data-browser-hole="false"]),
body[data-agy-skins-active="true"][data-has-browser-hole="true"] .browser-hole-opaque:not([data-has-browser-hole="true"]) {
  background: transparent !important;
  background-color: transparent !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}

/* iOS Liquid Glass Composer — strip 4px --onyx-frame ring; host backdrop-filter on ::before */
body[data-agy-skins-active="true"] .surface-composer {
  background: transparent !important;
  background-color: transparent !important;
  background-image: none !important;
  box-shadow: none !important;
}
body[data-agy-skins-active="true"] .surface-composer > .surface-composer-card {
  position: relative;
  isolation: isolate;
  background-color: var(--we-input-major) !important;
  background-image: linear-gradient(180deg, rgba(255, 255, 255, var(--we-sheen-top)), rgba(255, 255, 255, 0.04) 38%, rgba(255, 255, 255, 0.015)) !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, var(--we-highlight-alpha)),
    inset 0 0 0 1px rgba(var(--we-border-rgb), var(--we-border-alpha)),
    0 14px 36px -10px rgba(0, 0, 0, var(--we-shadow-alpha)) !important;
}
body[data-agy-skins-active="true"] .surface-composer > .surface-composer-card::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  z-index: -1;
  backdrop-filter: var(--we-composer-frost) !important;
  -webkit-backdrop-filter: var(--we-composer-frost) !important;
}

/* Thinking / Chat Content 3-Gear Mode: glass | off | native */
body[data-agy-skins-active="true"]:not([data-agy-thinking-mode="native"]) [data-testid="user-message-bubble"],
body[data-agy-skins-active="true"]:not([data-agy-thinking-mode="native"]) .agy-user-bubble {
  background-color: var(--we-bubble-fill) !important;
  background-image: linear-gradient(180deg, rgba(255, 255, 255, var(--we-sheen-top)), rgba(255, 255, 255, 0.04) 40%, rgba(255, 255, 255, 0.01)) !important;
  border-color: rgba(var(--we-border-rgb), var(--we-border-alpha)) !important;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, var(--we-highlight-alpha)),
    inset 0 0 0 1px rgba(var(--we-border-rgb), var(--we-border-alpha)) !important;
}
body[data-agy-skins-active="true"][data-agy-thinking-mode="glass"] [data-testid="user-message-bubble"],
body[data-agy-skins-active="true"][data-agy-thinking-mode="glass"] .agy-user-bubble,
body[data-agy-skins-active="true"][data-agy-thinking-mode="glass"] [data-markdown-root] pre,
body[data-agy-skins-active="true"][data-agy-thinking-mode="glass"] [data-testid="tool-group-collapsible"],
body[data-agy-skins-active="true"][data-agy-thinking-mode="glass"] [data-testid="worked-for-collapsible"] {
  backdrop-filter: var(--we-surface-frost) !important;
  -webkit-backdrop-filter: var(--we-surface-frost) !important;
}
body[data-agy-skins-active="true"]:not([data-agy-thinking-mode="native"]) [data-markdown-root] pre,
body[data-agy-skins-active="true"]:not([data-agy-thinking-mode="native"]) [data-markdown-root] table {
  background-color: var(--we-code-block-fill) !important;
  border-color: rgba(var(--we-border-rgb), var(--we-border-alpha)) !important;
}
body[data-agy-skins-active="true"]:not([data-agy-thinking-mode="native"]) [data-markdown-root] th {
  background-color: color-mix(in srgb, rgba(var(--we-border-rgb), 0.08) 65%, var(--we-code-block-fill)) !important;
}
body[data-agy-skins-active="true"]:not([data-agy-thinking-mode="native"]) [data-markdown-root] :not(pre) > code {
  background-color: var(--we-capsule-fill) !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}
body[data-agy-skins-active="true"][data-agy-thinking-mode="off"] :is([data-testid="user-message-bubble"], .agy-user-bubble, [data-markdown-root] pre) {
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}
body[data-agy-skins-active="true"][data-agy-thinking-mode="native"] [data-markdown-root] pre {
  background-color: var(--secondary) !important;
}

/* Unified Settings Modal Window & Backdrop Scrim */
body[data-agy-skins-active="true"] .settings-modal-backdrop {
  background-color: rgba(0, 0, 0, calc(0.32 * var(--we-mask-strength))) !important;
  backdrop-filter: blur(calc(var(--we-settings-blur-px) * 0.45)) !important;
  -webkit-backdrop-filter: blur(calc(var(--we-settings-blur-px) * 0.45)) !important;
}
body[data-agy-skins-active="true"] .settings-modal-container,
body[data-agy-skins-active="true"] [role="dialog"]:not(#agy-skins-studio-dialog) {
  background-color: var(--we-settings-tint) !important;
  background-image: linear-gradient(180deg, rgba(255, 255, 255, var(--we-sheen-top)), rgba(255, 255, 255, 0.03) 38%, rgba(255, 255, 255, 0.05)) !important;
  backdrop-filter: var(--we-settings-frost) !important;
  -webkit-backdrop-filter: var(--we-settings-frost) !important;
  border-color: rgba(var(--we-border-rgb), var(--we-border-alpha)) !important;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, var(--we-highlight-alpha)),
    inset 0 0 0 1px rgba(var(--we-border-rgb), var(--we-border-alpha)),
    0 24px 80px rgba(0, 7, 18, 0.34) !important;
}
body[data-agy-skins-active="true"] .settings-modal-container [data-testid="settings-sidebar"],
body[data-agy-skins-active="true"] .settings-modal-container .bg-background,
body[data-agy-skins-active="true"] .settings-modal-container .bg-sidebar {
  background-color: transparent !important;
  background-image: none !important;
}
body[data-agy-skins-active="true"] .settings-modal-container [data-testid="settings-sidebar"] {
  border-right: 1px solid rgba(var(--we-border-rgb), calc(var(--we-border-alpha) * 0.7)) !important;
}
body[data-agy-skins-active="true"] .settings-modal-container .bg-card {
  background-color: var(--we-layer-1) !important;
  border-color: rgba(var(--we-border-rgb), var(--we-border-alpha)) !important;
}

/* Floating menus / fastpick vs native tooltips (exempt tooltips from blur) */
body[data-agy-skins-active="true"] :is(.surface-glass, .agy-fastpick, .quick-input-widget, [role="menu"], [role="listbox"]) {
  background-color: var(--we-floating-tint) !important;
  backdrop-filter: var(--we-surface-frost) !important;
  -webkit-backdrop-filter: var(--we-surface-frost) !important;
  border-color: rgba(var(--we-border-rgb), var(--we-border-alpha)) !important;
}
body[data-agy-skins-active="true"] [role="tooltip"] {
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}

/* Embedded xterm transparent support */
body[data-agy-skins-active="true"] :is(.xterm, .xterm-screen, .xterm-viewport) {
  background-color: transparent !important;
}
`
    this.styleEl.textContent = css
    this.materialRule = this.styleEl.sheet?.cssRules?.[0]?.style || null
    this.lastMaterialKey = materialKey
    this.syncTerminalObserver()
  }

  clearAll(body) {
    for (const attr of [
      'data-agy-skins-active',
      'data-agy-skins-wallpaper',
      'data-agy-thinking-mode',
      'data-agy-floater-solid',
      'data-agy-sidebar-fullclear',
      'data-agy-titlebar-glass',
      'data-agy-left-sidebar'
    ]) {
      body?.removeAttribute?.(attr)
    }
    const el = this.styleEl || document.getElementById(STYLE_ID)
    el?.remove()
    this.styleEl = null
    this.materialRule = null
    this.lastMaterialKey = null
    this.releaseTerminalObserver()
  }

  syncTerminalObserver() {
    if (typeof MutationObserver !== 'function' || typeof document === 'undefined' || this.terminalObserver) return
    this.terminalObserver = new MutationObserver(entries => {
      for (const entry of entries) {
        if (entry.target?.nodeType === 1) this.applyTerminalSurface(entry.target)
      }
    })
    this.terminalObserver.observe(document.body, { childList: true, subtree: true })
    this.applyTerminalSurface(document.body)
  }

  applyTerminalSurface(root) {
    if (!root?.querySelectorAll) return
    const hosts = []
    if (root.matches?.('.xterm')) hosts.push(root)
    hosts.push(...root.querySelectorAll('.xterm'))
    for (const host of hosts) {
      const found = findXtermTerminal(host)
      if (!found?.terminal) continue
      const { terminal, addon } = found
      let rec = this.terminalRecords.get(terminal)
      if (!rec) {
        rec = {
          terminal, addon,
          hostTheme: { ...(terminal.options?.theme || {}) },
          originalAlpha: terminal.options?.allowTransparency
        }
        this.terminalRecords.set(terminal, rec)
      }
      try {
        terminal.options.allowTransparency = true
        terminal.options.theme = { ...(terminal.options?.theme || {}), background: 'rgba(0, 0, 0, 0)' }
        addon?.clearTextureAtlas?.()
        terminal.refresh(0, Math.max(0, terminal.rows - 1))
      } catch {}
    }
  }

  releaseTerminalObserver() {
    this.terminalObserver?.disconnect()
    this.terminalObserver = null
    for (const rec of this.terminalRecords.values()) {
      try {
        rec.terminal.options.allowTransparency = rec.originalAlpha
        rec.terminal.options.theme = { ...rec.hostTheme }
        rec.addon?.clearTextureAtlas?.()
        rec.terminal.refresh(0, Math.max(0, rec.terminal.rows - 1))
      } catch {}
    }
    this.terminalRecords.clear()
  }

  destroy() {
    this.update({ enabled: false, glassEnabled: false, wallpaperEnabled: false })
  }
}
