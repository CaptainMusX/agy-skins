import { execFile } from 'node:child_process'
import { createWriteStream, existsSync, lstatSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, copyFileSync } from 'node:fs'
import { pipeline } from 'node:stream/promises'
import { Readable } from 'node:stream'
import { extname, basename, join, resolve } from 'node:path'
import { promisify } from 'node:util'

const exec = promisify(execFile)

const IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.bmp'])
const VIDEO_EXTS = new Set(['.mp4', '.webm', '.mov', '.mkv', '.avi'])
const MAX_UPLOAD_BYTES = 512 * 1024 * 1024
const URL_TIMEOUT_MS = 30_000

let fontCache = null
let nowPlayingCache = { at: 0, value: null }

export function mediaKindForFile(filePath) {
  const ext = extname(filePath).toLowerCase()
  if (IMAGE_EXTS.has(ext)) return 'image'
  if (VIDEO_EXTS.has(ext)) return 'video'
  return null
}

function safeName(name, fallback = 'wallpaper') {
  const stem = String(name || '').replace(/[^a-zA-Z0-9._-]+/g, '_').replace(/^[._]+|[._]+$/g, '')
  return (stem || fallback).slice(0, 80)
}

function uniqueDestination(dir, rawName, extOverride = '') {
  mkdirSync(dir, { recursive: true })
  const ext = (extOverride || extname(rawName)).toLowerCase()
  const base = safeName(basename(rawName, extname(rawName)), 'wallpaper')
  let candidate = join(dir, `${base}${ext}`)
  let n = 1
  while (existsSync(candidate)) {
    candidate = join(dir, `${base}-${n++}${ext}`)
  }
  return candidate
}

function uploadItem(filePath, source = 'upload', fileUrl = null) {
  const kind = mediaKindForFile(filePath) || 'image'
  const st = statSync(filePath)
  const resolved = resolve(filePath)
  return {
    id: `upload:${resolved.toLowerCase()}`,
    title: basename(filePath),
    kind,
    source,
    contentrating: 'everyone',
    dir: resolve(filePath, '..'),
    mediaPath: resolved,
    mediaType: kind,
    slides: kind === 'image' ? [resolved] : [],
    slideIntervalMs: null,
    previewPath: kind === 'image' ? resolved : null,
    previewUrl: kind === 'image' && typeof fileUrl === 'function' ? fileUrl(resolved) : null,
    staticFallback: false,
    workshopId: null,
    width: 0,
    height: 0,
    mtimeMs: st.mtimeMs,
    properties: []
  }
}

export function listUploads(uploadsDir, fileUrl = null) {
  if (!existsSync(uploadsDir)) return []
  const items = []
  for (const name of readdirSync(uploadsDir).sort((a, b) => a.localeCompare(b))) {
    const full = join(uploadsDir, name)
    try {
      const lst = lstatSync(full)
      if (lst.isFile() && !lst.isSymbolicLink() && mediaKindForFile(full)) {
        items.push(uploadItem(full, 'upload', fileUrl))
      }
    } catch {}
  }
  return items
}

export function importLocalFiles(paths, uploadsDir, fileUrl = null) {
  if (!Array.isArray(paths)) return { ok: false, error: 'paths must be an array' }
  mkdirSync(uploadsDir, { recursive: true })
  const items = []
  const rejected = []
  for (const raw of paths.slice(0, 50)) {
    if (typeof raw !== 'string' || raw.length > 2048) {
      rejected.push({ path: String(raw).slice(0, 200), error: 'invalid path' })
      continue
    }
    try {
      const lst = lstatSync(raw)
      if (!lst.isFile() || lst.isSymbolicLink()) throw new Error('file not found')
      const kind = mediaKindForFile(raw)
      if (!kind) throw new Error('unsupported media type')
      if (lst.size > MAX_UPLOAD_BYTES) throw new Error('file exceeds 512 MiB')
      const dest = uniqueDestination(uploadsDir, basename(raw))
      copyFileSync(raw, dest)
      items.push(uploadItem(dest, 'upload', fileUrl))
    } catch (err) {
      rejected.push({ path: raw.slice(0, 200), error: err?.message || 'import failed' })
    }
  }
  return { ok: true, items, rejected }
}

async function downloadToFile(url, destination) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Antigravity-Wallpaper-Engine/1.0' },
    signal: AbortSignal.timeout(URL_TIMEOUT_MS)
  })
  if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`)
  const lenHeader = Number(res.headers.get('content-length') || 0)
  if (lenHeader > MAX_UPLOAD_BYTES) throw new Error('remote file exceeds 512 MiB')
  let total = 0
  const reader = Readable.fromWeb(res.body)
  reader.on('data', chunk => {
    total += chunk.length
    if (total > MAX_UPLOAD_BYTES) reader.destroy(new Error('remote file exceeds 512 MiB'))
  })
  await pipeline(reader, createWriteStream(destination))
}

export async function importUrlWallpaper(rawUrl, uploadsDir, fileUrl = null) {
  if (typeof rawUrl !== 'string' || rawUrl.length > 2048) return { ok: false, error: 'invalid URL' }
  let parsed
  try { parsed = new URL(rawUrl) } catch { return { ok: false, error: 'invalid URL' } }
  if (!['http:', 'https:'].includes(parsed.protocol) || !parsed.hostname) {
    return { ok: false, error: 'only http(s) URLs are supported' }
  }
  const suffix = extname(parsed.pathname).toLowerCase()
  if (!IMAGE_EXTS.has(suffix) && !VIDEO_EXTS.has(suffix)) {
    return { ok: false, error: 'URL must end in a supported image or video extension' }
  }
  const dest = uniqueDestination(uploadsDir, basename(parsed.pathname), suffix)
  try {
    await downloadToFile(rawUrl, dest)
    return { ok: true, item: uploadItem(dest, 'url', fileUrl) }
  } catch (err) {
    try { rmSync(dest, { force: true }) } catch {}
    return { ok: false, error: `download failed: ${err?.message || err}` }
  }
}

export async function importBingWallpaper(index = 0, uploadsDir, fileUrl = null) {
  const idx = Math.max(0, Math.min(7, Math.trunc(Number(index) || 0)))
  try {
    const res = await fetch(`https://www.bing.com/HPImageArchive.aspx?format=js&idx=${idx}&n=1&mkt=zh-CN`, {
      headers: { 'User-Agent': 'Antigravity-Wallpaper-Engine/1.0' },
      signal: AbortSignal.timeout(URL_TIMEOUT_MS)
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const payload = await res.json()
    const image = payload?.images?.[0]
    if (!image?.url) throw new Error('no Bing image returned')
    const title = safeName(image.title || 'Bing_wallpaper', 'Bing_wallpaper')
    const dest = uniqueDestination(uploadsDir, title, '.jpg')
    await downloadToFile(`https://www.bing.com${image.url}`, dest)
    const item = uploadItem(dest, 'bing', fileUrl)
    item.title = image.title || title
    item.copyright = image.copyright || ''
    return { ok: true, item }
  } catch (err) {
    return { ok: false, error: `Bing download failed: ${err?.message || err}` }
  }
}

export async function scanSystemFonts({ refresh = false } = {}) {
  if (fontCache && !refresh) return { ok: true, fonts: fontCache }
  const names = new Set()
  if (process.platform === 'win32') {
    const ps = `
      $ErrorActionPreference = 'SilentlyContinue'
      foreach ($p in @(
        'HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Fonts',
        'HKCU:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Fonts'
      )) {
        if (Test-Path $p) {
          $item = Get-ItemProperty $p
          $item.PSObject.Properties | Where-Object { $_.Name -notlike 'PS*' } | ForEach-Object { $_.Name }
        }
      }
    `
    try {
      const { stdout } = await exec('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', ps], {
        encoding: 'utf8', timeout: 8000, windowsHide: true, maxBuffer: 2 * 1024 * 1024
      })
      for (const line of stdout.split(/\r?\n/)) {
        const clean = line.replace(/\s*\((?:TrueType|OpenType|All res|PostScript).*?\)\s*$/i, '').trim()
        if (clean) names.add(clean)
      }
    } catch {}
  } else if (process.platform === 'linux') {
    try {
      const { stdout } = await exec('fc-list', [':', 'family'], { encoding: 'utf8', timeout: 6000 })
      for (const line of stdout.split(/\r?\n/)) {
        for (const fam of line.split(',')) {
          const clean = fam.trim()
          if (clean) names.add(clean)
        }
      }
    } catch {}
  } else if (process.platform === 'darwin') {
    try {
      const { stdout } = await exec('atsutil', ['fonts', '-list'], { encoding: 'utf8', timeout: 6000 })
      for (const line of stdout.split(/\r?\n/)) {
        const clean = line.trim()
        if (clean && !clean.endsWith(':')) names.add(clean)
      }
    } catch {}
  }
  fontCache = [...names].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))
  return { ok: true, fonts: fontCache }
}

export async function pickFolderDialog({ defaultPath = '', title = 'Choose Wallpaper Engine folder' } = {}) {
  if (process.platform === 'win32') {
    const ps = `
      Add-Type -AssemblyName System.Windows.Forms
      $dlg = New-Object System.Windows.Forms.FolderBrowserDialog
      $dlg.Description = $env:AGY_PICK_TITLE
      if ($env:AGY_PICK_DEFAULT -and (Test-Path -LiteralPath $env:AGY_PICK_DEFAULT)) {
        $dlg.SelectedPath = $env:AGY_PICK_DEFAULT
      }
      if ($dlg.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK) {
        Write-Output $dlg.SelectedPath
      }
    `
    try {
      const { stdout } = await exec('powershell.exe', ['-NoProfile', '-Sta', '-NonInteractive', '-Command', ps], {
        encoding: 'utf8', timeout: 120_000, windowsHide: true,
        env: { ...process.env, AGY_PICK_TITLE: title, AGY_PICK_DEFAULT: defaultPath }
      })
      const p = stdout.trim()
      return { ok: true, paths: p ? [p] : [] }
    } catch (err) {
      return { ok: false, error: err?.message || 'picker failed' }
    }
  }
  if (process.platform === 'darwin') {
    try {
      const { stdout } = await exec('osascript', ['-e', 'POSIX path of (choose folder)'], { encoding: 'utf8', timeout: 120_000 })
      const p = stdout.trim()
      return { ok: true, paths: p ? [p] : [] }
    } catch {
      return { ok: true, paths: [] }
    }
  }
  return { ok: false, error: 'Native folder picker is unsupported on this platform; paste the path directly.' }
}

export async function pickMediaFilesDialog({ title = 'Choose images or videos' } = {}) {
  if (process.platform === 'win32') {
    const ps = `
      Add-Type -AssemblyName System.Windows.Forms
      $dlg = New-Object System.Windows.Forms.OpenFileDialog
      $dlg.Title = $env:AGY_PICK_TITLE
      $dlg.Filter = 'Media (*.png;*.jpg;*.jpeg;*.webp;*.gif;*.bmp;*.mp4;*.webm;*.mov;*.mkv;*.avi)|*.png;*.jpg;*.jpeg;*.webp;*.gif;*.bmp;*.mp4;*.webm;*.mov;*.mkv;*.avi|All files (*.*)|*.*'
      $dlg.Multiselect = $true
      if ($dlg.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK) {
        $dlg.FileNames | ConvertTo-Json -Compress
      }
    `
    try {
      const { stdout } = await exec('powershell.exe', ['-NoProfile', '-Sta', '-NonInteractive', '-Command', ps], {
        encoding: 'utf8', timeout: 120_000, windowsHide: true,
        env: { ...process.env, AGY_PICK_TITLE: title }
      })
      const trimmed = stdout.trim()
      if (!trimmed) return { ok: true, paths: [] }
      const parsed = JSON.parse(trimmed)
      return { ok: true, paths: Array.isArray(parsed) ? parsed : [parsed] }
    } catch (err) {
      return { ok: false, error: err?.message || 'picker failed' }
    }
  }
  return { ok: false, error: 'Use file upload input on this platform.' }
}

export async function queryNowPlaying() {
  if (process.platform !== 'win32') {
    return { ok: false, error: 'system media integration is Windows-only' }
  }
  const now = Date.now()
  if (nowPlayingCache.value && now - nowPlayingCache.at < 4000) {
    return nowPlayingCache.value
  }
  const script = `
    $ErrorActionPreference = 'Stop'
    [void][Windows.Media.Control.GlobalSystemMediaTransportControlsSessionManager, Windows.Media.Control, ContentType=WindowsRuntime]
    $manager = [Windows.Media.Control.GlobalSystemMediaTransportControlsSessionManager]::RequestAsync().GetAwaiter().GetResult()
    $session = $manager.GetCurrentSession()
    if ($null -eq $session) { '{"ok":false}'; exit 0 }
    $props = $session.TryGetMediaPropertiesAsync().GetAwaiter().GetResult()
    $info = $session.GetPlaybackInfo()
    $timeline = $session.GetTimelineProperties()
    [pscustomobject]@{
      ok = $true
      title = $props.Title
      artist = $props.Artist
      album = $props.AlbumTitle
      playing = [string]$info.PlaybackStatus
      position = [double]$timeline.Position.TotalSeconds
      duration = [double]$timeline.EndTime.TotalSeconds
    } | ConvertTo-Json -Compress
  `
  try {
    const { stdout } = await exec('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', script], {
      encoding: 'utf8', timeout: 8000, windowsHide: true
    })
    const line = stdout.trim().split(/\r?\n/).at(-1)
    const result = line ? JSON.parse(line) : { ok: false }
    nowPlayingCache = { at: Date.now(), value: result }
    return result
  } catch (err) {
    const fallback = { ok: false, error: err?.message || 'no media session' }
    nowPlayingCache = { at: Date.now(), value: fallback }
    return fallback
  }
}

export function directorySize(dirPath) {
  if (!existsSync(dirPath)) return 0
  let total = 0
  const stack = [dirPath]
  while (stack.length) {
    const cur = stack.pop()
    let entries
    try { entries = readdirSync(cur, { withFileTypes: true }) } catch { continue }
    for (const entry of entries) {
      const full = join(cur, entry.name)
      try {
        const lst = lstatSync(full)
        if (lst.isSymbolicLink()) continue
        if (lst.isDirectory()) stack.push(full)
        else if (lst.isFile()) total += lst.size
      } catch {}
    }
  }
  return total
}

export function tailFile(filePath, lines = 80) {
  if (!existsSync(filePath)) return []
  try {
    return readFileSync(filePath, 'utf8').split(/\r?\n/).filter(Boolean).slice(-lines)
  } catch {
    return []
  }
}

export function removeUploadFile(filePath, uploadsDir) {
  if (typeof filePath !== 'string' || !filePath.trim()) return { ok: false, error: 'missing path' }
  const resolvedRoot = resolve(uploadsDir)
  const candidate = resolve(filePath)
  if (!candidate.startsWith(resolvedRoot + (resolvedRoot.endsWith('\\') || resolvedRoot.endsWith('/') ? '' : process.platform === 'win32' ? '\\' : '/'))) {
    return { ok: false, error: 'refusing to delete outside uploads directory' }
  }
  try {
    const lst = lstatSync(candidate)
    if (lst.isSymbolicLink() || !lst.isFile()) return { ok: false, error: 'file not found' }
    rmSync(candidate, { force: true })
    return { ok: true, removed: candidate }
  } catch (err) {
    return { ok: false, error: err?.message || 'remove failed' }
  }
}

export function clearCacheDir(targetDir, allowedParent) {
  const resolvedTarget = resolve(targetDir)
  const resolvedParent = resolve(allowedParent)
  if (!resolvedTarget.startsWith(resolvedParent)) {
    return { ok: false, error: 'refusing to delete outside data root' }
  }
  try {
    if (existsSync(resolvedTarget)) rmSync(resolvedTarget, { recursive: true, force: true })
    mkdirSync(resolvedTarget, { recursive: true })
    return { ok: true, removed: [resolvedTarget], time: Date.now() }
  } catch (err) {
    return { ok: false, error: err?.message || 'cleanup failed' }
  }
}
