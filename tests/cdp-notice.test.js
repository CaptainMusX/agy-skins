import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { createServer } from 'node:http'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createCdpNoticeManager, defaultPortFiles } from '../sidecars/wallpaper_engine/cdp_notice.mjs'
import { defaultProductRoots, createComposerOriginResolver } from '../sidecars/wallpaper_engine/cdp_injector.mjs'

test('defaultPortFiles resolves overridden AGY_PORT_FILE and APPDATA paths', () => {
  const overrideList = defaultPortFiles({
    AGY_PORT_FILE: 'C:\\Custom\\DevToolsActivePort'
  })
  assert.deepEqual(overrideList, ['C:\\Custom\\DevToolsActivePort'])

  const stdList = defaultPortFiles({
    APPDATA: 'C:\\Users\\Demo\\AppData\\Roaming'
  })
  assert.ok(stdList.some(p => p.endsWith('DevToolsActivePort')))
  assert.ok(stdList[0].includes('Demo'))
})

test('createCdpNoticeManager tracks shortcut fix state transitions', async () => {
  let step = 'scan'
  const mgr = createCdpNoticeManager({
    platform: 'win32',
    shortcutDirectories: ['C:\\FakeDesktop'],
    execFileImpl: (_file, _args, _opts, cb) => {
      if (step === 'scan') cb(null, 'missing\n')
      else cb(null, 'ok,1,0,1\n')
    }
  })

  const state1 = await mgr.checkShortcuts()
  assert.equal(state1, 'missing')
  assert.equal(mgr.info('missing').canFixShortcut, true)

  step = 'fix'
  const fixed = await mgr.fixShortcuts()
  assert.equal(fixed.ok, true)
  assert.equal(fixed.updated, 1)
  assert.equal(mgr.info('ok').canFixShortcut, false)
})

test('defaultProductRoots resolves sidecar_data parent for composer hub verification', async () => {
  const tmp = mkdtempSync(join(tmpdir(), 'agy-skins-roots-'))
  let seenToken = ''
  const server = createServer((req, res) => {
    seenToken = String(req.headers['x-codeium-csrf-token'] || '')
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end('{}')
  })

  try {
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
    const { port } = server.address()
    const productRoot = join(tmp, 'antigravity')
    const dataDir = join(productRoot, 'sidecar_data', 'agy-skins', 'wallpaper_engine', 'data')
    const daemonDir = join(productRoot, 'daemon')
    mkdirSync(dataDir, { recursive: true })
    mkdirSync(daemonDir, { recursive: true })
    writeFileSync(
      join(daemonDir, `hub_${port}.json`),
      JSON.stringify({ httpPort: port, httpsPort: 4370, pid: process.pid }),
      'utf8'
    )

    const env = {
      ANTIGRAVITY_EXECUTABLE_DATA_DIR: dataDir,
      ANTIGRAVITY_LS_ADDRESS: `127.0.0.1:${port}`,
      ANTIGRAVITY_CSRF_TOKEN: 'csrf-test-token'
    }

    const roots = defaultProductRoots(env)
    assert.equal(roots[0], productRoot)

    const resolveOrigin = createComposerOriginResolver(roots, env)
    const origin = await resolveOrigin()
    assert.equal(origin, 'https://127.0.0.1:4370')
    assert.equal(seenToken, 'csrf-test-token')
  } finally {
    await new Promise(resolve => server.close(resolve))
    rmSync(tmp, { recursive: true, force: true })
  }
})
