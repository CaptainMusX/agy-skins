/**
 * Playback & Visual Framing tab ('播放'): Picture framing + Live Scene/Web controls,
 * with a centered empty-state guard when wallpaperEnabled is false.
 */
import { el, moduleResetButton, sectionHead, switchRow, configSlider, segRow } from '../panel-api.js'

export function renderPlaybackTab(store) {
  const { config } = store.state
  const t = store.getT()
  const isZh = store.isZh()

  if (!config.wallpaperEnabled) {
    return el('div', { className: 'we-tabpanel' },
      el('div', { className: 'we-picker__empty' },
        el('div', { className: 'we-picker__empty-title' }, t('selectWallpaperFirst')),
        el('div', { className: 'we-picker__hint' }, isZh ? '启用壁纸后即可在这里微调画面适配、模糊、暗化遮罩与实时渲染帧率。' : 'Select or enable a wallpaper to adjust framing, blur, dimming and live render quality.'),
        el('button', {
          type: 'button',
          className: 'we-picker__btn we-picker__btn--primary',
          onClick: () => {
            store.state.tab = 'library'
            store.state.pickerOpen = true
            store.state.pickerDraft = false
            store.notify()
          }
        }, t('chooseWallpaper'))
      )
    )
  }

  return el('div', { className: 'we-tabpanel' },
    el('div', { className: 'we-picker__section' },
      sectionHead({
        title: isZh ? '画面与构图' : 'Picture & Framing',
        resetBtn: moduleResetButton({ onClick: () => store.resetModule('effectsPicture') })
      }),
      segRow({
        label: t('wallpaperFit'),
        value: config.wallpaperFit || 'cover',
        items: [
          { id: 'cover', label: isZh ? '铺满' : 'Cover' },
          { id: 'contain', label: isZh ? '适应' : 'Contain' },
          { id: 'fill', label: isZh ? '拉伸' : 'Fill' },
          { id: 'center', label: isZh ? '居中' : 'Center' }
        ],
        onPick: id => void store.updateConfig({ wallpaperFit: id })
      }),
      configSlider(store, 'wallpaperBlur', t('wallpaperBlur')),
      configSlider(store, 'maskOcclusion', t('maskOcclusion')),
      configSlider(store, 'wallpaperOpacity', t('wallpaperOpacity')),
      configSlider(store, 'backgroundBrightness', isZh ? '亮度' : 'Brightness'),
      configSlider(store, 'backgroundContrast', isZh ? '对比度' : 'Contrast'),
      configSlider(store, 'backgroundSaturate', isZh ? '饱和度' : 'Saturation'),
      switchRow({
        label: isZh ? '水平镜像翻转' : 'Horizontal flip',
        checked: Boolean(config.wallpaperFlip),
        onChange: v => void store.updateConfig({ wallpaperFlip: v })
      }),
      configSlider(store, 'layerPositionX', isZh ? '水平构图偏移' : 'Horizontal position'),
      configSlider(store, 'layerPositionY', isZh ? '垂直构图偏移' : 'Vertical position'),
      configSlider(store, 'layerScale', isZh ? '画面缩放' : 'Layer scale')
    ),

    el('div', { className: 'we-picker__section' },
      sectionHead({
        title: t('sectionPlayback'),
        resetBtn: moduleResetButton({ onClick: () => store.resetModule('effectsLive') })
      }),
      segRow({
        label: t('wallpaperMode'),
        value: config.wallpaperMode || 'live',
        items: [
          { id: 'live', label: t('wallpaperModeLive') },
          { id: 'frame', label: t('wallpaperModeFrame') }
        ],
        onPick: id => void store.updateConfig({ wallpaperMode: id })
      }),
      segRow({
        label: t('videoPlaybackRate'),
        value: String(config.videoPlaybackRate ?? 1),
        items: [
          { id: '0.5', label: '0.5×' },
          { id: '1', label: '1×' },
          { id: '1.5', label: '1.5×' },
          { id: '2', label: '2×' }
        ],
        onPick: id => void store.updateConfig({ videoPlaybackRate: Number(id) })
      }),
      switchRow({
        label: t('sceneLive'),
        hint: t('sceneLiveDesc'),
        checked: config.sceneLive !== false,
        onChange: v => void store.updateConfig({ sceneLive: v })
      }),
      segRow({
        label: t('sceneLiveFps'),
        value: String(config.sceneLiveFps ?? 30),
        items: [
          { id: '15', label: '15 FPS' },
          { id: '30', label: '30 FPS' },
          { id: '60', label: '60 FPS' }
        ],
        onPick: id => void store.updateConfig({ sceneLiveFps: Number(id) })
      }),
      switchRow({
        label: t('sceneAutoQuality'),
        hint: t('sceneAutoQualityDesc'),
        checked: config.sceneAutoQuality !== false,
        onChange: v => void store.updateConfig({ sceneAutoQuality: v })
      }),
      segRow({
        label: t('sceneRenderDpr'),
        value: String(config.sceneRenderDpr ?? 0),
        items: [
          { id: '0', label: t('sceneRenderDprAuto') },
          { id: '1', label: '1×' },
          { id: '1.5', label: '1.5×' },
          { id: '2', label: '2×' }
        ],
        onPick: id => void store.updateConfig({ sceneRenderDpr: Number(id) })
      }),
      segRow({
        label: t('sceneVideoTexScale'),
        value: String(config.sceneVideoTexScale ?? 0),
        items: [
          { id: '0', label: t('sceneVideoTexScaleAuto') },
          { id: '0.5', label: t('sceneVideoTexScaleHalf') },
          { id: '1', label: t('sceneVideoTexScaleFull') }
        ],
        onPick: id => void store.updateConfig({ sceneVideoTexScale: Number(id) })
      }),
      segRow({
        label: isZh ? '实时壁纸延迟激活' : 'Live boot delay',
        value: String(config.liveBootDelay ?? 3),
        items: [
          { id: '0', label: '0s' },
          { id: '1', label: '1s' },
          { id: '3', label: '3s' },
          { id: '5', label: '5s' }
        ],
        onPick: id => void store.updateConfig({ liveBootDelay: Number(id) })
      })
    )
  )
}
