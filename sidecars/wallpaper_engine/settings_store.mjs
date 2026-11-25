import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync, chmodSync } from 'node:fs'
import { randomBytes } from 'node:crypto'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'
import { DEFAULT_CONFIG, normalizeConfig } from '../../src/shared/config.js'

export function resolveDataDir(env = process.env) {
  if (env.AGY_SKINS_DATA_DIR?.trim()) return env.AGY_SKINS_DATA_DIR.trim()
  return join(homedir(), '.gemini', 'config', 'agy-skins')
}

function readJson(filePath, fallback) {
  try {
    if (!existsSync(filePath)) return fallback
    return JSON.parse(readFileSync(filePath, 'utf8'))
  } catch {
    return fallback
  }
}

function writeJsonAtomic(filePath, value) {
  mkdirSync(dirname(filePath), { recursive: true })
  const tmp = `${filePath}.${process.pid}.tmp`
  writeFileSync(tmp, JSON.stringify(value, null, 2) + '\n', 'utf8')
  renameSync(tmp, filePath)
}

export function sanitizeWeCacheItem(item) {
  if (!item || typeof item !== 'object') return null
  if (typeof item.id !== 'string' || typeof item.title !== 'string' ||
      typeof item.dir !== 'string' || typeof item.mediaPath !== 'string') return null
  return {
    id: item.id.slice(0, 1024),
    title: item.title.slice(0, 120),
    kind: String(item.kind || '').slice(0, 20),
    source: String(item.source || '').slice(0, 20),
    contentrating: typeof item.contentrating === 'string' ? item.contentrating.slice(0, 20) : null,
    dir: item.dir.slice(0, 1024),
    mediaPath: item.mediaPath.slice(0, 1024),
    mediaType: String(item.mediaType || '').slice(0, 20),
    previewPath: typeof item.previewPath === 'string' ? item.previewPath.slice(0, 1024) : null,
    slides: Array.isArray(item.slides)
      ? item.slides.filter(p => typeof p === 'string' && p.length <= 1024).slice(0, 200)
      : [],
    slideIntervalMs: Number.isFinite(Number(item.slideIntervalMs)) ? Number(item.slideIntervalMs) : null,
    staticFallback: Boolean(item.staticFallback),
    workshopId: typeof item.workshopId === 'string' ? item.workshopId.slice(0, 40) : null,
    width: Number.isFinite(Number(item.width)) ? Number(item.width) : 0,
    height: Number.isFinite(Number(item.height)) ? Number(item.height) : 0,
    mtimeMs: Number.isFinite(Number(item.mtimeMs)) ? Number(item.mtimeMs) : 0,
    properties: Array.isArray(item.properties) ? item.properties.slice(0, 100).map(p => ({
      name: String(p?.name || '').slice(0, 120),
      type: String(p?.type || 'other').slice(0, 20),
      text: String(p?.text || '').slice(0, 240),
      order: Number(p?.order) || 0,
      value: p?.value ?? null,
      hidden: p?.hidden === true,
      options: Array.isArray(p?.options) ? p.options.slice(0, 200).map(o => ({
        label: String(o?.label || '').slice(0, 160),
        value: o?.value ?? null
      })) : undefined,
      min: Number.isFinite(Number(p?.min)) ? Number(p.min) : undefined,
      max: Number.isFinite(Number(p?.max)) ? Number(p.max) : undefined,
      step: Number.isFinite(Number(p?.step)) ? Number(p.step) : undefined,
      precision: Number.isFinite(Number(p?.precision)) ? Number(p.precision) : undefined,
      fileType: typeof p?.fileType === 'string' ? p.fileType.slice(0, 20) : undefined
    })) : []
  }
}

export function createSettingsStore(options = {}) {
  const dataDir = options.dataDir || resolveDataDir(options.env)
  const configPath = join(dataDir, 'config.json')
  const weCachePath = join(dataDir, 'we_cache.json')
  const keyPath = join(dataDir, 'we-media.key')
  const uploadsDir = join(dataDir, 'uploads')
  const sceneCacheDir = join(dataDir, 'scene-cache')

  let current = normalizeConfig(readJson(configPath, DEFAULT_CONFIG))
  let weCache = (Array.isArray(readJson(weCachePath, [])) ? readJson(weCachePath, []) : [])
    .map(sanitizeWeCacheItem)
    .filter(Boolean)
    .slice(0, 2000)

  let saveTimer = null
  let pendingConfig = null
  let secretCache = null
  const listeners = new Set()

  function notify() {
    for (const fn of listeners) {
      try { fn(current) } catch {}
    }
  }

  function flush() {
    if (saveTimer !== null) {
      clearTimeout(saveTimer)
      saveTimer = null
    }
    if (pendingConfig) {
      writeJsonAtomic(configPath, pendingConfig)
      pendingConfig = null
    }
  }

  function getConfig() {
    return current
  }

  function updateConfig(patch, { deferPersistence = false } = {}) {
    const next = normalizeConfig(typeof patch === 'function' ? patch(current) : { ...current, ...patch })
    const changed = JSON.stringify(next) !== JSON.stringify(current)
    current = next
    if (changed) {
      pendingConfig = next
      if (deferPersistence) {
        if (saveTimer !== null) clearTimeout(saveTimer)
        saveTimer = setTimeout(flush, 200)
      } else {
        flush()
      }
      notify()
    } else if (!deferPersistence) {
      flush()
    }
    return current
  }

  function getWeItems() {
    return weCache
  }

  function setWeItems(items) {
    weCache = (Array.isArray(items) ? items : [])
      .map(sanitizeWeCacheItem)
      .filter(Boolean)
      .slice(0, 2000)
    writeJsonAtomic(weCachePath, weCache)
    return weCache
  }

  function getMediaSecret() {
    if (secretCache) return secretCache
    try {
      if (existsSync(keyPath)) {
        const raw = readFileSync(keyPath, 'ascii').trim()
        if (/^[0-9a-f]{64}$/i.test(raw)) {
          secretCache = Buffer.from(raw, 'hex')
          return secretCache
        }
      }
    } catch {}
    mkdirSync(dataDir, { recursive: true })
    const value = randomBytes(32)
    writeFileSync(keyPath, value.toString('hex') + '\n', { encoding: 'ascii', mode: 0o600 })
    try { chmodSync(keyPath, 0o600) } catch {}
    secretCache = value
    return secretCache
  }

  function subscribe(fn) {
    listeners.add(fn)
    return () => listeners.delete(fn)
  }

  return {
    dataDir,
    configPath,
    weCachePath,
    uploadsDir,
    sceneCacheDir,
    getConfig,
    updateConfig,
    getWeItems,
    setWeItems,
    getMediaSecret,
    flush,
    subscribe
  }
}
