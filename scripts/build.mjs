import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import * as esbuild from 'esbuild'

const __dirname = dirname(fileURLToPath(import.meta.url))
export const ROOT = resolve(__dirname, '..')
export const DIST_DIR = join(ROOT, 'sidecars', 'wallpaper_engine', 'dist')
export const LICENSE_BANNER = '/*! SPDX-License-Identifier: MIT | agy-skins Copyright (c) 2026 CaptainMusX | Adapted from elysia395/dsh-wallpaper-engine, Copyright (c) 2026 elysia395 (MIT) */'

export async function buildAll() {
  mkdirSync(DIST_DIR, { recursive: true })

  await esbuild.build({
    entryPoints: [join(ROOT, 'src', 'engine', 'runtime-entry.js')],
    outfile: join(DIST_DIR, 'runtime.js'),
    bundle: true,
    format: 'iife',
    platform: 'browser',
    target: ['chrome120'],
    charset: 'utf8',
    banner: { js: LICENSE_BANNER },
    logLevel: 'silent'
  })

  await esbuild.build({
    entryPoints: [join(ROOT, 'src', 'ui', 'panel.js')],
    outfile: join(DIST_DIR, 'panel.js'),
    bundle: true,
    format: 'esm',
    platform: 'browser',
    target: ['chrome120'],
    charset: 'utf8',
    banner: { js: LICENSE_BANNER },
    logLevel: 'silent'
  })

  const cssSrc = join(ROOT, 'src', 'ui', 'panel.css')
  const cssDst = join(DIST_DIR, 'panel.css')
  writeFileSync(cssDst, `${LICENSE_BANNER}\n${readFileSync(cssSrc, 'utf8')}`, 'utf8')

  // Verify outputs are non-empty
  for (const name of ['runtime.js', 'panel.js', 'panel.css']) {
    const content = readFileSync(join(DIST_DIR, name), 'utf8')
    if (!content.trim()) throw new Error(`Build produced empty asset: ${name}`)
  }
  return { distDir: DIST_DIR }
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (isMain) {
  buildAll()
    .then(res => console.log(`[agy-skins] built bundles -> ${res.distDir}`))
    .catch(err => {
      console.error('[agy-skins] build failed:', err)
      process.exit(1)
    })
}
