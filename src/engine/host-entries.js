/**
 * Native Antigravity host integration entries (pure host DOM, zero embedded frames):
 *  1) English sidebar item "Wallpaper Engine" in [data-testid="settings-sidebar"]
 *     mounting #agy-skins-settings-pane directly inside Settings' scrollable pane.
 *  2) Global Alt+Shift+W Studio dialog (#agy-skins-studio-dialog) with unified glass.
 */
import { SETTINGS_SIDEBAR_LABEL } from '../shared/i18n.js'
import { mountWePicker, ensureWePickerStyles } from '../ui/we-picker-app.js'

const NAV_ID = 'agy-skins-settings-nav'
const PANE_ID = 'agy-skins-settings-pane'
const BACKDROP_ID = 'agy-skins-studio-backdrop'
const DIALOG_ID = 'agy-skins-studio-dialog'
const EXTRA_CSS_ID = 'agy-skins-host-entries-css'

const EXTRA_HOST_CSS = `
#${NAV_ID}[data-agy-nav-active="true"] {
  background: var(--we-layer-2, rgba(128, 128, 128, 0.16)) !important;
  color: var(--foreground, inherit) !important;
  font-weight: 600;
}
[data-agy-native-nav-muted="true"] {
  background: transparent !important;
  box-shadow: none !important;
}
#${PANE_ID} {
  padding: 20px 24px 32px;
  max-width: 820px;
  margin: 0 auto;
  color: inherit;
}
#${BACKDROP_ID} {
  position: fixed;
  inset: 0;
  z-index: 99990;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(0, 0, 0, calc(0.32 * var(--we-mask-strength, 0.8)));
  backdrop-filter: blur(calc(var(--we-settings-blur-px, 24px) * 0.45));
  -webkit-backdrop-filter: blur(calc(var(--we-settings-blur-px, 24px) * 0.45));
}
#${DIALOG_ID} {
  width: min(860px, 92vw);
  max-height: min(760px, 88vh);
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(var(--we-border-rgb, 140, 148, 160), var(--we-border-alpha, 0.28));
  background-color: var(--we-settings-tint, rgba(24, 26, 32, 0.88));
  background-image: linear-gradient(180deg, rgba(255, 255, 255, var(--we-sheen-top, 0.08)), rgba(255, 255, 255, 0.03) 38%, rgba(255, 255, 255, 0.05));
  backdrop-filter: var(--we-settings-frost, blur(24px) saturate(175%));
  -webkit-backdrop-filter: var(--we-settings-frost, blur(24px) saturate(175%));
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, var(--we-highlight-alpha, 0.16)),
    inset 0 0 0 1px rgba(var(--we-border-rgb, 140, 148, 160), var(--we-border-alpha, 0.28)),
    0 24px 64px rgba(0, 0, 0, 0.36);
  color: var(--foreground, #f8fafc);
}
#${DIALOG_ID} .agy-studio-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 18px;
  border-bottom: 1px solid rgba(var(--we-border-rgb, 140, 148, 160), var(--we-border-alpha, 0.22));
  font-size: 13px;
  font-weight: 600;
}
#${DIALOG_ID} .agy-studio-close {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  border: 1px solid rgba(var(--we-border-rgb, 140, 148, 160), var(--we-border-alpha, 0.28));
  background: transparent;
  color: inherit;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
}
#${DIALOG_ID} .agy-studio-close:hover {
  background: rgba(128, 128, 128, 0.16);
}
#${DIALOG_ID} .agy-studio-body {
  flex: 1;
  overflow: auto;
  padding: 18px 22px 28px;
}
`;

export function createHostEntries() {
  const authState = {
    runtimeOrigin: '',
    studioToken: '',
    systemLocale: '',
    shortcutEnabled: true
  }

  let settingsActive = false
  let settingsPicker = null
  let modalPicker = null
  let observer = null
  let keyListenerAttached = false
  let syncRaf = 0

  const getAuth = () => ({
    origin: authState.runtimeOrigin,
    studioToken: authState.studioToken,
    systemLocale: authState.systemLocale
  })

  const ensureExtraCss = () => {
    ensureWePickerStyles(document)
    if (!document.getElementById(EXTRA_CSS_ID)) {
      const s = document.createElement('style')
      s.id = EXTRA_CSS_ID
      s.textContent = EXTRA_HOST_CSS
      document.head.appendChild(s)
    }
  }

  const findSettingsScroller = sidebar => {
    const modal = sidebar?.closest('.settings-modal-container') || sidebar?.parentElement?.parentElement
    if (!modal) return null
    const candidates = [...modal.querySelectorAll('.overflow-auto')]
    return candidates.find(el => el !== sidebar && !sidebar.contains(el)) || sidebar.nextElementSibling || null
  }

  const hideNativeChildren = (scroller, hide) => {
    if (!scroller) return
    for (const child of scroller.children) {
      if (child.id === PANE_ID) continue
      if (hide) {
        if (!child.dataset.agyPrevDisplay) {
          child.dataset.agyPrevDisplay = child.style.display || '__empty__'
        }
        child.style.display = 'none'
      } else if (child.dataset.agyPrevDisplay !== undefined) {
        const prev = child.dataset.agyPrevDisplay
        child.style.display = prev === '__empty__' ? '' : prev
        delete child.dataset.agyPrevDisplay
      }
    }
  }

  const setNativeNavMuted = (sidebar, mute) => {
    if (!sidebar) return
    for (const btn of sidebar.querySelectorAll('button')) {
      if (btn.id === NAV_ID) continue
      if (mute) btn.dataset.agyNativeNavMuted = 'true'
      else delete btn.dataset.agyNativeNavMuted
    }
  }

  const deactivateSettingsPane = () => {
    settingsActive = false
    const navBtn = document.getElementById(NAV_ID)
    if (navBtn) delete navBtn.dataset.agyNavActive
    const pane = document.getElementById(PANE_ID)
    if (pane) pane.style.display = 'none'
    const sidebar = document.querySelector('[data-testid="settings-sidebar"]')
    if (sidebar) {
      setNativeNavMuted(sidebar, false)
      hideNativeChildren(findSettingsScroller(sidebar), false)
    }
  }

  const activateSettingsPane = sidebar => {
    ensureExtraCss()
    const scroller = findSettingsScroller(sidebar)
    if (!scroller) return

    settingsActive = true
    const navBtn = document.getElementById(NAV_ID)
    if (navBtn) navBtn.dataset.agyNavActive = 'true'
    setNativeNavMuted(sidebar, true)
    hideNativeChildren(scroller, true)

    let pane = document.getElementById(PANE_ID)
    if (!pane || pane.parentElement !== scroller) {
      if (settingsPicker) {
        settingsPicker.destroy()
        settingsPicker = null
      }
      pane = document.createElement('div')
      pane.id = PANE_ID
      scroller.appendChild(pane)
    }
    pane.style.display = ''
    if (!settingsPicker) {
      settingsPicker = mountWePicker(pane, { embed: 'settings', getAuth })
    }
  }

  const ensureSettingsNav = () => {
    const sidebar = document.querySelector('[data-testid="settings-sidebar"]')
    if (!sidebar) {
      if (settingsPicker) {
        settingsPicker.destroy()
        settingsPicker = null
      }
      settingsActive = false
      return
    }

    ensureExtraCss()
    let navBtn = document.getElementById(NAV_ID)
    const appearanceAnchor = sidebar.querySelector('[data-testid="settings-nav-item-Appearance"]')

    if (!navBtn) {
      navBtn = document.createElement('button')
      navBtn.type = 'button'
      navBtn.id = NAV_ID
      navBtn.setAttribute('data-testid', 'settings-nav-item-WallpaperEngine')
      navBtn.className = appearanceAnchor?.className || ''
      navBtn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="flex:0 0 auto;opacity:0.86"><rect x="3" y="4" width="18" height="14" rx="2"/><circle cx="8.5" cy="9.5" r="1.5"/><path d="M21 15l-4.5-4.5a1.5 1.5 0 0 0-2.1 0L7 18"/></svg><span></span>`
      navBtn.querySelector('span').textContent = SETTINGS_SIDEBAR_LABEL

      navBtn.addEventListener('click', e => {
        e.preventDefault()
        e.stopPropagation()
        activateSettingsPane(sidebar)
      })

      sidebar.addEventListener('click', ev => {
        const targetBtn = ev.target?.closest?.('button')
        if (targetBtn && targetBtn.id !== NAV_ID && settingsActive) {
          deactivateSettingsPane()
        }
      }, true)
    } else {
      const span = navBtn.querySelector('span')
      if (span && span.textContent !== SETTINGS_SIDEBAR_LABEL) {
        span.textContent = SETTINGS_SIDEBAR_LABEL
      }
    }

    if (!sidebar.contains(navBtn)) {
      if (appearanceAnchor) appearanceAnchor.insertAdjacentElement('afterend', navBtn)
      else sidebar.appendChild(navBtn)
    }

    if (settingsActive) {
      activateSettingsPane(sidebar)
    }
  }

  const closeStudioDialog = () => {
    const backdrop = document.getElementById(BACKDROP_ID)
    if (modalPicker) {
      modalPicker.destroy()
      modalPicker = null
    }
    if (backdrop) backdrop.remove()
  }

  const openStudioDialog = () => {
    if (document.getElementById(BACKDROP_ID)) {
      closeStudioDialog()
      return
    }
    ensureExtraCss()
    const backdrop = document.createElement('div')
    backdrop.id = BACKDROP_ID
    const dialog = document.createElement('div')
    dialog.id = DIALOG_ID

    const head = document.createElement('div')
    head.className = 'agy-studio-head'
    const title = document.createElement('span')
    title.textContent = SETTINGS_SIDEBAR_LABEL
    const closeBtn = document.createElement('button')
    closeBtn.type = 'button'
    closeBtn.className = 'agy-studio-close'
    closeBtn.textContent = '×'
    closeBtn.setAttribute('aria-label', 'Close')
    closeBtn.addEventListener('click', closeStudioDialog)
    head.appendChild(title)
    head.appendChild(closeBtn)

    const body = document.createElement('div')
    body.className = 'agy-studio-body'

    dialog.appendChild(head)
    dialog.appendChild(body)
    backdrop.appendChild(dialog)
    backdrop.addEventListener('click', e => {
      if (e.target === backdrop) closeStudioDialog()
    })
    document.body.appendChild(backdrop)

    modalPicker = mountWePicker(body, { embed: 'modal', getAuth })
  }

  const handleGlobalKeyDown = e => {
    if (e.key === 'Escape' && document.getElementById(BACKDROP_ID)) {
      closeStudioDialog()
      return
    }
    if (!authState.shortcutEnabled) return
    if (e.altKey && e.shiftKey && !e.ctrlKey && !e.metaKey && (e.key === 'W' || e.key === 'w')) {
      e.preventDefault()
      openStudioDialog()
    }
  }

  const scheduleSync = () => {
    if (syncRaf) return
    syncRaf = requestAnimationFrame(() => {
      syncRaf = 0
      ensureSettingsNav()
    })
  }

  const startObserving = () => {
    if (observer || typeof MutationObserver !== 'function') return
    observer = new MutationObserver(scheduleSync)
    observer.observe(document.body || document.documentElement, { childList: true, subtree: true })
    if (!keyListenerAttached) {
      window.addEventListener('keydown', handleGlobalKeyDown)
      keyListenerAttached = true
    }
    ensureSettingsNav()
  }

  return {
    start() {
      startObserving()
    },
    update(opts = {}) {
      if (opts.runtimeOrigin) authState.runtimeOrigin = opts.runtimeOrigin
      if (opts.studioToken) authState.studioToken = opts.studioToken
      if (opts.systemLocale) authState.systemLocale = opts.systemLocale
      if (opts.shortcutEnabled !== undefined) authState.shortcutEnabled = opts.shortcutEnabled !== false
      startObserving()
      settingsPicker?.syncExternal({ systemLocale: opts.systemLocale, cdp: opts.cdp })
      modalPicker?.syncExternal({ systemLocale: opts.systemLocale, cdp: opts.cdp })
    },
    destroy() {
      if (syncRaf) cancelAnimationFrame(syncRaf)
      observer?.disconnect()
      observer = null
      if (keyListenerAttached) {
        window.removeEventListener('keydown', handleGlobalKeyDown)
        keyListenerAttached = false
      }
      deactivateSettingsPane()
      settingsPicker?.destroy()
      settingsPicker = null
      closeStudioDialog()
    }
  }
}

export class HostEntries {
  constructor() {
    this._impl = createHostEntries()
  }
  start() {
    return this._impl.start()
  }
  update(opts) {
    return this._impl.update(opts)
  }
  destroy() {
    return this._impl.destroy()
  }
}
