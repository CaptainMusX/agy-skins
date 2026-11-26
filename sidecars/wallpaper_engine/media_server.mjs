import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import { createReadStream, existsSync, lstatSync, mkdirSync, appendFileSync, renameSync, statSync } from 'node:fs'
import { readdir } from 'node:fs/promises'
import { createServer } from 'node:http'
import { dirname, extname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const WEBWALLGL_ROOT = join(__dirname, 'webwallgl')
const DIST_ROOT = join(__dirname, 'dist')
const MAX_DIAG_BYTES = 4 * 1024 * 1024

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.htm': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.pkg': 'application/octet-stream',
  '.tex': 'application/octet-stream',
  '.mdl': 'application/octet-stream',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mov': 'video/quicktime',
  '.mkv': 'video/x-matroska',
  '.avi': 'video/x-msvideo',
  '.mp3': 'audio/mpeg',
  '.ogg': 'audio/ogg',
  '.wav': 'audio/wav',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf'
}

export function createSigner(secret) {
  const b64url = buf => Buffer.from(buf).toString('base64url')
  const signPayload = payload => {
    const mac = createHmac('sha256', secret).update(payload, 'ascii').digest().subarray(0, 18)
    return b64url(mac)
  }
  const signPath = absPath => {
    const payload = b64url(Buffer.from(String(absPath), 'utf8'))
    return `${payload}.${signPayload(payload)}`
  }
  const verifyPath = token => {
    if (typeof token !== 'string' || !token || token.length > 4096) return null
    const dot = token.indexOf('.')
    if (dot <= 0 || token.indexOf('.', dot + 1) !== -1) return null
    const payload = token.slice(0, dot)
    const sig = token.slice(dot + 1)
    const expected = signPayload(payload)
    const a = Buffer.from(sig, 'ascii')
    const b = Buffer.from(expected, 'ascii')
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null
    try {
      return Buffer.from(payload, 'base64url').toString('utf8')
    } catch {
      return null
    }
  }
  return { signPath, verifyPath }
}

export function safeChild(rootDir, relPath) {
  let clean
  try {
    clean = decodeURIComponent(String(relPath || 'project.json'))
  } catch {
    return { ok: false, status: 400, error: 'invalid path encoding' }
  }
  clean = clean.replace(/\\/g, '/').replace(/^\/+/, '')
  if (!clean || clean.includes('\0')) clean = 'project.json'
  const parts = clean.split('/').filter(part => part !== '' && part !== '.')
  if (parts.some(part => part === '..' || part.includes(':'))) {
    return { ok: false, status: 403, error: 'path traversal refused' }
  }
  const resolvedRoot = resolve(rootDir)
  const candidate = resolve(resolvedRoot, ...parts)
  const rel = relative(resolvedRoot, candidate)
  if (rel.startsWith('..') || rel.includes(':' ) || candidate === resolvedRoot) {
    return { ok: false, status: 403, error: 'path traversal refused' }
  }
  try {
    const lst = lstatSync(candidate)
    if (lst.isSymbolicLink() || !lst.isFile()) {
      return { ok: false, status: 404, error: 'file missing' }
    }
    return { ok: true, path: candidate, size: lst.size }
  } catch {
    return { ok: false, status: 404, error: 'file missing' }
  }
}

export function parseRange(header, size) {
  if (!header || !String(header).toLowerCase().startsWith('bytes=')) return null
  const value = String(header).slice(6).split(',')[0].trim()
  const dash = value.indexOf('-')
  if (dash < 0) return null
  const startRaw = value.slice(0, dash).trim()
  const endRaw = value.slice(dash + 1).trim()
  if (startRaw === '') {
    const suffix = Number(endRaw)
    if (!Number.isInteger(suffix) || suffix <= 0) return null
    return [Math.max(0, size - suffix), size - 1]
  }
  const start = Number(startRaw)
  const end = endRaw === '' ? size - 1 : Number(endRaw)
  if (!Number.isInteger(start) || !Number.isInteger(end) || start < 0 || start >= size || end < start) return null
  return [start, Math.min(end, size - 1)]
}

function serveFile(req, res, filePath, size, { cache = 'no-store', cors = false } = {}) {
  const contentType = MIME_TYPES[extname(filePath).toLowerCase()] || 'application/octet-stream'
  const headers = {
    'Accept-Ranges': 'bytes',
    'Cache-Control': cache,
    'X-Content-Type-Options': 'nosniff',
    'Cross-Origin-Resource-Policy': 'cross-origin',
    'Content-Type': contentType
  }
  if (cors) {
    headers['Access-Control-Allow-Origin'] = '*'
    headers['Access-Control-Allow-Methods'] = 'GET, HEAD, OPTIONS'
    headers['Access-Control-Allow-Headers'] = 'Range'
  }
  const range = parseRange(req.headers.range, size)
  if (!range) {
    headers['Content-Length'] = String(size)
    res.writeHead(200, headers)
    if (req.method === 'HEAD') {
      res.end()
      return
    }
    if (size === 0) {
      res.end()
      return
    }
    const stream = createReadStream(filePath)
    res.on('close', () => stream.destroy())
    stream.on('error', () => { if (!res.destroyed) res.destroy() })
    stream.pipe(res)
    return
  }
  const [start, end] = range
  headers['Content-Range'] = `bytes ${start}-${end}/${size}`
  headers['Content-Length'] = String(end - start + 1)
  res.writeHead(206, headers)
  if (req.method === 'HEAD') {
    res.end()
    return
  }
  const stream = createReadStream(filePath, { start, end })
  res.on('close', () => stream.destroy())
  stream.on('error', () => { if (!res.destroyed) res.destroy() })
  stream.pipe(res)
}

function tokensEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || !a || !b) return false
  const ba = Buffer.from(a, 'utf8')
  const bb = Buffer.from(b, 'utf8')
  return ba.length === bb.length && timingSafeEqual(ba, bb)
}

function readJsonBody(req, maxBytes = 2 * 1024 * 1024) {
  return new Promise((resolvePromise, rejectPromise) => {
    let total = 0
    const chunks = []
    req.on('data', chunk => {
      total += chunk.length
      if (total > maxBytes) {
        rejectPromise(new Error('Request body too large'))
        req.destroy()
        return
      }
      chunks.push(chunk)
    })
    req.on('end', () => {
      const text = Buffer.concat(chunks).toString('utf8').trim()
      if (!text) return resolvePromise({})
      try {
        resolvePromise(JSON.parse(text))
      } catch {
        rejectPromise(new Error('Invalid JSON body'))
      }
    })
    req.on('error', rejectPromise)
  })
}

function applyLoopbackCors(req, res, { allowOrigin = null, exposeRange = false } = {}) {
  const reqOrigin = typeof req.headers?.origin === 'string' ? req.headers.origin.trim() : ''
  const isAllowedOrigin = !reqOrigin ||
    /^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/i.test(reqOrigin) ||
    /^(vscode-file|vscode-webview|app|file):\/\//i.test(reqOrigin)
  const originHeader = allowOrigin || (isAllowedOrigin && reqOrigin ? reqOrigin : '*')
  res.setHeader('Access-Control-Allow-Origin', originHeader)
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Range, x-agy-studio-token, x-agy-runtime-token')
  res.setHeader('Access-Control-Allow-Private-Network', 'true')
  res.setHeader('Access-Control-Max-Age', '86400')
  if (reqOrigin && originHeader !== '*') {
    res.setHeader('Vary', 'Origin')
  }
  if (exposeRange) {
    res.setHeader('Access-Control-Expose-Headers', 'Content-Range, Accept-Ranges, Content-Length')
  }
}

export function createMediaServer({
  secret,
  dataDir,
  webwallglRoot = WEBWALLGL_ROOT,
  distRoot = DIST_ROOT,
  studioHtmlProvider = null,
  studioApiHandlers = null,
  onRuntimeEvent = null,
  getWeAssetsDir = null
}) {
  const signer = createSigner(secret)
  const studioToken = randomBytes(24).toString('hex')
  const runtimeToken = randomBytes(24).toString('hex')
  let origin = ''
  let assetsIndexCache = { dir: '', names: [], at: 0 }

  const currentAssetsDir = () => {
    try {
      const d = typeof getWeAssetsDir === 'function' ? getWeAssetsDir() : getWeAssetsDir
      if (typeof d === 'string' && d.trim()) {
        const resolved = resolve(d.trim())
        if (statSync(join(resolved, 'materials')).isDirectory()) return resolved
      }
    } catch {}
    return null
  }

  const listWeAssetNames = async assetsDir => {
    if (assetsIndexCache.dir === assetsDir && Date.now() - assetsIndexCache.at < 60_000) {
      return assetsIndexCache.names
    }
    const names = []
    const walk = async (dir, prefix) => {
      let entries
      try { entries = await readdir(dir, { withFileTypes: true }) } catch { return }
      for (const e of entries) {
        const rel = prefix ? `${prefix}/${e.name}` : e.name
        if (e.isDirectory()) await walk(join(dir, e.name), rel)
        else if (e.isFile() && e.name.toLowerCase().endsWith('.tex')) names.push(rel.slice(0, -4))
      }
    }
    await walk(join(assetsDir, 'materials'), '')
    names.sort()
    assetsIndexCache = { dir: assetsDir, names, at: Date.now() }
    return names
  }

  const server = createServer(async (req, res) => {
    try {
      const url = new URL(req.url || '/', 'http://127.0.0.1')
      const pathname = url.pathname

      if (req.method === 'OPTIONS' && (
        pathname.startsWith('/api/agy-skins/') ||
        pathname === '/api/local-assets' ||
        pathname.startsWith('/api/local-assets/') ||
        pathname.startsWith('/studio-api/') ||
        pathname === '/runtime-event'
      )) {
        applyLoopbackCors(req, res, {
          allowOrigin: (pathname.startsWith('/api/agy-skins/') || pathname.startsWith('/api/local-assets')) ? '*' : null
        })
        res.writeHead(204)
        res.end()
        return
      }

      if (pathname === '/api/local-assets' || pathname.startsWith('/api/local-assets/')) {
        if (req.method !== 'GET' && req.method !== 'HEAD') {
          res.writeHead(405)
          res.end('Method Not Allowed')
          return
        }
        const rest = pathname.slice('/api/local-assets'.length)
        const assetsDir = currentAssetsDir()
        const sendAssetJson = (status, obj) => {
          res.writeHead(status, {
            'Content-Type': 'application/json; charset=utf-8',
            'Cache-Control': 'no-store',
            'Access-Control-Allow-Origin': '*',
            'Cross-Origin-Resource-Policy': 'cross-origin'
          })
          if (req.method === 'HEAD') res.end()
          else res.end(JSON.stringify(obj))
        }
        if (rest === '' || rest === '/') {
          sendAssetJson(200, { ok: Boolean(assetsDir), roots: assetsDir ? [{ id: 'local', dir: assetsDir }] : [] })
          return
        }
        if (!assetsDir) {
          sendAssetJson(404, { ok: false, error: 'assets directory unavailable' })
          return
        }
        const rawSegs = rest.replace(/^\/+/, '').split('/').filter(Boolean)
        let rootId = ''
        try { rootId = decodeURIComponent(rawSegs[0] || '') } catch { rootId = '' }
        if (rootId !== 'local') {
          sendAssetJson(404, { error: 'unknown asset source' })
          return
        }
        const rawRel = rawSegs.slice(1).join('/')
        if (rawRel === 'materials/index.json') {
          sendAssetJson(200, { names: await listWeAssetNames(assetsDir) })
          return
        }
        if (!rawRel) {
          sendAssetJson(400, { error: 'missing asset path' })
          return
        }
        const resolvedAsset = safeChild(assetsDir, rawRel)
        if (!resolvedAsset.ok) {
          sendAssetJson(resolvedAsset.status, { error: resolvedAsset.error })
          return
        }
        serveFile(req, res, resolvedAsset.path, resolvedAsset.size, { cache: 'private, max-age=3600', cors: true })
        return
      }

      if (pathname === '/api/agy-skins/scene/diag' && req.method === 'GET') {
        const msg = String(url.searchParams.get('msg') || '').slice(0, 500)
        const lvl = url.searchParams.get('lvl')
        const level = lvl === 'error' || lvl === 'warn' ? lvl : 'info'
        try {
          const logPath = join(dataDir, 'scene-diag.jsonl')
          mkdirSync(dirname(logPath), { recursive: true })
          if (existsSync(logPath) && statSync(logPath).size > MAX_DIAG_BYTES) {
            renameSync(logPath, `${logPath}.old`)
          }
          appendFileSync(logPath, JSON.stringify({ ts: Date.now(), level, message: msg }) + '\n', 'utf8')
        } catch {}
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' })
        res.end('{"ok":true}')
        return
      }

      if (pathname.startsWith('/api/agy-skins/scene/files/')) {
        if (req.method !== 'GET' && req.method !== 'HEAD') {
          res.writeHead(405)
          res.end('Method Not Allowed')
          return
        }
        const rest = pathname.slice('/api/agy-skins/scene/files/'.length)
        const slash = rest.indexOf('/')
        const token = slash < 0 ? rest : rest.slice(0, slash)
        const rel = slash < 0 ? 'project.json' : rest.slice(slash + 1)
        const rawDir = signer.verifyPath(token)
        if (!rawDir) {
          res.writeHead(403, { 'Content-Type': 'application/json' })
          res.end('{"error":"invalid media token"}')
          return
        }
        let dirStat
        try { dirStat = lstatSync(rawDir) } catch { dirStat = null }
        if (!dirStat || dirStat.isSymbolicLink() || !dirStat.isDirectory()) {
          res.writeHead(404, { 'Content-Type': 'application/json' })
          res.end('{"error":"project directory missing"}')
          return
        }
        const resolved = safeChild(rawDir, rel)
        if (!resolved.ok) {
          res.writeHead(resolved.status, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: resolved.error }))
          return
        }
        const cache = /\.(json|html?)$/i.test(resolved.path) ? 'no-store' : 'private, max-age=300'
        serveFile(req, res, resolved.path, resolved.size, { cache, cors: true })
        return
      }

      if (pathname.startsWith('/api/agy-skins/media/file/')) {
        if (req.method !== 'GET' && req.method !== 'HEAD') {
          res.writeHead(405)
          res.end('Method Not Allowed')
          return
        }
        const rest = pathname.slice('/api/agy-skins/media/file/'.length)
        const token = rest.split('/')[0]
        const rawFile = signer.verifyPath(token)
        if (!rawFile) {
          res.writeHead(403, { 'Content-Type': 'application/json' })
          res.end('{"error":"invalid file token"}')
          return
        }
        let st
        try { st = lstatSync(rawFile) } catch { st = null }
        if (!st || st.isSymbolicLink() || !st.isFile()) {
          res.writeHead(404, { 'Content-Type': 'application/json' })
          res.end('{"error":"file missing"}')
          return
        }
        serveFile(req, res, rawFile, st.size, { cache: 'private, max-age=3600', cors: true })
        return
      }

      if (pathname.startsWith('/api/agy-skins/scene/live/')) {
        if (req.method !== 'GET' && req.method !== 'HEAD') {
          res.writeHead(405)
          res.end('Method Not Allowed')
          return
        }
        const rel = pathname.slice('/api/agy-skins/scene/live/'.length) || 'index.html'
        const resolved = safeChild(webwallglRoot, rel)
        if (!resolved.ok) {
          res.writeHead(resolved.status)
          res.end(resolved.error)
          return
        }
        const ext = extname(resolved.path).toLowerCase()
        const cache = ext === '.js' || ext === '.mjs' ? 'public, max-age=31536000, immutable' : 'no-store'
        serveFile(req, res, resolved.path, resolved.size, { cache, cors: true })
        return
      }

      // Authenticated Studio Modal UI (for Settings -> Appearance / Alt+Shift+W)
      if (pathname.startsWith('/studio/')) {
        const rest = pathname.slice('/studio/'.length)
        const slash = rest.indexOf('/')
        const token = slash < 0 ? rest : rest.slice(0, slash)
        const sub = slash < 0 ? '' : rest.slice(slash + 1)
        if (!tokensEqual(token, studioToken)) {
          res.writeHead(403, { 'Content-Type': 'text/plain' })
          res.end('Forbidden')
          return
        }
        if (!sub || sub === 'index.html') {
          const html = typeof studioHtmlProvider === 'function' ? studioHtmlProvider(studioToken, url) : '<!doctype html><html><body>Studio unavailable</body></html>'
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' })
          res.end(html)
          return
        }
        if (sub === 'panel.js' || sub === 'panel.css') {
          const asset = safeChild(distRoot, sub)
          if (!asset.ok) {
            res.writeHead(404)
            res.end('Not found')
            return
          }
          serveFile(req, res, asset.path, asset.size, { cache: 'no-store', cors: false })
          return
        }
      }

      if (pathname.startsWith('/studio-api/')) {
        applyLoopbackCors(req, res)
        const provided = req.headers['x-agy-studio-token']
        if (!tokensEqual(String(provided || ''), studioToken)) {
          res.writeHead(401, { 'Content-Type': 'application/json' })
          res.end('{"ok":false,"error":"unauthorized"}')
          return
        }
        const action = pathname.slice('/studio-api/'.length)
        const handler = studioApiHandlers?.[action]
        if (!handler) {
          res.writeHead(404, { 'Content-Type': 'application/json' })
          res.end('{"ok":false,"error":"unknown studio route"}')
          return
        }
        const body = req.method === 'POST' ? await readJsonBody(req) : Object.fromEntries(url.searchParams.entries())
        const result = await handler(body)
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' })
        res.end(JSON.stringify(result))
        return
      }

      if (pathname === '/runtime-event' && req.method === 'POST') {
        applyLoopbackCors(req, res)
        const provided = req.headers['x-agy-runtime-token']
        if (!tokensEqual(String(provided || ''), runtimeToken)) {
          res.writeHead(401, { 'Content-Type': 'application/json' })
          res.end('{"ok":false,"error":"unauthorized"}')
          return
        }
        const body = await readJsonBody(req, 64 * 1024)
        const result = onRuntimeEvent ? await onRuntimeEvent(body) : { ok: true }
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' })
        res.end(JSON.stringify(result ?? { ok: true }))
        return
      }

      res.writeHead(404, { 'Content-Type': 'application/json' })
      res.end('{"error":"not found"}')
    } catch (err) {
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ ok: false, error: err?.message || 'internal error' }))
      }
    }
  })

  async function start(port = 0) {
    if (origin) return origin
    await new Promise((resolvePromise, rejectPromise) => {
      server.once('error', rejectPromise)
      server.listen(port, '127.0.0.1', () => {
        server.off('error', rejectPromise)
        const addr = server.address()
        origin = `http://127.0.0.1:${addr.port}`
        resolvePromise()
      })
    })
    return origin
  }

  function close() {
    return new Promise(resolvePromise => {
      origin = ''
      server.close(() => resolvePromise())
    })
  }

  function fileUrl(absPath) {
    if (!origin || !absPath) return null
    return `${origin}/api/agy-skins/media/file/${signer.signPath(resolve(absPath))}`
  }

  function sceneOpenPayload(projectDir, projectMeta = {}) {
    const resolved = resolve(projectDir)
    const token = signer.signPath(resolved)
    return {
      ok: true,
      token,
      mediaOrigin: origin,
      base: `${origin}/api/agy-skins/scene/files/${token}`,
      type: String(projectMeta.type || '').toLowerCase(),
      title: String(projectMeta.title || '').slice(0, 200),
      file: String(projectMeta.file || '').slice(0, 1024),
      preview: typeof projectMeta.preview === 'string' ? projectMeta.preview.slice(0, 1024) : null,
      weAssetsAvailable: Boolean(currentAssetsDir()),
      dir: resolved
    }
  }

  return {
    start,
    close,
    get origin() { return origin },
    studioToken,
    runtimeToken,
    studioUrl: () => `${origin}/studio/${studioToken}/`,
    signDirectory: dir => signer.signPath(resolve(dir)),
    fileUrl,
    sceneOpenPayload,
    verifyToken: signer.verifyPath
  }
}
