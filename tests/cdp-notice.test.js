import test from 'node:test'
import assert from 'node:assert/strict'
import { createCdpNoticeManager, defaultPortFiles } from '../sidecars/wallpaper_engine/cdp_notice.mjs'

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
