import test from 'node:test'
import assert from 'node:assert/strict'
import { barsPolygon, wipeInset, pushOffset, toSceneFit, liveSceneUrl, liveWebUrl, normalizeMediaSource, BackdropManager } from '../src/engine/backdrop-manager.js'

test('backdrop geometry and transition helpers', () => {
  const poly = barsPolygon('left', 0.5)
  assert.match(poly, /^polygon\(/)
  assert.equal(wipeInset('right'), 'inset(0 0 0 100%)')
  assert.equal(pushOffset('up', true), 'translate3d(0, 100%, 0)')
  assert.equal(toSceneFit('cover'), 'cover')
  assert.equal(toSceneFit('contain'), 'contain')
  assert.equal(toSceneFit('center'), 'contain')
  assert.equal(toSceneFit('fill'), 'stretch')
  assert.equal(toSceneFit('unknown'), 'cover')
  assert.equal(normalizeMediaSource('https://example.com/a.jpg', 'image'), 'https://example.com/a.jpg')
  assert.equal(normalizeMediaSource('data:image/png;base64,AAA', 'image'), 'data:image/png;base64,AAA')
  assert.equal(normalizeMediaSource('file:///C:/foo.jpg', 'image'), null)
  assert.equal(normalizeMediaSource('javascript:alert(1)', 'image'), null)
})

test('liveSceneUrl and liveWebUrl encode signed loopback origin and localAssets flag', () => {
  const origin = 'http://127.0.0.1:41234'
  const sUrl = liveSceneUrl({ token: 'tok_1', mediaOrigin: origin, weAssetsAvailable: true }, { fit: 'fill', fps: 60, muted: true })
  assert.match(sUrl, /type=scene/)
  assert.match(sUrl, /fit=stretch/)
  assert.match(sUrl, /sceneFps=60/)
  assert.match(sUrl, /muted=true/)
  assert.match(sUrl, /localAssets=1/)

  const sNoAssets = liveSceneUrl({ token: 'tok_1', mediaOrigin: origin }, { fit: 'center' })
  assert.match(sNoAssets, /fit=contain/)
  assert.doesNotMatch(sNoAssets, /localAssets=/)

  const wUrl = liveWebUrl({ base: '/api/agy-skins/scene/files/dtok', mediaOrigin: origin }, 'sub/index.html', { fps: 30 })
  assert.match(wUrl, /type=web/)
  assert.match(wUrl, /sub%2Findex\.html/)
})

test('BackdropManager markLiveReady, applyOptionsToLayer, applyPoster, and retireLayer behavior', async () => {
  const mgr = new BackdropManager()
  const mockPosterChildren = []
  const posterNode = {
    style: { opacity: '1', transition: '' },
    childElementCount: 0,
    querySelectorAll: () => [],
    appendChild: el => { mockPosterChildren.push(el); posterNode.childElementCount = mockPosterChildren.length },
    replaceChildren: () => { mockPosterChildren.length = 0; posterNode.childElementCount = 0 }
  }
  const mediaNode = {
    style: { opacity: '' },
    childElementCount: 1,
    querySelectorAll: () => [],
    querySelector: () => null
  }
  const surfaceNode = { style: {} }
  const classes = new Set()
  const frameWin = { postMessage: () => {} }
  const frameNode = {
    style: { opacity: '0' },
    dataset: {},
    src: 'http://127.0.0.1:9/scene',
    contentWindow: frameWin
  }
  mediaNode.querySelector = sel => (sel === 'iframe' ? frameNode : null)

  const layer = {
    style: {},
    dataset: {},
    classList: { add: c => classes.add(c), contains: c => classes.has(c) },
    _surface: surfaceNode,
    _poster: posterNode,
    _media: mediaNode,
    remove: () => {}
  }

  mgr.currentOptions = { type: 'scene', opacity: 40, fit: 'cover', paused: false, sound: false, volume: 0, pauseOnBlur: false }
  mgr.layer = layer
  mgr.sceneIframe = frameNode

  // Opacity lives on _surface only, _media remains opacity 1 (no double-alpha bleed)
  mgr.applyOptionsToLayer(layer)
  assert.equal(surfaceNode.style.opacity, '0.4')
  assert.equal(mediaNode.style.opacity, '1')

  // Stats with fps > 0 promotes live frame and clears poster cleanly
  mgr.handleSceneMessage({
    source: frameWin,
    data: { source: 'agy-skins-scene', type: 'stats', fps: 28 }
  })
  assert.equal(mgr.liveReady, true)
  assert.equal(frameNode.style.opacity, '1')
  assert.equal(frameNode.dataset.ready, '1')
  assert.equal(layer.dataset.liveState, 'ready')
  assert.equal(classes.has('agy-skins-backdrop-live-ready'), true)

  // Wait for serial poster fade (950ms + 280ms)
  await new Promise(r => setTimeout(r, 1320))
  assert.equal(posterNode.style.opacity, '0')
  assert.equal(posterNode.childElementCount, 0)

  // retireLayer navigates iframe to about:blank cleanly
  mgr.retireLayer(layer)
  assert.equal(frameNode.src, 'about:blank')

  // applyPoster skips video and image wallpapers
  const prevDoc = globalThis.document
  globalThis.document = {
    createElement: tag => ({ tag, style: {}, src: '' })
  }
  try {
    mgr.applyPoster(layer, { type: 'video', webPreview: 'http://127.0.0.1:9/prev.gif' })
    assert.equal(posterNode.childElementCount, 0)
    mgr.applyPoster(layer, { type: 'image', webPreview: 'http://127.0.0.1:9/prev.jpg' })
    assert.equal(posterNode.childElementCount, 0)
    mgr.applyPoster(layer, { type: 'scene', fit: 'contain', webPreview: 'http://127.0.0.1:9/prev.jpg' })
    assert.equal(posterNode.childElementCount, 1)
    assert.match(mockPosterChildren[0].style.cssText, /object-fit:contain/)
  } finally {
    globalThis.document = prevDoc
  }
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
