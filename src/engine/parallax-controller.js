/**
 * 3D Mouse Parallax controller for wallpaper surface, Antigravity UI panels,
 * and discovered [data-slot] extension surfaces.
 */
const PARALLAX_STYLE_ID = 'agy-skins-parallax-css'
const UI_GROUPS = [
  { key: 'parallaxUiChatDepth', selector: '[data-testid="conversation-view"]', defaultDepth: 3 },
  { key: 'parallaxUiComposerDepth', selector: '.surface-composer', defaultDepth: 6 },
  { key: 'parallaxUiSidebarDepth', selector: '[data-testid="sidebar-split"] > :first-child', defaultDepth: 2 },
  { key: 'parallaxUiBubbleDepth', selector: '[data-testid="user-message-bubble"], .agy-user-bubble', defaultDepth: 8 }
]
const clamp = (value, min, max, fb) => {
  const n = Number(value)
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fb
}

export function discoverExtensionSlots(doc = typeof document !== 'undefined' ? document : null) {
  if (!doc) return []
  const seen = new Set()
  const out = []
  for (const el of doc.querySelectorAll('[data-slot]')) {
    const slot = el.getAttribute('data-slot')?.trim()
    if (!slot || seen.has(slot)) continue
    seen.add(slot)
    out.push(slot)
  }
  return out
}

export class ParallaxController {
  constructor() {
    this.styleEl = null
    this.config = null
    this.targetX = 0
    this.targetY = 0
    this.curX = 0
    this.curY = 0
    this.raf = null
    this.active = false
    this.onPointerMove = e => this.handleMove(e)
    this.onPointerLeave = () => {
      this.targetX = 0
      this.targetY = 0
      this.scheduleTick()
    }
  }

  ensureStyle(config) {
    if (typeof document === 'undefined' || !document.head) return
    if (!this.styleEl || !this.styleEl.isConnected) {
      this.styleEl = document.getElementById(PARALLAX_STYLE_ID) || document.createElement('style')
      this.styleEl.id = PARALLAX_STYLE_ID
      this.styleEl.dataset.plugin = 'agy-skins'
      if (!this.styleEl.isConnected) document.head.appendChild(this.styleEl)
    }
    const bgPct = clamp(config.parallaxBg, 0, 10, 1)
    const bgPx = bgPct * 10
    const bgScale = (1 + bgPct * 0.025).toFixed(4)

    const blocks = [
      `
        body[data-agy-skins-parallax="true"] .agy-skins-backdrop-surface {
          transform: translate3d(
            calc(var(--agy-px, 0) * ${bgPx.toFixed(2)}px),
            calc(var(--agy-py, 0) * ${bgPx.toFixed(2)}px),
            0
          ) scale(${bgScale}) !important;
          will-change: transform;
        }
      `
    ]

    if (config.parallaxUi) {
      for (const grp of UI_GROUPS) {
        const depth = clamp(config[grp.key], 0, 20, grp.defaultDepth)
        if (depth <= 0) continue
        blocks.push(`
          body[data-agy-skins-parallax="true"] ${grp.selector} {
            transform: translate3d(
              calc(var(--agy-px, 0) * ${(-depth).toFixed(2)}px),
              calc(var(--agy-py, 0) * ${(-depth).toFixed(2)}px),
              0
            );
            will-change: transform;
          }
        `)
      }
    }

    if (config.parallaxPlugin) {
      const slots = discoverExtensionSlots()
      for (const slot of slots) {
        const rawDepth = config.parallaxPluginDepths?.[slot]
        const depth = clamp(rawDepth, 0, 20, 4)
        if (depth <= 0) continue
        const safeSlot = slot.replace(/["\\]/g, '')
        blocks.push(`
          body[data-agy-skins-parallax="true"] [data-slot="${safeSlot}"] {
            transform: translate3d(
              calc(var(--agy-px, 0) * ${(-depth).toFixed(2)}px),
              calc(var(--agy-py, 0) * ${(-depth).toFixed(2)}px),
              0
            );
          }
        `)
      }
    }

    this.styleEl.textContent = blocks.join('\n')
  }

  handleMove(e) {
    if (!this.active || typeof window === 'undefined') return
    const w = Math.max(1, window.innerWidth)
    const h = Math.max(1, window.innerHeight)
    this.targetX = ((e.clientX / w) - 0.5) * 2
    this.targetY = ((e.clientY / h) - 0.5) * 2
    this.scheduleTick()
  }

  scheduleTick() {
    if (this.raf !== null || !this.active || typeof window === 'undefined') return
    const step = () => {
      this.raf = null
      if (!this.active || !document.body) return
      const smooth = clamp(this.config?.parallaxSmooth, 1, 100, 35)
      const alpha = 0.04 + (100 - smooth) * 0.0022
      this.curX += (this.targetX - this.curX) * alpha
      this.curY += (this.targetY - this.curY) * alpha
      document.body.style.setProperty('--agy-px', this.curX.toFixed(4))
      document.body.style.setProperty('--agy-py', this.curY.toFixed(4))
      if (Math.abs(this.targetX - this.curX) > 0.002 || Math.abs(this.targetY - this.curY) > 0.002) {
        this.raf = window.requestAnimationFrame(step)
      }
    }
    this.raf = window.requestAnimationFrame(step)
  }

  update(config = {}) {
    this.config = config
    if (typeof document === 'undefined' || !document.body) return
    const enabled = config.parallaxEnabled === true && config.wallpaperEnabled === true
    if (!enabled) {
      this.active = false
      if (this.raf !== null && typeof window !== 'undefined') window.cancelAnimationFrame(this.raf)
      this.raf = null
      document.body.removeAttribute('data-agy-skins-parallax')
      document.body.style.removeProperty('--agy-px')
      document.body.style.removeProperty('--agy-py')
      this.styleEl?.remove()
      this.styleEl = null
      if (typeof window !== 'undefined') {
        window.removeEventListener('pointermove', this.onPointerMove, { capture: true })
        window.removeEventListener('pointerleave', this.onPointerLeave)
      }
      return
    }
    document.body.setAttribute('data-agy-skins-parallax', 'true')
    this.ensureStyle(config)
    if (!this.active && typeof window !== 'undefined') {
      this.active = true
      window.addEventListener('pointermove', this.onPointerMove, { passive: true, capture: true })
      window.addEventListener('pointerleave', this.onPointerLeave)
    }
  }

  destroy() {
    this.update({ parallaxEnabled: false, wallpaperEnabled: false })
  }
}
