import test from 'node:test'
import assert from 'node:assert/strict'
import { WallpaperRotation, rotationCandidates } from '../sidecars/wallpaper_engine/rotation.mjs'

test('rotationCandidates filters hidden items and respects group order', () => {
  const items = [
    { id: 'w1', dir: 'd1', mediaPath: 'm1' },
    { id: 'w2', dir: 'd2', mediaPath: 'm2' },
    { id: 'w3', dir: 'd3', mediaPath: 'm3' }
  ]
  const out = rotationCandidates(items, ['w2'], { wallpaperIds: ['w3', 'w2', 'w1'] })
  assert.deepEqual(out.map(i => i.id), ['w3', 'w1'])
})

test('WallpaperRotation cycles sequentially and avoids repeat in random mode', async () => {
  const applied = []
  let config = {
    rotationEnabled: true,
    rotationGroupId: 'g1',
    rotationGroups: [
      { id: 'g1', name: 'G', interval: 5, order: 'sequence', trigger: 'interval', wallpaperIds: ['w1', 'w2', 'w3'] }
    ],
    hiddenWallpaperIds: [],
    weSelection: { id: 'w1' }
  }
  const items = [
    { id: 'w1', dir: 'd1', mediaPath: 'm1' },
    { id: 'w2', dir: 'd2', mediaPath: 'm2' },
    { id: 'w3', dir: 'd3', mediaPath: 'm3' }
  ]
  const store = {
    getConfig: () => config,
    getWeItems: () => items
  }
  const rot = new WallpaperRotation({
    store,
    intervalMs: 60_000,
    applyItem: async item => {
      applied.push(item.id)
      config = { ...config, weSelection: { id: item.id } }
    }
  })

  try {
    assert.equal(await rot.advance(true), true)
    assert.equal(await rot.advance(true), true)
    assert.deepEqual(applied, ['w2', 'w3'])

    config.rotationGroups[0].order = 'random'
    assert.equal(await rot.advance(true), true)
    assert.notEqual(applied.at(-1), 'w3')

    config.rotationEnabled = false
    assert.equal(await rot.advance(true, { manual: false }), false)
    assert.equal(await rot.advance(true, { manual: true }), true)
  } finally {
    rot.destroy()
  }
})
