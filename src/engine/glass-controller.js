/**
 * Single-veil CSSOM Liquid Glass controller for Google Antigravity 2.0.
 *
 * Scopes all overrides to body[data-agy-skins-active="true"] so <html> retains
 * Antigravity's native inline theme seed variables (--background, --sidebar,
 * --card, --primary) untouched. After the initial stylesheet parse, slider
 * updates mutate only CSSOM properties on rule[0] without rewriting sheet text.
 */
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

  rgbaFromSeed(seed, alphaPct, fallbackHex) {
    const a = Math.min(1, Math.max(0, alphaPct / 100))
    if (seed) return `rgba(${seed.r}, ${seed.g}, ${seed.b}, ${a.toFixed(4)})`
    const parsed = parseSerializedColor(fallbackHex)
    if (parsed) return `rgba(${parsed.r}, ${parsed.g}, ${parsed.b}, ${a.toFixed(4)})`
    return `color-mix(in srgb, ${fallbackHex} ${alphaPct}%, transparent)`
  }

  update(params = {}) {
    if (typeof document === 'undefined') return
    const {
      enabled, glassTransparency = 10, bubbleOpacity = 55, composerFrost = 10,
      surfaceFrost = 8, saturation = 150, border = 35, highlight = true,
      accent = '#4f8cff', glassColor = null, glassDarkSeparate = false,
      glassFidelity = 100, chatGlassFidelity = 100,
      settingsWindowTransparency = 20, settingsWindowBlur = 16,
      sidebarGlass = true, sidebarFollowGlobal = true, sidebarBlur = 16,
      sidebarAlpha = 60, sidebarColor = '#ffffff', leftSidebarGlass = true,
      leftSidebarCornerRadius = 'native', leftSidebarSquareTL = false,
      leftSidebarSquareTR = false, leftSidebarSquareBR = false, leftSidebarSquareBL = false,
      rightSidebarCornerRadius = 'native', rightSidebarSquareTL = false,
      rightSidebarSquareTR = false, rightSidebarSquareBR = false, rightSidebarSquareBL = false,
      titlebarGlass = true, isDark = true
    } = params

    const root = document.documentElement
    const body = document.body
    if (!body) return

    if (!enabled) {
      body.removeAttribute('data-agy-skins-active')
      const el = this.styleEl || document.getElementById(STYLE_ID)
      el?.remove()
      this.styleEl = null
      this.materialRule = null
      this.lastMaterialKey = null
      this.releaseTerminalObserver()
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

    const pct = (v, fb) => {
      const n = Number(v)
      return Number.isFinite(n) ? Math.min(100, Math.max(0, n)) : fb
    }
    const fidelity = Math.min(1, Math.max(0, Number(glassFidelity) / 100))
    const chatFidelity = Math.min(1, Math.max(0, Number(chatGlassFidelity) / 100))
    const keep = (100 - pct(glassTransparency, 10)) * (0.4 + 0.6 * fidelity)
    const floatingKeep = Math.max(keep, 72)
    const overlayKeep = Math.min(100, Math.max(25, 100 - pct(settingsWindowTransparency, 20)))
    const bubbleKeep = pct(bubbleOpacity, 55) * (0.5 + 0.5 * chatFidelity)

    const composerBlur = Math.min(20, Math.max(0, pct(composerFrost, 10)))
    const surfaceBlur = Math.min(20, Math.max(0, pct(surfaceFrost, 8)))
    const overlayBlur = Math.min(60, Math.max(0, pct(settingsWindowBlur, 16)))
    const saturate = Math.min(200, Math.max(100, Number.isFinite(Number(saturation)) ? Number(saturation) : 150))
    const borderAlpha = Math.min(1, Math.max(0, (Number.isFinite(Number(border)) ? Number(border) : 35) / 100))
    const highlightAlpha = highlight ? 0.16 : 0

    const frost = surfaceBlur > 0 ? `saturate(${saturate}%) blur(${surfaceBlur}px)` : 'none'
    const overlayFrost = overlayBlur > 0 ? `saturate(${saturate}%) blur(${overlayBlur}px)` : 'none'
    const composerFrostCss = composerBlur > 0 ? `saturate(${saturate}%) blur(${composerBlur}px)` : 'none'

    const seeds = this.readHostSeeds(root)
    const fallbackBg = isDark ? '#101010' : '#ffffff'
    const fallbackSidebar = isDark ? '#151515' : '#fafafa'

    const chosenGlassColor = glassColor && typeof glassColor === 'object'
      ? (isDark && glassDarkSeparate ? glassColor.dark : glassColor.light)
      : null
    const customColorValid = /^#[0-9a-f]{6}$/i.test(chosenGlassColor || '') &&
      String(chosenGlassColor).toLowerCase() !== '#ffffff'

    const chromeTint = customColorValid
      ? this.rgbaFromSeed(null, keep, chosenGlassColor)
      : this.rgbaFromSeed(seeds.bg, keep, fallbackBg)
    const cardTint = customColorValid
      ? this.rgbaFromSeed(null, keep, chosenGlassColor)
      : this.rgbaFromSeed(seeds.card || seeds.bg, keep, fallbackBg)
    const floatingTint = this.rgbaFromSeed(seeds.card || seeds.bg, floatingKeep, fallbackBg)
    const overlayTint = this.rgbaFromSeed(seeds.card || seeds.bg, overlayKeep, fallbackBg)
    const bubbleTint = this.rgbaFromSeed(seeds.card || seeds.bg, bubbleKeep, fallbackBg)

    const sidebarKeep = sidebarFollowGlobal ? keep : 100 - pct(sidebarAlpha, 60)
    const sidebarTint = !sidebarGlass || !leftSidebarGlass
      ? (seeds.sidebar ? this.rgbaFromSeed(seeds.sidebar, 100, fallbackSidebar) : fallbackSidebar)
      : sidebarFollowGlobal
        ? this.rgbaFromSeed(seeds.sidebar || seeds.bg, keep, fallbackSidebar)
        : this.rgbaFromSeed(null, sidebarKeep, /^#[0-9a-f]{6}$/i.test(sidebarColor || '') ? sidebarColor : fallbackSidebar)
    const sidebarFrost = !sidebarGlass || !leftSidebarGlass
      ? 'none'
      : sidebarFollowGlobal
        ? frost
        : sidebarBlur > 0 ? `saturate(${saturate}%) blur(${Math.min(60, sidebarBlur)}px)` : 'none'

    const titlebarTint = titlebarGlass ? chromeTint : this.rgbaFromSeed(seeds.bg, 100, fallbackBg)
    const titlebarFrost = titlebarGlass ? frost : 'none'

    const cornerOf = (mode, square) => square ? '0px' : mode === 'native' ? '0px' : `${mode}px`
    const leftNative = leftSidebarCornerRadius === 'native' && !leftSidebarSquareTL && !leftSidebarSquareTR && !leftSidebarSquareBR && !leftSidebarSquareBL
    const leftRadius = leftNative ? '0px' : `${cornerOf(leftSidebarCornerRadius, leftSidebarSquareTL)} ${cornerOf(leftSidebarCornerRadius, leftSidebarSquareTR)} ${cornerOf(leftSidebarCornerRadius, leftSidebarSquareBR)} ${cornerOf(leftSidebarCornerRadius, leftSidebarSquareBL)}`
    const rightNative = rightSidebarCornerRadius === 'native' && !rightSidebarSquareTL && !rightSidebarSquareTR && !rightSidebarSquareBR && !rightSidebarSquareBL
    const rightRadius = rightNative ? '0px' : `${cornerOf(rightSidebarCornerRadius, rightSidebarSquareTL)} ${cornerOf(rightSidebarCornerRadius, rightSidebarSquareTR)} ${cornerOf(rightSidebarCornerRadius, rightSidebarSquareBR)} ${cornerOf(rightSidebarCornerRadius, rightSidebarSquareBL)}`

    const materialKey = JSON.stringify({
      keep, floatingKeep, overlayKeep, bubbleKeep, composerBlur, surfaceBlur, overlayBlur,
      saturate, borderAlpha, highlightAlpha, accent, chosenGlassColor, glassDarkSeparate,
      sidebarGlass, sidebarFollowGlobal, sidebarBlur, sidebarAlpha, sidebarColor,
      leftSidebarGlass, leftRadius, rightRadius, titlebarGlass, isDark, seedKey: this.seedKey
    })

    if (this.lastMaterialKey === materialKey && this.styleEl.isConnected) return
    if (body.getAttribute('data-agy-skins-active') !== 'true') {
      body.setAttribute('data-agy-skins-active', 'true')
    }

    const vars = {
      '--agy-skins-keep': `${keep}%`,
      '--agy-skins-chrome-tint': chromeTint,
      '--agy-skins-card-tint': cardTint,
      '--agy-skins-sidebar-tint': sidebarTint,
      '--agy-skins-floating-tint': floatingTint,
      '--agy-skins-overlay-tint': overlayTint,
      '--agy-skins-bubble-tint': bubbleTint,
      '--agy-skins-frost': frost,
      '--agy-skins-sidebar-frost': sidebarFrost,
      '--agy-skins-titlebar-tint': titlebarTint,
      '--agy-skins-titlebar-frost': titlebarFrost,
      '--agy-skins-overlay-frost': overlayFrost,
      '--agy-skins-composer-frost': composerFrostCss,
      '--agy-skins-glass-border': String(borderAlpha),
      '--agy-skins-glass-highlight': String(highlightAlpha),
      '--agy-skins-left-radius': leftRadius,
      '--agy-skins-right-radius': rightRadius,
      '--agy-skins-accent': accent,
      '--we-accent': accent
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
body[data-agy-skins-active="true"] {
${varLines}
  --background: var(--agy-skins-chrome-tint);
  --shell: transparent;
  --content: var(--agy-skins-chrome-tint);
  --card: var(--agy-skins-card-tint);
  --sidebar: var(--agy-skins-sidebar-tint);
  --glass: var(--agy-skins-card-tint);
  background-color: transparent !important;
}

/* Shell & layout wrappers stay transparent so #agy-skins-backdrop-root shows cleanly without double veiling */
body[data-agy-skins-active="true"] .agy-shell {
  position: relative !important;
  z-index: 1 !important;
  background: transparent !important;
  background-color: transparent !important;
  backdrop-filter: none !important;
}
body[data-agy-skins-active="true"] .agy-sheet,
body[data-agy-skins-active="true"] .agy-inset-shell,
body[data-agy-skins-active="true"] [data-split-root],
body[data-agy-skins-active="true"] [data-tiling-pane]:not([data-browser-hole]),
body[data-agy-skins-active="true"] [data-pane-id]:not([data-browser-hole]) {
  background: transparent !important;
  background-color: transparent !important;
}

/* Left sidebar single structural veil + frost + corner radii */
body[data-agy-skins-active="true"] [data-testid="sidebar-split"] > :first-child {
  background-color: var(--agy-skins-sidebar-tint) !important;
  backdrop-filter: var(--agy-skins-sidebar-frost) !important;
  -webkit-backdrop-filter: var(--agy-skins-sidebar-frost) !important;
  border-radius: var(--agy-skins-left-radius) !important;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, var(--agy-skins-glass-highlight)),
              inset 0 0 0 1px rgba(255, 255, 255, var(--agy-skins-glass-border));
}
body[data-agy-skins-active="true"] .bg-sidebar,
body[data-agy-skins-active="true"] [data-testid="conversation-list-sidebar"],
body[data-agy-skins-active="true"] [data-testid="sidebar-navigation-items"] {
  background-color: transparent !important;
  background-image: none !important;
  backdrop-filter: none !important;
}
body[data-agy-skins-active="true"] .agy-sidebar-row .agy-row-actions,
body[data-agy-skins-active="true"] .agy-status-overflow {
  background: transparent !important;
  box-shadow: none !important;
}

/* Titlebar */
body[data-agy-skins-active="true"] [class*="@container/titlebar"],
body[data-agy-skins-active="true"] [data-main-content-header] {
  background-color: var(--agy-skins-titlebar-tint) !important;
  backdrop-filter: var(--agy-skins-titlebar-frost) !important;
  -webkit-backdrop-filter: var(--agy-skins-titlebar-frost) !important;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, var(--agy-skins-glass-highlight));
}

/* Main chat pane */
body[data-agy-skins-active="true"] [data-main-content-body] {
  background-color: var(--agy-skins-chrome-tint) !important;
  backdrop-filter: var(--agy-skins-frost) !important;
  -webkit-backdrop-filter: var(--agy-skins-frost) !important;
}

/* Right auxiliary / side panel (never tint embedded Chromium browser hole) */
body[data-agy-skins-active="true"] [data-side-panel-body]:not([data-has-browser-hole="true"]):not(:has([data-browser-hole]:not([data-browser-hole="false"]))) {
  background-color: var(--agy-skins-chrome-tint) !important;
  backdrop-filter: var(--agy-skins-frost) !important;
  -webkit-backdrop-filter: var(--agy-skins-frost) !important;
  border-radius: var(--agy-skins-right-radius) !important;
}
body[data-agy-skins-active="true"][data-has-browser-hole="true"] [data-has-browser-hole="true"],
body[data-agy-skins-active="true"][data-has-browser-hole="true"] [data-browser-hole]:not([data-browser-hole="false"]),
body[data-agy-skins-active="true"][data-has-browser-hole="true"] .browser-hole-opaque:not([data-has-browser-hole="true"]) {
  background: transparent !important;
  background-color: transparent !important;
  backdrop-filter: none !important;
}

/* User message bubbles */
body[data-agy-skins-active="true"] [data-testid="user-message-bubble"],
body[data-agy-skins-active="true"] .agy-user-bubble {
  background-color: var(--agy-skins-bubble-tint) !important;
  border-color: rgba(255, 255, 255, var(--agy-skins-glass-border)) !important;
}

/* Composer */
body[data-agy-skins-active="true"] .surface-composer {
  background-color: transparent !important;
}
body[data-agy-skins-active="true"] .surface-composer > .surface-composer-card {
  background-color: var(--agy-skins-card-tint) !important;
  backdrop-filter: var(--agy-skins-composer-frost) !important;
  -webkit-backdrop-filter: var(--agy-skins-composer-frost) !important;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, var(--agy-skins-glass-highlight)),
              inset 0 0 0 1px rgba(255, 255, 255, var(--agy-skins-glass-border)) !important;
}

/* Floating menus, fastpick, settings modal & dialogs */
body[data-agy-skins-active="true"] .surface-glass,
body[data-agy-skins-active="true"] .agy-fastpick,
body[data-agy-skins-active="true"] .quick-input-widget,
body[data-agy-skins-active="true"] [role="menu"],
body[data-agy-skins-active="true"] [role="listbox"] {
  background-color: var(--agy-skins-floating-tint) !important;
  backdrop-filter: var(--agy-skins-frost) !important;
  -webkit-backdrop-filter: var(--agy-skins-frost) !important;
}
body[data-agy-skins-active="true"] .settings-modal-container,
body[data-agy-skins-active="true"] [role="dialog"]:not(#agy-skins-studio-dialog) {
  background-color: var(--agy-skins-overlay-tint) !important;
  backdrop-filter: var(--agy-skins-overlay-frost) !important;
  -webkit-backdrop-filter: var(--agy-skins-overlay-frost) !important;
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
    this.update({ enabled: false })
  }
}
