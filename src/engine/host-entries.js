/**
 * Native Antigravity integration points:
 * 1. Injects a clean "Wallpaper Engine" entry card inside Antigravity Settings → Appearance
 * 2. Registers `Alt+Shift+W` keyboard shortcut to toggle the wide Studio modal (`<iframe>` to /studio/<token>/)
 */
const ENTRY_ID = 'agy-skins-appearance-entry'
const MODAL_ID = 'agy-skins-studio-dialog'

export class HostEntries {
  constructor() {
    this.studioUrl = ''
    this.shortcutEnabled = true
    this.lang = 'en'
    this.observer = null
    this.onKeyDown = e => {
      if (!this.shortcutEnabled) return
      if (e.altKey && e.shiftKey && !e.ctrlKey && !e.metaKey && String(e.key || '').toLowerCase() === 'w') {
        e.preventDefault()
        e.stopPropagation()
        this.toggleModal()
      } else if (e.key === 'Escape' && document.getElementById(MODAL_ID)) {
        e.preventDefault()
        this.closeModal()
      }
    }
  }

  start() {
    if (typeof document === 'undefined' || !document.body) return
    if (!this.observer && typeof MutationObserver === 'function') {
      this.observer = new MutationObserver(() => this.syncSettingsEntry())
      this.observer.observe(document.body, { childList: true, subtree: true })
    }
    window.addEventListener('keydown', this.onKeyDown, { capture: true })
    this.syncSettingsEntry()
  }

  update({ studioUrl, shortcutEnabled = true, lang = 'en' } = {}) {
    if (studioUrl) this.studioUrl = studioUrl
    this.shortcutEnabled = shortcutEnabled !== false
    this.lang = lang || 'en'
    this.syncSettingsEntry()
    const frame = document.querySelector(`#${MODAL_ID} iframe`)
    if (frame && this.studioUrl && frame.src !== this.studioUrl) {
      frame.src = this.studioUrl
    }
  }

  syncSettingsEntry() {
    if (typeof document === 'undefined') return
    const container = document.querySelector('.settings-modal-container')
    if (!container) return
    if (container.querySelector(`#${ENTRY_ID}`)) return

    const headings = [...container.querySelectorAll('h2, h3')]
    const targetHeading = headings.find(h => {
      const t = (h.textContent || '').trim().toLowerCase()
      return t === 'appearance' || t === '外观'
    })
    if (!targetHeading) return
    const section = targetHeading.closest('section') || targetHeading.parentElement
    if (!section) return

    const isZh = String(this.lang).toLowerCase().startsWith('zh')
    const card = document.createElement('div')
    card.id = ENTRY_ID
    card.style.cssText = [
      'margin: 12px 0;',
      'padding: 12px 14px;',
      'border-radius: 10px;',
      'border: 1px solid var(--border, rgba(255,255,255,0.14));',
      'background: var(--card, rgba(255,255,255,0.04));',
      'display: flex;',
      'align-items: center;',
      'justify-content: space-between;',
      'gap: 12px;'
    ].join('')

    const info = document.createElement('div')
    info.innerHTML = `
      <div style="font-weight:600;font-size:13px;color:var(--foreground,inherit);">
        ${isZh ? 'Wallpaper Engine 皮肤工作台' : 'Wallpaper Engine Studio'}
      </div>
      <div style="font-size:12px;opacity:0.75;margin-top:2px;">
        ${isZh ? '管理动态壁纸、液态玻璃、字体系统与特效 (Alt+Shift+W)' : 'Live wallpapers, liquid glass, typography & FX (Alt+Shift+W)'}
      </div>
    `

    const btn = document.createElement('button')
    btn.type = 'button'
    btn.textContent = isZh ? '打开工作台' : 'Open Studio'
    btn.style.cssText = [
      'padding: 6px 14px;',
      'border-radius: 8px;',
      'border: 1px solid rgba(255,255,255,0.18);',
      'background: var(--primary, #4f8cff);',
      'color: #ffffff;',
      'font-size: 12px;',
      'font-weight: 600;',
      'cursor: pointer;',
      'white-space: nowrap;'
    ].join('')
    btn.addEventListener('click', () => this.openModal())

    card.append(info, btn)
    section.appendChild(card)
  }

  toggleModal() {
    if (document.getElementById(MODAL_ID)) this.closeModal()
    else this.openModal()
  }

  openModal() {
    if (typeof document === 'undefined' || !document.body || !this.studioUrl) return
    if (document.getElementById(MODAL_ID)) return

    const overlay = document.createElement('div')
    overlay.id = MODAL_ID
    overlay.setAttribute('role', 'dialog')
    overlay.setAttribute('aria-modal', 'true')
    overlay.style.cssText = [
      'position:fixed;inset:0;z-index:2147483500;',
      'background:rgba(6, 10, 18, 0.56);',
      'backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);',
      'display:flex;align-items:center;justify-content:center;padding:24px;'
    ].join('')

    const frameWrap = document.createElement('div')
    frameWrap.style.cssText = [
      'width:min(1040px, 94vw);height:min(760px, 90vh);',
      'border-radius:16px;overflow:hidden;',
      'border:1px solid rgba(255,255,255,0.18);',
      'box-shadow:0 28px 80px rgba(0,0,0,0.48);',
      'background:var(--background, #0f141e);',
      'display:flex;flex-direction:column;position:relative;'
    ].join('')

    const closeBtn = document.createElement('button')
    closeBtn.type = 'button'
    closeBtn.textContent = '×'
    closeBtn.title = 'Close (Esc)'
    closeBtn.style.cssText = [
      'position:absolute;top:10px;right:12px;z-index:2;',
      'width:28px;height:28px;border-radius:8px;',
      'border:1px solid rgba(255,255,255,0.16);',
      'background:rgba(15,20,30,0.65);color:#f8fafc;',
      'font-size:18px;line-height:1;cursor:pointer;'
    ].join('')
    closeBtn.addEventListener('click', () => this.closeModal())

    const iframe = document.createElement('iframe')
    iframe.src = this.studioUrl
    iframe.style.cssText = 'width:100%;height:100%;border:0;display:block;background:transparent;'

    overlay.addEventListener('click', e => {
      if (e.target === overlay) this.closeModal()
    })

    frameWrap.append(closeBtn, iframe)
    overlay.appendChild(frameWrap)
    document.body.appendChild(overlay)
  }

  closeModal() {
    document.getElementById(MODAL_ID)?.remove()
  }

  destroy() {
    this.observer?.disconnect()
    this.observer = null
    if (typeof window !== 'undefined') window.removeEventListener('keydown', this.onKeyDown, { capture: true })
    document.getElementById(ENTRY_ID)?.remove()
    this.closeModal()
  }
}
