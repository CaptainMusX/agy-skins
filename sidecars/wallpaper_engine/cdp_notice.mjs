import { execFile } from 'node:child_process'
import { homedir } from 'node:os'
import { join } from 'node:path'

const DEFAULT_SHORTCUT_DIRS_PS = `@(
  [Environment]::GetFolderPath('Desktop'),
  [Environment]::GetFolderPath('CommonDesktopDirectory'),
  [Environment]::GetFolderPath('StartMenu'),
  [Environment]::GetFolderPath('CommonStartMenu'),
  (Join-Path $env:APPDATA 'Microsoft\\Internet Explorer\\Quick Launch\\User Pinned\\TaskBar')
)`

const SHORTCUT_SCAN_PS = `
$pattern = '(^|\\s)--remote-debugging-port(=\\S*)?(?=\\s|$)'
$shell = New-Object -ComObject WScript.Shell
$total = 0; $missing = 0
foreach ($f in $files) {
  $l = $null
  try { $l = $shell.CreateShortcut($f.FullName) } catch { continue }
  if (-not $l) { continue }
  if ($l.TargetPath -and (Split-Path -Leaf $l.TargetPath) -eq 'Antigravity.exe') {
    $total++
    if ([string]$l.Arguments -notmatch $pattern) { $missing++ }
  }
}
if ($missing -gt 0) { 'missing' } elseif ($listingErrors.Count) { 'incomplete' } elseif ($total -eq 0) { 'unknown' } else { 'ok' }
`

const SHORTCUT_FIX_PS = `
$pattern = '(^|\\s)--remote-debugging-port(=\\S*)?(?=\\s|$)'
$shell = New-Object -ComObject WScript.Shell
$total = 0; $updated = 0; $failed = 0; $verificationFailed = $false
foreach ($f in $files) {
  $l = $null
  try { $l = $shell.CreateShortcut($f.FullName) } catch { continue }
  if (-not $l) { continue }
  if ($l.TargetPath -and (Split-Path -Leaf $l.TargetPath) -eq 'Antigravity.exe') {
    $total++
    $arguments = [string]$l.Arguments
    if ($arguments -match $pattern) { continue }
    $expected = "$arguments --remote-debugging-port=0".Trim()
    try {
      $l.Arguments = $expected
      if ([string]$l.Arguments -cne $expected) {
        $verificationFailed = $true
        $failed++
        continue
      }
      $l.Save()
    } catch {
      $failed++
      continue
    }
    try {
      $saved = $shell.CreateShortcut($f.FullName)
      if ([string]$saved.Arguments -ceq $expected) {
        $updated++
        continue
      }
    } catch {}
    $verificationFailed = $true
    $failed++
  }
}
$status = if ($listingErrors.Count) {
  if ($total -gt 0 -and $failed -eq 0) { 'partial' } else { 'incomplete' }
} elseif ($verificationFailed) { 'unverified' } elseif ($failed -gt 0) { 'missing' } elseif ($total -eq 0) { 'unknown' } else { 'ok' }
Write-Output ("$status,$updated,$failed,$total")
`

function runExec(execFileImpl, file, args, options = {}) {
  return new Promise(resolve => {
    execFileImpl(file, args, { encoding: 'utf8', windowsHide: true, timeout: 12000, ...options }, (err, stdout) => {
      resolve({ ok: !err, stdout: String(stdout || '').trim() })
    })
  })
}

export function createCdpNoticeManager(options = {}) {
  const platform = options.platform || process.platform
  const execFileImpl = options.execFileImpl || execFile
  const now = options.now || Date.now
  const shortcutRetryMs = options.shortcutRetryMs ?? 60_000

  let shortcutState = 'unknown'
  let shortcutChecked = false
  let shortcutNextRetryAt = 0
  let shortcutPromise = null
  let fixPromise = null
  let shortcutRevision = 0
  let lastStatus = 'unknown'

  function runShortcutScript(script) {
    const roots = options.shortcutDirectories
    const source = roots === undefined ? DEFAULT_SHORTCUT_DIRS_PS : '(ConvertFrom-Json $env:AGY_CDP_TEST_ROOTS)'
    const command = `$ErrorActionPreference = 'Stop'
$listingErrors = @()
$files = foreach ($d in ${source} | Where-Object { $_ } | Select-Object -Unique) {
  if (Test-Path -LiteralPath $d -PathType Container -ErrorAction SilentlyContinue -ErrorVariable +listingErrors) {
    Get-ChildItem -LiteralPath $d -Recurse -Filter *.lnk -File -ErrorAction SilentlyContinue -ErrorVariable +listingErrors
  }
}
${script}`
    const env = roots === undefined ? process.env : { ...process.env, AGY_CDP_TEST_ROOTS: JSON.stringify(roots) }
    return runExec(execFileImpl, 'powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', command], { env })
  }

  async function checkShortcuts() {
    if (platform !== 'win32') return 'unknown'
    if (fixPromise) return (await fixPromise).shortcutState
    if (shortcutPromise) return shortcutPromise
    const rev = shortcutRevision
    const pending = (async () => {
      const res = await runShortcutScript(SHORTCUT_SCAN_PS)
      const line = res.stdout.split(/\r?\n/).map(s => s.trim()).filter(Boolean).at(-1)
      if (rev === shortcutRevision) {
        shortcutChecked = res.ok && (line === 'ok' || line === 'missing' || line === 'unknown')
        if (shortcutChecked) {
          shortcutState = line
          shortcutNextRetryAt = 0
        } else {
          shortcutNextRetryAt = now() + shortcutRetryMs
        }
      }
      return shortcutState
    })().finally(() => {
      if (shortcutPromise === pending) shortcutPromise = null
    })
    shortcutPromise = pending
    return pending
  }

  function observe(cdpState) {
    lastStatus = cdpState
    if ((cdpState === 'missing' || cdpState === 'unreachable') &&
        platform === 'win32' && !shortcutChecked && now() >= shortcutNextRetryAt) {
      void checkShortcuts()
    }
  }

  async function fixShortcuts() {
    if (platform !== 'win32') {
      return { ok: false, reason: 'unsupported', updated: 0, failed: 0, total: 0, shortcutState }
    }
    if (fixPromise) return fixPromise
    shortcutRevision++
    shortcutPromise = null
    const pending = (async () => {
      const res = await runShortcutScript(SHORTCUT_FIX_PS)
      const line = res.stdout.split(/\r?\n/).map(s => s.trim()).filter(Boolean).at(-1) || ''
      const [status, updatedStr, failedStr, totalStr] = line.split(',')
      const updated = Number(updatedStr) || 0
      const failed = Number(failedStr) || 0
      const total = Number(totalStr) || 0
      const partial = res.ok && status === 'partial'
      const nextState = status === 'unverified' ? 'missing' : status
      shortcutChecked = res.ok && (nextState === 'ok' || nextState === 'missing' || nextState === 'unknown')
      if (shortcutChecked) {
        shortcutState = nextState
        shortcutNextRetryAt = 0
      } else {
        if (partial) shortcutState = 'unknown'
        shortcutNextRetryAt = now() + shortcutRetryMs
      }
      const reason = partial ? 'partial'
        : !shortcutChecked || status === 'unverified' ? 'error'
        : nextState === 'ok' ? 'ok'
        : nextState === 'unknown' ? 'not_found'
        : 'permission'
      return { ok: reason === 'ok', reason, updated, failed, total, shortcutState }
    })().finally(() => {
      if (fixPromise === pending) fixPromise = null
    })
    fixPromise = pending
    return pending
  }

  function info(cdpState = lastStatus) {
    return {
      state: cdpState,
      shortcutState,
      canFixShortcut: platform === 'win32' && shortcutState === 'missing'
    }
  }

  return { observe, info, checkShortcuts, fixShortcuts }
}

export function defaultPortFiles(env = process.env) {
  const home = homedir()
  if (env.AGY_PORT_FILE) return [env.AGY_PORT_FILE]
  if (process.platform === 'win32') {
    const appData = env.APPDATA || join(home, 'AppData', 'Roaming')
    return [join(appData, 'Antigravity', 'DevToolsActivePort'), join(appData, 'antigravity', 'DevToolsActivePort')]
  }
  if (process.platform === 'darwin') {
    const appSupport = join(home, 'Library', 'Application Support')
    return [join(appSupport, 'Antigravity', 'DevToolsActivePort'), join(appSupport, 'antigravity', 'DevToolsActivePort')]
  }
  const xdg = env.XDG_CONFIG_HOME || join(home, '.config')
  return [join(xdg, 'Antigravity', 'DevToolsActivePort'), join(xdg, 'antigravity', 'DevToolsActivePort')]
}
