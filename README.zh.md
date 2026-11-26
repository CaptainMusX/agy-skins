# Google Antigravity 壁纸引擎插件（`agy-skins` v2.2.1）

> 将 Wallpaper Engine（`Scene` / `Web` / `视频` / `图片`）、统一两段式可读性 **iOS 液态玻璃**、全局排版字体、光标特效与 3D 视差原生带入 **Google Antigravity** —— 无缝融合、全组件（含右键浮层）美化、免费开源且不修改任何主程序二进制文件。

**[English README](./README.md)** · **[安装与排障指南](./docs/INSTALL.zh.md)** · **[架构与特性说明](./docs/PARITY.zh.md)**

> [!NOTE]
> **开源改写声明与版权归属**：本项目是基于 **[`elysia395/dsh-wallpaper-engine`](https://github.com/elysia395/dsh-wallpaper-engine)**（**MIT License**, `Copyright © 2026 elysia395`）为 **Google Antigravity** 架构改写适配的免费开源社区项目；场景（`.pkg`）与 Web 渲染引擎 **[`oneincase/webwallgl`](https://github.com/oneincase/webwallgl)** 同样遵循 **MIT License**（`Copyright © 2026 oneincase`）。`agy-skins` 遵循与上游一致的 **MIT License** 开源，完整保留上游版权与许可声明，与原作者或 Google 官方无隶属/背书关系。

## v2.2.1 核心亮点

- **全组件 + 原生右键浮层无遗漏液态玻璃美化**：
  - 自动接管 Antigravity 原生 OS 白框右键菜单，将正文划词 `Copy`、链接菜单、左侧对话行菜单（重命名/置顶/复制/删除）与输入框菜单（`Cut` / `Copy` / `Paste` / `Select All`）全部统一为 iOS 液态玻璃浮层，支持二级子菜单、键盘导航与 `Shift + 右键` 逃生通道。
  - 同时统一主壳体、顶栏、左右侧栏、聊天区、输入卡、Settings 窗口、Overview 浮层、顶部下拉菜单、Tooltip 与悬停选中高亮。
- **深度参考 [`elysia395/dsh-wallpaper-engine`](https://github.com/elysia395/dsh-wallpaper-engine) 的原生界面与玻璃引擎**：
  - 两段可读性亮度钳位色板（浅色保底 `0.48` / 深色保底 `0.59`）+ `color-mix`，内置 5 套出厂 preset + 最多 8 个用户预设槽位及 JSON 导入/导出。
  - 全新 `we-picker` 组件化工作台：旋转 `.we-vinyl` 黑胶封面唱片、页内下钻式 `.we-picker__modal` 壁纸库、滑动指示条标签页、模块级 `↺` 重置按钮。
- **零 `<iframe>` 直挂宿主 DOM + 侧栏对齐**：
  - Antigravity `Settings` 左侧导航条始终显示无图标、原生排版一致的 **`Wallpaper`** 入口，内部展开默认**简体中文**原生 DOM 面板，默认壁纸不透明度 `38%` + `24%` 对比度遮罩。
- **WebWallGL 3.0.1 实时场景与签名 HTTP 206 流媒体**：
  - 支持 `.pkg` 场景实时渲染、视频、网页与图片幻灯片，通过 HMAC-SHA256 签名本地 `127.0.0.1` 回环服务推流，零 `BypassCSP`。

## 从 GitHub 安装（两种方式任选）

> 前置依赖：**Node.js 22+**（[nodejs.org](https://nodejs.org)），安装与启用全程**无需修改 Antigravity 程序本体**。

### 方式一：一句话丢给 Antigravity Agent 自动安装（最省心）

直接复制下面这一句话粘贴发送给你的 **Antigravity Agent**：

```text
请帮我从 https://github.com/CaptainMusX/agy-skins 安装 agy-skins 壁纸与液态玻璃美化插件：克隆仓库到本地后执行 npm install && node scripts/install.mjs --no-launch 部署到 Antigravity 全局插件目录，检查并为我的 Antigravity 快捷方式补齐 --remote-debugging-port=0 参数，完成后给我可点击的 Wallpaper 插件开关链接。
```

Agent 部署完成后：
1. 点击 Agent 回复里的 **`Wallpaper`** 插件链接，在 **Customizations → Plugins** 中把开关打开；
2. 若快捷方式是首次添加 `--remote-debugging-port=0` 参数，退出并从桌面/开始菜单快捷方式重新打开一次 Antigravity 即可自动生效。

---

### 方式二：手动 3 步极简安装

1. **获取仓库**：
   ```bash
   git clone https://github.com/CaptainMusX/agy-skins.git
   cd agy-skins
   ```
   *(没有 Git 也可在 GitHub 页面点击绿色 `Code → Download ZIP` 下载后解压)*
2. **一键构建并安装插件**：
   - **Windows**：直接双击根目录的 **`install.bat`**（或在终端运行 `npm install && npm run install:agy`，脚本会自动安装依赖、部署插件并检测补齐桌面/开始菜单/任务栏快捷方式的 `--remote-debugging-port=0` 参数）。
   - **macOS / Linux**：终端运行 `./install.sh`（或 `npm install && npm run install:agy`）。
3. **在 Antigravity 中开启**：
   - 打开 Antigravity 左侧 **`Customizations → Plugins`**，找到 **`Wallpaper`** 打开开关；
   - 若此前未使用调试端口启动 Antigravity，关闭后重新打开一次即可（macOS / Linux 需确保启动参数包含 `--remote-debugging-port=0`）；以后每次启动 Antigravity 都会**自动启用 UI 美化，无需额外常驻进程**。

> 详细排障与卸载说明见 **[安装与排障指南](./docs/INSTALL.zh.md)**。

## 开源协议与致谢

- 本项目整体基于 **MIT License** 免费开源（见 [`LICENSE`](./LICENSE)），任何个人或组织均可在保留版权声明的前提下自由使用、修改与分发。
- 界面组件体系、两段可读性液态玻璃算法（`READABILITY_FLOOR`）、预设与轮播逻辑改写自 **[`elysia395/dsh-wallpaper-engine`](https://github.com/elysia395/dsh-wallpaper-engine)**（`MIT License`, `Copyright © 2026 elysia395`，许可证原文见 [`third_party/dsh-wallpaper-engine/LICENSE`](./third_party/dsh-wallpaper-engine/LICENSE)）。
- Wallpaper Engine `.pkg` 场景解析驱动采用 **[`oneincase/webwallgl`](https://github.com/oneincase/webwallgl)** v3.0.1（`MIT License`, `Copyright © 2026 oneincase`，许可证原文见 [`third_party/webwallgl/LICENSE`](./third_party/webwallgl/LICENSE)）。
- 完整许可范围与第三方组件说明见 [`LICENSING.md`](./LICENSING.md) 与 [`THIRD-PARTY-NOTICES.md`](./THIRD-PARTY-NOTICES.md)。
