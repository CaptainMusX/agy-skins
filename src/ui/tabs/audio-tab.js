/**
 * Audio tab ('声音'): Sound toggle (auto-bumps 0 -> 50%) and master volume slider.
 */
import { el, moduleResetButton, sectionHead, switchRow, configSlider } from '../panel-api.js'

export function renderAudioTab(store) {
  const { config } = store.state
  const t = store.getT()
  const isZh = store.isZh()

  return el('div', { className: 'we-tabpanel' },
    el('div', { className: 'we-picker__section' },
      sectionHead({
        title: isZh ? '壁纸声音控制' : 'Wallpaper Audio',
        resetBtn: moduleResetButton({ onClick: () => store.resetModule('audio') })
      }),
      switchRow({
        label: t('wallpaperSound'),
        hint: isZh ? '视频、网页及内含音轨的 Scene 壁纸声音输出。' : 'Play embedded audio tracks for Video, Web and Scene wallpapers.',
        checked: Boolean(config.wallpaperSound),
        onChange: v => {
          const patch = { wallpaperSound: v }
          if (v && Number(config.wallpaperVolume) === 0) patch.wallpaperVolume = 50
          void store.updateConfig(patch)
        }
      }),
      configSlider(store, 'wallpaperVolume', t('wallpaperVolume'))
    )
  )
}
