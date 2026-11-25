# 功能架构与 `hermes-skins` 对标清单

`agy-skins` 保持了与 `CaptainMusX/hermes-skins`（v2.0.0）完整对等的核心能力，并针对于 Google Antigravity 2.0 桌面架构进行了原生适配增强：

| 功能模块 | `hermes-skins` | `agy-skins`（本项目） |
| --- | --- | --- |
| **壁纸引擎支持** | Scene (`.pkg`) / Web / Video / Picture 幻灯片 | 100% 一致（WebWallGL 3.0.1 + 帧率/DPR/自动画质） |
| **本地媒体安全传输** | 签名回环 HTTP 206 Range + `0600` 密钥 | 100% 一致（并规避 Antigravity `https://` 对 `file:///` 的拦截，不启用 `BypassCSP`） |
| **液态玻璃渲染** | 单规则 CSSOM + 原生色彩种子派生 | 100% 一致（适配 `.agy-shell` / `.surface-composer` / `.surface-glass` / `xterm` Fiber） |
| **7 分页工作台** | 壁纸库 / 外观 / 特效 / 音频轮播 / 高级 / 扩展 / 关于 | 100% 一致（同时提供 Antigravity Aux Sidecar Pane 与 `Alt+Shift+W` 宽屏悬浮窗） |
| **字体与色彩系统** | 命名字体集 + 全局/组件/角色字号 + GSMTC + 主题取色 | 100% 一致（对接 `[data-markdown-root]` 与 `--foreground/--primary/--cta`） |
| **鼠标特效与 3D 视差** | 3 档自适应粒子/涟漪 + UI/壁纸/扩展槽位视差 | 100% 一致（扩展 `[data-slot]` 与 Antigravity 对话面板深度映射） |
| **Antigravity 原生增强** | — | **分屏浏览器 `evenodd` 挖孔**、`electronNative.setTitleBarOverlay` 同步、**设置→外观入口**、**非破坏式 CDP 快捷方式检测与一键修复** |
| **刻意剔除项** | 宠物、头饰、AI/用户头像、气泡挂件 | 按“纯净架构融合”范围全部剔除，仅保留壁纸与界面皮肤系统 |
