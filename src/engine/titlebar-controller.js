/**
 * Syncs Antigravity's Windows/Linux native Electron titlebar window controls overlay
 * (`window.electronNative.setTitleBarOverlay`) so captions match glass/theme changes.
 */
export class TitlebarController {
  constructor() {
    this.lastKey = null
  }

  update({ enabled, isDark = true } = {}) {
    if (typeof window === 'undefined' || !window.electronNative?.setTitleBarOverlay) return
    const key = `${Boolean(enabled)}:${Boolean(isDark)}`
    if (key === this.lastKey) return
    this.lastKey = key
    try {
      const symbolColor = isDark ? '#f1f5f9' : '#0f172a'
      const color = enabled ? '#00000000' : undefined
      window.electronNative.setTitleBarOverlay(
        enabled
          ? { color: '#00000000', symbolColor }
          : { symbolColor }
      )
      void color
    } catch {}
  }

  destroy() {
    this.update({ enabled: false, isDark: true })
  }
}
