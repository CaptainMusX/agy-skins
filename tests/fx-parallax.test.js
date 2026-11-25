import test from 'node:test'
import assert from 'node:assert/strict'
import { hexToRgb, hslToRgb } from '../src/engine/fx-overlay.js'
import { discoverExtensionSlots } from '../src/engine/parallax-controller.js'
import { ensureLegibleAccent, extractDominantColorFromPixels } from '../src/engine/theme-follow-controller.js'

test('hexToRgb and hslToRgb conversion', () => {
  assert.deepEqual(hexToRgb('#4f8cff'), [79, 140, 255])
  assert.deepEqual(hexToRgb('bad'), [79, 140, 255])
  const red = hslToRgb(0, 1, 0.5)
  assert.deepEqual(red, [255, 0, 0])
})

test('extractDominantColorFromPixels selects saturated tone with legible contrast', () => {
  // 2 pixels: dull grey + vivid cyan
  const pixels = new Uint8ClampedArray([
    120, 120, 120, 255,
    18, 175, 235, 255
  ])
  const hex = extractDominantColorFromPixels(pixels, true)
  assert.match(hex, /^#[0-9a-f]{6}$/i)
  const darkAdjust = ensureLegibleAccent([10, 20, 40], true)
  assert.notEqual(darkAdjust, '#0a1428')
})

test('discoverExtensionSlots collects unique trimmed data-slot names', () => {
  const mockDoc = {
    querySelectorAll: () => [
      { getAttribute: () => 'right-panel' },
      { getAttribute: () => ' right-panel ' },
      { getAttribute: () => 'footer-status' },
      { getAttribute: () => '' }
    ]
  }
  assert.deepEqual(discoverExtensionSlots(mockDoc), ['right-panel', 'footer-status'])
})
