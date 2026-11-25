import test from 'node:test'
import assert from 'node:assert/strict'
import { fontFamilyStack, FontController } from '../src/engine/font-controller.js'

test('fontFamilyStack strips unsafe CSS tokens and quotes spaces', () => {
  assert.equal(fontFamilyStack(''), 'inherit')
  assert.equal(fontFamilyStack('Inter;color:red{}'), '"Intercolor:red", system-ui, sans-serif')
  assert.equal(fontFamilyStack('JetBrains Mono, monospace'), 'JetBrains Mono, monospace')
})

test('FontController applies and clears typography and UI color attributes', () => {
  const attrs = new Map()
  const props = new Map()
  const styleEl = { id: '', dataset: {}, isConnected: false, textContent: '', remove() { this.isConnected = false } }
  const prevDoc = globalThis.document
  globalThis.document = {
    body: {
      setAttribute: (k, v) => attrs.set(k, v),
      removeAttribute: k => attrs.delete(k),
      style: {
        setProperty: (k, v) => props.set(k, v),
        removeProperty: k => props.delete(k)
      }
    },
    head: { appendChild: el => { el.isConnected = true } },
    getElementById: () => null,
    createElement: () => styleEl
  }
  try {
    const fc = new FontController()
    fc.update({
      fontCustom: true,
      globalFamily: 'Maple Mono',
      uiColorCustom: true,
      accent: '#22c55e',
      themeColors: { primary: { light: '#111111', dark: '#ffffff' } }
    })
    assert.equal(attrs.get('data-agy-skins-font'), 'true')
    assert.equal(attrs.get('data-agy-skins-text-colors'), 'true')
    assert.equal(attrs.get('data-agy-skins-ui-colors'), 'true')
    assert.equal(props.get('--agy-skins-font-family'), '"Maple Mono", system-ui, sans-serif')
    assert.match(styleEl.textContent, /--we-accent:#22c55e/)

    fc.destroy()
    assert.equal(attrs.has('data-agy-skins-font'), false)
    assert.equal(attrs.has('data-agy-skins-ui-colors'), false)
  } finally {
    globalThis.document = prevDoc
  }
})
