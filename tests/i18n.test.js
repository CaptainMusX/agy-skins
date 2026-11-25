import test from 'node:test'
import assert from 'node:assert/strict'
import { SETTINGS_SIDEBAR_LABEL, resolveLanguage, createTranslator } from '../src/shared/i18n.js'

test('resolveLanguage ignores hardcoded html lang="en" and detects Chinese OS locale', () => {
  const prevDoc = globalThis.document
  globalThis.document = { documentElement: { lang: 'en' } }
  try {
    assert.equal(resolveLanguage('auto', 'zh-CN'), 'zh')
    assert.equal(resolveLanguage('auto', 'zh-Hans-CN'), 'zh')
    assert.equal(resolveLanguage('auto', 'en-US'), 'en')
    assert.equal(resolveLanguage('zh', 'en-US'), 'zh')
    assert.equal(resolveLanguage('en', 'zh-CN'), 'en')
  } finally {
    globalThis.document = prevDoc
  }
})

test('resolveLanguage defaults to Chinese when no OS/browser locale signals exist', () => {
  const prevDoc = globalThis.document
  const prevNav = globalThis.navigator
  const prevLocale = globalThis.__AGY_SKINS_SYSTEM_LOCALE__
  const prevIntl = globalThis.Intl
  try {
    delete globalThis.document
    delete globalThis.__AGY_SKINS_SYSTEM_LOCALE__
    Object.defineProperty(globalThis, 'navigator', { value: undefined, configurable: true })
    Object.defineProperty(globalThis, 'Intl', { value: undefined, configurable: true })
    assert.equal(resolveLanguage('auto', ''), 'zh')
  } finally {
    globalThis.document = prevDoc
    Object.defineProperty(globalThis, 'navigator', { value: prevNav, configurable: true })
    if (prevLocale !== undefined) globalThis.__AGY_SKINS_SYSTEM_LOCALE__ = prevLocale
    Object.defineProperty(globalThis, 'Intl', { value: prevIntl, configurable: true })
  }
})

test('Settings sidebar label stays English Wallpaper Engine while inner UI defaults to Chinese', () => {
  assert.equal(SETTINGS_SIDEBAR_LABEL, 'Wallpaper Engine')
  const tZh = createTranslator('zh', 'en-US')
  const tEn = createTranslator('en', 'zh-CN')
  assert.equal(tZh('navSettingsLabel'), 'Wallpaper Engine')
  assert.equal(tEn('navSettingsLabel'), 'Wallpaper Engine')
  assert.equal(tZh('wallpaperEngineTitle'), '壁纸引擎')
  assert.equal(tEn('wallpaperEngineTitle'), 'Wallpaper Engine')
  assert.equal(tZh('propSchemeColor'), '主题色')
  assert.equal(tEn('propSchemeColor'), 'Scheme color')
})
