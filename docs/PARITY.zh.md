# 功能架构与视觉统一设计说明（v2.0.0）

`agy-skins` v2.0.0 以 **[`elysia395/dsh-wallpaper-engine`](https://github.com/elysia395/dsh-wallpaper-engine)** 的桌面视觉系统与组件结构为标杆，并面向 **Google Antigravity 2.0** 的 `--onyx-*` / `.agy-shell` / `.surface-composer` / `.settings-modal-container` DOM 体系进行了彻底重构。

| 模块 | 实现架构与 Antigravity 融合细节 |
| --- | --- |
| **整窗无缝画布打通** | 清除 `.agy-shell`、`[data-main-content-header]`、`[class*="@container/titlebar"]`、`[data-main-content-body]`、`[data-split-fill-edge] > .shrink-0` 与 48px `from-background` 遮罩的多重叠底色和异色嵌边；仅由 `.agy-shell > .shrink-0` 在启用 `titlebarGlass` 时提供恒定 sheen 光带，消灭顶栏与侧栏交界线。 |
| **--onyx-* 设计令牌重映射** | 在 `body[data-agy-skins-active="true"]` 上重映射 `--onyx-frame: transparent`、`--onyx-raised`、`--onyx-selected` 与 `--sidebar-secondary`，彻底去除输入框 4px 生硬实色边环及纯白 `+ New Conversation` 块。 |
| **两段式可读性液态玻璃** | `weClampSurfaceColor` 依据浅色底限 `0.48`、深色底限 `0.59` 计算可读性护航基底，再叠加半透高饱和 `backdrop-filter`；支持 5 套内置 Preset + 8 槽位用户预设 JSON 导入导出。 |
| **原生直挂设置工作台** | Antigravity Settings 左侧保持英文 **`Wallpaper Engine`** 协调命名，右侧直接在原版滚动容器内原生挂载 `#agy-skins-settings-pane` 渲染 `.we-picker`（**零 `<iframe>`**），消除双边框、双滚动条与不透明白底。 |
| **全功能 7 分页工作台** | **壁纸库**（黑胶旋转唱片 + 页内下钻 `.we-picker__modal` 浏览 + CD 架/常规网格 + 多选过滤 + 过场/轮播列表/自定义导入删除）、**外观**（预设/主题跟随/细节/两段玻璃/思考块三档/全透侧栏/侧栏圆角/UI 配色/全局字体矩阵）、**播放**（构图 + 实时渲染参数）、**声音**、**系统**、**扩展**（点击拖尾特效 + 3D `[data-slot]` 视差）、**关于**。 |
| **安全边界** | HMAC-SHA256 签名本地 `127.0.0.1` 媒体服务（HTTP 206 Range）+ CORS 预检 + `x-agy-studio-token` 接口鉴权；零 `BypassCSP`；不篡改任何 Antigravity 安装目录文件。 |
