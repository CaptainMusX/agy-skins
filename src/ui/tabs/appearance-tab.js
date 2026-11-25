/**
 * Appearance tab: Theme presets (5 factory + 8 user slots), Theme follow,
 * Detail, Liquid Glass UI (with 3-gear thinkingMode + expandable per-surface controls),
 * Sidebar corners, Global UI colors, and Global Typography matrix.
 */
import {
  COMPONENT_FONT_TARGETS, THEME_COLOR_ROLE_IDS, TYPE_ROLE_IDS, FONT_SET_KEYS, DEFAULT_CONFIG, PARAM_RANGES
} from '../../shared/config.js'
import {
  ACCENT_PRESETS, CARET_COLOR_PRESETS, FACTORY_GLASS_PRESETS, GLASS_COLOR_PRESETS,
  extractGlassPresetValues, sanitizeUserPresets
} from '../../shared/glass-presets.js'
import {
  el, moduleResetButton, sectionHead, switchRow, configSlider, SliderRow, segRow, selectRow, swatchRow, renderConfirmRow
} from '../panel-api.js'

const COLOR_HEX_RE = /^#[0-9a-f]{6}$/i

const TYPE_ROLE_LABELS = {
  'markdown-h1': ['一级标题 H1', 'Heading H1'],
  'markdown-h2': ['二级标题 H2', 'Heading H2'],
  'markdown-h3': ['三级标题 H3', 'Heading H3'],
  'markdown-h4': ['四级标题 H4', 'Heading H4'],
  'markdown-base': ['对话正文', 'Markdown Base'],
  'markdown-small': ['小号文本', 'Markdown Small'],
  'markdown-code': ['行内代码', 'Inline Code'],
  'markdown-code-block': ['代码块', 'Code Block'],
  'markdown-table': ['表格正文字体', 'Table Body'],
  'markdown-table-head': ['表头字体', 'Table Head'],
  'xs-13': ['常规 UI 13px', 'UI XS 13px'],
  'xxs-12': ['辅助标签 12px', 'UI XXS 12px']
}

function toggleSection(store, key) {
  store.state.sectionsOpen[key] = !store.state.sectionsOpen[key]
  store.notify()
}

function pickFontSetValues(cfg) {
  const out = {}
  for (const k of FONT_SET_KEYS) out[k] = structuredClone(cfg[k])
  return out
}

function cornerButtons(store, prefix, label, equalCorners) {
  const cfg = store.state.config
  const isZh = store.isZh()
  const items = [
    { key: `${prefix}SquareTL`, id: 'TL', label: isZh ? '左上直角' : 'Square TL' },
    { key: `${prefix}SquareTR`, id: 'TR', label: isZh ? '右上直角' : 'Square TR' },
    { key: `${prefix}SquareBR`, id: 'BR', label: isZh ? '右下直角' : 'Square BR' },
    { key: `${prefix}SquareBL`, id: 'BL', label: isZh ? '左下直角' : 'Square BL' }
  ]
  return segRow({
    label,
    chips: !equalCorners,
    equalCorners,
    syncActive: true,
    items: items.map(it => ({
      id: it.id,
      label: it.label,
      active: Boolean(cfg[it.key])
    })),
    onPick: id => {
      const target = items.find(it => it.id === id)
      if (target) {
        const curVal = Boolean(store.state.config?.[target.key])
        void store.updateConfig({ [target.key]: !curVal }, { rerender: false })
      }
    }
  })
}

function renderPresetsSection(store) {
  const { config } = store.state
  const t = store.getT()
  const isZh = store.isZh()
  const open = store.state.sectionsOpen.glassPresets !== false
  const userPresets = config.userPresets || []
  const allPresets = [...FACTORY_GLASS_PRESETS, ...userPresets]
  const importInput = el('input', {
    type: 'file',
    accept: '.json,application/json',
    style: { display: 'none' },
    onChange: async e => {
      const file = e.target.files?.[0]
      if (!file) return
      try {
        const parsed = JSON.parse(await file.text())
        const values = extractGlassPresetValues(parsed.values || parsed)
        if (!Object.keys(values).length) throw new Error('empty')
        if (parsed.name && userPresets.length < 8) {
          const nextItem = sanitizeUserPresets([{
            id: `usr_${Date.now().toString(36)}`,
            name: String(parsed.name).slice(0, 60),
            values
          }])[0]
          const nextList = nextItem ? [...userPresets, nextItem] : userPresets
          await store.updateConfig({ ...values, userPresets: nextList, activePresetId: nextItem?.id || '' })
        } else {
          await store.updateConfig({ ...values, activePresetId: '' })
        }
        store.showToast(t('presetImported'))
      } catch {
        store.showToast(t('presetInvalid'), 'warn')
      } finally {
        e.target.value = ''
      }
    }
  })

  return el('div', { className: 'we-picker__section' },
    sectionHead({
      title: isZh ? '主题预设' : 'Theme Presets',
      open,
      onToggle: () => toggleSection(store, 'glassPresets')
    }),
    open ? [
      el('div', { className: 'we-picker__preset-grid' },
        FACTORY_GLASS_PRESETS.map(preset => el('div', {
          className: `we-picker__preset-cell ${config.activePresetId === preset.id ? 'we-picker__preset-cell--active' : ''}`
        },
          el('button', {
            type: 'button',
            className: 'we-picker__btn',
            title: isZh ? preset.nameZh : preset.nameEn,
            onClick: () => void store.updateConfig({ ...structuredClone(preset.values), activePresetId: preset.id })
          }, isZh ? preset.nameZh : preset.nameEn)
        )),
        userPresets.map(preset => el('div', {
          className: `we-picker__preset-cell ${config.activePresetId === preset.id ? 'we-picker__preset-cell--active' : ''}`
        },
          el('button', {
            type: 'button',
            className: 'we-picker__btn',
            title: preset.name,
            onClick: () => void store.updateConfig({ ...structuredClone(preset.values), activePresetId: preset.id })
          }, preset.name),
          el('button', {
            type: 'button',
            className: 'we-picker__btn we-picker__preset-del',
            title: isZh ? '删除预设' : 'Delete preset',
            onClick: () => { store.state.armedConfirm = `del-preset:${preset.id}`; store.notify() }
          }, '×')
        )),
        userPresets.length < 8 ? el('div', { className: 'we-picker__preset-cell we-picker__preset-cell--empty' },
          el('button', {
            type: 'button',
            className: 'we-picker__btn we-picker__btn--mini',
            style: { border: '0' },
            onClick: () => {
              store.state.presetSaveMode = 'save'
              store.state.presetDraftName = isZh ? `我的预设 ${userPresets.length + 1}` : `Preset ${userPresets.length + 1}`
              store.notify()
            }
          }, isZh ? `+ 槽位 (${userPresets.length}/8)` : `+ Slot (${userPresets.length}/8)`)
        ) : null
      ),
      ...userPresets.map(preset => renderConfirmRow({
        armedToken: store.state.armedConfirm,
        token: `del-preset:${preset.id}`,
        question: isZh ? `删除用户预设 “${preset.name}”？` : `Delete preset "${preset.name}"?`,
        confirmLabel: t('confirmBtn'),
        cancelLabel: t('cancelBtn'),
        danger: true,
        onConfirm: () => {
          const next = userPresets.filter(p => p.id !== preset.id)
          store.state.armedConfirm = ''
          void store.updateConfig({
            userPresets: next,
            activePresetId: config.activePresetId === preset.id ? '' : config.activePresetId
          })
        },
        onCancel: () => { store.state.armedConfirm = ''; store.notify() }
      })),
      el('div', { className: 'we-picker__row' },
        importInput,
        el('button', {
          type: 'button',
          className: 'we-picker__btn',
          disabled: userPresets.length >= 8,
          onClick: () => {
            store.state.presetSaveMode = store.state.presetSaveMode === 'save' ? '' : 'save'
            store.state.presetDraftName = isZh ? `自定义方案 ${userPresets.length + 1}` : `Custom ${userPresets.length + 1}`
            store.notify()
          }
        }, t('savePresetBtn')),
        el('button', {
          type: 'button',
          className: 'we-picker__btn',
          onClick: () => {
            store.state.presetSaveMode = store.state.presetSaveMode === 'export' ? '' : 'export'
            store.state.presetExportId = config.activePresetId || 'current'
            store.notify()
          }
        }, t('exportPreset')),
        el('button', {
          type: 'button',
          className: 'we-picker__btn',
          onClick: () => importInput.click()
        }, t('importPreset'))
      ),
      store.state.presetSaveMode === 'save' ? el('div', { className: 'we-picker__editor' },
        el('div', { className: 'we-picker__row' },
          el('input', {
            type: 'text',
            className: 'we-picker__text',
            value: store.state.presetDraftName || '',
            placeholder: isZh ? '输入预设名称…' : 'Preset name…',
            onInput: e => { store.state.presetDraftName = e.target.value }
          }),
          el('button', {
            type: 'button',
            className: 'we-picker__btn we-picker__btn--primary',
            onClick: () => {
              const id = `usr_${Date.now().toString(36)}`
              const name = String(store.state.presetDraftName || '').trim() || (isZh ? `自定义 ${userPresets.length + 1}` : `Custom ${userPresets.length + 1}`)
              const next = sanitizeUserPresets([
                ...userPresets,
                { id, name, values: extractGlassPresetValues(config) }
              ])
              store.state.presetSaveMode = ''
              void store.updateConfig({ userPresets: next, activePresetId: id })
            }
          }, t('confirmBtn')),
          el('button', {
            type: 'button',
            className: 'we-picker__btn',
            onClick: () => { store.state.presetSaveMode = ''; store.notify() }
          }, t('cancelBtn'))
        )
      ) : null,
      store.state.presetSaveMode === 'export' ? el('div', { className: 'we-picker__editor' },
        el('div', { className: 'we-picker__row' },
          el('select', {
            className: 'we-picker__select',
            style: { flex: '1' },
            value: store.state.presetExportId || 'current',
            onChange: e => { store.state.presetExportId = e.target.value; store.notify() }
          }, [
            el('option', { value: 'current', selected: store.state.presetExportId === 'current' }, isZh ? '当前画面全部参数' : 'Current live glass config'),
            ...allPresets.map(p => el('option', {
              value: p.id,
              selected: store.state.presetExportId === p.id
            }, p.name || (isZh ? p.nameZh : p.nameEn)))
          ]),
          el('button', {
            type: 'button',
            className: 'we-picker__btn we-picker__btn--primary',
            onClick: () => {
              const picked = allPresets.find(p => p.id === store.state.presetExportId)
              const payload = {
                name: picked ? (picked.name || picked.nameZh || picked.nameEn) : 'agy-skins-preset',
                values: picked ? picked.values : extractGlassPresetValues(config)
              }
              const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
              const url = URL.createObjectURL(blob)
              const a = el('a', { href: url, download: `${payload.name.replace(/[^\w\u4e00-\u9fa5-]+/g, '-')}.json` })
              a.click()
              setTimeout(() => URL.revokeObjectURL(url), 1000)
              store.state.presetSaveMode = ''
              store.showToast(t('presetExported'))
            }
          }, isZh ? '下载 JSON' : 'Download JSON'),
          el('button', {
            type: 'button',
            className: 'we-picker__btn',
            onClick: () => { store.state.presetSaveMode = ''; store.notify() }
          }, t('cancelBtn'))
        )
      ) : null
    ] : null
  )
}

function renderGlassSection(store) {
  const { config } = store.state
  const t = store.getT()
  const isZh = store.isZh()
  const open = store.state.sectionsOpen.glassUi !== false
  const glassColor = config.glassColor || { light: '#ffffff', dark: '#0d1524' }
  const withSurfaceCustom = (surface, patch, opts) => {
    const curMode = store.state.config?.glassMode || config.glassMode || {}
    const nextMode = { ...curMode, [surface]: 'custom' }
    void store.updateConfig({ ...patch, glassMode: nextMode, activePresetId: '' }, opts)
  }
  const surfaceSlider = (surface, cfgKey, label) => {
    const r = PARAM_RANGES[cfgKey]
    return SliderRow({
      label,
      min: r.min,
      max: r.max,
      step: 1,
      unit: r.unit || '',
      value: config[cfgKey],
      defaultValue: DEFAULT_CONFIG[cfgKey],
      onChange: v => withSurfaceCustom(surface, { [cfgKey]: v }, { defer: true, rerender: false }),
      onCommit: v => withSurfaceCustom(surface, { [cfgKey]: v }, { defer: false, rerender: false })
    })
  }
  const autoFollowBtn = (surface, cfgKey) => {
    const isInherited = !config[cfgKey] && (!surface || config.glassMode?.[surface] !== 'custom')
    return el('button', {
      type: 'button',
      className: `we-picker__swatch we-picker__swatch--auto ${isInherited ? 'we-picker__swatch--active' : ''}`,
      onClick: () => {
        const curMode = store.state.config?.glassMode || config.glassMode || {}
        const nextMode = { ...curMode }
        if (surface) nextMode[surface] = 'inherit'
        void store.updateConfig({ [cfgKey]: '', glassMode: nextMode, activePresetId: '' }, { rerender: false })
      }
    }, isZh ? '跟随' : 'Auto')
  }

  return el('div', { className: 'we-picker__section' },
    sectionHead({
      title: t('sectionGlass'),
      open,
      onToggle: () => toggleSection(store, 'glassUi'),
      resetBtn: moduleResetButton({ onClick: () => store.resetModule('glass') })
    }),
    open ? [
      switchRow({
        label: isZh ? '启用液态玻璃 UI' : 'Enable Liquid Glass UI',
        hint: isZh ? '开启后对顶栏、侧栏、输入卡、对话区与设置弹窗应用统一两段可读性玻璃。' : 'Unified two-stage readability glass across workbench & Settings.',
        checked: config.glassEnabled !== false,
        onChange: v => void store.updateConfig({ glassEnabled: v, activePresetId: '' }, { rerender: false })
      }),
      switchRow({
        label: isZh ? '深浅色分别配置玻璃底色' : 'Separate light/dark glass tints',
        checked: config.glassDarkSeparate !== false,
        onChange: v => void store.updateConfig({ glassDarkSeparate: v, activePresetId: '' })
      }),
      config.glassDarkSeparate !== false ? [
        swatchRow({
          label: isZh ? '浅色模式玻璃底色' : 'Light tint color',
          presets: GLASS_COLOR_PRESETS,
          value: glassColor.light,
          colorValue: glassColor.light,
          onPick: (c, defer) => void store.updateConfig({ glassColor: { ...(store.state.config?.glassColor || glassColor), light: c }, activePresetId: '' }, { defer, rerender: false })
        }),
        swatchRow({
          label: isZh ? '深色模式玻璃底色' : 'Dark tint color',
          presets: GLASS_COLOR_PRESETS,
          value: glassColor.dark,
          colorValue: glassColor.dark,
          onPick: (c, defer) => void store.updateConfig({ glassColor: { ...(store.state.config?.glassColor || glassColor), dark: c }, activePresetId: '' }, { defer, rerender: false })
        })
      ] : swatchRow({
        label: isZh ? '玻璃底色' : 'Glass tint color',
        presets: GLASS_COLOR_PRESETS,
        value: glassColor.light,
        colorValue: glassColor.light,
        onPick: (c, defer) => void store.updateConfig({ glassColor: { light: c, dark: c }, activePresetId: '' }, { defer, rerender: false })
      }),
      configSlider(store, 'panelGlass', t('panelGlass')),
      configSlider(store, 'surfaceFrost', t('surfaceFrost')),
      configSlider(store, 'settingsMaskStrength', isZh ? '设置背板遮罩强度' : 'Settings backdrop scrim'),
      configSlider(store, 'glassSaturation', t('glassSaturation')),
      configSlider(store, 'glassFidelity', isZh ? '玻璃色彩保真度' : 'Surface color fidelity'),
      segRow({
        label: isZh ? '思考过程块外观' : 'Thinking Block',
        hint: isZh ? '三档独立控制，避免长文思考卡片过透或生硬白框。' : 'Three-mode glass/off/native style for reasoning blocks.',
        value: config.thinkingMode || 'glass',
        syncActive: true,
        items: [
          { id: 'off', label: isZh ? '关' : 'Off' },
          { id: 'glass', label: isZh ? '液态玻璃' : 'Liquid Glass' },
          { id: 'native', label: isZh ? '原生' : 'Native' }
        ],
        onPick: id => void store.updateConfig({ thinkingMode: id, activePresetId: '' }, { rerender: false })
      }),
      switchRow({
        label: isZh ? '左侧边栏液态玻璃' : 'Left sidebar glass',
        checked: config.leftSidebarGlass !== false,
        onChange: v => void store.updateConfig({ leftSidebarGlass: v, activePresetId: '' }, { rerender: false })
      }),
      switchRow({
        label: isZh ? '顶部标题栏液态玻璃' : 'Titlebar glass',
        checked: Boolean(config.titlebarGlass),
        onChange: v => void store.updateConfig({ titlebarGlass: v, activePresetId: '' }, { rerender: false })
      }),
      switchRow({
        label: isZh ? '辅助/右侧栏液态玻璃' : 'Aux sidebar glass',
        checked: config.sidebarGlass !== false,
        onChange: v => void store.updateConfig({ sidebarGlass: v, activePresetId: '' }, { rerender: false })
      }),
      switchRow({
        label: isZh ? '全透侧栏模式' : 'Full-clear sidebar',
        hint: isZh ? '移除侧栏毛玻璃雾化层，使左侧导航直通壁纸层。' : 'Removes frost layer so sidebar sits straight over wallpaper.',
        checked: Boolean(config.sidebarFullClear),
        onChange: v => void store.updateConfig({ sidebarFullClear: v, activePresetId: '' }, { rerender: false })
      }),
      switchRow({
        label: isZh ? '浮层保留底层可读衬底' : 'Floater readable base',
        checked: config.floaterSolidBase !== false,
        onChange: v => void store.updateConfig({ floaterSolidBase: v, activePresetId: '' }, { rerender: false })
      }),
      el('div', { className: 'we-picker__row' },
        el('button', {
          type: 'button',
          className: `we-picker__btn ${store.state.showGlassDetail ? 'is-on' : ''}`,
          onClick: () => { store.state.showGlassDetail = !store.state.showGlassDetail; store.notify() }
        }, store.state.showGlassDetail ? (isZh ? '收起按面细节调节 ▴' : 'Hide Per-Surface Details ▴') : (isZh ? '展开详细按面调节 ▾' : 'Per-Surface Glass Details ▾'))
      ),
      store.state.showGlassDetail ? el('div', { className: 'we-picker__editor' },
        configSlider(store, 'composerFrost', t('composerFrost')),
        configSlider(store, 'bubbleOpacity', t('bubbleOpacity')),
        surfaceSlider('conversation', 'chatGlassFidelity', isZh ? '对话区色彩保真度' : 'Chat fidelity'),
        swatchRow({
          label: isZh ? '对话区独立底色' : 'Conversation tint',
          presets: GLASS_COLOR_PRESETS,
          value: config.conversationColor,
          colorValue: config.conversationColor || glassColor.light,
          autoBtn: autoFollowBtn('conversation', 'conversationColor'),
          onPick: (c, defer) => withSurfaceCustom('conversation', { conversationColor: c }, { defer, rerender: false })
        }),
        surfaceSlider('leftSidebar', 'leftSidebarTransparency', isZh ? '左侧栏透明度' : 'Left sidebar transparency'),
        surfaceSlider('leftSidebar', 'leftSidebarBlur', isZh ? '左侧栏模糊' : 'Left sidebar blur'),
        surfaceSlider('titlebar', 'titlebarTransparency', isZh ? '标题栏透明度' : 'Titlebar transparency'),
        surfaceSlider('titlebar', 'titlebarBlur', isZh ? '标题栏模糊' : 'Titlebar blur'),
        switchRow({
          label: isZh ? '辅助侧栏跟随全局参数' : 'Aux sidebar follows global glass',
          checked: config.sidebarFollowGlobal !== false,
          onChange: v => void store.updateConfig({ sidebarFollowGlobal: v }, { rerender: false })
        }),
        configSlider(store, 'sidebarAlpha', isZh ? '辅助侧栏透明度' : 'Aux sidebar transparency'),
        configSlider(store, 'sidebarBlur', isZh ? '辅助侧栏模糊' : 'Aux sidebar blur'),
        configSlider(store, 'sidebarContentAlpha', isZh ? '侧栏列表项底色浓度' : 'Sidebar row density'),
        swatchRow({
          label: isZh ? '侧栏列表项底色' : 'Sidebar row tint',
          presets: GLASS_COLOR_PRESETS,
          value: config.sidebarContentColor,
          colorValue: config.sidebarContentColor || glassColor.light,
          autoBtn: autoFollowBtn('sidebarContent', 'sidebarContentColor'),
          onPick: (c, defer) => withSurfaceCustom('sidebarContent', { sidebarContentColor: c }, { defer, rerender: false })
        }),
        surfaceSlider('settingsWindow', 'settingsWindowTransparency', isZh ? '设置弹窗透明度' : 'Settings transparency'),
        surfaceSlider('settingsWindow', 'settingsWindowBlur', isZh ? '设置弹窗模糊' : 'Settings blur'),
        swatchRow({
          label: isZh ? '设置弹窗底色' : 'Settings window tint',
          presets: GLASS_COLOR_PRESETS,
          value: config.settingsWindowColor,
          colorValue: config.settingsWindowColor || glassColor.light,
          autoBtn: autoFollowBtn('settingsWindow', 'settingsWindowColor'),
          onPick: (c, defer) => withSurfaceCustom('settingsWindow', { settingsWindowColor: c }, { defer, rerender: false })
        })
      ) : null
    ] : null
  )
}

function renderFontSection(store) {
  const { config, systemFonts, fontsLoaded, fontsLoading } = store.state
  const t = store.getT()
  const isZh = store.isZh()
  const open = store.state.sectionsOpen.font === true

  if (open && !fontsLoaded && !fontsLoading) {
    store.state.fontsLoading = true
    void store.rpc('fonts-list', { refresh: false }).then(res => {
      if (Array.isArray(res?.fonts)) {
        store.state.systemFonts = res.fonts
        store.state.fontsLoaded = true
      }
      store.state.fontsLoading = false
      store.notify()
    }).catch(() => {
      store.state.fontsLoading = false
    })
  }

  const fontSets = config.fontSets || []
  const activeSet = fontSets.find(s => s.id === config.fontSetId) || null
  const fontOpts = [
    { value: '', label: t('fontFamilyPlaceholder') },
    ...systemFonts.map(f => ({ value: f, label: f }))
  ]
  if (config.globalFamily && !systemFonts.includes(config.globalFamily)) {
    fontOpts.splice(1, 0, { value: config.globalFamily, label: config.globalFamily })
  }

  const updateThemeRoleColor = (role, mode, hexVal) => {
    const next = structuredClone(config.themeColors || {})
    const cur = next[role] || {}
    next[role] = { light: cur.light || '#111827', dark: cur.dark || '#f8fafc', [mode]: hexVal }
    void store.updateConfig({ themeColors: next })
  }

  const updateRoleType = (field, role, val) => {
    const next = { ...(config[field] || {}) }
    if (val === '' || val === null || val === undefined) delete next[role]
    else next[role] = val
    void store.updateConfig({ [field]: next })
  }

  const updateCompFont = (id, patch) => {
    const next = structuredClone(config.componentFonts || {})
    next[id] = { ...(next[id] || {}), ...patch }
    void store.updateConfig({ componentFonts: next })
  }

  const rolesToRender = store.state.fontOnlyModified
    ? TYPE_ROLE_IDS.filter(r => config.themeSize?.[r] || config.themeWeight?.[r] || config.themeFamily?.[r])
    : TYPE_ROLE_IDS

  return el('div', { className: 'we-picker__section' },
    sectionHead({
      title: t('sectionTypography'),
      open,
      onToggle: () => toggleSection(store, 'font'),
      resetBtn: moduleResetButton({ onClick: () => store.resetModule('font') })
    }),
    open ? [
      switchRow({
        label: t('fontCustom'),
        checked: Boolean(config.fontCustom),
        onChange: v => void store.updateConfig({ fontCustom: v })
      }),
      el('div', { className: 'we-picker__row' },
        el('select', {
          className: 'we-picker__select',
          style: { flex: '1' },
          value: config.fontSetId || '',
          onChange: e => {
            const found = fontSets.find(s => s.id === e.target.value)
            if (!found) void store.updateConfig({ fontSetId: '' })
            else void store.updateConfig({ fontSetId: found.id, ...structuredClone(found.values) })
          }
        }, [
          el('option', { value: '', selected: !config.fontSetId }, isZh ? '未命名草稿字体集' : 'Draft / Unsaved Set'),
          ...fontSets.map(s => el('option', { value: s.id, selected: s.id === config.fontSetId }, s.name))
        ]),
        el('button', {
          type: 'button',
          className: 'we-picker__btn',
          onClick: () => {
            const id = `fs_${Date.now().toString(36)}`
            const next = [...fontSets, { id, name: isZh ? `字体集 ${fontSets.length + 1}` : `Font Set ${fontSets.length + 1}`, values: pickFontSetValues(config) }]
            void store.updateConfig({ fontSets: next, fontSetId: id })
          }
        }, isZh ? '新建字体集' : 'Save New'),
        activeSet ? el('button', {
          type: 'button',
          className: 'we-picker__btn',
          onClick: () => {
            const next = fontSets.map(s => s.id === activeSet.id ? { ...s, values: pickFontSetValues(config) } : s)
            void store.updateConfig({ fontSets: next })
            store.showToast(isZh ? '已更新字体集' : 'Font set updated')
          }
        }, isZh ? '覆盖保存' : 'Overwrite') : null,
        activeSet ? el('button', {
          type: 'button',
          className: 'we-picker__btn we-picker__btn--danger',
          onClick: () => {
            const next = fontSets.filter(s => s.id !== activeSet.id)
            void store.updateConfig({ fontSets: next, fontSetId: next[0]?.id || '' })
          }
        }, isZh ? '删除' : 'Delete') : null
      ),
      el('div', { className: 'we-picker__ctl' },
        selectRow({
          label: t('fontFamily'),
          value: config.globalFamily || '',
          options: fontOpts,
          onChange: v => void store.updateConfig({ globalFamily: v })
        }),
        el('button', {
          type: 'button',
          className: 'we-picker__btn',
          disabled: fontsLoading,
          onClick: async () => {
            store.state.fontsLoading = true
            store.notify()
            try {
              const res = await store.rpc('fonts-list', { refresh: true })
              if (Array.isArray(res?.fonts)) {
                store.state.systemFonts = res.fonts
                store.state.fontsLoaded = true
                store.showToast(isZh ? `已扫描 ${res.fonts.length} 个本机字体` : `Scanned ${res.fonts.length} system fonts`)
              }
            } finally {
              store.state.fontsLoading = false
              store.notify()
            }
          }
        }, fontsLoading ? t('fontScanning') : t('scanFonts'))
      ),
      selectRow({
        label: isZh ? '终端代码块字体' : 'Terminal font family',
        value: config.componentFonts?.terminal?.family || '',
        options: fontOpts.map(o => o.value ? o : { value: '', label: isZh ? '继承全局字体' : 'Inherit global' }),
        onChange: v => updateCompFont('terminal', { family: v })
      }),
      switchRow({
        label: isZh ? '深浅色分别设定文字颜色' : 'Separate light/dark text role colors',
        checked: Boolean(config.themeDarkSeparate),
        onChange: v => void store.updateConfig({ themeDarkSeparate: v })
      }),
      ...THEME_COLOR_ROLE_IDS.map(role => {
        const pair = config.themeColors?.[role] || {}
        return el('div', { className: 'we-picker__ctl' },
          el('span', { className: 'we-picker__ctl-label' }, `text.${role}`),
          el('div', { className: 'we-picker__ctl-side' },
            el('span', { className: 'we-picker__hint' }, 'L'),
            el('label', { className: 'we-picker__swatch-custom' },
              el('input', {
                type: 'color',
                value: pair.light || '#111827',
                onInput: e => updateThemeRoleColor(role, 'light', e.target.value)
              })
            ),
            config.themeDarkSeparate ? [
              el('span', { className: 'we-picker__hint' }, 'D'),
              el('label', { className: 'we-picker__swatch-custom' },
                el('input', {
                  type: 'color',
                  value: pair.dark || '#f8fafc',
                  onInput: e => updateThemeRoleColor(role, 'dark', e.target.value)
                })
              )
            ] : null
          )
        )
      }),
      switchRow({
        label: isZh ? '仅显示已修改排版角色' : 'Only show modified roles',
        checked: store.state.fontOnlyModified,
        onChange: v => { store.state.fontOnlyModified = v; store.notify() }
      }),
      el('table', { className: 'we-picker__font-table' },
        el('thead', null,
          el('tr', null,
            el('th', null, isZh ? '排版角色' : 'Role'),
            el('th', null, isZh ? '字号(px)' : 'Size'),
            el('th', null, isZh ? '字重' : 'Weight'),
            el('th', null, isZh ? '字体覆盖' : 'Family')
          )
        ),
        el('tbody', null,
          rolesToRender.map(role => {
            const labelPair = TYPE_ROLE_LABELS[role] || [role, role]
            return el('tr', null,
              el('td', { style: { fontSize: '12px' } }, isZh ? labelPair[0] : labelPair[1]),
              el('td', null,
                el('input', {
                  type: 'number',
                  className: 'we-picker__text',
                  style: { width: '58px', height: '26px', padding: '0 6px' },
                  min: '8',
                  max: '48',
                  placeholder: 'auto',
                  value: config.themeSize?.[role] ? String(config.themeSize[role]) : '',
                  onChange: e => updateRoleType('themeSize', role, e.target.value ? Number(e.target.value) : '')
                })
              ),
              el('td', null,
                el('input', {
                  type: 'number',
                  className: 'we-picker__text',
                  style: { width: '64px', height: '26px', padding: '0 6px' },
                  min: '100',
                  max: '900',
                  step: '100',
                  placeholder: 'auto',
                  value: config.themeWeight?.[role] ? String(config.themeWeight[role]) : '',
                  onChange: e => updateRoleType('themeWeight', role, e.target.value ? Number(e.target.value) : '')
                })
              ),
              el('td', null,
                el('select', {
                  className: 'we-picker__select',
                  style: { height: '26px', maxWidth: '140px' },
                  value: config.themeFamily?.[role] || '',
                  onChange: e => updateRoleType('themeFamily', role, e.target.value)
                }, fontOpts.map(o => el('option', {
                  value: o.value,
                  selected: o.value === (config.themeFamily?.[role] || '')
                }, o.label)))
              )
            )
          })
        )
      ),
      el('div', { className: 'we-picker__hint', style: { marginTop: '4px' } }, isZh ? '组件级覆盖' : 'Component Overrides'),
      el('table', { className: 'we-picker__font-table' },
        el('thead', null,
          el('tr', null,
            el('th', null, isZh ? '组件' : 'Component'),
            el('th', null, isZh ? '字号' : 'Size'),
            el('th', null, isZh ? '字重' : 'Weight'),
            el('th', null, isZh ? '字体' : 'Family')
          )
        ),
        el('tbody', null,
          COMPONENT_FONT_TARGETS.map(target => {
            const cur = config.componentFonts?.[target.id] || {}
            return el('tr', null,
              el('td', { style: { fontSize: '12px' } }, isZh ? target.label : target.labelEn),
              el('td', null,
                el('input', {
                  type: 'number',
                  className: 'we-picker__text',
                  style: { width: '58px', height: '26px', padding: '0 6px' },
                  min: '8',
                  max: '48',
                  placeholder: 'auto',
                  value: cur.size ? String(cur.size) : '',
                  onChange: e => updateCompFont(target.id, { size: e.target.value ? Number(e.target.value) : '' })
                })
              ),
              el('td', null,
                el('input', {
                  type: 'number',
                  className: 'we-picker__text',
                  style: { width: '64px', height: '26px', padding: '0 6px' },
                  min: '100',
                  max: '900',
                  step: '100',
                  placeholder: 'auto',
                  value: cur.weight ? String(cur.weight) : '',
                  onChange: e => updateCompFont(target.id, { weight: e.target.value ? Number(e.target.value) : '' })
                })
              ),
              el('td', null,
                el('select', {
                  className: 'we-picker__select',
                  style: { height: '26px', maxWidth: '140px' },
                  value: cur.family || '',
                  onChange: e => updateCompFont(target.id, { family: e.target.value })
                }, fontOpts.map(o => el('option', { value: o.value, selected: o.value === (cur.family || '') }, o.label)))
              )
            )
          })
        )
      )
    ] : null
  )
}

export function renderAppearanceTab(store) {
  const { config, embed } = store.state
  const t = store.getT()
  const isZh = store.isZh()
  const equalCorners = embed !== 'aux'
  const radiusItems = [
    { id: 'native', label: isZh ? '跟随原生' : 'Native' },
    { id: '6', label: '6px' },
    { id: '12', label: '12px' },
    { id: '20', label: '20px' }
  ]

  const autoColorBtn = (cfgKey, autoText) => el('button', {
    type: 'button',
    className: `we-picker__swatch we-picker__swatch--auto ${!config[cfgKey] ? 'we-picker__swatch--active' : ''}`,
    onClick: () => void store.updateConfig({ [cfgKey]: '' }, { rerender: false })
  }, autoText)

  const uiElements = [
    { key: 'uiColorSend', label: isZh ? '发送按钮与主 CTA' : 'Send & CTA button' },
    { key: 'uiColorLink', label: isZh ? '链接文字' : 'Link text' },
    { key: 'uiColorFileIcon', label: isZh ? '文件图标与引用芯片' : 'File icons & chips' },
    { key: 'uiColorTab', label: isZh ? '标签栏激活指示线' : 'Active tab indicator' },
    { key: 'uiColorDeepDiving', label: isZh ? '深度思考脉冲高亮' : 'Thinking / Highlight accent' }
  ]

  return el('div', { className: 'we-tabpanel' },
    renderPresetsSection(store),

    /* Theme Follow */
    el('div', { className: 'we-picker__section' },
      sectionHead({
        title: isZh ? '主题跟随' : 'Theme Follow',
        resetBtn: moduleResetButton({ onClick: () => store.resetModule('theme') })
      }),
      switchRow({
        label: isZh ? '从当前壁纸自动取色作为强调色' : 'Extract accent color from wallpaper',
        checked: Boolean(config.themeFollow),
        onChange: v => void store.updateConfig({ themeFollow: v }, { rerender: false })
      })
    ),

    /* Detail */
    el('div', { className: 'we-picker__section' },
      sectionHead({
        title: isZh ? '细节' : 'Details',
        open: store.state.sectionsOpen.detail !== false,
        onToggle: () => toggleSection(store, 'detail'),
        resetBtn: moduleResetButton({ onClick: () => store.resetModule('detail') })
      }),
      store.state.sectionsOpen.detail !== false ? [
        configSlider(store, 'glassBorder', t('glassBorder')),
        switchRow({
          label: t('glassHighlight'),
          checked: config.glassHighlight !== false,
          onChange: v => void store.updateConfig({ glassHighlight: v, activePresetId: '' }, { rerender: false })
        })
      ] : null
    ),

    renderGlassSection(store),

    /* Sidebar Corners */
    el('div', { className: 'we-picker__section' },
      sectionHead({
        title: isZh ? '侧边栏圆角' : 'Sidebar Corners',
        open: store.state.sectionsOpen.corners !== false,
        onToggle: () => toggleSection(store, 'corners'),
        resetBtn: moduleResetButton({ onClick: () => store.resetModule('corners') })
      }),
      store.state.sectionsOpen.corners !== false ? [
        segRow({
          label: isZh ? '左侧边栏统一圆角' : 'Left sidebar radius',
          value: config.leftSidebarCornerRadius || 'native',
          syncActive: true,
          items: radiusItems,
          onPick: id => void store.updateConfig({ leftSidebarCornerRadius: id, activePresetId: '' }, { rerender: false })
        }),
        cornerButtons(store, 'leftSidebar', isZh ? '左侧边栏单独改直角' : 'Left sidebar square corners', equalCorners),
        segRow({
          label: isZh ? '右侧栏统一圆角' : 'Right sidebar radius',
          value: config.rightSidebarCornerRadius || 'native',
          syncActive: true,
          items: radiusItems,
          onPick: id => void store.updateConfig({ rightSidebarCornerRadius: id, activePresetId: '' }, { rerender: false })
        }),
        cornerButtons(store, 'rightSidebar', isZh ? '右侧栏单独改直角' : 'Right sidebar square corners', equalCorners)
      ] : null
    ),

    /* Global UI Colors */
    el('div', { className: 'we-picker__section' },
      sectionHead({
        title: isZh ? '全局 UI 配色' : 'Global UI Colors',
        open: store.state.sectionsOpen.uiColor === true,
        onToggle: () => toggleSection(store, 'uiColor'),
        resetBtn: moduleResetButton({ onClick: () => store.resetModule('uiColor') })
      }),
      store.state.sectionsOpen.uiColor === true ? [
        swatchRow({
          label: isZh ? '全局强调色 (Accent)' : 'Global accent color',
          disabled: Boolean(config.uiColorCustom),
          presets: ACCENT_PRESETS,
          value: config.accent || '#4f8cff',
          colorValue: COLOR_HEX_RE.test(config.accent || '') ? config.accent : '#4f8cff',
          onPick: (c, defer) => void store.updateConfig({ accent: c }, { defer, rerender: false })
        }),
        switchRow({
          label: isZh ? '分元素自定义界面配色' : 'Customize per-element colors',
          checked: Boolean(config.uiColorCustom),
          onChange: v => void store.updateConfig({ uiColorCustom: v })
        }),
        ...uiElements.map(item => swatchRow({
          label: item.label,
          disabled: !config.uiColorCustom,
          presets: ACCENT_PRESETS,
          value: config[item.key],
          colorValue: COLOR_HEX_RE.test(config[item.key] || '') ? config[item.key] : (config.accent || '#4f8cff'),
          autoBtn: autoColorBtn(item.key, isZh ? '跟随' : 'Auto'),
          onPick: (c, defer) => void store.updateConfig({ [item.key]: c, uiColorCustom: true }, { defer, rerender: false })
        })),
        swatchRow({
          label: t('caretColor'),
          presets: CARET_COLOR_PRESETS,
          value: config.caretColor,
          colorValue: COLOR_HEX_RE.test(config.caretColor || '') ? config.caretColor : '#4f8cff',
          autoBtn: autoColorBtn('caretColor', isZh ? '自动' : 'Auto'),
          onPick: (c, defer) => void store.updateConfig({ caretColor: c }, { defer, rerender: false })
        })
      ] : null
    ),

    renderFontSection(store)
  )
}
