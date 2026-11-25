/**
 * Dual-transport UI RPC + reactive DOM builder for both Aux Sidecar Pane and Studio Modal.
 */
import { createTranslator } from '../shared/i18n.js'

export function el(tag, attrs = null, ...children) {
  const node = document.createElement(tag)
  if (attrs && typeof attrs === 'object') {
    for (const [k, v] of Object.entries(attrs)) {
      if (v === undefined || v === null || v === false) continue
      if (k === 'className' || k === 'class') node.className = String(v)
      else if (k === 'style' && typeof v === 'object') Object.assign(node.style, v)
      else if (k === 'dataset' && typeof v === 'object') Object.assign(node.dataset, v)
      else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2).toLowerCase(), v)
      else if (k in node && k !== 'list') node[k] = v
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

export async function callBackend(action, body = {}) {
  const mode = window.__AGY_SKINS_HOST_MODE__ || 'studio'
  if (mode === 'aux' && window.sidecar?.fetch) {
    const res = await window.sidecar.fetch(`/api/${action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    return await res.json()
  }
  const token = window.__AGY_SKINS_STUDIO_TOKEN__ || ''
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

export function createPanelStore() {
  const state = {
    config: null,
    weItems: [],
    cdp: null,
    mediaOrigin: '',
    tab: 'library',
    toast: null,
    scanning: false,
    busyAction: '',
    diagnostics: null,
    systemFonts: [],
    fontsLoaded: false
  }
  const listeners = new Set()
  let deferFlushTimer = null

  const notify = () => {
    for (const fn of listeners) fn(state)
  }

  const showToast = (message, kind = 'info') => {
    state.toast = message ? { message, kind, at: Date.now() } : null
    notify()
    if (message) {
      setTimeout(() => {
        if (state.toast?.message === message) {
          state.toast = null
          notify()
        }
      }, 3200)
    }
  }

  const getT = () => createTranslator(state.config?.uiLanguage || 'auto')

  const loadInitial = async () => {
    const data = await callBackend('get-state')
    if (data?.config) state.config = data.config
    if (Array.isArray(data?.weItems)) state.weItems = data.weItems
    if (data?.cdp) state.cdp = data.cdp
    if (data?.mediaOrigin) state.mediaOrigin = data.mediaOrigin
    notify()
    if (!state.weItems.length) {
      void rescanLibrary()
    }
  }

  const updateConfig = async (patch, { defer = false, silent = false } = {}) => {
    if (!state.config) return null
    state.config = { ...state.config, ...patch }
    if (!silent) notify()
    const res = await callBackend('update-config', { patch, defer })
    if (res?.config) state.config = res.config
    if (defer) {
      if (deferFlushTimer) clearTimeout(deferFlushTimer)
      deferFlushTimer = setTimeout(() => {
        deferFlushTimer = null
        void callBackend('flush-config').catch(() => {})
      }, 320)
    }
    notify()
    return state.config
  }

  const rescanLibrary = async () => {
    state.scanning = true
    notify()
    try {
      const res = await callBackend('we-scan')
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
      const res = await callBackend('we-apply', { item })
      if (res?.config) state.config = res.config
      const d = await callBackend('get-state')
      if (Array.isArray(d?.weItems)) state.weItems = d.weItems
    } finally {
      state.busyAction = ''
      notify()
    }
  }

  return {
    state,
    subscribe(fn) {
      listeners.add(fn)
      return () => listeners.delete(fn)
    },
    notify,
    showToast,
    getT,
    loadInitial,
    updateConfig,
    rescanLibrary,
    applyWallpaperItem
  }
}

export function rangeControl({ label, desc, min, max, step = 1, unit = '', value, onChange, onCommit }) {
  const valSpan = el('span', { className: 'agy-val' }, `${value}${unit}`)
  const slider = el('input', {
    type: 'range',
    min: String(min),
    max: String(max),
    step: String(step),
    value: String(value),
    onInput: e => {
      const v = Number(e.target.value)
      valSpan.textContent = `${v}${unit}`
      syncSliderPct(e.target, min, max, v)
      onChange?.(v)
    },
    onChange: e => {
      const v = Number(e.target.value)
      onCommit?.(v)
    }
  })
  syncSliderPct(slider, min, max, value)
  return el('div', { className: 'agy-row agy-row-col' },
    el('div', { className: 'agy-row-head' },
      el('div', null,
        el('div', { className: 'agy-label' }, label),
        desc ? el('div', { className: 'agy-desc' }, desc) : null
      ),
      valSpan
    ),
    slider
  )
}

function syncSliderPct(input, min, max, val) {
  const span = max - min
  const pct = span > 0 ? Math.min(100, Math.max(0, ((val - min) / span) * 100)) : 0
  input.style.setProperty('--agy-range-progress', `${pct.toFixed(1)}%`)
}

export function switchControl({ label, desc, checked, onChange }) {
  const input = el('input', {
    type: 'checkbox',
    checked: Boolean(checked),
    onChange: e => onChange?.(Boolean(e.target.checked))
  })
  return el('label', { className: 'agy-row agy-switch-row' },
    el('div', { className: 'agy-row-meta' },
      el('div', { className: 'agy-label' }, label),
      desc ? el('div', { className: 'agy-desc' }, desc) : null
    ),
    el('span', { className: 'agy-switch' },
      input,
      el('span', { className: 'agy-switch-track' })
    )
  )
}

export function selectControl({ label, desc, value, options, onChange }) {
  return el('div', { className: 'agy-row' },
    el('div', { className: 'agy-row-meta' },
      el('div', { className: 'agy-label' }, label),
      desc ? el('div', { className: 'agy-desc' }, desc) : null
    ),
    el('select', {
      className: 'agy-select',
      value: String(value),
      onChange: e => onChange?.(e.target.value)
    }, options.map(opt =>
      el('option', {
        value: String(opt.value),
        selected: String(opt.value) === String(value)
      }, opt.label)
    ))
  )
}

export function colorControl({ label, value, fallback = '#4f8cff', onChange }) {
  const hexVal = /^#[0-9a-f]{6}$/i.test(value || '') ? value : fallback
  const picker = el('input', {
    type: 'color',
    className: 'agy-color-input',
    value: hexVal,
    onInput: e => onChange?.(e.target.value)
  })
  const textBox = el('input', {
    type: 'text',
    className: 'agy-input agy-color-hex',
    value: value || '',
    placeholder: fallback,
    onChange: e => {
      const v = e.target.value.trim()
      if (/^#[0-9a-f]{6}$/i.test(v)) {
        picker.value = v
        onChange?.(v)
      }
    }
  })
  return el('div', { className: 'agy-row' },
    el('div', { className: 'agy-label' }, label),
    el('div', { className: 'agy-color-group' }, picker, textBox)
  )
}
