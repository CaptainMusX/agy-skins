/**
 * Native Antigravity host integration entries (pure host DOM, zero embedded frames):
 *  1) Exact-styled English sidebar item "Wallpaper" (no icon) in
 *     [data-testid="settings-sidebar"], mounting #agy-skins-settings-pane
 *     directly inside Settings' scrollable pane.
 *  2) Global Alt+Shift+W Studio dialog (#agy-skins-studio-dialog) with unified glass.
 */
import { SETTINGS_SIDEBAR_LABEL } from '../shared/i18n.js'
import { mountWePicker, ensureWePickerStyles } from '../ui/we-picker-app.js'

const NAV_ID = 'agy-skins-settings-nav'
const PANE_ID = 'agy-skins-settings-pane'
const BACKDROP_ID = 'agy-skins-studio-backdrop'
const DIALOG_ID = 'agy-skins-studio-dialog'
const EXTRA_CSS_ID = 'agy-skins-host-entries-css'

const NAV_BASE_CLASS = 'flex items-center gap-1.5 w-full px-2 py-1 rounded-lg cursor-pointer border-none text-left transition-all outline-none'
const NAV_INACTIVE_CLASS = `${NAV_BASE_CLASS} hover:bg-sidebar-muted`
const NAV_ACTIVE_CLASS = `${NAV_BASE_CLASS} bg-sidebar-secondary`
const SPAN_INACTIVE_CLASS = 'transition-colors select-none truncate flex-1 text-secondary-foreground group-hover/nav-item:text-foreground'
const SPAN_ACTIVE_CLASS = 'transition-colors select-none truncate flex-1 text-foreground'

const EXTRA_HOST_CSS = `
[data-agy-native-nav-muted="true"] {
  background: transparent !important;
  background-color: transparent !important;
  box-shadow: none !important;
}
[data-agy-native-nav-muted="true"] > span {
  color: var(--secondary-foreground) !important;
}
#${PANE_ID} {
  padding: 20px 28px 36px;
  max-width: 860px;
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
  background: var(--we-modal-backdrop, rgba(15, 23, 42, 0.14));
  backdrop-filter: blur(calc(var(--we-settings-blur-px, 24px) * 0.45));
  -webkit-backdrop-filter: blur(calc(var(--we-settings-blur-px, 24px) * 0.45));
}
#${DIALOG_ID} {
  width: min(880px, 92vw);
  max-height: min(780px, 88vh);
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(var(--we-border-rgb, 140, 148, 160), var(--we-border-alpha, 0.28));
  background-color: var(--we-settings-tint, rgba(255, 255, 255, 0.78));
  background-image: linear-gradient(180deg, rgba(255, 255, 255, var(--we-sheen-top, 0.08)), rgba(255, 255, 255, 0.025) 38%, rgba(255, 255, 255, 0.04));
  backdrop-filter: var(--we-settings-frost, blur(24px) saturate(175%));
  -webkit-backdrop-filter: var(--we-settings-frost, blur(24px) saturate(175%));
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, var(--we-highlight-alpha, 0.16)),
    inset 0 0 0 1px rgba(var(--we-border-rgb, 140, 148, 160), var(--we-border-alpha, 0.28)),
    0 24px 64px rgba(0, 0, 0, 0.30);
  color: var(--foreground, #0f172a);
}
#${DIALOG_ID} .agy-studio-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 18px;
  border-bottom: 1px solid rgba(var(--we-border-rgb, 140, 148, 160), var(--we-border-alpha, 0.22));
  font-size: 14px;
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
  background: rgba(128, 128, 128, 0.14);
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
  let boundSidebar = null
  let keyListenerAttached = false
  let syncRaf = 0

  const onSidebarCaptureClick = ev => {
    const targetBtn = ev.target?.closest?.('button')
    if (targetBtn && targetBtn.id !== NAV_ID && settingsActive) {
      deactivateSettingsPane()
    }
  }

  const getAuth = () => ({
    origin: authState.runtimeOrigin,
    studioToken: authState.studioToken,
    systemLocale: authState.systemLocale
  })

  const ensureExtraCss = () => {
    ensureWePickerStyles(document)
    let styleEl = document.getElementById(EXTRA_CSS_ID)
    if (!styleEl) {
      styleEl = document.createElement('style')
      styleEl.id = EXTRA_CSS_ID
      styleEl.textContent = EXTRA_HOST_CSS
      document.head.appendChild(styleEl)
    } else if (styleEl.textContent !== EXTRA_HOST_CSS) {
      styleEl.textContent = EXTRA_HOST_CSS
    }
  }

  const syncNavButtonClasses = (navBtn, active) => {
    if (!navBtn) return
    const wantCls = active ? NAV_ACTIVE_CLASS : NAV_INACTIVE_CLASS
    const wantSpanCls = active ? SPAN_ACTIVE_CLASS : SPAN_INACTIVE_CLASS
    if (navBtn.className !== wantCls) navBtn.className = wantCls
    const span = navBtn.firstElementChild
    if (span) {
      if (span.className !== wantSpanCls) span.className = wantSpanCls
      if (span.textContent !== SETTINGS_SIDEBAR_LABEL) span.textContent = SETTINGS_SIDEBAR_LABEL
    }
    if (active) navBtn.dataset.agyNavActive = 'true'
    else delete navBtn.dataset.agyNavActive
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
        if (child.style.display !== 'none') child.style.display = 'none'
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
      if (mute) {
        if (btn.dataset.agyNativeNavMuted !== 'true') btn.dataset.agyNativeNavMuted = 'true'
      } else if (btn.dataset.agyNativeNavMuted !== undefined) {
        delete btn.dataset.agyNativeNavMuted
      }
    }
  }

  const deactivateSettingsPane = () => {
    settingsActive = false
    const navBtn = document.getElementById(NAV_ID)
    syncNavButtonClasses(navBtn, false)
    const pane = document.getElementById(PANE_ID)
    if (pane && pane.style.display !== 'none') pane.style.display = 'none'
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
    syncNavButtonClasses(document.getElementById(NAV_ID), true)
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
    if (pane.style.display === 'none') pane.style.display = ''
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
      navBtn.setAttribute('data-testid', 'settings-nav-item-Wallpaper')
      const span = document.createElement('span')
      span.textContent = SETTINGS_SIDEBAR_LABEL
      navBtn.appendChild(span)
      syncNavButtonClasses(navBtn, settingsActive)

      navBtn.addEventListener('click', e => {
        e.preventDefault()
        e.stopPropagation()
        activateSettingsPane(sidebar)
      })

      if (boundSidebar !== sidebar) {
        boundSidebar?.removeEventListener?.('click', onSidebarCaptureClick, true)
        sidebar.addEventListener?.('click', onSidebarCaptureClick, true)
        boundSidebar = sidebar
      }
    } else {
      syncNavButtonClasses(navBtn, settingsActive)
      if (boundSidebar !== sidebar) {
        boundSidebar?.removeEventListener?.('click', onSidebarCaptureClick, true)
        sidebar.addEventListener?.('click', onSidebarCaptureClick, true)
        boundSidebar = sidebar
      }
    }

    if (!sidebar.contains(navBtn)) {
      if (appearanceAnchor) appearanceAnchor.insertAdjacentElement('afterend', navBtn)
      else sidebar.appendChild(navBtn)
    }

    if (settingsActive) {
      const pane = document.getElementById(PANE_ID)
      const scroller = findSettingsScroller(sidebar)
      const needsSync = !pane || !pane.isConnected || pane.style.display === 'none' ||
        Boolean(scroller && [...scroller.children].some(c => c.id !== PANE_ID && c.style.display !== 'none'))
      if (needsSync) activateSettingsPane(sidebar)
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

  const isInternalPluginMutation = mutations => {
    const pane = document.getElementById(PANE_ID)
    const studio = document.getElementById(BACKDROP_ID)
    if (!pane && !studio) return false
    return mutations.every(m => {
      const t = m.target
      return Boolean((pane && pane.contains(t)) || (studio && studio.contains(t)))
    })
  }

  const scheduleSync = mutations => {
    if (Array.isArray(mutations) && mutations.length && isInternalPluginMutation(mutations)) return
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
      boundSidebar?.removeEventListener?.('click', onSidebarCaptureClick, true)
      boundSidebar = null
      if (keyListenerAttached) {
        window.removeEventListener('keydown', handleGlobalKeyDown)
        keyListenerAttached = false
      }
      deactivateSettingsPane()
      settingsPicker?.destroy()
      settingsPicker = null
      document.getElementById(NAV_ID)?.remove?.()
      document.getElementById(PANE_ID)?.remove?.()
      closeStudioDialog()
      document.getElementById(EXTRA_CSS_ID)?.remove()
      document.getElementById('agy-skins-picker-css')?.remove()
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
