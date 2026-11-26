const ROOT_ID = 'agy-skins-backdrop-root'
const LIVE_READY_CLASS = 'agy-skins-backdrop-live-ready'
const LIVE_FIRST_FRAME_MS = 60_000
const TRANSITION_BASE_MS = {
  cut: 0, fade: 1800, push: 700, wipe: 700, iris: 800, zoom: 900, bars: 800
}
const TRANSITION_SPEED_FACTOR = { fast: 0.6, normal: 1, slow: 1.6 }
const SCENE_FITS = { cover: 'cover', contain: 'contain', center: 'contain', fill: 'stretch', stretch: 'stretch' }
const BARS_TEETH = 9

export function toSceneFit(fit) {
  return SCENE_FITS[fit] || 'cover'
}

const clamp = (value, min, max, fallback) => {
  const n = Number(value)
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback
}

export function barsPolygon(direction, progress) {
  const horizontal = direction === 'left' || direction === 'right'
  const fromEnd = direction === 'left' || direction === 'up'
  const outer = fromEnd ? 1 : 0
  const inward = fromEnd ? -1 : 1
  const period = 1 / BARS_TEETH
  const depth = clamp(progress, 0, 1, 0)
  const spine = Math.min(0.004, depth)
  const slat = depth / BARS_TEETH
  const point = (a, t) => horizontal ? [outer + inward * a, t] : [t, outer + inward * a]
  const points = [point(0, 0)]
  for (let i = 0; i < BARS_TEETH; i++) {
    const start = i * period
    points.push(point(depth, start), point(depth, start + slat))
    if (i < BARS_TEETH - 1) points.push(point(spine, start + slat), point(spine, start + period))
  }
  points.push(point(spine, 1), point(0, 1))
  return `polygon(${points.map(([x, y]) => `${(x * 100).toFixed(2)}% ${(y * 100).toFixed(2)}%`).join(', ')})`
}

export function wipeInset(direction) {
  return {
    left: 'inset(0 100% 0 0)',
    right: 'inset(0 0 0 100%)',
    up: 'inset(100% 0 0 0)',
    down: 'inset(0 0 100% 0)'
  }[direction] || 'inset(0 100% 0 0)'
}

export function pushOffset(direction, incoming = true) {
  const sign = incoming ? 1 : -1
  return {
    left: `translate3d(${100 * sign}%, 0, 0)`,
    right: `translate3d(${-100 * sign}%, 0, 0)`,
    up: `translate3d(0, ${100 * sign}%, 0)`,
    down: `translate3d(0, ${-100 * sign}%, 0)`
  }[direction] || `translate3d(${100 * sign}%, 0, 0)`
}

export function liveSceneUrl(project, options = {}) {
  if (!project?.token) throw new Error('Scene project has no media token')
  const origin = project.mediaOrigin || options.origin || ''
  if (!origin) throw new Error('Scene media origin is unavailable')
  const params = new URLSearchParams({
    type: 'scene',
    fit: toSceneFit(options.fit),
    sceneFps: String(options.fps || 30),
    muted: options.muted ? 'true' : 'false',
    src: project.token,
    mediaBase: `${origin}/api/agy-skins/scene/files`
  })
  if (options.autoQuality === false) params.set('autoq', '0')
  if (Number(options.renderDpr) > 0) params.set('renderDpr', String(options.renderDpr))
  if (Number(options.videoTexScale) > 0) params.set('vidscale', String(options.videoTexScale))
  if (project?.weAssetsAvailable || options?.localAssets) params.set('localAssets', '1')
  return `${origin}/api/agy-skins/scene/live/index.html?${params.toString()}`
}

export function liveWebUrl(project, file, options = {}) {
  if (!project?.base) throw new Error('Web project has no media base')
  const origin = project.mediaOrigin || options.origin || ''
  if (!origin) throw new Error('Scene media origin is unavailable')
  const cleanFile = String(file || 'index.html').replace(/\\/g, '/').split('/').filter(Boolean).map(encodeURIComponent).join('/')
  const base = /^https?:\/\//i.test(project.base) ? project.base : `${origin}${project.base}`
  const params = new URLSearchParams({
    type: 'web',
    fit: toSceneFit(options.fit),
    sceneFps: String(options.fps || 30),
    muted: options.muted ? 'true' : 'false',
    src: `${base}/${cleanFile}`,
    mediaBase: `${origin}/api/agy-skins/scene/files`
  })
  if (options.autoQuality === false) params.set('autoq', '0')
  return `${origin}/api/agy-skins/scene/live/index.html?${params.toString()}`
}

export function normalizeMediaSource(input, type = 'image') {
  if (typeof input !== 'string' || !input.trim()) return null
  const source = input.trim()
  if (/^https?:\/\//i.test(source)) return source
  if (type === 'image' && /^data:image\/(svg\+xml|png|jpeg|webp|gif);/i.test(source)) return source
  return null
}

/**
 * Owns the wallpaper backdrop layers behind Antigravity, WebWallGL live iframe,
 * 7 switch transitions, pointer/wheel forwarding, power-pause policy, and the
 * Antigravity split-browser evenodd hole cutout.
 */
export class BackdropManager {
  constructor({ onMediaEnd = null, onVideoEnd = null } = {}) {
    this.root = null
    this.layers = null
    this.scrim = null
    this.layer = null
    this.previousLayer = null
    this.sceneIframe = null
    this.sceneProject = null
    this.sceneType = null
    this.liveReady = false
    this.liveFailed = false
    this.liveWatchdog = null
    this.liveStats = null
    this.currentKey = null
    this.currentOptions = null
    this.failedKeys = new Set()
    this.onVisibilityChange = null
    this.onMediaEnd = onMediaEnd || onVideoEnd
    this.pointerFrame = null
    this.pendingPointer = null
    this.pointerInitialized = false
    this.pauseReasons = new Set()
    this.battery = null
    this.lastMaskColor = null
    this.mediaSnapshot = null
    this.holeObserver = null
    this.holeResizeObserver = null
    this.observedHoleEl = null
    this.coldBootHandled = false
    this.bootDelayTimer = null
    this.lastPropSignature = ''
    this.lastPausedState = null

    this.handleSceneMessage = event => {
      if (!this.sceneIframe || event.source !== this.sceneIframe.contentWindow) return
      const data = event.data
      if (!data || data.source !== 'agy-skins-scene') return
      if (data.type === 'ready') {
        this.markLiveReady(this.layer, this.sceneIframe)
      } else if (data.type === 'error') {
        this.liveFailed = true
        if (this.liveWatchdog !== null) clearTimeout(this.liveWatchdog)
        this.liveWatchdog = null
        if (this.layer?.dataset) this.layer.dataset.liveState = 'error'
      } else if (data.type === 'stats') {
        this.liveStats = data
        if (!this.liveReady && Number(data.fps) > 0) {
          this.markLiveReady(this.layer, this.sceneIframe)
        }
      }
    }
    this.handleVisibility = () => {
      if (document.hidden) this.pointerLeave()
      this.syncPlayback()
      this.onVisibilityChange?.()
      if (!document.hidden) this.resumeDeferredLive()
    }
    this.handleFocus = () => {
      this.syncPlayback()
      this.onVisibilityChange?.()
      this.resumeDeferredLive()
    }
    this.handleBlur = () => {
      this.pointerLeave()
      this.syncPlayback()
      this.onVisibilityChange?.()
    }
    this.handleBattery = () => {
      this.syncPlayback()
      this.onVisibilityChange?.()
    }
  }

  ensureElements() {
    if (typeof document === 'undefined' || !document.body) return
    if (this.root?.isConnected) return
    this.root = document.getElementById(ROOT_ID) || document.createElement('div')
    this.root.id = ROOT_ID
    this.root.setAttribute('aria-hidden', 'true')
    this.root.style.cssText = 'position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden;contain:strict;'
    this.layers = document.createElement('div')
    this.layers.style.cssText = 'position:absolute;inset:0;overflow:hidden;will-change:transform;'
    this.scrim = document.createElement('div')
    this.scrim.style.cssText = 'position:absolute;inset:0;pointer-events:none;will-change:background-color;'
    this.root.replaceChildren(this.layers, this.scrim)
    document.body.prepend(this.root)
    this.ensureListeners()
    this.ensureHoleWatcher()
  }

  ensureListeners() {
    if (this.pointerInitialized || typeof window === 'undefined') return
    this.pointerInitialized = true
    this.onPointerMove = event => {
      if (!this.sceneIframe || this.liveFailed || document.hidden) return
      this.pendingPointer = {
        x: event.clientX, y: event.clientY, buttons: event.buttons || 0,
        mods: { shift: event.shiftKey, ctrl: event.ctrlKey, alt: event.altKey, meta: event.metaKey }
      }
      if (this.pointerFrame !== null) return
      this.pointerFrame = window.requestAnimationFrame(() => {
        this.pointerFrame = null
        const sample = this.pendingPointer
        this.pendingPointer = null
        if (sample) this.forwardPointer(sample, true)
      })
    }
    this.onPointerDown = event => {
      if (!this.sceneIframe || this.liveFailed) return
      this.forwardPointer({
        x: event.clientX, y: event.clientY, buttons: event.buttons || 0,
        mods: { shift: event.shiftKey, ctrl: event.ctrlKey, alt: event.altKey, meta: event.metaKey }
      }, true)
    }
    this.onPointerUp = this.onPointerDown
    this.onPointerLeave = () => this.pointerLeave()
    this.onWheel = event => {
      if (!this.sceneIframe || this.liveFailed) return
      this.postScene({
        type: 'wheel', dx: event.deltaX, dy: event.deltaY, mode: event.deltaMode,
        mods: { shift: event.shiftKey, ctrl: event.ctrlKey, alt: event.altKey, meta: event.metaKey }
      })
    }
    window.addEventListener('pointermove', this.onPointerMove, { passive: true, capture: true })
    window.addEventListener('pointerdown', this.onPointerDown, { passive: true, capture: true })
    window.addEventListener('pointerup', this.onPointerUp, { passive: true, capture: true })
    window.addEventListener('pointerleave', this.onPointerLeave)
    document.addEventListener('pointerleave', this.onPointerLeave)
    window.addEventListener('blur', this.handleBlur)
    window.addEventListener('focus', this.handleFocus)
    window.addEventListener('wheel', this.onWheel, { passive: true, capture: true })
    document.addEventListener('visibilitychange', this.handleVisibility)
    window.addEventListener('message', this.handleSceneMessage)
    if (typeof navigator !== 'undefined' && navigator.getBattery) {
      navigator.getBattery().then(battery => {
        this.battery = battery
        battery.addEventListener('chargingchange', this.handleBattery)
        battery.addEventListener('levelchange', this.handleBattery)
        this.syncPlayback()
      }).catch(() => {})
    }
  }

  ensureHoleWatcher() {
    if (typeof document === 'undefined' || typeof MutationObserver !== 'function' || this.holeObserver) return
    this.holeObserver = new MutationObserver(() => this.syncBrowserHole())
    this.holeObserver.observe(document.body, {
      attributes: true,
      attributeFilter: ['data-has-browser-hole', 'data-browser-hole'],
      childList: true,
      subtree: true
    })
    if (typeof ResizeObserver === 'function') {
      this.holeResizeObserver = new ResizeObserver(() => this.syncBrowserHole())
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', this.syncBrowserHoleBound = () => this.syncBrowserHole(), { passive: true })
    }
  }

  syncBrowserHole() {
    if (!this.root || typeof document === 'undefined') return
    if (this.currentOptions?.browserHoleCutout === false) {
      this.root.style.removeProperty('clip-path')
      return
    }
    const hasHole = document.body?.getAttribute('data-has-browser-hole') === 'true'
    const holeEl = hasHole ? document.querySelector('[data-browser-hole]:not([data-browser-hole="false"])') : null
    if (!holeEl) {
      this.observedHoleEl = null
      this.root.style.removeProperty('clip-path')
      return
    }
    if (this.holeResizeObserver && this.observedHoleEl !== holeEl) {
      this.holeResizeObserver.disconnect()
      this.holeResizeObserver.observe(holeEl)
      this.observedHoleEl = holeEl
    }
    const rect = holeEl.getBoundingClientRect?.()
    if (!rect || rect.width <= 1 || rect.height <= 1) {
      this.root.style.removeProperty('clip-path')
      return
    }
    const l = Math.max(0, Math.round(rect.left))
    const t = Math.max(0, Math.round(rect.top))
    const r = Math.max(l, Math.round(rect.right))
    const b = Math.max(t, Math.round(rect.bottom))
    this.root.style.clipPath = `polygon(evenodd, 0 0, 100% 0, 100% 100%, 0 100%, 0 0, ${l}px ${t}px, ${r}px ${t}px, ${r}px ${b}px, ${l}px ${b}px, ${l}px ${t}px)`
  }

  postScene(message) {
    try {
      this.sceneIframe?.contentWindow?.postMessage({ source: 'agy-skins-host', ...message }, '*')
    } catch {}
  }

  forwardPointer(sample, active) {
    const rect = this.sceneIframe?.getBoundingClientRect?.()
    if (!rect?.width || !rect?.height) return
    const u = Math.min(1, Math.max(0, (sample.x - rect.left) / rect.width))
    const v = Math.min(1, Math.max(0, (sample.y - rect.top) / rect.height))
    const inside = active && sample.x >= rect.left && sample.x <= rect.right &&
      sample.y >= rect.top && sample.y <= rect.bottom
    this.postScene({ type: 'pointer', u, v, buttons: inside ? sample.buttons : 0, mods: sample.mods })
  }

  pointerLeave() {
    if (this.pointerFrame !== null) window.cancelAnimationFrame(this.pointerFrame)
    this.pointerFrame = null
    this.pendingPointer = null
    this.postScene({ type: 'pointer-leave' })
  }

  setMediaSnapshot(media) {
    this.mediaSnapshot = media && typeof media === 'object' ? media : null
    this.pushMediaSnapshot()
  }

  pushMediaSnapshot() {
    if (!this.sceneIframe) return
    const media = this.mediaSnapshot
    if (!media?.ok) {
      this.postScene({ type: 'command', command: 'setMedia', args: [null] })
      return
    }
    const status = String(media.playing || '').toLowerCase()
    this.postScene({
      type: 'command',
      command: 'setMedia',
      args: [{
        hasMedia: true,
        title: media.title || '',
        artist: media.artist || '',
        album: media.album || '',
        playing: status === 'playing',
        state: status === 'playing' ? 1 : status === 'paused' ? 2 : 0,
        position: Number(media.position) || 0,
        duration: Number(media.duration) || 0
      }]
    })
  }

  update(options) {
    const {
      enabled, type = 'image', src, scenePayload = null,
      webPreview = null, blur = 0, occlusion = 25,
      isDark = true, mode = 'live', fit = 'cover', opacity = 100,
      pauseOnHidden = true, pauseOnBlur = false, pauseOnBattery = false,
      sound = false, volume = 100, playbackRate = 1,
      sceneLive = true, sceneLiveFps = 30, sceneAutoQuality = true,
      sceneRenderDpr = 0, sceneVideoTexScale = 0, liveBootDelay = 0,
      slides = null, slideIntervalMs = null,
      transition = 'cut', transitionDir = 'left', transitionSpeed = 'normal',
      brightness = 100, contrast = 100, saturate = 100, flip = false,
      layerPositionX = 50, layerPositionY = 50, layerScale = 100,
      loop = true, userProps = null, sceneProps = null, browserHoleCutout = true,
      paused = false
    } = options

    const source = (type === 'scene' || type === 'web')
      ? (scenePayload?.token ? scenePayload.dir : null)
      : (enabled ? normalizeMediaSource(src, type) : null)

    if (!enabled || !source) {
      this.hide()
      return false
    }

    const liveDesired = (type === 'scene' || type === 'web') && mode !== 'frame' && sceneLive !== false
    const liveKeyTag = liveDesired ? (scenePayload?.weAssetsAvailable ? 'live-la' : 'live') : 'frame'
    const key = (type === 'scene' || type === 'web')
      ? `${type}:${source}:${liveKeyTag}`
      : `${type}:${source}:${mode === 'frame' ? 'frame' : 'live'}`
    if (this.failedKeys.has(key)) {
      this.hide()
      return false
    }

    this.ensureElements()
    if (!this.root) return false
    this.root.style.display = 'block'
    this.root.style.backgroundColor = isDark ? '#0a0a0c' : '#ffffff'
    document.body?.setAttribute?.('data-agy-skins-wallpaper', 'true')

    this.currentOptions = {
      type, src: source, scenePayload, webPreview, blur, occlusion, isDark, mode,
      fit, opacity, pauseOnHidden, pauseOnBlur, pauseOnBattery, sound, volume,
      playbackRate, sceneLive, sceneLiveFps, sceneAutoQuality, sceneRenderDpr,
      sceneVideoTexScale, liveBootDelay, slides, slideIntervalMs, transition,
      transitionDir, transitionSpeed, brightness, contrast, saturate, flip,
      layerPositionX, layerPositionY, layerScale, loop, userProps, sceneProps,
      browserHoleCutout, paused: Boolean(paused)
    }

    this.updateScrim(isDark, occlusion)
    this.syncBrowserHole()

    if (key === this.currentKey && this.layer) {
      this.applyOptionsToLayer(this.layer)
      this.applyLiveOptions(false)
      this.syncPlayback()
      return true
    }

    this.currentKey = key
    this.buildNextLayer(this.currentOptions, key)
    return true
  }

  updateScrim(isDark, occlusion) {
    const alpha = clamp(occlusion, 0, 100, 25) / 100
    const color = isDark ? `rgba(0,0,0,${alpha})` : `rgba(255,255,255,${alpha})`
    if (this.lastMaskColor !== color) this.scrim.style.backgroundColor = color
    this.lastMaskColor = color
  }

  buildLayer() {
    const layer = document.createElement('div')
    layer.className = 'agy-skins-backdrop-layer'
    layer.style.cssText = 'position:absolute;inset:0;overflow:hidden;opacity:0;'
    const surface = document.createElement('div')
    surface.className = 'agy-skins-backdrop-surface'
    surface.style.cssText = 'position:absolute;inset:0;transform-origin:center;'
    const poster = document.createElement('div')
    poster.className = 'agy-skins-backdrop-poster'
    poster.style.cssText = 'position:absolute;inset:0;background-size:cover;background-position:center;background-repeat:no-repeat;'
    const media = document.createElement('div')
    media.className = 'agy-skins-backdrop-media'
    media.style.cssText = 'position:absolute;inset:0;overflow:hidden;'
    surface.appendChild(poster)
    surface.appendChild(media)
    layer.appendChild(surface)
    layer._surface = surface
    layer._poster = poster
    layer._media = media
    return layer
  }

  applyOptionsToLayer(layer) {
    const options = this.currentOptions
    const blur = clamp(options.blur, 0, 60, 0)
    const brightness = clamp(options.brightness, 40, 160, 100)
    const contrast = clamp(options.contrast, 40, 200, 100)
    const saturate = clamp(options.saturate, 0, 200, 100)
    const posX = clamp(options.layerPositionX, 0, 100, 50)
    const posY = clamp(options.layerPositionY, 0, 100, 50)
    const layerScalePct = clamp(options.layerScale, 50, 150, 100)
    const opacityPct = clamp(options.opacity, 0, 100, 100)
    const objectFit = options.fit === 'center' ? 'none' : (options.fit || 'cover')
    const sound = Boolean(options.sound)
    const volumePct = clamp(options.volume, 0, 100, 100)
    const playbackRate = clamp(options.playbackRate, 0.25, 2, 1)
    const loop = options.loop !== false
    const media = layer._media
    const posterCount = layer._poster?.childElementCount ?? 0
    const optKey = `${blur}|${brightness}|${contrast}|${saturate}|${posX}|${posY}|${layerScalePct}|${Boolean(options.flip)}|${opacityPct}|${objectFit}|${sound}|${volumePct}|${playbackRate}|${loop}|${media.childElementCount}|${posterCount}`
    if (layer._lastOptKey === optKey) return
    layer._lastOptKey = optKey

    const surface = layer._surface
    const filters = []
    if (blur > 0) filters.push(`blur(${blur}px)`)
    if (brightness !== 100) filters.push(`brightness(${brightness}%)`)
    if (contrast !== 100) filters.push(`contrast(${contrast}%)`)
    if (saturate !== 100) filters.push(`saturate(${saturate}%)`)
    surface.style.filter = filters.length ? filters.join(' ') : 'none'
    surface.style.inset = blur > 0 ? `-${blur + 8}px` : '0'
    const x = (50 - posX) / 2
    const y = (50 - posY) / 2
    const scale = layerScalePct / 100
    const flip = options.flip ? ' scaleX(-1)' : ''
    layer.style.transform = 'none'
    surface.style.transform = `translate3d(${x.toFixed(2)}%, ${y.toFixed(2)}%, 0) scale(${scale.toFixed(3)})${flip}`
    surface.style.opacity = String(opacityPct / 100)
    media.style.opacity = '1'
    for (const posterImg of (layer._poster?.querySelectorAll?.('img') || [])) {
      posterImg.style.objectFit = objectFit
      posterImg.style.objectPosition = 'center'
    }
    for (const image of media.querySelectorAll('img')) {
      image.style.objectFit = objectFit
      image.style.objectPosition = 'center'
    }
    const video = media.querySelector('video')
    if (video) {
      video.style.objectFit = objectFit
      video.style.objectPosition = 'center'
      video.muted = !sound
      video.volume = volumePct / 100
      video.playbackRate = playbackRate
      video.loop = loop
    }
  }

  buildNextLayer(options, key) {
    const next = this.buildLayer()
    this.applyPoster(next, options)
    this.appendContent(next, options, key)
    this.applyOptionsToLayer(next)
    this.transitionTo(next, options, key)
  }

  applyPoster(layer, options) {
    if (options.type === 'image' || options.type === 'video') return
    const url = options.webPreview
    if (!url || !/^https?:\/\//i.test(url)) return
    const fit = options.fit === 'center' ? 'none' : (options.fit || 'cover')
    const image = document.createElement('img')
    image.alt = ''
    image.style.cssText = `position:absolute;inset:0;width:100%;height:100%;object-fit:${fit};object-position:center;display:block;`
    image.onerror = () => image.remove()
    image.src = url
    layer._poster.appendChild(image)
  }

  appendContent(layer, options, key) {
    if (options.type === 'scene' || options.type === 'web') {
      if (options.mode !== 'frame' && options.sceneLive) {
        if (document.hidden) {
          layer.dataset.liveState = 'deferred'
          return
        }
        const delayMs = !this.coldBootHandled && Number(options.liveBootDelay) > 0
          ? Math.min(30_000, Number(options.liveBootDelay) * 1000)
          : 0
        this.coldBootHandled = true
        if (delayMs > 0) {
          layer.dataset.liveState = 'boot-delay'
          if (this.bootDelayTimer !== null) clearTimeout(this.bootDelayTimer)
          this.bootDelayTimer = setTimeout(() => {
            this.bootDelayTimer = null
            if (this.currentKey === key && this.layer === layer) {
              this.showLive(layer, this.currentOptions, key)
            }
          }, delayMs)
        } else {
          this.showLive(layer, options, key)
        }
      }
      return
    }
    this.coldBootHandled = true
    if (options.type === 'video') {
      this.showVideo(layer, options, key)
      return
    }
    this.showImage(layer, options, key)
  }

  showImage(layer, options, key) {
    if (Array.isArray(options.slides) && options.slides.length > 1) {
      const wrap = document.createElement('div')
      wrap.style.cssText = 'position:absolute;inset:0;overflow:hidden;'
      const first = document.createElement('img')
      const second = document.createElement('img')
      const fit = options.fit === 'center' ? 'none' : options.fit
      for (const image of [first, second]) {
        image.alt = ''
        image.style.cssText = `position:absolute;inset:0;width:100%;height:100%;object-fit:${fit};object-position:center;display:block;transition:opacity 800ms ease;`
        wrap.appendChild(image)
      }
      first.src = options.slides[0]
      first.style.opacity = '1'
      second.style.opacity = '0'
      layer._media.appendChild(wrap)
      let index = 0
      const interval = clamp(options.slideIntervalMs, 1000, 24 * 60 * 60 * 1000, 60_000)
      layer._slideTimer = setInterval(() => {
        if (this.currentKey !== key) return
        index += 1
        const incoming = index % 2 === 0 ? first : second
        const outgoing = index % 2 === 0 ? second : first
        incoming.onload = () => {
          if (this.currentKey !== key) return
          incoming.style.opacity = '1'
          outgoing.style.opacity = '0'
        }
        incoming.src = options.slides[index % options.slides.length]
      }, interval)
      return
    }
    const image = document.createElement('img')
    image.alt = ''
    const fit = options.fit === 'center' ? 'none' : options.fit
    image.style.cssText = `width:100%;height:100%;object-fit:${fit};object-position:center;display:block;`
    image.onerror = () => this.fail(key)
    image.src = options.src
    layer._media.appendChild(image)
  }

  showVideo(layer, options, key) {
    const video = document.createElement('video')
    video.autoplay = true
    video.loop = options.loop !== false
    video.playsInline = true
    video.preload = 'auto'
    video.muted = !options.sound
    video.volume = clamp(options.volume, 0, 100, 100) / 100
    video.playbackRate = clamp(options.playbackRate, 0.25, 2, 1)
    const fit = options.fit === 'center' ? 'none' : options.fit
    video.style.cssText = `width:100%;height:100%;object-fit:${fit};object-position:center;display:block;`
    video.onerror = () => this.fail(key)
    video.onended = () => {
      if (this.currentKey === key && options.loop === false) this.onMediaEnd?.()
    }
    video.src = options.src
    layer._media.appendChild(video)
    if (options.mode === 'frame') {
      video.addEventListener('loadeddata', () => {
        if (this.currentKey !== key) return
        try {
          const canvas = document.createElement('canvas')
          const scale = Math.min(1, 1920 / Math.max(video.videoWidth, video.videoHeight))
          canvas.width = Math.max(1, Math.round(video.videoWidth * scale))
          canvas.height = Math.max(1, Math.round(video.videoHeight * scale))
          canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height)
          const image = document.createElement('img')
          image.src = canvas.toDataURL('image/jpeg', 0.9)
          image.style.cssText = `width:100%;height:100%;object-fit:${fit};object-position:center;display:block;`
          if (this.currentKey === key) layer._media.replaceChildren(image)
        } catch {}
        finally { video.pause() }
      }, { once: true })
    }
    void video.play().catch(error => {
      if (error?.name === 'AbortError' || error?.name === 'NotAllowedError') return
      if (this.currentKey === key) this.fail(key)
    })
  }

  showLive(layer, options, key) {
    if (document.hidden) {
      layer.dataset.liveState = 'deferred'
      return
    }
    const project = options.scenePayload
    if (!project?.token) {
      this.liveFailed = true
      layer.dataset.liveState = 'error:no-token'
      return
    }
    this.liveReady = false
    this.liveFailed = false
    this.lastPausedState = null
    this.lastPropSignature = ''
    this.sceneProject = project
    this.sceneType = options.type
    if (layer._poster) {
      layer._poster.style.transition = ''
      layer._poster.style.opacity = '1'
    }
    const muted = !options.sound || clamp(options.volume, 0, 100, 100) <= 0
    const url = options.type === 'scene'
      ? liveSceneUrl(project, {
          fit: options.fit, fps: options.sceneLiveFps, muted,
          autoQuality: options.sceneAutoQuality, renderDpr: options.sceneRenderDpr,
          videoTexScale: options.sceneVideoTexScale
        })
      : liveWebUrl(project, project.file || 'index.html', {
          fit: options.fit, fps: options.sceneLiveFps, muted,
          autoQuality: options.sceneAutoQuality
        })
    const frame = document.createElement('iframe')
    frame.setAttribute('sandbox', 'allow-scripts allow-same-origin')
    frame.setAttribute('allow', 'autoplay; fullscreen')
    frame.setAttribute('aria-hidden', 'true')
    frame.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;border:0;background:transparent;opacity:0;transition:opacity 900ms ease;'
    frame.onload = () => {
      if (this.sceneIframe !== frame) return
      this.applyLiveOptions(true)
    }
    this.sceneIframe = frame
    if (this.liveWatchdog !== null) clearTimeout(this.liveWatchdog)
    this.liveWatchdog = setTimeout(() => {
      this.liveWatchdog = null
      if (this.sceneIframe !== frame || this.liveReady) return
      this.liveFailed = true
    }, LIVE_FIRST_FRAME_MS)
    frame.src = url
    layer._media.appendChild(frame)
    layer.dataset.liveState = 'framed'
  }

  markLiveReady(layer, frame) {
    if (!layer || !frame) return
    if (this.liveReady && frame.dataset?.ready === '1') return
    this.liveReady = true
    this.liveFailed = false
    if (frame.dataset) frame.dataset.ready = '1'
    if (this.liveWatchdog !== null) clearTimeout(this.liveWatchdog)
    this.liveWatchdog = null
    if (frame.style) frame.style.opacity = '1'
    if (layer.dataset) layer.dataset.liveState = 'ready'
    layer.classList?.add(LIVE_READY_CLASS)

    if (layer._posterTimer) { clearTimeout(layer._posterTimer); layer._posterTimer = null }
    if (layer._posterCleanTimer) { clearTimeout(layer._posterCleanTimer); layer._posterCleanTimer = null }
    if (layer._poster) {
      layer._posterTimer = setTimeout(() => {
        layer._posterTimer = null
        if (this.layer !== layer || !this.liveReady || this.liveFailed || !layer._poster) return
        layer._poster.style.transition = 'opacity 260ms ease'
        layer._poster.style.opacity = '0'
        layer._posterCleanTimer = setTimeout(() => {
          layer._posterCleanTimer = null
          if (this.layer !== layer || !this.liveReady || this.liveFailed) return
          layer._poster?.replaceChildren?.()
        }, 280)
      }, 950)
    }

    this.applyLiveOptions(true)
    this.pushMediaSnapshot()
    this.lastPausedState = null
    this.syncPlayback()
  }

  resumeDeferredLive() {
    if (!this.layer || !this.currentOptions || this.layer.dataset.liveState !== 'deferred') return
    this.showLive(this.layer, this.currentOptions, this.currentKey)
  }

  applyLiveOptions(forceProps = false) {
    if (!this.sceneIframe || !this.currentOptions) return
    const options = this.currentOptions
    const volume = options.sound ? clamp(options.volume, 0, 100, 100) / 100 : 0
    this.postScene({ type: 'command', command: 'setFit', args: [toSceneFit(options.fit)] })
    this.postScene({ type: 'command', command: 'setSceneFps', args: [Number(options.sceneLiveFps) || 30] })
    this.postScene({ type: 'command', command: 'setRenderDpr', args: [Number(options.sceneRenderDpr) || 0] })
    this.postScene({ type: 'command', command: 'setVolume', args: [volume] })
    this.postScene({ type: 'command', command: 'setQuality', args: [{ autoQuality: options.sceneAutoQuality !== false }] })
    const props = options.sceneProps || options.userProps
    if (props && typeof props === 'object') {
      const keys = Object.keys(props)
      if (keys.length > 0) {
        const propJson = JSON.stringify(props)
        if (forceProps || propJson !== this.lastPropSignature) {
          this.lastPropSignature = propJson
          this.postScene({ type: 'command', command: 'updateWebProps', args: [props] })
        }
      }
    }
  }

  syncPlayback() {
    if (!this.currentOptions) return
    const reasons = new Set()
    if (this.currentOptions.paused === true) reasons.add('user')
    if (this.currentOptions.pauseOnHidden !== false && typeof document !== 'undefined' && document.hidden) reasons.add('hidden')
    const hostFocused = typeof document === 'undefined' ||
      typeof document.hasFocus !== 'function' ||
      document.hasFocus() ||
      document.activeElement?.tagName === 'IFRAME'
    if (this.currentOptions.pauseOnBlur === true && !hostFocused) reasons.add('blur')
    if (this.currentOptions.pauseOnBattery === true && this.battery && this.battery.charging === false) reasons.add('battery')
    const paused = reasons.size > 0
    this.pauseReasons = reasons
    const video = this.layer?._media?.querySelector('video')
    if (video) {
      if (paused && !video.paused) video.pause()
      else if (!paused && video.paused && this.currentOptions.mode !== 'frame') void video.play().catch(() => {})
    }
    if (this.sceneIframe && this.liveReady === true && paused !== this.lastPausedState) {
      this.lastPausedState = paused
      this.postScene({ type: 'command', command: paused ? 'pause' : 'resume' })
    }
  }

  transitionDuration(options) {
    const base = TRANSITION_BASE_MS[options.transition] ?? TRANSITION_BASE_MS.fade
    const factor = TRANSITION_SPEED_FACTOR[options.transitionSpeed] ?? 1
    return Math.round(base * factor)
  }

  transitionTo(next, options, key) {
    const prev = this.layer
    if (this.previousLayer && this.previousLayer !== prev) this.retireLayer(this.previousLayer)
    this.previousLayer = prev
    this.layer = next
    const duration = prev ? this.transitionDuration(options) : 0
    const dir = options.transitionDir || 'left'
    const kind = options.transition || 'cut'

    if (duration <= 0 || kind === 'cut') {
      next.style.opacity = '1'
      this.layers.appendChild(next)
      if (prev) this.retireLayer(prev)
      this.previousLayer = null
      this.syncPlayback()
      return
    }

    if (kind === 'push') {
      next.style.opacity = '1'
      next.style.transform = pushOffset(dir, true)
      next.style.transition = `transform ${duration}ms cubic-bezier(0.22, 1, 0.36, 1)`
      this.layers.appendChild(next)
      if (prev) prev.style.transition = `transform ${duration}ms cubic-bezier(0.22, 1, 0.36, 1)`
      requestAnimationFrame(() => {
        if (this.currentKey !== key) return
        next.style.transform = 'translate3d(0, 0, 0)'
        if (prev) prev.style.transform = pushOffset(dir, false)
      })
    } else if (kind === 'wipe') {
      next.style.opacity = '1'
      next.style.clipPath = wipeInset(dir)
      next.style.transition = `clip-path ${duration}ms cubic-bezier(0.22, 1, 0.36, 1)`
      this.layers.appendChild(next)
      requestAnimationFrame(() => {
        if (this.currentKey !== key) return
        next.style.clipPath = 'inset(0 0 0 0)'
      })
    } else if (kind === 'iris') {
      next.style.opacity = '1'
      next.style.clipPath = 'circle(0% at 50% 50%)'
      next.style.transition = `clip-path ${duration}ms cubic-bezier(0.22, 1, 0.36, 1)`
      this.layers.appendChild(next)
      requestAnimationFrame(() => {
        if (this.currentKey !== key) return
        next.style.clipPath = 'circle(150% at 50% 50%)'
      })
    } else if (kind === 'zoom') {
      next.style.opacity = '0'
      next.style.transform = 'scale(1.12)'
      next.style.transition = `opacity ${duration}ms ease, transform ${duration}ms cubic-bezier(0.22, 1, 0.36, 1)`
      this.layers.appendChild(next)
      requestAnimationFrame(() => {
        if (this.currentKey !== key) return
        next.style.opacity = '1'
        next.style.transform = 'scale(1)'
      })
    } else if (kind === 'bars') {
      next.style.opacity = '1'
      next.style.clipPath = barsPolygon(dir, 0)
      this.layers.appendChild(next)
      const started = performance.now()
      const step = now => {
        if (this.currentKey !== key || this.layer !== next) return
        const p = Math.min(1, (now - started) / duration)
        const eased = 1 - Math.pow(1 - p, 3)
        next.style.clipPath = barsPolygon(dir, eased)
        if (p < 1) requestAnimationFrame(step)
        else next.style.clipPath = 'none'
      }
      requestAnimationFrame(step)
    } else {
      next.style.opacity = '0'
      next.style.transition = `opacity ${duration}ms ease`
      this.layers.appendChild(next)
      requestAnimationFrame(() => {
        if (this.currentKey !== key) return
        next.style.opacity = '1'
      })
    }

    setTimeout(() => {
      if (prev && prev !== this.layer) this.retireLayer(prev)
      if (this.previousLayer === prev) this.previousLayer = null
    }, duration + 60)
    this.syncPlayback()
  }

  retireLayer(layer) {
    if (!layer) return
    if (layer._slideTimer) clearInterval(layer._slideTimer)
    if (layer._posterTimer) { clearTimeout(layer._posterTimer); layer._posterTimer = null }
    if (layer._posterCleanTimer) { clearTimeout(layer._posterCleanTimer); layer._posterCleanTimer = null }
    const frame = layer._media?.querySelector('iframe')
    if (frame) {
      if (frame === this.sceneIframe) this.sceneIframe = null
      try { frame.contentWindow?.postMessage({ source: 'agy-skins-host', type: 'command', command: 'destroy' }, '*') } catch {}
      try { frame.src = 'about:blank' } catch {}
    }
    const video = layer._media?.querySelector('video')
    if (video) {
      try { video.pause(); video.removeAttribute('src'); video.load() } catch {}
    }
    layer.remove()
  }

  fail(key) {
    this.failedKeys.add(key)
    if (this.currentKey === key) this.hide()
  }

  hide() {
    if (this.bootDelayTimer !== null) clearTimeout(this.bootDelayTimer)
    this.bootDelayTimer = null
    if (this.liveWatchdog !== null) clearTimeout(this.liveWatchdog)
    this.liveWatchdog = null
    if (this.previousLayer) {
      this.retireLayer(this.previousLayer)
      this.previousLayer = null
    }
    if (this.layer) {
      this.retireLayer(this.layer)
      this.layer = null
    }
    this.currentKey = null
    this.sceneIframe = null
    this.lastPropSignature = ''
    this.lastPausedState = null
    if (typeof document !== 'undefined') {
      document.body?.removeAttribute?.('data-agy-skins-wallpaper')
    }
    if (this.root) {
      this.root.style.display = 'none'
      this.root.style.removeProperty('clip-path')
    }
  }

  destroy() {
    this.hide()
    if (this.pointerInitialized && typeof window !== 'undefined') {
      window.removeEventListener('pointermove', this.onPointerMove, { capture: true })
      window.removeEventListener('pointerdown', this.onPointerDown, { capture: true })
      window.removeEventListener('pointerup', this.onPointerUp, { capture: true })
      window.removeEventListener('pointerleave', this.onPointerLeave)
      document.removeEventListener('pointerleave', this.onPointerLeave)
      window.removeEventListener('blur', this.handleBlur)
      window.removeEventListener('focus', this.handleFocus)
      window.removeEventListener('wheel', this.onWheel, { capture: true })
      document.removeEventListener('visibilitychange', this.handleVisibility)
      window.removeEventListener('message', this.handleSceneMessage)
      if (this.holeResizeObserver) this.holeResizeObserver.disconnect()
      if (this.holeObserver) this.holeObserver.disconnect()
      if (this.syncBrowserHoleBound) window.removeEventListener('resize', this.syncBrowserHoleBound)
    }
    this.root?.remove()
    this.root = null
    this.layers = null
    this.scrim = null
  }
}
