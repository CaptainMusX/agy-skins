import test from 'node:test'
import assert from 'node:assert/strict'
import { barsPolygon, wipeInset, pushOffset, liveSceneUrl, liveWebUrl, normalizeMediaSource, BackdropManager } from '../src/engine/backdrop-manager.js'

test('backdrop geometry and transition helpers', () => {
  const poly = barsPolygon('left', 0.5)
  assert.match(poly, /^polygon\(/)
  assert.equal(wipeInset('right'), 'inset(0 0 0 100%)')
  assert.equal(pushOffset('up', true), 'translate3d(0, 100%, 0)')
  assert.equal(normalizeMediaSource('https://example.com/a.jpg', 'image'), 'https://example.com/a.jpg')
  assert.equal(normalizeMediaSource('data:image/png;base64,AAA', 'image'), 'data:image/png;base64,AAA')
  assert.equal(normalizeMediaSource('file:///C:/foo.jpg', 'image'), null)
  assert.equal(normalizeMediaSource('javascript:alert(1)', 'image'), null)
})

test('liveSceneUrl and liveWebUrl encode signed loopback origin', () => {
  const origin = 'http://127.0.0.1:41234'
  const sUrl = liveSceneUrl({ token: 'tok_1', mediaOrigin: origin }, { fit: 'contain', fps: 60, muted: true })
  assert.match(sUrl, /type=scene/)
  assert.match(sUrl, /sceneFps=60/)
  assert.match(sUrl, /muted=true/)

  const wUrl = liveWebUrl({ base: '/api/agy-skins/scene/files/dtok', mediaOrigin: origin }, 'sub/index.html', { fps: 30 })
  assert.match(wUrl, /type=web/)
  assert.match(wUrl, /sub%2Findex\.html/)
})

test('BackdropManager.syncBrowserHole writes evenodd polygon when hole element is active', () => {
  const mgr = new BackdropManager()
  const styleProps = new Map()
  mgr.root = {
    style: {
      set clipPath(v) { styleProps.set('clip-path', v) },
      get clipPath() { return styleProps.get('clip-path') || '' },
      removeProperty: k => styleProps.delete(k)
    }
  }
  mgr.currentOptions = { browserHoleCutout: true }

  const prevDoc = globalThis.document
  globalThis.document = {
    body: { getAttribute: k => (k === 'data-has-browser-hole' ? 'true' : null) },
    querySelector: sel => sel.includes('data-browser-hole') ? {
      getBoundingClientRect: () => ({ left: 400, top: 60, right: 980, bottom: 720, width: 580, height: 660 })
    } : null
  }
  try {
    mgr.syncBrowserHole()
    assert.equal(
      styleProps.get('clip-path'),
      'polygon(evenodd, 0 0, 100% 0, 100% 100%, 0 100%, 0 0, 400px 60px, 980px 60px, 980px 720px, 400px 720px, 400px 60px)'
    )
    mgr.currentOptions = { browserHoleCutout: false }
    mgr.syncBrowserHole()
    assert.equal(styleProps.has('clip-path'), false)
  } finally {
    globalThis.document = prevDoc
  }
})
