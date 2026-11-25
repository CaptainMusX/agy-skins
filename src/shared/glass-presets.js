/**
 * Readability floor luminance clamping & factory/user preset management,
 * modeled on elysia395/dsh-wallpaper-engine.
 */

export const READABILITY_FLOOR = 0.48
export const READABILITY_FLOOR_DARK = 0.59

export const GLASS_COLOR_PRESETS = [
  '#ffffff',
  '#0d1524',
  '#1e293b',
  '#e0f2fe',
  '#dbeafe',
  '#ede9fe',
  '#fce7f3',
  '#dcfce7',
  '#fef3c7'
]

export const ACCENT_PRESETS = [
  '#4f8cff',
  '#0a84ff',
  '#6366f1',
  '#8b5cf6',
  '#ec4899',
  '#ef4444',
  '#f59e0b',
  '#10b981',
  '#06b6d4'
]

export const CARET_COLOR_PRESETS = [
  '#4f8cff',
  '#ffffff',
  '#0a0a0c',
  '#22c55e',
  '#f59e0b',
  '#ec4899',
  '#38bdf8'
]

const HEX_RE = /^#([0-9a-f]{6})$/i

export function parseHexRgb(hex) {
  const m = typeof hex === 'string' ? hex.trim().match(HEX_RE) : null
  if (!m) return null
  const n = parseInt(m[1], 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

export function rgbToHex([r, g, b]) {
  const ch = v => Math.min(255, Math.max(0, Math.round(v))).toString(16).padStart(2, '0')
  return `#${ch(r)}${ch(g)}${ch(b)}`
}

export function relativeLuminance(rgb) {
  const [r, g, b] = rgb.map(v => {
    const s = Math.min(255, Math.max(0, v)) / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function contrastRatio(rgbA, rgbB) {
  const lA = relativeLuminance(rgbA)
  const lB = relativeLuminance(rgbB)
  const hi = Math.max(lA, lB)
  const lo = Math.min(lA, lB)
  return (hi + 0.05) / (lo + 0.05)
}

/**
 * Clamp a surface tint hex color so text preserves >= 4.5:1 contrast over worst-case
 * wallpaper pixels at READABILITY_FLOOR (light 0.45) / READABILITY_FLOOR_DARK (dark 0.59).
 * fidelityPct (0..100) blends linearly between the raw color (0) and clamped color (100).
 */
export function weClampSurfaceColor(hex, isDark, fidelityPct = 100) {
  const dark = isDark === true || isDark === 'dark'
  const fallbackRgb = dark ? [13, 21, 36] : [255, 255, 255]
  const rawHex = typeof hex === 'string' && HEX_RE.test(hex.trim()) ? hex.trim().toLowerCase() : rgbToHex(fallbackRgb)
  const rawRgb = parseHexRgb(rawHex) || fallbackRgb
  const fid = Math.min(100, Math.max(0, Number.isFinite(Number(fidelityPct)) ? Number(fidelityPct) : 100)) / 100

  let clampedRgb = [...rawRgb]
  if (dark) {
    // If neutral white is carried into dark mode with dark-separate off, anchor on deep navy glass
    const baseTarget = rawHex === '#ffffff' ? [13, 21, 36] : rawRgb
    // Keep worst-case composite over #ffffff readable for light ink (#f8fafc)
    // Target L_base <= 0.025 (sRGB components scaled smoothly down)
    clampedRgb = [...baseTarget]
    for (let i = 0; i < 24; i++) {
      if (relativeLuminance(clampedRgb) <= 0.024) break
      clampedRgb = clampedRgb.map(v => v * 0.84)
    }
  } else {
    // Keep worst-case composite over #000000 readable for dark ink (#0a0a0c) at READABILITY_FLOOR
    for (let i = 0; i < 24; i++) {
      const compositeOnBlack = clampedRgb.map(v => v * READABILITY_FLOOR)
      if (contrastRatio(compositeOnBlack, [10, 10, 12]) >= 4.5) break
      clampedRgb = clampedRgb.map(v => v + (255 - v) * 0.25)
    }
  }

  const finalRgb = fid <= 0
    ? rawRgb
    : fid >= 1
      ? clampedRgb
      : [0, 1, 2].map(i => Math.round(rawRgb[i] + (clampedRgb[i] - rawRgb[i]) * fid))

  return {
    hex: rgbToHex(finalRgb),
    rgb: `${Math.round(finalRgb[0])}, ${Math.round(finalRgb[1])}, ${Math.round(finalRgb[2])}`
  }
}

/**
 * Pick high-contrast ink (#0a0a0c or #ffffff) for accent-filled primary buttons.
 */
export function weAccentInk(hex) {
  const rgb = parseHexRgb(hex) || [79, 140, 255]
  return contrastRatio(rgb, [10, 10, 12]) >= contrastRatio(rgb, [255, 255, 255])
    ? '#0a0a0c'
    : '#ffffff'
}

export const GLASS_PRESET_KEYS = [
  'glassEnabled',
  'panelGlass',
  'bubbleOpacity',
  'composerFrost',
  'surfaceFrost',
  'glassSaturation',
  'glassBorder',
  'glassHighlight',
  'glassColor',
  'glassDarkSeparate',
  'glassFidelity',
  'chatGlassFidelity',
  'settingsWindowTransparency',
  'settingsWindowBlur',
  'settingsMaskStrength',
  'sidebarGlass',
  'sidebarFollowGlobal',
  'sidebarBlur',
  'sidebarAlpha',
  'sidebarColor',
  'leftSidebarGlass',
  'leftSidebarCornerRadius',
  'leftSidebarSquareTL',
  'leftSidebarSquareTR',
  'leftSidebarSquareBR',
  'leftSidebarSquareBL',
  'rightSidebarCornerRadius',
  'rightSidebarSquareTL',
  'rightSidebarSquareTR',
  'rightSidebarSquareBR',
  'rightSidebarSquareBL',
  'sidebarFullClear',
  'titlebarGlass',
  'thinkingMode',
  'floaterSolidBase',
  'maskOcclusion',
  'accent',
  'uiColorCustom',
  'glassMode',
  'leftSidebarTransparency',
  'leftSidebarBlur',
  'titlebarTransparency',
  'titlebarBlur',
  'sidebarContentAlpha',
  'sidebarContentColor',
  'conversationColor',
  'settingsWindowColor'
]

export const FACTORY_GLASS_PRESETS = [
  {
    id: 'factory-default',
    origin: 'builtin',
    nameZh: '默认晶透',
    nameEn: 'Crystal Default',
    values: {
      glassEnabled: true,
      panelGlass: 72,
      bubbleOpacity: 62,
      composerFrost: 22,
      surfaceFrost: 18,
      glassSaturation: 175,
      glassBorder: 32,
      glassHighlight: true,
      glassColor: { light: '#ffffff', dark: '#0d1524' },
      glassDarkSeparate: true,
      glassFidelity: 100,
      chatGlassFidelity: 100,
      settingsWindowTransparency: 24,
      settingsWindowBlur: 24,
      settingsMaskStrength: 80,
      sidebarGlass: true,
      sidebarFollowGlobal: true,
      leftSidebarGlass: true,
      sidebarFullClear: false,
      titlebarGlass: false,
      thinkingMode: 'glass',
      floaterSolidBase: true,
      maskOcclusion: 12
    }
  },
  {
    id: 'factory-frosted',
    origin: 'builtin',
    nameZh: '重磨砂',
    nameEn: 'Heavy Frosted',
    values: {
      glassEnabled: true,
      panelGlass: 56,
      bubbleOpacity: 72,
      composerFrost: 40,
      surfaceFrost: 36,
      glassSaturation: 185,
      glassBorder: 40,
      glassHighlight: true,
      glassColor: { light: '#ffffff', dark: '#101827' },
      glassDarkSeparate: true,
      glassFidelity: 100,
      chatGlassFidelity: 100,
      settingsWindowTransparency: 18,
      settingsWindowBlur: 36,
      settingsMaskStrength: 85,
      sidebarGlass: true,
      sidebarFollowGlobal: true,
      leftSidebarGlass: true,
      sidebarFullClear: false,
      titlebarGlass: true,
      thinkingMode: 'glass',
      floaterSolidBase: true,
      maskOcclusion: 16
    }
  },
  {
    id: 'factory-readable',
    origin: 'builtin',
    nameZh: '可读优先',
    nameEn: 'High Readability',
    values: {
      glassEnabled: true,
      panelGlass: 38,
      bubbleOpacity: 82,
      composerFrost: 30,
      surfaceFrost: 28,
      glassSaturation: 160,
      glassBorder: 38,
      glassHighlight: true,
      glassColor: { light: '#ffffff', dark: '#0d1524' },
      glassDarkSeparate: true,
      glassFidelity: 100,
      chatGlassFidelity: 100,
      settingsWindowTransparency: 12,
      settingsWindowBlur: 28,
      settingsMaskStrength: 90,
      sidebarGlass: true,
      sidebarFollowGlobal: true,
      leftSidebarGlass: true,
      sidebarFullClear: false,
      titlebarGlass: true,
      thinkingMode: 'native',
      floaterSolidBase: true,
      maskOcclusion: 22
    }
  },
  {
    id: 'factory-airy',
    origin: 'builtin',
    nameZh: '极简通透',
    nameEn: 'Ultra Airy',
    values: {
      glassEnabled: true,
      panelGlass: 84,
      bubbleOpacity: 45,
      composerFrost: 18,
      surfaceFrost: 14,
      glassSaturation: 170,
      glassBorder: 22,
      glassHighlight: true,
      glassColor: { light: '#ffffff', dark: '#0d1524' },
      glassDarkSeparate: true,
      glassFidelity: 72,
      chatGlassFidelity: 78,
      settingsWindowTransparency: 32,
      settingsWindowBlur: 20,
      settingsMaskStrength: 65,
      sidebarGlass: true,
      sidebarFollowGlobal: true,
      leftSidebarGlass: false,
      sidebarFullClear: true,
      titlebarGlass: false,
      thinkingMode: 'off',
      floaterSolidBase: true,
      maskOcclusion: 8
    }
  },
  {
    id: 'factory-ocean',
    origin: 'builtin',
    nameZh: '深海冰蓝',
    nameEn: 'Ocean Ice',
    values: {
      glassEnabled: true,
      panelGlass: 68,
      bubbleOpacity: 64,
      composerFrost: 26,
      surfaceFrost: 22,
      glassSaturation: 180,
      glassBorder: 36,
      glassHighlight: true,
      glassColor: { light: '#eef5ff', dark: '#0c192c' },
      glassDarkSeparate: true,
      glassFidelity: 95,
      chatGlassFidelity: 95,
      settingsWindowTransparency: 22,
      settingsWindowBlur: 26,
      settingsMaskStrength: 80,
      sidebarGlass: true,
      sidebarFollowGlobal: true,
      leftSidebarGlass: true,
      sidebarFullClear: false,
      titlebarGlass: false,
      thinkingMode: 'glass',
      floaterSolidBase: true,
      accent: '#4f8cff',
      maskOcclusion: 12
    }
  }
]

export function extractGlassPresetValues(config = {}) {
  const out = {}
  for (const key of GLASS_PRESET_KEYS) {
    if (config[key] !== undefined) {
      out[key] = structuredClone(config[key])
    }
  }
  return out
}

const PRESET_ID_RE = /^[A-Za-z0-9_-]{1,64}$/

export function sanitizeUserPresets(list) {
  if (!Array.isArray(list)) return []
  const out = []
  for (const raw of list) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) continue
    const id = typeof raw.id === 'string' && PRESET_ID_RE.test(raw.id) ? raw.id : ''
    if (!id || id.startsWith('factory-') || out.some(p => p.id === id)) continue
    const name = typeof raw.name === 'string' && raw.name.trim() ? raw.name.trim().slice(0, 60) : '自定义预设'
    const vals = raw.values && typeof raw.values === 'object' && !Array.isArray(raw.values) ? raw.values : {}
    out.push({
      id,
      name,
      origin: 'user',
      values: extractGlassPresetValues(vals)
    })
    if (out.length >= 8) break
  }
  return out
}
