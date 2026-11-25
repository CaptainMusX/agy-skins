import test from 'node:test'
import assert from 'node:assert/strict'
import { READABILITY_FLOOR, READABILITY_FLOOR_DARK, contrastRatio, parseHexRgb, relativeLuminance, weClampSurfaceColor, weAccentInk } from '../src/shared/glass-presets.js'
import { parseSerializedColor, findXtermTerminal, GlassController } from '../src/engine/glass-controller.js'

test('weClampSurfaceColor enforces readability floor >= 4.5 contrast and weAccentInk selects legible ink', () => {
  const darkTint = weClampSurfaceColor('#93c5fd', true, 100)
  const darkRgb = parseHexRgb(darkTint.hex)
  assert.ok(relativeLuminance(darkRgb) <= 0.025)
  // Glass blend at READABILITY_FLOOR_DARK (0.59) + semi-transparent top coat (alpha 0.6) over worst-case white wallpaper
  const topLeak = (1 - READABILITY_FLOOR_DARK) * (1 - 0.6)
  const darkComposite = darkRgb.map(v => v * (1 - topLeak) + 255 * topLeak)
  assert.ok(contrastRatio(darkComposite, [248, 250, 252]) >= 4.5)

  const lightTint = weClampSurfaceColor('#3b82f6', false, 100)
  const lightComposite = parseHexRgb(lightTint.hex).map(v => v * READABILITY_FLOOR)
  assert.ok(contrastRatio(lightComposite, [10, 10, 12]) >= 4.5)

  assert.equal(weAccentInk('#ffffff'), '#0a0a0c')
  assert.equal(weAccentInk('#0f172a'), '#ffffff')
})

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

test('GlassController emits unified seam-free CSS, --onyx-frame: transparent, thinkingMode, and updates CSSOM cleanly', () => {
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
    gc.update({
      enabled: true,
      wallpaperEnabled: true,
      glassEnabled: true,
      glassTransparency: 30,
      bubbleOpacity: 60,
      surfaceFrost: 12,
      thinkingMode: 'off',
      isDark: true
    })
    assert.equal(attrs.get('data-agy-skins-active'), 'true')
    assert.equal(attrs.get('data-agy-skins-wallpaper'), 'true')
    assert.equal(attrs.get('data-agy-thinking-mode'), 'off')
    assert.match(styleEl.textContent, /--onyx-frame:\s*transparent/)
    assert.match(styleEl.textContent, /\.settings-modal-container/)

    // Second update mutates CSSOM properties directly without rebuilding stylesheet text
    const initialCss = styleEl.textContent
    gc.update({
      enabled: true,
      wallpaperEnabled: true,
      glassEnabled: true,
      glassTransparency: 50,
      bubbleOpacity: 60,
      surfaceFrost: 12,
      thinkingMode: 'glass',
      isDark: true
    })
    assert.equal(styleEl.textContent, initialCss)
    assert.equal(attrs.get('data-agy-thinking-mode'), 'glass')
    assert.ok(ruleSetCalls.some(([k]) => k === '--agy-skins-chrome-tint'))

    gc.destroy()
    assert.equal(attrs.has('data-agy-skins-active'), false)
    assert.equal(attrs.has('data-agy-skins-wallpaper'), false)
  } finally {
    globalThis.document = prevDoc
    globalThis.getComputedStyle = prevCs
  }
})
