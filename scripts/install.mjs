import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { spawn } from 'node:child_process'
import { homedir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildAll, ROOT } from './build.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
export const PLUGIN_ID = 'agy-skins'

export function resolveInstallDir(env = process.env) {
  if (env.AGY_PLUGINS_DIR?.trim()) return join(resolve(env.AGY_PLUGINS_DIR.trim()), PLUGIN_ID)
  return join(homedir(), '.gemini', 'config', 'plugins', PLUGIN_ID)
}

export async function installLocal(options = {}) {
  const env = options.env || process.env
  const noLaunch = options.noLaunch ?? process.argv.includes('--no-launch')
  await buildAll()

  const targetDir = options.targetDir || resolveInstallDir(env)
  const tempDir = `${targetDir}.staging.${Date.now()}`
  mkdirSync(dirname(targetDir), { recursive: true })
  rmSync(tempDir, { recursive: true, force: true })
  mkdirSync(tempDir, { recursive: true })

  const itemsToCopy = [
    'plugin.json',
    'package.json',
    'LICENSE',
    'LICENSING.md',
    'THIRD-PARTY-NOTICES.md',
    'README.md',
    'README.zh.md',
    'assets',
    'skills',
    'src/shared',
    'sidecars/wallpaper_engine',
    'third_party'
  ]

  for (const rel of itemsToCopy) {
    const src = join(ROOT, rel)
    if (!existsSync(src)) continue
    const dst = join(tempDir, rel)
    mkdirSync(dirname(dst), { recursive: true })
    cpSync(src, dst, { recursive: true })
  }

  mkdirSync(targetDir, { recursive: true })
  const lockFile = join(targetDir, '.update-in-progress')
  try { writeFileSync(lockFile, String(Date.now())) } catch {}
  try {
    cpSync(tempDir, targetDir, { recursive: true, force: true })
  } finally {
    rmSync(lockFile, { force: true })
    rmSync(tempDir, { recursive: true, force: true })
  }

  const manifest = JSON.parse(readFileSync(join(targetDir, 'plugin.json'), 'utf8'))
  console.log(`[agy-skins] installed v${manifest.version} -> ${targetDir}`)

  if (!noLaunch) {
    const serverEntry = join(targetDir, 'sidecars', 'wallpaper_engine', 'server.mjs')
    const child = spawn(process.execPath, [serverEntry, '--standalone'], {
      cwd: targetDir,
      detached: true,
      stdio: 'ignore',
      windowsHide: true
    })
    child.unref()
    console.log(`[agy-skins] started standalone sidecar daemon (pid=${child.pid})`)
  }

  return { targetDir, version: manifest.version }
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (isMain) {
  installLocal().catch(err => {
    console.error('[agy-skins] install failed:', err)
    process.exit(1)
  })
}
