/**
 * Unified Two-Stage Readability Liquid Glass controller for Google Antigravity 2.0,
 * modeled directly on elysia395/dsh-wallpaper-engine (packages/glass/src/glass-css.js + glass.js).
 *
 * Performance & visual architecture:
 * - Writes dynamic visual properties directly onto scoped per-surface CSSOM rules
 *   (topbar, leftSidebar, rightSidebar, composer, settingsModal, floaters, etc.)
 *   rather than mutating custom properties on <html>/<body> during slider drags,
 *   keeping interactive drags at ~3-10ms/frame across Antigravity's 4,000+ DOM nodes.
 * - Avoids full-viewport backdrop-filter blur on .settings-modal-backdrop so live
 *   1080p/4K video wallpapers never trigger double full-screen blur passes.
 * - Syncs root-level --card / --color-card / --onyx-* tokens on commit updates so
 *   both native Antigravity Tailwind v4 aliases and nested cards share cohesive opacity.
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

function setRuleProp(rule, prop, val, important = true) {
  if (!rule) return
  const strVal = String(val ?? '')
  if (important) {
    if (rule.getPropertyValue(prop).trim() !== strVal || rule.getPropertyPriority?.(prop) !== 'important') {
      rule.setProperty(prop, strVal, 'important')
    }
  } else {
    if (rule.getPropertyValue(prop).trim() !== strVal || rule.getPropertyPriority?.(prop) === 'important') {
      rule.setProperty(prop, strVal)
    }
  }
}

export class GlassController {
  constructor() {
    this.styleEl = null
    this.materialRule = null
    this.rules = null
    this.lastMaterialKey = null
    this.lastRootKey = null
    this.lastPickerKey = null
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
      isPreview = false,
      glassTransparency = 68,
      bubbleOpacity = 65,
      composerFrost = 22,
      surfaceFrost = 20,
      saturation = 175,
      border = 32,
      highlight = true,
      accent = '#4f8cff',
      glassColor = null,
      glassDarkSeparate = true,
      glassFidelity = 100,
      chatGlassFidelity = 100,
      settingsWindowTransparency = 18,
      settingsWindowBlur = 24,
      settingsMaskStrength = 55,
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
      titlebarGlass = true,
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
      this.rules = null
      this.lastMaterialKey = null
      this.lastRootKey = null
      this.lastPickerKey = null
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

    const transPct = pct(glassTransparency, 68)
    const glassAlpha = glassOn ? Math.max(0.04, 1 - transPct / 100) * (isDark ? 0.62 : 0.78) : 0.92
    const bubbleAlpha = glassOn ? Math.max(0.04, pct(bubbleOpacity, 65) / 100) * (isDark ? 0.56 : 0.72) : 0.92

    const gBlur = Math.min(60, Math.max(0, pct(surfaceFrost, 20)))
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
    const borderColorCss = `rgba(${borderRgb}, ${borderAlpha.toFixed(3)})`
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

    const sTrans = pct(pick('settingsWindow', settingsWindowTransparency, transPct), 18)
    const sAlpha = glassOn ? Math.max(0.10, 1 - sTrans / 100) * (isDark ? 0.72 : 0.84) : 0.96
    const settingsFloor = Math.max(floor, isDark ? 0.70 : 0.74)
    const settingsTint = mixFormula(clampedSettings.hex, clampedSettings.rgb, sAlpha, settingsFloor)
    const maskNum = pct(settingsMaskStrength, 55) / 100
    const maskStrength = maskNum.toFixed(2)
    const modalBackdrop = isDark
      ? `rgba(0, 0, 0, ${(0.44 * maskNum).toFixed(3)})`
      : `rgba(15, 23, 42, ${(0.14 * maskNum).toFixed(3)})`
    const inner1 = isDark ? 'rgba(255, 255, 255, 0.055)' : 'rgba(10, 10, 14, 0.042)'
    const inner2 = isDark ? 'rgba(255, 255, 255, 0.09)' : 'rgba(10, 10, 14, 0.07)'
    const inner3 = isDark ? 'rgba(255, 255, 255, 0.14)' : 'rgba(10, 10, 14, 0.11)'

    const lsAlphaPct = pct(pick('leftSidebar', leftSidebarTransparency, transPct), transPct)
    const lsBlurPx = Math.min(60, Math.max(0, pct(pick('leftSidebar', leftSidebarBlur, gBlur), gBlur)))
    const lsAlpha = Math.max(0.04, 1 - lsAlphaPct / 100) * (isDark ? 0.62 : 0.78)
    const lsActive = glassOn && leftSidebarGlass && !sidebarFullClear
    const leftSidebarTint = !lsActive ? 'transparent' : mixFormula(clampedGlobal.hex, clampedGlobal.rgb, lsAlpha, floor)
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
    const titlebarTint = !tbActive ? 'transparent' : mixFormula(clampedGlobal.hex, clampedGlobal.rgb, tbAlpha, floor)
    const titlebarFrost = tbActive && tbBlurPx > 0
      ? `blur(${tbBlurPx}px) saturate(${saturate}%) brightness(${isDark ? 1.04 : 1.01})`
      : 'none'
    const titlebarSheen = tbActive
      ? `linear-gradient(180deg, rgba(255, 255, 255, ${sheenTop}), rgba(255, 255, 255, ${sheenTop}))`
      : 'none'

    const rsFollow = sidebarFollowGlobal !== false && !modeCustom('sidebar')
    const rsBlurPx = rsFollow ? gBlur : Math.min(60, Math.max(0, pct(sidebarBlur, 18)))
    const rsAlphaPct = rsFollow ? transPct : pct(sidebarAlpha, 68)
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

    const leftRadius = cornerRadiusString(leftSidebarCornerRadius, leftSidebarSquareTL, leftSidebarSquareTR, leftSidebarSquareBR, leftSidebarSquareBL)
    const rightRadius = cornerRadiusString(rightSidebarCornerRadius, rightSidebarSquareTL, rightSidebarSquareTR, rightSidebarSquareBR, rightSidebarSquareBL)

    const validAccent = /^#[0-9a-f]{6}$/i.test(accent || '') ? accent : '#4f8cff'
    const accentInk = weAccentInk(validAccent)
    const resolvedThinking = ['off', 'glass', 'native'].includes(thinkingMode) ? thinkingMode : 'glass'

    const materialKey = JSON.stringify({
      active, wallpaperEnabled: Boolean(wallpaperEnabled), glassOn, isDark,
      layer1Tint, layer2Tint, layer3Tint, elevatedTint, floatingTint,
      inner1, inner2, inner3,
      inputMajorTint, bubbleTint, codeBlockTint, capsuleTint,
      settingsTint, sBlur, maskStrength, modalBackdrop,
      surfaceFrostCss, composerFrostCss, settingsFrostCss,
      leftSidebarTint, leftSidebarFrost, leftSidebarSheen, lsActive,
      titlebarTint, titlebarFrost, titlebarSheen, tbActive,
      rightSidebarTint, rightSidebarFrost, rsActive,
      leftRadius, rightRadius, borderRgb, borderAlpha, highlightAlpha, sheenTop, shadowAlpha,
      validAccent, accentInk, resolvedThinking, floaterSolidBase: Boolean(floaterSolidBase),
      sidebarFullClear: Boolean(sidebarFullClear)
    })

    if (this.lastMaterialKey === materialKey && this.styleEl.isConnected && (isPreview || this.lastRootKey === materialKey)) return

    this.readHostSeeds(root)
    for (const target of [root, body]) {
      if (target?.getAttribute?.('data-agy-skins-active') !== 'true') target?.setAttribute?.('data-agy-skins-active', 'true')
      if (wallpaperEnabled) {
        if (target?.getAttribute?.('data-agy-skins-wallpaper') !== 'true') target?.setAttribute?.('data-agy-skins-wallpaper', 'true')
      } else if (target?.getAttribute?.('data-agy-skins-wallpaper')) {
        target?.removeAttribute?.('data-agy-skins-wallpaper')
      }
    }
    if (body.getAttribute('data-agy-thinking-mode') !== resolvedThinking) body.setAttribute('data-agy-thinking-mode', resolvedThinking)
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
      '--we-inner-1': inner1,
      '--we-inner-2': inner2,
      '--we-inner-3': inner3,
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
      '--we-modal-backdrop': modalBackdrop,

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

    const rootImportantVars = {
      '--onyx-frame': 'transparent',
      '--onyx-well': inner1,
      '--onyx-raised': elevatedTint,
      '--onyx-selected': `color-mix(in srgb, ${validAccent} 18%, ${elevatedTint})`,
      '--onyx-key': inner2,
      '--sidebar-secondary': `color-mix(in srgb, ${validAccent} 14%, ${inner2})`,
      '--sidebar-muted': inner1,
      '--secondary': inner2,
      '--color-secondary': inner2,
      '--muted': inner1,
      '--color-muted': inner1,
      '--card': layer2Tint,
      '--color-card': layer2Tint,
      '--popover': floatingTint,
      '--color-popover': floatingTint,
      '--glass': inputMajorTint,
      '--border': borderColorCss,
      '--color-border': borderColorCss,
      '--card-border': borderColorCss,
      '--glass-border': borderColorCss,
      '--glass-highlight': `rgba(255, 255, 255, ${highlightAlpha.toFixed(3)})`
    }

    const composerSheen = `linear-gradient(180deg, rgba(255, 255, 255, ${sheenTop}), rgba(255, 255, 255, 0.04) 38%, rgba(255, 255, 255, 0.015))`
    const composerShadow = `inset 0 1px 0 rgba(255, 255, 255, ${highlightAlpha.toFixed(3)}), inset 0 0 0 1px ${borderColorCss}, 0 14px 36px -10px rgba(0, 0, 0, ${shadowAlpha})`
    const bubbleSheen = `linear-gradient(180deg, rgba(255, 255, 255, ${sheenTop}), rgba(255, 255, 255, 0.04) 40%, rgba(255, 255, 255, 0.01))`
    const bubbleShadow = `inset 0 1px 0 rgba(255, 255, 255, ${highlightAlpha.toFixed(3)}), inset 0 0 0 1px ${borderColorCss}`
    const settingsSheen = `linear-gradient(180deg, rgba(255, 255, 255, ${sheenTop}), rgba(255, 255, 255, 0.025) 38%, rgba(255, 255, 255, 0.04))`
    const settingsShadow = `inset 0 1px 0 rgba(255, 255, 255, ${highlightAlpha.toFixed(3)}), inset 0 0 0 1px ${borderColorCss}, 0 24px 80px rgba(0, 7, 18, 0.28)`
    const selectedBorderColor = `color-mix(in srgb, ${validAccent} 24%, ${borderColorCss})`
    const selectedRowShadow = `inset 0 1px 0 rgba(255, 255, 255, ${(highlightAlpha * 0.6).toFixed(3)}), inset 0 0 0 1px ${selectedBorderColor}`

    if (this.rules) {
      // Fast-path: update direct targeted CSSOM rules cleanly (~3-10ms instead of 400ms full-doc var recalc!)
      setRuleProp(this.rules.topbar, 'background-color', tbActive ? titlebarTint : 'transparent')
      setRuleProp(this.rules.topbar, 'background-image', tbActive ? titlebarSheen : 'none')
      setRuleProp(this.rules.topbar, 'backdrop-filter', tbActive ? titlebarFrost : 'none')
      setRuleProp(this.rules.topbar, '-webkit-backdrop-filter', tbActive ? titlebarFrost : 'none')

      setRuleProp(this.rules.leftSidebar, 'background-color', leftSidebarTint)
      setRuleProp(this.rules.leftSidebar, 'background-image', leftSidebarSheen)
      setRuleProp(this.rules.leftSidebar, 'backdrop-filter', leftSidebarFrost)
      setRuleProp(this.rules.leftSidebar, '-webkit-backdrop-filter', leftSidebarFrost)
      setRuleProp(this.rules.leftSidebar, 'border-radius', leftRadius)

      setRuleProp(this.rules.rightSidebar, 'background-color', rightSidebarTint)
      setRuleProp(this.rules.rightSidebar, 'background-image', leftSidebarSheen)
      setRuleProp(this.rules.rightSidebar, 'backdrop-filter', rightSidebarFrost)
      setRuleProp(this.rules.rightSidebar, '-webkit-backdrop-filter', rightSidebarFrost)
      setRuleProp(this.rules.rightSidebar, 'border-radius', rightRadius)

      setRuleProp(this.rules.newChatBtn, 'background-color', inner2)
      setRuleProp(this.rules.newChatBtn, 'border-color', borderColorCss)
      setRuleProp(this.rules.newChatBtn, 'box-shadow', bubbleShadow)

      setRuleProp(this.rules.selectedRow, 'background-color', `color-mix(in srgb, ${validAccent} 14%, ${inner2})`)
      setRuleProp(this.rules.selectedRow, 'box-shadow', selectedRowShadow)

      setRuleProp(this.rules.composerCard, 'background-color', inputMajorTint)
      setRuleProp(this.rules.composerCard, 'background-image', composerSheen)
      setRuleProp(this.rules.composerCard, 'box-shadow', composerShadow)
      setRuleProp(this.rules.composerBefore, 'backdrop-filter', composerFrostCss)
      setRuleProp(this.rules.composerBefore, '-webkit-backdrop-filter', composerFrostCss)

      setRuleProp(this.rules.bubbles, 'background-color', resolvedThinking === 'native' ? '' : bubbleTint)
      setRuleProp(this.rules.bubbles, 'background-image', resolvedThinking === 'native' ? '' : bubbleSheen)
      setRuleProp(this.rules.bubbles, 'border-color', borderColorCss)
      setRuleProp(this.rules.bubbles, 'box-shadow', resolvedThinking === 'native' ? '' : bubbleShadow)
      setRuleProp(this.rules.bubbles, 'backdrop-filter', resolvedThinking === 'glass' ? surfaceFrostCss : 'none')
      setRuleProp(this.rules.bubbles, '-webkit-backdrop-filter', resolvedThinking === 'glass' ? surfaceFrostCss : 'none')

      setRuleProp(this.rules.chatPre, 'background-color', resolvedThinking === 'native' ? inner2 : codeBlockTint)
      setRuleProp(this.rules.chatPre, 'border-color', borderColorCss)
      setRuleProp(this.rules.chatPre, 'backdrop-filter', resolvedThinking === 'glass' ? surfaceFrostCss : 'none')
      setRuleProp(this.rules.chatPre, '-webkit-backdrop-filter', resolvedThinking === 'glass' ? surfaceFrostCss : 'none')

      setRuleProp(this.rules.settingsBackdrop, 'background-color', modalBackdrop)

      setRuleProp(this.rules.settingsModal, 'background-color', settingsTint)
      setRuleProp(this.rules.settingsModal, 'background-image', settingsSheen)
      setRuleProp(this.rules.settingsModal, 'backdrop-filter', settingsFrostCss)
      setRuleProp(this.rules.settingsModal, '-webkit-backdrop-filter', settingsFrostCss)
      setRuleProp(this.rules.settingsModal, 'border-color', borderColorCss)
      setRuleProp(this.rules.settingsModal, 'box-shadow', settingsShadow)

      setRuleProp(this.rules.floaters, 'background-color', floatingTint)
      setRuleProp(this.rules.floaters, 'backdrop-filter', surfaceFrostCss)
      setRuleProp(this.rules.floaters, '-webkit-backdrop-filter', surfaceFrostCss)
      setRuleProp(this.rules.floaters, 'border-color', borderColorCss)

      const pickerKey = `${inner1}|${inner2}|${inner3}|${borderRgb}|${borderAlpha}|${validAccent}|${accentInk}|${clampedGlobal.hex}`
      if (this.lastPickerKey !== pickerKey && this.rules.pickerVars) {
        setRuleProp(this.rules.pickerVars, '--we-inner-1', inner1, false)
        setRuleProp(this.rules.pickerVars, '--we-inner-2', inner2, false)
        setRuleProp(this.rules.pickerVars, '--we-inner-3', inner3, false)
        setRuleProp(this.rules.pickerVars, '--we-border-rgb', borderRgb, false)
        setRuleProp(this.rules.pickerVars, '--we-border-alpha', String(borderAlpha.toFixed(3)), false)
        setRuleProp(this.rules.pickerVars, '--we-readability-base', clampedGlobal.hex, false)
        setRuleProp(this.rules.pickerVars, '--we-accent-src', validAccent, false)
        setRuleProp(this.rules.pickerVars, '--we-accent-ink', accentInk, false)
        this.lastPickerKey = pickerKey
      }

      if (!isPreview && this.materialRule) {
        for (const [k, v] of Object.entries(vars)) setRuleProp(this.materialRule, k, v, false)
        for (const [k, v] of Object.entries(rootImportantVars)) setRuleProp(this.materialRule, k, v, true)
        this.lastRootKey = materialKey
      }
      this.lastMaterialKey = materialKey
      return
    }

    const varLines = Object.entries(vars).map(([k, v]) => `  ${k}: ${v};`).join('\n')
    const importantVarLines = Object.entries(rootImportantVars).map(([k, v]) => `  ${k}: ${v} !important;`).join('\n')
    const css = `
/* 0. Root material tokens (synced on commit only, not 60fps drags) */
html[data-agy-skins-active="true"],
body[data-agy-skins-active="true"] {
${varLines}
${importantVarLines}
}

/* 1. Scoped .we-picker tokens (never invalidates host workbench DOM) */
.we-picker {
  --we-inner-1: ${inner1};
  --we-inner-2: ${inner2};
  --we-inner-3: ${inner3};
  --we-border-rgb: ${borderRgb};
  --we-border-alpha: ${borderAlpha.toFixed(3)};
  --we-readability-base: ${clampedGlobal.hex};
  --we-accent-src: ${validAccent};
  --we-accent-ink: ${accentInk};
}

/* 2. Top bar rule */
body[data-agy-skins-active="true"] .agy-shell > .shrink-0 {
  background-color: ${tbActive ? titlebarTint : 'transparent'} !important;
  background-image: ${tbActive ? titlebarSheen : 'none'} !important;
  backdrop-filter: ${tbActive ? titlebarFrost : 'none'} !important;
  -webkit-backdrop-filter: ${tbActive ? titlebarFrost : 'none'} !important;
  border-bottom: none !important;
  box-shadow: none !important;
}

/* 3. Left sidebar rule */
body[data-agy-skins-active="true"] [data-testid="sidebar-split"] > :first-child {
  background-color: ${leftSidebarTint} !important;
  background-image: ${leftSidebarSheen} !important;
  backdrop-filter: ${leftSidebarFrost} !important;
  -webkit-backdrop-filter: ${leftSidebarFrost} !important;
  border-radius: ${leftRadius} !important;
  border-right: none !important;
  box-shadow: none !important;
}

/* 4. Right side panel unified from y=30 top strip through body */
body[data-agy-skins-active="true"] [data-side-panel-focus-scope]:not([data-has-browser-hole="true"]):not(:has([data-browser-hole]:not([data-browser-hole="false"]))) {
  background-color: ${rightSidebarTint} !important;
  background-image: ${leftSidebarSheen} !important;
  backdrop-filter: ${rightSidebarFrost} !important;
  -webkit-backdrop-filter: ${rightSidebarFrost} !important;
  border-radius: ${rightRadius} !important;
  box-shadow: none !important;
}

/* 5. Sidebar elevated button */
body[data-agy-skins-active="true"] :is(.agy-sidebar-raised, [data-testid="new-conversation-button"]) {
  background-color: ${inner2} !important;
  border-color: ${borderColorCss} !important;
  box-shadow: ${bubbleShadow} !important;
}

/* 6. Selected sidebar row */
body[data-agy-skins-active="true"] .agy-sidebar-row[data-selected="true"] {
  background-color: color-mix(in srgb, ${validAccent} 14%, ${inner2}) !important;
  --row-bg: transparent !important;
  box-shadow: ${selectedRowShadow} !important;
}

/* 7. Composer card */
body[data-agy-skins-active="true"] .surface-composer > .surface-composer-card {
  position: relative;
  isolation: isolate;
  background-color: ${inputMajorTint} !important;
  background-image: ${composerSheen} !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
  box-shadow: ${composerShadow} !important;
}

/* 8. Composer ::before frost carrier */
body[data-agy-skins-active="true"] .surface-composer > .surface-composer-card::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  z-index: -1;
  backdrop-filter: ${composerFrostCss} !important;
  -webkit-backdrop-filter: ${composerFrostCss} !important;
}

/* 9. User message bubbles */
body[data-agy-skins-active="true"]:not([data-agy-thinking-mode="native"]) :is([data-testid="user-message-bubble"], .agy-user-bubble) {
  background-color: ${bubbleTint} !important;
  background-image: ${bubbleSheen} !important;
  border-color: ${borderColorCss} !important;
  box-shadow: ${bubbleShadow} !important;
  backdrop-filter: ${resolvedThinking === 'glass' ? surfaceFrostCss : 'none'} !important;
  -webkit-backdrop-filter: ${resolvedThinking === 'glass' ? surfaceFrostCss : 'none'} !important;
}

/* 10. Markdown code/tables */
body[data-agy-skins-active="true"]:not([data-agy-thinking-mode="native"]) [data-markdown-root] :is(pre, table) {
  background-color: ${codeBlockTint} !important;
  border-color: ${borderColorCss} !important;
  backdrop-filter: ${resolvedThinking === 'glass' ? surfaceFrostCss : 'none'} !important;
  -webkit-backdrop-filter: ${resolvedThinking === 'glass' ? surfaceFrostCss : 'none'} !important;
}

/* 11. Settings modal backdrop scrim (no fullscreen video blur pass!) */
body[data-agy-skins-active="true"] .settings-modal-backdrop,
#agy-skins-studio-backdrop {
  background-color: ${modalBackdrop} !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}

/* 12. Settings modal & Alt+Shift+W frosted sheet */
body[data-agy-skins-active="true"] .settings-modal-container,
body[data-agy-skins-active="true"] #agy-skins-studio-dialog,
body[data-agy-skins-active="true"] [role="dialog"]:not(#agy-skins-studio-dialog) {
  background-color: ${settingsTint} !important;
  background-image: ${settingsSheen} !important;
  backdrop-filter: ${settingsFrostCss} !important;
  -webkit-backdrop-filter: ${settingsFrostCss} !important;
  border-color: ${borderColorCss} !important;
  box-shadow: ${settingsShadow} !important;
}

/* 13. Floating menus, overview gutters, fastpick & portals */
body[data-agy-skins-active="true"] :is(
  .surface-glass,
  .agy-fastpick,
  .agy-popover,
  .quick-input-widget,
  [data-testid="overview-panel-host-gutter"],
  [data-radix-popper-content-wrapper] > *,
  [data-base-ui-portal] :is([role="listbox"], [role="menu"], [role="dialog"]),
  [role="menu"],
  [role="listbox"]
) {
  background-color: ${floatingTint} !important;
  backdrop-filter: ${surfaceFrostCss} !important;
  -webkit-backdrop-filter: ${surfaceFrostCss} !important;
  border-color: ${borderColorCss} !important;
}

/* Static structural clears */
html[data-agy-skins-active="true"][data-agy-skins-wallpaper="true"],
body[data-agy-skins-active="true"][data-agy-skins-wallpaper="true"] {
  --background: transparent !important;
  --color-background: transparent !important;
  --shell: transparent !important;
  --shell-canvas: transparent !important;
  --content: transparent !important;
  --home-glow: transparent !important;
  background-color: transparent !important;
}

body[data-agy-skins-active="true"] :is(
  .settings-modal-container,
  #agy-skins-studio-dialog,
  [data-testid="sidebar-split"] > :first-child,
  [data-side-panel-focus-scope]
) {
  --card: var(--we-inner-1) !important;
  --color-card: var(--we-inner-1) !important;
  --onyx-raised: var(--we-inner-2) !important;
  --onyx-well: var(--we-inner-1) !important;
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

body[data-agy-skins-active="true"][data-agy-skins-wallpaper="true"] .agy-sheet[data-sheet-inset] [data-main-content-body],
body[data-agy-skins-active="true"][data-agy-skins-wallpaper="true"] .agy-inset-shell [data-side-panel-body] {
  margin: 0 !important;
  border-radius: 0 !important;
  background: transparent !important;
  background-color: transparent !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}
body[data-agy-skins-active="true"][data-agy-skins-wallpaper="true"] .agy-sheet[data-sheet-inset] [data-main-content-body]::after,
body[data-agy-skins-active="true"][data-agy-skins-wallpaper="true"] .agy-sheet[data-sheet-inset] [data-main-content-body]::before,
body[data-agy-skins-active="true"][data-agy-skins-wallpaper="true"] .agy-inset-shell [data-side-panel-body]::after,
body[data-agy-skins-active="true"][data-agy-skins-wallpaper="true"] [data-split-panes] .agy-sheet[data-sheet-inset] [data-tiling-pane]::after,
body[data-agy-skins-active="true"][data-agy-skins-wallpaper="true"] [data-split-panes] .agy-sheet[data-sheet-inset] [data-main-content-body] > [data-testid="bottom-terminal-panel"]::after,
body[data-agy-skins-active="true"][data-agy-skins-wallpaper="true"] .agy-sheet[data-sheet-inset] [data-hoisted-slot-rim="side"] {
  content: none !important;
  display: none !important;
  box-shadow: none !important;
}
body[data-agy-skins-active="true"][data-agy-skins-wallpaper="true"] [data-split-fill-edge] > .shrink-0,
body[data-agy-skins-active="true"][data-agy-skins-wallpaper="true"] .agy-inset-shell [data-side-panel-strip],
body[data-agy-skins-active="true"][data-agy-skins-wallpaper="true"] [data-split-panes] .agy-sheet[data-sheet-inset] [data-main-content-body] > [data-testid="bottom-terminal-panel"],
body[data-agy-skins-active="true"][data-agy-skins-wallpaper="true"] [data-split-panes] .agy-sheet[data-sheet-inset] [data-testid="tiling-splitter"] > [data-splitter-band] {
  background: transparent !important;
  background-color: transparent !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
  box-shadow: none !important;
  border-color: transparent !important;
}
body[data-agy-skins-active="true"][data-agy-skins-wallpaper="true"] .agy-shell {
  position: relative !important;
  z-index: 1 !important;
}

body[data-agy-skins-active="true"][data-agy-skins-wallpaper="true"] [data-main-content-body] .pointer-events-none.absolute.bottom-0,
body[data-agy-skins-active="true"][data-agy-skins-wallpaper="true"] [data-main-content-body] [class*="from-background"],
body[data-agy-skins-active="true"][data-agy-skins-wallpaper="true"] [data-main-content-body] [class*="to-background"],
body[data-agy-skins-active="true"][data-agy-skins-wallpaper="true"] [data-main-content-body] :has(> .surface-composer),
body[data-agy-skins-active="true"][data-agy-skins-wallpaper="true"] [data-main-content-body] :has(> .surface-composer) > [class*="bg-gradient"] {
  background: transparent !important;
  background-color: transparent !important;
  background-image: none !important;
}

body[data-agy-skins-active="true"] [data-testid="sidebar-split"] .bg-sidebar,
body[data-agy-skins-active="true"] .agy-shell > .shrink-0 .bg-sidebar,
body[data-agy-skins-active="true"] [data-testid="conversation-list-sidebar"],
body[data-agy-skins-active="true"] [data-testid="sidebar-navigation-items"],
body[data-agy-skins-active="true"] .agy-sidebar-row .agy-row-actions,
body[data-agy-skins-active="true"] .agy-status-overflow,
body[data-agy-skins-active="true"] .surface-composer,
body[data-agy-skins-active="true"] .settings-modal-container [data-testid="settings-sidebar"],
body[data-agy-skins-active="true"] .settings-modal-container .bg-background,
body[data-agy-skins-active="true"] .settings-modal-container .bg-sidebar {
  background: transparent !important;
  background-color: transparent !important;
  background-image: none !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
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

body[data-agy-skins-active="true"][data-agy-thinking-mode="glass"] :is([data-testid="tool-group-collapsible"], [data-testid="worked-for-collapsible"]) {
  backdrop-filter: blur(16px) !important;
  -webkit-backdrop-filter: blur(16px) !important;
}
body[data-agy-skins-active="true"]:not([data-agy-thinking-mode="native"]) [data-markdown-root] th {
  background-color: var(--we-inner-1) !important;
}
body[data-agy-skins-active="true"]:not([data-agy-thinking-mode="native"]) [data-markdown-root] :not(pre) > code {
  background-color: var(--we-capsule-fill) !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}

body[data-agy-skins-active="true"] .settings-modal-container [data-testid="settings-sidebar"] {
  border-right: 1px solid var(--border) !important;
}
body[data-agy-skins-active="true"] .settings-modal-container .bg-card {
  background-color: var(--we-inner-1) !important;
  border-color: var(--border) !important;
}
body[data-agy-skins-active="true"] [role="tooltip"] {
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}
body[data-agy-skins-active="true"] :is(.xterm, .xterm-screen, .xterm-viewport) {
  background-color: transparent !important;
}
`
    this.styleEl.textContent = css
    const cssRules = this.styleEl.sheet?.cssRules
    this.materialRule = cssRules?.[0]?.style || null
    if (cssRules && cssRules.length >= 14) {
      this.rules = {
        rootVars: cssRules[0].style,
        pickerVars: cssRules[1].style,
        topbar: cssRules[2].style,
        leftSidebar: cssRules[3].style,
        rightSidebar: cssRules[4].style,
        newChatBtn: cssRules[5].style,
        selectedRow: cssRules[6].style,
        composerCard: cssRules[7].style,
        composerBefore: cssRules[8].style,
        bubbles: cssRules[9].style,
        chatPre: cssRules[10].style,
        settingsBackdrop: cssRules[11].style,
        settingsModal: cssRules[12].style,
        floaters: cssRules[13].style
      }
    }
    this.lastMaterialKey = materialKey
    if (!isPreview) this.lastRootKey = materialKey
    this.lastPickerKey = `${inner1}|${inner2}|${inner3}|${borderRgb}|${borderAlpha}|${validAccent}|${accentInk}|${clampedGlobal.hex}`
    this.syncTerminalObserver()
  }

  clearAll(body) {
    const root = typeof document !== 'undefined' ? document.documentElement : null
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
      root?.removeAttribute?.(attr)
    }
    const el = this.styleEl || document.getElementById(STYLE_ID)
    el?.remove()
    this.styleEl = null
    this.materialRule = null
    this.rules = null
    this.lastMaterialKey = null
    this.lastRootKey = null
    this.lastPickerKey = null
    this.releaseTerminalObserver()
  }

  syncTerminalObserver() {
    if (typeof MutationObserver !== 'function' || typeof document === 'undefined' || this.terminalObserver) return
    const pendingRoots = new Set()
    let rafId = 0
    this.terminalObserver = new MutationObserver(entries => {
      for (const entry of entries) {
        for (const node of entry.addedNodes || []) {
          if (node?.nodeType !== 1) continue
          if (node.matches?.('.xterm') || node.querySelector?.('.xterm')) {
            pendingRoots.add(node)
          }
        }
      }
      if (!pendingRoots.size || rafId) return
      const schedule = typeof requestAnimationFrame === 'function' ? requestAnimationFrame : cb => setTimeout(cb, 0)
      rafId = schedule(() => {
        rafId = 0
        for (const root of pendingRoots) this.applyTerminalSurface(root)
        pendingRoots.clear()
      })
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
