# `agy-skins` v2.2.1 安装与使用指南

> 前置环境：安装 **[Node.js 22+](https://nodejs.org)**（安装时不修改 Antigravity 主程序任何二进制文件）。

---

## 1. 一句话丢给 Antigravity Agent 自动安装（推荐）

直接复制下方提示词发送给你正在使用的 Antigravity Agent，它会自动完成克隆、依赖安装、插件部署与 Windows 快捷方式调试参数补齐：

```text
请帮我从 https://github.com/CaptainMusX/agy-skins 安装 agy-skins 壁纸与液态玻璃美化插件：克隆仓库到本地后执行 npm install && node scripts/install.mjs --no-launch 部署到 Antigravity 全局插件目录，检查并为我的 Antigravity 快捷方式补齐 --remote-debugging-port=0 参数，完成后给我可点击的 Wallpaper 插件开关链接。
```

完成后的最后一步：
1. 点击 Agent 回复的 **`Wallpaper`** 链接，在 **Customizations → Plugins** 里打开开关；
2. 若快捷方式是首次被加上 `--remote-debugging-port=0`，重启一次 Antigravity 即可永久自动随启动美化。

---

## 2. 手动 3 步极简安装

### 第 1 步：下载源码
```bash
git clone https://github.com/CaptainMusX/agy-skins.git
cd agy-skins
```
*(也可以直接点 GitHub 仓库绿色按钮 `Code → Download ZIP` 下载压缩包并解压)*

### 第 2 步：运行安装脚本
- **Windows**：直接双击根目录的 **`install.bat`**；或在终端运行：
  ```bash
  npm install
  npm run install:agy
  ```
  脚本会自动构建 `runtime.js` / `panel.js`，部署到 `%USERPROFILE%\.gemini\config\plugins\agy-skins`，并自动检查桌面/开始菜单/任务栏中的 Antigravity 快捷方式，若缺少 `--remote-debugging-port=0` 则自动补齐。
- **macOS / Linux**：终端运行 `./install.sh`（或 `npm install && npm run install:agy`），部署目标为 `~/.gemini/config/plugins/agy-skins`。

### 第 3 步：启用插件并生效
1. 在 Antigravity 左侧点击 **`Customizations → Plugins`**，找到 **`Wallpaper`** 开启插件开关；
2. 如果你此前不是通过带 `--remote-debugging-port=0` 的快捷方式启动的，**重启一次 Antigravity**（macOS / Linux 需在启动命令中带上 `--remote-debugging-port=0`）；
3. 之后每次打开 Antigravity，原生 `wallpaper_engine` Sidecar（`restart_policy: "always"`）都会随主程序自动启用壁纸、液态玻璃与右键菜单美化，无需单独常驻脚本。

> [!TIP]
> 所有个人配置（`config.json`）、HMAC 密钥（`we-media.key`）及本地导入素材均保存在 `~/.gemini/config/agy-skins/`，日后运行 `update.bat` / `update.sh` 升级覆盖不会丢失已有壁纸与配色设置。

---

## 3. 打开壁纸引擎控制面板的方式

1. **Antigravity 原生 Settings（推荐）**：打开设置对话框，点击左侧与英文设置项样式一致（无图标）的 **`Wallpaper`** 入口，右侧原生 DOM 直接展开 `we-picker` 中文控制界面（无 iframe 割裂感）。
2. **全局快捷悬浮窗**：在 Antigravity 主窗口任意处按 **`Alt+Shift+W`**，弹出整块 iOS 磨砂工作台窗口。
3. **插件侧边栏（Aux Pane）**：在 Antigravity 插件栏直接打开 **`Wallpaper Engine`**。

*(小技巧：任何位置按住 **`Shift + 右键`** 可临时呼出原生系统菜单。)*

---

## 4. 若提示未检测到 `DevToolsActivePort`

如果 Antigravity 未携带调试端口启动：
1. 进入 **Settings → `Wallpaper` → 系统** 分页中的 **Antigravity 原生集成与连接诊断**。
2. 点击 **为 Windows 快捷方式一键添加调试参数**（或运行 `npm run verify:live` 检查状态）。
3. 下次从快捷方式重启 Antigravity 即可自动注入生效。

---

## 5. 卸载

- **Windows**：双击 `uninstall.bat` 或终端运行 `npm run uninstall:agy`；
- **macOS / Linux**：运行 `./uninstall.sh` 或 `npm run uninstall:agy`。

如需同时清除 `~/.gemini/config/agy-skins` 中的个人配置和已导入图片/视频，可附加 `--purge-data`。
