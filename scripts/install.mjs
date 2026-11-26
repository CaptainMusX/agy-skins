import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { spawn } from 'node:child_process'
import { createHash } from 'node:crypto'
import { homedir, tmpdir } from 'node:os'
import { basename, dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildAll, ROOT } from './build.mjs'
import { defaultPortFiles } from '../sidecars/wallpaper_engine/cdp_notice.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
export const PLUGIN_ID = 'agy-skins'

export function resolveInstallDir(env = process.env) {
  if (env.AGY_PLUGINS_DIR?.trim()) return join(resolve(env.AGY_PLUGINS_DIR.trim()), PLUGIN_ID)
  return join(homedir(), '.gemini', 'config', 'plugins', PLUGIN_ID)
}

function purgeStaleStagingDirs(pluginsDir) {
  try {
    if (!existsSync(pluginsDir)) return
    for (const entry of readdirSync(pluginsDir, { withFileTypes: true })) {
      if (entry.isDirectory() && entry.name.startsWith(`${PLUGIN_ID}.staging.`)) {
        rmSync(join(pluginsDir, entry.name), { recursive: true, force: true })
      }
    }
  } catch {}
}

async function evaluateCdpHash(wsUrl) {
  const ws = new WebSocket(wsUrl)
  await new Promise((res, rej) => {
    const t = setTimeout(() => rej(new Error('ws connect timeout')), 1500)
    ws.onopen = () => { clearTimeout(t); res() }
    ws.onerror = () => { clearTimeout(t); rej(new Error('ws error')) }
  })
  try {
    const res = await new Promise((res, rej) => {
      const t = setTimeout(() => rej(new Error('cdp eval timeout')), 1500)
      ws.onmessage = ev => {
        try {
          const msg = JSON.parse(String(ev.data))
          if (msg.id === 1) {
            clearTimeout(t)
            res(msg.result)
          }
        } catch {}
      }
      ws.send(JSON.stringify({
        id: 1,
        method: 'Runtime.evaluate',
        params: { expression: 'globalThis.__agySkinsRuntime?.hash ?? null', returnByValue: true }
      }))
    })
    return res?.result?.value || null
  } finally {
    try { ws.close() } catch {}
  }
}

async function readMountedRuntimeHash(env, expectedHash) {
  const portFile = defaultPortFiles(env).find(p => existsSync(p))
  if (!portFile) return { cdpOpen: false, matched: false, hash: null }
  let targets
  try {
    const port = readFileSync(portFile, 'utf8').split(/\r?\n/)[0].trim()
    if (!/^\d{1,5}$/.test(port) || Number(port) < 1 || Number(port) > 65535) {
      return { cdpOpen: false, matched: false, hash: null }
    }
    const res = await fetch(`http://127.0.0.1:${port}/json/list`, { signal: AbortSignal.timeout(1500), redirect: 'error' })
    if (!res.ok) return { cdpOpen: false, matched: false, hash: null }
    targets = await res.json()
  } catch {
    return { cdpOpen: false, matched: false, hash: null }
  }

  const pages = (Array.isArray(targets) ? targets : [])
    .filter(t => t?.type === 'page' && /^https?:\/\/(127\.0\.0\.1|localhost)/.test(t.url || '') && t.webSocketDebuggerUrl)
  if (!pages.length) return { cdpOpen: false, matched: false, hash: null }

  let firstHash = null
  for (const page of pages) {
    try {
      const hash = await evaluateCdpHash(page.webSocketDebuggerUrl)
      if (!firstHash && hash) firstHash = hash
      if (expectedHash && hash === expectedHash) {
        return { cdpOpen: true, matched: true, hash }
      }
    } catch {}
  }
  return { cdpOpen: true, matched: false, hash: firstHash }
}

export async function installLocal(options = {}) {
  const env = options.env || process.env
  const noLaunch = options.noLaunch ?? process.argv.includes('--no-launch')
  const forceStandalone = options.launchStandalone ?? process.argv.includes('--standalone')
  await buildAll()

  const targetDir = options.targetDir || resolveInstallDir(env)
  const pluginsRoot = dirname(targetDir)
  mkdirSync(pluginsRoot, { recursive: true })
  // Stage outside the plugins directory so Antigravity never discovers a staging folder as a duplicate plugin
  const tempDir = join(tmpdir(), `${basename(targetDir)}.staging.${Date.now()}`)
  purgeStaleStagingDirs(pluginsRoot)
  rmSync(tempDir, { recursive: true, force: true })
  mkdirSync(tempDir, { recursive: true })

  const itemsToCopy = [
    'plugin.json',
    'package.json',
    'LICENSE',
    'LICENSING.md',
    'THIRD-PARTY-NOTICES.md',
    'README.md',
    'README.zh.md',
    'assets',
    'skills',
    'src/shared',
    'sidecars/wallpaper_engine',
    'third_party'
  ]

  for (const rel of itemsToCopy) {
    const src = join(ROOT, rel)
    if (!existsSync(src)) continue
    const dst = join(tempDir, rel)
    mkdirSync(dirname(dst), { recursive: true })
    cpSync(src, dst, { recursive: true })
  }

  mkdirSync(targetDir, { recursive: true })
  const lockFile = join(targetDir, '.update-in-progress')
  try { writeFileSync(lockFile, String(Date.now())) } catch {}
  try {
    cpSync(tempDir, targetDir, { recursive: true, force: true })
  } finally {
    rmSync(lockFile, { force: true })
    rmSync(tempDir, { recursive: true, force: true })
  }

  const manifest = JSON.parse(readFileSync(join(targetDir, 'plugin.json'), 'utf8'))
  console.log(`[agy-skins] installed v${manifest.version} -> ${targetDir}`)

  if (!noLaunch) {
    let expectedHash = ''
    try {
      const bundlePath = join(targetDir, 'sidecars', 'wallpaper_engine', 'dist', 'runtime.js')
      expectedHash = createHash('sha256').update(readFileSync(bundlePath, 'utf8')).digest('hex').slice(0, 16)
    } catch {}

    let shouldSpawnStandalone = forceStandalone
    if (!forceStandalone) {
      let probe = await readMountedRuntimeHash(env, expectedHash)
      if (probe.cdpOpen && !probe.matched) {
        const deadline = Date.now() + 4500
        while (Date.now() < deadline) {
          await new Promise(r => setTimeout(r, 400))
          probe = await readMountedRuntimeHash(env, expectedHash)
          if (!probe.cdpOpen || probe.matched) break
        }
      }
      if (!probe.cdpOpen || probe.matched) {
        console.log('[agy-skins] native Antigravity sidecar ready (no standalone daemon needed)')
      } else {
        shouldSpawnStandalone = true
      }
    }

    if (shouldSpawnStandalone) {
      const serverEntry = join(targetDir, 'sidecars', 'wallpaper_engine', 'server.mjs')
      const child = spawn(process.execPath, [serverEntry, '--standalone'], {
        cwd: targetDir,
        detached: true,
        stdio: 'ignore',
        windowsHide: true
      })
      child.unref()
      console.log(`[agy-skins] started standalone sidecar daemon (pid=${child.pid})`)
    }
  }

  return { targetDir, version: manifest.version }
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (isMain) {
  installLocal().catch(err => {
    console.error('[agy-skins] install failed:', err)
    process.exit(1)
  })
}
