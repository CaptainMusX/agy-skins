/**
 * About tab ('关于'): Version, repository link & open-source credits.
 */
import { el } from '../panel-api.js'

const REPO_URL = 'https://github.com/CaptainMusX/agy-skins'

export function renderAboutTab(store) {
  const isZh = store.isZh()
  return el('div', { className: 'we-tabpanel we-about__lead' },
    el('p', { className: 'we-about__p' },
      isZh
        ? 'Wallpaper Engine (agy-skins) v2.1.1 —— 专为 Google Antigravity 2.0 打造的纯净动态壁纸与统一 iOS 液态玻璃 UI 插件。'
        : 'Wallpaper Engine (agy-skins) v2.1.1 — Wallpaper Engine & unified iOS Liquid Glass skin system for Google Antigravity 2.0.'
    ),
    el('p', { className: 'we-about__p' },
      isZh
        ? '架构特点：WebWallGL 3.0.1 实时 Scene/Web 渲染、HMAC-SHA256 签名本地回环 HTTP 206 流媒体、零 BypassCSP、整窗两段式可读性玻璃色板，以及直挂宿主 DOM 的无缝设置面板（无 iframe 嵌套）。'
        : 'Architecture: WebWallGL 3.0.1 live Scene/Web runtime, HMAC-signed loopback HTTP 206 streaming, zero BypassCSP, two-stage readability Liquid Glass, and native host-DOM mounted settings.'
    ),
    el('div', { className: 'we-picker__section' },
      el('span', { className: 'we-picker__ctl-label' }, isZh ? '项目仓库 (MIT License)' : 'Repository (MIT License)'),
      el('div', { className: 'we-picker__row' },
        el('span', { className: 'we-about__url', style: { flex: '1' } }, REPO_URL),
        el('button', {
          type: 'button',
          className: 'we-picker__btn',
          onClick: () => {
            void navigator.clipboard?.writeText(REPO_URL)
            store.showToast(isZh ? '已复制 GitHub 仓库地址' : 'Repository URL copied')
          }
        }, isZh ? '复制链接' : 'Copy')
      )
    ),
    el('div', { className: 'we-picker__section' },
      el('span', { className: 'we-picker__ctl-label' }, isZh ? '开源致谢与设计灵感' : 'Attributions & Design Credits'),
      el('p', { className: 'we-about__p' },
        isZh
          ? '• 界面交互范式与两段可读性液态玻璃色板深度借鉴自 elysia395/dsh-wallpaper-engine (MIT)。'
          : '• UI interaction model & two-stage readability glass system modeled on elysia395/dsh-wallpaper-engine (MIT).'
      ),
      el('p', { className: 'we-about__p' },
        isZh
          ? '• Wallpaper Engine .pkg 场景解析与 WebGL 2 渲染由 WebWallGL 3.0.1 驱动。'
          : '• Scene (.pkg) parsing & WebGL 2 runtime powered by WebWallGL 3.0.1.'
      )
    )
  )
}
