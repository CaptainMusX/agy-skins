// src/shared/i18n.js
var I18N_DICTIONARY = {
  en: {
    pluginName: "Antigravity Wallpaper Engine",
    pluginDesc: "Scene, Web, video and image wallpapers with liquid-glass surfaces",
    wallpaperEngineTitle: "Wallpaper Engine",
    wallpaperEngineDesc: "Scene, Web, video and image wallpapers behind Antigravity, with liquid-glass surfaces.",
    selectWallpaperFirst: "Choose a wallpaper below to enable it.",
    sectionGlass: "Liquid glass",
    sectionGlassDesc: "Transparency, frost, tint and specular edges for Antigravity surfaces.",
    sectionPlayback: "Playback",
    sectionPlaybackDesc: "Scene quality, frame cap and power-saving pause rules.",
    sectionLibrary: "Wallpaper library",
    sectionLibraryDesc: "Browse local Wallpaper Engine projects, videos and previews.",
    sectionSystem: "System",
    sectionSystemDesc: "Import or export appearance and playback settings for another device.",
    exportPreset: "Export preset",
    importPreset: "Import preset",
    presetExported: "Preset exported.",
    presetImported: "Preset applied.",
    presetInvalid: "This file does not contain a valid Antigravity wallpaper preset.",
    defaultValue: "Default",
    sectionTypography: "Typography",
    sectionTypographyDesc: "Global font family, size, weight, spacing and caret colour.",
    fontCustom: "Custom typography",
    fontFamily: "Font family",
    fontFamilyPlaceholder: 'Inter, "Microsoft YaHei", sans-serif',
    scanFonts: "Scan system fonts",
    fontScanning: "Scanning fonts…",
    fontSize: "Chat font size",
    fontWeight: "Font weight",
    letterSpacing: "Letter spacing",
    caretColor: "Caret colour",
    sectionFx: "Click & trail",
    sectionFxDesc: "Pointer ripple and cursor trail drawn above the wallpaper and UI.",
    fxEnabled: "Enable pointer effects",
    fxClick: "Click effect",
    fxClickStyle: "Click style",
    fxStyleRipple: "Ripple",
    fxStyleSpark: "Spark",
    fxClickSize: "Click size",
    fxClickGlow: "Click glow",
    fxTrail: "Cursor trail",
    fxTrailStyle: "Trail style",
    fxTrailComet: "Comet",
    fxTrailSparkle: "Dust",
    fxTrailLength: "Trail lifetime",
    fxTrailWidth: "Trail width",
    fxTrailGlow: "Trail glow",
    fxOpacity: "Effect opacity",
    fxBlend: "Blend mode",
    fxBlendScreen: "Screen",
    fxBlendNormal: "Normal",
    fxColorMode: "Colour source",
    fxColorAccent: "Accent",
    fxColorCustom: "Custom",
    fxColor: "Effect colour",
    sectionParallax: "3D parallax",
    sectionParallaxDesc: "Pointer-driven depth for the wallpaper and optional UI surfaces.",
    parallaxEnabled: "Enable 3D parallax",
    parallaxBgDepth: "Wallpaper depth",
    parallaxUi: "UI parallax",
    parallaxUiChat: "Chat depth",
    parallaxUiComposer: "Composer depth",
    parallaxUiSidebar: "Sidebar depth",
    parallaxSmooth: "Smoothing",
    rotationEnabled: "Auto rotation",
    rotationInterval: "Rotation interval",
    rotationHint: "Rotates through non-hidden library wallpapers while Antigravity is running.",
    enableWallpaper: "Enable Custom Wallpaper",
    enableWallpaperDesc: "Render Scene, Web, video or image background behind Antigravity with liquid glass",
    wallpaperType: "Wallpaper Type",
    wallpaperTypeImage: "Image (URL / Local path)",
    wallpaperTypeVideo: "Video (MP4 / WebM)",
    wallpaperTypePreset: "Built-in Art Preset",
    wallpaperSource: "Wallpaper Source URL or Local Path",
    wallpaperSourcePlaceholder: "https://... or C:/path/to/wallpaper.jpg",
    wallpaperBlur: "Backdrop Blur",
    wallpaperBlurDesc: "Gaussian blur applied to the wallpaper media (0px - 60px)",
    maskOcclusion: "Backdrop Occlusion Mask",
    maskOcclusionDesc: "Wallpaper veil; 100% fully hides the wallpaper (0% - 100%).",
    panelGlass: "Interface Transparency",
    panelGlassDesc: "Shared transparency for panels, title bar, sidebars and status bar; menus and popovers retain a readable translucent fill. 0% keeps the full fill, 100% makes it transparent (0% - 100%).",
    selectSkinFirst: "Enter a media path or pick a Wallpaper Engine project.",
    invalidWallpaperSource: "Use an http(s) URL, a file URL, or an absolute local path.",
    sourceCommitHint: "Press Enter or leave the field to apply the path.",
    weTitle: "Wallpaper Engine Library",
    weDescription: "Browse your local Steam library. Scene, Web, video and Picture projects play live via WebWallGL and a signed loopback origin without modifying Workshop files.",
    weChooseFolder: "Choose library folder",
    weRefresh: "Rescan",
    weScanning: "Scanning local wallpapers…",
    weFound: (count) => `${count} projects found`,
    weBridgeUnavailable: "Local picker is unavailable in this session.",
    weSearch: "Search wallpapers",
    weEmpty: "No Wallpaper Engine projects found. Choose a Steam library, projects folder, or project folder.",
    weMissing: "The previously selected project is no longer in this library.",
    weStaticFallback: "static preview",
    weSceneLive: "live WebWallGL scene",
    wePreparing: "Opening scene…",
    weSceneBackendUnavailable: "Scene media backend unavailable.",
    weSceneUnsupported: "This scene has no supported renderable layers or video.",
    weUse: "Use as wallpaper",
    weHide: "Hide",
    weRestore: "Restore",
    weRestoreAndUse: "Restore & use",
    weShowHidden: (count) => `Hidden (${count})`,
    weShowVisible: (count) => `Wallpapers (${count} hidden)`,
    weSelected: "Selected",
    weTypeVideo: "Video",
    weTypeScene: "Scene",
    weTypeImage: "Image",
    weTypeWeb: "Web",
    weTypeOther: "Other",
    bubbleOpacity: "Message Bubble Opacity",
    bubbleOpacityDesc: "Bubble fill translucency; 0% keeps only text visible (0% - 100%)",
    composerFrost: "Composer Frost Blur",
    composerFrostDesc: "Frosted glass backdrop-filter behind the message input card (0px - 20px)",
    surfaceFrost: "Surface Frost Blur",
    surfaceFrostDesc: "Shared background blur for panels, title bar, sidebars and floating menus; 0px disables blur (0px - 20px)",
    wallpaperMode: "Playback mode",
    wallpaperModeLive: "Live",
    wallpaperModeFrame: "Static frame",
    wallpaperFit: "Fit",
    wallpaperFitCover: "Cover",
    wallpaperFitContain: "Contain",
    wallpaperFitFill: "Fill",
    wallpaperTransition: "Wallpaper switch transition",
    transitionCut: "Cut",
    transitionFade: "Fade",
    transitionSlide: "Slide",
    transitionZoom: "Zoom",
    wallpaperOpacity: "Wallpaper opacity",
    wallpaperOpacityDesc: "Opacity of the wallpaper media layer (0% - 100%).",
    pauseOnHidden: "Pause while Antigravity is hidden",
    pauseOnBlur: "Pause when the window loses focus",
    pauseOnBattery: "Pause while on battery power",
    sceneLive: "Real-time scene rendering",
    sceneLiveDesc: "Render Scene and Web projects with WebWallGL instead of a static frame.",
    sceneLiveFps: "Scene frame-rate cap",
    sceneAutoQuality: "Automatic quality",
    sceneAutoQualityDesc: "Lower post-processing, particles and AA when the GPU cannot hold the frame cap.",
    sceneRenderDpr: "Render resolution",
    sceneRenderDprAuto: "Auto",
    sceneVideoTexScale: "Video texture scale",
    sceneVideoTexScaleAuto: "Auto",
    sceneVideoTexScaleHalf: "Half",
    sceneVideoTexScaleFull: "Full",
    glassSaturation: "Glass saturation",
    glassSaturationDesc: "Colour richness of the frosted surfaces (100% - 200%).",
    glassBorder: "Glass edge strength",
    glassBorderDesc: "Specular rim on structural glass surfaces (0% - 100%).",
    glassHighlight: "Glass top highlight",
    wallpaperSound: "Play video sound",
    wallpaperVolume: "Video volume",
    wallpaperVolumeDesc: "Volume for standalone video and scene wallpapers.",
    videoPlaybackRate: "Video playback speed",
    tagsAll: "All",
    browserHoleCutout: "Split-browser hole cutout",
    browserHoleCutoutDesc: "Cut an evenodd window through the backdrop so Antigravity embedded browser splits stay sharp.",
    studioShortcut: "Global studio shortcut (Alt+Shift+W)",
    studioShortcutDesc: "Toggle the floating Wallpaper Engine studio dialog from anywhere in Antigravity.",
    cdpHealthTitle: "Antigravity CDP Injection Health",
    cdpStatusOk: "Connected to Antigravity workbench",
    cdpStatusMissing: "DevToolsActivePort not found (launch Antigravity with --remote-debugging-port=0)",
    cdpStatusUnreachable: "CDP port unreachable",
    cdpFixShortcuts: "Add --remote-debugging-port=0 to Windows shortcuts",
    cdpFixing: "Updating shortcuts…"
  },
  zh: {
    pluginName: "Antigravity 壁纸引擎",
    pluginDesc: "Scene / Web / 视频 / 图片壁纸与液态玻璃界面",
    wallpaperEngineTitle: "壁纸引擎",
    wallpaperEngineDesc: "把 Scene、Web、视频与图片壁纸放到 Antigravity 背后，并在界面表面叠加液态玻璃。",
    selectWallpaperFirst: "请先在下方选择一张壁纸。",
    sectionGlass: "液态玻璃",
    sectionGlassDesc: "控制 Antigravity 表面的透光、磨砂、染色与高光边缘。",
    sectionPlayback: "播放",
    sectionPlaybackDesc: "场景画质、帧率上限与省电暂停策略。",
    sectionLibrary: "壁纸库",
    sectionLibraryDesc: "浏览本机 Wallpaper Engine 工程、视频与预览。",
    sectionSystem: "系统",
    sectionSystemDesc: "导出或导入外观/播放设置，便于迁移到另一台设备。",
    exportPreset: "导出预设",
    importPreset: "导入预设",
    presetExported: "预设已导出。",
    presetImported: "预设已应用。",
    presetInvalid: "这个文件不是有效的 Antigravity 壁纸预设。",
    defaultValue: "默认",
    sectionTypography: "字体与排版",
    sectionTypographyDesc: "全局字体、字号、字重、字距与光标颜色。",
    fontCustom: "启用自定义排版",
    fontFamily: "字体族",
    fontFamilyPlaceholder: 'Inter, "Microsoft YaHei", sans-serif',
    scanFonts: "扫描系统字体",
    fontScanning: "正在扫描字体…",
    fontSize: "聊天字号",
    fontWeight: "字重",
    letterSpacing: "字距",
    caretColor: "光标颜色",
    sectionFx: "点击与拖尾",
    sectionFxDesc: "在壁纸和界面之上绘制鼠标点击波纹与拖尾。",
    fxEnabled: "启用指针特效",
    fxClick: "点击特效",
    fxClickStyle: "点击样式",
    fxStyleRipple: "波纹",
    fxStyleSpark: "火花",
    fxClickSize: "点击尺寸",
    fxClickGlow: "点击辉光",
    fxTrail: "鼠标拖尾",
    fxTrailStyle: "拖尾样式",
    fxTrailComet: "彗星",
    fxTrailSparkle: "星尘",
    fxTrailLength: "拖尾存留",
    fxTrailWidth: "拖尾宽度",
    fxTrailGlow: "拖尾辉光",
    fxOpacity: "特效不透明度",
    fxBlend: "混合模式",
    fxBlendScreen: "滤色",
    fxBlendNormal: "正常",
    fxColorMode: "颜色来源",
    fxColorAccent: "主题色",
    fxColorCustom: "自定义",
    fxColor: "特效颜色",
    sectionParallax: "3D 视差",
    sectionParallaxDesc: "用鼠标驱动壁纸与可选界面表面的纵深位移。",
    parallaxEnabled: "启用 3D 视差",
    parallaxBgDepth: "壁纸深度",
    parallaxUi: "界面视差",
    parallaxUiChat: "聊天区深度",
    parallaxUiComposer: "输入区深度",
    parallaxUiSidebar: "侧栏深度",
    parallaxSmooth: "平滑度",
    rotationEnabled: "自动轮换",
    rotationInterval: "轮换间隔",
    rotationHint: "在 Antigravity 运行期间，从未隐藏的壁纸库中依次切换。",
    enableWallpaper: "启用自定义壁纸",
    enableWallpaperDesc: "在会话窗口与面板背后渲染 Scene / Web / 视频 / 图片壁纸，并启用液态玻璃透光质感",
    wallpaperType: "壁纸类型",
    wallpaperTypeImage: "静态图片 (网络 URL / 本地路径)",
    wallpaperTypeVideo: "动态视频 (MP4 / WebM 循环静音)",
    wallpaperTypePreset: "精选内置艺术壁纸",
    wallpaperSource: "壁纸地址或本地绝对路径",
    wallpaperSourcePlaceholder: "https://... 或 C:/Users/.../wallpaper.jpg",
    wallpaperBlur: "背景高斯模糊",
    wallpaperBlurDesc: "平滑模糊壁纸素材层，减少背景噪点干扰 (0px - 60px)",
    maskOcclusion: "防遮挡遮罩不透明度",
    maskOcclusionDesc: "明暗自适应遮罩；100% 表示完全遮住壁纸 (0% - 100%)。",
    panelGlass: "界面透光度",
    panelGlassDesc: "面板、顶栏、侧栏与浮层共用的透光度；菜单与浮窗保留适量透光底色以保证可读。0% 保留完整面板底色，100% 面板底色完全透明 (0% - 100%)。",
    selectSkinFirst: "请先填写媒体路径，或从 Wallpaper Engine 选择项目。",
    invalidWallpaperSource: "请输入 http(s) 地址、file 地址或本地绝对路径。",
    sourceCommitHint: "按 Enter 或离开输入框后应用路径。",
    weTitle: "Wallpaper Engine 壁纸库",
    weDescription: "浏览本机 Steam 壁纸库。Scene、Web、视频与 Picture 项目通过 WebWallGL 与签名本地环回媒体源实时播放，绝不修改 Steam 原文件。",
    weChooseFolder: "选择壁纸库目录",
    weRefresh: "重新扫描",
    weScanning: "正在扫描本机壁纸…",
    weFound: (count) => `找到 ${count} 个项目`,
    weBridgeUnavailable: "当前环境不支持本机目录选择弹窗。",
    weSearch: "搜索壁纸",
    weEmpty: "未找到 Wallpaper Engine 项目。请选择 Steam 库、projects 目录或具体项目目录。",
    weMissing: "之前选用的项目已不在当前库中；如果源文件被移除，请重新选择壁纸。",
    weStaticFallback: "静态预览",
    weSceneLive: "WebWallGL 实时场景",
    wePreparing: "正在打开场景…",
    weSceneBackendUnavailable: "场景媒体服务尚未就绪。",
    weSceneUnsupported: "此场景没有可支持的图层或视频。",
    weUse: "设为壁纸",
    weHide: "隐藏",
    weRestore: "恢复",
    weRestoreAndUse: "恢复并应用",
    weShowHidden: (count) => `已隐藏 (${count})`,
    weShowVisible: (count) => `返回壁纸 (${count} 张已隐藏)`,
    weSelected: "已选用",
    weTypeVideo: "视频",
    weTypeScene: "场景",
    weTypeImage: "图片",
    weTypeWeb: "网页",
    weTypeOther: "其他",
    bubbleOpacity: "消息气泡不透明度",
    bubbleOpacityDesc: "气泡底色不透明度；0% 时仅保留文字原有效果 (0% - 100%)",
    composerFrost: "输入框磨砂毛玻璃",
    composerFrostDesc: "输入卡片的磨砂滤镜，保持输入内容层级 (0px - 20px)",
    surfaceFrost: "界面毛玻璃强度",
    surfaceFrostDesc: "面板、顶栏、侧栏与浮动菜单共用的背景磨砂模糊；0px 关闭模糊，文字与图标保持清晰 (0px - 20px)",
    wallpaperMode: "播放模式",
    wallpaperModeLive: "动态播放",
    wallpaperModeFrame: "静态帧",
    wallpaperFit: "画面适配",
    wallpaperFitCover: "铺满",
    wallpaperFitContain: "完整显示",
    wallpaperFitFill: "拉伸填满",
    wallpaperTransition: "壁纸切换过场",
    transitionCut: "直接切换",
    transitionFade: "淡入淡出",
    transitionSlide: "横向推移",
    transitionZoom: "缩放",
    wallpaperOpacity: "壁纸不透明度",
    wallpaperOpacityDesc: "调整壁纸素材层的不透明度 (0% - 100%)。",
    pauseOnHidden: "Antigravity 隐藏时暂停动画",
    pauseOnBlur: "窗口失焦时暂停",
    pauseOnBattery: "电池供电时暂停",
    sceneLive: "场景实时渲染",
    sceneLiveDesc: "使用 WebWallGL 实时渲染 Scene / Web 工程，而不是静态帧。",
    sceneLiveFps: "场景帧率上限",
    sceneAutoQuality: "自动画质",
    sceneAutoQualityDesc: "GPU 压不住帧率时自动降低后处理、粒子与抗锯齿。",
    sceneRenderDpr: "渲染分辨率",
    sceneRenderDprAuto: "自动",
    sceneVideoTexScale: "视频纹理缩放",
    sceneVideoTexScaleAuto: "自动",
    sceneVideoTexScaleHalf: "一半",
    sceneVideoTexScaleFull: "完整",
    glassSaturation: "玻璃饱和度",
    glassSaturationDesc: "磨砂表面的色彩浓度（100% - 200%）。",
    glassBorder: "玻璃边缘强度",
    glassBorderDesc: "结构玻璃表面的高光描边强度（0% - 100%）。",
    glassHighlight: "玻璃顶部高光",
    wallpaperSound: "播放视频声音",
    wallpaperVolume: "视频音量",
    wallpaperVolumeDesc: "调整独立视频与场景壁纸音量。",
    videoPlaybackRate: "视频播放速度",
    tagsAll: "全部风格",
    browserHoleCutout: "分屏浏览器自动挖孔",
    browserHoleCutoutDesc: "在右侧内嵌浏览器分屏时自动镂空背景层，保持网页清晰无染色。",
    studioShortcut: "全局工作台快捷键 (Alt+Shift+W)",
    studioShortcutDesc: "在 Antigravity 任意位置按 Alt+Shift+W 呼出壁纸设置悬浮窗。",
    cdpHealthTitle: "Antigravity CDP 注入状态",
    cdpStatusOk: "已连接 Antigravity 主界面",
    cdpStatusMissing: "未检测到 DevToolsActivePort（请以 --remote-debugging-port=0 启动 Antigravity）",
    cdpStatusUnreachable: "CDP 调试端口不可达",
    cdpFixShortcuts: "一键为 Windows 快捷方式添加调试参数",
    cdpFixing: "正在更新快捷方式…"
  }
};
function createTranslator(lang = "auto") {
  const isZh = lang === "zh" || lang === "auto" && typeof navigator !== "undefined" && String((typeof document !== "undefined" ? document.documentElement?.lang : "") || navigator.language || "").toLowerCase().startsWith("zh");
  const dict = isZh ? I18N_DICTIONARY.zh : I18N_DICTIONARY.en;
  return (key, ...args) => {
    const entry = dict[key] ?? I18N_DICTIONARY.en[key] ?? key;
    return typeof entry === "function" ? entry(...args) : entry;
  };
}

// src/ui/panel-api.js
function el(tag, attrs = null, ...children) {
  const node = document.createElement(tag);
  if (attrs && typeof attrs === "object") {
    for (const [k, v] of Object.entries(attrs)) {
      if (v === void 0 || v === null || v === false) continue;
      if (k === "className" || k === "class") node.className = String(v);
      else if (k === "style" && typeof v === "object") Object.assign(node.style, v);
      else if (k === "dataset" && typeof v === "object") Object.assign(node.dataset, v);
      else if (k.startsWith("on") && typeof v === "function") node.addEventListener(k.slice(2).toLowerCase(), v);
      else if (k in node && k !== "list") node[k] = v;
      else node.setAttribute(k, v === true ? "" : String(v));
    }
  }
  appendChildren(node, children);
  return node;
}
function appendChildren(parent, list) {
  for (const item of list) {
    if (item === void 0 || item === null || item === false) continue;
    if (Array.isArray(item)) appendChildren(parent, item);
    else if (item instanceof Node) parent.appendChild(item);
    else parent.appendChild(document.createTextNode(String(item)));
  }
}
async function callBackend(action, body = {}) {
  const mode = window.__AGY_SKINS_HOST_MODE__ || "studio";
  if (mode === "aux" && window.sidecar?.fetch) {
    const res2 = await window.sidecar.fetch(`/api/${action}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    return await res2.json();
  }
  const token = window.__AGY_SKINS_STUDIO_TOKEN__ || "";
  const res = await fetch(`/studio-api/${action}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-agy-studio-token": token
    },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}
function createPanelStore() {
  const state = {
    config: null,
    weItems: [],
    cdp: null,
    mediaOrigin: "",
    tab: "library",
    toast: null,
    scanning: false,
    busyAction: "",
    diagnostics: null,
    systemFonts: [],
    fontsLoaded: false
  };
  const listeners = /* @__PURE__ */ new Set();
  let deferFlushTimer = null;
  const notify = () => {
    for (const fn of listeners) fn(state);
  };
  const showToast = (message, kind = "info") => {
    state.toast = message ? { message, kind, at: Date.now() } : null;
    notify();
    if (message) {
      setTimeout(() => {
        if (state.toast?.message === message) {
          state.toast = null;
          notify();
        }
      }, 3200);
    }
  };
  const getT = () => createTranslator(state.config?.uiLanguage || "auto");
  const loadInitial = async () => {
    const data = await callBackend("get-state");
    if (data?.config) state.config = data.config;
    if (Array.isArray(data?.weItems)) state.weItems = data.weItems;
    if (data?.cdp) state.cdp = data.cdp;
    if (data?.mediaOrigin) state.mediaOrigin = data.mediaOrigin;
    notify();
    if (!state.weItems.length) {
      void rescanLibrary();
    }
  };
  const updateConfig = async (patch, { defer = false, silent = false } = {}) => {
    if (!state.config) return null;
    state.config = { ...state.config, ...patch };
    if (!silent) notify();
    const res = await callBackend("update-config", { patch, defer });
    if (res?.config) state.config = res.config;
    if (defer) {
      if (deferFlushTimer) clearTimeout(deferFlushTimer);
      deferFlushTimer = setTimeout(() => {
        deferFlushTimer = null;
        void callBackend("flush-config").catch(() => {
        });
      }, 320);
    }
    notify();
    return state.config;
  };
  const rescanLibrary = async () => {
    state.scanning = true;
    notify();
    try {
      const res = await callBackend("we-scan");
      if (Array.isArray(res?.items)) state.weItems = res.items;
      if (res?.error) showToast(res.error, "warn");
    } finally {
      state.scanning = false;
      notify();
    }
  };
  const applyWallpaperItem = async (item) => {
    state.busyAction = item?.id || "apply";
    notify();
    try {
      const res = await callBackend("we-apply", { item });
      if (res?.config) state.config = res.config;
      const d = await callBackend("get-state");
      if (Array.isArray(d?.weItems)) state.weItems = d.weItems;
    } finally {
      state.busyAction = "";
      notify();
    }
  };
  return {
    state,
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    notify,
    showToast,
    getT,
    loadInitial,
    updateConfig,
    rescanLibrary,
    applyWallpaperItem
  };
}
function rangeControl({ label, desc, min, max, step = 1, unit = "", value, onChange, onCommit }) {
  const valSpan = el("span", { className: "agy-val" }, `${value}${unit}`);
  const slider2 = el("input", {
    type: "range",
    min: String(min),
    max: String(max),
    step: String(step),
    value: String(value),
    onInput: (e) => {
      const v = Number(e.target.value);
      valSpan.textContent = `${v}${unit}`;
      syncSliderPct(e.target, min, max, v);
      onChange?.(v);
    },
    onChange: (e) => {
      const v = Number(e.target.value);
      onCommit?.(v);
    }
  });
  syncSliderPct(slider2, min, max, value);
  return el(
    "div",
    { className: "agy-row agy-row-col" },
    el(
      "div",
      { className: "agy-row-head" },
      el(
        "div",
        null,
        el("div", { className: "agy-label" }, label),
        desc ? el("div", { className: "agy-desc" }, desc) : null
      ),
      valSpan
    ),
    slider2
  );
}
function syncSliderPct(input, min, max, val) {
  const span = max - min;
  const pct = span > 0 ? Math.min(100, Math.max(0, (val - min) / span * 100)) : 0;
  input.style.setProperty("--agy-range-progress", `${pct.toFixed(1)}%`);
}
function switchControl({ label, desc, checked, onChange }) {
  const input = el("input", {
    type: "checkbox",
    checked: Boolean(checked),
    onChange: (e) => onChange?.(Boolean(e.target.checked))
  });
  return el(
    "label",
    { className: "agy-row agy-switch-row" },
    el(
      "div",
      { className: "agy-row-meta" },
      el("div", { className: "agy-label" }, label),
      desc ? el("div", { className: "agy-desc" }, desc) : null
    ),
    el(
      "span",
      { className: "agy-switch" },
      input,
      el("span", { className: "agy-switch-track" })
    )
  );
}
function selectControl({ label, desc, value, options, onChange }) {
  return el(
    "div",
    { className: "agy-row" },
    el(
      "div",
      { className: "agy-row-meta" },
      el("div", { className: "agy-label" }, label),
      desc ? el("div", { className: "agy-desc" }, desc) : null
    ),
    el("select", {
      className: "agy-select",
      value: String(value),
      onChange: (e) => onChange?.(e.target.value)
    }, options.map(
      (opt) => el("option", {
        value: String(opt.value),
        selected: String(opt.value) === String(value)
      }, opt.label)
    ))
  );
}
function colorControl({ label, value, fallback = "#4f8cff", onChange }) {
  const hexVal = /^#[0-9a-f]{6}$/i.test(value || "") ? value : fallback;
  const picker = el("input", {
    type: "color",
    className: "agy-color-input",
    value: hexVal,
    onInput: (e) => onChange?.(e.target.value)
  });
  const textBox = el("input", {
    type: "text",
    className: "agy-input agy-color-hex",
    value: value || "",
    placeholder: fallback,
    onChange: (e) => {
      const v = e.target.value.trim();
      if (/^#[0-9a-f]{6}$/i.test(v)) {
        picker.value = v;
        onChange?.(v);
      }
    }
  });
  return el(
    "div",
    { className: "agy-row" },
    el("div", { className: "agy-label" }, label),
    el("div", { className: "agy-color-group" }, picker, textBox)
  );
}

// src/shared/config.js
var ROTATION_INTERVAL_MIN = 1;
var ROTATION_INTERVAL_MAX = 1440;
var ROTATION_TRIGGER_VALUES = ["interval", "videoEnd"];
var ROTATION_ORDER_VALUES = ["sequence", "random"];
var TRANSITION_VALUES = ["cut", "fade", "push", "wipe", "iris", "zoom", "bars"];
var TRANSITION_DIRECTIONS = ["left", "right", "up", "down"];
var TRANSITION_SPEEDS = ["fast", "normal", "slow"];
var WALLPAPER_TYPES = ["video", "web", "image", "scene"];
var CONTENT_RATINGS = ["everyone", "pg13", "mature", "unrated"];
var ORIENTATION_FILTERS = ["all", "landscape", "portrait"];
var PICKER_LAYOUTS = ["classic", "fixed"];
var SORT_MODES = ["newest", "title"];
var FX_CLICK_STYLES = ["ripple", "spark", "both"];
var FX_TRAIL_STYLES = ["comet", "dust"];
var FX_BLEND_VALUES = ["screen", "normal", "overlay", "multiply", "lighten"];
var FX_COLOR_MODES = ["accent", "rainbow", "custom"];
var FONT_SET_KEYS = [
  "themeColors",
  "themeDarkSeparate",
  "themeSize",
  "themeWeight",
  "themeFamily",
  "globalFamily",
  "componentFonts"
];
var THEME_COLOR_ROLE_IDS = ["primary", "secondary", "tertiary", "caption", "dimmed"];
var TYPE_ROLE_IDS = [
  "markdown-h1",
  "markdown-h2",
  "markdown-h3",
  "markdown-h4",
  "markdown-base",
  "markdown-small",
  "markdown-code",
  "markdown-code-block",
  "markdown-table",
  "markdown-table-head",
  "xs-13",
  "xxs-12"
];
var COMPONENT_FONT_TARGETS = [
  { id: "markdown", label: "对话正文", labelEn: "Chat body" },
  { id: "codeBlock", label: "代码块", labelEn: "Code blocks" },
  { id: "terminal", label: "终端块", labelEn: "Terminal" },
  { id: "table", label: "表格", labelEn: "Tables" }
];
var DEFAULT_CONFIG = {
  schemaVersion: 7,
  wallpaperEnabled: false,
  wallpaperType: "image",
  wallpaperMode: "live",
  wallpaperFit: "cover",
  wallpaperSource: "",
  wallpaperBlur: 0,
  maskOcclusion: 25,
  wallpaperOpacity: 100,
  backgroundBrightness: 100,
  backgroundContrast: 100,
  backgroundSaturate: 100,
  wallpaperFlip: false,
  wallpaperTransition: "cut",
  wallpaperTransitionDir: "left",
  wallpaperTransitionSpeed: "normal",
  pauseOnHidden: true,
  pauseOnBlur: false,
  pauseOnBattery: false,
  wallpaperSound: false,
  wallpaperVolume: 100,
  videoPlaybackRate: 1,
  sceneLive: true,
  sceneLiveFps: 30,
  sceneAutoQuality: true,
  sceneRenderDpr: 0,
  sceneVideoTexScale: 0,
  liveBootDelay: 3,
  pictureSlideSeconds: 0,
  hiddenWallpaperIds: [],
  userProps: {},
  contentRatingFilter: ["everyone"],
  typeFilter: [...WALLPAPER_TYPES],
  folderFilter: "all",
  orientationFilter: "all",
  pickerLayout: "fixed",
  sortOrder: "newest",
  rotationEnabled: false,
  rotationGroupId: "",
  rotationGroups: [],
  rotationSeeded: false,
  rotationMinutes: 30,
  fontCustom: false,
  fontSets: [],
  fontSetId: "",
  themeColors: {},
  themeDarkSeparate: false,
  themeSize: {},
  themeWeight: {},
  themeFamily: {},
  globalFamily: "",
  componentFonts: {},
  caretColor: "",
  accent: "#4f8cff",
  uiColorCustom: false,
  uiColorSend: "",
  uiColorLink: "",
  uiColorFileIcon: "",
  uiColorTab: "",
  uiColorDeepDiving: "",
  themeFollow: false,
  fxEnabled: false,
  fxClick: true,
  fxClickStyle: "ripple",
  fxClickSize: 140,
  fxClickGlow: 60,
  fxTrail: true,
  fxTrailStyle: "comet",
  fxTrailLength: 420,
  fxTrailWidth: 3,
  fxTrailGlow: 60,
  fxOpacity: 85,
  fxBlend: "screen",
  fxColorMode: "accent",
  fxColor: "#4f8cff",
  parallaxEnabled: false,
  parallaxBg: 1,
  parallaxUi: false,
  parallaxPlugin: false,
  parallaxUiChatDepth: 1.2,
  parallaxUiComposerDepth: 1.8,
  parallaxUiSidebarDepth: 1.6,
  parallaxUiBubbleDepth: 1.4,
  parallaxPluginDepths: {},
  parallaxSmooth: 85,
  layerPositionX: 50,
  layerPositionY: 50,
  layerScale: 100,
  panelGlass: 10,
  bubbleOpacity: 55,
  composerFrost: 10,
  surfaceFrost: 8,
  glassSaturation: 150,
  glassBorder: 35,
  glassHighlight: true,
  glassColor: { light: "#ffffff", dark: "#ffffff" },
  glassDarkSeparate: false,
  glassFidelity: 100,
  chatGlassFidelity: 100,
  settingsWindowTransparency: 20,
  settingsWindowBlur: 16,
  sidebarGlass: true,
  sidebarFollowGlobal: true,
  sidebarBlur: 16,
  sidebarAlpha: 60,
  sidebarColor: "#ffffff",
  leftSidebarGlass: true,
  leftSidebarCornerRadius: "native",
  leftSidebarSquareTL: false,
  leftSidebarSquareTR: false,
  leftSidebarSquareBR: false,
  leftSidebarSquareBL: false,
  rightSidebarCornerRadius: "native",
  rightSidebarSquareTL: false,
  rightSidebarSquareTR: false,
  rightSidebarSquareBR: false,
  rightSidebarSquareBL: false,
  titlebarGlass: true,
  browserHoleCutout: true,
  studioShortcut: true,
  uiLanguage: "auto",
  weRoots: [],
  weSelection: null
};
var PARAM_RANGES = {
  wallpaperBlur: { min: 0, max: 60, unit: "px" },
  maskOcclusion: { min: 0, max: 100, unit: "%" },
  wallpaperOpacity: { min: 0, max: 100, unit: "%" },
  backgroundBrightness: { min: 40, max: 160, unit: "%" },
  backgroundContrast: { min: 40, max: 200, unit: "%" },
  backgroundSaturate: { min: 0, max: 200, unit: "%" },
  layerPositionX: { min: 0, max: 100, unit: "%" },
  layerPositionY: { min: 0, max: 100, unit: "%" },
  layerScale: { min: 50, max: 150, unit: "%" },
  panelGlass: { min: 0, max: 100, unit: "%" },
  bubbleOpacity: { min: 0, max: 100, unit: "%" },
  composerFrost: { min: 0, max: 20, unit: "px" },
  surfaceFrost: { min: 0, max: 20, unit: "px" },
  wallpaperVolume: { min: 0, max: 100, unit: "%" },
  glassSaturation: { min: 100, max: 200, unit: "%" },
  glassBorder: { min: 0, max: 100, unit: "%" },
  glassFidelity: { min: 0, max: 100, unit: "%" },
  chatGlassFidelity: { min: 0, max: 100, unit: "%" },
  settingsWindowTransparency: { min: 0, max: 100, unit: "%" },
  settingsWindowBlur: { min: 0, max: 60, unit: "px" },
  sidebarBlur: { min: 0, max: 60, unit: "px" },
  sidebarAlpha: { min: 0, max: 100, unit: "%" },
  fxClickSize: { min: 40, max: 400, unit: "px" },
  fxClickGlow: { min: 0, max: 100, unit: "%" },
  fxTrailLength: { min: 80, max: 2e3, unit: "ms" },
  fxTrailWidth: { min: 1, max: 12, unit: "px" },
  fxTrailGlow: { min: 0, max: 100, unit: "%" },
  fxOpacity: { min: 10, max: 100, unit: "%" },
  parallaxBg: { min: 0, max: 10, unit: "%" },
  parallaxUiChatDepth: { min: 0, max: 10, unit: "%" },
  parallaxUiComposerDepth: { min: 0, max: 10, unit: "%" },
  parallaxUiSidebarDepth: { min: 0, max: 10, unit: "%" },
  parallaxUiBubbleDepth: { min: 0, max: 10, unit: "%" },
  parallaxSmooth: { min: 0, max: 98, unit: "%" }
};
var HEX_RE = /^#[0-9a-f]{6}$/i;
var GROUP_ID_RE = /^[A-Za-z0-9_-]{1,64}$/;
var FONT_SET_ID_RE = /^[A-Za-z0-9_-]{1,64}$/;
var ABS_ROOT_RE = /^(?:[A-Za-z]:[\\/]|\/)/;
function clampNum(value, min, max, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : fallback;
}
function paramInRange(key, value) {
  const range = PARAM_RANGES[key];
  if (!range) throw new Error(`Unknown parameter: ${key}`);
  return clampNum(value, range.min, range.max, DEFAULT_CONFIG[key]);
}
var hex = (value, fallback = "") => typeof value === "string" && HEX_RE.test(value) ? value : fallback;
var text = (value, max = 200) => typeof value === "string" ? value.slice(0, max) : "";
function uniqueStrings(value, maxItems = 5e3, maxLength = 1024) {
  return Array.isArray(value) ? [...new Set(value.filter((item) => typeof item === "string" && item.length > 0 && item.length <= maxLength))].slice(0, maxItems) : [];
}
function enumArray(value, allowed, fallback) {
  if (!Array.isArray(value)) return [...fallback];
  const filtered = [...new Set(value.filter((item) => allowed.includes(item)))];
  return filtered.length ? filtered : [...fallback];
}
function normalizeRotationGroup(raw) {
  if (!raw || typeof raw !== "object") return null;
  const id = typeof raw.id === "string" && GROUP_ID_RE.test(raw.id) ? raw.id : "";
  if (!id) return null;
  return {
    id,
    name: typeof raw.name === "string" && raw.name.trim() ? raw.name.trim().slice(0, 80) : "轮播列表",
    interval: Math.round(clampNum(raw.interval, ROTATION_INTERVAL_MIN, ROTATION_INTERVAL_MAX, DEFAULT_CONFIG.rotationMinutes)),
    order: ROTATION_ORDER_VALUES.includes(raw.order) ? raw.order : "sequence",
    trigger: ROTATION_TRIGGER_VALUES.includes(raw.trigger) ? raw.trigger : "interval",
    wallpaperIds: uniqueStrings(raw.wallpaperIds, 5e3, 1024)
  };
}
function normalizeRotationGroups(value) {
  if (!Array.isArray(value)) return [];
  return value.map(normalizeRotationGroup).filter(Boolean).slice(0, 100);
}
function sanitizeThemeColors(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const out = {};
  for (const role of THEME_COLOR_ROLE_IDS) {
    const pair = value[role];
    if (!pair || typeof pair !== "object" || Array.isArray(pair)) continue;
    const light = hex(pair.light);
    const dark = hex(pair.dark || pair.light);
    if (light && dark) out[role] = { light, dark };
  }
  return out;
}
function sanitizeTypographyMap(value, allowed, min, max) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const out = {};
  for (const key of allowed) {
    if (value[key] === void 0 || value[key] === "") continue;
    out[key] = Math.round(clampNum(value[key], min, max, min));
  }
  return out;
}
function sanitizeFamilyMap(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const out = {};
  for (const key of TYPE_ROLE_IDS) {
    const family = text(value[key], 200).trim();
    if (family) out[key] = family;
  }
  return out;
}
function sanitizeComponentFonts(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const out = {};
  const ids = new Set(COMPONENT_FONT_TARGETS.map((target) => target.id));
  for (const [id, raw] of Object.entries(value)) {
    if (!ids.has(id) || !raw || typeof raw !== "object" || Array.isArray(raw)) continue;
    const entry = {};
    if (raw.size !== void 0 && raw.size !== "") entry.size = Math.round(clampNum(raw.size, 8, 48, 14));
    if (raw.weight !== void 0 && raw.weight !== "") entry.weight = Math.round(clampNum(raw.weight, 100, 900, 400));
    const family = text(raw.family, 200).trim();
    if (family) entry.family = family;
    if (Object.keys(entry).length) out[id] = entry;
  }
  return out;
}
function sanitizeFontValues(raw) {
  const src = raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {};
  return {
    themeColors: sanitizeThemeColors(src.themeColors),
    themeDarkSeparate: src.themeDarkSeparate === true,
    themeSize: sanitizeTypographyMap(src.themeSize, TYPE_ROLE_IDS, 8, 48),
    themeWeight: sanitizeTypographyMap(src.themeWeight, TYPE_ROLE_IDS, 100, 900),
    themeFamily: sanitizeFamilyMap(src.themeFamily),
    globalFamily: text(src.globalFamily, 200).trim(),
    componentFonts: sanitizeComponentFonts(src.componentFonts)
  };
}
function sanitizeFontSets(value) {
  if (!Array.isArray(value)) return [];
  const out = [];
  for (const raw of value) {
    if (!raw || typeof raw !== "object") continue;
    const id = typeof raw.id === "string" && FONT_SET_ID_RE.test(raw.id) ? raw.id : "";
    if (!id || out.some((item) => item.id === id)) continue;
    out.push({
      id,
      name: typeof raw.name === "string" && raw.name.trim() ? raw.name.trim().slice(0, 80) : "字体集",
      values: sanitizeFontValues(raw.values)
    });
    if (out.length >= 100) break;
  }
  return out;
}
function sanitizePluginDepths(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const out = {};
  for (const [slot, depth] of Object.entries(value)) {
    if (typeof slot !== "string" || !slot || slot.length > 120) continue;
    out[slot] = clampNum(depth, 0, 10, 1);
  }
  return out;
}
function scalarValue(value) {
  return value === null || ["string", "number", "boolean"].includes(typeof value) ? typeof value === "string" ? value.slice(0, 2048) : value : null;
}
function sanitizeUserProps(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const out = {};
  for (const [id, props] of Object.entries(value)) {
    if (typeof id !== "string" || !id || id.length > 1024 || !props || typeof props !== "object" || Array.isArray(props)) continue;
    const clean = {};
    for (const [name, propValue] of Object.entries(props)) {
      if (typeof name !== "string" || !name || name.length > 120) continue;
      const scalar = scalarValue(propValue);
      if (scalar !== null) clean[name] = scalar;
    }
    if (Object.keys(clean).length) out[id] = clean;
  }
  return out;
}
function sanitizeSelectionProperties(value) {
  if (!Array.isArray(value)) return [];
  return value.filter((property) => property && typeof property === "object" && typeof property.name === "string" && typeof property.type === "string").slice(0, 100).map((property) => {
    const entry = {
      name: property.name.slice(0, 120),
      type: property.type.slice(0, 20),
      text: text(property.text, 240),
      order: Number(property.order) || 0,
      value: scalarValue(property.value),
      hidden: property.hidden === true
    };
    if (Array.isArray(property.options)) {
      entry.options = property.options.filter((option) => option && typeof option === "object").slice(0, 200).map((option) => ({
        label: text(option.label, 160),
        value: scalarValue(option.value)
      }));
    }
    for (const key of ["min", "max", "step", "precision"]) {
      if (Number.isFinite(Number(property[key]))) entry[key] = Number(property[key]);
    }
    if (typeof property.fileType === "string") entry.fileType = property.fileType.slice(0, 20);
    return entry;
  });
}
function normalizeConfig(value) {
  const raw = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const schemaVersion = Math.max(7, Number(raw.schemaVersion) || 0);
  const rotationGroups = normalizeRotationGroups(raw.rotationGroups);
  const rotationGroupId = rotationGroups.some((group) => group.id === raw.rotationGroupId) ? raw.rotationGroupId : "";
  const transition = raw.wallpaperTransition === "slide" ? "push" : TRANSITION_VALUES.includes(raw.wallpaperTransition) ? raw.wallpaperTransition : DEFAULT_CONFIG.wallpaperTransition;
  const fontSets = sanitizeFontSets(raw.fontSets);
  const fontSetId = fontSets.some((item) => item.id === raw.fontSetId) ? raw.fontSetId : "";
  const sourceType = WALLPAPER_TYPES.includes(raw.wallpaperType) ? raw.wallpaperType : DEFAULT_CONFIG.wallpaperType;
  const fit = ["cover", "contain", "center", "fill"].includes(raw.wallpaperFit) ? raw.wallpaperFit : DEFAULT_CONFIG.wallpaperFit;
  const typeFilter = typeof raw.typeFilter === "string" ? raw.typeFilter === "all" ? [...WALLPAPER_TYPES] : [raw.typeFilter].filter((item) => WALLPAPER_TYPES.includes(item)) : enumArray(raw.typeFilter, WALLPAPER_TYPES, WALLPAPER_TYPES);
  const legacyBubbleDefault = Number(raw.schemaVersion ?? 3) < 4 && raw.bubbleOpacity === 100;
  return {
    schemaVersion,
    wallpaperEnabled: raw.wallpaperEnabled === true,
    wallpaperType: sourceType,
    wallpaperMode: raw.wallpaperMode === "frame" ? "frame" : "live",
    wallpaperFit: fit,
    wallpaperSource: text(raw.wallpaperSource, 16384),
    wallpaperBlur: paramInRange("wallpaperBlur", raw.wallpaperBlur),
    maskOcclusion: paramInRange("maskOcclusion", raw.maskOcclusion),
    wallpaperOpacity: paramInRange("wallpaperOpacity", raw.wallpaperOpacity),
    backgroundBrightness: paramInRange("backgroundBrightness", raw.backgroundBrightness),
    backgroundContrast: paramInRange("backgroundContrast", raw.backgroundContrast),
    backgroundSaturate: paramInRange("backgroundSaturate", raw.backgroundSaturate),
    wallpaperFlip: raw.wallpaperFlip === true,
    wallpaperTransition: transition,
    wallpaperTransitionDir: TRANSITION_DIRECTIONS.includes(raw.wallpaperTransitionDir) ? raw.wallpaperTransitionDir : DEFAULT_CONFIG.wallpaperTransitionDir,
    wallpaperTransitionSpeed: TRANSITION_SPEEDS.includes(raw.wallpaperTransitionSpeed) ? raw.wallpaperTransitionSpeed : DEFAULT_CONFIG.wallpaperTransitionSpeed,
    pauseOnHidden: typeof raw.pauseOnHidden === "boolean" ? raw.pauseOnHidden : DEFAULT_CONFIG.pauseOnHidden,
    pauseOnBlur: typeof raw.pauseOnBlur === "boolean" ? raw.pauseOnBlur : DEFAULT_CONFIG.pauseOnBlur,
    pauseOnBattery: typeof raw.pauseOnBattery === "boolean" ? raw.pauseOnBattery : DEFAULT_CONFIG.pauseOnBattery,
    wallpaperSound: typeof raw.wallpaperSound === "boolean" ? raw.wallpaperSound : DEFAULT_CONFIG.wallpaperSound,
    wallpaperVolume: paramInRange("wallpaperVolume", raw.wallpaperVolume),
    videoPlaybackRate: clampNum(raw.videoPlaybackRate, 0.5, 2, DEFAULT_CONFIG.videoPlaybackRate),
    sceneLive: typeof raw.sceneLive === "boolean" ? raw.sceneLive : DEFAULT_CONFIG.sceneLive,
    sceneLiveFps: [15, 30, 60].includes(Number(raw.sceneLiveFps)) ? Number(raw.sceneLiveFps) : DEFAULT_CONFIG.sceneLiveFps,
    sceneAutoQuality: typeof raw.sceneAutoQuality === "boolean" ? raw.sceneAutoQuality : DEFAULT_CONFIG.sceneAutoQuality,
    sceneRenderDpr: [0, 1, 1.5, 2].includes(Number(raw.sceneRenderDpr)) ? Number(raw.sceneRenderDpr) : DEFAULT_CONFIG.sceneRenderDpr,
    sceneVideoTexScale: [0, 0.5, 1].includes(Number(raw.sceneVideoTexScale)) ? Number(raw.sceneVideoTexScale) : DEFAULT_CONFIG.sceneVideoTexScale,
    liveBootDelay: clampNum(raw.liveBootDelay, 0, 30, DEFAULT_CONFIG.liveBootDelay),
    pictureSlideSeconds: Math.round(clampNum(raw.pictureSlideSeconds, 0, 3600, DEFAULT_CONFIG.pictureSlideSeconds)),
    hiddenWallpaperIds: uniqueStrings(raw.hiddenWallpaperIds),
    userProps: sanitizeUserProps(raw.userProps),
    contentRatingFilter: enumArray(raw.contentRatingFilter, CONTENT_RATINGS, ["everyone"]),
    typeFilter,
    folderFilter: text(raw.folderFilter, 200) || "all",
    orientationFilter: ORIENTATION_FILTERS.includes(raw.orientationFilter) ? raw.orientationFilter : DEFAULT_CONFIG.orientationFilter,
    pickerLayout: PICKER_LAYOUTS.includes(raw.pickerLayout) ? raw.pickerLayout : DEFAULT_CONFIG.pickerLayout,
    sortOrder: SORT_MODES.includes(raw.sortOrder) ? raw.sortOrder : DEFAULT_CONFIG.sortOrder,
    rotationEnabled: raw.rotationEnabled === true,
    rotationGroupId,
    rotationGroups,
    rotationSeeded: raw.rotationSeeded === true,
    rotationMinutes: Math.round(clampNum(
      raw.rotationMinutes,
      ROTATION_INTERVAL_MIN,
      ROTATION_INTERVAL_MAX,
      DEFAULT_CONFIG.rotationMinutes
    )),
    fontCustom: raw.fontCustom === true,
    fontSets,
    fontSetId,
    themeColors: sanitizeThemeColors(raw.themeColors),
    themeDarkSeparate: raw.themeDarkSeparate === true,
    themeSize: sanitizeTypographyMap(raw.themeSize, TYPE_ROLE_IDS, 8, 48),
    themeWeight: sanitizeTypographyMap(raw.themeWeight, TYPE_ROLE_IDS, 100, 900),
    themeFamily: sanitizeFamilyMap(raw.themeFamily),
    globalFamily: text(raw.globalFamily || raw.fontFamily, 200).trim(),
    componentFonts: sanitizeComponentFonts(raw.componentFonts),
    caretColor: hex(raw.caretColor),
    accent: hex(raw.accent, DEFAULT_CONFIG.accent),
    uiColorCustom: raw.uiColorCustom === true,
    uiColorSend: hex(raw.uiColorSend),
    uiColorLink: hex(raw.uiColorLink),
    uiColorFileIcon: hex(raw.uiColorFileIcon),
    uiColorTab: hex(raw.uiColorTab),
    uiColorDeepDiving: hex(raw.uiColorDeepDiving),
    themeFollow: raw.themeFollow === true,
    fxEnabled: raw.fxEnabled === true,
    fxClick: raw.fxClick !== false,
    fxClickStyle: FX_CLICK_STYLES.includes(raw.fxClickStyle) ? raw.fxClickStyle : DEFAULT_CONFIG.fxClickStyle,
    fxClickSize: paramInRange("fxClickSize", raw.fxClickSize),
    fxClickGlow: paramInRange("fxClickGlow", raw.fxClickGlow),
    fxTrail: raw.fxTrail !== false,
    fxTrailStyle: raw.fxTrailStyle === "sparkle" ? "dust" : FX_TRAIL_STYLES.includes(raw.fxTrailStyle) ? raw.fxTrailStyle : DEFAULT_CONFIG.fxTrailStyle,
    fxTrailLength: paramInRange("fxTrailLength", raw.fxTrailLength),
    fxTrailWidth: paramInRange("fxTrailWidth", raw.fxTrailWidth),
    fxTrailGlow: paramInRange("fxTrailGlow", raw.fxTrailGlow),
    fxOpacity: paramInRange("fxOpacity", raw.fxOpacity),
    fxBlend: FX_BLEND_VALUES.includes(raw.fxBlend) ? raw.fxBlend : DEFAULT_CONFIG.fxBlend,
    fxColorMode: FX_COLOR_MODES.includes(raw.fxColorMode) ? raw.fxColorMode : DEFAULT_CONFIG.fxColorMode,
    fxColor: hex(raw.fxColor, DEFAULT_CONFIG.fxColor),
    parallaxEnabled: raw.parallaxEnabled === true,
    parallaxBg: paramInRange("parallaxBg", raw.parallaxBg),
    parallaxUi: raw.parallaxUi === true,
    parallaxPlugin: raw.parallaxPlugin === true,
    parallaxUiChatDepth: paramInRange("parallaxUiChatDepth", raw.parallaxUiChatDepth),
    parallaxUiComposerDepth: paramInRange("parallaxUiComposerDepth", raw.parallaxUiComposerDepth),
    parallaxUiSidebarDepth: paramInRange("parallaxUiSidebarDepth", raw.parallaxUiSidebarDepth),
    parallaxUiBubbleDepth: paramInRange("parallaxUiBubbleDepth", raw.parallaxUiBubbleDepth),
    parallaxPluginDepths: sanitizePluginDepths(raw.parallaxPluginDepths),
    parallaxSmooth: paramInRange("parallaxSmooth", raw.parallaxSmooth),
    layerPositionX: paramInRange("layerPositionX", raw.layerPositionX),
    layerPositionY: paramInRange("layerPositionY", raw.layerPositionY),
    layerScale: paramInRange("layerScale", raw.layerScale),
    panelGlass: paramInRange("panelGlass", raw.panelGlass),
    bubbleOpacity: legacyBubbleDefault ? 55 : paramInRange("bubbleOpacity", raw.bubbleOpacity),
    composerFrost: paramInRange("composerFrost", raw.composerFrost),
    surfaceFrost: paramInRange("surfaceFrost", raw.surfaceFrost),
    glassSaturation: paramInRange("glassSaturation", raw.glassSaturation),
    glassBorder: paramInRange("glassBorder", raw.glassBorder),
    glassHighlight: raw.glassHighlight !== false,
    glassColor: {
      light: hex(raw.glassColor?.light, DEFAULT_CONFIG.glassColor.light),
      dark: hex(raw.glassColor?.dark, DEFAULT_CONFIG.glassColor.dark)
    },
    glassDarkSeparate: raw.glassDarkSeparate === true,
    glassFidelity: paramInRange("glassFidelity", raw.glassFidelity),
    chatGlassFidelity: paramInRange("chatGlassFidelity", raw.chatGlassFidelity),
    settingsWindowTransparency: paramInRange("settingsWindowTransparency", raw.settingsWindowTransparency),
    settingsWindowBlur: paramInRange("settingsWindowBlur", raw.settingsWindowBlur),
    sidebarGlass: raw.sidebarGlass !== false,
    sidebarFollowGlobal: raw.sidebarFollowGlobal !== false,
    sidebarBlur: paramInRange("sidebarBlur", raw.sidebarBlur),
    sidebarAlpha: paramInRange("sidebarAlpha", raw.sidebarAlpha),
    sidebarColor: hex(raw.sidebarColor, DEFAULT_CONFIG.sidebarColor),
    leftSidebarGlass: typeof raw.leftSidebarGlass === "boolean" ? raw.leftSidebarGlass : DEFAULT_CONFIG.leftSidebarGlass,
    leftSidebarCornerRadius: ["native", "6", "12", "20"].includes(raw.leftSidebarCornerRadius) ? raw.leftSidebarCornerRadius : DEFAULT_CONFIG.leftSidebarCornerRadius,
    leftSidebarSquareTL: raw.leftSidebarSquareTL === true,
    leftSidebarSquareTR: raw.leftSidebarSquareTR === true,
    leftSidebarSquareBR: raw.leftSidebarSquareBR === true,
    leftSidebarSquareBL: raw.leftSidebarSquareBL === true,
    rightSidebarCornerRadius: ["native", "6", "12", "20"].includes(raw.rightSidebarCornerRadius) ? raw.rightSidebarCornerRadius : DEFAULT_CONFIG.rightSidebarCornerRadius,
    rightSidebarSquareTL: raw.rightSidebarSquareTL === true,
    rightSidebarSquareTR: raw.rightSidebarSquareTR === true,
    rightSidebarSquareBR: raw.rightSidebarSquareBR === true,
    rightSidebarSquareBL: raw.rightSidebarSquareBL === true,
    titlebarGlass: typeof raw.titlebarGlass === "boolean" ? raw.titlebarGlass : DEFAULT_CONFIG.titlebarGlass,
    browserHoleCutout: typeof raw.browserHoleCutout === "boolean" ? raw.browserHoleCutout : DEFAULT_CONFIG.browserHoleCutout,
    studioShortcut: typeof raw.studioShortcut === "boolean" ? raw.studioShortcut : DEFAULT_CONFIG.studioShortcut,
    uiLanguage: ["auto", "zh", "en"].includes(raw.uiLanguage) ? raw.uiLanguage : DEFAULT_CONFIG.uiLanguage,
    weRoots: Array.isArray(raw.weRoots) ? [...new Set(raw.weRoots.filter((root) => typeof root === "string" && ABS_ROOT_RE.test(root) && root.length <= 1024))].slice(0, 8) : [],
    weSelection: raw.weSelection && typeof raw.weSelection === "object" && typeof raw.weSelection.id === "string" && typeof raw.weSelection.title === "string" ? {
      id: raw.weSelection.id.slice(0, 1024),
      title: raw.weSelection.title.slice(0, 120),
      kind: String(raw.weSelection.kind || "").slice(0, 20),
      source: String(raw.weSelection.source || "").slice(0, 20),
      staticFallback: Boolean(raw.weSelection.staticFallback),
      dir: typeof raw.weSelection.dir === "string" ? raw.weSelection.dir.slice(0, 1024) : null,
      manifestPath: typeof raw.weSelection.manifestPath === "string" ? raw.weSelection.manifestPath.slice(0, 1024) : null,
      framePath: typeof raw.weSelection.framePath === "string" ? raw.weSelection.framePath.slice(0, 1024) : null,
      previewPath: typeof raw.weSelection.previewPath === "string" ? raw.weSelection.previewPath.slice(0, 1024) : null,
      slides: uniqueStrings(raw.weSelection.slides, 500, 1024),
      properties: sanitizeSelectionProperties(raw.weSelection.properties),
      file: typeof raw.weSelection.file === "string" ? raw.weSelection.file.slice(0, 260) : "",
      slideIntervalMs: Number.isFinite(Number(raw.weSelection.slideIntervalMs)) ? Math.min(24 * 60 * 60 * 1e3, Math.max(1e3, Number(raw.weSelection.slideIntervalMs))) : null
    } : null
  };
}

// src/ui/components/WallpaperEnginePanel.js
var searchQuery = "";
var showHidden = false;
var manualSourceDraft = null;
var urlImportDraft = "";
function renderWallpaperEnginePanel(store) {
  const { config, weItems, scanning, busyAction } = store.state;
  const t = store.getT();
  const isZh = t("weTypeVideo") === "视频";
  if (manualSourceDraft === null) manualSourceDraft = config.wallpaperSource || "";
  const hiddenSet = new Set(config.hiddenWallpaperIds || []);
  const typeSet = new Set(config.typeFilter || WALLPAPER_TYPES);
  const ratingSet = new Set(config.contentRatingFilter || ["everyone"]);
  const folders = [...new Set(weItems.map((i) => i.libraryRoot).filter(Boolean))];
  const filtered = weItems.filter((item) => {
    const isHidden = hiddenSet.has(item.id);
    if (showHidden !== isHidden) return false;
    if (!typeSet.has(item.kind)) return false;
    if (!ratingSet.has(item.contentrating || "everyone")) return false;
    if (config.folderFilter && config.folderFilter !== "all" && item.libraryRoot !== config.folderFilter) return false;
    if (config.orientationFilter === "landscape" && item.width > 0 && item.height > 0 && item.width < item.height) return false;
    if (config.orientationFilter === "portrait" && item.width > 0 && item.height > 0 && item.height <= item.width) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!String(item.title || "").toLowerCase().includes(q) && !String(item.workshopId || "").includes(q)) return false;
    }
    return true;
  }).sort((a, b) => config.sortOrder === "title" ? String(a.title || "").localeCompare(String(b.title || ""), void 0, { sensitivity: "base" }) : (Number(b.mtimeMs) || 0) - (Number(a.mtimeMs) || 0));
  const toggleHide = (item) => {
    const next = new Set(hiddenSet);
    if (next.has(item.id)) next.delete(item.id);
    else next.add(item.id);
    void store.updateConfig({ hiddenWallpaperIds: [...next] });
  };
  const toggleFilterChip = (field, allowed, value) => {
    const cur = new Set(config[field] || allowed);
    if (cur.has(value)) {
      if (cur.size > 1) cur.delete(value);
    } else {
      cur.add(value);
    }
    void store.updateConfig({ [field]: [...cur] });
  };
  const applyManualSource = () => {
    const source = String(manualSourceDraft || "").trim();
    if (!source) {
      void store.updateConfig({ wallpaperEnabled: false, wallpaperSource: "" });
      return;
    }
    const lower = source.toLowerCase();
    const inferredType = /\.(mp4|webm|mov|mkv|avi)(?:$|\?)/i.test(lower) ? "video" : config.wallpaperType === "video" ? "video" : "image";
    void store.updateConfig({
      wallpaperEnabled: true,
      wallpaperType: inferredType,
      wallpaperSource: source,
      weSelection: null
    });
  };
  const sel = config.weSelection;
  const selProps = Array.isArray(sel?.properties) ? sel.properties.filter((p) => !p.hidden) : [];
  return el(
    "div",
    { style: { display: "flex", flexDirection: "column", gap: "12px" } },
    el(
      "div",
      { className: "agy-card" },
      switchControl({
        label: t("enableWallpaper"),
        desc: t("enableWallpaperDesc"),
        checked: config.wallpaperEnabled,
        onChange: (v) => void store.updateConfig({ wallpaperEnabled: v })
      }),
      el(
        "div",
        { className: "agy-toolbar" },
        el("input", {
          type: "text",
          className: "agy-input",
          value: manualSourceDraft,
          placeholder: t("wallpaperSourcePlaceholder"),
          onInput: (e) => {
            manualSourceDraft = e.target.value;
          },
          onKeydown: (e) => {
            if (e.key === "Enter") applyManualSource();
          }
        }),
        el("button", { type: "button", className: "agy-btn agy-btn-primary", onClick: applyManualSource }, isZh ? "应用路径/URL" : "Apply Source")
      )
    ),
    selProps.length > 0 ? el(
      "div",
      { className: "agy-card" },
      el("div", { className: "agy-card-title" }, `${sel.title} — ${isZh ? "场景属性" : "Scene Properties"}`),
      ...selProps.map((prop) => {
        const curVal = config.userProps?.[sel.id]?.[prop.name] ?? prop.value;
        const setProp = (val) => {
          const next = structuredClone(config.userProps || {});
          next[sel.id] = { ...next[sel.id] || {}, [prop.name]: val };
          void store.updateConfig({ userProps: next });
        };
        if (prop.type === "bool") {
          return switchControl({
            label: prop.text || prop.name,
            checked: Boolean(curVal),
            onChange: (v) => setProp(v)
          });
        }
        if (prop.type === "combo" && Array.isArray(prop.options)) {
          return el(
            "div",
            { className: "agy-row" },
            el("div", { className: "agy-label" }, prop.text || prop.name),
            el("select", {
              className: "agy-select",
              value: String(curVal ?? ""),
              onChange: (e) => setProp(e.target.value)
            }, prop.options.map((o) => el("option", {
              value: String(o.value),
              selected: String(o.value) === String(curVal)
            }, o.label || String(o.value))))
          );
        }
        if (prop.type === "slider") {
          const min = Number.isFinite(prop.min) ? prop.min : 0;
          const max = Number.isFinite(prop.max) ? prop.max : 100;
          const step = Number.isFinite(prop.step) && prop.step > 0 ? prop.step : 0.1;
          return el(
            "div",
            { className: "agy-row agy-row-col" },
            el(
              "div",
              { className: "agy-row-head" },
              el("div", { className: "agy-label" }, prop.text || prop.name),
              el("span", { className: "agy-val" }, String(curVal ?? min))
            ),
            el("input", {
              type: "range",
              min: String(min),
              max: String(max),
              step: String(step),
              value: String(curVal ?? min),
              onInput: (e) => setProp(Number(e.target.value))
            })
          );
        }
        return el(
          "div",
          { className: "agy-row" },
          el("div", { className: "agy-label" }, prop.text || prop.name),
          el("input", {
            type: "text",
            className: "agy-input",
            value: String(curVal ?? ""),
            onChange: (e) => setProp(e.target.value)
          })
        );
      })
    ) : null,
    el(
      "div",
      { className: "agy-card" },
      el(
        "div",
        { className: "agy-row-head" },
        el(
          "div",
          null,
          el("div", { className: "agy-card-title" }, t("weTitle")),
          el("div", { className: "agy-card-desc" }, t("weDescription"))
        ),
        el(
          "div",
          { className: "agy-toolbar" },
          el("button", {
            type: "button",
            className: "agy-btn",
            onClick: async () => {
              const res = await callBackend("pick-folder", { title: t("weChooseFolder") });
              const picked = res?.paths?.[0];
              if (picked) {
                const nextRoots = [.../* @__PURE__ */ new Set([...config.weRoots || [], picked])];
                await store.updateConfig({ weRoots: nextRoots });
                await store.rescanLibrary();
              }
            }
          }, t("weChooseFolder")),
          el("button", {
            type: "button",
            className: "agy-btn",
            disabled: scanning,
            onClick: () => void store.rescanLibrary()
          }, scanning ? t("weScanning") : t("weRefresh"))
        )
      ),
      el(
        "div",
        { className: "agy-toolbar" },
        el("button", {
          type: "button",
          className: "agy-btn",
          onClick: async () => {
            const pick = await callBackend("pick-files", { title: isZh ? "选择本地图片或视频" : "Import local image/video" });
            if (pick?.paths?.length) {
              const res = await callBackend("uploads-import", { paths: pick.paths });
              if (res?.items?.length) {
                store.showToast(isZh ? `已导入 ${res.items.length} 个素材` : `Imported ${res.items.length} file(s)`);
                await store.rescanLibrary();
              }
            }
          }
        }, isZh ? "导入本地图片/视频" : "Import Local Media"),
        el("input", {
          type: "text",
          className: "agy-input",
          value: urlImportDraft,
          placeholder: isZh ? "粘贴 https:// 图片或视频直链下载到本地库" : "Download from https:// URL into library",
          onInput: (e) => {
            urlImportDraft = e.target.value;
          }
        }),
        el("button", {
          type: "button",
          className: "agy-btn",
          disabled: busyAction === "url",
          onClick: async () => {
            if (!urlImportDraft.trim()) return;
            store.state.busyAction = "url";
            store.notify();
            try {
              const res = await callBackend("uploads-url", { url: urlImportDraft.trim() });
              if (res?.ok && res?.item) {
                urlImportDraft = "";
                await store.rescanLibrary();
                await store.applyWallpaperItem(res.item);
              } else {
                store.showToast(res?.error || "Download failed", "warn");
              }
            } finally {
              store.state.busyAction = "";
              store.notify();
            }
          }
        }, isZh ? "下载并应用" : "Fetch URL"),
        el("button", {
          type: "button",
          className: "agy-btn",
          disabled: busyAction === "bing",
          onClick: async () => {
            store.state.busyAction = "bing";
            store.notify();
            try {
              const res = await callBackend("uploads-bing", { index: 0 });
              if (res?.ok && res?.item) {
                await store.rescanLibrary();
                await store.applyWallpaperItem(res.item);
              } else {
                store.showToast(res?.error || "Bing fetch failed", "warn");
              }
            } finally {
              store.state.busyAction = "";
              store.notify();
            }
          }
        }, isZh ? "Bing 每日一图" : "Bing Daily")
      ),
      el(
        "div",
        { className: "agy-toolbar" },
        el("input", {
          type: "search",
          className: "agy-input",
          value: searchQuery,
          placeholder: t("weSearch"),
          onInput: (e) => {
            searchQuery = e.target.value;
            store.notify();
          }
        }),
        el("select", {
          className: "agy-select",
          value: config.sortOrder || "newest",
          onChange: (e) => void store.updateConfig({ sortOrder: e.target.value })
        }, [
          el("option", { value: "newest", selected: config.sortOrder === "newest" }, isZh ? "按最新排序" : "Newest first"),
          el("option", { value: "title", selected: config.sortOrder === "title" }, isZh ? "按标题 A-Z" : "Title A-Z")
        ]),
        el("button", {
          type: "button",
          className: "agy-btn",
          onClick: () => void store.updateConfig({ pickerLayout: config.pickerLayout === "fixed" ? "classic" : "fixed" })
        }, config.pickerLayout === "fixed" ? isZh ? "卡片视图" : "Fixed Cards" : isZh ? "紧凑视图" : "Compact"),
        el("button", {
          type: "button",
          className: "agy-btn",
          onClick: () => {
            showHidden = !showHidden;
            store.notify();
          }
        }, showHidden ? t("weShowVisible", hiddenSet.size) : t("weShowHidden", hiddenSet.size))
      ),
      el(
        "div",
        { className: "agy-chips" },
        WALLPAPER_TYPES.map((kind) => el("button", {
          type: "button",
          className: `agy-chip ${typeSet.has(kind) ? "active" : ""}`,
          onClick: () => toggleFilterChip("typeFilter", WALLPAPER_TYPES, kind)
        }, kind.toUpperCase())),
        CONTENT_RATINGS.map((r) => el("button", {
          type: "button",
          className: `agy-chip ${ratingSet.has(r) ? "active" : ""}`,
          onClick: () => toggleFilterChip("contentRatingFilter", ["everyone"], r)
        }, r)),
        ORIENTATION_FILTERS.map((o) => el("button", {
          type: "button",
          className: `agy-chip ${config.orientationFilter === o ? "active" : ""}`,
          onClick: () => void store.updateConfig({ orientationFilter: o })
        }, o)),
        folders.length > 1 ? el("select", {
          className: "agy-select",
          value: config.folderFilter || "all",
          onChange: (e) => void store.updateConfig({ folderFilter: e.target.value })
        }, [
          el("option", { value: "all", selected: config.folderFilter === "all" }, t("tagsAll")),
          ...folders.map((f) => el("option", { value: f, selected: config.folderFilter === f }, f))
        ]) : null
      ),
      el("div", { className: "agy-desc" }, t("weFound", filtered.length)),
      filtered.length === 0 ? el("div", { className: "agy-desc", style: { padding: "18px 0", textAlign: "center" } }, t("weEmpty")) : el(
        "div",
        { className: `agy-grid ${config.pickerLayout === "classic" ? "classic" : ""}` },
        filtered.slice(0, 180).map((item) => {
          const selected = config.weSelection?.id === item.id || config.wallpaperSource === item.mediaPath;
          const resLabel = item.width > 0 && item.height > 0 ? `${item.width}x${item.height}` : "";
          return el(
            "div",
            { className: `agy-wp-card ${selected ? "selected" : ""}` },
            el(
              "div",
              {
                className: "agy-wp-thumb",
                onClick: () => void store.applyWallpaperItem(item)
              },
              item.previewUrl ? el("img", { src: item.previewUrl, loading: "lazy", alt: item.title }) : null,
              el("span", { className: "agy-wp-badge" }, item.kind),
              resLabel ? el("span", { className: "agy-wp-res" }, resLabel) : null
            ),
            el(
              "div",
              { className: "agy-wp-info" },
              el("div", { className: "agy-wp-title", title: item.title }, item.title),
              el(
                "div",
                { className: "agy-wp-actions" },
                el("button", {
                  type: "button",
                  className: `agy-btn ${selected ? "agy-btn-primary" : ""}`,
                  disabled: busyAction === item.id,
                  onClick: () => void store.applyWallpaperItem(item)
                }, selected ? t("weSelected") : t("weUse")),
                el("button", {
                  type: "button",
                  className: "agy-btn",
                  onClick: () => toggleHide(item)
                }, showHidden ? t("weRestore") : t("weHide"))
              )
            )
          );
        })
      )
    )
  );
}

// src/ui/components/FontSettingsPanel.js
function pickFontValues(cfg) {
  const values = {};
  for (const k of FONT_SET_KEYS) values[k] = structuredClone(cfg[k]);
  return values;
}
function renderFontSettingsPanel(store) {
  const { config, systemFonts, busyAction } = store.state;
  const t = store.getT();
  const isZh = t("weTypeVideo") === "视频";
  const fontSets = config.fontSets || [];
  const activeSet = fontSets.find((s) => s.id === config.fontSetId) || null;
  const saveNewSet = () => {
    const id = `fs_${Date.now().toString(36)}`;
    const next = [
      ...fontSets,
      {
        id,
        name: isZh ? `字体集 ${fontSets.length + 1}` : `Font Set ${fontSets.length + 1}`,
        values: pickFontValues(config)
      }
    ];
    void store.updateConfig({ fontSets: next, fontSetId: id });
  };
  const updateActiveSetFromConfig = () => {
    if (!activeSet) return;
    const next = fontSets.map((s) => s.id === activeSet.id ? { ...s, values: pickFontValues(config) } : s);
    void store.updateConfig({ fontSets: next });
    store.showToast(isZh ? "已保存当前字体集配置" : "Font set updated");
  };
  const applyFontSet = (id) => {
    const found = fontSets.find((s) => s.id === id);
    if (!found) {
      void store.updateConfig({ fontSetId: "" });
      return;
    }
    void store.updateConfig({ fontSetId: id, ...structuredClone(found.values) });
  };
  const deleteActiveSet = () => {
    if (!activeSet) return;
    const next = fontSets.filter((s) => s.id !== activeSet.id);
    void store.updateConfig({ fontSets: next, fontSetId: next[0]?.id || "" });
  };
  const scanFonts = async () => {
    store.state.busyAction = "fonts";
    store.notify();
    try {
      const res = await callBackend("fonts-list", { refresh: true });
      if (Array.isArray(res?.fonts)) {
        store.state.systemFonts = res.fonts;
        store.state.fontsLoaded = true;
        store.showToast(isZh ? `已扫描 ${res.fonts.length} 个系统字体` : `Scanned ${res.fonts.length} system fonts`);
      }
    } finally {
      store.state.busyAction = "";
      store.notify();
    }
  };
  return el(
    "div",
    { style: { display: "flex", flexDirection: "column", gap: "12px" } },
    el(
      "div",
      { className: "agy-card" },
      el("div", { className: "agy-card-title" }, t("sectionTypography")),
      el("div", { className: "agy-card-desc" }, t("sectionTypographyDesc")),
      switchControl({
        label: t("fontCustom"),
        checked: config.fontCustom,
        onChange: (v) => void store.updateConfig({ fontCustom: v })
      }),
      el(
        "div",
        { className: "agy-toolbar" },
        el("select", {
          className: "agy-select",
          style: { flex: "1" },
          value: config.fontSetId || "",
          onChange: (e) => applyFontSet(e.target.value)
        }, [
          el("option", { value: "", selected: !config.fontSetId }, isZh ? "默认字体集（自定义草稿）" : "Custom / Unsaved Draft"),
          ...fontSets.map((s) => el("option", { value: s.id, selected: s.id === config.fontSetId }, s.name))
        ]),
        el("button", { type: "button", className: "agy-btn", onClick: saveNewSet }, isZh ? "另存为字体集" : "Save New Set"),
        activeSet ? el("button", { type: "button", className: "agy-btn", onClick: updateActiveSetFromConfig }, isZh ? "覆盖保存" : "Overwrite") : null,
        activeSet ? el("button", { type: "button", className: "agy-btn agy-btn-danger", onClick: deleteActiveSet }, isZh ? "删除" : "Delete") : null
      ),
      activeSet ? el(
        "div",
        { className: "agy-row" },
        el("div", { className: "agy-label" }, isZh ? "字体集名称" : "Font set name"),
        el("input", {
          type: "text",
          className: "agy-input",
          value: activeSet.name,
          onChange: (e) => {
            const name = e.target.value.trim() || activeSet.name;
            void store.updateConfig({
              fontSets: fontSets.map((s) => s.id === activeSet.id ? { ...s, name } : s)
            });
          }
        })
      ) : null,
      el(
        "div",
        { className: "agy-row agy-row-col" },
        el(
          "div",
          { className: "agy-row-head" },
          el("div", { className: "agy-label" }, t("fontFamily")),
          el("button", {
            type: "button",
            className: "agy-btn",
            disabled: busyAction === "fonts",
            onClick: scanFonts
          }, busyAction === "fonts" ? t("fontScanning") : t("scanFonts"))
        ),
        el(
          "div",
          { className: "agy-toolbar" },
          el("input", {
            type: "text",
            className: "agy-input",
            list: "agy-system-font-datalist",
            value: config.globalFamily || "",
            placeholder: t("fontFamilyPlaceholder"),
            onChange: (e) => void store.updateConfig({ globalFamily: e.target.value })
          }),
          el(
            "datalist",
            { id: "agy-system-font-datalist" },
            systemFonts.map((f) => el("option", { value: f }))
          )
        )
      ),
      colorControl({
        label: t("caretColor"),
        value: config.caretColor,
        fallback: "#4f8cff",
        onChange: (v) => void store.updateConfig({ caretColor: v })
      })
    ),
    el(
      "div",
      { className: "agy-card" },
      el("div", { className: "agy-card-title" }, isZh ? "组件级字体与字号微调" : "Component Typography Overrides"),
      ...COMPONENT_FONT_TARGETS.map((target) => {
        const cur = config.componentFonts?.[target.id] || {};
        const updateTarget = (patch) => {
          const next = { ...config.componentFonts || {} };
          next[target.id] = { ...next[target.id] || {}, ...patch };
          void store.updateConfig({ componentFonts: next });
        };
        return el(
          "div",
          { className: "agy-row", style: { flexWrap: "wrap" } },
          el("div", { className: "agy-label", style: { minWidth: "88px" } }, isZh ? target.label : target.labelEn),
          el(
            "div",
            { className: "agy-toolbar", style: { flex: "1" } },
            el("input", {
              type: "text",
              className: "agy-input",
              list: "agy-system-font-datalist",
              placeholder: isZh ? "继承全局" : "Inherit global",
              value: cur.family || "",
              onChange: (e) => updateTarget({ family: e.target.value })
            }),
            el("input", {
              type: "number",
              className: "agy-input",
              style: { width: "68px" },
              min: "8",
              max: "48",
              placeholder: "px",
              value: cur.size ? String(cur.size) : "",
              onChange: (e) => updateTarget({ size: e.target.value ? Number(e.target.value) : "" })
            }),
            el("input", {
              type: "number",
              className: "agy-input",
              style: { width: "74px" },
              min: "100",
              max: "900",
              step: "100",
              placeholder: "wt",
              value: cur.weight ? String(cur.weight) : "",
              onChange: (e) => updateTarget({ weight: e.target.value ? Number(e.target.value) : "" })
            })
          )
        );
      })
    ),
    el(
      "div",
      { className: "agy-card" },
      el("div", { className: "agy-card-title" }, isZh ? "文本分级颜色与主题跟随" : "Text Token Colors & Theme Follow"),
      switchControl({
        label: isZh ? "跟随当前壁纸提取主题强调色" : "Follow wallpaper dominant accent color",
        checked: config.themeFollow,
        onChange: (v) => void store.updateConfig({ themeFollow: v })
      }),
      switchControl({
        label: isZh ? "深浅色分别设定文字色" : "Separate light/dark text colors",
        checked: config.themeDarkSeparate,
        onChange: (v) => void store.updateConfig({ themeDarkSeparate: v })
      }),
      ...THEME_COLOR_ROLE_IDS.map((role) => {
        const pair = config.themeColors?.[role] || {};
        const updateRole = (mode, hexVal) => {
          const next = structuredClone(config.themeColors || {});
          next[role] = { light: pair.light || "#111827", dark: pair.dark || "#f8fafc", [mode]: hexVal };
          void store.updateConfig({ themeColors: next });
        };
        return el(
          "div",
          { className: "agy-row" },
          el("div", { className: "agy-label" }, `text.${role}`),
          el(
            "div",
            { className: "agy-color-group" },
            el("span", { className: "agy-desc" }, "L"),
            el("input", {
              type: "color",
              className: "agy-color-input",
              value: pair.light || "#111827",
              onInput: (e) => updateRole("light", e.target.value)
            }),
            config.themeDarkSeparate ? [
              el("span", { className: "agy-desc" }, "D"),
              el("input", {
                type: "color",
                className: "agy-color-input",
                value: pair.dark || "#f8fafc",
                onInput: (e) => updateRole("dark", e.target.value)
              })
            ] : null
          )
        );
      }),
      switchControl({
        label: isZh ? "自定义界面强调色 (发送按钮/链接/标签)" : "Custom UI accent overrides (Send / Links / Tabs)",
        checked: config.uiColorCustom,
        onChange: (v) => void store.updateConfig({ uiColorCustom: v })
      }),
      config.uiColorCustom ? [
        colorControl({ label: "Accent", value: config.accent, onChange: (v) => void store.updateConfig({ accent: v }) }),
        colorControl({ label: isZh ? "发送按钮" : "Send button", value: config.uiColorSend, fallback: config.accent, onChange: (v) => void store.updateConfig({ uiColorSend: v }) }),
        colorControl({ label: isZh ? "链接文字" : "Link color", value: config.uiColorLink, fallback: config.accent, onChange: (v) => void store.updateConfig({ uiColorLink: v }) }),
        colorControl({ label: isZh ? "标签选中线" : "Active tab", value: config.uiColorTab, fallback: config.accent, onChange: (v) => void store.updateConfig({ uiColorTab: v }) })
      ] : null
    )
  );
}

// src/ui/components/RotationGroupEditor.js
function renderRotationGroupEditor(store) {
  const { config, weItems } = store.state;
  const t = store.getT();
  const isZh = t("weTypeVideo") === "视频";
  const groups = config.rotationGroups || [];
  const activeGroup = groups.find((g) => g.id === config.rotationGroupId) || groups[0] || null;
  const createGroup = () => {
    const id = `grp_${Date.now().toString(36)}`;
    const next = [
      ...groups,
      {
        id,
        name: isZh ? `轮播列表 ${groups.length + 1}` : `Playlist ${groups.length + 1}`,
        interval: config.rotationMinutes || 30,
        order: "sequence",
        trigger: "interval",
        wallpaperIds: []
      }
    ];
    void store.updateConfig({ rotationGroups: next, rotationGroupId: id });
  };
  const updateGroup = (patch) => {
    if (!activeGroup) return;
    const next = groups.map((g) => g.id === activeGroup.id ? { ...g, ...patch } : g);
    void store.updateConfig({ rotationGroups: next });
  };
  const deleteGroup = () => {
    if (!activeGroup) return;
    const next = groups.filter((g) => g.id !== activeGroup.id);
    void store.updateConfig({
      rotationGroups: next,
      rotationGroupId: next[0]?.id || "",
      rotationEnabled: next.length ? config.rotationEnabled : false
    });
  };
  return el(
    "div",
    { className: "agy-card" },
    el(
      "div",
      { className: "agy-row-head" },
      el("div", { className: "agy-card-title" }, isZh ? "壁纸定时轮播与分组" : "Rotation Playlists"),
      el(
        "div",
        { className: "agy-toolbar" },
        el("button", {
          type: "button",
          className: "agy-btn",
          onClick: createGroup
        }, isZh ? "+ 新建分组" : "+ New playlist"),
        el("button", {
          type: "button",
          className: "agy-btn",
          disabled: !weItems.length,
          onClick: async () => {
            const res = await callBackend("rotation-advance");
            if (res?.config) {
              store.state.config = res.config;
              store.notify();
            } else {
              store.showToast(isZh ? "没有可切换的壁纸" : "No eligible wallpapers to advance", "warn");
            }
          }
        }, isZh ? "立即切换下一张" : "Next wallpaper")
      )
    ),
    switchControl({
      label: t("rotationEnabled"),
      desc: t("rotationHint"),
      checked: config.rotationEnabled,
      onChange: (v) => void store.updateConfig({ rotationEnabled: v })
    }),
    groups.length > 0 ? el(
      "div",
      { className: "agy-toolbar" },
      el("select", {
        className: "agy-select",
        style: { flex: "1" },
        value: activeGroup?.id || "",
        onChange: (e) => void store.updateConfig({ rotationGroupId: e.target.value })
      }, groups.map((g) => el("option", {
        value: g.id,
        selected: g.id === activeGroup?.id
      }, `${g.name} (${g.wallpaperIds.length})`))),
      el("button", {
        type: "button",
        className: "agy-btn agy-btn-danger",
        onClick: deleteGroup
      }, isZh ? "删除分组" : "Delete")
    ) : null,
    activeGroup ? el(
      "div",
      { style: { display: "flex", flexDirection: "column", gap: "8px" } },
      el(
        "div",
        { className: "agy-row" },
        el("div", { className: "agy-label" }, isZh ? "分组名称" : "Playlist name"),
        el("input", {
          type: "text",
          className: "agy-input",
          value: activeGroup.name,
          onChange: (e) => updateGroup({ name: e.target.value.trim() || activeGroup.name })
        })
      ),
      selectControl({
        label: isZh ? "切换触发器" : "Switch trigger",
        value: activeGroup.trigger,
        options: [
          { value: "interval", label: isZh ? "固定间隔 (分钟)" : "Fixed interval (minutes)" },
          { value: "videoEnd", label: isZh ? "视频播完后切换" : "On video end (or fallback interval)" }
        ],
        onChange: (v) => updateGroup({ trigger: v })
      }),
      selectControl({
        label: isZh ? "轮播顺序" : "Order",
        value: activeGroup.order,
        options: [
          { value: "sequence", label: isZh ? "顺序循环" : "Sequential" },
          { value: "random", label: isZh ? "随机不重复" : "Random" }
        ],
        onChange: (v) => updateGroup({ order: v })
      }),
      el(
        "div",
        { className: "agy-row" },
        el("div", { className: "agy-label" }, t("rotationInterval")),
        el("input", {
          type: "number",
          className: "agy-input",
          style: { width: "96px" },
          min: String(ROTATION_INTERVAL_MIN),
          max: String(ROTATION_INTERVAL_MAX),
          value: String(activeGroup.interval),
          onChange: (e) => {
            const n = Math.min(ROTATION_INTERVAL_MAX, Math.max(ROTATION_INTERVAL_MIN, Math.round(Number(e.target.value) || 30)));
            updateGroup({ interval: n });
          }
        })
      ),
      el("div", { className: "agy-label" }, isZh ? "包含的壁纸（不勾选则按当前库自动轮播）" : "Wallpapers in playlist (leave empty to use library)"),
      el(
        "div",
        { className: "agy-list-box" },
        weItems.length === 0 ? el("div", { className: "agy-desc" }, isZh ? "暂无已扫描壁纸" : "No scanned wallpapers yet") : weItems.map((item) => {
          const checked = activeGroup.wallpaperIds.includes(item.id);
          return el(
            "label",
            { className: "agy-check-item" },
            el("input", {
              type: "checkbox",
              checked,
              onChange: (e) => {
                const set = new Set(activeGroup.wallpaperIds);
                if (e.target.checked) set.add(item.id);
                else set.delete(item.id);
                updateGroup({ wallpaperIds: [...set] });
              }
            }),
            el(
              "span",
              { style: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } },
              `[${item.kind}] ${item.title}`
            )
          );
        })
      )
    ) : el(
      "div",
      { className: "agy-desc" },
      isZh ? "未创建命名分组时，将使用全局“分钟间隔”轮播所有未隐藏壁纸。" : "Without a named playlist, rotation cycles through visible library wallpapers using the interval below."
    ),
    !activeGroup ? el(
      "div",
      { className: "agy-row" },
      el("div", { className: "agy-label" }, `${t("rotationInterval")} (min)`),
      el("input", {
        type: "number",
        className: "agy-input",
        style: { width: "96px" },
        min: String(ROTATION_INTERVAL_MIN),
        max: String(ROTATION_INTERVAL_MAX),
        value: String(config.rotationMinutes || 30),
        onChange: (e) => {
          const n = Math.min(ROTATION_INTERVAL_MAX, Math.max(ROTATION_INTERVAL_MIN, Math.round(Number(e.target.value) || 30)));
          void store.updateConfig({ rotationMinutes: n });
        }
      })
    ) : null
  );
}

// src/ui/panel.js
var TABS = [
  { id: "library", en: "Library", zh: "壁纸库" },
  { id: "appearance", en: "Appearance", zh: "外观与玻璃" },
  { id: "effects", en: "FX & Parallax", zh: "特效与视差" },
  { id: "audio", en: "Audio & Rotation", zh: "音频与轮播" },
  { id: "advanced", en: "Advanced", zh: "高级与系统" },
  { id: "extensions", en: "Extensions", zh: "扩展槽位" },
  { id: "about", en: "About", zh: "关于" }
];
var RESET_KEYS = {
  library: ["wallpaperFit", "sortOrder", "pickerLayout", "orientationFilter", "typeFilter", "contentRatingFilter", "folderFilter"],
  appearance: [
    "wallpaperBlur",
    "maskOcclusion",
    "wallpaperOpacity",
    "backgroundBrightness",
    "backgroundContrast",
    "backgroundSaturate",
    "wallpaperFlip",
    "layerPositionX",
    "layerPositionY",
    "layerScale",
    "wallpaperTransition",
    "wallpaperTransitionDir",
    "wallpaperTransitionSpeed",
    "pictureSlideSeconds",
    "panelGlass",
    "bubbleOpacity",
    "composerFrost",
    "surfaceFrost",
    "glassSaturation",
    "glassBorder",
    "glassHighlight",
    "glassColor",
    "glassDarkSeparate",
    "glassFidelity",
    "chatGlassFidelity",
    "settingsWindowTransparency",
    "settingsWindowBlur",
    "sidebarGlass",
    "sidebarFollowGlobal",
    "sidebarBlur",
    "sidebarAlpha",
    "sidebarColor",
    "leftSidebarGlass",
    "leftSidebarCornerRadius",
    "leftSidebarSquareTL",
    "leftSidebarSquareTR",
    "leftSidebarSquareBR",
    "leftSidebarSquareBL",
    "rightSidebarCornerRadius",
    "rightSidebarSquareTL",
    "rightSidebarSquareTR",
    "rightSidebarSquareBR",
    "rightSidebarSquareBL",
    "titlebarGlass",
    "fontCustom",
    "globalFamily",
    "caretColor",
    "themeFollow"
  ],
  effects: [
    "fxEnabled",
    "fxClick",
    "fxClickStyle",
    "fxClickSize",
    "fxClickGlow",
    "fxTrail",
    "fxTrailStyle",
    "fxTrailLength",
    "fxTrailWidth",
    "fxTrailGlow",
    "fxOpacity",
    "fxBlend",
    "fxColorMode",
    "fxColor",
    "parallaxEnabled",
    "parallaxBg",
    "parallaxUi",
    "parallaxUiChatDepth",
    "parallaxUiComposerDepth",
    "parallaxUiSidebarDepth",
    "parallaxUiBubbleDepth",
    "parallaxSmooth"
  ],
  audio: [
    "wallpaperMode",
    "wallpaperSound",
    "wallpaperVolume",
    "videoPlaybackRate",
    "pauseOnHidden",
    "pauseOnBlur",
    "pauseOnBattery",
    "sceneLive",
    "sceneLiveFps",
    "sceneAutoQuality",
    "sceneRenderDpr",
    "sceneVideoTexScale",
    "liveBootDelay",
    "rotationEnabled",
    "rotationMinutes"
  ],
  advanced: ["browserHoleCutout", "studioShortcut", "uiLanguage"],
  extensions: ["parallaxPlugin", "parallaxPluginDepths"]
};
function slider(store, cfgKey, label, desc = "", extra = {}) {
  const r = PARAM_RANGES[cfgKey];
  return rangeControl({
    label,
    desc,
    min: extra.min ?? r.min,
    max: extra.max ?? r.max,
    step: extra.step ?? (Number.isInteger(r.max) && r.max > 10 ? 1 : 0.1),
    unit: extra.unit ?? r.unit ?? "",
    value: store.state.config[cfgKey],
    onChange: (v) => void store.updateConfig({ [cfgKey]: v }, { defer: true, silent: true }),
    onCommit: (v) => void store.updateConfig({ [cfgKey]: v }, { defer: false })
  });
}
function renderAppearanceTab(store) {
  const { config } = store.state;
  const t = store.getT();
  const isZh = t("weTypeVideo") === "视频";
  const cornerOpts = [
    { value: "native", label: isZh ? "原生圆角" : "Native" },
    { value: "6", label: "6px" },
    { value: "12", label: "12px" },
    { value: "20", label: "20px" }
  ];
  return el(
    "div",
    { style: { display: "flex", flexDirection: "column", gap: "12px" } },
    el(
      "div",
      { className: "agy-card" },
      el("div", { className: "agy-card-title" }, isZh ? "壁纸画面与过场动画" : "Backdrop & Transitions"),
      selectControl({
        label: t("wallpaperFit"),
        value: config.wallpaperFit,
        options: [
          { value: "cover", label: t("wallpaperFitCover") },
          { value: "contain", label: t("wallpaperFitContain") },
          { value: "fill", label: t("wallpaperFitFill") },
          { value: "center", label: isZh ? "居中原始尺寸" : "Center" }
        ],
        onChange: (v) => void store.updateConfig({ wallpaperFit: v })
      }),
      slider(store, "wallpaperOpacity", t("wallpaperOpacity"), t("wallpaperOpacityDesc")),
      slider(store, "wallpaperBlur", t("wallpaperBlur"), t("wallpaperBlurDesc")),
      slider(store, "maskOcclusion", t("maskOcclusion"), t("maskOcclusionDesc")),
      slider(store, "backgroundBrightness", isZh ? "背景亮度" : "Brightness"),
      slider(store, "backgroundContrast", isZh ? "背景对比度" : "Contrast"),
      slider(store, "backgroundSaturate", isZh ? "背景饱和度" : "Saturation"),
      slider(store, "layerScale", isZh ? "画面缩放" : "Layer scale"),
      slider(store, "layerPositionX", isZh ? "水平焦点 X" : "Horizontal focus X"),
      slider(store, "layerPositionY", isZh ? "垂直焦点 Y" : "Vertical focus Y"),
      switchControl({
        label: isZh ? "水平镜像翻转壁纸" : "Flip wallpaper horizontally",
        checked: config.wallpaperFlip,
        onChange: (v) => void store.updateConfig({ wallpaperFlip: v })
      }),
      selectControl({
        label: t("wallpaperTransition"),
        value: config.wallpaperTransition,
        options: TRANSITION_VALUES.map((v) => ({ value: v, label: v })),
        onChange: (v) => void store.updateConfig({ wallpaperTransition: v })
      }),
      selectControl({
        label: isZh ? "过场方向" : "Transition direction",
        value: config.wallpaperTransitionDir,
        options: TRANSITION_DIRECTIONS.map((v) => ({ value: v, label: v })),
        onChange: (v) => void store.updateConfig({ wallpaperTransitionDir: v })
      }),
      selectControl({
        label: isZh ? "过场速度" : "Transition speed",
        value: config.wallpaperTransitionSpeed,
        options: TRANSITION_SPEEDS.map((v) => ({ value: v, label: v })),
        onChange: (v) => void store.updateConfig({ wallpaperTransitionSpeed: v })
      }),
      el(
        "div",
        { className: "agy-row" },
        el("div", { className: "agy-label" }, isZh ? "Picture 多图幻灯片间隔 (秒, 0=使用工程默认)" : "Picture slideshow interval (sec, 0=default)"),
        el("input", {
          type: "number",
          className: "agy-input",
          style: { width: "90px" },
          min: "0",
          max: "3600",
          value: String(config.pictureSlideSeconds || 0),
          onChange: (e) => void store.updateConfig({ pictureSlideSeconds: Math.max(0, Math.min(3600, Number(e.target.value) || 0)) })
        })
      )
    ),
    el(
      "div",
      { className: "agy-card" },
      el("div", { className: "agy-card-title" }, t("sectionGlass")),
      el("div", { className: "agy-card-desc" }, t("sectionGlassDesc")),
      slider(store, "panelGlass", t("panelGlass"), t("panelGlassDesc")),
      slider(store, "bubbleOpacity", t("bubbleOpacity"), t("bubbleOpacityDesc")),
      slider(store, "composerFrost", t("composerFrost"), t("composerFrostDesc")),
      slider(store, "surfaceFrost", t("surfaceFrost"), t("surfaceFrostDesc")),
      slider(store, "glassSaturation", t("glassSaturation"), t("glassSaturationDesc")),
      slider(store, "glassBorder", t("glassBorder"), t("glassBorderDesc")),
      slider(store, "glassFidelity", isZh ? "全局玻璃还原度" : "Global glass fidelity"),
      slider(store, "chatGlassFidelity", isZh ? "对话气泡玻璃还原度" : "Chat bubble fidelity"),
      slider(store, "settingsWindowTransparency", isZh ? "弹窗/设置窗口透明度" : "Modal overlay transparency"),
      slider(store, "settingsWindowBlur", isZh ? "弹窗/设置窗口模糊" : "Modal overlay blur"),
      switchControl({
        label: t("glassHighlight"),
        checked: config.glassHighlight,
        onChange: (v) => void store.updateConfig({ glassHighlight: v })
      }),
      switchControl({
        label: isZh ? "深浅色分别指定玻璃底色" : "Separate light/dark glass tint",
        checked: config.glassDarkSeparate,
        onChange: (v) => void store.updateConfig({ glassDarkSeparate: v })
      }),
      el(
        "div",
        { className: "agy-row" },
        el("div", { className: "agy-label" }, isZh ? "自定义玻璃底色 (#ffffff=跟随主题)" : "Custom glass tint (#ffffff=auto theme)"),
        el(
          "div",
          { className: "agy-color-group" },
          el("input", {
            type: "color",
            className: "agy-color-input",
            value: config.glassColor?.light || "#ffffff",
            onInput: (e) => void store.updateConfig({ glassColor: { ...config.glassColor, light: e.target.value } })
          }),
          config.glassDarkSeparate ? el("input", {
            type: "color",
            className: "agy-color-input",
            value: config.glassColor?.dark || "#ffffff",
            onInput: (e) => void store.updateConfig({ glassColor: { ...config.glassColor, dark: e.target.value } })
          }) : null
        )
      )
    ),
    el(
      "div",
      { className: "agy-card" },
      el("div", { className: "agy-card-title" }, isZh ? "侧边栏与顶栏玻璃形态" : "Sidebar & Titlebar Surface Material"),
      switchControl({ label: isZh ? "启用侧边栏玻璃透视" : "Sidebar liquid glass", checked: config.sidebarGlass, onChange: (v) => void store.updateConfig({ sidebarGlass: v }) }),
      switchControl({ label: isZh ? "左侧边栏应用全局模糊" : "Left sidebar glass", checked: config.leftSidebarGlass, onChange: (v) => void store.updateConfig({ leftSidebarGlass: v }) }),
      switchControl({ label: isZh ? "顶栏与标题区应用全局模糊" : "Titlebar glass", checked: config.titlebarGlass, onChange: (v) => void store.updateConfig({ titlebarGlass: v }) }),
      switchControl({ label: isZh ? "侧栏跟随全局透明度与模糊" : "Sidebars follow global glass settings", checked: config.sidebarFollowGlobal, onChange: (v) => void store.updateConfig({ sidebarFollowGlobal: v }) }),
      !config.sidebarFollowGlobal ? [
        slider(store, "sidebarAlpha", isZh ? "侧栏自定义透明度" : "Sidebar transparency"),
        slider(store, "sidebarBlur", isZh ? "侧栏自定义模糊" : "Sidebar blur"),
        colorControl({ label: isZh ? "侧栏染色" : "Sidebar tint color", value: config.sidebarColor, fallback: "#ffffff", onChange: (v) => void store.updateConfig({ sidebarColor: v }) })
      ] : null,
      selectControl({
        label: isZh ? "左侧边栏圆角" : "Left sidebar radius",
        value: config.leftSidebarCornerRadius,
        options: cornerOpts,
        onChange: (v) => void store.updateConfig({ leftSidebarCornerRadius: v })
      }),
      el(
        "div",
        { className: "agy-chips" },
        ["TL", "TR", "BR", "BL"].map((corner) => {
          const k = `leftSidebarSquare${corner}`;
          return el("button", {
            type: "button",
            className: `agy-chip ${config[k] ? "active" : ""}`,
            onClick: () => void store.updateConfig({ [k]: !config[k] })
          }, `${isZh ? "左方角" : "L-Square"} ${corner}`);
        })
      ),
      selectControl({
        label: isZh ? "右侧面板圆角" : "Right panel radius",
        value: config.rightSidebarCornerRadius,
        options: cornerOpts,
        onChange: (v) => void store.updateConfig({ rightSidebarCornerRadius: v })
      }),
      el(
        "div",
        { className: "agy-chips" },
        ["TL", "TR", "BR", "BL"].map((corner) => {
          const k = `rightSidebarSquare${corner}`;
          return el("button", {
            type: "button",
            className: `agy-chip ${config[k] ? "active" : ""}`,
            onClick: () => void store.updateConfig({ [k]: !config[k] })
          }, `${isZh ? "右方角" : "R-Square"} ${corner}`);
        })
      )
    ),
    renderFontSettingsPanel(store)
  );
}
function renderEffectsTab(store) {
  const { config } = store.state;
  const t = store.getT();
  const isZh = t("weTypeVideo") === "视频";
  return el(
    "div",
    { style: { display: "flex", flexDirection: "column", gap: "12px" } },
    el(
      "div",
      { className: "agy-card" },
      el("div", { className: "agy-card-title" }, t("sectionFx")),
      el("div", { className: "agy-card-desc" }, t("sectionFxDesc")),
      switchControl({ label: t("fxEnabled"), checked: config.fxEnabled, onChange: (v) => void store.updateConfig({ fxEnabled: v }) }),
      switchControl({ label: t("fxClick"), checked: config.fxClick, onChange: (v) => void store.updateConfig({ fxClick: v }) }),
      selectControl({
        label: t("fxClickStyle"),
        value: config.fxClickStyle,
        options: FX_CLICK_STYLES.map((v) => ({ value: v, label: v })),
        onChange: (v) => void store.updateConfig({ fxClickStyle: v })
      }),
      slider(store, "fxClickSize", t("fxClickSize")),
      slider(store, "fxClickGlow", t("fxClickGlow")),
      switchControl({ label: t("fxTrail"), checked: config.fxTrail, onChange: (v) => void store.updateConfig({ fxTrail: v }) }),
      selectControl({
        label: t("fxTrailStyle"),
        value: config.fxTrailStyle,
        options: FX_TRAIL_STYLES.map((v) => ({ value: v, label: v })),
        onChange: (v) => void store.updateConfig({ fxTrailStyle: v })
      }),
      slider(store, "fxTrailLength", t("fxTrailLength")),
      slider(store, "fxTrailWidth", t("fxTrailWidth")),
      slider(store, "fxTrailGlow", t("fxTrailGlow")),
      slider(store, "fxOpacity", t("fxOpacity")),
      selectControl({
        label: t("fxBlend"),
        value: config.fxBlend,
        options: FX_BLEND_VALUES.map((v) => ({ value: v, label: v })),
        onChange: (v) => void store.updateConfig({ fxBlend: v })
      }),
      selectControl({
        label: t("fxColorMode"),
        value: config.fxColorMode,
        options: FX_COLOR_MODES.map((v) => ({ value: v, label: v })),
        onChange: (v) => void store.updateConfig({ fxColorMode: v })
      }),
      config.fxColorMode === "custom" ? colorControl({ label: t("fxColor"), value: config.fxColor, onChange: (v) => void store.updateConfig({ fxColor: v }) }) : null
    ),
    el(
      "div",
      { className: "agy-card" },
      el("div", { className: "agy-card-title" }, t("sectionParallax")),
      el("div", { className: "agy-card-desc" }, t("sectionParallaxDesc")),
      switchControl({ label: t("parallaxEnabled"), checked: config.parallaxEnabled, onChange: (v) => void store.updateConfig({ parallaxEnabled: v }) }),
      slider(store, "parallaxBg", t("parallaxBgDepth")),
      slider(store, "parallaxSmooth", t("parallaxSmooth")),
      switchControl({ label: t("parallaxUi"), checked: config.parallaxUi, onChange: (v) => void store.updateConfig({ parallaxUi: v }) }),
      config.parallaxUi ? [
        slider(store, "parallaxUiChatDepth", t("parallaxUiChat")),
        slider(store, "parallaxUiComposerDepth", t("parallaxUiComposer")),
        slider(store, "parallaxUiSidebarDepth", t("parallaxUiSidebar")),
        slider(store, "parallaxUiBubbleDepth", isZh ? "消息气泡深度" : "Bubble depth")
      ] : null
    )
  );
}
function renderAudioTab(store) {
  const { config } = store.state;
  const t = store.getT();
  const isZh = t("weTypeVideo") === "视频";
  return el(
    "div",
    { style: { display: "flex", flexDirection: "column", gap: "12px" } },
    el(
      "div",
      { className: "agy-card" },
      el("div", { className: "agy-card-title" }, t("sectionPlayback")),
      el("div", { className: "agy-card-desc" }, t("sectionPlaybackDesc")),
      selectControl({
        label: t("wallpaperMode"),
        value: config.wallpaperMode,
        options: [
          { value: "live", label: t("wallpaperModeLive") },
          { value: "frame", label: t("wallpaperModeFrame") }
        ],
        onChange: (v) => void store.updateConfig({ wallpaperMode: v })
      }),
      switchControl({ label: t("wallpaperSound"), checked: config.wallpaperSound, onChange: (v) => void store.updateConfig({ wallpaperSound: v }) }),
      slider(store, "wallpaperVolume", t("wallpaperVolume"), t("wallpaperVolumeDesc")),
      rangeControl({
        label: t("videoPlaybackRate"),
        min: 0.5,
        max: 2,
        step: 0.1,
        unit: "x",
        value: config.videoPlaybackRate,
        onChange: (v) => void store.updateConfig({ videoPlaybackRate: v }, { defer: true, silent: true }),
        onCommit: (v) => void store.updateConfig({ videoPlaybackRate: v })
      }),
      switchControl({ label: t("pauseOnHidden"), checked: config.pauseOnHidden, onChange: (v) => void store.updateConfig({ pauseOnHidden: v }) }),
      switchControl({ label: t("pauseOnBlur"), checked: config.pauseOnBlur, onChange: (v) => void store.updateConfig({ pauseOnBlur: v }) }),
      switchControl({ label: t("pauseOnBattery"), checked: config.pauseOnBattery, onChange: (v) => void store.updateConfig({ pauseOnBattery: v }) })
    ),
    el(
      "div",
      { className: "agy-card" },
      el("div", { className: "agy-card-title" }, isZh ? "WebWallGL 场景引擎性能" : "WebWallGL Scene Engine"),
      switchControl({ label: t("sceneLive"), desc: t("sceneLiveDesc"), checked: config.sceneLive, onChange: (v) => void store.updateConfig({ sceneLive: v }) }),
      selectControl({
        label: t("sceneLiveFps"),
        value: String(config.sceneLiveFps),
        options: [15, 30, 60].map((n) => ({ value: String(n), label: `${n} FPS` })),
        onChange: (v) => void store.updateConfig({ sceneLiveFps: Number(v) })
      }),
      switchControl({ label: t("sceneAutoQuality"), desc: t("sceneAutoQualityDesc"), checked: config.sceneAutoQuality, onChange: (v) => void store.updateConfig({ sceneAutoQuality: v }) }),
      selectControl({
        label: t("sceneRenderDpr"),
        value: String(config.sceneRenderDpr),
        options: [
          { value: "0", label: t("sceneRenderDprAuto") },
          { value: "1", label: "1.0x" },
          { value: "1.5", label: "1.5x" },
          { value: "2", label: "2.0x" }
        ],
        onChange: (v) => void store.updateConfig({ sceneRenderDpr: Number(v) })
      }),
      selectControl({
        label: t("sceneVideoTexScale"),
        value: String(config.sceneVideoTexScale),
        options: [
          { value: "0", label: t("sceneVideoTexScaleAuto") },
          { value: "0.5", label: t("sceneVideoTexScaleHalf") },
          { value: "1", label: t("sceneVideoTexScaleFull") }
        ],
        onChange: (v) => void store.updateConfig({ sceneVideoTexScale: Number(v) })
      }),
      rangeControl({
        label: isZh ? "冷启动延迟加载动态壁纸 (秒)" : "Cold-start live boot delay (sec)",
        min: 0,
        max: 30,
        step: 1,
        unit: "s",
        value: config.liveBootDelay,
        onCommit: (v) => void store.updateConfig({ liveBootDelay: v })
      })
    ),
    renderRotationGroupEditor(store)
  );
}
function renderAdvancedTab(store) {
  const { config, cdp, diagnostics } = store.state;
  const t = store.getT();
  const isZh = t("weTypeVideo") === "视频";
  const cdpState = cdp?.state || "unknown";
  const isOk = cdpState === "attached" || cdpState === "ready" || cdpState === "ok";
  return el(
    "div",
    { style: { display: "flex", flexDirection: "column", gap: "12px" } },
    el(
      "div",
      { className: "agy-card" },
      el("div", { className: "agy-card-title" }, isZh ? "Antigravity 原生融合特性" : "Antigravity Native Integrations"),
      switchControl({
        label: t("browserHoleCutout"),
        desc: t("browserHoleCutoutDesc"),
        checked: config.browserHoleCutout,
        onChange: (v) => void store.updateConfig({ browserHoleCutout: v })
      }),
      switchControl({
        label: t("studioShortcut"),
        desc: t("studioShortcutDesc"),
        checked: config.studioShortcut,
        onChange: (v) => void store.updateConfig({ studioShortcut: v })
      }),
      selectControl({
        label: isZh ? "界面语言" : "UI Language",
        value: config.uiLanguage || "auto",
        options: [
          { value: "auto", label: isZh ? "跟随系统" : "Auto" },
          { value: "zh", label: "简体中文" },
          { value: "en", label: "English" }
        ],
        onChange: (v) => void store.updateConfig({ uiLanguage: v })
      })
    ),
    el(
      "div",
      { className: "agy-card" },
      el(
        "div",
        { className: "agy-row-head" },
        el("div", { className: "agy-card-title" }, t("cdpHealthTitle")),
        el(
          "span",
          { className: `agy-status-pill ${isOk ? "ok" : "warn"}` },
          isOk ? t("cdpStatusOk") : cdpState === "missing" ? t("cdpStatusMissing") : `${cdpState}`
        )
      ),
      el(
        "div",
        { className: "agy-desc" },
        `${isZh ? "CDP 端口" : "Port"}: ${cdp?.port || "n/a"} · ${isZh ? "已注入目标" : "Targets"}: ${cdp?.targets ?? 0} · ${isZh ? "快捷方式" : "Shortcuts"}: ${cdp?.shortcutState || "unknown"}`
      ),
      el(
        "div",
        { className: "agy-toolbar" },
        el("button", {
          type: "button",
          className: "agy-btn",
          onClick: async () => {
            const d = await callBackend("get-state");
            if (d?.cdp) store.state.cdp = d.cdp;
            store.notify();
          }
        }, isZh ? "刷新 CDP 状态" : "Refresh Status"),
        el("button", {
          type: "button",
          className: "agy-btn agy-btn-primary",
          onClick: async () => {
            const res = await callBackend("fix-cdp-shortcut");
            store.showToast(
              res?.ok ? isZh ? `已检查 ${res.total || 0} 个快捷方式，更新 ${res.updated || 0} 个` : `Checked ${res.total || 0} shortcuts, updated ${res.updated || 0}` : isZh ? `未能完成快捷方式更新 (${res?.reason || "error"})` : `Shortcut update failed (${res?.reason || "error"})`,
              res?.ok ? "info" : "warn"
            );
            const d = await callBackend("get-state");
            if (d?.cdp) store.state.cdp = d.cdp;
            store.notify();
          }
        }, t("cdpFixShortcuts"))
      )
    ),
    el(
      "div",
      { className: "agy-card" },
      el("div", { className: "agy-card-title" }, t("sectionSystem")),
      el("div", { className: "agy-card-desc" }, t("sectionSystemDesc")),
      el(
        "div",
        { className: "agy-toolbar" },
        el("button", {
          type: "button",
          className: "agy-btn",
          onClick: () => {
            const blob = new Blob([JSON.stringify(config, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `agy-skins-preset-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.json`;
            a.click();
            setTimeout(() => URL.revokeObjectURL(url), 1e3);
            store.showToast(t("presetExported"));
          }
        }, t("exportPreset")),
        el(
          "label",
          { className: "agy-btn", style: { display: "inline-flex", alignItems: "center" } },
          t("importPreset"),
          el("input", {
            type: "file",
            accept: "application/json",
            style: { display: "none" },
            onChange: async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              try {
                const parsed = JSON.parse(await file.text());
                if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("invalid");
                const normalized = normalizeConfig(parsed);
                await store.updateConfig(normalized);
                store.showToast(t("presetImported"));
              } catch {
                store.showToast(t("presetInvalid"), "warn");
              }
              e.target.value = "";
            }
          })
        ),
        el("button", {
          type: "button",
          className: "agy-btn",
          onClick: async () => {
            store.state.diagnostics = await callBackend("diagnostics");
            store.notify();
          }
        }, isZh ? "运行诊断" : "Run Diagnostics"),
        el("button", {
          type: "button",
          className: "agy-btn agy-btn-danger",
          onClick: async () => {
            const res = await callBackend("cache-clear", { scope: "scene" });
            store.showToast(res?.ok ? isZh ? `已清理 ${res.removed || 0} 个场景缓存` : `Cleared ${res.removed || 0} scene cache files` : "Error");
            store.state.diagnostics = await callBackend("diagnostics");
            store.notify();
          }
        }, isZh ? "清理场景缓存" : "Clear Scene Cache")
      ),
      diagnostics ? el(
        "div",
        { className: "agy-log-pre" },
        [
          `Version: ${diagnostics.version} · Node: ${diagnostics.node} · OS: ${diagnostics.platform}`,
          `WebWallGL: ${diagnostics.webwallgl ? "OK" : "Missing"} · Media Origin: ${diagnostics.mediaOrigin}`,
          `Uploads: ${Math.round((diagnostics.sizes?.uploads || 0) / 1024)} KB · Scene Cache: ${Math.round((diagnostics.sizes?.sceneCache || 0) / 1024)} KB`,
          `Data Dir: ${diagnostics.paths?.data}`,
          ...diagnostics.logs?.flatMap((l) => [`--- ${l.name} ---`, l.tail]) || []
        ].join("\n")
      ) : null
    )
  );
}
function renderExtensionsTab(store) {
  const { config } = store.state;
  const isZh = store.getT()("weTypeVideo") === "视频";
  const entries = Object.entries(config.parallaxPluginDepths || {});
  let draftSlot = "";
  return el(
    "div",
    { className: "agy-card" },
    el("div", { className: "agy-card-title" }, isZh ? "扩展槽位视差 ([data-slot])" : "Extension Slot Parallax ([data-slot])"),
    el("div", { className: "agy-card-desc" }, isZh ? "为 Antigravity 内其他扩展注册的 [data-slot] 元素配置独立 3D 视差深度。" : "Configure per-slot 3D parallax depth for elements carrying [data-slot] in the Antigravity UI."),
    switchControl({
      label: isZh ? "启用扩展槽位视差" : "Enable extension slot parallax",
      checked: config.parallaxPlugin,
      onChange: (v) => void store.updateConfig({ parallaxPlugin: v })
    }),
    el(
      "div",
      { className: "agy-toolbar" },
      el("input", {
        type: "text",
        className: "agy-input",
        placeholder: isZh ? "输入 slot 名称，例如 right-panel" : "Slot name (e.g. right-panel)",
        onInput: (e) => {
          draftSlot = e.target.value;
        }
      }),
      el("button", {
        type: "button",
        className: "agy-btn",
        onClick: () => {
          const name = draftSlot.trim();
          if (!name) return;
          const next = { ...config.parallaxPluginDepths || {}, [name]: 3 };
          void store.updateConfig({ parallaxPluginDepths: next });
        }
      }, isZh ? "添加槽位" : "Add Slot")
    ),
    entries.length === 0 ? el("div", { className: "agy-desc" }, isZh ? "暂未添加自定义槽位。" : "No custom slots configured yet.") : entries.map(([slot, depth]) => rangeControl({
      label: `[data-slot="${slot}"]`,
      min: 0,
      max: 10,
      step: 0.2,
      unit: "%",
      value: depth,
      onCommit: (v) => {
        const next = { ...config.parallaxPluginDepths || {}, [slot]: v };
        void store.updateConfig({ parallaxPluginDepths: next });
      }
    }))
  );
}
function renderAboutTab(store) {
  const isZh = store.getT()("weTypeVideo") === "视频";
  return el(
    "div",
    { className: "agy-card" },
    el("div", { className: "agy-card-title" }, "Antigravity Wallpaper Engine (agy-skins)"),
    el(
      "div",
      { className: "agy-desc" },
      isZh ? "融合 hermes-skins v2.0.0 完整壁纸与液态玻璃架构及 Antigravity 原生工程能力：WebWallGL 3.0.1 零入侵 Scene/Web 引擎、HMAC-SHA256 签名本地媒体服务（HTTP 206 Range）、单规则 CSSOM 液态玻璃、分屏浏览器 evenodd 挖孔与 TitleBarOverlay 同步。" : "Full-featured Wallpaper Engine & Liquid Glass plugin for Google Antigravity: WebWallGL 3.0.1 zero-intrusion Scene/Web renderer, HMAC-SHA256 signed HTTP 206 loopback media server, single-rule CSSOM glass material, evenodd split-browser hole cutout, and Windows/Linux TitleBarOverlay sync."
    ),
    el("div", { className: "agy-log-pre" }, [
      "Project: https://github.com/CaptainMusX/agy-skins",
      "Architecture inspirations:",
      "  - CaptainMusX/hermes-skins (MIT)",
      "  - dsh-wallpaper-engine / WebWallGL 3.0.1 (MIT)",
      "  - nimosocute/antigravity-wallpaper-engine-theme (even/odd browser hole & host hooks)"
    ].join("\n"))
  );
}
function mountPanel() {
  const root = document.getElementById("agy-skins-root");
  if (!root) return;
  const store = createPanelStore();
  const render = () => {
    const t = store.getT();
    const isZh = t("weTypeVideo") === "视频";
    const cfg = store.state.config;
    if (!cfg) {
      root.replaceChildren(el("div", { style: { padding: "24px", opacity: "0.7" } }, "Loading Antigravity Wallpaper Engine…"));
      return;
    }
    const bodyNode = {
      library: () => renderWallpaperEnginePanel(store),
      appearance: () => renderAppearanceTab(store),
      effects: () => renderEffectsTab(store),
      audio: () => renderAudioTab(store),
      advanced: () => renderAdvancedTab(store),
      extensions: () => renderExtensionsTab(store),
      about: () => renderAboutTab(store)
    }[store.state.tab]?.();
    const resetCurrentTab = () => {
      const keys = RESET_KEYS[store.state.tab];
      if (!keys?.length) return;
      const patch = {};
      for (const k of keys) patch[k] = structuredClone(DEFAULT_CONFIG[k]);
      void store.updateConfig(patch);
      store.showToast(isZh ? "已恢复当前分页默认设置" : "Current tab reset to defaults");
    };
    root.replaceChildren(
      el(
        "div",
        { className: "agy-shell" },
        el(
          "div",
          { className: "agy-header" },
          el(
            "div",
            { className: "agy-brand" },
            el(
              "div",
              null,
              el("div", { className: "agy-brand-title" }, t("pluginName")),
              el("div", { className: "agy-brand-sub" }, t("pluginDesc"))
            )
          ),
          el(
            "div",
            { className: "agy-header-actions" },
            el(
              "span",
              { className: "agy-status-pill " + (cfg.wallpaperEnabled ? "ok" : "") },
              cfg.wallpaperEnabled ? `${cfg.wallpaperType?.toUpperCase() || "ACTIVE"}` : isZh ? "未启用" : "Off"
            )
          )
        ),
        el(
          "div",
          { className: "agy-tabs" },
          TABS.map((tab) => el("button", {
            type: "button",
            className: `agy-tab ${store.state.tab === tab.id ? "active" : ""}`,
            onClick: () => {
              store.state.tab = tab.id;
              store.notify();
            }
          }, isZh ? tab.zh : tab.en))
        ),
        el("div", { className: "agy-body" }, bodyNode),
        el(
          "div",
          { className: "agy-footer" },
          el("div", { className: "agy-toast" }, store.state.toast?.message || ""),
          RESET_KEYS[store.state.tab] ? el("button", {
            type: "button",
            className: "agy-btn",
            onClick: resetCurrentTab
          }, isZh ? "重置本页设置" : "Reset Tab") : null
        )
      )
    );
  };
  store.subscribe(render);
  render();
  void store.loadInitial();
}
if (typeof document !== "undefined") {
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mountPanel, { once: true });
  else mountPanel();
}
export {
  mountPanel
};
