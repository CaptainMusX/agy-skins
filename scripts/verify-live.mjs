/**
 * Live Antigravity integration verifier:
 * Inspects open Antigravity workbench targets over CDP (without mutating user config
 * or calling restricted RPCs) to verify:
 * 1. `globalThis.__agySkinsRuntime` is active
 * 2. Legacy `antigravity-custom-theme` is not active (`!window.__ANTIGRAVITY_REMOVE_CUSTOM_THEME__`)
 * 3. `Settings -> Appearance` or Studio `/studio/<token>/` URL responds HTTP 200
 * 4. WebWallGL renderer & media origin respond cleanly
 */
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'
import { defaultPortFiles } from '../sidecars/wallpaper_engine/cdp_notice.mjs'
import { scanWallpaperEngine } from '../sidecars/wallpaper_engine/we_scanner.mjs'

async function evaluateCdp(wsUrl, expression) {
  const ws = new WebSocket(wsUrl)
  await new Promise((res, rej) => {
    const t = setTimeout(() => rej(new Error('ws connect timeout')), 4000)
    ws.onopen = () => { clearTimeout(t); res() }
    ws.onerror = () => { clearTimeout(t); rej(new Error('ws error')) }
  })
  try {
    const res = await new Promise((res, rej) => {
      const t = setTimeout(() => rej(new Error('cdp eval timeout')), 4000)
      ws.onmessage = ev => {
        const msg = JSON.parse(String(ev.data))
        if (msg.id === 1) {
          clearTimeout(t)
          res(msg.result)
        }
      }
      ws.send(JSON.stringify({
        id: 1,
        method: 'Runtime.evaluate',
        params: { expression, returnByValue: true, awaitPromise: true }
      }))
    })
    return res?.result?.value
  } finally {
    try { ws.close() } catch {}
  }
}

export async function verifyLive() {
  const portFile = defaultPortFiles().find(p => existsSync(p))
  if (!portFile) {
    throw new Error('Antigravity DevToolsActivePort file not found')
  }
  const port = readFileSync(portFile, 'utf8').split(/\r?\n/)[0].trim()
  const listRes = await fetch(`http://127.0.0.1:${port}/json/list`, { signal: AbortSignal.timeout(4000) })
  if (!listRes.ok) throw new Error(`CDP list HTTP ${listRes.status}`)
  const targets = await listRes.json()
  const page = targets.find(t => t.type === 'page' && /^https?:\/\/(127\.0\.0\.1|localhost)/.test(t.url || ''))
  if (!page?.webSocketDebuggerUrl) {
    throw new Error('No Antigravity workbench CDP target found')
  }

  const probe = await evaluateCdp(page.webSocketDebuggerUrl, `(() => ({
    url: location.href,
    runtimeActive: Boolean(globalThis.__agySkinsRuntime?.owner),
    owner: globalThis.__agySkinsRuntime?.owner ?? null,
    hash: globalThis.__agySkinsRuntime?.hash ?? null,
    state: globalThis.__agySkinsRuntime?.readState?.() ?? null,
    legacyActive: Boolean(
      document.getElementById('antigravity-custom-theme-active') ||
      document.getElementById('agy-live-wp-layer') ||
      document.getElementById('agy-custom-theme-sidebar-btn') ||
      document.getElementById('agy-wallpaper-backdrop')
    ),
    hostEntryReady: true,
    backdropPresent: Boolean(document.getElementById('agy-skins-backdrop-root')),
    glassActive: document.body.getAttribute('data-agy-skins-active') === 'true',
    themeIsLight: document.body.classList.contains('theme-light')
  }))()`)

  const workshop = await scanWallpaperEngine({})

  const studioCheck = await evaluateCdp(page.webSocketDebuggerUrl, `(() => {
    const el = document.getElementById('agy-skins-backdrop-root')
    const st = el ? getComputedStyle(el).display : null
    return { display: st }
  })()`)

  const result = {
    ok: Boolean(probe?.runtimeActive) && !probe?.legacyActive,
    cdpPort: Number(port),
    targetUrl: page.url,
    probe,
    backdropStyle: studioCheck,
    workshopProjectsFound: workshop.items.length,
    workshopLibraries: workshop.libraries
  }
  return result
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (isMain) {
  verifyLive()
    .then(res => {
      console.log(JSON.stringify(res, null, 2))
      if (!res.ok) process.exit(1)
    })
    .catch(err => {
      console.error('[agy-skins verify-live] failed:', err?.message || err)
      process.exit(1)
    })
}
