/**
 * Keeps custom `--agy-range-progress` synchronized on range sliders in hosted views.
 */
export function syncRangeProgress(input) {
  if (!input || input.type !== 'range') return
  const min = Number(input.min || 0)
  const max = Number(input.max || 100)
  const val = Number(input.value || 0)
  const span = max - min
  const pct = span > 0 ? Math.min(100, Math.max(0, ((val - min) / span) * 100)) : 0
  input.style.setProperty('--agy-range-progress', `${pct.toFixed(1)}%`)
}

export class RangeController {
  constructor() {
    this.started = false
    this.onInput = e => {
      if (e.target instanceof HTMLInputElement && e.target.type === 'range') {
        syncRangeProgress(e.target)
      }
    }
  }

  start(root = typeof document !== 'undefined' ? document : null) {
    if (this.started || !root) return
    this.started = true
    this.root = root
    root.addEventListener('input', this.onInput, { passive: true })
    for (const el of root.querySelectorAll('input[type="range"]')) syncRangeProgress(el)
  }

  destroy() {
    if (!this.started || !this.root) return
    this.root.removeEventListener('input', this.onInput)
    this.started = false
  }
}
