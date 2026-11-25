import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

const ROOT = resolve(import.meta.dirname, '..')
const ALLOWED_PLUGIN_KEYS = new Set([
  'name', 'displayName', 'version', 'description', 'logo',
  'suggestedPrompts', 'author', 'homepage', 'repository', 'disabled'
])

test('plugin.json uses only valid Antigravity plugin schema fields and references existing assets', () => {
  const manifest = JSON.parse(readFileSync(join(ROOT, 'plugin.json'), 'utf8'))
  for (const key of Object.keys(manifest)) {
    assert.ok(ALLOWED_PLUGIN_KEYS.has(key), `Unexpected plugin.json field: ${key}`)
  }
  assert.equal(manifest.name, 'agy-skins')
  assert.ok(existsSync(join(ROOT, manifest.logo)))

  const sidecar = JSON.parse(readFileSync(join(ROOT, 'sidecars', 'wallpaper_engine', 'sidecar.json'), 'utf8'))
  assert.equal(sidecar.command, 'node')
  assert.equal(sidecar.args[0], 'server.mjs')
  assert.equal(sidecar.ui_config?.views?.[0]?.entrypoint, 'SIDECAR_UI_ENTRYPOINT_AUX_PANE')
})

test('license, third-party notices, and built dist assets exist', () => {
  for (const rel of [
    'LICENSE',
    'LICENSING.md',
    'THIRD-PARTY-NOTICES.md',
    'sidecars/wallpaper_engine/dist/runtime.js',
    'sidecars/wallpaper_engine/dist/panel.js',
    'sidecars/wallpaper_engine/dist/panel.css',
    'sidecars/wallpaper_engine/webwallgl/engine/webwallgl.global.min.js'
  ]) {
    assert.ok(existsSync(join(ROOT, rel)), `Missing required file: ${rel}`)
  }
})
