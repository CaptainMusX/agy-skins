/**
 * Root `we-picker` shell shared identically across Antigravity native Settings pane,
 * Alt+Shift+W floating dialog, and standalone Aux Sidecar pane.
 */
import { TAB_RESET_KEYS } from '../shared/config.js'
import { weAccentInk } from '../shared/glass-presets.js'
import { WE_PICKER_CSS } from './we-picker-css.js'
import { el, createPanelStore, renderTabReset } from './panel-api.js'
import { renderLibraryTab } from './tabs/library-tab.js'
import { renderAppearanceTab } from './tabs/appearance-tab.js'
import { renderPlaybackTab } from './tabs/playback-tab.js'
import { renderAudioTab } from './tabs/audio-tab.js'
import { renderSystemTab } from './tabs/system-tab.js'
import { renderExtensionsTab } from './tabs/extensions-tab.js'
import { renderAboutTab } from './tabs/about-tab.js'

const PICKER_STYLE_ID = 'agy-skins-picker-css'

const TABS = [
  { id: 'library', key: 'tabLibrary', render: renderLibraryTab },
  { id: 'appearance', key: 'tabAppearance', render: renderAppearanceTab },
  { id: 'effects', key: 'tabEffects', render: renderPlaybackTab },
  { id: 'audio', key: 'tabAudio', render: renderAudioTab },
  { id: 'advanced', key: 'tabAdvanced', render: renderSystemTab },
  { id: 'extensions', key: 'tabExtensions', render: renderExtensionsTab },
  { id: 'about', key: 'tabAbout', render: renderAboutTab }
]

export function ensureWePickerStyles(doc = document) {
  if (!doc?.head) return null
  let styleEl = doc.getElementById(PICKER_STYLE_ID)
  if (!styleEl) {
    styleEl = doc.createElement('style')
    styleEl.id = PICKER_STYLE_ID
    styleEl.textContent = WE_PICKER_CSS
    doc.head.appendChild(styleEl)
  }
  return styleEl
}

function captureFocusState(rootEl) {
  const active = rootEl?.ownerDocument?.activeElement
  if (!active || !rootEl.contains(active)) return null
  if (!(active instanceof HTMLInputElement || active instanceof HTMLSelectElement || active instanceof HTMLTextAreaElement)) {
    return null
  }
  return {
    tag: active.tagName,
    type: active.type || '',
    placeholder: active.placeholder || '',
    selStart: typeof active.selectionStart === 'number' ? active.selectionStart : null,
    selEnd: typeof active.selectionEnd === 'number' ? active.selectionEnd : null
  }
}

function restoreFocusState(rootEl, snap) {
  if (!snap || !rootEl) return
  const candidates = rootEl.querySelectorAll(snap.tag.toLowerCase())
  for (const node of candidates) {
    if ((node.type || '') !== snap.type) continue
    if (snap.placeholder && node.placeholder !== snap.placeholder) continue
    node.focus({ preventScroll: true })
    if (snap.selStart !== null && typeof node.setSelectionRange === 'function') {
      try { node.setSelectionRange(snap.selStart, snap.selEnd ?? snap.selStart) } catch {}
    }
    break
  }
}

export function mountWePicker(rootEl, { embed = 'settings', getAuth = null } = {}) {
  if (!rootEl) throw new Error('mountWePicker requires a target root element')
  const doc = rootEl.ownerDocument || document
  ensureWePickerStyles(doc)

  const store = createPanelStore({ getAuth, embed })
  const hostWrap = el('div', { className: 'we-picker', dataset: { weEmbed: embed } })
  rootEl.innerHTML = ''
  rootEl.appendChild(hostWrap)

  let resizeObserver = null
  let lastTabsBar = null

  const positionPill = (tabsBar, immediate = false) => {
    if (!tabsBar) return
    const pill = tabsBar.querySelector('.we-tabs__pill')
    const activeTab = tabsBar.querySelector('.we-tabs__tab--active')
    if (!pill || !activeTab) return
    const left = activeTab.offsetLeft - 3
    const width = activeTab.offsetWidth
    if (width <= 0) return
    if (immediate) pill.style.transition = 'none'
    pill.style.width = `${width}px`
    pill.style.transform = `translateX(${left}px)`
    if (immediate) {
      void pill.offsetWidth
      pill.style.transition = ''
    }
  }

  const render = () => {
    const { config, weItems, tab, toast } = store.state
    const focusSnap = captureFocusState(hostWrap)
    hostWrap.innerHTML = ''

    if (!config) {
      hostWrap.appendChild(el('div', { className: 'we-picker__empty' },
        el('div', { className: 'we-picker__hint' }, '正在同步 Wallpaper Engine 状态…')
      ))
      return
    }

    const accent = /^#[0-9a-f]{6}$/i.test(config.accent || '') ? config.accent : '#4f8cff'
    hostWrap.style.setProperty('--we-accent-src', accent)
    hostWrap.style.setProperty('--we-accent-ink', weAccentInk(accent))

    const t = store.getT()
    const hiddenSet = new Set(config.hiddenWallpaperIds || [])
    const playableCount = weItems.filter(i => !hiddenSet.has(i.id)).length
    const activeTabDef = TABS.find(item => item.id === tab) || TABS[0]

    /* 1. Header Card */
    hostWrap.appendChild(el('div', { className: 'we-picker__card-shell' },
      el('div', { className: 'we-picker__card-head' },
        el('span', { className: 'we-picker__card-name' }, t('wallpaperEngineTitle')),
        el('span', { className: 'we-picker__card-badge' }, t('playableBadge', playableCount)),
        el('span', { className: 'we-picker__card-desc' }, t('wallpaperEngineDesc'))
      )
    ))

    /* 2. Segmented Tabs Bar with Sliding Pill */
    if (!store.state.pickerOpen) {
      const pill = el('span', { className: 'we-tabs__pill', 'aria-hidden': 'true' })
      const tabsBar = el('div', { className: 'we-tabs', role: 'tablist' },
        pill,
        TABS.map(item => el('button', {
          type: 'button',
          role: 'tab',
          'aria-selected': item.id === activeTabDef.id ? 'true' : 'false',
          className: `we-tabs__tab ${item.id === activeTabDef.id ? 'we-tabs__tab--active' : ''}`,
          onClick: () => {
            if (store.state.tab === item.id) return
            store.state.tab = item.id
            store.state.armedConfirm = ''
            store.notify()
          }
        }, t(item.key)))
      )
      hostWrap.appendChild(tabsBar)
      lastTabsBar = tabsBar

      if (resizeObserver) resizeObserver.disconnect()
      if (typeof ResizeObserver === 'function') {
        resizeObserver = new ResizeObserver(() => positionPill(lastTabsBar, true))
        resizeObserver.observe(tabsBar)
      }
      requestAnimationFrame(() => positionPill(tabsBar, false))
    }

    /* 3. Active Tab Content (or in-page drill-down modal) */
    hostWrap.appendChild(activeTabDef.render(store))

    /* 4. Bottom Tab Reset Control */
    if (!store.state.pickerOpen && TAB_RESET_KEYS[activeTabDef.id]) {
      hostWrap.appendChild(renderTabReset(store, activeTabDef.id))
    }

    /* 5. Transient Toast Pill */
    if (toast?.message) {
      hostWrap.appendChild(el('div', { className: 'we-picker__toast', role: 'status' }, toast.message))
    }

    restoreFocusState(hostWrap, focusSnap)
  }

  const onKeyDown = e => {
    if (e.key === 'Escape' && store.state.pickerOpen && rootEl.isConnected && rootEl.style.display !== 'none') {
      e.preventDefault()
      e.stopPropagation()
      store.state.pickerOpen = false
      store.state.pickerDraft = false
      store.state.batchMode = false
      store.state.batchSelected = []
      store.notify()
    }
  }
  doc.addEventListener('keydown', onKeyDown, true)

  const unsubscribe = store.subscribe(render)
  render()
  void store.loadInitial()

  return {
    store,
    reload: () => store.loadInitial(),
    syncExternal: payload => store.syncExternal(payload),
    destroy() {
      unsubscribe()
      doc.removeEventListener('keydown', onKeyDown, true)
      if (resizeObserver) resizeObserver.disconnect()
      hostWrap.remove()
    }
  }
}
