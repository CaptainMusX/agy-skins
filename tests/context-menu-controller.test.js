import test from 'node:test'
import assert from 'node:assert/strict'
import {
  ContextMenuController,
  findReactFiber,
  isEditableElement,
  isQiFiber,
  normalizeQiItems
} from '../src/engine/context-menu-controller.js'

class MockNode {
  constructor(tagName = 'DIV') {
    this.nodeType = 1
    this.tagName = tagName.toUpperCase()
    this.children = []
    this.parentElement = null
    this.id = ''
    this.className = ''
    this.style = {}
    this.dataset = {}
    this.attrs = new Map()
    this.listeners = new Map()
    this.disabled = false
    this.readOnly = false
    this.isContentEditable = false
    this._innerHTML = ''
    this._textContent = ''
  }

  appendChild(child) {
    child.parentElement = this
    this.children.push(child)
    return child
  }

  remove() {
    if (!this.parentElement) return
    const idx = this.parentElement.children.indexOf(this)
    if (idx !== -1) this.parentElement.children.splice(idx, 1)
    this.parentElement = null
  }

  set innerHTML(val) {
    this._innerHTML = String(val)
    if (val === '') this.children = []
  }

  get innerHTML() {
    return this._innerHTML
  }

  set textContent(val) {
    this._textContent = String(val)
  }

  get textContent() {
    return this._textContent || this.children.map(c => c.textContent).join('')
  }

  setAttribute(k, v) {
    this.attrs.set(k, String(v))
    if (k === 'id') this.id = String(v)
    if (k === 'class') this.className = String(v)
  }

  getAttribute(k) {
    return this.attrs.get(k) ?? null
  }

  addEventListener(type, fn, opts) {
    const capture = typeof opts === 'boolean' ? opts : Boolean(opts?.capture)
    const signal = typeof opts === 'object' ? opts?.signal : null
    if (signal?.aborted) return
    if (!this.listeners.has(type)) this.listeners.set(type, [])
    const entry = { fn, capture }
    this.listeners.get(type).push(entry)
    signal?.addEventListener?.('abort', () => this.removeEventListener(type, fn, capture))
  }

  removeEventListener(type, fn, opts) {
    const capture = typeof opts === 'boolean' ? opts : Boolean(opts?.capture)
    const list = this.listeners.get(type)
    if (!list) return
    this.listeners.set(type, list.filter(e => !(e.fn === fn && e.capture === capture)))
  }

  dispatchEvent(ev) {
    try { if (!ev.target) ev.target = this } catch {}
    try { ev.currentTarget = this } catch {}
    const list = [...(this.listeners.get(ev.type) || [])]
    for (const entry of list) entry.fn(ev)
    return !ev.defaultPrevented
  }

  contains(other) {
    let cur = other
    while (cur) {
      if (cur === this) return true
      cur = cur.parentElement
    }
    return false
  }

  matches(sel) {
    return sel.split(',').map(s => s.trim()).some(part => {
      if (part.startsWith('#')) return this.id === part.slice(1)
      if (part === '[disabled]') return Boolean(this.disabled)
      if (part === '[data-highlighted="true"]') return this.dataset.highlighted === 'true'
      if (part.startsWith('.')) {
        const cls = part.slice(1).split(':')[0]
        return this.className.split(/\s+/).includes(cls) && !this.disabled
      }
      if (part.includes('[')) {
        const tagPart = part.split('[')[0]
        if (tagPart && this.tagName !== tagPart.toUpperCase()) return false
        if (part.includes('contenteditable') && this.isContentEditable) return true
        return false
      }
      return this.tagName === part.toUpperCase()
    })
  }

  closest(sel) {
    let cur = this
    const parts = sel.split(',').map(s => s.trim())
    while (cur) {
      for (const p of parts) {
        if (cur.matches?.(p)) return cur
      }
      cur = cur.parentElement
    }
    return null
  }

  querySelector(sel) {
    return this.querySelectorAll(sel)[0] || null
  }

  querySelectorAll(sel) {
    const out = []
    const walk = node => {
      for (const ch of node.children) {
        if (
          (sel === '.agy-skins-ctx-item' && ch.className.includes('agy-skins-ctx-item')) ||
          (sel === '.agy-skins-ctx-item:not([disabled])' && ch.className.includes('agy-skins-ctx-item') && !ch.disabled) ||
          (sel === '.agy-skins-ctx-item[data-highlighted="true"]' && ch.className.includes('agy-skins-ctx-item') && ch.dataset.highlighted === 'true') ||
          ch.matches(sel)
        ) {
          out.push(ch)
        }
        walk(ch)
      }
    }
    walk(this)
    return out
  }

  getBoundingClientRect() {
    return { left: 100, right: 280, top: 100, bottom: 220, width: 180, height: 120 }
  }

  focus() {}
}

function makeEvent(type, extra = {}) {
  const ev = {
    type,
    defaultPrevented: false,
    stopped: false,
    immediateStopped: false,
    preventDefault() { this.defaultPrevented = true },
    stopPropagation() { this.stopped = true },
    stopImmediatePropagation() { this.immediateStopped = true },
    ...extra
  }
  return ev
}

function installDomEnv() {
  const prevWin = globalThis.window
  const prevDoc = globalThis.document
  const prevNav = globalThis.navigator
  const winListeners = new Map()
  const clipboardWrites = []
  const clipboardState = { readTextValue: 'pasted-clip' }
  const execCalls = []
  let activeSelection = { text: '', ranges: [] }

  const body = new MockNode('BODY')
  const doc = {
    body,
    createElement: tag => new MockNode(tag),
    createElementNS: (_ns, tag) => new MockNode(tag),
    getElementById: id => {
      const find = node => {
        if (node.id === id) return node
        for (const ch of node.children) {
          const hit = find(ch)
          if (hit) return hit
        }
        return null
      }
      return find(body)
    },
    execCommand: (cmd, _ui, val) => {
      execCalls.push({ cmd, val })
      return cmd === 'copy' || cmd === 'cut'
    }
  }

  const win = {
    innerWidth: 1280,
    innerHeight: 800,
    addEventListener(type, fn, opts) {
      const capture = typeof opts === 'boolean' ? opts : Boolean(opts?.capture)
      const signal = typeof opts === 'object' ? opts?.signal : null
      if (signal?.aborted) return
      if (!winListeners.has(type)) winListeners.set(type, [])
      winListeners.get(type).push({ fn, capture })
      signal?.addEventListener?.('abort', () => this.removeEventListener(type, fn, capture))
    },
    removeEventListener(type, fn, opts) {
      const capture = typeof opts === 'boolean' ? opts : Boolean(opts?.capture)
      const list = winListeners.get(type)
      if (!list) return
      winListeners.set(type, list.filter(e => !(e.fn === fn && e.capture === capture)))
    },
    dispatchEvent(ev) {
      const list = [...(winListeners.get(ev.type) || [])]
      for (const entry of list) {
        if (ev.immediateStopped) break
        entry.fn(ev)
      }
    },
    getSelection: () => ({
      toString: () => activeSelection.text,
      rangeCount: activeSelection.ranges.length,
      getRangeAt: i => activeSelection.ranges[i],
      removeAllRanges: () => { activeSelection.ranges = [] },
      addRange: r => { activeSelection.ranges.push(r) }
    })
  }

  Object.defineProperty(globalThis, 'window', { value: win, configurable: true, writable: true })
  Object.defineProperty(globalThis, 'document', { value: doc, configurable: true, writable: true })
  Object.defineProperty(globalThis, 'navigator', {
    value: {
      platform: 'Win32',
      userAgent: 'Windows',
      clipboard: {
        writeText: async text => { clipboardWrites.push(text) },
        readText: async () => clipboardState.readTextValue
      }
    },
    configurable: true,
    writable: true
  })

  return {
    win,
    doc,
    body,
    clipboardWrites,
    clipboardState,
    execCalls,
    setSelection(text) {
      const makeRange = () => ({ cloneRange: () => makeRange() })
      activeSelection.text = text
      activeSelection.ranges = text ? [makeRange()] : []
    },
    restore() {
      Object.defineProperty(globalThis, 'window', { value: prevWin, configurable: true, writable: true })
      Object.defineProperty(globalThis, 'document', { value: prevDoc, configurable: true, writable: true })
      Object.defineProperty(globalThis, 'navigator', { value: prevNav, configurable: true, writable: true })
    }
  }
}

test('fiber and editable helpers inspect React fibers and inputs accurately', () => {
  const leaf = new MockNode('SPAN')
  const qiParent = new MockNode('DIV')
  const qiFiber = { type: { name: 'QI' }, memoizedProps: { items: [], nativeOnly: false }, return: null }
  qiParent.__reactFiber$test = qiFiber
  qiParent.appendChild(leaf)

  assert.equal(findReactFiber(leaf), qiFiber)
  assert.equal(isQiFiber(qiFiber), true)
  assert.equal(isQiFiber({ memoizedProps: { items: [{ id: '1', type: 'row' }] }, type: { name: 'A$c' } }), false)

  const items = normalizeQiItems([
    { id: 'rename', label: 'Rename', icon: { props: { name: 'edit' } }, click: () => {} },
    { type: 'separator' },
    { id: 'copy', label: 'Copy', type: 'submenu', items: [{ id: 'c0', label: 'Name', onClick: () => {} }] }
  ], {})
  assert.equal(items.length, 3)
  assert.equal(items[0].iconName, 'edit')
  assert.equal(items[2].items.length, 1)

  const ta = new MockNode('TEXTAREA')
  assert.equal(isEditableElement(ta), ta)
  const chk = new MockNode('INPUT')
  chk.type = 'checkbox'
  assert.equal(isEditableElement(chk), null)
})

test('ContextMenuController handles empty/non-empty workbench Copy, Escape, and outside click', async () => {
  const env = installDomEnv()
  const ctrl = new ContextMenuController({ enabled: true })
  try {
    const p = new MockNode('P')
    env.body.appendChild(p)

    // Empty selection -> Copy disabled
    env.setSelection('')
    const ev1 = makeEvent('contextmenu', { target: p, clientX: 200, clientY: 160 })
    env.win.dispatchEvent(ev1)
    assert.equal(ev1.defaultPrevented, true)
    assert.equal(ev1.stopped, true)

    const menu1 = env.doc.getElementById('agy-skins-context-menu')
    assert.ok(menu1)
    const copyBtn1 = menu1.querySelectorAll('.agy-skins-ctx-item')[0]
    assert.equal(copyBtn1.getAttribute('aria-disabled'), 'true')
    assert.equal(copyBtn1.disabled, true)

    // Escape closes menu
    env.win.dispatchEvent(makeEvent('keydown', { key: 'Escape' }))
    assert.equal(env.doc.getElementById('agy-skins-context-menu'), null)

    // Non-empty selection -> Copy enabled and triggers copy
    env.setSelection('Liquid Glass Text')
    const ev2 = makeEvent('contextmenu', { target: p, clientX: 240, clientY: 200 })
    env.win.dispatchEvent(ev2)
    const menu2 = env.doc.getElementById('agy-skins-context-menu')
    const copyBtn2 = menu2.querySelectorAll('.agy-skins-ctx-item')[0]
    assert.equal(copyBtn2.disabled, false)
    copyBtn2.dispatchEvent(makeEvent('click'))
    await Promise.resolve()
    assert.ok(env.execCalls.some(c => c.cmd === 'copy'))
    assert.equal(env.doc.getElementById('agy-skins-context-menu'), null)

    // Outside pointerdown closes open menu
    env.win.dispatchEvent(makeEvent('contextmenu', { target: p, clientX: 240, clientY: 200 }))
    assert.ok(env.doc.getElementById('agy-skins-context-menu'))
    env.win.dispatchEvent(makeEvent('pointerdown', { target: p }))
    assert.equal(env.doc.getElementById('agy-skins-context-menu'), null)
  } finally {
    ctrl.destroy()
    env.restore()
  }
})

test('ContextMenuController handles editable fields (Cut/Copy/Paste/Select All)', async () => {
  const env = installDomEnv()
  const ctrl = new ContextMenuController({ enabled: true })
  try {
    const ta = new MockNode('TEXTAREA')
    ta.value = 'Hello World'
    ta.selectionStart = 0
    ta.selectionEnd = 5
    ta.select = () => {
      ta.selectionStart = 0
      ta.selectionEnd = ta.value.length
    }
    ta.setSelectionRange = (s, e) => {
      ta.selectionStart = s
      ta.selectionEnd = e
    }
    ta.setRangeText = (rep, s, e) => {
      ta.value = ta.value.slice(0, s) + rep + ta.value.slice(e)
      ta.selectionStart = ta.selectionEnd = s + rep.length
    }
    env.body.appendChild(ta)

    const ev = makeEvent('contextmenu', { target: ta, clientX: 300, clientY: 320 })
    env.win.dispatchEvent(ev)
    assert.equal(ev.defaultPrevented, true)

    const menu = env.doc.getElementById('agy-skins-context-menu')
    const buttons = menu.querySelectorAll('.agy-skins-ctx-item')
    assert.deepEqual(
      buttons.map(b => b.dataset.itemId),
      ['cut', 'copy', 'paste', 'select-all']
    )

    // Click Copy
    buttons[1].dispatchEvent(makeEvent('click'))
    await new Promise(r => setTimeout(r, 0))
    assert.deepEqual(env.clipboardWrites, ['Hello'])

    // Open again and click Select All
    env.win.dispatchEvent(makeEvent('contextmenu', { target: ta, clientX: 300, clientY: 320 }))
    const selAllBtn = env.doc.getElementById('agy-skins-context-menu').querySelectorAll('.agy-skins-ctx-item')[3]
    selAllBtn.dispatchEvent(makeEvent('click'))
    assert.equal(ta.selectionStart, 0)
    assert.equal(ta.selectionEnd, 11)

    // Open again with full selection and click Cut
    env.win.dispatchEvent(makeEvent('contextmenu', { target: ta, clientX: 300, clientY: 320 }))
    const cutBtn = env.doc.getElementById('agy-skins-context-menu').querySelectorAll('.agy-skins-ctx-item')[0]
    cutBtn.dispatchEvent(makeEvent('click'))
    await new Promise(r => setTimeout(r, 0))
    assert.equal(ta.value, '')
    assert.equal(env.clipboardWrites.at(-1), 'Hello World')
  } finally {
    ctrl.destroy()
    env.restore()
  }
})

test('ContextMenuController renders QI items, opens submenus on hover, invokes onClick and onOpenChange', () => {
  const env = installDomEnv()
  const ctrl = new ContextMenuController({ enabled: true })
  try {
    const openStates = []
    const clicks = []
    const row = new MockNode('DIV')
    row.className = 'agy-sidebar-row'
    env.body.appendChild(row)

    const qiFiber = {
      type: { name: 'QI' },
      memoizedProps: {
        nativeOnly: false,
        onOpenChange: open => openStates.push(open),
        items: () => [
          { id: 'rename', label: 'Rename', icon: { props: { name: 'edit' } }, onClick: () => clicks.push('rename') },
          { id: 'pin', label: 'Pin', icon: { props: { name: 'keep' } }, onClick: () => clicks.push('pin') },
          {
            id: 'copy',
            label: 'Copy',
            type: 'submenu',
            items: [{ id: 'copy-0', label: 'Conversation Name', onClick: () => clicks.push('copy-0') }]
          },
          { id: 'delete', label: 'Delete', destructive: true, icon: { props: { name: 'delete' } }, onClick: () => clicks.push('delete') }
        ]
      },
      return: null
    }
    row.__reactFiber$qi = qiFiber

    const ev = makeEvent('contextmenu', { target: row, clientX: 80, clientY: 140 })
    env.win.dispatchEvent(ev)
    assert.equal(ev.defaultPrevented, true)
    assert.deepEqual(openStates, [true])

    const menu = env.doc.getElementById('agy-skins-context-menu')
    const items = menu.querySelectorAll('.agy-skins-ctx-item')
    assert.deepEqual(items.map(b => b.dataset.itemId), ['rename', 'pin', 'copy', 'delete'])

    // Hover Copy submenu trigger
    items[2].dispatchEvent(makeEvent('pointerenter'))
    const submenu = env.doc.getElementById('agy-skins-context-submenu')
    assert.ok(submenu)
    const subBtn = submenu.querySelectorAll('.agy-skins-ctx-item')[0]
    subBtn.dispatchEvent(makeEvent('click'))
    assert.deepEqual(clicks, ['copy-0'])
    assert.deepEqual(openStates, [true, false])
    assert.equal(env.doc.getElementById('agy-skins-context-menu'), null)
  } finally {
    ctrl.destroy()
    env.restore()
  }
})

test('ContextMenuController skips .xterm, shiftKey, and disabled state', () => {
  const env = installDomEnv()
  const ctrl = new ContextMenuController({ enabled: true })
  try {
    const xtermWrap = new MockNode('DIV')
    xtermWrap.className = 'xterm'
    const inner = new MockNode('SPAN')
    xtermWrap.appendChild(inner)
    env.body.appendChild(xtermWrap)

    const evXterm = makeEvent('contextmenu', { target: inner, clientX: 50, clientY: 50 })
    env.win.dispatchEvent(evXterm)
    assert.equal(evXterm.defaultPrevented, false)
    assert.equal(env.doc.getElementById('agy-skins-context-menu'), null)

    const p = new MockNode('P')
    env.body.appendChild(p)
    const evShift = makeEvent('contextmenu', { target: p, shiftKey: true, clientX: 50, clientY: 50 })
    env.win.dispatchEvent(evShift)
    assert.equal(evShift.defaultPrevented, false)

    ctrl.update({ enabled: false })
    const evDisabled = makeEvent('contextmenu', { target: p, clientX: 50, clientY: 50 })
    env.win.dispatchEvent(evDisabled)
    assert.equal(evDisabled.defaultPrevented, false)
  } finally {
    ctrl.destroy()
    env.restore()
  }
})
