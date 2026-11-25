import test from 'node:test'
import assert from 'node:assert/strict'
import { parseSerializedColor, findXtermTerminal, GlassController } from '../src/engine/glass-controller.js'

test('parseSerializedColor parses srgb, rgba and hex strings', () => {
  assert.deepEqual(parseSerializedColor('color(srgb 1 0.5 0 / 0.25)'), { r: 255, g: 128, b: 0, a: 0.25 })
  assert.deepEqual(parseSerializedColor('rgba(16, 32, 48, 0.5)'), { r: 16, g: 32, b: 48, a: 0.5 })
  assert.deepEqual(parseSerializedColor('#4f8cff'), { r: 79, g: 140, b: 255, a: 1 })
  assert.equal(parseSerializedColor('invalid'), null)
})

test('findXtermTerminal walks __reactFiber$ hooks for xterm and addon', () => {
  const mockTerm = {
    options: { theme: {} },
    _core: { optionsService: { onSpecificOptionChange: () => {} } },
    refresh: () => {}
  }
  const mockAddon = { _terminal: mockTerm, _renderer: {}, dispose: () => {} }
  const host = {
    __reactFiber$xyz: {
      memoizedState: {
        memoizedState: { current: mockTerm },
        next: { memoizedState: { current: mockAddon }, next: null }
      },
      return: null
    }
  }
  const found = findXtermTerminal(host)
  assert.equal(found?.terminal, mockTerm)
  assert.equal(found?.addon, mockAddon)
})

test('GlassController toggles data-agy-skins-active and updates CSSOM rule cleanly', () => {
  const attrs = new Map()
  const ruleSetCalls = []
  const ruleProps = new Map()
  const styleEl = {
    id: '',
    dataset: {},
    isConnected: true,
    _text: '',
    sheet: {
      cssRules: [{
        style: {
          getPropertyValue: k => ruleProps.get(k) || '',
          setProperty: (k, v) => {
            ruleProps.set(k, v)
            ruleSetCalls.push([k, v])
          }
        }
      }]
    },
    set textContent(v) { this._text = v },
    get textContent() { return this._text },
    remove() { this.isConnected = false }
  }
  const prevDoc = globalThis.document
  const prevCs = globalThis.getComputedStyle
  globalThis.getComputedStyle = () => ({ getPropertyValue: () => '#10141c' })
  globalThis.document = {
    documentElement: { style: { cssText: '' } },
    body: {
      className: 'dark',
      getAttribute: k => attrs.get(k) ?? null,
      setAttribute: (k, v) => attrs.set(k, v),
      removeAttribute: k => attrs.delete(k),
      querySelectorAll: () => []
    },
    head: {
      contains: el => el === styleEl,
      appendChild: el => { el.isConnected = true }
    },
    getElementById: id => (id === 'agy-skins-runtime-css' && styleEl.isConnected ? styleEl : null),
    createElement: () => styleEl
  }
  try {
    const gc = new GlassController()
    gc.update({ enabled: true, glassTransparency: 30, bubbleOpacity: 60, surfaceFrost: 12, isDark: true })
    assert.equal(attrs.get('data-agy-skins-active'), 'true')
    assert.match(styleEl.textContent, /body\[data-agy-skins-active="true"\]/)

    // Second update reuses single rule via CSSOM setProperty without regenerating styleEl.textContent
    const initialCss = styleEl.textContent
    gc.update({ enabled: true, glassTransparency: 50, bubbleOpacity: 60, surfaceFrost: 12, isDark: true })
    assert.equal(styleEl.textContent, initialCss)
    assert.ok(ruleSetCalls.some(([k]) => k === '--agy-skins-chrome-tint'))

    gc.destroy()
    assert.equal(attrs.has('data-agy-skins-active'), false)
  } finally {
    globalThis.document = prevDoc
    globalThis.getComputedStyle = prevCs
  }
})
