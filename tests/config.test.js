import test from 'node:test'
import assert from 'node:assert/strict'
import { CONTENT_RATINGS, DEFAULT_CONFIG, normalizeConfig, normalizeContentRating, paramInRange, PARAM_RANGES } from '../src/shared/config.js'

test('normalizeContentRating maps WE strings to canonical buckets and respects upload fallback', () => {
  assert.equal(normalizeContentRating('Everyone'), 'everyone')
  assert.equal(normalizeContentRating('Questionable'), 'pg13')
  assert.equal(normalizeContentRating('PG13'), 'pg13')
  assert.equal(normalizeContentRating('Mature'), 'mature')
  assert.equal(normalizeContentRating('18+'), 'mature')
  assert.equal(normalizeContentRating(null), 'unrated')
  assert.equal(normalizeContentRating('', { isUpload: true }), 'everyone')
})

test('normalizeConfig returns schema v10 defaults with all ratings enabled', () => {
  const cfg = normalizeConfig({})
  assert.equal(cfg.schemaVersion, 10)
  assert.deepEqual(cfg.contentRatingFilter, [...CONTENT_RATINGS])
  assert.equal(cfg.wallpaperEnabled, false)
  assert.equal(cfg.wallpaperOpacity, 38)
  assert.equal(cfg.maskOcclusion, 24)
  assert.equal(cfg.titlebarGlass, true)
  assert.equal(cfg.panelGlass, 68)
  assert.equal(cfg.glassEnabled, true)
  assert.equal(cfg.browserHoleCutout, true)
  assert.equal(cfg.studioShortcut, true)
  assert.equal(cfg.uiLanguage, 'zh')
  assert.equal(cfg.thinkingMode, 'glass')
  assert.equal(cfg.activePresetId, 'factory-default')
  assert.equal(cfg.sortOrder, 'newest')
  assert.equal(cfg.bubbleOpacity, DEFAULT_CONFIG.bubbleOpacity)
})

test('normalizeConfig clamps ranges, migrates pre-v10 defaults & ratings, transitions, fontFamily & dsh preset keys', () => {
  const cfg = normalizeConfig({
    schemaVersion: 3,
    bubbleOpacity: 100,
    wallpaperTransition: 'slide',
    wallpaperBlur: 999,
    panelGlass: -20,
    wallpaperOpacity: 100,
    maskOcclusion: 12,
    titlebarGlass: false,
    contentRatingFilter: ['everyone'],
    fontFamily: 'Fira Code',
    fxTrailStyle: 'sparkle',
    thinkingNative: true,
    blur: 32,
    border: 0.45,
    flip: true,
    weRoots: ['C:\\Steam\\workshop', 'relative/bad', 'C:\\Steam\\workshop']
  })
  assert.equal(cfg.schemaVersion, 10)
  assert.deepEqual(cfg.contentRatingFilter, [...CONTENT_RATINGS])
  assert.equal(cfg.bubbleOpacity, 65)
  assert.equal(cfg.wallpaperOpacity, 38)
  assert.equal(cfg.maskOcclusion, 24)
  assert.equal(cfg.titlebarGlass, true)
  assert.equal(cfg.wallpaperTransition, 'push')
  assert.equal(cfg.wallpaperBlur, PARAM_RANGES.wallpaperBlur.max)
  assert.equal(cfg.panelGlass, PARAM_RANGES.panelGlass.min)
  assert.equal(cfg.globalFamily, 'Fira Code')
  assert.equal(cfg.fxTrailStyle, 'dust')
  assert.equal(cfg.thinkingMode, 'native')
  assert.equal(cfg.surfaceFrost, 32)
  assert.equal(cfg.glassBorder, 45)
  assert.equal(cfg.wallpaperFlip, true)
  assert.deepEqual(cfg.weRoots, ['C:\\Steam\\workshop'])

  const cfgCustomOpacity = normalizeConfig({
    schemaVersion: 8,
    wallpaperOpacity: 70,
    maskOcclusion: 30,
    scrim: 0.25,
    glassAlpha: 55,
    thinkingGlass: false,
    contentRatingFilter: ['Everyone', 'Questionable', 'Mature']
  })
  assert.equal(cfgCustomOpacity.wallpaperOpacity, 70)
  assert.equal(cfgCustomOpacity.panelGlass, 55)
  assert.equal(cfgCustomOpacity.thinkingMode, 'off')
  assert.deepEqual(cfgCustomOpacity.contentRatingFilter, ['everyone', 'pg13', 'mature'])

  const v10Restricted = normalizeConfig({
    schemaVersion: 10,
    contentRatingFilter: ['everyone']
  })
  assert.deepEqual(v10Restricted.contentRatingFilter, ['everyone'])
})

test('normalizeConfig preserves rotationGroups, fontSets, userPresets (max 8, blocks factory-*), and web weSelection.file', () => {
  const userPresets = [
    { id: 'factory-spoof', name: 'Bad', values: { panelGlass: 10 } },
    ...Array.from({ length: 10 }, (_, idx) => ({
      id: `usr_${idx}`,
      name: `Slot ${idx}`,
      values: { panelGlass: 50 + idx }
    }))
  ]
  const cfg = normalizeConfig({
    rotationGroups: [{ id: 'g1', name: 'Chill', interval: 9999, order: 'random', trigger: 'videoEnd', wallpaperIds: ['w1', 'w2'] }],
    rotationGroupId: 'g1',
    fontSets: [{ id: 'fs1', name: 'Coding', values: { globalFamily: 'JetBrains Mono', themeDarkSeparate: true } }],
    fontSetId: 'fs1',
    userPresets,
    weSelection: { id: 'web:1', title: 'Clock', kind: 'web', file: 'clock.html' }
  })
  assert.equal(cfg.rotationGroups[0].interval, 1440)
  assert.equal(cfg.rotationGroups[0].order, 'random')
  assert.equal(cfg.rotationGroups[0].trigger, 'videoEnd')
  assert.equal(cfg.fontSetId, 'fs1')
  assert.equal(cfg.fontSets[0].values.globalFamily, 'JetBrains Mono')
  assert.equal(cfg.userPresets.length, 8)
  assert.equal(cfg.userPresets.some(p => p.id.startsWith('factory-')), false)
  assert.equal(cfg.weSelection.file, 'clock.html')
})

test('paramInRange throws on unknown keys', () => {
  assert.throws(() => paramInRange('nonExistentParam', 10), /Unknown parameter/)
})
