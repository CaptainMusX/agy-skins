/**
 * Extensions tab ('扩展'): Click/Trail pointer FX & 3D Parallax with live [data-slot] refresh.
 */
import { FX_CLICK_STYLES, FX_TRAIL_STYLES, FX_BLEND_VALUES, FX_COLOR_MODES } from '../../shared/config.js'
import { ACCENT_PRESETS } from '../../shared/glass-presets.js'
import { el, moduleResetButton, switchRow, configSlider, SliderRow, segRow, selectRow, swatchRow } from '../panel-api.js'

export function renderExtensionsTab(store) {
  const { config, discoveredSlots } = store.state
  const t = store.getT()
  const isZh = store.isZh()

  const clickLabel = { ripple: t('fxStyleRipple'), spark: t('fxStyleSpark'), both: t('fxStyleBoth') }
  const trailLabel = { comet: t('fxTrailComet'), dust: t('fxTrailSparkle') }
  const blendLabel = {
    screen: t('fxBlendScreen'),
    normal: t('fxBlendNormal'),
    overlay: t('fxBlendOverlay'),
    multiply: t('fxBlendMultiply'),
    lighten: t('fxBlendAdd')
  }
  const colorLabel = { accent: t('fxColorAccent'), rainbow: t('fxColorRainbow'), custom: t('fxColorCustom') }

  return el('div', { className: 'we-tabpanel we-ext' },
    /* Module 1: Click & Trail FX */
    el('div', { className: 'we-ext__module' },
      el('div', { className: 'we-ext__module-head' },
        el('span', { className: 'we-ext__module-title' }, t('sectionFx')),
        moduleResetButton({ onClick: () => store.resetModule('fx') })
      ),
      el('div', { className: 'we-picker__hint' }, t('sectionFxDesc')),
      switchRow({
        label: t('fxEnabled'),
        checked: Boolean(config.fxEnabled),
        onChange: v => void store.updateConfig({ fxEnabled: v })
      }),
      switchRow({
        label: t('fxClick'),
        checked: config.fxClick !== false,
        onChange: v => void store.updateConfig({ fxClick: v })
      }),
      segRow({
        label: t('fxClickStyle'),
        value: config.fxClickStyle || 'ripple',
        items: FX_CLICK_STYLES.map(id => ({ id, label: clickLabel[id] || id })),
        onPick: id => void store.updateConfig({ fxClickStyle: id })
      }),
      configSlider(store, 'fxClickSize', t('fxClickSize')),
      configSlider(store, 'fxClickGlow', t('fxClickGlow')),
      switchRow({
        label: t('fxTrail'),
        checked: config.fxTrail !== false,
        onChange: v => void store.updateConfig({ fxTrail: v })
      }),
      segRow({
        label: t('fxTrailStyle'),
        value: config.fxTrailStyle || 'comet',
        items: FX_TRAIL_STYLES.map(id => ({ id, label: trailLabel[id] || id })),
        onPick: id => void store.updateConfig({ fxTrailStyle: id })
      }),
      configSlider(store, 'fxTrailLength', t('fxTrailLength')),
      configSlider(store, 'fxTrailWidth', t('fxTrailWidth')),
      configSlider(store, 'fxTrailGlow', t('fxTrailGlow')),
      configSlider(store, 'fxOpacity', t('fxOpacity')),
      selectRow({
        label: t('fxBlend'),
        value: config.fxBlend || 'screen',
        options: FX_BLEND_VALUES.map(v => ({ value: v, label: blendLabel[v] || v })),
        onChange: v => void store.updateConfig({ fxBlend: v })
      }),
      segRow({
        label: t('fxColorMode'),
        value: config.fxColorMode || 'accent',
        items: FX_COLOR_MODES.map(id => ({ id, label: colorLabel[id] || id })),
        onPick: id => void store.updateConfig({ fxColorMode: id })
      }),
      config.fxColorMode === 'custom' ? swatchRow({
        label: t('fxColor'),
        presets: ACCENT_PRESETS,
        value: config.fxColor || '#4f8cff',
        colorValue: config.fxColor || '#4f8cff',
        onPick: (c, defer) => void store.updateConfig({ fxColor: c }, { defer, rerender: !defer })
      }) : null
    ),

    /* Module 2: 3D Parallax */
    el('div', { className: 'we-ext__module' },
      el('div', { className: 'we-ext__module-head' },
        el('span', { className: 'we-ext__module-title' }, t('sectionParallax')),
        moduleResetButton({ onClick: () => store.resetModule('parallax') })
      ),
      el('div', { className: 'we-picker__hint' }, t('sectionParallaxDesc')),
      switchRow({
        label: t('parallaxEnabled'),
        checked: Boolean(config.parallaxEnabled),
        onChange: v => void store.updateConfig({ parallaxEnabled: v })
      }),
      configSlider(store, 'parallaxBg', t('parallaxBgDepth'), { step: 0.1 }),
      configSlider(store, 'parallaxSmooth', t('parallaxSmooth')),
      switchRow({
        label: t('parallaxUi'),
        checked: Boolean(config.parallaxUi),
        onChange: v => void store.updateConfig({ parallaxUi: v })
      }),
      configSlider(store, 'parallaxUiChatDepth', t('parallaxUiChat'), { step: 0.1 }),
      configSlider(store, 'parallaxUiComposerDepth', t('parallaxUiComposer'), { step: 0.1 }),
      configSlider(store, 'parallaxUiSidebarDepth', t('parallaxUiSidebar'), { step: 0.1 }),
      configSlider(store, 'parallaxUiBubbleDepth', t('parallaxUiBubble'), { step: 0.1 }),
      el('div', { className: 'we-picker__ctl' },
        switchRow({
          label: isZh ? '联动扩展槽位视差 ([data-slot])' : 'Follow extension UI slots ([data-slot])',
          checked: Boolean(config.parallaxPlugin),
          onChange: v => void store.updateConfig({ parallaxPlugin: v })
        }),
        el('button', {
          type: 'button',
          className: 'we-picker__btn we-picker__btn--mini',
          onClick: async () => {
            const slots = await store.refreshSlots()
            store.notify()
            store.showToast(isZh ? `已扫描到 ${slots.length} 个扩展槽位` : `Detected ${slots.length} slot(s)`)
          }
        }, isZh ? '刷新槽位' : 'Scan Slots')
      ),
      discoveredSlots.length ? discoveredSlots.map(slot => SliderRow({
        label: slot,
        min: 0,
        max: 10,
        step: 0.1,
        unit: '%',
        defaultValue: 1,
        value: config.parallaxPluginDepths?.[slot] ?? 1,
        onChange: v => {
          const next = { ...(config.parallaxPluginDepths || {}), [slot]: v }
          void store.updateConfig({ parallaxPluginDepths: next }, { defer: true, rerender: false })
        },
        onCommit: v => {
          const next = { ...(config.parallaxPluginDepths || {}), [slot]: v }
          void store.updateConfig({ parallaxPluginDepths: next })
        }
      })) : el('div', { className: 'we-picker__hint' }, isZh ? '当前工作台未发现额外 [data-slot] 扩展面板。' : 'No extra [data-slot] panels detected right now.')
    )
  )
}
