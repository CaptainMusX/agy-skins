import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { readWallpaperProject, scanWallpaperEngine } from '../sidecars/wallpaper_engine/we_scanner.mjs'

function makeMinimalPng(width, height) {
  const buf = Buffer.alloc(24)
  Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]).copy(buf, 0)
  buf.writeUInt32BE(13, 8)
  buf.write('IHDR', 12, 'ascii')
  buf.writeUInt32BE(width, 16)
  buf.writeUInt32BE(height, 20)
  return buf
}

test('readWallpaperProject parses scene and video projects with preview PNG dimensions and localization', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'agy-we-'))
  try {
    const sceneDir = join(dir, '1001')
    mkdirSync(sceneDir, { recursive: true })
    writeFileSync(join(sceneDir, 'preview.png'), makeMinimalPng(1920, 1080))
    writeFileSync(join(sceneDir, 'scene.pkg'), Buffer.from('PKG0'))
    writeFileSync(join(sceneDir, 'project.json'), JSON.stringify({
      title: 'Cyber City',
      type: 'scene',
      file: 'scene.json',
      preview: 'preview.png',
      contentrating: 'Everyone',
      workshopid: '1001',
      general: {
        localization: { 'zh-chs': { ui_speed: '速度' } },
        properties: {
          divider: { type: 'text', text: '<h4>Settings Divider</h4>', value: '', order: 0 },
          speed: { type: 'slider', text: 'ui_speed', value: 1.5, min: 0.5, max: 3, order: 10 },
          schemecolor: { type: 'color', text: 'ui_browse_properties_scheme_color', value: '0 0 0', order: 2 }
        }
      }
    }))

    const item = await readWallpaperProject(sceneDir, 'workshop')
    assert.ok(item)
    assert.equal(item.kind, 'scene')
    assert.equal(item.width, 1920)
    assert.equal(item.height, 1080)
    const visible = item.properties.filter(p => !p.hidden)
    assert.equal(visible.length, 2)
    assert.equal(visible[0].name, 'schemecolor')
    assert.equal(visible[1].text, '速度')
    assert.equal(item.workshopId, '1001')
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test('scanWallpaperEngine discovers projects under manualRoots cleanly', async () => {
  const root = mkdtempSync(join(tmpdir(), 'agy-scan-'))
  try {
    const vidDir = join(root, '2002')
    mkdirSync(vidDir, { recursive: true })
    writeFileSync(join(vidDir, 'loop.mp4'), Buffer.from('0000'))
    writeFileSync(join(vidDir, 'project.json'), JSON.stringify({
      title: 'Neon Rain',
      type: 'video',
      file: 'loop.mp4'
    }))

    const res = await scanWallpaperEngine({ manualRoots: [root], env: { HOME: root, USERPROFILE: root } })
    const found = res.items.find(i => i.title === 'Neon Rain')
    assert.ok(found)
    assert.equal(found.kind, 'video')
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})
