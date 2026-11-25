import { existsSync, readFileSync, realpathSync } from 'node:fs'
import { homedir, release } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { createSettingsStore } from './settings_store.mjs'
import { createMediaServer } from './media_server.mjs'
import { scanWallpaperEngine, readWallpaperProject } from './we_scanner.mjs'
import {
  clearCacheDir,
  directorySize,
  importBingWallpaper,
  importLocalFiles,
  importUrlWallpaper,
  listUploads,
  pickFolderDialog,
  pickMediaFilesDialog,
  queryNowPlaying,
  removeUploadFile,
  scanSystemFonts,
  tailFile
} from './system_services.mjs'
import { WallpaperRotation } from './rotation.mjs'
import { createCdpNoticeManager } from './cdp_notice.mjs'
import { startCdpInjector } from './cdp_injector.mjs'
import { startLsWatchdog } from './ls_watchdog.mjs'
import { startSelfReloadWatcher } from './reload.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PLUGIN_ROOT = resolve(__dirname, '..', '..')
const DIST_DIR = join(__dirname, 'dist')
const RUNTIME_BUNDLE_PATH = join(DIST_DIR, 'runtime.js')
const PANEL_JS_PATH = join(DIST_DIR, 'panel.js')
const PANEL_CSS_PATH = join(DIST_DIR, 'panel.css')
const INSTANCE_TS = Date.now()

export function installEpipeGuard(proc = process) {
  const isEpipe = err => err?.code === 'EPIPE'
  for (const stream of [proc.stdout, proc.stderr]) {
    stream?.on?.('error', err => { if (!isEpipe(err)) throw err })
  }
  const fatal = err => {
    if (isEpipe(err)) return
    try { console.error('[agy-skins] fatal:', err) } catch {}
    proc.exit(1)
  }
  proc.on('uncaughtException', fatal)
  proc.on('unhandledRejection', fatal)
}

function readPluginVersion() {
  try {
    const manifest = JSON.parse(readFileSync(join(PLUGIN_ROOT, 'plugin.json'), 'utf8'))
    return manifest.version || '1.0.0'
  } catch {
    return '1.0.0'
  }
}

function detectSystemLocale(env = process.env) {
  const raw = env.LC_ALL || env.LC_MESSAGES || env.LANG || ''
  if (raw && /^[a-z]{2}/i.test(raw)) return raw.replace(/\..*$/, '').replace('_', '-')
  try {
    const resolved = Intl.DateTimeFormat().resolvedOptions().locale
    if (resolved) return resolved
  } catch {}
  return 'zh-CN'
}

function buildPanelHtml({ mode = 'aux', studioToken = '', systemLocale = 'zh-CN', initialLang = 'auto', embed = '' } = {}) {
  const cssHref = mode === 'studio' ? `/studio/${studioToken}/panel.css` : '/panel.css'
  const jsSrc = mode === 'studio' ? `/studio/${studioToken}/panel.js` : '/panel.js'
  const preloadTag = mode === 'aux' ? '<script src="/preload.js"></script>' : ''
  const isZh = initialLang === 'zh' || (initialLang === 'auto' && /^zh/i.test(String(systemLocale || '')))
  const htmlLang = isZh ? 'zh-CN' : 'en'
  const bootstrap = `window.__AGY_SKINS_HOST_MODE__=${JSON.stringify(mode)};window.__AGY_SKINS_STUDIO_TOKEN__=${JSON.stringify(studioToken)};window.__AGY_SKINS_SYSTEM_LOCALE__=${JSON.stringify(systemLocale)};window.__AGY_SKINS_EMBED_MODE__=${JSON.stringify(embed)};`
  return `<!doctype html>
<html lang="${htmlLang}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Antigravity Wallpaper Engine</title>
  <link rel="stylesheet" href="${cssHref}" />
</head>
<body data-embed="${embed}">
  <div id="agy-skins-root"></div>
  <script>${bootstrap}</script>
  ${preloadTag}
  <script type="module" src="${jsSrc}"></script>
</body>
</html>`
}

async function resolveSidecarSdk() {
  try {
    return await import('sidecar_sdk')
  } catch {
    const fallback = join(homedir(), '.gemini', 'config', 'node_modules', 'sidecar_sdk', 'index.mjs')
    if (existsSync(fallback)) {
      return await import(pathToFileURL(fallback).href)
    }
    throw new Error('sidecar_sdk module not found')
  }
}

export function buildResolvedWallpaper(config, mediaServer) {
  const source = config.wallpaperSource
  const type = config.wallpaperType
  const sel = config.weSelection
  const mediaOrigin = mediaServer.origin

  let resolvedSrc = ''
  let scenePayload = null
  let previewUrl = null
  let slides = []

  if (type === 'scene' || type === 'web') {
    const dir = sel?.dir || (/^(?:[A-Za-z]:[\\/]|\/)/.test(source) ? source : null)
    if (dir && existsSync(dir)) {
      const file = sel?.properties ? undefined : undefined
      scenePayload = mediaServer.sceneOpenPayload(dir, {
        type,
        title: sel?.title || '',
        file: sel?.file || '',
        preview: sel?.previewPath || null
      })
      resolvedSrc = dir
    }
  } else if (type === 'video' || type === 'image') {
    if (/^https?:\/\//i.test(source) || /^data:image\//i.test(source)) {
      resolvedSrc = source
    } else if (/^(?:[A-Za-z]:[\\/]|\/)/.test(source)) {
      resolvedSrc = mediaServer.fileUrl(source) || ''
    } else if (/^file:\/\/\//i.test(source)) {
      try {
        let local = decodeURIComponent(new URL(source).pathname)
        if (/^\/[A-Za-z]:/.test(local)) local = local.slice(1)
        resolvedSrc = mediaServer.fileUrl(local) || ''
      } catch {}
    }
    if (type === 'image' && Array.isArray(sel?.slides) && sel.slides.length) {
      slides = sel.slides.map(p => mediaServer.fileUrl(p)).filter(Boolean)
    }
  }

  if (sel?.previewPath && existsSync(sel.previewPath)) {
    previewUrl = mediaServer.fileUrl(sel.previewPath)
  } else if (type === 'image' && resolvedSrc) {
    previewUrl = resolvedSrc
  }

  return {
    mediaOrigin,
    resolvedSrc,
    scenePayload,
    previewUrl,
    slides
  }
}

export async function startRuntime(options = {}) {
  const env = options.env || process.env
  const standalone = options.standalone ?? process.argv.includes('--standalone')
  const store = createSettingsStore({ dataDir: options.dataDir, env })
  if (store.getConfig().startPaused === true && store.getConfig().wallpaperEnabled === true) {
    store.updateConfig({ wallpaperPaused: true }, { deferPersistence: true })
  }
  const cdpNotice = createCdpNoticeManager({ env })
  const secret = store.getMediaSecret()

  let injector = null
  let rotation = null
  let nowPlayingCache = null
  let discoveredSlots = []

  async function applyLibraryItem(item) {
    if (!item || typeof item !== 'object') throw new Error('Invalid wallpaper item')
    let source = item.mediaPath
    let type = item.mediaType
    let framePath = null
    let staticFallback = Boolean(item.staticFallback)
    let file = ''

    if (item.kind === 'scene' || item.kind === 'web') {
      const proj = await readWallpaperProject(item.dir, item.source || 'workshop')
      if (!proj) throw new Error('Wallpaper project directory or project.json is invalid')
      source = item.dir
      type = item.kind
      framePath = item.kind === 'scene' ? (item.previewPath || null) : null
      staticFallback = false
      if (item.kind === 'web') {
        try {
          const pj = JSON.parse(readFileSync(join(item.dir, 'project.json'), 'utf8').replace(/^\uFEFF/, ''))
          file = String(pj.file || 'index.html')
        } catch {
          file = 'index.html'
        }
      }
    }

    return store.updateConfig({
      wallpaperEnabled: true,
      wallpaperType: type,
      wallpaperSource: source,
      weSelection: {
        id: item.id,
        title: item.title,
        kind: item.kind,
        source: item.source || '',
        staticFallback,
        dir: item.dir,
        manifestPath: null,
        framePath,
        previewPath: item.previewPath || null,
        slides: Array.isArray(item.slides) ? item.slides : [],
        slideIntervalMs: Number.isFinite(Number(item.slideIntervalMs)) ? Number(item.slideIntervalMs) : null,
        properties: Array.isArray(item.properties) ? item.properties : [],
        file
      }
    })
  }

  async function openSceneProject(body = {}) {
    const dir = body.dir
    if (typeof dir !== 'string' || !dir || !existsSync(dir)) {
      return { ok: false, error: 'valid Wallpaper Engine project directory not found' }
    }
    try {
      const raw = JSON.parse(readFileSync(join(dir, 'project.json'), 'utf8').replace(/^\uFEFF/, ''))
      return mediaServer.sceneOpenPayload(dir, raw)
    } catch {
      return { ok: false, error: 'project.json is missing or invalid' }
    }
  }

  function hydrateWeItems(items) {
    return (Array.isArray(items) ? items : []).map(item => {
      if (!item || typeof item !== 'object') return item
      let previewPath = item.previewPath
      if (!previewPath && item.mediaType === 'image' && item.mediaPath) {
        previewPath = item.mediaPath
      }
      const previewUrl = previewPath && existsSync(previewPath)
        ? mediaServer.fileUrl(previewPath)
        : (item.mediaType === 'image' && item.mediaPath && existsSync(item.mediaPath) ? mediaServer.fileUrl(item.mediaPath) : null)
      return { ...item, previewPath: previewPath || null, previewUrl }
    })
  }

  async function refreshLibrary() {
    const cfg = store.getConfig()
    const [scan, uploads] = await Promise.all([
      scanWallpaperEngine({ manualRoots: cfg.weRoots, env, fileUrl: p => mediaServer.fileUrl(p) }),
      Promise.resolve(listUploads(store.uploadsDir, p => mediaServer.fileUrl(p)))
    ])
    const items = hydrateWeItems([...uploads, ...(scan.items || [])])
    store.setWeItems(items)
    return {
      ok: true,
      items,
      libraries: scan.libraries || [],
      error: scan.error || null
    }
  }

  function getDiagnostics() {
    const webwallglOk = existsSync(join(__dirname, 'webwallgl', 'engine', 'webwallgl.global.min.js')) &&
      existsSync(join(__dirname, 'webwallgl', 'renderer.js'))
    const logDir = env.ANTIGRAVITY_EXECUTABLE_DATA_DIR
      ? resolve(env.ANTIGRAVITY_EXECUTABLE_DATA_DIR, '..', 'logs')
      : join(store.dataDir)
    const diagLog = join(store.dataDir, 'scene-diag.jsonl')
    const logs = []
    if (existsSync(diagLog)) {
      logs.push({
        name: 'scene-diag.jsonl',
        size: directorySize(diagLog),
        tail: tailFile(diagLog, 60)
      })
    }
    return {
      ok: true,
      version: readPluginVersion(),
      node: process.version,
      platform: `${process.platform} ${release().match(/^\d+(?:\.\d+)*/)?.[0] || ''}`.trim(),
      webwallgl: webwallglOk,
      cdp: cdpNotice.info(injector?.status?.() ?? 'unknown'),
      mediaOrigin: mediaServer.origin,
      paths: {
        data: store.dataDir,
        uploads: store.uploadsDir,
        sceneCache: store.sceneCacheDir,
        logs: logDir
      },
      sizes: {
        uploads: directorySize(store.uploadsDir),
        sceneCache: directorySize(store.sceneCacheDir)
      },
      logs
    }
  }

  const systemLocale = detectSystemLocale(env)

  const handlers = {
    'get-state': async () => ({
      ok: true,
      config: store.getConfig(),
      weItems: hydrateWeItems(store.getWeItems()),
      cdp: {
        ...cdpNotice.info(injector?.status?.() ?? 'unknown'),
        ...(injector?.details?.() ?? {})
      },
      mediaOrigin: mediaServer.origin,
      systemLocale
    }),
    'update-config': async body => {
      const defer = body?.defer === true
      const patch = body?.patch && typeof body.patch === 'object' ? body.patch : {}
      const config = store.updateConfig(patch, { deferPersistence: defer })
      return { ok: true, config }
    },
    'flush-config': async () => {
      store.flush()
      return { ok: true, config: store.getConfig() }
    },
    'we-scan': async () => await refreshLibrary(),
    'we-apply': async body => {
      const item = body?.item
      const config = await applyLibraryItem(item)
      return { ok: true, config }
    },
    'scene-open': async body => await openSceneProject(body),
    'fonts-list': async body => await scanSystemFonts({ refresh: body?.refresh === true }),
    'pick-folder': async body => await pickFolderDialog(body || {}),
    'pick-files': async body => await pickMediaFilesDialog(body || {}),
    'uploads-import': async body => importLocalFiles(body?.paths, store.uploadsDir, p => mediaServer.fileUrl(p)),
    'uploads-url': async body => await importUrlWallpaper(body?.url, store.uploadsDir, p => mediaServer.fileUrl(p)),
    'uploads-bing': async body => await importBingWallpaper(body?.index, store.uploadsDir, p => mediaServer.fileUrl(p)),
    'uploads-remove': async body => {
      const removed = removeUploadFile(body?.path, store.uploadsDir)
      if (!removed.ok) return removed
      const curCfg = store.getConfig()
      if (curCfg.wallpaperSource === removed.removed) {
        store.updateConfig({ wallpaperEnabled: false, wallpaperSource: '', weSelection: null })
      }
      await refreshLibrary()
      return { ok: true, config: store.getConfig() }
    },
    'now-playing': async () => {
      const np = await queryNowPlaying()
      nowPlayingCache = np
      return np
    },
    'diagnostics': async () => getDiagnostics(),
    'cache-clear': async body => {
      const scope = body?.scope === 'uploads' ? store.uploadsDir : store.sceneCacheDir
      return clearCacheDir(scope, store.dataDir)
    },
    'rotation-advance': async () => {
      const advanced = await rotation?.advance(true, { manual: true })
      return { ok: Boolean(advanced), config: store.getConfig() }
    },
    'fix-cdp-shortcut': async () => await cdpNotice.fixShortcuts(),
    'discover-slots': async () => ({ ok: true, slots: discoveredSlots })
  }

  const mediaServer = createMediaServer({
    secret,
    dataDir: store.dataDir,
    studioHtmlProvider: (token, urlObj) => buildPanelHtml({
      mode: 'studio',
      studioToken: token,
      systemLocale,
      initialLang: store.getConfig().uiLanguage || 'zh',
      embed: urlObj?.searchParams?.get('embed') || ''
    }),
    studioApiHandlers: handlers,
    onRuntimeEvent: async ev => {
      if (ev?.type === 'videoEnd') {
        await rotation?.advance(true)
        return { ok: true }
      }
      if (ev?.type === 'slots' && Array.isArray(ev.slots)) {
        discoveredSlots = [...new Set(ev.slots.filter(s => typeof s === 'string' && s.trim()))].slice(0, 64)
        return { ok: true, slots: discoveredSlots }
      }
      return { ok: true }
    }
  })

  await mediaServer.start(0)

  rotation = new WallpaperRotation({
    store,
    applyItem: applyLibraryItem
  })

  const getPayloadState = () => {
    const config = store.getConfig()
    const resolved = buildResolvedWallpaper(config, mediaServer)
    return {
      config,
      resolved,
      studioUrl: mediaServer.studioUrl(),
      studioToken: mediaServer.studioToken,
      runtimeOrigin: mediaServer.origin,
      runtimeToken: mediaServer.runtimeToken,
      nowPlaying: nowPlayingCache,
      systemLocale
    }
  }

  let shuttingDown = false
  const shutdown = async reason => {
    if (shuttingDown) return
    shuttingDown = true
    console.log(`[agy-skins] shutting down (${reason})`)
    try { rotation?.destroy() } catch {}
    try { store.flush() } catch {}
    try { await injector?.stop() } catch {}
    try { await mediaServer.close() } catch {}
    if (options.exitOnShutdown !== false) process.exit(0)
  }

  injector = startCdpInjector({
    bundlePath: RUNTIME_BUNDLE_PATH,
    getPayloadState,
    onStatus: state => cdpNotice.observe(state),
    onRuntimeClosed: reason => void shutdown(reason),
    standalone: standalone || !env.ANTIGRAVITY_LS_ADDRESS,
    instanceTs: INSTANCE_TS,
    env
  })

  store.subscribe(() => {
    void injector?.pushImmediate()
  })

  let sidecarApp = null
  if (env.ANTIGRAVITY_SIDECAR_WEB_PORT && env.ANTIGRAVITY_SIDECAR_UI_TOKEN?.trim()) {
    try {
      const { SidecarApp, Response } = await resolveSidecarSdk()
      const app = new SidecarApp()
      app.page('/', () => buildPanelHtml({ mode: 'aux', systemLocale, initialLang: store.getConfig().uiLanguage || 'auto' }))
      app.page('/panel.js', () => new Response(readFileSync(PANEL_JS_PATH), { contentType: 'text/javascript; charset=utf-8' }))
      app.page('/panel.css', () => new Response(readFileSync(PANEL_CSS_PATH), { contentType: 'text/css; charset=utf-8' }))
      for (const [route, fn] of Object.entries(handlers)) {
        app.api(`/api/${route}`, data => fn(data), 'POST')
      }
      await app.run()
      sidecarApp = app
    } catch (err) {
      console.error('[agy-skins] failed to start sidecar web UI:', err?.message || err)
    }
  }

  const stopLsWatchdog = !standalone && env.ANTIGRAVITY_LS_ADDRESS
    ? startLsWatchdog(env.ANTIGRAVITY_LS_ADDRESS, shutdown)
    : () => {}
  const stopReloadWatcher = startSelfReloadWatcher(__dirname, () => void shutdown('plugin files updated'))

  // Background refresh of Now Playing when wallpaper is active so WebWallGL media sources stay live
  const npTimer = setInterval(async () => {
    const cfg = store.getConfig()
    if (!cfg.wallpaperEnabled || !['scene', 'web'].includes(cfg.wallpaperType)) return
    const next = await queryNowPlaying()
    if (JSON.stringify(next) !== JSON.stringify(nowPlayingCache)) {
      nowPlayingCache = next
      void injector?.pushImmediate()
    }
  }, 5000)
  npTimer.unref?.()

  return {
    store,
    mediaServer,
    injector,
    rotation,
    sidecarApp,
    shutdown: async reason => {
      clearInterval(npTimer)
      stopLsWatchdog()
      stopReloadWatcher()
      await shutdown(reason || 'manual')
    }
  }
}

const isMain = (() => {
  try {
    return Boolean(process.argv[1]) && realpathSync(resolve(process.argv[1])) === realpathSync(fileURLToPath(import.meta.url))
  } catch {
    return false
  }
})()

if (isMain) {
  installEpipeGuard()
  const runtime = await startRuntime()
  for (const sig of ['SIGINT', 'SIGTERM']) {
    process.once(sig, () => void runtime.shutdown(sig))
  }
}
