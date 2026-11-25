/**
 * Root `we-picker` shell shared identically across Antigravity native Settings pane,
 * Alt+Shift+W floating dialog, and standalone Aux Sidecar pane.
 * Uses persistent header, tabs bar (sliding .we-tabs__pill), body outlet, footer,
 * and toast slots so interactions animate cleanly without rebuilding outer chrome.
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
    styleEl.dataset.plugin = 'agy-skins'
    doc.head.appendChild(styleEl)
  }
  if (styleEl.textContent !== WE_PICKER_CSS) {
    styleEl.textContent = WE_PICKER_CSS
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
  const bumpInteract = () => store.markInteracting(650)
  hostWrap.addEventListener('pointerdown', bumpInteract, true)
  hostWrap.addEventListener('input', bumpInteract, true)
  hostWrap.addEventListener('change', bumpInteract, true)

  const loadingEl = el('div', { className: 'we-picker__empty' },
    el('div', { className: 'we-picker__hint' }, '正在同步 Wallpaper Engine 状态…')
  )
  const cardNameEl = el('span', { className: 'we-picker__card-name' })
  const headBadgeEl = el('span', { className: 'we-picker__head-badge' })
  const cardDescEl = el('span', { className: 'we-picker__card-desc' })
  const headerShell = el('div', { className: 'we-picker__card-shell' },
    el('div', { className: 'we-picker__card-head' }, cardNameEl, headBadgeEl, cardDescEl)
  )

  const pillEl = el('span', { className: 'we-tabs__pill', 'aria-hidden': 'true' })
  const tabBtns = TABS.map(item => el('button', {
    type: 'button',
    role: 'tab',
    className: 'we-tabs__tab',
    onClick: () => {
      if (store.state.tab === item.id) return
      store.state.tab = item.id
      store.state.armedConfirm = ''
      store.notify()
    }
  }, ''))
  const tabsBar = el('div', { className: 'we-tabs', role: 'tablist' }, pillEl, tabBtns)
  const bodyEl = el('div', { className: 'we-picker__body' })
  const footerEl = el('div', { className: 'we-picker__footer' })
  const toastEl = el('div', { className: 'we-picker__toast', role: 'status', style: { display: 'none' } })

  hostWrap.replaceChildren(loadingEl, headerShell, tabsBar, bodyEl, footerEl, toastEl)
  rootEl.innerHTML = ''
  rootEl.appendChild(hostWrap)

  let lastAccent = ''
  let lastTabsVisible = false
  let lastRenderKey = ''
  let resizeObserver = null

  const positionPill = (immediate = false) => {
    const activeTab = tabsBar.querySelector('.we-tabs__tab--active')
    if (!activeTab) return
    const left = activeTab.offsetLeft - 3
    const width = activeTab.offsetWidth
    if (width <= 0) return
    if (immediate) pillEl.style.transition = 'none'
    pillEl.style.width = `${width}px`
    pillEl.style.transform = `translateX(${left}px)`
    if (immediate) {
      void pillEl.offsetWidth
      pillEl.style.transition = ''
    }
  }

  if (typeof ResizeObserver === 'function') {
    resizeObserver = new ResizeObserver(() => {
      if (tabsBar.style.display !== 'none') positionPill(true)
    })
    resizeObserver.observe(tabsBar)
  }

  const render = () => {
    const { config, weItems, tab, toast, pickerOpen } = store.state
    const hasConfig = Boolean(config)
    loadingEl.style.display = hasConfig ? 'none' : ''
    headerShell.style.display = hasConfig ? '' : 'none'
    bodyEl.style.display = hasConfig ? '' : 'none'

    if (!config) {
      tabsBar.style.display = 'none'
      footerEl.style.display = 'none'
      toastEl.style.display = 'none'
      return
    }

    const accent = /^#[0-9a-f]{6}$/i.test(config.accent || '') ? config.accent : '#4f8cff'
    if (accent !== lastAccent) {
      lastAccent = accent
      hostWrap.style.setProperty('--we-accent-src', accent)
      hostWrap.style.setProperty('--we-accent-ink', weAccentInk(accent))
    }

    const t = store.getT()
    const hiddenSet = new Set(config.hiddenWallpaperIds || [])
    const playableCount = weItems.filter(i => !hiddenSet.has(i.id)).length
    const activeTabDef = TABS.find(item => item.id === tab) || TABS[0]

    const titleStr = t('wallpaperEngineTitle')
    const badgeStr = t('playableBadge', playableCount)
    const descStr = t('wallpaperEngineDesc')
    if (cardNameEl.textContent !== titleStr) cardNameEl.textContent = titleStr
    if (headBadgeEl.textContent !== badgeStr) headBadgeEl.textContent = badgeStr
    if (cardDescEl.textContent !== descStr) cardDescEl.textContent = descStr

    const tabsVisible = !pickerOpen
    tabsBar.style.display = tabsVisible ? '' : 'none'
    if (tabsVisible) {
      TABS.forEach((item, idx) => {
        const btn = tabBtns[idx]
        const label = t(item.key)
        const active = item.id === activeTabDef.id
        if (btn.textContent !== label) btn.textContent = label
        btn.setAttribute('aria-selected', active ? 'true' : 'false')
        btn.classList.toggle('we-tabs__tab--active', active)
      })
      requestAnimationFrame(() => positionPill(!lastTabsVisible))
    }
    lastTabsVisible = tabsVisible

    // Toast slot update without rebuilding tab body!
    if (toast?.message) {
      if (toastEl.textContent !== toast.message) toastEl.textContent = toast.message
      toastEl.style.display = ''
    } else {
      toastEl.style.display = 'none'
    }

    // Re-render tab body & footer
    const focusSnap = captureFocusState(bodyEl)
    bodyEl.replaceChildren(activeTabDef.render(store))
    if (!pickerOpen && TAB_RESET_KEYS[activeTabDef.id]) {
      footerEl.style.display = ''
      footerEl.replaceChildren(renderTabReset(store, activeTabDef.id))
    } else {
      footerEl.style.display = 'none'
      footerEl.replaceChildren()
    }
    if (focusSnap && lastRenderKey === activeTabDef.id) {
      restoreFocusState(bodyEl, focusSnap)
    }
    lastRenderKey = activeTabDef.id
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
