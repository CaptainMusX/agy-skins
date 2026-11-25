# Antigravity 壁纸引擎 (`agy-skins`)

> 为 **Google Antigravity** 带来完整 Wallpaper Engine（`Scene` / `Web` / `视频` / `Picture` 幻灯片）动态壁纸、单规则 CSSOM **液态玻璃**、字体排版系统、鼠标特效与 3D 视差 —— 零修改客户端二进制文件、零放宽 CSP。

**[English README](./README.md)** · **[安装与排障指南](./docs/INSTALL.zh.md)** · **[功能对标清单](./docs/PARITY.zh.md)**

## 核心特性

- **WebWallGL 3.0.1 实时场景引擎**：原生渲染 Wallpaper Engine `.pkg` 场景工程、Web 网页壁纸、本地视频（MP4/WebM/MKV）、Picture 多图轮播、网络 URL 及 Bing 每日一图；支持 `15 / 30 / 60 FPS` 上限、GPU 自动降级与隐藏/失焦/电池省电暂停。
- **HMAC-SHA256 签名本地媒体源（支持 HTTP 206 Range）**：基于随机本地回环端口 `127.0.0.1:0`、`0600` 权限密钥和防符号链接越界校验，彻底解决 `https://` 页面加载 `file:///` 被拦截与视频无法拖动的问题。
- **单规则 CSSOM 液态玻璃**：读取 Antigravity 原生主题变量（`--background` / `--sidebar` / `--card` / `--primary`）作为基底颜色种子，滑动条拖动直接更新单条 `CSSStyleRule`，无重排闪烁；内置 xterm React Fiber 透明适配。
- **分屏浏览器 `evenodd` 自动挖孔**：实时监听 `[data-has-browser-hole="true"]` 与 `[data-browser-hole]`，自动从背景层镂空内嵌浏览器区域，避免网页预览泛白或被染色。
- **Antigravity 原生工作流融合**：
  - **插件侧边栏 Aux Pane**（`sidecar_sdk`）。
  - **`设置 → 外观 (Appearance)` 快捷入口卡片** 与全局 **`Alt+Shift+W`** 悬浮工作台弹窗。
  - **Windows / Linux 原生标题栏覆盖层同步**（`electronNative.setTitleBarOverlay`）。
  - **非破坏式 CDP 调试状态检测与快捷方式一键修复**（不强杀客户端）。

## 快速安装

### 前置条件
- **Node.js 22+**
- Google Antigravity（若主界面未能自动注入，可在工作台 `高级与系统` 分页查看 CDP 状态并一键为 Windows 快捷方式添加 `--remote-debugging-port=0`）。

### 安装步骤

```bash
npm install
npm run install:agy
```

或在 Windows 下直接运行根目录的 `install.bat`（将构建产物部署到 `~/.gemini/config/plugins/agy-skins` 并可立即拉起独立 Sidecar 守护进程）。

## 许可证与第三方声明

本项目采用 MIT 开源协议（[`LICENSE`](./LICENSE)），内置 WebWallGL 3.0.1 引擎及工程架构致谢详见 [`LICENSING.md`](./LICENSING.md) 与 [`THIRD-PARTY-NOTICES.md`](./THIRD-PARTY-NOTICES.md)。
