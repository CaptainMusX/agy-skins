/**
 * About tab ('关于'): Version, repository link & open-source credits.
 */
import { el } from '../panel-api.js'

const REPO_URL = 'https://github.com/CaptainMusX/agy-skins'
const UPSTREAM_DSH_URL = 'https://github.com/elysia395/dsh-wallpaper-engine'

export function renderAboutTab(store) {
  const isZh = store.isZh()
  return el('div', { className: 'we-tabpanel we-about__lead' },
    el('p', { className: 'we-about__p' },
      isZh
        ? 'Wallpaper Engine (agy-skins) v2.2.1 —— 专为 Google Antigravity 2.0 打造的纯净动态壁纸与全组件统一 iOS 液态玻璃 UI 插件。'
        : 'Wallpaper Engine (agy-skins) v2.2.1 — Wallpaper Engine & full-surface unified iOS Liquid Glass skin system for Google Antigravity 2.0.'
    ),
    el('p', { className: 'we-about__p' },
      isZh
        ? '架构特点：WebWallGL 3.0.1 实时 Scene/Web 渲染、HMAC-SHA256 签名本地回环 HTTP 206 流媒体、零 BypassCSP、整窗与右键/浮层/Tooltip 一体化两段可读性玻璃，以及直挂宿主 DOM 的无缝设置面板（无 iframe 嵌套）。'
        : 'Architecture: WebWallGL 3.0.1 live Scene/Web runtime, HMAC-signed loopback HTTP 206 streaming, zero BypassCSP, full-surface two-stage readability Liquid Glass (including context menus, tooltips & popovers), and native host-DOM mounted settings.'
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
      el('span', { className: 'we-picker__ctl-label' }, isZh ? '开源致谢与版权归属（MIT License）' : 'Open-Source Attributions & Licenses (MIT)'),
      el('p', { className: 'we-about__p' },
        isZh
          ? '• 本项目基于 elysia395/dsh-wallpaper-engine（MIT License · Copyright © 2026 elysia395）改写适配，界面组件与两段可读性液态玻璃色板均保留上游完整 MIT 授权与署名。'
          : '• Adapted from elysia395/dsh-wallpaper-engine (MIT License · Copyright © 2026 elysia395), retaining full upstream copyright and MIT permission notices.'
      ),
      el('div', { className: 'we-picker__row' },
        el('span', { className: 'we-about__url', style: { flex: '1' } }, UPSTREAM_DSH_URL),
        el('button', {
          type: 'button',
          className: 'we-picker__btn',
          onClick: () => {
            void navigator.clipboard?.writeText(UPSTREAM_DSH_URL)
            store.showToast(isZh ? '已复制上游项目地址' : 'Upstream URL copied')
          }
        }, isZh ? '复制上游' : 'Copy')
      ),
      el('p', { className: 'we-about__p' },
        isZh
          ? '• Wallpaper Engine .pkg 场景解析与 WebGL 2 渲染采用 oneincase/webwallgl v3.0.1（MIT License · Copyright © 2026 oneincase）。'
          : '• Scene (.pkg) parsing & WebGL 2 runtime powered by oneincase/webwallgl v3.0.1 (MIT License · Copyright © 2026 oneincase).'
      )
    )
  )
}
