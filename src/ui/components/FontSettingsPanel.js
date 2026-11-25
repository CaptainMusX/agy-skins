/**
 * Typography, Named Font Sets, Text Role Tokens, Component Fonts, Caret & UI Colors panel.
 */
import { el, callBackend, switchControl, colorControl } from '../panel-api.js'
import { FONT_SET_KEYS, THEME_COLOR_ROLE_IDS, COMPONENT_FONT_TARGETS } from '../../shared/config.js'

function pickFontValues(cfg) {
  const values = {}
  for (const k of FONT_SET_KEYS) values[k] = structuredClone(cfg[k])
  return values
}

export function renderFontSettingsPanel(store) {
  const { config, systemFonts, busyAction } = store.state
  const t = store.getT()
  const isZh = t('weTypeVideo') === '视频'
  const fontSets = config.fontSets || []
  const activeSet = fontSets.find(s => s.id === config.fontSetId) || null

  const saveNewSet = () => {
    const id = `fs_${Date.now().toString(36)}`
    const next = [
      ...fontSets,
      {
        id,
        name: isZh ? `字体集 ${fontSets.length + 1}` : `Font Set ${fontSets.length + 1}`,
        values: pickFontValues(config)
      }
    ]
    void store.updateConfig({ fontSets: next, fontSetId: id })
  }

  const updateActiveSetFromConfig = () => {
    if (!activeSet) return
    const next = fontSets.map(s => (s.id === activeSet.id ? { ...s, values: pickFontValues(config) } : s))
    void store.updateConfig({ fontSets: next })
    store.showToast(isZh ? '已保存当前字体集配置' : 'Font set updated')
  }

  const applyFontSet = id => {
    const found = fontSets.find(s => s.id === id)
    if (!found) {
      void store.updateConfig({ fontSetId: '' })
      return
    }
    void store.updateConfig({ fontSetId: id, ...structuredClone(found.values) })
  }

  const deleteActiveSet = () => {
    if (!activeSet) return
    const next = fontSets.filter(s => s.id !== activeSet.id)
    void store.updateConfig({ fontSets: next, fontSetId: next[0]?.id || '' })
  }

  const scanFonts = async () => {
    store.state.busyAction = 'fonts'
    store.notify()
    try {
      const res = await callBackend('fonts-list', { refresh: true })
      if (Array.isArray(res?.fonts)) {
        store.state.systemFonts = res.fonts
        store.state.fontsLoaded = true
        store.showToast(isZh ? `已扫描 ${res.fonts.length} 个系统字体` : `Scanned ${res.fonts.length} system fonts`)
      }
    } finally {
      store.state.busyAction = ''
      store.notify()
    }
  }

  return el('div', { style: { display: 'flex', flexDirection: 'column', gap: '12px' } },
    el('div', { className: 'agy-card' },
      el('div', { className: 'agy-card-title' }, t('sectionTypography')),
      el('div', { className: 'agy-card-desc' }, t('sectionTypographyDesc')),
      switchControl({
        label: t('fontCustom'),
        checked: config.fontCustom,
        onChange: v => void store.updateConfig({ fontCustom: v })
      }),
      el('div', { className: 'agy-toolbar' },
        el('select', {
          className: 'agy-select',
          style: { flex: '1' },
          value: config.fontSetId || '',
          onChange: e => applyFontSet(e.target.value)
        }, [
          el('option', { value: '', selected: !config.fontSetId }, isZh ? '默认字体集（自定义草稿）' : 'Custom / Unsaved Draft'),
          ...fontSets.map(s => el('option', { value: s.id, selected: s.id === config.fontSetId }, s.name))
        ]),
        el('button', { type: 'button', className: 'agy-btn', onClick: saveNewSet }, isZh ? '另存为字体集' : 'Save New Set'),
        activeSet ? el('button', { type: 'button', className: 'agy-btn', onClick: updateActiveSetFromConfig }, isZh ? '覆盖保存' : 'Overwrite') : null,
        activeSet ? el('button', { type: 'button', className: 'agy-btn agy-btn-danger', onClick: deleteActiveSet }, isZh ? '删除' : 'Delete') : null
      ),
      activeSet ? el('div', { className: 'agy-row' },
        el('div', { className: 'agy-label' }, isZh ? '字体集名称' : 'Font set name'),
        el('input', {
          type: 'text',
          className: 'agy-input',
          value: activeSet.name,
          onChange: e => {
            const name = e.target.value.trim() || activeSet.name
            void store.updateConfig({
              fontSets: fontSets.map(s => (s.id === activeSet.id ? { ...s, name } : s))
            })
          }
        })
      ) : null,
      el('div', { className: 'agy-row agy-row-col' },
        el('div', { className: 'agy-row-head' },
          el('div', { className: 'agy-label' }, t('fontFamily')),
          el('button', {
            type: 'button',
            className: 'agy-btn',
            disabled: busyAction === 'fonts',
            onClick: scanFonts
          }, busyAction === 'fonts' ? t('fontScanning') : t('scanFonts'))
        ),
        el('div', { className: 'agy-toolbar' },
          el('input', {
            type: 'text',
            className: 'agy-input',
            list: 'agy-system-font-datalist',
            value: config.globalFamily || '',
            placeholder: t('fontFamilyPlaceholder'),
            onChange: e => void store.updateConfig({ globalFamily: e.target.value })
          }),
          el('datalist', { id: 'agy-system-font-datalist' },
            systemFonts.map(f => el('option', { value: f }))
          )
        )
      ),
      colorControl({
        label: t('caretColor'),
        value: config.caretColor,
        fallback: '#4f8cff',
        onChange: v => void store.updateConfig({ caretColor: v })
      })
    ),

    el('div', { className: 'agy-card' },
      el('div', { className: 'agy-card-title' }, isZh ? '组件级字体与字号微调' : 'Component Typography Overrides'),
      ...COMPONENT_FONT_TARGETS.map(target => {
        const cur = config.componentFonts?.[target.id] || {}
        const updateTarget = patch => {
          const next = { ...(config.componentFonts || {}) }
          next[target.id] = { ...(next[target.id] || {}), ...patch }
          void store.updateConfig({ componentFonts: next })
        }
        return el('div', { className: 'agy-row', style: { flexWrap: 'wrap' } },
          el('div', { className: 'agy-label', style: { minWidth: '88px' } }, isZh ? target.label : target.labelEn),
          el('div', { className: 'agy-toolbar', style: { flex: '1' } },
            el('input', {
              type: 'text',
              className: 'agy-input',
              list: 'agy-system-font-datalist',
              placeholder: isZh ? '继承全局' : 'Inherit global',
              value: cur.family || '',
              onChange: e => updateTarget({ family: e.target.value })
            }),
            el('input', {
              type: 'number',
              className: 'agy-input',
              style: { width: '68px' },
              min: '8',
              max: '48',
              placeholder: 'px',
              value: cur.size ? String(cur.size) : '',
              onChange: e => updateTarget({ size: e.target.value ? Number(e.target.value) : '' })
            }),
            el('input', {
              type: 'number',
              className: 'agy-input',
              style: { width: '74px' },
              min: '100',
              max: '900',
              step: '100',
              placeholder: 'wt',
              value: cur.weight ? String(cur.weight) : '',
              onChange: e => updateTarget({ weight: e.target.value ? Number(e.target.value) : '' })
            })
          )
        )
      })
    ),

    el('div', { className: 'agy-card' },
      el('div', { className: 'agy-card-title' }, isZh ? '文本分级颜色与主题跟随' : 'Text Token Colors & Theme Follow'),
      switchControl({
        label: isZh ? '跟随当前壁纸提取主题强调色' : 'Follow wallpaper dominant accent color',
        checked: config.themeFollow,
        onChange: v => void store.updateConfig({ themeFollow: v })
      }),
      switchControl({
        label: isZh ? '深浅色分别设定文字色' : 'Separate light/dark text colors',
        checked: config.themeDarkSeparate,
        onChange: v => void store.updateConfig({ themeDarkSeparate: v })
      }),
      ...THEME_COLOR_ROLE_IDS.map(role => {
        const pair = config.themeColors?.[role] || {}
        const updateRole = (mode, hexVal) => {
          const next = structuredClone(config.themeColors || {})
          next[role] = { light: pair.light || '#111827', dark: pair.dark || '#f8fafc', [mode]: hexVal }
          void store.updateConfig({ themeColors: next })
        }
        return el('div', { className: 'agy-row' },
          el('div', { className: 'agy-label' }, `text.${role}`),
          el('div', { className: 'agy-color-group' },
            el('span', { className: 'agy-desc' }, 'L'),
            el('input', {
              type: 'color',
              className: 'agy-color-input',
              value: pair.light || '#111827',
              onInput: e => updateRole('light', e.target.value)
            }),
            config.themeDarkSeparate ? [
              el('span', { className: 'agy-desc' }, 'D'),
              el('input', {
                type: 'color',
                className: 'agy-color-input',
                value: pair.dark || '#f8fafc',
                onInput: e => updateRole('dark', e.target.value)
              })
            ] : null
          )
        )
      }),
      switchControl({
        label: isZh ? '自定义界面强调色 (发送按钮/链接/标签)' : 'Custom UI accent overrides (Send / Links / Tabs)',
        checked: config.uiColorCustom,
        onChange: v => void store.updateConfig({ uiColorCustom: v })
      }),
      config.uiColorCustom ? [
        colorControl({ label: 'Accent', value: config.accent, onChange: v => void store.updateConfig({ accent: v }) }),
        colorControl({ label: isZh ? '发送按钮' : 'Send button', value: config.uiColorSend, fallback: config.accent, onChange: v => void store.updateConfig({ uiColorSend: v }) }),
        colorControl({ label: isZh ? '链接文字' : 'Link color', value: config.uiColorLink, fallback: config.accent, onChange: v => void store.updateConfig({ uiColorLink: v }) }),
        colorControl({ label: isZh ? '标签选中线' : 'Active tab', value: config.uiColorTab, fallback: config.accent, onChange: v => void store.updateConfig({ uiColorTab: v }) })
      ] : null
    )
  )
}
