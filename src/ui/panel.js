/**
 * Root 7-tab Studio / Aux Sidecar UI for Antigravity Wallpaper Engine (`agy-skins`).
 * Tabs: library | appearance | effects | audio | advanced | extensions | about
 */
import {
  el,
  callBackend,
  createPanelStore,
  rangeControl,
  switchControl,
  selectControl,
  colorControl
} from './panel-api.js'
import {
  DEFAULT_CONFIG,
  PARAM_RANGES,
  TRANSITION_VALUES,
  TRANSITION_DIRECTIONS,
  TRANSITION_SPEEDS,
  FX_CLICK_STYLES,
  FX_TRAIL_STYLES,
  FX_BLEND_VALUES,
  FX_COLOR_MODES,
  normalizeConfig
} from '../shared/config.js'
import { renderWallpaperEnginePanel } from './components/WallpaperEnginePanel.js'
import { renderFontSettingsPanel } from './components/FontSettingsPanel.js'
import { renderRotationGroupEditor } from './components/RotationGroupEditor.js'

const TABS = [
  { id: 'library', en: 'Library', zh: '壁纸库' },
  { id: 'appearance', en: 'Appearance', zh: '外观与玻璃' },
  { id: 'effects', en: 'FX & Parallax', zh: '特效与视差' },
  { id: 'audio', en: 'Audio & Rotation', zh: '音频与轮播' },
  { id: 'advanced', en: 'Advanced', zh: '高级与系统' },
  { id: 'extensions', en: 'Extensions', zh: '扩展槽位' },
  { id: 'about', en: 'About', zh: '关于' }
]

const RESET_KEYS = {
  library: ['wallpaperFit', 'sortOrder', 'pickerLayout', 'orientationFilter', 'typeFilter', 'contentRatingFilter', 'folderFilter'],
  appearance: [
    'wallpaperBlur', 'maskOcclusion', 'wallpaperOpacity', 'backgroundBrightness', 'backgroundContrast',
    'backgroundSaturate', 'wallpaperFlip', 'layerPositionX', 'layerPositionY', 'layerScale',
    'wallpaperTransition', 'wallpaperTransitionDir', 'wallpaperTransitionSpeed', 'pictureSlideSeconds',
    'panelGlass', 'bubbleOpacity', 'composerFrost', 'surfaceFrost', 'glassSaturation', 'glassBorder',
    'glassHighlight', 'glassColor', 'glassDarkSeparate', 'glassFidelity', 'chatGlassFidelity',
    'settingsWindowTransparency', 'settingsWindowBlur', 'sidebarGlass', 'sidebarFollowGlobal',
    'sidebarBlur', 'sidebarAlpha', 'sidebarColor', 'leftSidebarGlass', 'leftSidebarCornerRadius',
    'leftSidebarSquareTL', 'leftSidebarSquareTR', 'leftSidebarSquareBR', 'leftSidebarSquareBL',
    'rightSidebarCornerRadius', 'rightSidebarSquareTL', 'rightSidebarSquareTR', 'rightSidebarSquareBR',
    'rightSidebarSquareBL', 'titlebarGlass', 'fontCustom', 'globalFamily', 'caretColor', 'themeFollow'
  ],
  effects: [
    'fxEnabled', 'fxClick', 'fxClickStyle', 'fxClickSize', 'fxClickGlow',
    'fxTrail', 'fxTrailStyle', 'fxTrailLength', 'fxTrailWidth', 'fxTrailGlow',
    'fxOpacity', 'fxBlend', 'fxColorMode', 'fxColor',
    'parallaxEnabled', 'parallaxBg', 'parallaxUi', 'parallaxUiChatDepth',
    'parallaxUiComposerDepth', 'parallaxUiSidebarDepth', 'parallaxUiBubbleDepth', 'parallaxSmooth'
  ],
  audio: [
    'wallpaperMode', 'wallpaperSound', 'wallpaperVolume', 'videoPlaybackRate',
    'pauseOnHidden', 'pauseOnBlur', 'pauseOnBattery',
    'sceneLive', 'sceneLiveFps', 'sceneAutoQuality', 'sceneRenderDpr',
    'sceneVideoTexScale', 'liveBootDelay', 'rotationEnabled', 'rotationMinutes'
  ],
  advanced: ['browserHoleCutout', 'studioShortcut', 'uiLanguage'],
  extensions: ['parallaxPlugin', 'parallaxPluginDepths']
}

function slider(store, cfgKey, label, desc = '', extra = {}) {
  const r = PARAM_RANGES[cfgKey]
  return rangeControl({
    label,
    desc,
    min: extra.min ?? r.min,
    max: extra.max ?? r.max,
    step: extra.step ?? (Number.isInteger(r.max) && r.max > 10 ? 1 : 0.1),
    unit: extra.unit ?? r.unit ?? '',
    value: store.state.config[cfgKey],
    onChange: v => void store.updateConfig({ [cfgKey]: v }, { defer: true, silent: true }),
    onCommit: v => void store.updateConfig({ [cfgKey]: v }, { defer: false })
  })
}

function renderAppearanceTab(store) {
  const { config } = store.state
  const t = store.getT()
  const isZh = t('weTypeVideo') === '视频'
  const cornerOpts = [
    { value: 'native', label: isZh ? '原生圆角' : 'Native' },
    { value: '6', label: '6px' },
    { value: '12', label: '12px' },
    { value: '20', label: '20px' }
  ]
  return el('div', { style: { display: 'flex', flexDirection: 'column', gap: '12px' } },
    el('div', { className: 'agy-card' },
      el('div', { className: 'agy-card-title' }, isZh ? '壁纸画面与过场动画' : 'Backdrop & Transitions'),
      selectControl({
        label: t('wallpaperFit'),
        value: config.wallpaperFit,
        options: [
          { value: 'cover', label: t('wallpaperFitCover') },
          { value: 'contain', label: t('wallpaperFitContain') },
          { value: 'fill', label: t('wallpaperFitFill') },
          { value: 'center', label: isZh ? '居中原始尺寸' : 'Center' }
        ],
        onChange: v => void store.updateConfig({ wallpaperFit: v })
      }),
      slider(store, 'wallpaperOpacity', t('wallpaperOpacity'), t('wallpaperOpacityDesc')),
      slider(store, 'wallpaperBlur', t('wallpaperBlur'), t('wallpaperBlurDesc')),
      slider(store, 'maskOcclusion', t('maskOcclusion'), t('maskOcclusionDesc')),
      slider(store, 'backgroundBrightness', isZh ? '背景亮度' : 'Brightness'),
      slider(store, 'backgroundContrast', isZh ? '背景对比度' : 'Contrast'),
      slider(store, 'backgroundSaturate', isZh ? '背景饱和度' : 'Saturation'),
      slider(store, 'layerScale', isZh ? '画面缩放' : 'Layer scale'),
      slider(store, 'layerPositionX', isZh ? '水平焦点 X' : 'Horizontal focus X'),
      slider(store, 'layerPositionY', isZh ? '垂直焦点 Y' : 'Vertical focus Y'),
      switchControl({
        label: isZh ? '水平镜像翻转壁纸' : 'Flip wallpaper horizontally',
        checked: config.wallpaperFlip,
        onChange: v => void store.updateConfig({ wallpaperFlip: v })
      }),
      selectControl({
        label: t('wallpaperTransition'),
        value: config.wallpaperTransition,
        options: TRANSITION_VALUES.map(v => ({ value: v, label: v })),
        onChange: v => void store.updateConfig({ wallpaperTransition: v })
      }),
      selectControl({
        label: isZh ? '过场方向' : 'Transition direction',
        value: config.wallpaperTransitionDir,
        options: TRANSITION_DIRECTIONS.map(v => ({ value: v, label: v })),
        onChange: v => void store.updateConfig({ wallpaperTransitionDir: v })
      }),
      selectControl({
        label: isZh ? '过场速度' : 'Transition speed',
        value: config.wallpaperTransitionSpeed,
        options: TRANSITION_SPEEDS.map(v => ({ value: v, label: v })),
        onChange: v => void store.updateConfig({ wallpaperTransitionSpeed: v })
      }),
      el('div', { className: 'agy-row' },
        el('div', { className: 'agy-label' }, isZh ? 'Picture 多图幻灯片间隔 (秒, 0=使用工程默认)' : 'Picture slideshow interval (sec, 0=default)'),
        el('input', {
          type: 'number',
          className: 'agy-input',
          style: { width: '90px' },
          min: '0',
          max: '3600',
          value: String(config.pictureSlideSeconds || 0),
          onChange: e => void store.updateConfig({ pictureSlideSeconds: Math.max(0, Math.min(3600, Number(e.target.value) || 0)) })
        })
      )
    ),

    el('div', { className: 'agy-card' },
      el('div', { className: 'agy-card-title' }, t('sectionGlass')),
      el('div', { className: 'agy-card-desc' }, t('sectionGlassDesc')),
      slider(store, 'panelGlass', t('panelGlass'), t('panelGlassDesc')),
      slider(store, 'bubbleOpacity', t('bubbleOpacity'), t('bubbleOpacityDesc')),
      slider(store, 'composerFrost', t('composerFrost'), t('composerFrostDesc')),
      slider(store, 'surfaceFrost', t('surfaceFrost'), t('surfaceFrostDesc')),
      slider(store, 'glassSaturation', t('glassSaturation'), t('glassSaturationDesc')),
      slider(store, 'glassBorder', t('glassBorder'), t('glassBorderDesc')),
      slider(store, 'glassFidelity', isZh ? '全局玻璃还原度' : 'Global glass fidelity'),
      slider(store, 'chatGlassFidelity', isZh ? '对话气泡玻璃还原度' : 'Chat bubble fidelity'),
      slider(store, 'settingsWindowTransparency', isZh ? '弹窗/设置窗口透明度' : 'Modal overlay transparency'),
      slider(store, 'settingsWindowBlur', isZh ? '弹窗/设置窗口模糊' : 'Modal overlay blur'),
      switchControl({
        label: t('glassHighlight'),
        checked: config.glassHighlight,
        onChange: v => void store.updateConfig({ glassHighlight: v })
      }),
      switchControl({
        label: isZh ? '深浅色分别指定玻璃底色' : 'Separate light/dark glass tint',
        checked: config.glassDarkSeparate,
        onChange: v => void store.updateConfig({ glassDarkSeparate: v })
      }),
      el('div', { className: 'agy-row' },
        el('div', { className: 'agy-label' }, isZh ? '自定义玻璃底色 (#ffffff=跟随主题)' : 'Custom glass tint (#ffffff=auto theme)'),
        el('div', { className: 'agy-color-group' },
          el('input', {
            type: 'color',
            className: 'agy-color-input',
            value: config.glassColor?.light || '#ffffff',
            onInput: e => void store.updateConfig({ glassColor: { ...config.glassColor, light: e.target.value } })
          }),
          config.glassDarkSeparate ? el('input', {
            type: 'color',
            className: 'agy-color-input',
            value: config.glassColor?.dark || '#ffffff',
            onInput: e => void store.updateConfig({ glassColor: { ...config.glassColor, dark: e.target.value } })
          }) : null
        )
      )
    ),

    el('div', { className: 'agy-card' },
      el('div', { className: 'agy-card-title' }, isZh ? '侧边栏与顶栏玻璃形态' : 'Sidebar & Titlebar Surface Material'),
      switchControl({ label: isZh ? '启用侧边栏玻璃透视' : 'Sidebar liquid glass', checked: config.sidebarGlass, onChange: v => void store.updateConfig({ sidebarGlass: v }) }),
      switchControl({ label: isZh ? '左侧边栏应用全局模糊' : 'Left sidebar glass', checked: config.leftSidebarGlass, onChange: v => void store.updateConfig({ leftSidebarGlass: v }) }),
      switchControl({ label: isZh ? '顶栏与标题区应用全局模糊' : 'Titlebar glass', checked: config.titlebarGlass, onChange: v => void store.updateConfig({ titlebarGlass: v }) }),
      switchControl({ label: isZh ? '侧栏跟随全局透明度与模糊' : 'Sidebars follow global glass settings', checked: config.sidebarFollowGlobal, onChange: v => void store.updateConfig({ sidebarFollowGlobal: v }) }),
      !config.sidebarFollowGlobal ? [
        slider(store, 'sidebarAlpha', isZh ? '侧栏自定义透明度' : 'Sidebar transparency'),
        slider(store, 'sidebarBlur', isZh ? '侧栏自定义模糊' : 'Sidebar blur'),
        colorControl({ label: isZh ? '侧栏染色' : 'Sidebar tint color', value: config.sidebarColor, fallback: '#ffffff', onChange: v => void store.updateConfig({ sidebarColor: v }) })
      ] : null,
      selectControl({
        label: isZh ? '左侧边栏圆角' : 'Left sidebar radius',
        value: config.leftSidebarCornerRadius,
        options: cornerOpts,
        onChange: v => void store.updateConfig({ leftSidebarCornerRadius: v })
      }),
      el('div', { className: 'agy-chips' },
        ['TL', 'TR', 'BR', 'BL'].map(corner => {
          const k = `leftSidebarSquare${corner}`
          return el('button', {
            type: 'button',
            className: `agy-chip ${config[k] ? 'active' : ''}`,
            onClick: () => void store.updateConfig({ [k]: !config[k] })
          }, `${isZh ? '左方角' : 'L-Square'} ${corner}`)
        })
      ),
      selectControl({
        label: isZh ? '右侧面板圆角' : 'Right panel radius',
        value: config.rightSidebarCornerRadius,
        options: cornerOpts,
        onChange: v => void store.updateConfig({ rightSidebarCornerRadius: v })
      }),
      el('div', { className: 'agy-chips' },
        ['TL', 'TR', 'BR', 'BL'].map(corner => {
          const k = `rightSidebarSquare${corner}`
          return el('button', {
            type: 'button',
            className: `agy-chip ${config[k] ? 'active' : ''}`,
            onClick: () => void store.updateConfig({ [k]: !config[k] })
          }, `${isZh ? '右方角' : 'R-Square'} ${corner}`)
        })
      )
    ),

    renderFontSettingsPanel(store)
  )
}

function renderEffectsTab(store) {
  const { config } = store.state
  const t = store.getT()
  const isZh = t('weTypeVideo') === '视频'
  return el('div', { style: { display: 'flex', flexDirection: 'column', gap: '12px' } },
    el('div', { className: 'agy-card' },
      el('div', { className: 'agy-card-title' }, t('sectionFx')),
      el('div', { className: 'agy-card-desc' }, t('sectionFxDesc')),
      switchControl({ label: t('fxEnabled'), checked: config.fxEnabled, onChange: v => void store.updateConfig({ fxEnabled: v }) }),
      switchControl({ label: t('fxClick'), checked: config.fxClick, onChange: v => void store.updateConfig({ fxClick: v }) }),
      selectControl({
        label: t('fxClickStyle'),
        value: config.fxClickStyle,
        options: FX_CLICK_STYLES.map(v => ({ value: v, label: v })),
        onChange: v => void store.updateConfig({ fxClickStyle: v })
      }),
      slider(store, 'fxClickSize', t('fxClickSize')),
      slider(store, 'fxClickGlow', t('fxClickGlow')),
      switchControl({ label: t('fxTrail'), checked: config.fxTrail, onChange: v => void store.updateConfig({ fxTrail: v }) }),
      selectControl({
        label: t('fxTrailStyle'),
        value: config.fxTrailStyle,
        options: FX_TRAIL_STYLES.map(v => ({ value: v, label: v })),
        onChange: v => void store.updateConfig({ fxTrailStyle: v })
      }),
      slider(store, 'fxTrailLength', t('fxTrailLength')),
      slider(store, 'fxTrailWidth', t('fxTrailWidth')),
      slider(store, 'fxTrailGlow', t('fxTrailGlow')),
      slider(store, 'fxOpacity', t('fxOpacity')),
      selectControl({
        label: t('fxBlend'),
        value: config.fxBlend,
        options: FX_BLEND_VALUES.map(v => ({ value: v, label: v })),
        onChange: v => void store.updateConfig({ fxBlend: v })
      }),
      selectControl({
        label: t('fxColorMode'),
        value: config.fxColorMode,
        options: FX_COLOR_MODES.map(v => ({ value: v, label: v })),
        onChange: v => void store.updateConfig({ fxColorMode: v })
      }),
      config.fxColorMode === 'custom'
        ? colorControl({ label: t('fxColor'), value: config.fxColor, onChange: v => void store.updateConfig({ fxColor: v }) })
        : null
    ),

    el('div', { className: 'agy-card' },
      el('div', { className: 'agy-card-title' }, t('sectionParallax')),
      el('div', { className: 'agy-card-desc' }, t('sectionParallaxDesc')),
      switchControl({ label: t('parallaxEnabled'), checked: config.parallaxEnabled, onChange: v => void store.updateConfig({ parallaxEnabled: v }) }),
      slider(store, 'parallaxBg', t('parallaxBgDepth')),
      slider(store, 'parallaxSmooth', t('parallaxSmooth')),
      switchControl({ label: t('parallaxUi'), checked: config.parallaxUi, onChange: v => void store.updateConfig({ parallaxUi: v }) }),
      config.parallaxUi ? [
        slider(store, 'parallaxUiChatDepth', t('parallaxUiChat')),
        slider(store, 'parallaxUiComposerDepth', t('parallaxUiComposer')),
        slider(store, 'parallaxUiSidebarDepth', t('parallaxUiSidebar')),
        slider(store, 'parallaxUiBubbleDepth', isZh ? '消息气泡深度' : 'Bubble depth')
      ] : null
    )
  )
}

function renderAudioTab(store) {
  const { config } = store.state
  const t = store.getT()
  const isZh = t('weTypeVideo') === '视频'
  return el('div', { style: { display: 'flex', flexDirection: 'column', gap: '12px' } },
    el('div', { className: 'agy-card' },
      el('div', { className: 'agy-card-title' }, t('sectionPlayback')),
      el('div', { className: 'agy-card-desc' }, t('sectionPlaybackDesc')),
      selectControl({
        label: t('wallpaperMode'),
        value: config.wallpaperMode,
        options: [
          { value: 'live', label: t('wallpaperModeLive') },
          { value: 'frame', label: t('wallpaperModeFrame') }
        ],
        onChange: v => void store.updateConfig({ wallpaperMode: v })
      }),
      switchControl({ label: t('wallpaperSound'), checked: config.wallpaperSound, onChange: v => void store.updateConfig({ wallpaperSound: v }) }),
      slider(store, 'wallpaperVolume', t('wallpaperVolume'), t('wallpaperVolumeDesc')),
      rangeControl({
        label: t('videoPlaybackRate'),
        min: 0.5,
        max: 2,
        step: 0.1,
        unit: 'x',
        value: config.videoPlaybackRate,
        onChange: v => void store.updateConfig({ videoPlaybackRate: v }, { defer: true, silent: true }),
        onCommit: v => void store.updateConfig({ videoPlaybackRate: v })
      }),
      switchControl({ label: t('pauseOnHidden'), checked: config.pauseOnHidden, onChange: v => void store.updateConfig({ pauseOnHidden: v }) }),
      switchControl({ label: t('pauseOnBlur'), checked: config.pauseOnBlur, onChange: v => void store.updateConfig({ pauseOnBlur: v }) }),
      switchControl({ label: t('pauseOnBattery'), checked: config.pauseOnBattery, onChange: v => void store.updateConfig({ pauseOnBattery: v }) })
    ),

    el('div', { className: 'agy-card' },
      el('div', { className: 'agy-card-title' }, isZh ? 'WebWallGL 场景引擎性能' : 'WebWallGL Scene Engine'),
      switchControl({ label: t('sceneLive'), desc: t('sceneLiveDesc'), checked: config.sceneLive, onChange: v => void store.updateConfig({ sceneLive: v }) }),
      selectControl({
        label: t('sceneLiveFps'),
        value: String(config.sceneLiveFps),
        options: [15, 30, 60].map(n => ({ value: String(n), label: `${n} FPS` })),
        onChange: v => void store.updateConfig({ sceneLiveFps: Number(v) })
      }),
      switchControl({ label: t('sceneAutoQuality'), desc: t('sceneAutoQualityDesc'), checked: config.sceneAutoQuality, onChange: v => void store.updateConfig({ sceneAutoQuality: v }) }),
      selectControl({
        label: t('sceneRenderDpr'),
        value: String(config.sceneRenderDpr),
        options: [
          { value: '0', label: t('sceneRenderDprAuto') },
          { value: '1', label: '1.0x' },
          { value: '1.5', label: '1.5x' },
          { value: '2', label: '2.0x' }
        ],
        onChange: v => void store.updateConfig({ sceneRenderDpr: Number(v) })
      }),
      selectControl({
        label: t('sceneVideoTexScale'),
        value: String(config.sceneVideoTexScale),
        options: [
          { value: '0', label: t('sceneVideoTexScaleAuto') },
          { value: '0.5', label: t('sceneVideoTexScaleHalf') },
          { value: '1', label: t('sceneVideoTexScaleFull') }
        ],
        onChange: v => void store.updateConfig({ sceneVideoTexScale: Number(v) })
      }),
      rangeControl({
        label: isZh ? '冷启动延迟加载动态壁纸 (秒)' : 'Cold-start live boot delay (sec)',
        min: 0,
        max: 30,
        step: 1,
        unit: 's',
        value: config.liveBootDelay,
        onCommit: v => void store.updateConfig({ liveBootDelay: v })
      })
    ),

    renderRotationGroupEditor(store)
  )
}

function renderAdvancedTab(store) {
  const { config, cdp, diagnostics } = store.state
  const t = store.getT()
  const isZh = t('weTypeVideo') === '视频'
  const cdpState = cdp?.state || 'unknown'
  const isOk = cdpState === 'attached' || cdpState === 'ready' || cdpState === 'ok'

  return el('div', { style: { display: 'flex', flexDirection: 'column', gap: '12px' } },
    el('div', { className: 'agy-card' },
      el('div', { className: 'agy-card-title' }, isZh ? 'Antigravity 原生融合特性' : 'Antigravity Native Integrations'),
      switchControl({
        label: t('browserHoleCutout'),
        desc: t('browserHoleCutoutDesc'),
        checked: config.browserHoleCutout,
        onChange: v => void store.updateConfig({ browserHoleCutout: v })
      }),
      switchControl({
        label: t('studioShortcut'),
        desc: t('studioShortcutDesc'),
        checked: config.studioShortcut,
        onChange: v => void store.updateConfig({ studioShortcut: v })
      }),
      selectControl({
        label: isZh ? '界面语言' : 'UI Language',
        value: config.uiLanguage || 'auto',
        options: [
          { value: 'auto', label: isZh ? '跟随系统' : 'Auto' },
          { value: 'zh', label: '简体中文' },
          { value: 'en', label: 'English' }
        ],
        onChange: v => void store.updateConfig({ uiLanguage: v })
      })
    ),

    el('div', { className: 'agy-card' },
      el('div', { className: 'agy-row-head' },
        el('div', { className: 'agy-card-title' }, t('cdpHealthTitle')),
        el('span', { className: `agy-status-pill ${isOk ? 'ok' : 'warn'}` },
          isOk ? t('cdpStatusOk') : (cdpState === 'missing' ? t('cdpStatusMissing') : `${cdpState}`)
        )
      ),
      el('div', { className: 'agy-desc' },
        `${isZh ? 'CDP 端口' : 'Port'}: ${cdp?.port || 'n/a'} · ${isZh ? '已注入目标' : 'Targets'}: ${cdp?.targets ?? 0} · ${isZh ? '快捷方式' : 'Shortcuts'}: ${cdp?.shortcutState || 'unknown'}`
      ),
      el('div', { className: 'agy-toolbar' },
        el('button', {
          type: 'button',
          className: 'agy-btn',
          onClick: async () => {
            const d = await callBackend('get-state')
            if (d?.cdp) store.state.cdp = d.cdp
            store.notify()
          }
        }, isZh ? '刷新 CDP 状态' : 'Refresh Status'),
        el('button', {
          type: 'button',
          className: 'agy-btn agy-btn-primary',
          onClick: async () => {
            const res = await callBackend('fix-cdp-shortcut')
            store.showToast(res?.ok
              ? (isZh ? `已检查 ${res.total || 0} 个快捷方式，更新 ${res.updated || 0} 个` : `Checked ${res.total || 0} shortcuts, updated ${res.updated || 0}`)
              : (isZh ? `未能完成快捷方式更新 (${res?.reason || 'error'})` : `Shortcut update failed (${res?.reason || 'error'})`),
            res?.ok ? 'info' : 'warn')
            const d = await callBackend('get-state')
            if (d?.cdp) store.state.cdp = d.cdp
            store.notify()
          }
        }, t('cdpFixShortcuts'))
      )
    ),

    el('div', { className: 'agy-card' },
      el('div', { className: 'agy-card-title' }, t('sectionSystem')),
      el('div', { className: 'agy-card-desc' }, t('sectionSystemDesc')),
      el('div', { className: 'agy-toolbar' },
        el('button', {
          type: 'button',
          className: 'agy-btn',
          onClick: () => {
            const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `agy-skins-preset-${new Date().toISOString().slice(0, 10)}.json`
            a.click()
            setTimeout(() => URL.revokeObjectURL(url), 1000)
            store.showToast(t('presetExported'))
          }
        }, t('exportPreset')),
        el('label', { className: 'agy-btn', style: { display: 'inline-flex', alignItems: 'center' } },
          t('importPreset'),
          el('input', {
            type: 'file',
            accept: 'application/json',
            style: { display: 'none' },
            onChange: async e => {
              const file = e.target.files?.[0]
              if (!file) return
              try {
                const parsed = JSON.parse(await file.text())
                if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('invalid')
                const normalized = normalizeConfig(parsed)
                await store.updateConfig(normalized)
                store.showToast(t('presetImported'))
              } catch {
                store.showToast(t('presetInvalid'), 'warn')
              }
              e.target.value = ''
            }
          })
        ),
        el('button', {
          type: 'button',
          className: 'agy-btn',
          onClick: async () => {
            store.state.diagnostics = await callBackend('diagnostics')
            store.notify()
          }
        }, isZh ? '运行诊断' : 'Run Diagnostics'),
        el('button', {
          type: 'button',
          className: 'agy-btn agy-btn-danger',
          onClick: async () => {
            const res = await callBackend('cache-clear', { scope: 'scene' })
            store.showToast(res?.ok ? (isZh ? `已清理 ${res.removed || 0} 个场景缓存` : `Cleared ${res.removed || 0} scene cache files`) : 'Error')
            store.state.diagnostics = await callBackend('diagnostics')
            store.notify()
          }
        }, isZh ? '清理场景缓存' : 'Clear Scene Cache')
      ),
      diagnostics ? el('div', { className: 'agy-log-pre' },
        [
          `Version: ${diagnostics.version} · Node: ${diagnostics.node} · OS: ${diagnostics.platform}`,
          `WebWallGL: ${diagnostics.webwallgl ? 'OK' : 'Missing'} · Media Origin: ${diagnostics.mediaOrigin}`,
          `Uploads: ${Math.round((diagnostics.sizes?.uploads || 0) / 1024)} KB · Scene Cache: ${Math.round((diagnostics.sizes?.sceneCache || 0) / 1024)} KB`,
          `Data Dir: ${diagnostics.paths?.data}`,
          ...(diagnostics.logs?.flatMap(l => [`--- ${l.name} ---`, l.tail]) || [])
        ].join('\n')
      ) : null
    )
  )
}

function renderExtensionsTab(store) {
  const { config } = store.state
  const isZh = store.getT()('weTypeVideo') === '视频'
  const entries = Object.entries(config.parallaxPluginDepths || {})
  let draftSlot = ''

  return el('div', { className: 'agy-card' },
    el('div', { className: 'agy-card-title' }, isZh ? '扩展槽位视差 ([data-slot])' : 'Extension Slot Parallax ([data-slot])'),
    el('div', { className: 'agy-card-desc' }, isZh ? '为 Antigravity 内其他扩展注册的 [data-slot] 元素配置独立 3D 视差深度。' : 'Configure per-slot 3D parallax depth for elements carrying [data-slot] in the Antigravity UI.'),
    switchControl({
      label: isZh ? '启用扩展槽位视差' : 'Enable extension slot parallax',
      checked: config.parallaxPlugin,
      onChange: v => void store.updateConfig({ parallaxPlugin: v })
    }),
    el('div', { className: 'agy-toolbar' },
      el('input', {
        type: 'text',
        className: 'agy-input',
        placeholder: isZh ? '输入 slot 名称，例如 right-panel' : 'Slot name (e.g. right-panel)',
        onInput: e => { draftSlot = e.target.value }
      }),
      el('button', {
        type: 'button',
        className: 'agy-btn',
        onClick: () => {
          const name = draftSlot.trim()
          if (!name) return
          const next = { ...(config.parallaxPluginDepths || {}), [name]: 3 }
          void store.updateConfig({ parallaxPluginDepths: next })
        }
      }, isZh ? '添加槽位' : 'Add Slot')
    ),
    entries.length === 0
      ? el('div', { className: 'agy-desc' }, isZh ? '暂未添加自定义槽位。' : 'No custom slots configured yet.')
      : entries.map(([slot, depth]) => rangeControl({
          label: `[data-slot="${slot}"]`,
          min: 0,
          max: 10,
          step: 0.2,
          unit: '%',
          value: depth,
          onCommit: v => {
            const next = { ...(config.parallaxPluginDepths || {}), [slot]: v }
            void store.updateConfig({ parallaxPluginDepths: next })
          }
        }))
  )
}

function renderAboutTab(store) {
  const isZh = store.getT()('weTypeVideo') === '视频'
  return el('div', { className: 'agy-card' },
    el('div', { className: 'agy-card-title' }, 'Antigravity Wallpaper Engine (agy-skins)'),
    el('div', { className: 'agy-desc' },
      isZh
        ? '融合 hermes-skins v2.0.0 完整壁纸与液态玻璃架构及 Antigravity 原生工程能力：WebWallGL 3.0.1 零入侵 Scene/Web 引擎、HMAC-SHA256 签名本地媒体服务（HTTP 206 Range）、单规则 CSSOM 液态玻璃、分屏浏览器 evenodd 挖孔与 TitleBarOverlay 同步。'
        : 'Full-featured Wallpaper Engine & Liquid Glass plugin for Google Antigravity: WebWallGL 3.0.1 zero-intrusion Scene/Web renderer, HMAC-SHA256 signed HTTP 206 loopback media server, single-rule CSSOM glass material, evenodd split-browser hole cutout, and Windows/Linux TitleBarOverlay sync.'
    ),
    el('div', { className: 'agy-log-pre' }, [
      'Project: https://github.com/CaptainMusX/agy-skins',
      'Architecture inspirations:',
      '  - CaptainMusX/hermes-skins (MIT)',
      '  - dsh-wallpaper-engine / WebWallGL 3.0.1 (MIT)',
      '  - nimosocute/antigravity-wallpaper-engine-theme (even/odd browser hole & host hooks)'
    ].join('\n'))
  )
}

export function mountPanel() {
  const root = document.getElementById('agy-skins-root')
  if (!root) return
  const store = createPanelStore()

  const render = () => {
    const t = store.getT()
    const isZh = t('weTypeVideo') === '视频'
    const cfg = store.state.config
    if (!cfg) {
      root.replaceChildren(el('div', { style: { padding: '24px', opacity: '0.7' } }, 'Loading Antigravity Wallpaper Engine…'))
      return
    }

    const bodyNode = {
      library: () => renderWallpaperEnginePanel(store),
      appearance: () => renderAppearanceTab(store),
      effects: () => renderEffectsTab(store),
      audio: () => renderAudioTab(store),
      advanced: () => renderAdvancedTab(store),
      extensions: () => renderExtensionsTab(store),
      about: () => renderAboutTab(store)
    }[store.state.tab]?.()

    const resetCurrentTab = () => {
      const keys = RESET_KEYS[store.state.tab]
      if (!keys?.length) return
      const patch = {}
      for (const k of keys) patch[k] = structuredClone(DEFAULT_CONFIG[k])
      void store.updateConfig(patch)
      store.showToast(isZh ? '已恢复当前分页默认设置' : 'Current tab reset to defaults')
    }

    root.replaceChildren(
      el('div', { className: 'agy-shell' },
        el('div', { className: 'agy-header' },
          el('div', { className: 'agy-brand' },
            el('div', null,
              el('div', { className: 'agy-brand-title' }, t('pluginName')),
              el('div', { className: 'agy-brand-sub' }, t('pluginDesc'))
            )
          ),
          el('div', { className: 'agy-header-actions' },
            el('span', { className: 'agy-status-pill ' + (cfg.wallpaperEnabled ? 'ok' : '') },
              cfg.wallpaperEnabled ? `${cfg.wallpaperType?.toUpperCase() || 'ACTIVE'}` : (isZh ? '未启用' : 'Off')
            )
          )
        ),
        el('div', { className: 'agy-tabs' },
          TABS.map(tab => el('button', {
            type: 'button',
            className: `agy-tab ${store.state.tab === tab.id ? 'active' : ''}`,
            onClick: () => {
              store.state.tab = tab.id
              store.notify()
            }
          }, isZh ? tab.zh : tab.en))
        ),
        el('div', { className: 'agy-body' }, bodyNode),
        el('div', { className: 'agy-footer' },
          el('div', { className: 'agy-toast' }, store.state.toast?.message || ''),
          RESET_KEYS[store.state.tab]
            ? el('button', {
                type: 'button',
                className: 'agy-btn',
                onClick: resetCurrentTab
              }, isZh ? '重置本页设置' : 'Reset Tab')
            : null
        )
      )
    )
  }

  store.subscribe(render)
  render()
  void store.loadInitial()
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mountPanel, { once: true })
  else mountPanel()
}
