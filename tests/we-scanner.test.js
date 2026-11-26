import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { readWallpaperProject, readWeConfigMeta, scanWallpaperEngine, detectWeAssetsDirSync } from '../sidecars/wallpaper_engine/we_scanner.mjs'

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
    assert.equal(item.contentrating, 'everyone')
    assert.equal(item.width, 1920)
    assert.equal(item.height, 1080)
    const visible = item.properties.filter(p => !p.hidden)
    assert.equal(visible.length, 2)
    assert.equal(visible[0].name, 'schemecolor')
    assert.equal(visible[1].text, '速度')
    assert.equal(item.workshopId, '1001')

    writeFileSync(join(sceneDir, 'project.json'), JSON.stringify({
      title: 'Questionable Clip',
      type: 'scene',
      file: 'scene.json',
      contentrating: 'Questionable'
    }))
    assert.equal((await readWallpaperProject(sceneDir, 'workshop')).contentrating, 'pg13')

    writeFileSync(join(sceneDir, 'project.json'), JSON.stringify({
      title: 'Mature Clip',
      type: 'scene',
      file: 'scene.json',
      contentrating: 'Mature'
    }))
    assert.equal((await readWallpaperProject(sceneDir, 'workshop')).contentrating, 'mature')

    writeFileSync(join(sceneDir, 'project.json'), JSON.stringify({
      title: 'Unrated Clip',
      type: 'scene',
      file: 'scene.json'
    }))
    assert.equal((await readWallpaperProject(sceneDir, 'workshop')).contentrating, 'unrated')
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test('scanWallpaperEngine excludes projects hidden in visibility.json and imports Monitor0 wproperties overrides', async () => {
  const root = mkdtempSync(join(tmpdir(), 'agy-scan-vis-'))
  try {
    const fakeSteam = join(root, 'Steam')
    const defaultProj = join(fakeSteam, 'steamapps', 'common', 'wallpaper_engine', 'projects', 'defaultprojects')
    const sheepDir = join(defaultProj, 'sheep')
    const keepDir = join(defaultProj, 'dino_run')
    const wsDir = join(fakeSteam, 'steamapps', 'workshop', 'content', '431960', '9001')
    mkdirSync(sheepDir, { recursive: true })
    mkdirSync(keepDir, { recursive: true })
    mkdirSync(wsDir, { recursive: true })

    writeFileSync(join(sheepDir, 'bg.png'), makeMinimalPng(800, 600))
    writeFileSync(join(sheepDir, 'project.json'), JSON.stringify({ title: 'Sheep', type: 'image', file: 'bg.png' }))

    writeFileSync(join(keepDir, 'bg.png'), makeMinimalPng(800, 600))
    writeFileSync(join(keepDir, 'project.json'), JSON.stringify({ title: 'Dino Run', type: 'image', file: 'bg.png', contentrating: 'Everyone' }))

    writeFileSync(join(defaultProj, 'visibility.json'), JSON.stringify({ sheep: false, dino_run: true }))

    writeFileSync(join(wsDir, 'scene.pkg'), Buffer.from('PKG0'))
    writeFileSync(join(wsDir, 'project.json'), JSON.stringify({
      title: 'Elaina',
      type: 'scene',
      file: 'scene.json',
      contentrating: 'Questionable',
      general: {
        properties: {
          speed: { type: 'slider', text: 'Speed', value: 1.0, min: 0, max: 5, order: 1 }
        }
      }
    }))

    const weCfgPath = join(fakeSteam, 'steamapps', 'common', 'wallpaper_engine', 'config.json')
    writeFileSync(weCfgPath, JSON.stringify({
      UserA: {
        wproperties: {
          [join(wsDir, 'scene.pkg').replace(/\\/g, '/')]: {
            Monitor0: { speed: 2.5 },
            Monitor1: { speed: 4.0 }
          }
        }
      }
    }))

    const meta = readWeConfigMeta([weCfgPath])
    assert.ok(meta.wpropertiesMap.size > 0)

    const res = await scanWallpaperEngine({ manualRoots: [fakeSteam], env: { HOME: root, USERPROFILE: root } })
    assert.equal(res.items.some(i => i.title === 'Sheep'), false)
    assert.equal(res.items.some(i => i.title === 'Dino Run'), true)
    const wsItem = res.items.find(i => i.title === 'Elaina')
    assert.ok(wsItem)
    assert.equal(wsItem.contentrating, 'pg13')
    const speedProp = wsItem.properties.find(p => p.name === 'speed')
    assert.equal(speedProp.default, 1)
    assert.equal(speedProp.value, 2.5)
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test('scanWallpaperEngine resolves Workshop dependency presets, skips thumbnail-only dirs, and detects weAssetsDir', async () => {
  const root = mkdtempSync(join(tmpdir(), 'agy-scan-dep-'))
  try {
    const fakeSteam = join(root, 'Steam')
    const assetsMatDir = join(fakeSteam, 'steamapps', 'common', 'wallpaper_engine', 'assets', 'materials')
    const wsRoot = join(fakeSteam, 'steamapps', 'workshop', 'content', '431960')
    const baseDir = join(wsRoot, '3509')
    const presetDir = join(wsRoot, '3528')
    const thumbOnlyDir = join(wsRoot, '9999')
    mkdirSync(assetsMatDir, { recursive: true })
    mkdirSync(baseDir, { recursive: true })
    mkdirSync(presetDir, { recursive: true })
    mkdirSync(thumbOnlyDir, { recursive: true })

    writeFileSync(join(baseDir, 'scene.pkg'), Buffer.from('PKG0'))
    writeFileSync(join(baseDir, 'preview.png'), makeMinimalPng(1280, 720))
    writeFileSync(join(baseDir, 'project.json'), JSON.stringify({
      title: 'Three Body Base',
      type: 'scene',
      file: 'scene.json',
      preview: 'preview.png',
      contentrating: 'Everyone',
      general: {
        properties: {
          speed: { type: 'slider', text: 'Speed', value: 1, min: 0, max: 10, order: 1 },
          schemecolor: { type: 'color', text: 'ui_browse_properties_scheme_color', value: '0 0 0', order: 0 }
        }
      }
    }))

    writeFileSync(join(presetDir, 'preview.png'), makeMinimalPng(800, 1200))
    writeFileSync(join(presetDir, 'project.json'), JSON.stringify({
      title: 'Portrait Three Body Preset',
      dependency: '3509',
      preview: 'preview.png',
      contentrating: 'Everyone',
      preset: {
        speed: 5,
        schemecolor: '1 1 1'
      }
    }))

    writeFileSync(join(thumbOnlyDir, 'preview.png'), makeMinimalPng(400, 400))
    writeFileSync(join(thumbOnlyDir, 'project.json'), JSON.stringify({
      title: 'Broken Thumb Only',
      preview: 'preview.png',
      contentrating: 'Everyone'
    }))

    const res = await scanWallpaperEngine({ manualRoots: [fakeSteam], env: { HOME: root, USERPROFILE: root } })
    assert.ok(res.weAssetsDir && res.weAssetsDir.toLowerCase().endsWith('assets'))
    assert.equal(res.items.some(i => i.title === 'Broken Thumb Only'), false)

    const presetItem = res.items.find(i => i.title === 'Portrait Three Body Preset')
    assert.ok(presetItem)
    assert.equal(presetItem.kind, 'scene')
    assert.equal(presetItem.mediaType, 'scene')
    assert.equal(presetItem.staticFallback, false)
    assert.equal(presetItem.dir, presetDir)
    assert.equal(presetItem.sceneDir, baseDir)
    assert.equal(presetItem.mediaPath, join(baseDir, 'scene.pkg'))
    assert.equal(presetItem.previewPath, join(presetDir, 'preview.png'))
    assert.equal(presetItem.properties.find(p => p.name === 'speed')?.value, 5)
    assert.equal(presetItem.properties.find(p => p.name === 'speed')?.default, 1)
  } finally {
    rmSync(root, { recursive: true, force: true })
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

test('detectWeAssetsDirSync resolves Wallpaper Engine assets synchronously via env', () => {
  const root = mkdtempSync(join(tmpdir(), 'agy-assets-sync-'))
  try {
    const fakeSteam = join(root, 'Steam')
    const assetsDir = join(fakeSteam, 'steamapps', 'common', 'wallpaper_engine', 'assets')
    mkdirSync(join(assetsDir, 'materials'), { recursive: true })

    const resolvedSteam = detectWeAssetsDirSync({ env: { AGY_WE_STEAM_ROOT: fakeSteam } })
    assert.equal(resolvedSteam, assetsDir)

    const resolvedDirect = detectWeAssetsDirSync({ env: { AGY_WE_ASSETS_DIR: assetsDir } })
    assert.equal(resolvedDirect, assetsDir)
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})
