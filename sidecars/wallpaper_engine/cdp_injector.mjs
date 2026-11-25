import { readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { homedir } from 'node:os'
import { createHash } from 'node:crypto'
import { defaultPortFiles } from './cdp_notice.mjs'

const TICK_MS = 1500
const LIST_CACHE_MS = 3000

function isValidWorkbenchTarget(target, expectedOrigin, wsOrigin) {
  if (!target || target.type !== 'page' || typeof target.id !== 'string' || !target.id) return false
  if (!URL.canParse(target.url) || !URL.canParse(target.webSocketDebuggerUrl)) return false
  const parsedUrl = new URL(target.url)
  if (!['https:', 'http:'].includes(parsedUrl.protocol)) return false
  if (parsedUrl.hostname !== '127.0.0.1' && parsedUrl.hostname !== 'localhost') return false
  if (expectedOrigin && parsedUrl.origin !== expectedOrigin) return false
  const ws = new URL(target.webSocketDebuggerUrl)
  return ws.origin === wsOrigin && ws.pathname === `/devtools/page/${target.id}`
}

export function createComposerOriginResolver(productRoots = [], env = process.env, now = Date.now) {
  let session = null
  return async function composerOrigin() {
    const address = env.ANTIGRAVITY_LS_ADDRESS
    const token = env.ANTIGRAVITY_CSRF_TOKEN
    const match = /^(127\.0\.0\.1|localhost):([1-9]\d{0,4})$/.exec(address || '')
    if (!match || +match[2] > 65535 || !token) { session = null; return null }
    for (const root of productRoots) {
      let hub
      try { hub = JSON.parse(readFileSync(join(root, 'daemon', `hub_${match[2]}.json`), 'utf8')) }
      catch { continue }
      if (hub?.httpPort !== +match[2] || !Number.isInteger(hub.httpsPort) || hub.httpsPort < 1 || hub.httpsPort > 65535) continue
      const origin = new URL(`https://127.0.0.1:${hub.httpsPort}`).origin
      if (!session || session.address !== address || session.token !== token || session.origin !== origin || session.pid !== hub.pid) {
        session = { address, token, origin, pid: hub.pid, verified: false, retryAt: 0, delay: 4000 }
      }
      if (session.verified) return origin
      if (now() < session.retryAt) return null
      try {
        const res = await fetch(`http://${match[1]}:${match[2]}/exa.language_server_pb.LanguageServerService/RetrieveUserQuotaSummary`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-codeium-csrf-token': token },
          body: '{}',
          redirect: 'error',
          signal: AbortSignal.timeout(3000)
        })
        await res.body?.cancel()
        if (res.ok) { session.verified = true; return origin }
      } catch {}
      session.retryAt = now() + session.delay
      session.delay = Math.min(60_000, session.delay * 2)
      return null
    }
    session = null
    return null
  }
}

export function defaultProductRoots(env = process.env) {
  if (env.ANTIGRAVITY_EXECUTABLE_DATA_DIR) {
    return [dirname(dirname(env.ANTIGRAVITY_EXECUTABLE_DATA_DIR))]
  }
  return ['antigravity', 'antigravity-ide', 'antigravity-cli'].map(p => join(homedir(), '.gemini', p))
}

export function startCdpInjector({
  bundlePath,
  getPayloadState,
  onStatus = null,
  onRuntimeClosed = null,
  standalone = false,
  instanceTs = Date.now(),
  env = process.env
}) {
  let bundleSource = ''
  let bundleHash = ''
  try {
    bundleSource = readFileSync(bundlePath, 'utf8')
    bundleHash = createHash('sha256').update(bundleSource).digest('hex').slice(0, 16)
  } catch {}

  const sockets = new Map()
  const composerOrigin = createComposerOriginResolver(defaultProductRoots(env), env)
  let cachedPages = []
  let lastListAt = 0
  let cdpState = 'unknown'
  let activePort = null
  let stopped = false
  let busy = false
  let hasEverAttached = false
  let consecutiveFailures = 0

  const retire = (entry, id) => {
    if (entry.closed) return
    entry.closed = true
    for (const cb of entry.pending.values()) cb(undefined)
    entry.pending.clear()
    try { entry.ws.close() } catch {}
    if (sockets.get(id) === entry) sockets.delete(id)
  }

  const command = (entry, method, params) => new Promise(resolve => {
    if (entry.ws.readyState !== 1) return resolve(undefined)
    const id = entry.nextId++
    const timer = setTimeout(() => { entry.pending.delete(id); resolve(undefined) }, 3500)
    entry.pending.set(id, msg => { clearTimeout(timer); resolve(msg?.result) })
    try { entry.ws.send(JSON.stringify({ id, method, params })) }
    catch { clearTimeout(timer); entry.pending.delete(id); resolve(undefined) }
  })

  const evaluate = async (entry, context, expression) => {
    if (!context || context !== entry.context) return undefined
    const res = await command(entry, 'Runtime.evaluate', { uniqueContextId: context, expression, returnByValue: true })
    return res?.result?.value
  }

  const connect = async target => {
    const ws = new WebSocket(target.webSocketDebuggerUrl)
    const entry = {
      ws,
      pending: new Map(),
      nextId: 1,
      context: null,
      frameId: null,
      lastPayload: '',
      origin: new URL(target.url).origin
    }
    await new Promise((resolve, reject) => {
      const fail = msg => { clearTimeout(timer); retire(entry, target.id); reject(new Error(msg)) }
      const timer = setTimeout(() => fail('ws timeout'), 3500)
      ws.onopen = () => { clearTimeout(timer); resolve() }
      ws.onerror = () => fail('ws error')
    })
    if (stopped) { retire(entry, target.id); throw new Error('stopped') }
    ws.onmessage = ev => {
      try {
        const msg = JSON.parse(String(ev.data))
        if (msg.method === 'Runtime.executionContextCreated') {
          const ctx = msg.params.context
          if (ctx?.auxData?.isDefault && ctx.auxData.frameId === entry.frameId) {
            entry.context = ctx.origin === entry.origin ? ctx.uniqueId : null
            entry.lastPayload = ''
          }
        } else if (msg.method === 'Runtime.executionContextsCleared' ||
          (msg.method === 'Runtime.executionContextDestroyed' && msg.params.executionContextUniqueId === entry.context)) {
          entry.context = null
        }
        const cb = entry.pending.get(msg.id)
        if (cb) { entry.pending.delete(msg.id); cb(msg) }
      } catch {}
    }
    ws.onerror = ws.onclose = () => retire(entry, target.id)
    sockets.set(target.id, entry)
    const tree = await command(entry, 'Page.getFrameTree', {})
    entry.frameId = tree?.frameTree?.frame?.id
    if (!entry.frameId || !await command(entry, 'Runtime.enable', {})) {
      retire(entry, target.id)
      throw new Error('unable to attach frame')
    }
    return entry
  }

  const listPages = async () => {
    if (lastListAt && Date.now() - lastListAt < LIST_CACHE_MS) return cachedPages
    const portFile = defaultPortFiles(env).find(p => existsSync(p))
    if (!portFile) {
      cdpState = 'missing'
      return []
    }
    let port
    try {
      port = readFileSync(portFile, 'utf8').split(/\r?\n/)[0].trim()
      if (!/^\d{1,5}$/.test(port) || Number(port) < 1 || Number(port) > 65535) throw new Error('invalid port')
      const res = await fetch(`http://127.0.0.1:${port}/json/list`, { signal: AbortSignal.timeout(3000), redirect: 'error' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const targets = await res.json()
      const expectedOrigin = standalone ? null : await composerOrigin()
      if (!standalone && !expectedOrigin) {
        cdpState = 'unverified'
        return []
      }
      const wsOrigin = new URL(`ws://127.0.0.1:${Number(port)}`).origin
      cachedPages = (Array.isArray(targets) ? targets : []).filter(t => isValidWorkbenchTarget(t, expectedOrigin, wsOrigin))
      lastListAt = Date.now()
      activePort = Number(port)
      cdpState = 'ok'
      consecutiveFailures = 0
      const liveIds = new Set(cachedPages.map(t => t.id))
      for (const [id, entry] of sockets) {
        if (!liveIds.has(id)) retire(entry, id)
      }
      return cachedPages
    } catch {
      cdpState = 'unreachable'
      if (standalone && hasEverAttached) {
        consecutiveFailures++
        if (consecutiveFailures >= 3) onRuntimeClosed?.('Antigravity CDP closed')
      }
      return []
    }
  }

  const applyToEntry = async (entry, { isPreview = false } = {}) => {
    if (!entry.context || !bundleSource) return false
    const run = expr => evaluate(entry, entry.context, expr)
    let state = await run(`globalThis.__agySkinsRuntime?.readState?.(${instanceTs}) ?? null`)
    if (state === 'superseded') {
      await stop()
      onRuntimeClosed?.('superseded by newer instance')
      return false
    }
    if (!state || state.owner !== instanceTs || state.hash !== bundleHash) {
      const mountCode = `(() => { const __AGY_SKINS_OWNER__ = ${Number(instanceTs)}; const __AGY_SKINS_HASH__ = ${JSON.stringify(bundleHash)}; ${bundleSource} })()`
      const mounted = await run(mountCode)
      if (mounted === 'superseded') {
        await stop()
        onRuntimeClosed?.('superseded by newer instance')
        return false
      }
      entry.lastPayload = ''
      entry.lastWasPreview = false
    }
    const payload = getPayloadState()
    const payloadJson = JSON.stringify(payload)
    if (entry.lastPayload !== payloadJson || (!isPreview && entry.lastWasPreview)) {
      const ok = await run(`globalThis.__agySkinsRuntime?.apply?.(${payloadJson}, ${instanceTs}, ${Boolean(isPreview)}) ?? false`)
      if (ok === 'superseded') {
        await stop()
        onRuntimeClosed?.('superseded by newer instance')
        return false
      }
      if (ok) {
        entry.lastPayload = payloadJson
        entry.lastWasPreview = Boolean(isPreview)
        hasEverAttached = true
      }
    }
    return true
  }

  let pushing = false
  let pushQueued = false
  let queuedPreview = true

  const pushImmediate = async ({ isPreview = false } = {}) => {
    if (stopped) return
    queuedPreview = queuedPreview && Boolean(isPreview)
    if (pushing) {
      pushQueued = true
      return
    }
    pushing = true
    try {
      do {
        const usePreview = queuedPreview
        queuedPreview = true
        pushQueued = false
        for (const entry of sockets.values()) {
          if (stopped) break
          try { await applyToEntry(entry, { isPreview: usePreview }) } catch {}
        }
      } while (pushQueued && !stopped)
    } finally {
      pushing = false
    }
  }

  const tick = async () => {
    if (busy || stopped) return
    busy = true
    try {
      const pages = await listPages()
      onStatus?.(cdpState)
      if (standalone && hasEverAttached && cdpState === 'missing') {
        consecutiveFailures++
        if (consecutiveFailures >= 3) onRuntimeClosed?.('DevToolsActivePort removed')
      }
      for (const target of pages) {
        if (stopped) break
        try {
          const entry = sockets.get(target.id) || await connect(target)
          await applyToEntry(entry, { isPreview: Boolean(entry.lastWasPreview) })
        } catch (err) {
          const existing = sockets.get(target.id)
          if (existing) retire(existing, target.id)
        }
      }
    } finally {
      busy = false
    }
  }

  const stop = async () => {
    if (stopped) return
    stopped = true
    clearInterval(timer)
    await Promise.all([...sockets].map(async ([id, entry]) => {
      try {
        await evaluate(entry, entry.context, `globalThis.__agySkinsRuntime?.owner === ${instanceTs} && globalThis.__agySkinsRuntime.dispose()`)
      } finally {
        retire(entry, id)
      }
    }))
  }

  const timer = setInterval(() => void tick(), TICK_MS)
  void tick()

  return {
    tick,
    pushImmediate,
    stop,
    status: () => cdpState,
    details: () => ({ state: cdpState, port: activePort, targets: sockets.size })
  }
}
