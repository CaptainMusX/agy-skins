import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { HostEntries, createHostEntries } from '../src/engine/host-entries.js'
import { SETTINGS_SIDEBAR_LABEL } from '../src/shared/i18n.js'

const ROOT = resolve(import.meta.dirname, '..')

test('plugin.json registers English iconless Wallpaper v2.2.0 nav/displayName', () => {
  const manifest = JSON.parse(readFileSync(join(ROOT, 'plugin.json'), 'utf8'))
  assert.equal(manifest.displayName, 'Wallpaper')
  assert.equal(manifest.version, '2.2.0')
  assert.equal(SETTINGS_SIDEBAR_LABEL, 'Wallpaper')
})

test('HostEntries exposes start/update/destroy lifecycle and mounts native DOM without iframes or sidebar icons', () => {
  const entry = new HostEntries()
  assert.equal(typeof entry.start, 'function')
  assert.equal(typeof entry.update, 'function')
  assert.equal(typeof entry.destroy, 'function')

  const created = createHostEntries()
  assert.equal(typeof created.start, 'function')

  const rawSrc = readFileSync(join(ROOT, 'src', 'engine', 'host-entries.js'), 'utf8')
  const codeOnly = rawSrc.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')
  assert.equal(/<iframe/i.test(codeOnly), false, 'Settings & modal must not embed iframes')
  assert.equal(/createElement\s*\(\s*['"]iframe['"]\s*\)/i.test(codeOnly), false)
  assert.equal(/<svg/i.test(codeOnly), false, 'Settings nav item must not inject SVG icons')
  assert.match(codeOnly, /SETTINGS_SIDEBAR_LABEL/)
})
