/**
 * Wallpaper-adaptive accent extractor: downsamples preview / image onto a 48x27
 * offscreen canvas, picks a vibrant saturated dominant color, adjusts luminance to
 * maintain >= 4.5:1 text legibility, and injects --we-accent / --primary / --cta.
 */
const FOLLOW_STYLE_ID = 'agy-skins-theme-follow-css'

function rgbToHex(r, g, b) {
  return `#${[r, g, b].map(v => Math.min(255, Math.max(0, Math.round(v))).toString(16).padStart(2, '0')).join('')}`
}

function relativeLuminance(r, g, b) {
  const linear = [r, g, b].map(v => {
    const s = v / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2]
}

export function ensureLegibleAccent([r, g, b], isDark) {
  let cr = r, cg = g, cb = b
  for (let i = 0; i < 8; i++) {
    const lum = relativeLuminance(cr, cg, cb)
    if (isDark && lum >= 0.24) break
    if (!isDark && lum <= 0.34) break
    if (isDark) {
      cr = cr + (255 - cr) * 0.2
      cg = cg + (255 - cg) * 0.2
      cb = cb + (255 - cb) * 0.2
    } else {
      cr *= 0.82
      cg *= 0.82
      cb *= 0.82
    }
  }
  return rgbToHex(cr, cg, cb)
}

export function extractDominantColorFromPixels(data, isDark = true) {
  let bestScore = -1
  let bestRgb = null
  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3]
    if (a < 180) continue
    const r = data[i], g = data[i + 1], b = data[i + 2]
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const sat = max === 0 ? 0 : (max - min) / max
    const luma = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    if (luma < 0.08 || luma > 0.94) continue
    const score = sat * 1.8 + (1 - Math.abs(luma - 0.52)) * 0.4
    if (score > bestScore) {
      bestScore = score
      bestRgb = [r, g, b]
    }
  }
  return bestRgb ? ensureLegibleAccent(bestRgb, isDark) : null
}

export class ThemeFollowController {
  constructor() {
    this.styleEl = null
    this.lastSrc = null
    this.lastIsDark = null
    this.requestId = 0
  }

  applyAccentCss(accent) {
    if (typeof document === 'undefined' || !document.body) return
    if (!accent) {
      document.body.removeAttribute('data-agy-skins-theme-follow')
      this.styleEl?.remove()
      this.styleEl = null
      return
    }
    if (!this.styleEl || !this.styleEl.isConnected) {
      this.styleEl = document.getElementById(FOLLOW_STYLE_ID) || document.createElement('style')
      this.styleEl.id = FOLLOW_STYLE_ID
      this.styleEl.dataset.plugin = 'agy-skins'
      if (!this.styleEl.isConnected) document.head.appendChild(this.styleEl)
    }
    document.body.setAttribute('data-agy-skins-theme-follow', 'true')
    this.styleEl.textContent = `
      body[data-agy-skins-theme-follow="true"] {
        --we-accent: ${accent};
        --primary: ${accent};
        --cta: ${accent};
        --nux-focus-ring: color-mix(in srgb, ${accent} 55%, transparent);
      }
    `
  }

  async sampleUrl(url, isDark) {
    const id = ++this.requestId
    if (typeof Image === 'undefined' || typeof document === 'undefined') return
    try {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
        img.src = url
      })
      if (id !== this.requestId) return
      const canvas = document.createElement('canvas')
      canvas.width = 48
      canvas.height = 27
      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      ctx.drawImage(img, 0, 0, 48, 27)
      const data = ctx.getImageData(0, 0, 48, 27).data
      const hex = extractDominantColorFromPixels(data, isDark)
      if (id === this.requestId) this.applyAccentCss(hex)
    } catch {
      if (id === this.requestId) this.applyAccentCss(null)
    }
  }

  update({ enabled, previewUrl, isDark = true } = {}) {
    if (!enabled || !previewUrl) {
      this.lastSrc = null
      this.applyAccentCss(null)
      return
    }
    if (this.lastSrc === previewUrl && this.lastIsDark === isDark && this.styleEl?.isConnected) return
    this.lastSrc = previewUrl
    this.lastIsDark = isDark
    void this.sampleUrl(previewUrl, isDark)
  }

  destroy() {
    this.requestId++
    this.applyAccentCss(null)
  }
}
