import { existsSync, rmSync } from 'node:fs'
import { homedir } from 'node:os'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { resolveInstallDir } from './install.mjs'

export function uninstallLocal(options = {}) {
  const env = options.env || process.env
  const purgeData = options.purgeData ?? process.argv.includes('--purge-data')
  const targetDir = options.targetDir || resolveInstallDir(env)
  const dataDir = env.AGY_SKINS_DATA_DIR?.trim()
    ? resolve(env.AGY_SKINS_DATA_DIR.trim())
    : join(homedir(), '.agy-skins')

  let removedPlugin = false
  if (existsSync(targetDir)) {
    rmSync(targetDir, { recursive: true, force: true })
    removedPlugin = true
  }
  let removedData = false
  if (purgeData && existsSync(dataDir)) {
    rmSync(dataDir, { recursive: true, force: true })
    removedData = true
  }
  console.log(`[agy-skins] uninstall: plugin=${removedPlugin ? 'removed' : 'not-found'}, data=${removedData ? 'purged' : 'kept'} (${dataDir})`)
  return { removedPlugin, removedData, targetDir, dataDir }
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (isMain) {
  uninstallLocal()
}
