# `agy-skins` 安装与排障指南

## 1. 安装插件

```bash
npm install
npm run install:agy
```

构建脚本会编译 `runtime.js`、`panel.js` 与 `panel.css`，并将插件安装到：
- **Windows**：`%USERPROFILE%\.gemini\config\plugins\agy-skins`
- **macOS / Linux**：`~/.gemini/config/plugins/agy-skins`

数据文件默认保存在 `~/.agy-skins/`（包含 `config.json`、`we-media.key`、`uploads/` 等），升级或重装插件代码不会丢失壁纸列表和字体集配置。

## 2. 打开设置工作台的方式

1. **Antigravity 原生插件侧栏（Aux Pane）**：在插件面板打开 `Antigravity 壁纸引擎 (agy-skins)`。
2. **全局快捷键**：在 Antigravity 主窗口任意处按 **`Alt+Shift+W`** 打开宽屏悬浮工作台。
3. **设置面板入口**：打开 **设置 → 外观 (Appearance)**，点击 **打开工作台**。

## 3. 若提示未检测到 `DevToolsActivePort`

如果 Antigravity 启动快捷方式未包含 `--remote-debugging-port=0`：
1. 在工作台切到 **高级与系统** 分页。
2. 点击 **一键为 Windows 快捷方式添加调试参数**。
3. 下次正常重启 Antigravity 即可自动连接注入，无需替换或修改安装目录文件。

## 4. 卸载

```bash
npm run uninstall:agy
```

如需连同用户配置文件与导入素材一起删除，可追加 `--purge-data`。
