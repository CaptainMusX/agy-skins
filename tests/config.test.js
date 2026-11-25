import test from 'node:test'
import assert from 'node:assert/strict'
import { DEFAULT_CONFIG, normalizeConfig, paramInRange, PARAM_RANGES } from '../src/shared/config.js'

test('normalizeConfig returns schema v7 defaults', () => {
  const cfg = normalizeConfig({})
  assert.equal(cfg.schemaVersion, 7)
  assert.equal(cfg.wallpaperEnabled, false)
  assert.equal(cfg.browserHoleCutout, true)
  assert.equal(cfg.studioShortcut, true)
  assert.equal(cfg.uiLanguage, 'auto')
  assert.equal(cfg.sortOrder, 'newest')
  assert.equal(cfg.bubbleOpacity, DEFAULT_CONFIG.bubbleOpacity)
})

test('normalizeConfig clamps ranges and migrates legacy transitions & fontFamily', () => {
  const cfg = normalizeConfig({
    schemaVersion: 3,
    bubbleOpacity: 100,
    wallpaperTransition: 'slide',
    wallpaperBlur: 999,
    panelGlass: -20,
    fontFamily: 'Fira Code',
    fxTrailStyle: 'sparkle',
    weRoots: ['C:\\Steam\\workshop', 'relative/bad', 'C:\\Steam\\workshop']
  })
  assert.equal(cfg.schemaVersion, 7)
  assert.equal(cfg.bubbleOpacity, 55)
  assert.equal(cfg.wallpaperTransition, 'push')
  assert.equal(cfg.wallpaperBlur, PARAM_RANGES.wallpaperBlur.max)
  assert.equal(cfg.panelGlass, PARAM_RANGES.panelGlass.min)
  assert.equal(cfg.globalFamily, 'Fira Code')
  assert.equal(cfg.fxTrailStyle, 'dust')
  assert.deepEqual(cfg.weRoots, ['C:\\Steam\\workshop'])
})

test('normalizeConfig preserves rotationGroups, fontSets, and web weSelection.file', () => {
  const cfg = normalizeConfig({
    rotationGroups: [{ id: 'g1', name: 'Chill', interval: 9999, order: 'random', trigger: 'videoEnd', wallpaperIds: ['w1', 'w2'] }],
    rotationGroupId: 'g1',
    fontSets: [{ id: 'fs1', name: 'Coding', values: { globalFamily: 'JetBrains Mono', themeDarkSeparate: true } }],
    fontSetId: 'fs1',
    weSelection: { id: 'web:1', title: 'Clock', kind: 'web', file: 'clock.html' }
  })
  assert.equal(cfg.rotationGroups[0].interval, 1440)
  assert.equal(cfg.rotationGroups[0].order, 'random')
  assert.equal(cfg.rotationGroups[0].trigger, 'videoEnd')
  assert.equal(cfg.fontSetId, 'fs1')
  assert.equal(cfg.fontSets[0].values.globalFamily, 'JetBrains Mono')
  assert.equal(cfg.weSelection.file, 'clock.html')
})

test('paramInRange throws on unknown keys', () => {
  assert.throws(() => paramInRange('nonExistentParam', 10), /Unknown parameter/)
})
