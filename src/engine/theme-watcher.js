/**
 * Observes Antigravity's native Light/Dark theme and inline CSS custom property seed changes.
 */
export function detectIsDark(doc = typeof document !== 'undefined' ? document : null) {
  if (!doc || !doc.body || !doc.documentElement) return true
  if (doc.body.classList.contains('theme-light')) return false
  if (doc.body.classList.contains('dark')) return true
  try {
    const scheme = getComputedStyle(doc.documentElement).colorScheme
    if (scheme === 'light') return false
    if (scheme === 'dark') return true
  } catch {}
  return true
}

export class ThemeWatcher {
  constructor(onThemeChange) {
    this.onThemeChange = onThemeChange
    this.bodyObserver = null
    this.rootObserver = null
    this.timer = null
  }

  start() {
    if (typeof document === 'undefined' || typeof MutationObserver !== 'function' || this.bodyObserver) return
    const notify = () => {
      if (this.timer) clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        this.timer = null
        this.onThemeChange?.(detectIsDark(document))
      }, 40)
    }
    this.bodyObserver = new MutationObserver(notify)
    this.bodyObserver.observe(document.body, { attributes: true, attributeFilter: ['class', 'data-agy-theme'] })
    this.rootObserver = new MutationObserver(notify)
    this.rootObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['style', 'class'] })
  }

  destroy() {
    if (this.timer) clearTimeout(this.timer)
    this.timer = null
    this.bodyObserver?.disconnect()
    this.rootObserver?.disconnect()
    this.bodyObserver = null
    this.rootObserver = null
  }
}
