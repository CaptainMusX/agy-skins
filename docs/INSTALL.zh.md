# `agy-skins` v2.0.0 安装与使用指南

## 1. 构建与安装

```bash
npm install
npm run install:agy
```

安装脚本会编译 `runtime.js`、`panel.js` 并部署到：
- **Windows**：`%USERPROFILE%\.gemini\config\plugins\agy-skins`
- **macOS / Linux**：`~/.gemini/config/plugins/agy-skins`

所有个人配置（`config.json`）、HMAC 密钥（`we-media.key`）及本地导入素材均安全存储在 `~/.agy-skins/`，覆盖升级不会丢失原有配置或壁纸库。

## 2. 打开壁纸引擎控制面板的方式

1. **Antigravity 原生 Settings（推荐）**：打开设置对话框，点击左侧与英文设置项整齐统一的 **`Wallpaper Engine`** 入口，右侧原生 DOM 直接展开 `we-picker` 中文控制界面（无 iframe 割裂感）。
2. **全局快捷悬浮窗**：在 Antigravity 主窗口任意处按 **`Alt+Shift+W`**，弹出整块 iOS 磨砂工作台窗口。
3. **插件侧边栏（Aux Pane）**：在 Antigravity 插件栏直接打开 `Wallpaper Engine`。

## 3. 若提示未检测到 `DevToolsActivePort`

如果 Antigravity 未携带调试端口启动：
1. 进入 **系统** 分页中的 **Antigravity 原生集成与连接诊断**。
2. 点击 **为 Windows 快捷方式一键添加调试参数**。
3. 下次重启 Antigravity 即可自动注入生效。

## 4. 卸载

```bash
npm run uninstall:agy
```

如需同时清除 `~/.agy-skins` 中的个人配置和已导入图片/视频，可附加 `--purge-data`。
