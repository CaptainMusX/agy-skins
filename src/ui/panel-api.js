/**
 * Triple-transport reactive store & dsh-wallpaper-engine control primitives
 * shared identically across Settings native pane, Alt+Shift+W modal, and Aux Sidecar pane.
 */
import { createTranslator, resolveLanguage } from '../shared/i18n.js'
import { DEFAULT_CONFIG, PARAM_RANGES, RESET_MODULES, TAB_RESET_KEYS } from '../shared/config.js'

export function el(tag, attrs = null, ...children) {
  const node = document.createElement(tag)
  if (attrs && typeof attrs === 'object') {
    for (const [k, v] of Object.entries(attrs)) {
      if (v === undefined || v === null || v === false) continue
      if (k === 'className' || k === 'class') node.className = String(v)
      else if (k === 'style' && typeof v === 'object') Object.assign(node.style, v)
      else if (k === 'dataset' && typeof v === 'object') Object.assign(node.dataset, v)
      else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2).toLowerCase(), v)
      else if (k in node && k !== 'list' && k !== 'role') node[k] = v
      else node.setAttribute(k, v === true ? '' : String(v))
    }
  }
  appendChildren(node, children)
  return node
}

function appendChildren(parent, list) {
  for (const item of list) {
    if (item === undefined || item === null || item === false) continue
    if (Array.isArray(item)) appendChildren(parent, item)
    else if (item instanceof Node) parent.appendChild(item)
    else parent.appendChild(document.createTextNode(String(item)))
  }
}

export async function callBackend(action, body = {}, auth = null) {
  if (auth?.origin && auth?.studioToken) {
    const res = await fetch(`${auth.origin}/studio-api/${action}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-agy-studio-token': auth.studioToken
      },
      body: JSON.stringify(body)
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  }
  const mode = (typeof window !== 'undefined' && window.__AGY_SKINS_HOST_MODE__) || 'studio'
  if (mode === 'aux' && typeof window !== 'undefined' && window.sidecar?.fetch) {
    const res = await window.sidecar.fetch(`/api/${action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    return await res.json()
  }
  const token = (typeof window !== 'undefined' && window.__AGY_SKINS_STUDIO_TOKEN__) || ''
  const res = await fetch(`/studio-api/${action}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-agy-studio-token': token
    },
    body: JSON.stringify(body)
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return await res.json()
}

export function createPanelStore({ getAuth = null, embed = '' } = {}) {
  const auth = () => (typeof getAuth === 'function' ? getAuth() : null)
  const state = {
    embed,
    config: null,
    weItems: [],
    cdp: null,
    mediaOrigin: '',
    systemLocale: auth()?.systemLocale || globalThis.__AGY_SKINS_SYSTEM_LOCALE__ || '',
    tab: 'library',
    toast: null,
    scanning: false,
    busyAction: '',
    diagnostics: null,
    systemFonts: [],
    fontsLoaded: false,
    fontsLoading: false,
    discoveredSlots: [],

    // UI view states matching dsh-wallpaper-engine
    pickerOpen: false,
    pickerDraft: false,
    modalView: 'normal',
    batchMode: false,
    batchSelected: [],
    propsOpen: false,
    showGlassDetail: false,
    editingGroup: null,
    manualSourceOpen: false,
    presetSaveMode: '', // '' | 'save' | 'export'
    presetDraftName: '',
    presetExportId: '',
    fontSetDraftName: '',
    fontOnlyModified: false,
    fontAdvanced: false,
    armedConfirm: '',
    search: '',
    openMenus: {
      rating: false,
      type: false
    },
    sectionsOpen: {
      glassPresets: true,
      glassUi: true,
      detail: true,
      corners: true,
      uiColor: false,
      font: false
    }
  }

  const listeners = new Set()
  let deferFlushTimer = null
  let deferSendTimer = null
  let deferredPatch = null
  let pendingSyncTimer = null
  let mutationSeq = 0
  let interactingUntil = 0
  let initialLoading = false

  const notify = () => {
    for (const fn of listeners) fn(state)
  }

  const markInteracting = (ms = 550) => {
    const until = Date.now() + ms
    if (until > interactingUntil) interactingUntil = until
  }

  const rpc = (action, body = {}) => callBackend(action, body, auth())

  const showToast = (message, kind = 'info') => {
    state.toast = message ? { message, kind, at: Date.now() } : null
    notify()
    if (message) {
      setTimeout(() => {
        if (state.toast?.message === message) {
          state.toast = null
          notify()
        }
      }, 2800)
    }
  }

  const getLang = () => resolveLanguage(
    state.config?.uiLanguage || 'zh',
    state.systemLocale || auth()?.systemLocale || globalThis.__AGY_SKINS_SYSTEM_LOCALE__ || ''
  )

  const getT = () => createTranslator(
    state.config?.uiLanguage || 'zh',
    state.systemLocale || auth()?.systemLocale || globalThis.__AGY_SKINS_SYSTEM_LOCALE__ || ''
  )

  const isZh = () => getLang() === 'zh'

  const loadInitial = async () => {
    if (initialLoading) return
    initialLoading = true
    try {
      const data = await rpc('get-state')
      if (data?.config) state.config = data.config
      if (Array.isArray(data?.weItems)) state.weItems = data.weItems
      if (data?.cdp) state.cdp = data.cdp
      if (data?.mediaOrigin) state.mediaOrigin = data.mediaOrigin
      if (data?.systemLocale) state.systemLocale = data.systemLocale
      notify()
      if (!state.weItems.length || state.weItems.every(i => !i.previewUrl && i.previewPath)) {
        void rescanLibrary()
      }
      void refreshSlots()
    } catch {
      // Transient startup/reload fetch errors retry automatically via syncExternal
    } finally {
      initialLoading = false
    }
  }

  const refreshSlots = async () => {
    if (typeof document !== 'undefined') {
      const localSlots = []
      const seen = new Set()
      for (const node of document.querySelectorAll('[data-slot]')) {
        const s = node.getAttribute('data-slot')?.trim()
        if (s && !seen.has(s)) { seen.add(s); localSlots.push(s) }
      }
      if (localSlots.length) {
        state.discoveredSlots = localSlots
        return localSlots
      }
    }
    try {
      const res = await rpc('discover-slots')
      if (Array.isArray(res?.slots)) state.discoveredSlots = res.slots
    } catch {}
    return state.discoveredSlots
  }

  const sendDeferredUpdate = async () => {
    if (!deferredPatch) return
    const patchToSend = deferredPatch
    deferredPatch = null
    const seq = ++mutationSeq
    try {
      const res = await rpc('update-config', { patch: patchToSend, defer: true })
      if (res?.config && seq === mutationSeq) {
        state.config = res.config
      }
      if (deferFlushTimer) clearTimeout(deferFlushTimer)
      deferFlushTimer = setTimeout(() => {
        deferFlushTimer = null
        void rpc('flush-config').catch(() => {})
      }, 320)
    } catch {}
  }

  const updateConfig = async (patch, { defer = false, rerender = true } = {}) => {
    if (!state.config || !patch || typeof patch !== 'object') return null
    state.config = { ...state.config, ...patch }
    const handledInProcess = Boolean(globalThis.__agySkinsRuntime?.previewConfig?.(state.config))

    if (defer) {
      markInteracting(600)
      deferredPatch = { ...(deferredPatch || {}), ...patch }
      if (rerender) notify()
      if (handledInProcess) {
        if (deferSendTimer) clearTimeout(deferSendTimer)
        deferSendTimer = setTimeout(() => {
          deferSendTimer = null
          void sendDeferredUpdate()
        }, 260)
      } else if (!deferSendTimer) {
        deferSendTimer = setTimeout(() => {
          deferSendTimer = null
          void sendDeferredUpdate()
        }, 90)
      }
      return state.config
    }

    const combinedPatch = deferredPatch ? { ...deferredPatch, ...patch } : patch
    deferredPatch = null
    if (deferSendTimer) {
      clearTimeout(deferSendTimer)
      deferSendTimer = null
    }

    const seq = ++mutationSeq
    if (rerender) notify()
    try {
      const res = await rpc('update-config', { patch: combinedPatch, defer: false })
      if (res?.config && seq === mutationSeq) {
        const selChanged = JSON.stringify(state.config.weSelection) !== JSON.stringify(res.config.weSelection)
        state.config = res.config
        if (rerender && selChanged) notify()
      }
    } catch (err) {
      if (rerender) showToast(String(err?.message || err), 'warn')
    }
    return state.config
  }

  const rescanLibrary = async () => {
    state.scanning = true
    notify()
    try {
      const res = await rpc('we-scan')
      if (Array.isArray(res?.items)) state.weItems = res.items
      if (res?.error) showToast(res.error, 'warn')
    } finally {
      state.scanning = false
      notify()
    }
  }

  const applyWallpaperItem = async item => {
    state.busyAction = item?.id || 'apply'
    notify()
    try {
      await updateConfig({ wallpaperPaused: false }, { rerender: false })
      const res = await rpc('we-apply', { item })
      if (res?.config) state.config = res.config
    } finally {
      state.busyAction = ''
      notify()
    }
  }

  const resetModule = moduleKey => {
    const keys = RESET_MODULES[moduleKey]
    if (!keys?.length) return
    const patch = {}
    for (const k of keys) patch[k] = structuredClone(DEFAULT_CONFIG[k])
    void updateConfig(patch)
    showToast(isZh() ? '已恢复该模块默认设置' : 'Module reset to defaults')
  }

  const resetTab = tabId => {
    const keys = TAB_RESET_KEYS[tabId]
    if (!keys?.length) return
    const patch = {}
    for (const k of keys) patch[k] = structuredClone(DEFAULT_CONFIG[k])
    state.armedConfirm = ''
    void updateConfig(patch)
    showToast(isZh() ? '已恢复本页默认设置' : 'Current tab reset to defaults')
  }

  const syncExternal = payload => {
    if (!payload) return
    if (!state.config && !initialLoading && auth()?.origin) {
      void loadInitial()
    }
    let changed = false
    const nextCdp = payload.cdp
    if (nextCdp) {
      const prev = state.cdp || {}
      const cdpDiff =
        prev.state !== nextCdp.state ||
        prev.port !== nextCdp.port ||
        prev.targets !== nextCdp.targets ||
        prev.shortcutState !== nextCdp.shortcutState ||
        prev.canFixShortcut !== nextCdp.canFixShortcut
      if (cdpDiff) {
        state.cdp = nextCdp
        if (state.tab === 'advanced') changed = true
      }
    }
    const nextLocale = payload.systemLocale || ''
    if (nextLocale && nextLocale !== state.systemLocale) {
      state.systemLocale = nextLocale
      changed = true
    }
    if (!changed) return
    const waitMs = interactingUntil - Date.now()
    if (waitMs > 0) {
      if (!pendingSyncTimer) {
        pendingSyncTimer = setTimeout(() => {
          pendingSyncTimer = null
          if (Date.now() >= interactingUntil) notify()
        }, waitMs + 40)
      }
      return
    }
    notify()
  }

  return {
    state,
    rpc,
    subscribe(fn) {
      listeners.add(fn)
      return () => listeners.delete(fn)
    },
    notify,
    markInteracting,
    showToast,
    getLang,
    getT,
    isZh,
    loadInitial,
    refreshSlots,
    updateConfig,
    rescanLibrary,
    applyWallpaperItem,
    resetModule,
    resetTab,
    syncExternal
  }
}

export function ctlText(label, hint = '', tooltip = '') {
  return el('div', { className: 'we-picker__ctl-text', title: tooltip || undefined },
    el('span', { className: 'we-picker__ctl-label' }, label),
    hint ? el('span', { className: 'we-picker__ctl-hint' }, hint) : null
  )
}

export function moduleResetButton({ title = '', onClick }) {
  return el('button', {
    className: 'we-mod-reset',
    type: 'button',
    title: title || '恢复该模块默认参数',
    onClick: e => {
      e.stopPropagation()
      onClick?.()
    }
  }, '↺')
}

export function sectionHead({ title, open = true, onToggle = null, resetBtn = null }) {
  const interactive = typeof onToggle === 'function'
  return el('div', {
    className: `we-picker__section-head ${interactive ? 'we-picker__section-head--toggle' : ''}`,
    role: interactive ? 'button' : undefined,
    tabIndex: interactive ? 0 : undefined,
    'aria-expanded': interactive ? String(Boolean(open)) : undefined,
    onClick: interactive ? onToggle : undefined,
    onKeyDown: interactive ? e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        onToggle()
      }
    } : undefined
  },
    el('span', { className: 'we-picker__section-label' }, title),
    interactive ? el('span', { className: `we-picker__section-caret ${open ? 'is-open' : ''}`, 'aria-hidden': 'true' }, '▾') : null,
    resetBtn
  )
}

export function switchRow({ label, hint = '', tooltip = '', checked = false, disabled = false, onChange }) {
  return el('label', { className: `we-picker__ctl ${disabled ? 'we-picker__ctl--disabled' : ''}` },
    ctlText(label, hint, tooltip),
    el('span', { className: 'we-picker__switch' },
      el('input', {
        type: 'checkbox',
        checked: Boolean(checked),
        disabled: Boolean(disabled),
        onChange: e => onChange?.(Boolean(e.target.checked))
      }),
      el('span', { className: 'we-picker__switch-track' },
        el('span', { className: 'we-picker__switch-thumb' })
      )
    )
  )
}

function syncSliderFill(input, min, max, value) {
  const span = max - min
  const pct = span > 0 ? Math.min(100, Math.max(0, ((Number(value) - min) / span) * 100)) : 0
  input.style.setProperty('--we-fill', `${pct.toFixed(1)}%`)
}

export function SliderRow({ label, tooltip = '', min, max, step = 1, value, unit = '', defaultValue = null, numberEdit = false, onChange, onCommit }) {
  const valNum = Number.isFinite(Number(value)) ? Number(value) : min
  const displaySpan = !numberEdit ? el('span', null, `${valNum}${unit}`) : null
  const numInput = numberEdit ? el('input', {
    type: 'number',
    className: 'we-picker__value-input',
    min: String(min),
    max: String(max),
    step: String(step),
    value: String(valNum),
    onChange: e => {
      const clamped = Math.min(max, Math.max(min, Number(e.target.value) || min))
      slider.value = String(clamped)
      syncSliderFill(slider, min, max, clamped)
      onCommit?.(clamped)
    }
  }) : null

  const slider = el('input', {
    type: 'range',
    className: 'we-picker__slider',
    min: String(min),
    max: String(max),
    step: String(step),
    value: String(valNum),
    onInput: e => {
      const v = Number(e.target.value)
      syncSliderFill(e.target, min, max, v)
      if (displaySpan) displaySpan.textContent = `${v}${unit}`
      if (numInput) numInput.value = String(v)
      onChange?.(v)
    },
    onChange: e => {
      const v = Number(e.target.value)
      onCommit?.(v)
    }
  })
  syncSliderFill(slider, min, max, valNum)

  const labelEl = el('span', {
    className: 'we-picker__label',
    title: tooltip || label,
    onDblClick: defaultValue !== null ? () => {
      slider.value = String(defaultValue)
      syncSliderFill(slider, min, max, defaultValue)
      if (displaySpan) displaySpan.textContent = `${defaultValue}${unit}`
      if (numInput) numInput.value = String(defaultValue)
      onCommit?.(defaultValue)
    } : undefined
  }, label)

  return el('div', { className: 'we-picker__slider-row' },
    labelEl,
    slider,
    el('span', { className: 'we-picker__value' },
      displaySpan || [numInput, unit ? el('span', { className: 'we-picker__value-unit' }, unit) : null]
    )
  )
}

export function configSlider(store, cfgKey, label, opts = {}) {
  const r = PARAM_RANGES[cfgKey]
  const min = opts.min ?? r.min
  const max = opts.max ?? r.max
  const step = opts.step ?? (Number.isInteger(max) && max > 10 ? 1 : 0.1)
  return SliderRow({
    label,
    tooltip: opts.tooltip || '',
    min,
    max,
    step,
    unit: opts.unit ?? r.unit ?? '',
    value: store.state.config[cfgKey],
    defaultValue: opts.defaultValue ?? DEFAULT_CONFIG[cfgKey],
    numberEdit: Boolean(opts.numberEdit),
    onChange: v => void store.updateConfig({ [cfgKey]: v }, { defer: true, rerender: false }),
    onCommit: v => void store.updateConfig({ [cfgKey]: v }, { defer: false, rerender: false })
  })
}

export function segRow({ label, hint = '', tooltip = '', items, value, onPick, chips = false, equalCorners = false, syncActive = false }) {
  const segClass = `we-picker__seg${chips ? ' we-picker__seg--chips' : ''}${equalCorners ? ' we-picker__seg--corners-eq' : ''}`
  const btns = items.map(item => el('button', {
    type: 'button',
    dataset: { segId: String(item.id) },
    className: `we-picker__btn we-picker__rate ${item.active !== undefined ? (item.active ? 'we-picker__rate--active' : '') : (value === item.id ? 'we-picker__rate--active' : '')}`,
    title: item.hint || '',
    onClick: e => {
      if (syncActive) {
        if (item.active !== undefined) {
          e.currentTarget.classList.toggle('we-picker__rate--active')
        } else {
          for (const b of btns) b.classList.toggle('we-picker__rate--active', b === e.currentTarget)
        }
      }
      onPick?.(item.id)
    }
  }, item.label))
  return el('div', { className: 'we-picker__ctl we-picker__ctl--wrap' },
    ctlText(label, hint, tooltip),
    el('div', { className: segClass }, btns)
  )
}

export function selectRow({ label, hint = '', tooltip = '', value, options, disabled = false, onChange }) {
  return el('div', { className: `we-picker__ctl ${disabled ? 'we-picker__ctl--disabled' : ''}` },
    ctlText(label, hint, tooltip),
    el('select', {
      className: 'we-picker__select',
      value: String(value ?? ''),
      disabled: Boolean(disabled),
      onChange: e => onChange?.(e.target.value)
    }, options.map(opt => el('option', {
      value: String(opt.value),
      selected: String(opt.value) === String(value)
    }, opt.label)))
  )
}

export function swatchRow({ label, hint = '', tooltip = '', presets, value, colorValue = '', onPick, autoBtn = null, disabled = false, syncActive = true }) {
  const norm = String(value || '').toLowerCase()
  const hexVal = /^#[0-9a-f]{6}$/i.test(colorValue || value || '') ? (colorValue || value) : '#4f8cff'
  const wrap = el('div', { className: 'we-picker__swatches' })
  const updateActiveRing = activeNode => {
    if (!syncActive) return
    for (const child of wrap.querySelectorAll('.we-picker__swatch')) {
      child.classList.toggle('we-picker__swatch--active', child === activeNode)
    }
  }
  const btns = presets.map(c => el('button', {
    type: 'button',
    className: `we-picker__swatch ${norm === c.toLowerCase() ? 'we-picker__swatch--active' : ''}`,
    style: { backgroundColor: c },
    title: c,
    onClick: e => {
      updateActiveRing(e.currentTarget)
      onPick?.(c, false)
    }
  }))
  if (autoBtn) {
    autoBtn.addEventListener('click', () => updateActiveRing(autoBtn))
    wrap.appendChild(autoBtn)
  }
  for (const b of btns) wrap.appendChild(b)
  wrap.appendChild(
    el('label', { className: 'we-picker__swatch-custom', title: '自定义颜色' },
      el('input', {
        type: 'color',
        value: hexVal,
        onInput: e => {
          updateActiveRing(null)
          onPick?.(e.target.value, true)
        },
        onChange: e => {
          updateActiveRing(null)
          onPick?.(e.target.value, false)
        }
      })
    )
  )
  return el('div', { className: `we-picker__ctl we-picker__ctl--wrap ${disabled ? 'we-picker__ctl--disabled' : ''}` },
    ctlText(label, hint, tooltip),
    wrap
  )
}

export function renderConfirmRow({ armedToken, token, question, confirmLabel = '确认', cancelLabel = '取消', onConfirm, onCancel, danger = false }) {
  if (!token || armedToken !== token) return null
  return el('div', { className: 'we-confirm-row' },
    el('span', { className: 'we-picker__hint' }, question),
    el('div', { className: 'we-picker__ctl-side' },
      el('button', {
        type: 'button',
        className: `we-picker__btn we-picker__btn--mini ${danger ? 'we-picker__btn--danger' : 'we-picker__btn--primary'}`,
        onClick: onConfirm
      }, confirmLabel),
      el('button', {
        type: 'button',
        className: 'we-picker__btn we-picker__btn--mini',
        onClick: onCancel
      }, cancelLabel)
    )
  )
}

export function renderTabReset(store, tabId) {
  const t = store.getT()
  const token = `tab-reset:${tabId}`
  const armed = store.state.armedConfirm === token
  return el('div', { className: 'we-picker__section' },
    el('div', { className: 'we-picker__ctl' },
      el('span', { className: 'we-picker__section-reset-label', style: { fontWeight: '600', fontSize: '0.88em' } }, t('resetTab')),
      el('button', {
        type: 'button',
        className: 'we-picker__btn',
        disabled: armed,
        onClick: () => {
          store.state.armedConfirm = token
          store.notify()
        }
      }, t('resetTab'))
    ),
    renderConfirmRow({
      armedToken: store.state.armedConfirm,
      token,
      question: t('resetTabConfirm'),
      confirmLabel: t('confirmBtn'),
      cancelLabel: t('cancelBtn'),
      danger: true,
      onConfirm: () => store.resetTab(tabId),
      onCancel: () => {
        store.state.armedConfirm = ''
        store.notify()
      }
    })
  )
}
