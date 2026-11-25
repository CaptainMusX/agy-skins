import { execFile } from 'node:child_process'
import { existsSync } from 'node:fs'
import { open, readdir, readFile, stat } from 'node:fs/promises'
import { homedir } from 'node:os'
import { extname, join, resolve } from 'node:path'
import { promisify } from 'node:util'

const exec = promisify(execFile)

const STEAM_APP_ID = '431960'
const VIDEO_EXTENSIONS = /\.(mp4|webm|mov|mkv|avi)$/i
const IMAGE_EXTENSIONS = /\.(png|jpe?g|webp|gif|bmp)$/i
const SLIDE_SWITCH_MS = { 1: 60_000, 2: 300_000, 3: 600_000, 4: 1_800_000, 5: 3_600_000 }
const PROP_TYPES = new Set([
  'color', 'bool', 'slider', 'combo', 'text', 'textinput', 'file', 'directory', 'group', 'other'
])
const PROP_LANGS = ['zh-chs', 'zh-cht', 'en-us']

const stripHtml = value => typeof value !== 'string' ? '' : value
  .replace(/<br\s*\/?>/gi, '\n')
  .replace(/<[^>]*>/g, '')
  .replace(/&nbsp;/gi, ' ')
  .replace(/&amp;/gi, '&')
  .replace(/&lt;/gi, '<')
  .replace(/&gt;/gi, '>')
  .replace(/&quot;/gi, '"')
  .replace(/&#0?39;|&apos;/gi, "'")
  .trim()

export function safeProjectPath(dir, relative) {
  if (typeof relative !== 'string' || !relative.trim()) return null
  const parts = relative.replace(/\\/g, '/').split('/').filter(Boolean)
  if (!parts.length || parts.some(part => part === '.' || part === '..' || part.includes(':'))) return null
  return join(dir, ...parts)
}

function propertyText(project, key, fallback) {
  const table = project?.general?.localization
  if (table && typeof table === 'object') {
    for (const language of PROP_LANGS) {
      const entry = Object.entries(table).find(([name]) => name.toLowerCase() === language)?.[1]
      if (entry && typeof entry === 'object' && typeof entry[key] === 'string') {
        const localized = stripHtml(entry[key])
        if (localized) return localized
      }
    }
  }
  return stripHtml(key) || fallback
}

function propertyDefault(type, definition) {
  if (!definition || !('value' in definition)) return null
  const value = definition.value
  if (value === undefined || value === null) return null
  if (type === 'bool') return typeof value === 'boolean' ? value : null
  if (type === 'slider') return Number.isFinite(Number(value)) ? Number(value) : null
  if (type === 'combo') return value
  if (type === 'color') return typeof value === 'string' ? value : null
  return typeof value === 'string' ? value : JSON.stringify(value)
}

export function parseProjectProperties(project) {
  const source = project?.general?.properties
  if (!source || typeof source !== 'object' || Array.isArray(source)) return []
  return Object.entries(source)
    .filter(([, definition]) => definition && typeof definition === 'object' && typeof definition.type === 'string')
    .sort((left, right) => {
      const order = Number(left[1].order || 0) - Number(right[1].order || 0)
      return order || (left[0] < right[0] ? -1 : left[0] > right[0] ? 1 : 0)
    })
    .slice(0, 100)
    .map(([name, definition]) => {
      const rawType = String(definition.type || 'other').toLowerCase()
      const type = PROP_TYPES.has(rawType) ? rawType : 'other'
      const entry = {
        name: name.slice(0, 120),
        type,
        text: propertyText(project, typeof definition.text === 'string' ? definition.text : name, name).slice(0, 240),
        order: Number.isFinite(Number(definition.order)) ? Number(definition.order) : 0,
        value: propertyDefault(type, definition),
        hidden: definition.editable === false
      }
      if (Array.isArray(definition.options)) {
        entry.options = definition.options
          .filter(option => option && typeof option === 'object' && 'value' in option)
          .slice(0, 200)
          .map(option => ({
            label: propertyText(project, typeof option.label === 'string' ? option.label : '', String(option.value)).slice(0, 160),
            value: option.value
          }))
      }
      for (const key of ['min', 'max', 'step', 'precision']) {
        if (Number.isFinite(Number(definition[key]))) entry[key] = Number(definition[key])
      }
      if (typeof definition.fileType === 'string') entry.fileType = definition.fileType.slice(0, 20)
      return entry
    })
}

export function parseSteamLibraryFolders(text) {
  if (typeof text !== 'string') return []
  const paths = []
  const pattern = /"path"\s*"((?:\\.|[^"\\])*)"/g
  for (const match of text.matchAll(pattern)) {
    const raw = match[1].replace(/\\\\/g, '\\')
    if (/^(?:[A-Za-z]:\\|\/)/.test(raw)) paths.push(raw)
  }
  return [...new Set(paths)]
}

export async function readImageDimensions(filePath) {
  if (!filePath) return { width: 0, height: 0 }
  const ext = extname(filePath).toLowerCase()
  if (!['.png', '.jpg', '.jpeg', '.gif', '.webp'].includes(ext)) return { width: 0, height: 0 }
  let fh
  try {
    fh = await open(filePath, 'r')
    const buf = Buffer.alloc(16384)
    const { bytesRead } = await fh.read(buf, 0, buf.length, 0)
    const slice = buf.subarray(0, bytesRead)
    if (ext === '.png' && slice.length >= 24 && slice.readUInt32BE(0) === 0x89504e47) {
      const w = slice.readUInt32BE(16)
      const h = slice.readUInt32BE(20)
      if (w > 0 && h > 0 && w <= 32768 && h <= 32768) return { width: w, height: h }
    }
    if (ext === '.gif' && slice.length >= 10 && slice.toString('ascii', 0, 3) === 'GIF') {
      return { width: slice.readUInt16LE(6), height: slice.readUInt16LE(8) }
    }
    if ((ext === '.jpg' || ext === '.jpeg') && slice.length >= 16 && slice[0] === 0xff && slice[1] === 0xd8) {
      let i = 2
      while (i + 9 < slice.length) {
        if (slice[i] !== 0xff) { i++; continue }
        const marker = slice[i + 1]
        if (marker === 0xff) { i++; continue }
        if (marker === 0xc0 || marker === 0xc1 || marker === 0xc2) {
          return { width: slice.readUInt16BE(i + 7), height: slice.readUInt16BE(i + 5) }
        }
        if (marker === 0xd8 || marker === 0xd9) break
        const segLen = slice.readUInt16BE(i + 2)
        if (segLen < 2) break
        i += 2 + segLen
      }
    }
  } catch {
    return { width: 0, height: 0 }
  } finally {
    try { await fh?.close() } catch {}
  }
  return { width: 0, height: 0 }
}

async function listPictures(dir, depth = 0) {
  if (depth > 3) return []
  let entries
  try { entries = await readdir(dir, { withFileTypes: true }) } catch { return [] }
  const images = []
  const subdirs = []
  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue
    const full = join(dir, entry.name)
    if (entry.isDirectory()) subdirs.push(full)
    else if (entry.isFile() && IMAGE_EXTENSIONS.test(entry.name)) images.push(full)
    if (images.length >= 200) break
  }
  for (const sub of subdirs) {
    if (images.length >= 200) break
    images.push(...await listPictures(sub, depth + 1))
  }
  return images.sort((a, b) => a.localeCompare(b, undefined, { numeric: true })).slice(0, 200)
}

async function readPictureSlides(dir, project) {
  const preset = project?.preset && typeof project.preset === 'object' ? project.preset : null
  if (!preset) return null
  const mode = Number(preset.wallpapermode)
  const custom = typeof preset.customdirectory === 'string' ? preset.customdirectory.trim() : ''
  const single = typeof preset.image === 'string' ? preset.image.trim() : ''
  let slides = []
  if (custom && (mode === 1 || mode === 2)) {
    const base = safeProjectPath(dir, custom)
    if (base) slides = await listPictures(base)
  } else if (single && IMAGE_EXTENSIONS.test(single)) {
    const p = safeProjectPath(dir, single)
    if (p && existsSync(p)) slides = [p]
  }
  if (!slides.length) return null
  const interval = Number(preset.imageswitchtimes)
  return { slides, slideIntervalMs: SLIDE_SWITCH_MS[interval] || null }
}

async function mapLimit(items, limit, fn) {
  let cursor = 0
  const results = new Array(items.length)
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const idx = cursor++
      results[idx] = await fn(items[idx])
    }
  }))
  return results
}

export async function readWallpaperProject(dir, source = 'manual') {
  const pjPath = join(dir, 'project.json')
  if (!existsSync(pjPath)) return null
  let project
  try {
    const raw = await readFile(pjPath, 'utf8')
    project = JSON.parse(raw.replace(/^\uFEFF/, ''))
  } catch {
    return null
  }
  if (!project || typeof project !== 'object') return null

  const kind = String(project.type || '').toLowerCase()
  const mainPath = safeProjectPath(dir, project.file)
  const candidatePreview = safeProjectPath(dir, project.preview)
  const previewPath = candidatePreview && IMAGE_EXTENSIONS.test(candidatePreview) ? candidatePreview : null

  const mainExists = Boolean(mainPath && existsSync(mainPath))
  const previewExists = Boolean(previewPath && existsSync(previewPath))
  const scenePkgPath = join(dir, 'scene.pkg')
  const sceneJsonPath = join(dir, 'scene.json')
  const hasSceneFiles = kind === 'scene' && (existsSync(scenePkgPath) || existsSync(sceneJsonPath))

  const canPlayVideo = kind === 'video' && mainExists && VIDEO_EXTENSIONS.test(mainPath)
  const canShowImage = kind === 'image' && mainExists && IMAGE_EXTENSIONS.test(mainPath)
  const canShowWeb = kind === 'web' && mainExists && /\.html?$/i.test(mainPath)
  const picture = !canPlayVideo && !canShowWeb && !hasSceneFiles ? await readPictureSlides(dir, project) : null

  const mediaType = hasSceneFiles ? 'scene' : canPlayVideo ? 'video' : canShowWeb ? 'web' : 'image'
  const mediaPath = hasSceneFiles
    ? (existsSync(scenePkgPath) ? scenePkgPath : sceneJsonPath)
    : (canPlayVideo || canShowImage || canShowWeb ? mainPath : (picture?.slides?.[0] || (previewExists ? previewPath : null)))
  if (!mediaPath) return null

  let mtimeMs = 0
  try {
    mtimeMs = (await stat(dir)).mtimeMs
    const mainStat = await stat(mediaPath)
    mtimeMs = Math.max(mtimeMs, mainStat.mtimeMs)
  } catch {}

  const dimsTarget = previewExists ? previewPath : (mediaType === 'image' ? mediaPath : null)
  const dims = await readImageDimensions(dimsTarget)

  const title = typeof project.title === 'string' && project.title.trim()
    ? project.title.trim().slice(0, 120)
    : dir.split(/[\\/]/).at(-1)

  return {
    id: dir.toLowerCase(),
    title,
    kind: picture ? 'image' : (kind || mediaType),
    source,
    contentrating: typeof project.contentrating === 'string' ? project.contentrating : null,
    dir: resolve(dir),
    mediaPath: resolve(mediaPath),
    mediaType,
    slides: picture?.slides || (canShowImage ? [mainPath] : []),
    slideIntervalMs: picture?.slideIntervalMs || null,
    previewPath: previewExists ? resolve(previewPath) : (mediaType === 'image' ? resolve(mediaPath) : null),
    staticFallback: !hasSceneFiles && !canPlayVideo && !canShowImage && !canShowWeb && !picture,
    workshopId: typeof project.workshopid === 'string' ? project.workshopid : null,
    width: dims.width,
    height: dims.height,
    mtimeMs,
    properties: parseProjectProperties(project)
  }
}

async function scanContainer(root, source) {
  if (!existsSync(root)) return []
  if (existsSync(join(root, 'project.json'))) {
    const one = await readWallpaperProject(root, source)
    return one ? [one] : []
  }
  let entries
  try {
    entries = await readdir(root, { withFileTypes: true })
  } catch {
    return []
  }
  const dirs = entries.filter(e => e.isDirectory()).slice(0, 1500)
  return (await mapLimit(dirs, 8, entry => readWallpaperProject(join(root, entry.name), source))).filter(Boolean)
}

async function readSteamPathFromRegistry() {
  if (process.platform !== 'win32') return null
  try {
    const { stdout } = await exec('reg', ['query', 'HKCU\\Software\\Valve\\Steam', '/v', 'SteamPath'], {
      encoding: 'utf8', timeout: 1500, windowsHide: true
    })
    const match = stdout.match(/SteamPath\s+REG_SZ\s+(.+)/i)
    if (match?.[1]) return match[1].trim().replace(/\//g, '\\')
  } catch {}
  return null
}

export async function scanWallpaperEngine({ manualRoots = [], env = process.env, fileUrl = null } = {}) {
  const probes = []
  const regSteam = await readSteamPathFromRegistry()
  if (regSteam) probes.push(regSteam)

  if (process.platform === 'win32') {
    for (const drive of ['C', 'D', 'E', 'F', 'G', 'H']) {
      for (const suffix of ['Program Files (x86)\\Steam', 'Program Files\\Steam', 'Steam', 'SteamLibrary']) {
        probes.push(`${drive}:\\${suffix}`)
      }
    }
  } else {
    const home = homedir()
    probes.push(
      join(home, '.local', 'share', 'Steam'),
      join(home, '.steam', 'steam'),
      join(home, 'Library', 'Application Support', 'Steam')
    )
  }

  const validManual = [
    ...(Array.isArray(manualRoots) ? manualRoots : []),
    ...(env.AGY_WE_WORKSHOP_DIR ? [env.AGY_WE_WORKSHOP_DIR] : [])
  ].filter(r => typeof r === 'string' && /^(?:[A-Za-z]:[\\/]|\/)/.test(r))

  const libraries = new Map()
  const addLib = p => {
    const resolved = resolve(p)
    const key = resolved.toLowerCase()
    if (!libraries.has(key)) libraries.set(key, resolved)
  }
  for (const candidate of [...new Set([...validManual, ...probes])]) {
    if (existsSync(join(candidate, 'steamapps'))) addLib(candidate)
  }
  for (const root of [...libraries.values()]) {
    const vdfPath = join(root, 'steamapps', 'libraryfolders.vdf')
    if (!existsSync(vdfPath)) continue
    try {
      const vdf = await readFile(vdfPath, 'utf8')
      for (const lib of parseSteamLibraryFolders(vdf)) {
        if (existsSync(join(lib, 'steamapps'))) addLib(lib)
      }
    } catch {}
  }

  const containers = []
  for (const root of libraries.values()) {
    containers.push([join(root, 'steamapps', 'workshop', 'content', STEAM_APP_ID), 'workshop'])
    const projects = join(root, 'steamapps', 'common', 'wallpaper_engine', 'projects')
    containers.push([join(projects, 'myprojects'), 'local'])
    containers.push([join(projects, 'defaultprojects'), 'built-in'])
  }
  for (const root of validManual) {
    containers.push([root, 'manual'])
    containers.push([join(root, STEAM_APP_ID), 'manual'])
    containers.push([join(root, 'myprojects'), 'manual'])
    containers.push([join(root, 'defaultprojects'), 'manual'])
    containers.push([join(root, 'projects', 'myprojects'), 'manual'])
    containers.push([join(root, 'projects', 'defaultprojects'), 'manual'])
    containers.push([join(root, 'workshop', 'content', STEAM_APP_ID), 'manual'])
    containers.push([join(root, 'common', 'wallpaper_engine', 'projects', 'myprojects'), 'manual'])
    containers.push([join(root, 'common', 'wallpaper_engine', 'projects', 'defaultprojects'), 'manual'])
  }

  const uniqueContainers = [...new Map(containers.map(([p, src]) => [resolve(p).toLowerCase(), [resolve(p), src]])).values()]
  const scanned = await mapLimit(uniqueContainers, 4, ([p, src]) => scanContainer(p, src))
  const items = [...new Map(scanned.flat().map(item => [item.id, item])).values()]
    .map(item => ({
      ...item,
      previewUrl: item.previewPath && typeof fileUrl === 'function' ? fileUrl(item.previewPath) : null
    }))
    .sort((a, b) => (b.mtimeMs || 0) - (a.mtimeMs || 0))

  return { items, libraries: [...libraries.values()], error: null }
}
