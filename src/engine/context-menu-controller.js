/**
 * Liquid Glass Right-Click Context Menu Controller for Google Antigravity.
 *
 * Antigravity defaults `contextMenuSystem.enabled` to `false` (and wraps the
 * workbench root `Anb` in `<QI nativeOnly={true}>`), which delegates right-click
 * popups to Electron's OS-level Win32 `TrackPopupMenu` (`window.electronNative.showContextMenu`).
 * Because native OS HWNDs live outside Chromium's compositor, CSS rules cannot style them.
 *
 * When Liquid Glass / Wallpaper is active, this controller intercepts native-bound
 * `contextmenu` events in capture phase, skips custom non-QI handlers and active in-DOM
 * `[data-testid="context-menu-popup"]` popups, and renders a unified iOS Liquid Glass menu
 * (`#agy-skins-context-menu`) with full QI item/submenu fidelity, editable field actions,
 * and rich chat-selection copy preservation.
 */

const MENU_ID = 'agy-skins-context-menu'
const SUBMENU_ID = 'agy-skins-context-submenu'

const NON_TEXT_INPUT_TYPES = new Set([
  'button', 'checkbox', 'color', 'file', 'hidden', 'image', 'radio', 'range', 'reset', 'submit'
])

const NON_MENU_ITEM_TYPES = new Set(['header', 'row', 'section-header', 'spacer'])

const FALLBACK_ICON_BY_ID = {
  copy: 'content_copy',
  'copy-selection': 'content_copy',
  'copy-link': 'link',
  cut: 'content_cut',
  paste: 'content_paste',
  'select-all': 'select_all',
  rename: 'edit',
  pin: 'keep',
  'mark-read': 'mark_chat_unread',
  split: 'splitscreen_vertical_add',
  stop: 'stop_circle',
  archive: 'archive',
  delete: 'delete'
}

const SVG_ICONS = {
  content_copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
  content_cut: '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4 8.12 15.88"/><path d="M14.47 14.48 20 20"/><path d="M8.12 8.12 12 12"/>',
  content_paste: '<rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>',
  select_all: '<rect x="5" y="5" width="14" height="14" rx="2" stroke-dasharray="3 2"/><path d="M9 9h6v6H9z"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
  keep: '<path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1Z"/>',
  mark_chat_unread: '<path d="M21 11.5V16a2 2 0 0 1-2 2H7l-4 4V6a2 2 0 0 1 2-2h9.5"/><circle cx="19" cy="5" r="3"/>',
  splitscreen_vertical_add: '<rect x="3" y="4" width="7" height="16" rx="1.5"/><rect x="14" y="4" width="7" height="16" rx="1.5"/>',
  stop_circle: '<circle cx="12" cy="12" r="9"/><rect x="9" y="9" width="6" height="6" rx="1"/>',
  archive: '<rect x="3" y="4" width="18" height="4" rx="1"/><path d="M5 8v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8"/><path d="M10 12h4"/>',
  delete: '<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  open_in_new: '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.26.6.77 1.02 1.51 1H21a2 2 0 1 1 0 4h-.09c-.74-.02-1.25.4-1.51 1Z"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  chevron_right: '<path d="m9 18 6-6-6-6"/>'
}

function isMacPlatform() {
  if (typeof navigator === 'undefined') return false
  return /mac/i.test(navigator.platform || navigator.userAgent || '')
}

export function formatAccelerator(accel) {
  if (typeof accel !== 'string' || !accel.trim()) return ''
  const isMac = isMacPlatform()
  return accel
    .replace(/CmdOrCtrl\+/gi, isMac ? '⌘' : 'Ctrl+')
    .replace(/Command\+/gi, '⌘')
    .replace(/Control\+/gi, isMac ? '⌃' : 'Ctrl+')
    .replace(/Shift\+/gi, isMac ? '⇧' : 'Shift+')
    .replace(/Alt\+/gi, isMac ? '⌥' : 'Alt+')
}

export function findReactFiber(node) {
  let cur = node?.nodeType === 1 ? node : node?.parentElement || null
  while (cur) {
    try {
      const keys = Object.keys(cur)
      const fk = keys.find(k => k.startsWith('__reactFiber$'))
      if (fk && cur[fk]) return cur[fk]
    } catch {}
    cur = cur.parentElement || null
  }
  return null
}

export function isQiFiber(fiber) {
  const p = fiber?.memoizedProps
  if (!p || typeof p !== 'object' || !('items' in p)) return false
  const name = fiber.type?.name || fiber.type?.displayName || ''
  return (
    name === 'QI' ||
    'nativeOnly' in p ||
    'allowNativeBrowserMenu' in p ||
    'disableLegacyFallback' in p ||
    'legacyPopupFn' in p
  )
}

function isMenuCandidateList(list) {
  if (!Array.isArray(list) || list.length === 0) return false
  return list.some(it =>
    it && (
      it.type === 'separator' ||
      (typeof it.label === 'string' && !NON_MENU_ITEM_TYPES.has(it.type)) ||
      typeof (it.onClick ?? it.click) === 'function'
    )
  )
}

export function normalizeQiItems(rawItems, event) {
  let resolved
  try {
    resolved = typeof rawItems === 'function' ? rawItems(event) : rawItems
  } catch {
    return []
  }
  if (!Array.isArray(resolved) || !isMenuCandidateList(resolved)) return []

  const out = []
  for (const item of resolved) {
    if (!item || typeof item !== 'object') continue
    if (NON_MENU_ITEM_TYPES.has(item.type)) continue
    if (item.type === 'separator') {
      if (out.length > 0 && out[out.length - 1].type !== 'separator') {
        out.push({ type: 'separator' })
      }
      continue
    }
    const subItems = Array.isArray(item.items) && item.items.length
      ? normalizeQiItems(item.items, event)
      : null
    const onClick = typeof item.onClick === 'function'
      ? item.onClick
      : (typeof item.click === 'function' ? item.click : null)
    const type = item.type || (subItems?.length ? 'submenu' : 'item')
    const disabled = Boolean(
      item.disabled ??
      (item.enabled !== undefined ? !item.enabled : false) ??
      (type === 'label')
    )
    const iconName = item.icon?.props?.name || FALLBACK_ICON_BY_ID[item.id] || null
    out.push({
      id: item.id || '',
      label: typeof item.label === 'string' ? item.label : '',
      type,
      disabled: disabled || type === 'label',
      checked: Boolean(item.checked),
      destructive: Boolean(item.destructive),
      accelerator: formatAccelerator(item.accelerator),
      iconName,
      onClick,
      items: subItems?.length ? subItems : null
    })
  }
  while (out.length > 0 && out[out.length - 1].type === 'separator') out.pop()
  return out
}

export function isEditableElement(node) {
  let el = node?.nodeType === 1 ? node : node?.parentElement || null
  if (!el) return null
  if (typeof el.closest === 'function') {
    const candidate = el.closest('textarea, input, [contenteditable="true"], [contenteditable=""]')
    if (candidate) el = candidate
  }
  const tag = (el.tagName || '').toUpperCase()
  if (tag === 'TEXTAREA') {
    return el.disabled ? null : el
  }
  if (tag === 'INPUT') {
    const type = String(el.type || 'text').toLowerCase()
    if (NON_TEXT_INPUT_TYPES.has(type) || el.disabled) return null
    return el
  }
  if (el.isContentEditable) {
    return el
  }
  return null
}

function usesInDomPopup(qiFiber, target) {
  if (!qiFiber || qiFiber.memoizedProps?.nativeOnly) return false
  const childProps = qiFiber.child?.memoizedProps
  if (
    childProps &&
    typeof childProps === 'object' &&
    'open' in childProps &&
    typeof childProps.onOpenChange === 'function' &&
    !isEditableElement(target)
  ) {
    return true
  }
  return false
}

function hasQiWithinParentChain(fiber, maxHops = 3) {
  let cur = fiber
  for (let i = 0; i <= maxHops && cur; i++, cur = cur.return) {
    if (isQiFiber(cur)) return true
  }
  return false
}

function createSvgIcon(name) {
  const pathData = SVG_ICONS[name]
  if (!pathData) return null
  const NS = 'http://www.w3.org/2000/svg'
  const svg = document.createElementNS(NS, 'svg')
  svg.setAttribute('viewBox', '0 0 24 24')
  svg.setAttribute('width', '15')
  svg.setAttribute('height', '15')
  svg.setAttribute('fill', 'none')
  svg.setAttribute('stroke', 'currentColor')
  svg.setAttribute('stroke-width', '1.8')
  svg.setAttribute('stroke-linecap', 'round')
  svg.setAttribute('stroke-linejoin', 'round')
  svg.setAttribute('aria-hidden', 'true')
  svg.innerHTML = pathData
  return svg
}

async function writeTextWithFallback(text, execCopyFn) {
  let copied = false
  if (typeof execCopyFn === 'function') {
    try {
      copied = Boolean(execCopyFn())
    } catch {}
  }
  if (typeof text === 'string' && text.length > 0 && navigator?.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text)
      copied = true
    } catch {}
  }
  return copied
}

function restoreRanges(ranges) {
  if (!ranges?.length || typeof window === 'undefined' || typeof window.getSelection !== 'function') return
  try {
    const sel = window.getSelection()
    if (!sel) return
    sel.removeAllRanges()
    for (const r of ranges) sel.addRange(r)
  } catch {}
}

function restoreEditableSelection(el, snap) {
  if (!el) return
  try { el.focus?.({ preventScroll: true }) } catch {}
  const tag = (el.tagName || '').toUpperCase()
  if ((tag === 'TEXTAREA' || tag === 'INPUT') && typeof snap?.start === 'number' && typeof snap?.end === 'number') {
    try { el.setSelectionRange?.(snap.start, snap.end) } catch {}
  } else if (snap?.ranges?.length) {
    restoreRanges(snap.ranges)
  }
}

export class ContextMenuController {
  constructor(options = {}) {
    this.enabled = options.enabled !== undefined ? Boolean(options.enabled) : true
    this.isDark = options.isDark ?? true
    this.listenerAttached = false
    this.menuEl = null
    this.submenuEl = null
    this.activeOnClose = null
    this.openSubmenuTrigger = null
    this.dismissAc = null
    this.highlightedIndex = -1
    this.handleWindowContextMenu = this.onContextMenu.bind(this)
    if (this.enabled && typeof window !== 'undefined') {
      this.attachContextListener()
    }
  }

  attachContextListener() {
    if (this.listenerAttached || typeof window === 'undefined') return
    window.addEventListener('contextmenu', this.handleWindowContextMenu, { capture: true })
    this.listenerAttached = true
  }

  detachContextListener() {
    if (!this.listenerAttached || typeof window === 'undefined') return
    window.removeEventListener('contextmenu', this.handleWindowContextMenu, { capture: true })
    this.listenerAttached = false
  }

  update(params = {}) {
    if (params.isDark !== undefined) this.isDark = Boolean(params.isDark)
    if (params.enabled !== undefined) {
      this.enabled = Boolean(params.enabled)
    }
    if (this.enabled) {
      this.attachContextListener()
    } else {
      this.close()
      this.detachContextListener()
    }
  }

  shouldSkipTarget(event, target) {
    if (!target || event.shiftKey) return true
    if (typeof target.closest === 'function') {
      if (target.closest('.xterm, webview, iframe, [data-has-browser-hole="true"], #agy-skins-context-menu, #agy-skins-context-submenu')) {
        return true
      }
    }
    return false
  }

  resolveTargetSpec(event, target) {
    let f = findReactFiber(target)
    while (f) {
      if (typeof f.memoizedProps?.onContextMenu === 'function' && !hasQiWithinParentChain(f, 3)) {
        return { mode: 'custom-handler' }
      }
      if (isQiFiber(f)) {
        const p = f.memoizedProps
        if (p.disabled) {
          f = f.return
          continue
        }
        if (p.nativeOnly) {
          break
        }
        if (usesInDomPopup(f, target)) {
          return { mode: 'native-in-dom' }
        }
        const items = normalizeQiItems(p.items, event)
        if (items.length > 0) {
          return { mode: 'qi', fiber: f, props: p, items }
        }
      }
      f = f.return
    }

    const editable = isEditableElement(target)
    if (editable) {
      return { mode: 'editable', editable }
    }

    return { mode: 'workbench', target }
  }

  buildEditableItems(el) {
    const tag = (el.tagName || '').toUpperCase()
    const isInput = tag === 'TEXTAREA' || tag === 'INPUT'
    const readOnly = Boolean(el.readOnly)
    const mac = isMacPlatform()

    let selectedText = ''
    let snap = { start: 0, end: 0, ranges: [] }
    if (isInput) {
      const start = Number(el.selectionStart ?? 0)
      const end = Number(el.selectionEnd ?? start)
      snap = { start, end, ranges: [] }
      selectedText = typeof el.value === 'string' && end > start ? el.value.slice(start, end) : ''
    } else if (typeof window !== 'undefined' && typeof window.getSelection === 'function') {
      const sel = window.getSelection()
      const ranges = []
      if (sel) {
        for (let i = 0; i < sel.rangeCount; i++) {
          const r = sel.getRangeAt(i)
          ranges.push(typeof r?.cloneRange === 'function' ? r.cloneRange() : r)
        }
        selectedText = sel.toString() || ''
      }
      snap = { start: 0, end: 0, ranges }
    }
    const hasSelection = selectedText.length > 0
    const hasContent = isInput ? Boolean(el.value?.length) : Boolean(el.textContent?.length)

    return [
      {
        id: 'cut',
        label: 'Cut',
        iconName: 'content_cut',
        accelerator: mac ? '⌘X' : 'Ctrl+X',
        disabled: readOnly || !hasSelection,
        onClick: async () => {
          restoreEditableSelection(el, snap)
          const beforeVal = isInput ? el.value : null
          await writeTextWithFallback(selectedText, () => document.execCommand?.('cut'))
          if (isInput && el.value === beforeVal && snap.end > snap.start) {
            if (typeof el.setRangeText === 'function') {
              el.setRangeText('', snap.start, snap.end, 'end')
            } else {
              el.value = el.value.slice(0, snap.start) + el.value.slice(snap.end)
              snap.end = snap.start
              el.setSelectionRange?.(snap.start, snap.start)
            }
            el.dispatchEvent(new Event('input', { bubbles: true }))
          }
        }
      },
      {
        id: 'copy',
        label: 'Copy',
        iconName: 'content_copy',
        accelerator: mac ? '⌘C' : 'Ctrl+C',
        disabled: !hasSelection,
        onClick: async () => {
          restoreEditableSelection(el, snap)
          await writeTextWithFallback(selectedText, () => document.execCommand?.('copy'))
        }
      },
      {
        id: 'paste',
        label: 'Paste',
        iconName: 'content_paste',
        accelerator: mac ? '⌘V' : 'Ctrl+V',
        disabled: readOnly,
        onClick: async () => {
          let text = ''
          try {
            text = (await navigator?.clipboard?.readText?.()) ?? ''
          } catch {
            text = ''
          }
          restoreEditableSelection(el, snap)
          if (!text) {
            try { document.execCommand?.('paste') } catch {}
            return
          }
          let inserted = false
          try { inserted = Boolean(document.execCommand?.('insertText', false, text)) } catch {}
          if (!inserted && isInput) {
            if (typeof el.setRangeText === 'function') {
              el.setRangeText(text, snap.start, snap.end, 'end')
            } else {
              el.value = el.value.slice(0, snap.start) + text + el.value.slice(snap.end)
              const caret = snap.start + text.length
              el.setSelectionRange?.(caret, caret)
            }
            el.dispatchEvent(new Event('input', { bubbles: true }))
          }
        }
      },
      { type: 'separator' },
      {
        id: 'select-all',
        label: 'Select All',
        iconName: 'select_all',
        accelerator: mac ? '⌘A' : 'Ctrl+A',
        disabled: !hasContent,
        onClick: () => {
          try { el.focus?.({ preventScroll: true }) } catch {}
          if (isInput) {
            try { el.select?.() } catch {}
            return
          }
          if (typeof document.createRange === 'function' && typeof window.getSelection === 'function') {
            try {
              const range = document.createRange()
              range.selectNodeContents(el)
              const sel = window.getSelection()
              sel?.removeAllRanges()
              sel?.addRange(range)
            } catch {}
          }
        }
      }
    ]
  }

  buildWorkbenchItems(target) {
    const mac = isMacPlatform()
    let selText = ''
    const ranges = []
    if (typeof window !== 'undefined' && typeof window.getSelection === 'function') {
      const sel = window.getSelection()
      if (sel) {
        selText = sel.toString() || ''
        for (let i = 0; i < sel.rangeCount; i++) {
          const r = sel.getRangeAt(i)
          ranges.push(typeof r?.cloneRange === 'function' ? r.cloneRange() : r)
        }
      }
    }

    const items = [
      {
        id: 'copy',
        label: 'Copy',
        iconName: 'content_copy',
        accelerator: mac ? '⌘C' : 'Ctrl+C',
        disabled: selText.length === 0,
        onClick: async () => {
          restoreRanges(ranges)
          let ok = false
          try { ok = Boolean(document.execCommand?.('copy')) } catch {}
          if (!ok || navigator?.clipboard?.writeText) {
            // Preserve Antigravity's rich clipboard write when execCommand succeeded, only fallback if copy returned false
            if (!ok && navigator?.clipboard?.writeText) {
              try { await navigator.clipboard.writeText(selText) } catch {}
            }
          }
        }
      }
    ]

    const anchor = typeof target?.closest === 'function' ? target.closest('a[href]') : null
    const href = anchor?.getAttribute?.('href') || ''
    if (anchor && href && !href.trim().toLowerCase().startsWith('javascript:')) {
      const resolvedHref = anchor.href || href
      items.push({
        id: 'copy-link',
        label: 'Copy Link',
        iconName: 'link',
        onClick: async () => {
          await writeTextWithFallback(resolvedHref, null)
        }
      })
    }

    return items
  }

  onContextMenu(event) {
    if (!this.enabled || typeof document === 'undefined' || !document.body) return
    const target = event?.target?.nodeType === 1 ? event.target : event?.target?.parentElement || null
    if (this.shouldSkipTarget(event, target)) return

    const spec = this.resolveTargetSpec(event, target)
    if (spec.mode === 'custom-handler' || spec.mode === 'native-in-dom') {
      this.close()
      return
    }

    let items = []
    let onClose = null
    if (spec.mode === 'qi') {
      try { spec.props.onOpenChange?.(true) } catch {}
      items = spec.items
      onClose = () => {
        try { spec.props.onOpenChange?.(false) } catch {}
      }
    } else if (spec.mode === 'editable') {
      items = this.buildEditableItems(spec.editable)
    } else {
      items = this.buildWorkbenchItems(target)
    }

    if (!items.length) return

    event.preventDefault()
    event.stopPropagation()
    if (typeof event.stopImmediatePropagation === 'function') {
      event.stopImmediatePropagation()
    }

    const clientX = Number.isFinite(event.clientX) ? event.clientX : 16
    const clientY = Number.isFinite(event.clientY) ? event.clientY : 16
    this.open({ items, x: clientX, y: clientY, onClose })
  }

  renderMenuList(container, items, { isSubmenu = false } = {}) {
    container.innerHTML = ''
    for (const item of items) {
      if (item.type === 'separator') {
        const sep = document.createElement('div')
        sep.className = 'agy-skins-ctx-sep'
        sep.setAttribute('role', 'separator')
        container.appendChild(sep)
        continue
      }

      const btn = document.createElement('button')
      btn.type = 'button'
      btn.className = 'agy-skins-ctx-item agy-overlay-item'
      btn.setAttribute('role', 'menuitem')
      if (item.id) btn.dataset.itemId = item.id
      if (item.disabled) {
        btn.disabled = true
        btn.setAttribute('aria-disabled', 'true')
        btn.dataset.disabled = 'true'
      }
      if (item.destructive) {
        btn.dataset.destructive = 'true'
      }
      if (item.items?.length) {
        btn.setAttribute('aria-haspopup', 'menu')
      }

      const iconWrap = document.createElement('span')
      iconWrap.className = 'agy-skins-ctx-icon'
      const iconName = item.checked ? 'check' : item.iconName
      const svg = iconName ? createSvgIcon(iconName) : null
      if (svg) iconWrap.appendChild(svg)
      btn.appendChild(iconWrap)

      const labelSpan = document.createElement('span')
      labelSpan.className = 'agy-skins-ctx-label'
      labelSpan.textContent = item.label || ''
      btn.appendChild(labelSpan)

      if (item.accelerator) {
        const accelSpan = document.createElement('span')
        accelSpan.className = 'agy-skins-ctx-shortcut'
        accelSpan.textContent = item.accelerator
        btn.appendChild(accelSpan)
      }

      if (item.items?.length) {
        const arrowWrap = document.createElement('span')
        arrowWrap.className = 'agy-skins-ctx-arrow'
        const arrowSvg = createSvgIcon('chevron_right')
        if (arrowSvg) arrowWrap.appendChild(arrowSvg)
        btn.appendChild(arrowWrap)
      }

      btn.addEventListener('pointerdown', ev => {
        ev.preventDefault()
        ev.stopPropagation()
      })
      btn.addEventListener('mousedown', ev => {
        ev.preventDefault()
        ev.stopPropagation()
      })

      if (!item.disabled) {
        btn.addEventListener('pointerenter', () => {
          this.setHighlightedButton(container, btn)
          if (!isSubmenu) {
            if (item.items?.length) {
              this.openSubmenu(btn, item.items)
            } else {
              this.closeSubmenu()
            }
          }
        })

        btn.addEventListener('click', ev => {
          ev.preventDefault()
          ev.stopPropagation()
          if (item.items?.length) {
            this.openSubmenu(btn, item.items)
            return
          }
          const fn = item.onClick
          this.close()
          if (typeof fn === 'function') {
            try { void fn() } catch {}
          }
        })
      }

      container.appendChild(btn)
    }
  }

  setHighlightedButton(container, activeBtn) {
    const buttons = container.querySelectorAll('.agy-skins-ctx-item')
    for (const b of buttons) {
      if (b === activeBtn) b.dataset.highlighted = 'true'
      else delete b.dataset.highlighted
    }
  }

  positionElement(el, x, y, anchorRect = null) {
    const pad = 8
    const vw = typeof window !== 'undefined' && window.innerWidth ? window.innerWidth : 1280
    const vh = typeof window !== 'undefined' && window.innerHeight ? window.innerHeight : 800
    el.style.left = `${x}px`
    el.style.top = `${y}px`
    const rect = el.getBoundingClientRect?.() || { width: 180, height: 140 }
    const w = rect.width || 180
    const h = rect.height || 140

    let left = x
    let top = y
    if (anchorRect) {
      if (anchorRect.right + 4 + w <= vw - pad) {
        left = anchorRect.right + 4
      } else {
        left = Math.max(pad, anchorRect.left - w - 4)
      }
      top = Math.min(anchorRect.top - 4, vh - h - pad)
    } else {
      if (left + w > vw - pad) left = vw - w - pad
      if (top + h > vh - pad) top = vh - h - pad
    }
    left = Math.max(pad, Math.min(left, Math.max(pad, vw - w - pad)))
    top = Math.max(pad, Math.min(top, Math.max(pad, vh - h - pad)))

    el.style.left = `${Math.round(left)}px`
    el.style.top = `${Math.round(top)}px`
  }

  openSubmenu(triggerBtn, subItems) {
    if (!document.body || !subItems?.length) return
    if (this.openSubmenuTrigger && this.openSubmenuTrigger !== triggerBtn) {
      delete this.openSubmenuTrigger.dataset.submenuOpen
    }
    this.openSubmenuTrigger = triggerBtn
    triggerBtn.dataset.submenuOpen = 'true'

    if (!this.submenuEl) {
      this.submenuEl = document.createElement('div')
      this.submenuEl.id = SUBMENU_ID
      this.submenuEl.dataset.testid = SUBMENU_ID
      this.submenuEl.className = 'agy-overlay agy-skins-context-menu agy-skins-context-submenu'
      this.submenuEl.setAttribute('role', 'menu')
      this.submenuEl.addEventListener('contextmenu', ev => {
        ev.preventDefault()
        ev.stopPropagation()
      })
      document.body.appendChild(this.submenuEl)
    }

    this.renderMenuList(this.submenuEl, subItems, { isSubmenu: true })
    const anchorRect = triggerBtn.getBoundingClientRect?.() || { left: 100, right: 260, top: 100 }
    this.positionElement(this.submenuEl, anchorRect.right + 4, anchorRect.top - 4, anchorRect)
  }

  closeSubmenu() {
    if (this.openSubmenuTrigger) {
      delete this.openSubmenuTrigger.dataset.submenuOpen
      this.openSubmenuTrigger = null
    }
    if (this.submenuEl) {
      this.submenuEl.remove()
      this.submenuEl = null
    }
  }

  moveHighlight(delta) {
    const scope = this.submenuEl || this.menuEl
    if (!scope) return
    const enabledBtns = [...scope.querySelectorAll('.agy-skins-ctx-item:not([disabled])')]
    if (!enabledBtns.length) return
    const curIdx = enabledBtns.findIndex(b => b.dataset.highlighted === 'true')
    const nextIdx = curIdx === -1
      ? (delta >= 0 ? 0 : enabledBtns.length - 1)
      : (curIdx + delta + enabledBtns.length) % enabledBtns.length
    this.setHighlightedButton(scope, enabledBtns[nextIdx])
  }

  open({ items, x, y, onClose = null }) {
    this.close()
    if (!document.body || !items?.length) return

    this.activeOnClose = typeof onClose === 'function' ? onClose : null
    const menu = document.createElement('div')
    menu.id = MENU_ID
    menu.dataset.testid = MENU_ID
    menu.className = 'agy-overlay agy-skins-context-menu'
    menu.setAttribute('role', 'menu')
    menu.addEventListener('contextmenu', ev => {
      ev.preventDefault()
      ev.stopPropagation()
    })

    this.renderMenuList(menu, items, { isSubmenu: false })
    document.body.appendChild(menu)
    this.menuEl = menu
    this.positionElement(menu, x, y, null)

    const ac = new AbortController()
    this.dismissAc = ac
    const { signal } = ac

    const isInsideMenu = target => Boolean(
      target && (this.menuEl?.contains(target) || this.submenuEl?.contains(target))
    )

    const onOutsidePointer = ev => {
      if (!isInsideMenu(ev.target)) {
        this.close()
      }
    }

    const onKeyDown = ev => {
      if (ev.key === 'Escape') {
        ev.preventDefault()
        ev.stopPropagation()
        this.close()
        return
      }
      if (ev.key === 'ArrowDown') {
        ev.preventDefault()
        ev.stopPropagation()
        this.moveHighlight(1)
        return
      }
      if (ev.key === 'ArrowUp') {
        ev.preventDefault()
        ev.stopPropagation()
        this.moveHighlight(-1)
        return
      }
      if (ev.key === 'ArrowRight') {
        const hi = this.menuEl?.querySelector('.agy-skins-ctx-item[data-highlighted="true"]')
        if (hi && hi.getAttribute('aria-haspopup') === 'menu') {
          ev.preventDefault()
          ev.stopPropagation()
          hi.click()
        }
        return
      }
      if (ev.key === 'ArrowLeft' && this.submenuEl) {
        ev.preventDefault()
        ev.stopPropagation()
        this.closeSubmenu()
        return
      }
      if (ev.key === 'Enter' || ev.key === ' ') {
        const scope = this.submenuEl || this.menuEl
        const hi = scope?.querySelector('.agy-skins-ctx-item[data-highlighted="true"]:not([disabled])')
        if (hi) {
          ev.preventDefault()
          ev.stopPropagation()
          hi.click()
        }
      }
    }

    const onScroll = ev => {
      if (!isInsideMenu(ev.target)) this.close()
    }

    window.addEventListener('pointerdown', onOutsidePointer, { capture: true, signal })
    window.addEventListener('mousedown', onOutsidePointer, { capture: true, signal })
    window.addEventListener('keydown', onKeyDown, { capture: true, signal })
    window.addEventListener('blur', () => this.close(), { signal })
    window.addEventListener('resize', () => this.close(), { signal })
    window.addEventListener('scroll', onScroll, { capture: true, signal })
  }

  close() {
    this.dismissAc?.abort()
    this.dismissAc = null
    this.closeSubmenu()
    if (this.menuEl) {
      this.menuEl.remove()
      this.menuEl = null
    }
    if (typeof document !== 'undefined') {
      document.getElementById(SUBMENU_ID)?.remove()
      document.getElementById(MENU_ID)?.remove()
    }
    const cb = this.activeOnClose
    this.activeOnClose = null
    if (typeof cb === 'function') {
      try { cb() } catch {}
    }
  }

  destroy() {
    this.close()
    this.detachContextListener()
  }
}
