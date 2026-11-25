/**
 * System tab ('系统'): Card density layout, inner UI language (with note that
 * Antigravity's Settings sidebar title stays English "Wallpaper Engine"),
 * Antigravity native integrations + CDP health, power saving, diagnostics & reset.
 */
import { DEFAULT_CONFIG } from '../../shared/config.js'
import { el, moduleResetButton, sectionHead, switchRow, segRow, selectRow, renderConfirmRow } from '../panel-api.js'

export function renderSystemTab(store) {
  const { config, cdp, diagnostics, busyAction } = store.state
  const t = store.getT()
  const isZh = store.isZh()

  return el('div', { className: 'we-tabpanel' },
    el('div', { className: 'we-picker__section' },
      sectionHead({
        title: t('sectionSystem'),
        resetBtn: moduleResetButton({ onClick: () => store.resetModule('system') })
      }),
      segRow({
        label: isZh ? '壁纸库卡片排布' : 'Library card style',
        value: config.pickerLayout || 'fixed',
        syncActive: true,
        items: [
          { id: 'fixed', label: isZh ? '常规网格' : 'Fixed Grid' },
          { id: 'classic', label: isZh ? 'CD 架叠放' : 'CD Rack' }
        ],
        onPick: id => void store.updateConfig({ pickerLayout: id }, { rerender: false })
      }),
      selectRow({
        label: isZh ? '插件内部界面语言' : 'Inner UI language',
        hint: isZh ? '注：Antigravity Settings 左侧菜单条目始终保持英文 "Wallpaper"。' : 'Note: Antigravity Settings left nav label always stays English "Wallpaper".',
        value: config.uiLanguage || 'zh',
        options: [
          { value: 'zh', label: '简体中文（推荐）' },
          { value: 'en', label: 'English' },
          { value: 'auto', label: isZh ? '跟随系统语言' : 'Auto (System Locale)' }
        ],
        onChange: v => void store.updateConfig({ uiLanguage: v })
      })
    ),

    el('div', { className: 'we-picker__section' },
      sectionHead({ title: isZh ? 'Antigravity 原生集成与连接诊断' : 'Antigravity Integration & CDP Health' }),
      switchRow({
        label: t('browserHoleCutout'),
        hint: t('browserHoleCutoutDesc'),
        checked: config.browserHoleCutout !== false,
        onChange: v => void store.updateConfig({ browserHoleCutout: v }, { rerender: false })
      }),
      switchRow({
        label: t('studioShortcut'),
        hint: t('studioShortcutDesc'),
        checked: config.studioShortcut !== false,
        onChange: v => void store.updateConfig({ studioShortcut: v }, { rerender: false })
      }),
      el('div', { className: 'we-picker__ctl' },
        el('div', { className: 'we-picker__ctl-text' },
          el('span', { className: 'we-picker__ctl-label' }, t('cdpHealthTitle')),
          el('span', { className: 'we-picker__ctl-hint' },
            (cdp?.state === 'connected' || Number(cdp?.targets) > 0)
              ? `${t('cdpStatusOk')} (CDP :${cdp.port || '?'})`
              : t('cdpStatusMissing')
          )
        ),
        el('button', {
          type: 'button',
          className: 'we-picker__btn',
          disabled: busyAction === 'cdp-fix',
          onClick: async () => {
            store.state.busyAction = 'cdp-fix'
            store.notify()
            try {
              const res = await store.rpc('fix-cdp-shortcut', {})
              if (res?.updated > 0) {
                store.showToast(isZh ? `已更新 ${res.updated} 个快捷方式，下次重启生效` : `Updated ${res.updated} shortcut(s)`)
              } else {
                store.showToast(isZh ? '桌面与开始菜单快捷方式均已包含调试参数' : 'Shortcuts already configured')
              }
              const fresh = await store.rpc('get-state')
              if (fresh?.cdp) store.state.cdp = fresh.cdp
            } finally {
              store.state.busyAction = ''
              store.notify()
            }
          }
        }, t('cdpFixShortcuts'))
      )
    ),

    el('div', { className: 'we-picker__section' },
      sectionHead({ title: isZh ? '电源与启停策略' : 'Power & Startup Policy' }),
      switchRow({
        label: t('pauseOnHidden'),
        checked: config.pauseOnHidden !== false,
        onChange: v => void store.updateConfig({ pauseOnHidden: v }, { rerender: false })
      }),
      switchRow({
        label: t('pauseOnBlur'),
        checked: Boolean(config.pauseOnBlur),
        onChange: v => void store.updateConfig({ pauseOnBlur: v }, { rerender: false })
      }),
      switchRow({
        label: t('pauseOnBattery'),
        checked: Boolean(config.pauseOnBattery),
        onChange: v => void store.updateConfig({ pauseOnBattery: v }, { rerender: false })
      }),
      switchRow({
        label: t('startPaused'),
        hint: isZh ? '开启后每次冷启动时默认暂停动态渲染，按需再播放。' : 'Start wallpaper paused after each cold launch.',
        checked: Boolean(config.startPaused),
        onChange: v => void store.updateConfig({ startPaused: v }, { rerender: false })
      })
    ),

    el('div', { className: 'we-picker__section' },
      sectionHead({ title: isZh ? '维护与恢复出厂' : 'Maintenance & Reset' }),
      el('div', { className: 'we-picker__row' },
        el('button', {
          type: 'button',
          className: 'we-picker__btn',
          disabled: busyAction === 'diag',
          onClick: async () => {
            store.state.busyAction = 'diag'
            store.notify()
            try {
              store.state.diagnostics = await store.rpc('diagnostics', {})
            } finally {
              store.state.busyAction = ''
              store.notify()
            }
          }
        }, isZh ? '查看实时诊断' : 'Run Diagnostics'),
        el('button', {
          type: 'button',
          className: 'we-picker__btn',
          disabled: busyAction === 'cache',
          onClick: async () => {
            store.state.busyAction = 'cache'
            store.notify()
            try {
              await store.rpc('cache-clear', {})
              store.showToast(isZh ? '已清理壁纸缓存并准备重新扫描' : 'Cache cleared')
              await store.rescanLibrary()
            } finally {
              store.state.busyAction = ''
              store.notify()
            }
          }
        }, isZh ? '清理预览缓存' : 'Clear Preview Cache'),
        el('button', {
          type: 'button',
          className: 'we-picker__btn we-picker__btn--danger',
          onClick: () => { store.state.armedConfirm = 'reset-all'; store.notify() }
        }, t('resetAll'))
      ),
      renderConfirmRow({
        armedToken: store.state.armedConfirm,
        token: 'reset-all',
        question: t('resetAllConfirm'),
        confirmLabel: t('confirmBtn'),
        cancelLabel: t('cancelBtn'),
        danger: true,
        onConfirm: () => {
          const patch = structuredClone(DEFAULT_CONFIG)
          patch.weRoots = [...(config.weRoots || [])]
          store.state.armedConfirm = ''
          void store.updateConfig(patch)
          store.showToast(isZh ? '已恢复全部默认设置' : 'All settings restored to defaults')
        },
        onCancel: () => { store.state.armedConfirm = ''; store.notify() }
      }),
      diagnostics ? el('pre', { className: 'we-log-pre' }, JSON.stringify(diagnostics, null, 2)) : null
    )
  )
}
