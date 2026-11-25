/**
 * Viewport pointer FX canvas overlay (click ripple/spark/both + trail comet/dust)
 * with 3-tier adaptive frame pacing so CPU/GPU load stays bounded even over video/3D scenes.
 */
const CANVAS_ID = 'agy-skins-fx-canvas'
const IDLE_DELAY_MS = 2200
const TIER_PARAMS = {
  full: { intervalMs: 16, maxRipples: 10, maxParticles: 160, maxTrail: 28, burstCount: 14, shadowScale: 1, dustMult: 1 },
  reduced: { intervalMs: 22, maxRipples: 6, maxParticles: 96, maxTrail: 18, burstCount: 9, shadowScale: 0.7, dustMult: 0.65 },
  minimal: { intervalMs: 33, maxRipples: 4, maxParticles: 48, maxTrail: 12, burstCount: 5, shadowScale: 0.35, dustMult: 0.35 }
}
const VALID_BLEND = new Set(['screen', 'normal', 'overlay', 'multiply', 'lighten'])
const clamp = (value, min, max, fb) => {
  const n = Number(value)
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fb
}

export function hexToRgb(hex) {
  if (typeof hex !== 'string') return [79, 140, 255]
  const m = hex.trim().match(/^#?([0-9a-f]{6})$/i)
  if (!m) return [79, 140, 255]
  const n = parseInt(m[1], 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

export function hslToRgb(h, s = 0.85, l = 0.62) {
  const hue = ((h % 360) + 360) % 360
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1))
  const m = l - c / 2
  let r = 0, g = 0, b = 0
  if (hue < 60) [r, g, b] = [c, x, 0]
  else if (hue < 120) [r, g, b] = [x, c, 0]
  else if (hue < 180) [r, g, b] = [0, c, x]
  else if (hue < 240) [r, g, b] = [0, x, c]
  else if (hue < 300) [r, g, b] = [x, 0, c]
  else [r, g, b] = [c, 0, x]
  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)]
}

export class FxOverlay {
  constructor() {
    this.canvas = null
    this.ctx = null
    this.config = null
    this.ripples = []
    this.particles = []
    this.trail = []
    this.hue = 210
    this.raf = null
    this.lastRender = 0
    this.lastMove = 0
    this.tier = 'full'
    this.slowFrames = 0
    this.fastFrames = 0
    this.lastStamp = 0
    this.listenersAttached = false

    this.onPointerDown = e => this.handlePointerDown(e)
    this.onPointerMove = e => this.handlePointerMove(e)
    this.onResize = () => this.resize()
    this.onVisibility = () => {
      if (document.hidden) this.pauseLoop()
      else if (this.ripples.length || this.particles.length || this.trail.length) this.scheduleLoop()
    }
  }

  ensureCanvas() {
    if (typeof document === 'undefined' || !document.body) return
    if (!this.canvas || !this.canvas.isConnected) {
      this.canvas = document.getElementById(CANVAS_ID) || document.createElement('canvas')
      this.canvas.id = CANVAS_ID
      this.canvas.setAttribute('aria-hidden', 'true')
      this.canvas.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;z-index:2147483000;pointer-events:none;'
      document.body.appendChild(this.canvas)
      this.ctx = this.canvas.getContext('2d')
      this.resize()
    }
    const blend = VALID_BLEND.has(this.config?.fxBlend) ? this.config.fxBlend : 'screen'
    this.canvas.style.mixBlendMode = blend
    this.attachListeners()
  }

  attachListeners() {
    if (this.listenersAttached || typeof window === 'undefined') return
    this.listenersAttached = true
    window.addEventListener('pointerdown', this.onPointerDown, { passive: true, capture: true })
    window.addEventListener('pointermove', this.onPointerMove, { passive: true, capture: true })
    window.addEventListener('resize', this.onResize, { passive: true })
    document.addEventListener('visibilitychange', this.onVisibility)
  }

  detachListeners() {
    if (!this.listenersAttached || typeof window === 'undefined') return
    this.listenersAttached = false
    window.removeEventListener('pointerdown', this.onPointerDown, { capture: true })
    window.removeEventListener('pointermove', this.onPointerMove, { capture: true })
    window.removeEventListener('resize', this.onResize)
    document.removeEventListener('visibilitychange', this.onVisibility)
  }

  resize() {
    if (!this.canvas || typeof window === 'undefined') return
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    const w = Math.max(1, Math.round(window.innerWidth))
    const h = Math.max(1, Math.round(window.innerHeight))
    this.canvas.width = Math.round(w * dpr)
    this.canvas.height = Math.round(h * dpr)
    this.dpr = dpr
  }

  resolveRgb(shift = 0) {
    const mode = this.config?.fxColorMode || 'accent'
    if (mode === 'rainbow') return hslToRgb(this.hue + shift)
    if (mode === 'custom') return hexToRgb(this.config?.fxColor || '#4f8cff')
    return hexToRgb(this.config?.accent || '#4f8cff')
  }

  handlePointerDown(e) {
    if (!this.config?.fxEnabled || this.config.fxClick === false) return
    const tier = TIER_PARAMS[this.tier]
    const style = this.config.fxClickStyle || 'both'
    const size = clamp(this.config.fxClickSize, 40, 400, 140) / 140
    const rgb = this.resolveRgb(18)

    if (style === 'ripple' || style === 'both') {
      if (this.ripples.length >= tier.maxRipples) this.ripples.shift()
      this.ripples.push({
        x: e.clientX,
        y: e.clientY,
        r: 4 * size,
        maxR: 64 * size,
        life: 1,
        rgb
      })
    }
    if (style === 'spark' || style === 'both') {
      const count = tier.burstCount
      for (let i = 0; i < count; i++) {
        if (this.particles.length >= tier.maxParticles) this.particles.shift()
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4
        const speed = (1.6 + Math.random() * 2.8) * size
        this.particles.push({
          x: e.clientX,
          y: e.clientY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: (1.5 + Math.random() * 2.2) * size,
          life: 1,
          decay: 0.032 + Math.random() * 0.025,
          rgb: this.config.fxColorMode === 'rainbow' ? hslToRgb(this.hue + i * 16) : rgb
        })
      }
    }
    this.scheduleLoop()
  }

  handlePointerMove(e) {
    if (!this.config?.fxEnabled || this.config.fxTrail === false) return
    const now = performance.now()
    if (now - this.lastMove < 10) return
    this.lastMove = now
    this.hue = (this.hue + 4) % 360

    const tier = TIER_PARAMS[this.tier]
    const style = this.config.fxTrailStyle || 'comet'
    const rgb = this.resolveRgb()

    const widthScale = Math.max(0.4, clamp(this.config.fxTrailWidth, 1, 12, 3) / 3)
    const trailMs = clamp(this.config.fxTrailLength, 80, 2000, 420)
    const decayRate = Math.max(0.015, Math.min(0.22, 16 / trailMs))

    if (style === 'dust') {
      const n = Math.max(1, Math.round(2 * tier.dustMult))
      for (let i = 0; i < n; i++) {
        if (this.particles.length >= tier.maxParticles) this.particles.shift()
        this.particles.push({
          x: e.clientX + (Math.random() - 0.5) * 8,
          y: e.clientY + (Math.random() - 0.5) * 8,
          vx: (Math.random() - 0.5) * 0.9,
          vy: -0.35 - Math.random() * 0.7,
          radius: (1.4 + Math.random() * 1.8) * widthScale,
          life: 1,
          decay: decayRate + Math.random() * 0.015,
          rgb
        })
      }
    } else {
      const cap = Math.max(6, Math.min(tier.maxTrail, Math.round((trailMs / 420) * 18)))
      while (this.trail.length >= cap) this.trail.shift()
      this.trail.push({ x: e.clientX, y: e.clientY, life: 1, decay: decayRate, rgb })
    }
    this.scheduleLoop()
  }

  adaptTier(dt) {
    if (dt > 24) {
      this.slowFrames += 1
      this.fastFrames = 0
      if (this.slowFrames >= 8) {
        this.tier = this.tier === 'full' ? 'reduced' : 'minimal'
        this.slowFrames = 0
      }
    } else if (dt < 17) {
      this.fastFrames += 1
      this.slowFrames = 0
      if (this.fastFrames >= 90 && this.tier !== 'full') {
        this.tier = this.tier === 'minimal' ? 'reduced' : 'full'
        this.fastFrames = 0
      }
    }
  }

  scheduleLoop() {
    if (this.raf !== null || typeof window === 'undefined' || document.hidden) return
    const step = ts => {
      this.raf = null
      if (!this.config?.fxEnabled) return
      const tier = TIER_PARAMS[this.tier]
      if (this.lastStamp) this.adaptTier(ts - this.lastStamp)
      this.lastStamp = ts
      if (ts - this.lastRender >= tier.intervalMs) {
        this.lastRender = ts
        this.renderFrame()
      }
      if (this.ripples.length || this.particles.length || this.trail.length || ts - this.lastMove < IDLE_DELAY_MS) {
        this.raf = window.requestAnimationFrame(step)
      }
    }
    this.raf = window.requestAnimationFrame(step)
  }

  pauseLoop() {
    if (this.raf !== null && typeof window !== 'undefined') {
      window.cancelAnimationFrame(this.raf)
    }
    this.raf = null
  }

  renderFrame() {
    if (!this.ctx || !this.canvas) return
    const ctx = this.ctx
    const dpr = this.dpr || 1
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, this.canvas.width / dpr, this.canvas.height / dpr)

    const tier = TIER_PARAMS[this.tier]
    const opacity = clamp(this.config.fxOpacity, 10, 100, 85) / 100
    const clickGlow = (clamp(this.config.fxClickGlow, 0, 100, 60) / 100) * 18 * tier.shadowScale
    const trailGlow = (clamp(this.config.fxTrailGlow, 0, 100, 60) / 100) * 18 * tier.shadowScale
    const widthBase = clamp(this.config.fxTrailWidth, 1, 12, 3)

    // Trail polyline (comet)
    if (this.trail.length > 1) {
      for (let i = 1; i < this.trail.length; i++) {
        const prev = this.trail[i - 1]
        const cur = this.trail[i]
        const t = i / this.trail.length
        const alpha = cur.life * t * opacity * 0.78
        if (alpha <= 0.01) continue
        ctx.beginPath()
        ctx.moveTo(prev.x, prev.y)
        ctx.lineTo(cur.x, cur.y)
        ctx.strokeStyle = `rgba(${cur.rgb[0]},${cur.rgb[1]},${cur.rgb[2]},${alpha.toFixed(3)})`
        ctx.lineWidth = Math.max(0.8, widthBase * t * 1.8)
        ctx.lineCap = 'round'
        ctx.shadowColor = `rgb(${cur.rgb[0]},${cur.rgb[1]},${cur.rgb[2]})`
        ctx.shadowBlur = trailGlow
        ctx.stroke()
      }
      for (let i = this.trail.length - 1; i >= 0; i--) {
        this.trail[i].life -= (this.trail[i].decay || 0.045)
        if (this.trail[i].life <= 0) this.trail.splice(i, 1)
      }
    } else if (this.trail.length === 1) {
      this.trail[0].life -= 0.08
      if (this.trail[0].life <= 0) this.trail.length = 0
    }

    // Ripples
    for (let i = this.ripples.length - 1; i >= 0; i--) {
      const rp = this.ripples[i]
      rp.r += (rp.maxR - rp.r) * 0.14
      rp.life -= 0.04
      if (rp.life <= 0) {
        this.ripples.splice(i, 1)
        continue
      }
      ctx.beginPath()
      ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(${rp.rgb[0]},${rp.rgb[1]},${rp.rgb[2]},${(rp.life * opacity).toFixed(3)})`
      ctx.lineWidth = 2.2
      ctx.shadowColor = `rgb(${rp.rgb[0]},${rp.rgb[1]},${rp.rgb[2]})`
      ctx.shadowBlur = clickGlow
      ctx.stroke()
    }

    // Sparks / Dust particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i]
      p.x += p.vx
      p.y += p.vy
      p.vx *= 0.96
      p.vy *= 0.96
      p.life -= p.decay
      if (p.life <= 0) {
        this.particles.splice(i, 1)
        continue
      }
      ctx.beginPath()
      ctx.arc(p.x, p.y, Math.max(0.6, p.radius * p.life), 0, Math.PI * 2)
      ctx.fillStyle = `rgba(${p.rgb[0]},${p.rgb[1]},${p.rgb[2]},${(p.life * opacity).toFixed(3)})`
      ctx.shadowColor = `rgb(${p.rgb[0]},${p.rgb[1]},${p.rgb[2]})`
      ctx.shadowBlur = trailGlow
      ctx.fill()
    }
    ctx.shadowBlur = 0
  }

  update(config = {}) {
    this.config = config
    if (!config.fxEnabled) {
      this.pauseLoop()
      this.detachListeners()
      this.ripples = []
      this.particles = []
      this.trail = []
      this.canvas?.remove()
      this.canvas = null
      this.ctx = null
      return
    }
    this.ensureCanvas()
  }

  destroy() {
    this.update({ fxEnabled: false })
  }
}
