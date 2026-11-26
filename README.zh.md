# Google Antigravity 壁纸引擎插件（`agy-skins` v2.1.3）

> 将 Wallpaper Engine（`Scene` / `Web` / `视频` / `图片`）、统一两段式可读性 **iOS 液态玻璃**、全局排版字体、光标特效与 3D 视差原生带入 **Google Antigravity** —— 无缝融合、不修改任何主程序二进制文件。

**[English README](./README.md)** · **[安装与排障指南](./docs/INSTALL.zh.md)** · **[架构与特性说明](./docs/PARITY.zh.md)**

## v2.0.0 核心重塑亮点

- **消灭整窗割裂缝隙**：
  - 将 Antigravity 外壳、顶部标题栏、对话区与侧栏打通为单一连续壁纸+暗化层画布，不再出现顶栏二次模糊、右/底部 8px 异色嵌边、输入卡上方 48px 渐变白带或 `.surface-composer` 四周 4px 生硬 `--onyx-frame` 白环。
  - 输入卡磨砂托管到 `::before` 伪元素，保持弹出浮窗视口定位不偏移；设置弹窗（`.settings-modal-container` + `.settings-modal-backdrop`）统一呈递为一整块细腻 iOS 磨砂玻璃。
- **深度参考 [`elysia395/dsh-wallpaper-engine`](https://github.com/elysia395/dsh-wallpaper-engine) 的原生界面与玻璃引擎**：
  - 采用两段可读性亮度钳位色板（浅色保底 `0.48` / 深色保底 `0.59`）+ `color-mix`，内置 5 套出厂 preset + 最多 8 个用户自定义预设槽位及 JSON 导入/导出。
  - 全新 `we-picker` 组件化工作台：旋转 `.we-vinyl` 黑胶封面唱片、页内下钻式 `.we-picker__modal` 壁纸库（常规网格 / CD 架叠放、多选分级/类型过滤）、滑动指示条标签页、模块级 `↺` 重置按钮。
- **零 `<iframe>` 直挂宿主 DOM + 侧栏对齐**：
  - Antigravity `Settings` 左侧导航条始终显示无图标、原生排版一致的 **`Wallpaper`** 入口，内部展开面板使用默认**简体中文**原生 DOM 渲染（无嵌套 iframe 割裂边框与双滚动条），默认壁纸不透明度 `38%` + `24%` 对比度遮罩以保障高可读性。
- **WebWallGL 3.0.1 实时场景与签名 HTTP 206 流媒体**：
  - 支持 `.pkg` 场景实时渲染、视频、网页与图片幻灯片，通过 HMAC-SHA256 签名本地 `127.0.0.1` 回环服务按需切片推流，完全不使用 `BypassCSP`。

## 快速安装

```bash
npm install
npm run install:agy
```

Windows 下也可直接双击 `install.bat`；在 Antigravity 插件中心启用后，只要 Antigravity 携带 `--remote-debugging-port=0` 启动，内置 `wallpaper_engine` Sidecar（`restart_policy: "always"`）即会随主程序自动拉起并启用 UI 美化，无需额外后台守护进程（`node scripts/install.mjs --no-launch` 仅构建部署）。

## 许可与致谢

本项目基于 MIT 协议开源（[`LICENSE`](./LICENSE)），界面与两段可读性液态玻璃色板深度参考并改进自 [`elysia395/dsh-wallpaper-engine`](https://github.com/elysia395/dsh-wallpaper-engine)（MIT），场景解析驱动为 WebWallGL 3.0.1。详情见 [`LICENSING.md`](./LICENSING.md) 与 [`THIRD-PARTY-NOTICES.md`](./THIRD-PARTY-NOTICES.md)。
