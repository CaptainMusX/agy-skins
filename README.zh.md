# Google Antigravity 壁纸引擎插件（`agy-skins` v2.2.0）

> 将 Wallpaper Engine（`Scene` / `Web` / `视频` / `图片`）、统一两段式可读性 **iOS 液态玻璃**、全局排版字体、光标特效与 3D 视差原生带入 **Google Antigravity** —— 无缝融合、全组件美化、免费开源且不修改任何主程序二进制文件。

**[English README](./README.md)** · **[安装与排障指南](./docs/INSTALL.zh.md)** · **[架构与特性说明](./docs/PARITY.zh.md)**

> [!NOTE]
> **开源改写声明与版权归属**：本项目是基于 **[`elysia395/dsh-wallpaper-engine`](https://github.com/elysia395/dsh-wallpaper-engine)**（**MIT License**, `Copyright © 2026 elysia395`）为 **Google Antigravity** 架构改写适配的免费开源社区项目；场景（`.pkg`）与 Web 渲染引擎 **[`oneincase/webwallgl`](https://github.com/oneincase/webwallgl)** 同样遵循 **MIT License**（`Copyright © 2026 oneincase`）。`agy-skins` 遵循与上游一致的 **MIT License** 开源，完整保留上游版权与许可声明，与原作者或 Google 官方无隶属/背书关系。

## v2.2.0 核心亮点

- **全组件无遗漏液态玻璃覆盖**：
  - 不仅统一 Antigravity 主壳体、顶栏、左右侧栏、聊天区、输入卡与 Settings 窗口，还完整美化右键菜单（`.agy-overlay` / `[data-testid="context-menu-popup"]`）、Overview 浮层、顶部标题栏下拉菜单（`.surface-opaque`）、悬停提示 Tooltip、文本划词气泡、消息卡片与悬停选中高亮，不再出现生硬原生白框或透明破洞。
  - 将 Antigravity 外壳、顶部标题栏、对话区与侧栏打通为单一连续壁纸+暗化层画布，输入卡磨砂托管到 `::before` 伪元素以保持浮窗精确定位。
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

## 开源协议与致谢

- 本项目整体基于 **MIT License** 免费开源（见 [`LICENSE`](./LICENSE)），任何个人或组织均可在保留版权声明的前提下自由使用、修改与分发。
- 界面组件体系、两段可读性液态玻璃算法（`READABILITY_FLOOR`）、预设与轮播逻辑改写自 **[`elysia395/dsh-wallpaper-engine`](https://github.com/elysia395/dsh-wallpaper-engine)**（`MIT License`, `Copyright © 2026 elysia395`，许可证原文见 [`third_party/dsh-wallpaper-engine/LICENSE`](./third_party/dsh-wallpaper-engine/LICENSE)）。
- Wallpaper Engine `.pkg` 场景解析驱动采用 **[`oneincase/webwallgl`](https://github.com/oneincase/webwallgl)** v3.0.1（`MIT License`, `Copyright © 2026 oneincase`，许可证原文见 [`third_party/webwallgl/LICENSE`](./third_party/webwallgl/LICENSE)）。
- 完整许可范围与第三方组件说明见 [`LICENSING.md`](./LICENSING.md) 与 [`THIRD-PARTY-NOTICES.md`](./THIRD-PARTY-NOTICES.md)。
