// src/shared/glass-presets.js
var GLASS_COLOR_PRESETS = [
  "#ffffff",
  "#0d1524",
  "#1e293b",
  "#e0f2fe",
  "#dbeafe",
  "#ede9fe",
  "#fce7f3",
  "#dcfce7",
  "#fef3c7"
];
var ACCENT_PRESETS = [
  "#4f8cff",
  "#0a84ff",
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#ef4444",
  "#f59e0b",
  "#10b981",
  "#06b6d4"
];
var CARET_COLOR_PRESETS = [
  "#4f8cff",
  "#ffffff",
  "#0a0a0c",
  "#22c55e",
  "#f59e0b",
  "#ec4899",
  "#38bdf8"
];
var HEX_RE = /^#([0-9a-f]{6})$/i;
function parseHexRgb(hex) {
  const m = typeof hex === "string" ? hex.trim().match(HEX_RE) : null;
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return [n >> 16 & 255, n >> 8 & 255, n & 255];
}
function relativeLuminance(rgb) {
  const [r, g, b] = rgb.map((v) => {
    const s = Math.min(255, Math.max(0, v)) / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contrastRatio(rgbA, rgbB) {
  const lA = relativeLuminance(rgbA);
  const lB = relativeLuminance(rgbB);
  const hi = Math.max(lA, lB);
  const lo = Math.min(lA, lB);
  return (hi + 0.05) / (lo + 0.05);
}
function weAccentInk(hex) {
  const rgb = parseHexRgb(hex) || [79, 140, 255];
  return contrastRatio(rgb, [10, 10, 12]) >= contrastRatio(rgb, [255, 255, 255]) ? "#0a0a0c" : "#ffffff";
}
var GLASS_PRESET_KEYS = [
  "glassEnabled",
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
  "settingsMaskStrength",
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
  "sidebarFullClear",
  "titlebarGlass",
  "thinkingMode",
  "floaterSolidBase",
  "maskOcclusion",
  "accent",
  "uiColorCustom",
  "glassMode",
  "leftSidebarTransparency",
  "leftSidebarBlur",
  "titlebarTransparency",
  "titlebarBlur",
  "sidebarContentAlpha",
  "sidebarContentColor",
  "conversationColor",
  "settingsWindowColor"
];
var FACTORY_GLASS_PRESETS = [
  {
    id: "factory-default",
    origin: "builtin",
    nameZh: "默认晶透",
    nameEn: "Crystal Default",
    values: {
      glassEnabled: true,
      panelGlass: 72,
      bubbleOpacity: 62,
      composerFrost: 22,
      surfaceFrost: 18,
      glassSaturation: 175,
      glassBorder: 32,
      glassHighlight: true,
      glassColor: { light: "#ffffff", dark: "#0d1524" },
      glassDarkSeparate: true,
      glassFidelity: 100,
      chatGlassFidelity: 100,
      settingsWindowTransparency: 24,
      settingsWindowBlur: 24,
      settingsMaskStrength: 80,
      sidebarGlass: true,
      sidebarFollowGlobal: true,
      leftSidebarGlass: true,
      sidebarFullClear: false,
      titlebarGlass: false,
      thinkingMode: "glass",
      floaterSolidBase: true,
      maskOcclusion: 12
    }
  },
  {
    id: "factory-frosted",
    origin: "builtin",
    nameZh: "重磨砂",
    nameEn: "Heavy Frosted",
    values: {
      glassEnabled: true,
      panelGlass: 56,
      bubbleOpacity: 72,
      composerFrost: 40,
      surfaceFrost: 36,
      glassSaturation: 185,
      glassBorder: 40,
      glassHighlight: true,
      glassColor: { light: "#ffffff", dark: "#101827" },
      glassDarkSeparate: true,
      glassFidelity: 100,
      chatGlassFidelity: 100,
      settingsWindowTransparency: 18,
      settingsWindowBlur: 36,
      settingsMaskStrength: 85,
      sidebarGlass: true,
      sidebarFollowGlobal: true,
      leftSidebarGlass: true,
      sidebarFullClear: false,
      titlebarGlass: true,
      thinkingMode: "glass",
      floaterSolidBase: true,
      maskOcclusion: 16
    }
  },
  {
    id: "factory-readable",
    origin: "builtin",
    nameZh: "可读优先",
    nameEn: "High Readability",
    values: {
      glassEnabled: true,
      panelGlass: 38,
      bubbleOpacity: 82,
      composerFrost: 30,
      surfaceFrost: 28,
      glassSaturation: 160,
      glassBorder: 38,
      glassHighlight: true,
      glassColor: { light: "#ffffff", dark: "#0d1524" },
      glassDarkSeparate: true,
      glassFidelity: 100,
      chatGlassFidelity: 100,
      settingsWindowTransparency: 12,
      settingsWindowBlur: 28,
      settingsMaskStrength: 90,
      sidebarGlass: true,
      sidebarFollowGlobal: true,
      leftSidebarGlass: true,
      sidebarFullClear: false,
      titlebarGlass: true,
      thinkingMode: "native",
      floaterSolidBase: true,
      maskOcclusion: 22
    }
  },
  {
    id: "factory-airy",
    origin: "builtin",
    nameZh: "极简通透",
    nameEn: "Ultra Airy",
    values: {
      glassEnabled: true,
      panelGlass: 84,
      bubbleOpacity: 45,
      composerFrost: 18,
      surfaceFrost: 14,
      glassSaturation: 170,
      glassBorder: 22,
      glassHighlight: true,
      glassColor: { light: "#ffffff", dark: "#0d1524" },
      glassDarkSeparate: true,
      glassFidelity: 72,
      chatGlassFidelity: 78,
      settingsWindowTransparency: 32,
      settingsWindowBlur: 20,
      settingsMaskStrength: 65,
      sidebarGlass: true,
      sidebarFollowGlobal: true,
      leftSidebarGlass: false,
      sidebarFullClear: true,
      titlebarGlass: false,
      thinkingMode: "off",
      floaterSolidBase: true,
      maskOcclusion: 8
    }
  },
  {
    id: "factory-ocean",
    origin: "builtin",
    nameZh: "深海冰蓝",
    nameEn: "Ocean Ice",
    values: {
      glassEnabled: true,
      panelGlass: 68,
      bubbleOpacity: 64,
      composerFrost: 26,
      surfaceFrost: 22,
      glassSaturation: 180,
      glassBorder: 36,
      glassHighlight: true,
      glassColor: { light: "#eef5ff", dark: "#0c192c" },
      glassDarkSeparate: true,
      glassFidelity: 95,
      chatGlassFidelity: 95,
      settingsWindowTransparency: 22,
      settingsWindowBlur: 26,
      settingsMaskStrength: 80,
      sidebarGlass: true,
      sidebarFollowGlobal: true,
      leftSidebarGlass: true,
      sidebarFullClear: false,
      titlebarGlass: false,
      thinkingMode: "glass",
      floaterSolidBase: true,
      accent: "#4f8cff",
      maskOcclusion: 12
    }
  }
];
function extractGlassPresetValues(config = {}) {
  const out = {};
  for (const key of GLASS_PRESET_KEYS) {
    if (config[key] !== void 0) {
      out[key] = structuredClone(config[key]);
    }
  }
  return out;
}
var PRESET_ID_RE = /^[A-Za-z0-9_-]{1,64}$/;
function sanitizeUserPresets(list) {
  if (!Array.isArray(list)) return [];
  const out = [];
  for (const raw of list) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) continue;
    const id = typeof raw.id === "string" && PRESET_ID_RE.test(raw.id) ? raw.id : "";
    if (!id || id.startsWith("factory-") || out.some((p) => p.id === id)) continue;
    const name = typeof raw.name === "string" && raw.name.trim() ? raw.name.trim().slice(0, 60) : "自定义预设";
    const vals = raw.values && typeof raw.values === "object" && !Array.isArray(raw.values) ? raw.values : {};
    out.push({
      id,
      name,
      origin: "user",
      values: extractGlassPresetValues(vals)
    });
    if (out.length >= 8) break;
  }
  return out;
}

// src/shared/config.js
var ROTATION_INTERVAL_MIN = 1;
var ROTATION_INTERVAL_MAX = 1440;
var WALLPAPER_TYPES = ["video", "web", "image", "scene"];
var CONTENT_RATINGS = ["everyone", "pg13", "mature", "unrated"];
var ORIENTATION_FILTERS = ["all", "landscape", "portrait"];
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
  schemaVersion: 8,
  wallpaperEnabled: false,
  wallpaperPaused: false,
  startPaused: false,
  wallpaperType: "image",
  wallpaperMode: "live",
  wallpaperFit: "cover",
  wallpaperSource: "",
  wallpaperBlur: 0,
  maskOcclusion: 12,
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
  glassEnabled: true,
  panelGlass: 72,
  bubbleOpacity: 62,
  composerFrost: 22,
  surfaceFrost: 18,
  glassSaturation: 175,
  glassBorder: 32,
  glassHighlight: true,
  glassColor: { light: "#ffffff", dark: "#0d1524" },
  glassDarkSeparate: true,
  glassFidelity: 100,
  chatGlassFidelity: 100,
  settingsWindowTransparency: 24,
  settingsWindowBlur: 24,
  settingsMaskStrength: 80,
  sidebarGlass: true,
  sidebarFollowGlobal: true,
  sidebarBlur: 18,
  sidebarAlpha: 72,
  sidebarColor: "#ffffff",
  sidebarFullClear: false,
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
  titlebarGlass: false,
  thinkingMode: "glass",
  floaterSolidBase: true,
  glassMode: {
    leftSidebar: "inherit",
    titlebar: "inherit",
    sidebar: "inherit",
    sidebarContent: "inherit",
    settingsWindow: "inherit",
    conversation: "inherit",
    floaters: "inherit"
  },
  leftSidebarTransparency: 72,
  leftSidebarBlur: 18,
  titlebarTransparency: 72,
  titlebarBlur: 18,
  sidebarContentAlpha: 20,
  sidebarContentColor: "",
  conversationColor: "",
  settingsWindowColor: "",
  activePresetId: "factory-default",
  userPresets: [],
  browserHoleCutout: true,
  studioShortcut: true,
  uiLanguage: "zh",
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
  composerFrost: { min: 0, max: 60, unit: "px" },
  surfaceFrost: { min: 0, max: 60, unit: "px" },
  wallpaperVolume: { min: 0, max: 100, unit: "%" },
  glassSaturation: { min: 100, max: 220, unit: "%" },
  glassBorder: { min: 0, max: 90, unit: "%" },
  glassFidelity: { min: 0, max: 100, unit: "%" },
  chatGlassFidelity: { min: 0, max: 100, unit: "%" },
  settingsWindowTransparency: { min: 0, max: 100, unit: "%" },
  settingsWindowBlur: { min: 0, max: 60, unit: "px" },
  settingsMaskStrength: { min: 0, max: 100, unit: "%" },
  sidebarBlur: { min: 0, max: 60, unit: "px" },
  sidebarAlpha: { min: 0, max: 100, unit: "%" },
  leftSidebarTransparency: { min: 0, max: 100, unit: "%" },
  leftSidebarBlur: { min: 0, max: 60, unit: "px" },
  titlebarTransparency: { min: 0, max: 100, unit: "%" },
  titlebarBlur: { min: 0, max: 60, unit: "px" },
  sidebarContentAlpha: { min: 0, max: 100, unit: "%" },
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
var RESET_MODULES = {
  transition: ["wallpaperTransition", "wallpaperTransitionDir", "wallpaperTransitionSpeed"],
  rotation: ["rotationEnabled", "rotationMinutes", "pictureSlideSeconds"],
  theme: ["themeFollow"],
  detail: ["glassBorder", "glassHighlight"],
  glass: [
    "glassEnabled",
    "panelGlass",
    "bubbleOpacity",
    "composerFrost",
    "surfaceFrost",
    "glassSaturation",
    "glassColor",
    "glassDarkSeparate",
    "glassFidelity",
    "chatGlassFidelity",
    "settingsWindowTransparency",
    "settingsWindowBlur",
    "settingsMaskStrength",
    "sidebarGlass",
    "sidebarFollowGlobal",
    "sidebarBlur",
    "sidebarAlpha",
    "sidebarColor",
    "sidebarFullClear",
    "leftSidebarGlass",
    "titlebarGlass",
    "thinkingMode",
    "floaterSolidBase",
    "glassMode",
    "leftSidebarTransparency",
    "leftSidebarBlur",
    "titlebarTransparency",
    "titlebarBlur",
    "sidebarContentAlpha",
    "sidebarContentColor",
    "conversationColor",
    "settingsWindowColor",
    "activePresetId"
  ],
  corners: [
    "leftSidebarCornerRadius",
    "leftSidebarSquareTL",
    "leftSidebarSquareTR",
    "leftSidebarSquareBR",
    "leftSidebarSquareBL",
    "rightSidebarCornerRadius",
    "rightSidebarSquareTL",
    "rightSidebarSquareTR",
    "rightSidebarSquareBR",
    "rightSidebarSquareBL"
  ],
  uiColor: [
    "accent",
    "uiColorCustom",
    "uiColorSend",
    "uiColorLink",
    "uiColorFileIcon",
    "uiColorTab",
    "uiColorDeepDiving",
    "caretColor"
  ],
  font: [
    "fontCustom",
    "fontSets",
    "fontSetId",
    "themeColors",
    "themeDarkSeparate",
    "themeSize",
    "themeWeight",
    "themeFamily",
    "globalFamily",
    "componentFonts"
  ],
  effectsPicture: [
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
    "wallpaperFit"
  ],
  effectsLive: [
    "wallpaperMode",
    "videoPlaybackRate",
    "sceneLive",
    "sceneLiveFps",
    "sceneAutoQuality",
    "sceneRenderDpr",
    "sceneVideoTexScale",
    "liveBootDelay"
  ],
  audio: ["wallpaperSound", "wallpaperVolume"],
  fx: [
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
    "fxColor"
  ],
  parallax: [
    "parallaxEnabled",
    "parallaxBg",
    "parallaxUi",
    "parallaxPlugin",
    "parallaxUiChatDepth",
    "parallaxUiComposerDepth",
    "parallaxUiSidebarDepth",
    "parallaxUiBubbleDepth",
    "parallaxPluginDepths",
    "parallaxSmooth"
  ],
  system: ["pickerLayout", "browserHoleCutout", "studioShortcut", "uiLanguage", "pauseOnHidden", "pauseOnBlur", "pauseOnBattery", "startPaused"]
};
var TAB_RESET_KEYS = {
  library: ["wallpaperFit", "sortOrder", "orientationFilter", "typeFilter", "contentRatingFilter", "folderFilter", ...RESET_MODULES.transition, ...RESET_MODULES.rotation],
  appearance: [...RESET_MODULES.theme, ...RESET_MODULES.detail, ...RESET_MODULES.glass, ...RESET_MODULES.corners, ...RESET_MODULES.uiColor, ...RESET_MODULES.font],
  effects: [...RESET_MODULES.effectsPicture, ...RESET_MODULES.effectsLive],
  audio: [...RESET_MODULES.audio],
  advanced: [...RESET_MODULES.system],
  extensions: [...RESET_MODULES.fx, ...RESET_MODULES.parallax]
};

// src/ui/we-picker-css.js
var WE_PICKER_CSS = `
.we-picker {
  --we-accent: var(--we-accent-src, #4f8cff);
  --we-accent-ink: var(--we-accent-ink, #ffffff);
  --we-ui-h: 30px;
  --we-ui-radius: 8px;
  --we-ink: var(--foreground, #0f172a);
  --we-ink-2: var(--secondary-foreground, rgba(100, 110, 125, 0.92));
  --we-ink-3: var(--muted-foreground, rgba(120, 128, 140, 0.72));
  --we-border-line: rgba(var(--we-border-rgb, 140, 148, 160), var(--we-border-alpha, 0.28));
  --we-hover-bg: rgba(128, 128, 128, 0.12);
  --we-ease: cubic-bezier(0.16, 1, 0.3, 1);
  --we-dur-fast: 120ms;
  --we-dur: 200ms;
  display: flex;
  flex-direction: column;
  gap: 12px;
  color: var(--we-ink);
  font-size: 13px;
  line-height: 1.45;
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
}
.we-picker *, .we-picker *::before, .we-picker *::after {
  box-sizing: border-box;
}

/* Header Card */
.we-picker__card-shell { display: block; }
.we-picker__card-head {
  display: flex;
  align-items: baseline;
  gap: 8px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--we-border-line);
}
.we-picker__card-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--we-ink);
  white-space: nowrap;
}
.we-picker__card-badge {
  font-size: 11px;
  font-weight: 500;
  color: var(--we-ink-2);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.we-picker__card-desc {
  margin-left: auto;
  font-size: 12px;
  color: var(--we-ink-3);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Sliding Segmented Tabs (.we-tabs + .we-tabs__pill) */
.we-tabs {
  position: relative;
  display: flex;
  flex: 0 0 auto;
  padding: 3px;
  border-radius: 10px;
  background: var(--we-layer-1, rgba(128, 128, 128, 0.10));
  border: 1px solid var(--we-border-line);
  overflow: hidden;
}
.we-tabs__pill {
  position: absolute;
  top: 3px;
  left: 3px;
  bottom: 3px;
  border-radius: 8px;
  background: var(--we-layer-3, rgba(255, 255, 255, 0.22));
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.14), inset 0 1px 0 rgba(255, 255, 255, 0.22);
  transition: transform 220ms var(--we-ease), width 220ms var(--we-ease);
  will-change: transform;
  pointer-events: none;
}
.we-tabs__tab {
  position: relative;
  z-index: 1;
  flex: 1 1 0;
  min-width: 0;
  height: 28px;
  padding: 0 4px;
  border: 0;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  white-space: nowrap;
  font: inherit;
  font-size: 12px;
  line-height: 1;
  color: var(--we-ink-2);
  transition: color var(--we-dur-fast) var(--we-ease), transform var(--we-dur-fast) var(--we-ease);
}
.we-tabs__tab:hover { color: var(--we-ink); }
.we-tabs__tab--active { color: var(--we-ink); font-weight: 600; }
.we-tabs__tab:active, .we-picker__btn:active, .we-picker__rate:active { transform: scale(0.96); }

.we-tabpanel {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
  animation: we-tab-in 180ms var(--we-ease);
}
@keyframes we-tab-in {
  from { opacity: 0; transform: translateY(4px); }
}

/* Sections & Collapsible Headers */
.we-picker__section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.we-picker__section + .we-picker__section {
  border-top: 1px solid var(--we-border-line);
  padding-top: 12px;
}
.we-picker__section-head {
  display: flex;
  align-items: center;
  gap: 8px;
}
.we-picker__section-head--toggle {
  cursor: pointer;
  user-select: none;
  border-radius: 6px;
  padding: 2px 4px;
  transition: background-color 0.15s ease;
}
.we-picker__section-head--toggle:hover {
  background: var(--we-hover-bg);
}
.we-picker__section-label {
  font-size: 1.06em;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: var(--we-ink-2);
}
.we-picker__section-caret {
  margin-left: auto;
  font-size: 0.78em;
  color: var(--we-ink-2);
  transition: transform 0.15s ease;
}
.we-picker__section-caret.is-open {
  transform: rotate(180deg);
}

/* Module-level Reset Button (↺) */
.we-mod-reset {
  margin-left: auto;
  flex: 0 0 auto;
  width: 24px;
  height: 24px;
  padding: 0;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1em;
  cursor: pointer;
  border-radius: 999px;
  border: 1px solid var(--we-border-line);
  background: transparent;
  color: var(--we-ink-2);
  transition: color var(--we-dur-fast) ease, border-color var(--we-dur-fast) ease, background-color var(--we-dur-fast) ease;
}
.we-picker__section-caret + .we-mod-reset {
  margin-left: 8px;
}
.we-mod-reset:hover {
  color: var(--we-ink);
  background: var(--we-hover-bg);
}

/* Current Wallpaper Card & Spinning Vinyl Record */
.we-picker__current {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid var(--we-border-line);
  background: var(--we-layer-1, rgba(128, 128, 128, 0.06));
}
.we-vinyl {
  position: relative;
  width: 82px;
  height: 82px;
  flex: 0 0 auto;
  border-radius: 50%;
  background: repeating-radial-gradient(circle at center, #191920 0 2px, #242530 2px 4px);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.42), inset 0 0 0 1px rgba(255, 255, 255, 0.08);
  animation: we-vinyl-spin 8s linear infinite;
  animation-play-state: paused;
}
.we-vinyl--playing { animation-play-state: running; }
.we-vinyl--sm { width: 44px; height: 44px; }
.we-vinyl__cover {
  position: absolute;
  inset: 22%;
  border-radius: 50%;
  overflow: hidden;
  background: rgba(128, 128, 128, 0.25);
  border: 2px solid rgba(0, 0, 0, 0.85);
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.1), inset 0 0 8px rgba(0, 0, 0, 0.6);
}
.we-vinyl__cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.we-vinyl__empty {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.55);
  font-size: 1.15em;
}
.we-vinyl__hole {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 10px;
  height: 10px;
  margin: -5px 0 0 -5px;
  border-radius: 50%;
  background: #0b0b0e;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.9);
}
.we-vinyl--sm .we-vinyl__hole {
  width: 6px;
  height: 6px;
  margin: -3px 0 0 -3px;
}
@keyframes we-vinyl-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.we-picker__current-info {
  flex: 1;
  min-width: 0;
}
.we-picker__current-title {
  font-size: 0.95em;
  font-weight: 600;
  color: var(--we-ink);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.we-picker__current-meta {
  display: block;
  font-size: 0.78em;
  color: var(--we-ink-2);
  margin-top: 2px;
}
.we-picker__current-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 0 0 auto;
}
.we-picker__row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

/* Uniform Setting Row (32px touch height) */
.we-picker__ctl {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 32px;
}
.we-picker__ctl--wrap { flex-wrap: wrap; row-gap: 8px; }
.we-picker__ctl--disabled { opacity: 0.45; pointer-events: none; }
.we-picker__ctl-text {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
  flex: 1 1 auto;
}
.we-picker__ctl-label {
  font-size: 0.88em;
  color: var(--we-ink);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.we-picker__ctl-hint {
  font-size: 0.72em;
  color: var(--we-ink-3);
  overflow-wrap: anywhere;
  max-width: 100%;
}
.we-picker__ctl-side {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 0 0 auto;
}

/* Buttons & Selects */
.we-picker__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  vertical-align: middle;
  height: var(--we-ui-h);
  padding: 0 12px;
  border: 1px solid var(--we-border-line);
  border-radius: var(--we-ui-radius);
  background: transparent;
  color: var(--we-ink);
  font: inherit;
  font-size: 0.82em;
  line-height: 1;
  text-decoration: none;
  white-space: nowrap;
  cursor: pointer;
  transition: background-color var(--we-dur-fast) var(--we-ease), border-color var(--we-dur-fast) var(--we-ease), color var(--we-dur-fast) var(--we-ease), transform var(--we-dur-fast) var(--we-ease);
}
.we-picker__btn:hover:not(:disabled) {
  background: var(--we-layer-1, rgba(128, 128, 128, 0.12));
}
.we-picker__btn:disabled { opacity: 0.45; cursor: default; }
.we-picker__btn.is-on {
  border-color: var(--we-accent);
  color: var(--we-accent);
}
.we-picker__btn--primary {
  color: var(--we-accent-ink, #ffffff);
  background: var(--we-accent, #4f8cff);
  border-color: transparent;
  font-weight: 600;
}
.we-picker__btn--primary:hover:not(:disabled) {
  background: color-mix(in srgb, var(--we-accent, #4f8cff) 86%, var(--we-accent-ink, #000000));
  color: var(--we-accent-ink, #ffffff);
}
.we-picker__btn--danger {
  border-color: color-mix(in srgb, #e5534b 55%, transparent);
  color: #e5534b;
}
.we-picker__btn--mini { padding: 0 8px; height: 24px; font-size: 0.76em; }
.we-picker__chip {
  height: 24px;
  padding: 0 9px;
  border-radius: 999px;
  border: 1px solid var(--we-border-line);
  background: transparent;
  color: var(--we-ink-2);
  font: inherit;
  font-size: 0.76em;
  cursor: pointer;
}
.we-picker__chip:hover { color: var(--we-ink); background: var(--we-hover-bg); }

.we-picker__select, .we-picker select {
  appearance: none;
  -webkit-appearance: none;
  height: var(--we-ui-h);
  padding: 0 24px 0 8px;
  border: 1px solid var(--we-border-line);
  border-radius: var(--we-ui-radius);
  background-color: transparent;
  background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='5'%3E%3Cpath d='M1 1l3 3 3-3' fill='none' stroke='%23888' stroke-width='1.4' stroke-linecap='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 8px center;
  color: var(--we-ink);
  font: inherit;
  font-size: 0.82em;
  cursor: pointer;
  max-width: 100%;
}
.we-picker__select option, .we-picker select option,
.we-picker__select optgroup, .we-picker select optgroup {
  background-color: var(--we-readability-base, #1e2028);
  color: var(--we-ink, #ffffff);
}

.we-picker__text {
  height: var(--we-ui-h);
  padding: 0 9px;
  border: 1px solid var(--we-border-line);
  border-radius: var(--we-ui-radius);
  background: transparent;
  color: var(--we-ink);
  font: inherit;
  font-size: 0.82em;
  flex: 1;
  min-width: 0;
}
.we-picker__text:focus { outline: none; border-color: var(--we-accent); }
.we-picker__search { flex: 1 1 160px; min-width: 120px; }

/* Segmented Buttons */
.we-picker__seg {
  display: inline-grid;
  grid-auto-flow: column;
  grid-auto-columns: 1fr;
  gap: 6px;
  flex: 0 1 auto;
  max-width: 100%;
}
.we-picker__ctl--wrap > .we-picker__seg { margin-left: auto; }
.we-picker__seg--corners-eq { grid-auto-columns: minmax(max-content, 1fr); }
.we-picker__seg--chips { display: flex; flex-wrap: wrap; justify-content: flex-start; gap: 6px; }
.we-picker__rate {
  min-width: 52px;
  height: var(--we-ui-h);
  padding: 0 10px;
  font-size: 0.78em;
  color: var(--we-ink-2);
}
.we-picker__rate--active {
  background: var(--we-accent) !important;
  border-color: var(--we-accent) !important;
  color: var(--we-accent-ink, #ffffff) !important;
  font-weight: 600;
}

/* Capsule Toggle Switch */
.we-picker__switch {
  position: relative;
  display: inline-flex;
  cursor: pointer;
  flex: none;
}
.we-picker__switch input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}
.we-picker__switch-track {
  position: relative;
  width: 36px;
  height: 20px;
  border-radius: 999px;
  background: var(--we-layer-3, rgba(128, 128, 128, 0.35));
  border: 1px solid var(--we-border-line);
  transition: background-color 180ms var(--we-ease), border-color 180ms var(--we-ease);
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.14);
}
.we-picker__switch input:checked + .we-picker__switch-track {
  background: var(--we-accent);
  border-color: transparent;
}
.we-picker__switch-thumb {
  position: absolute;
  left: 2px;
  top: 2px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.35);
  transition: transform 180ms var(--we-ease);
}
.we-picker__switch input:checked + .we-picker__switch-track .we-picker__switch-thumb {
  transform: translateX(16px);
}

/* Range Sliders */
.we-picker__slider-row {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 28px;
}
.we-picker__label {
  min-width: 90px;
  max-width: 170px;
  flex: 0 0 auto;
  color: var(--we-ink);
  font-size: 0.85em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  user-select: none;
}
.we-picker__slider {
  -webkit-appearance: none;
  appearance: none;
  flex: 1;
  min-width: 0;
  height: 18px;
  background: transparent;
  cursor: pointer;
}
.we-picker__slider::-webkit-slider-runnable-track {
  height: 4px;
  border-radius: 2px;
  background: linear-gradient(to right,
    var(--we-accent) var(--we-fill, 0%),
    rgba(128, 128, 128, 0.34) var(--we-fill, 0%));
}
.we-picker__slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 15px;
  height: 15px;
  margin-top: -5.5px;
  border-radius: 50%;
  background: #ffffff;
  border: 2px solid var(--we-accent);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
  transition: transform var(--we-dur-fast) var(--we-ease);
}
.we-picker__slider:hover::-webkit-slider-thumb { transform: scale(1.12); }
.we-picker__value {
  min-width: 52px;
  text-align: right;
  flex: 0 0 auto;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 0.74em;
  font-variant-numeric: tabular-nums;
  background: var(--we-layer-2, rgba(128, 128, 128, 0.14));
  color: var(--we-ink-2);
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  gap: 2px;
}
.we-picker__value-input {
  width: 3.4em;
  min-width: 0;
  padding: 0;
  border: 0;
  background: transparent;
  text-align: right;
  color: inherit;
  font: inherit;
}
.we-picker__value-input:focus { outline: none; }

/* Circular Color Swatches */
.we-picker__swatches {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  flex: 1 0 100%;
}
.we-picker__swatch {
  width: 22px;
  height: 22px;
  padding: 0;
  border-radius: 50%;
  border: 0;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.5), 0 1px 3px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  transition: transform var(--we-dur-fast) var(--we-ease), box-shadow var(--we-dur-fast) var(--we-ease);
}
.we-picker__swatch:hover { transform: scale(1.12); }
.we-picker__swatch--active {
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.65),
    0 0 0 2px var(--we-layer-2, rgba(128, 128, 128, 0.3)),
    0 0 0 4px var(--we-accent);
}
.we-picker__swatch--auto {
  width: auto;
  min-width: 34px;
  padding: 0 7px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 600;
  color: #1f2937;
  background: linear-gradient(135deg, #d1d5db 0 50%, #f9fafb 50% 100%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.we-picker__swatch-custom {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
}
.we-picker__swatch-custom input[type="color"] {
  width: 22px;
  height: 22px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: transparent;
  cursor: pointer;
}
.we-picker__swatch-custom input[type="color"]::-webkit-color-swatch-wrapper { padding: 0; }
.we-picker__swatch-custom input[type="color"]::-webkit-color-swatch {
  border: 1.5px solid rgba(255, 255, 255, 0.7);
  border-radius: 50%;
}

/* Theme Preset 4-Col Grid */
.we-picker__preset-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(128px, 1fr));
  gap: 6px;
  padding: 8px;
  border: 1px solid var(--we-border-line);
  border-radius: 10px;
  background: var(--we-layer-1, rgba(128, 128, 128, 0.05));
}
.we-picker__preset-cell {
  display: flex;
  align-items: stretch;
  gap: 2px;
  min-width: 0;
}
.we-picker__preset-cell > .we-picker__btn {
  flex: 1;
  min-width: 0;
  justify-content: flex-start;
  overflow: hidden;
  text-overflow: ellipsis;
}
.we-picker__preset-cell--active > .we-picker__btn:first-child {
  border-color: var(--we-accent);
  background: color-mix(in srgb, var(--we-accent) 14%, transparent);
  color: var(--we-ink);
  font-weight: 600;
}
.we-picker__preset-del {
  flex: 0 0 auto;
  width: 26px;
  padding: 0;
}
.we-picker__preset-cell--empty {
  align-items: center;
  justify-content: center;
  border: 1px dashed var(--we-border-line);
  border-radius: 8px;
  min-height: 30px;
}

/* Drill-Down Wallpaper Library View (.we-picker__modal) */
.we-picker__modal {
  display: flex;
  flex-direction: column;
  gap: 10px;
  animation: we-tab-in 180ms var(--we-ease);
}
.we-picker__modal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--we-border-line);
}
.we-picker__modal-head-left {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}
.we-picker__modal-title { font-weight: 600; font-size: 0.96em; }
.we-picker__modal-tabs { display: flex; gap: 6px; }
.we-picker__tab {
  flex: 1;
  height: 28px;
  border: 1px solid var(--we-border-line);
  border-radius: 7px;
  background: transparent;
  color: var(--we-ink-2);
  font: inherit;
  font-size: 0.82em;
  cursor: pointer;
}
.we-picker__tab--active {
  background: var(--we-accent);
  border-color: var(--we-accent);
  color: var(--we-accent-ink, #ffffff);
  font-weight: 600;
}
.we-picker__filter-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
}
.we-picker__rating-menu { position: relative; flex: 0 1 auto; }
.we-picker__rating-btn {
  list-style: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  height: var(--we-ui-h);
  padding: 0 10px;
  border-radius: 8px;
  font-size: 12px;
  border: 1px solid var(--we-border-line);
  background: var(--we-layer-1, rgba(128, 128, 128, 0.10));
  color: var(--we-ink);
  white-space: nowrap;
}
.we-picker__rating-btn::-webkit-details-marker { display: none; }
.we-picker__rating-list {
  position: absolute;
  z-index: 30;
  top: calc(100% + 4px);
  right: 0;
  min-width: 196px;
  padding: 6px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  background-color: var(--we-floating-tint, var(--we-readability-base, #1e2028));
  backdrop-filter: blur(18px) saturate(160%);
  border: 1px solid var(--we-border-line);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.28);
  color: var(--we-ink);
}
.we-picker__rating-toggle {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 5px 8px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
}
.we-picker__rating-toggle:hover { background: var(--we-hover-bg); }
.we-picker__rating-toggle input { accent-color: var(--we-accent); margin: 0; }

/* Grid: Fixed 16:9 & Classic CD-Rack */
.we-picker__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(136px, 1fr));
  gap: 8px;
  padding: 2px;
  overflow-x: clip;
}
.we-picker__card {
  position: relative;
  height: 92px;
  padding: 0;
  cursor: pointer;
  display: block;
  overflow: hidden;
  border: 1px solid var(--we-border-line);
  border-radius: 8px;
  background: var(--we-layer-1, rgba(128, 128, 128, 0.14));
  transition: border-color var(--we-dur-fast) ease, box-shadow var(--we-dur-fast) ease, transform var(--we-dur-fast) ease;
}
.we-picker__card img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 280ms var(--we-ease);
}
.we-picker__modal:not([data-we-cards="classic"]) .we-picker__card:hover img {
  transform: scale(1.06);
}
.we-picker__modal[data-we-cards="classic"] .we-picker__grid {
  grid-template-columns: repeat(auto-fill, minmax(112px, 1fr));
  padding: 4px 10px 44px;
}
.we-picker__modal[data-we-cards="classic"] .we-picker__card {
  height: auto;
  aspect-ratio: 16 / 9;
  margin-bottom: -34px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35);
}
.we-picker__modal[data-we-cards="classic"] .we-picker__card:hover {
  transform: scale(1.12);
  z-index: 12;
  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.48);
}
.we-picker__card--selected {
  outline: 2px solid var(--we-accent);
  outline-offset: -2px;
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--we-accent) 45%, transparent),
              0 4px 16px color-mix(in srgb, var(--we-accent) 28%, transparent);
}
.we-picker__card--checked {
  outline: 2px solid var(--we-accent);
  outline-offset: -2px;
}
.we-picker__card-close {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85em;
  font-weight: 600;
  color: var(--we-ink-2);
}
.we-picker__card-type {
  position: absolute;
  top: 4px;
  left: 4px;
  z-index: 2;
  padding: 2px 6px;
  font-size: 0.68em;
  border-radius: 4px;
  color: #fff;
  background: rgba(0, 0, 0, 0.62);
}
.we-picker__card-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  z-index: 1;
  padding: 1px 6px;
  font-size: 0.64em;
  border-radius: 4px;
  color: #fff;
  background: color-mix(in srgb, var(--we-accent) 85%, #000);
}
.we-picker__card-hide {
  position: absolute;
  top: 4px;
  right: 4px;
  z-index: 3;
  padding: 2px 7px;
  font-size: 0.68em;
  border: 0;
  border-radius: 4px;
  cursor: pointer;
  background: rgba(0, 0, 0, 0.68);
  color: #fff;
  opacity: 0;
  transition: opacity var(--we-dur-fast) ease, background-color var(--we-dur-fast) ease;
}
.we-picker__card:hover .we-picker__card-hide,
.we-picker__card:focus-within .we-picker__card-hide { opacity: 1; }
.we-picker__card-hide:hover { background: rgba(195, 50, 50, 0.92); }
.we-picker__card-title {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 14px 6px 4px;
  font-size: 0.72em;
  color: #fff;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.76));
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.we-picker__card-check {
  position: absolute;
  top: 4px;
  left: 4px;
  z-index: 3;
  width: 18px;
  height: 18px;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.65);
  color: #fff;
  font-size: 12px;
  line-height: 18px;
  text-align: center;
}
.we-picker__card--checked .we-picker__card-check { background: var(--we-accent); }
.we-picker__card-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.74em;
  color: var(--we-ink-3);
}

/* Props, Uploads, Editor, Font Table, Confirm, Empty */
.we-picker__props, .we-picker__uploads, .we-picker__editor {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px;
  border-radius: 10px;
  border: 1px solid var(--we-border-line);
  background: var(--we-layer-1, rgba(128, 128, 128, 0.05));
}
.we-picker__uploads-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 160px;
  overflow-y: auto;
}
.we-picker__uploads-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  border-radius: 6px;
  background: var(--we-layer-1, rgba(128, 128, 128, 0.08));
}
.we-picker__uploads-name, .we-picker__uploads-path {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.8em;
}
.we-picker__font-table {
  width: 100%;
  border-collapse: collapse;
}
.we-picker__font-table th {
  font-weight: 500;
  text-align: left;
  padding: 4px;
  font-size: 12px;
  color: var(--we-ink-3);
}
.we-picker__font-table td {
  padding: 3px 4px;
  vertical-align: middle;
}
.we-picker__font-table th:nth-child(n+2),
.we-picker__font-table td:nth-child(n+2) {
  width: 1%;
  white-space: nowrap;
}
.we-confirm-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px dashed var(--we-border-line);
  background: var(--we-layer-1, rgba(128, 128, 128, 0.08));
}
.we-picker__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 36px 16px;
  text-align: center;
}
.we-picker__empty-title {
  font-size: 0.96em;
  font-weight: 600;
  color: var(--we-ink);
}
.we-picker__hint { font-size: 0.78em; color: var(--we-ink-3); }
.we-picker__toast {
  position: sticky;
  bottom: 8px;
  align-self: center;
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 0.8em;
  background: var(--we-accent);
  color: var(--we-accent-ink, #ffffff);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
  z-index: 40;
}

/* Extension Module Cards & About */
.we-ext { display: flex; flex-direction: column; gap: 10px; }
.we-ext__module {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  border: 1px solid var(--we-border-line);
  border-radius: 12px;
  background: var(--we-layer-1, rgba(128, 128, 128, 0.06));
}
.we-ext__module-head { display: flex; align-items: center; gap: 8px; }
.we-ext__module-title { font-size: 0.9em; font-weight: 600; color: var(--we-ink); }
.we-about__lead { display: flex; flex-direction: column; gap: 8px; }
.we-about__p { margin: 0; font-size: 0.82em; line-height: 1.65; color: var(--we-ink-2); }
.we-about__url {
  display: block;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px dashed var(--we-border-line);
  background: var(--we-layer-1, rgba(128, 128, 128, 0.08));
  font-size: 0.8em;
  color: var(--we-ink-2);
  user-select: text;
  word-break: break-all;
}
.we-log-pre {
  margin: 0;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid var(--we-border-line);
  background: var(--we-layer-1, rgba(0, 0, 0, 0.14));
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.74em;
  line-height: 1.5;
  white-space: pre-wrap;
  max-height: 200px;
  overflow: auto;
  color: var(--we-ink-2);
}

@media (prefers-reduced-motion: reduce) {
  .we-vinyl, .we-tabpanel, .we-tabs__pill, .we-picker * {
    animation: none !important;
    transition: none !important;
  }
}
`;

// src/shared/i18n.js
var SETTINGS_SIDEBAR_LABEL = "Wallpaper Engine";
var I18N_DICTIONARY = {
  en: {
    pluginName: "Wallpaper Engine",
    pluginDesc: "Scene · Web · Video · Picture & Liquid Glass",
    navSettingsLabel: SETTINGS_SIDEBAR_LABEL,
    wallpaperEngineTitle: "Wallpaper Engine",
    wallpaperEngineDesc: "Scene, Web, Video and Picture wallpapers with unified iOS Liquid Glass.",
    playableBadge: (count) => `${count} playable`,
    tabLibrary: "Library",
    tabAppearance: "Appearance",
    tabEffects: "Playback",
    tabAudio: "Audio",
    tabAdvanced: "System",
    tabExtensions: "Extensions",
    tabAbout: "About",
    currentWallpaper: "Current Wallpaper",
    noWallpaperSelected: "No wallpaper selected",
    selectWallpaperFirst: "Choose a wallpaper below to enable it.",
    chooseWallpaper: "Choose Wallpaper",
    back: "Back",
    wallpaperPropsBtn: "Properties",
    pause: "Pause",
    play: "Play",
    audioOnBtn: "🔊 Audio On",
    audioOffBtn: "🔇 Audio Off",
    clear: "Clear",
    refresh: "Rescan",
    refreshing: "Scanning…",
    statusPlaying: " · Playing",
    statusPaused: " · Paused",
    typeVideoLabel: "Video Wallpaper",
    typeWebLabel: "Web Wallpaper",
    typeImageLabel: "Picture Wallpaper",
    typeSceneLiveLabel: "Scene (Live Render)",
    typeSceneFrameLabel: "Scene (Static Frame)",
    normalListTab: (count) => `Library (${count})`,
    hiddenListTab: (count) => `Hidden (${count})`,
    batchMode: "Batch",
    exitBatch: "Done Batch",
    batchHide: "Hide Selected",
    batchSelectedCount: (count) => `${count} selected`,
    confirmBtn: "Confirm",
    cancelBtn: "Cancel",
    restoreAll: "Restore All",
    closeCard: "✕ Close",
    sectionGlass: "Liquid Glass UI",
    sectionGlassDesc: "Unified two-stage readability glass across sidebar, composer, chat and Settings.",
    sectionPlayback: "Video & Real-time Render",
    sectionPlaybackDesc: "Scene quality, frame cap and power-saving pause rules.",
    sectionLibrary: "Wallpaper Library",
    sectionLibraryDesc: "Browse Steam Workshop projects, local media, URLs and Bing daily.",
    sectionSystem: "System",
    sectionSystemDesc: "Layout, native integrations, power policy, cache & diagnostics.",
    exportPreset: "Export…",
    importPreset: "Import…",
    savePresetBtn: "Save Current…",
    presetExported: "Preset exported.",
    presetImported: "Preset applied.",
    presetInvalid: "This file does not contain a valid agy-skins preset.",
    defaultValue: "Default",
    sectionTypography: "Global Typography",
    sectionTypographyDesc: "Font sets, system fonts, text roles and color tokens.",
    fontCustom: "Custom typography",
    fontFamily: "Default font",
    fontFamilyPlaceholder: "Follow Antigravity",
    scanFonts: "Rescan",
    fontScanning: "Scanning…",
    caretColor: "Caret color",
    sectionFx: "Click & Trail FX",
    sectionFxDesc: "Pointer ripple and cursor trail rendered cleanly behind the UI.",
    fxEnabled: "Enable pointer effects",
    fxClick: "Click effect",
    fxClickStyle: "Click style",
    fxStyleRipple: "Ripple",
    fxStyleSpark: "Spark",
    fxStyleBoth: "Both",
    fxClickSize: "Click radius",
    fxClickGlow: "Click glow",
    fxTrail: "Cursor trail",
    fxTrailStyle: "Trail style",
    fxTrailComet: "Comet",
    fxTrailSparkle: "Dust",
    fxTrailLength: "Trail duration",
    fxTrailWidth: "Trail width",
    fxTrailGlow: "Trail glow",
    fxOpacity: "Effect opacity",
    fxBlend: "Blend mode",
    fxBlendScreen: "Screen",
    fxBlendNormal: "Normal",
    fxBlendAdd: "Lighten",
    fxBlendOverlay: "Overlay",
    fxBlendMultiply: "Multiply",
    fxColorMode: "Color source",
    fxColorAccent: "Theme Accent",
    fxColorRainbow: "Rainbow",
    fxColorCustom: "Custom",
    fxColor: "Effect color",
    sectionParallax: "3D Parallax",
    sectionParallaxDesc: "Pointer-driven depth for wallpaper, UI layers and extension slots.",
    parallaxEnabled: "Enable 3D parallax",
    parallaxBgDepth: "Wallpaper depth",
    parallaxUi: "Follow UI elements",
    parallaxUiChat: "Conversation flow depth",
    parallaxUiComposer: "Composer card depth",
    parallaxUiSidebar: "Sidebar depth",
    parallaxUiBubble: "User bubble depth",
    parallaxSmooth: "Smoothing",
    rotationEnabled: "Auto rotation",
    rotationInterval: "Rotation interval",
    rotationHint: "Cycles through non-hidden wallpapers while Antigravity is running.",
    enableWallpaper: "Wallpaper Enabled",
    enableWallpaperDesc: "Render Scene, Web, Video or Picture backdrop behind Antigravity",
    wallpaperType: "Wallpaper Type",
    wallpaperSource: "Source URL or Local Path",
    wallpaperSourcePlaceholder: "https://... or C:/path/to/wallpaper.jpg",
    wallpaperBlur: "Wallpaper Blur",
    wallpaperBlurDesc: "Gaussian blur applied directly to the wallpaper layer (0 - 60px)",
    maskOcclusion: "Dimming Scrim",
    maskOcclusionDesc: "Theme-aware veil above wallpaper to balance contrast (0 - 90%)",
    panelGlass: "Glass Transparency",
    panelGlassDesc: "Higher percentage makes surfaces more translucent above readability floor",
    weTitle: "Wallpaper Library",
    weDescription: "Browse local Steam Workshop projects and uploads read-only via signed loopback origin.",
    weChooseFolder: "+ Add Folder",
    weRefresh: "Rescan",
    weScanning: "Scanning…",
    weFound: (count) => `${count} playable wallpapers · click to apply`,
    weSearch: "Search wallpaper title…",
    weEmpty: "No playable wallpapers match current filters.",
    weUse: "Apply",
    weHide: "Hide",
    weRestore: "Restore",
    weShowHidden: (count) => `Hidden (${count})`,
    weShowVisible: (count) => `Library (${count})`,
    weSelected: "Active",
    weTypeVideo: "Video",
    weTypeScene: "Scene",
    weTypeImage: "Picture",
    weTypeWeb: "Web",
    weTypeOther: "Other",
    bubbleOpacity: "Message Bubble Opacity",
    composerFrost: "Composer Frost Blur",
    surfaceFrost: "Global Frost Blur",
    wallpaperMode: "Playback mode",
    wallpaperModeLive: "Live Render",
    wallpaperModeFrame: "Static Frame",
    wallpaperFit: "Fit",
    wallpaperFitCover: "Cover",
    wallpaperFitContain: "Contain",
    wallpaperFitFill: "Fill",
    wallpaperFitCenter: "Center",
    wallpaperTransition: "Switch Transition",
    transitionCut: "Cut",
    transitionFade: "Fade",
    transitionPush: "Push",
    transitionSlide: "Push",
    transitionWipe: "Wipe",
    transitionZoom: "Zoom",
    transitionIris: "Iris",
    transitionBars: "Bars",
    dirLeft: "Left",
    dirRight: "Right",
    dirUp: "Up",
    dirDown: "Down",
    speedFast: "Fast",
    speedNormal: "Normal",
    speedSlow: "Slow",
    wallpaperOpacity: "Wallpaper Transparency",
    wallpaperOpacityDesc: "Fades wallpaper toward theme base while keeping glass backdrop valid",
    pauseOnHidden: "Pause when minimized/hidden",
    pauseOnBlur: "Pause when unfocused",
    pauseOnBattery: "Pause on battery power",
    startPaused: "Start paused on launch",
    sceneLive: "Real-time scene/web rendering",
    sceneLiveDesc: "Render Scene & Web projects live via WebWallGL",
    sceneLiveFps: "Render FPS cap",
    sceneAutoQuality: "Automatic quality",
    sceneAutoQualityDesc: "Scale post-processing & AA when GPU falls behind frame target",
    sceneRenderDpr: "Render DPR",
    sceneRenderDprAuto: "Auto",
    sceneVideoTexScale: "Video texture scale",
    sceneVideoTexScaleAuto: "Auto",
    sceneVideoTexScaleHalf: "Half",
    sceneVideoTexScaleFull: "Full",
    glassSaturation: "Glass saturation",
    glassBorder: "Border emphasis",
    glassHighlight: "Top specular highlight",
    wallpaperSound: "Wallpaper audio track",
    wallpaperVolume: "Audio volume",
    wallpaperVolumeDesc: "Master volume for video & scene wallpapers",
    videoPlaybackRate: "Playback speed",
    tagsAll: "All",
    browserHoleCutout: "Split-browser hole cutout",
    browserHoleCutoutDesc: "Even-odd cutout keeps embedded browser panes crisp over wallpaper",
    studioShortcut: "Global studio shortcut (Alt+Shift+W)",
    studioShortcutDesc: "Open Wallpaper Engine floating dialog anywhere in Antigravity",
    cdpHealthTitle: "Antigravity CDP Injection Health",
    cdpStatusOk: "Connected to Antigravity workbench",
    cdpStatusMissing: "DevToolsActivePort missing",
    cdpFixShortcuts: "Add --remote-debugging-port=0 to Windows shortcuts",
    weNoPreview: "No preview",
    weSceneProperties: "Wallpaper Properties",
    propSchemeColor: "Scheme color",
    ratingEveryone: "Everyone",
    ratingPg13: "PG-13",
    ratingMature: "Mature",
    ratingUnrated: "Unrated",
    orientAll: "All",
    orientLandscape: "Landscape",
    orientPortrait: "Portrait",
    resetTab: "Reset Current Tab",
    resetTabConfirm: "Reset all settings in this tab to factory defaults?",
    resetAll: "Reset All Settings",
    resetAllConfirm: "Reset all Wallpaper Engine & Liquid Glass settings? Library folders & custom uploads stay intact."
  },
  zh: {
    pluginName: "壁纸引擎",
    pluginDesc: "Scene · Web · 视频 · 图片与液态玻璃",
    navSettingsLabel: SETTINGS_SIDEBAR_LABEL,
    wallpaperEngineTitle: "壁纸引擎",
    wallpaperEngineDesc: "Scene、Web、视频与图片壁纸，以及统一的两段可读性 iOS 液态玻璃。",
    playableBadge: (count) => `${count} 个可播放`,
    tabLibrary: "壁纸库",
    tabAppearance: "外观",
    tabEffects: "播放",
    tabAudio: "声音",
    tabAdvanced: "系统",
    tabExtensions: "扩展",
    tabAbout: "关于",
    currentWallpaper: "当前壁纸",
    noWallpaperSelected: "未选择壁纸",
    selectWallpaperFirst: "当前还没有启用壁纸",
    chooseWallpaper: "选择壁纸",
    back: "返回",
    wallpaperPropsBtn: "壁纸属性",
    pause: "暂停",
    play: "播放",
    audioOnBtn: "🔊 音乐开",
    audioOffBtn: "🔇 音乐关",
    clear: "清除",
    refresh: "刷新",
    refreshing: "扫描中…",
    statusPlaying: " · 播放中",
    statusPaused: " · 已暂停",
    typeVideoLabel: "视频壁纸",
    typeWebLabel: "网页壁纸",
    typeImageLabel: "图片壁纸",
    typeSceneLiveLabel: "场景壁纸（实时渲染）",
    typeSceneFrameLabel: "场景壁纸（静态帧）",
    normalListTab: (count) => `正常列表（${count}）`,
    hiddenListTab: (count) => `已隐藏（${count}）`,
    batchMode: "批量",
    exitBatch: "退出批量",
    batchHide: "批量隐藏",
    batchSelectedCount: (count) => `已选 ${count} 张`,
    confirmBtn: "确认",
    cancelBtn: "取消",
    restoreAll: "全部恢复",
    closeCard: "✕ 关闭",
    sectionGlass: "玻璃 UI",
    sectionGlassDesc: "整窗两段式可读性玻璃配方，统一侧栏、对话与设置窗材质。",
    sectionPlayback: "视频与实时渲染",
    sectionPlaybackDesc: "场景实时渲染帧率、自动画质与启停策略。",
    sectionLibrary: "壁纸库",
    sectionLibraryDesc: "浏览 Steam 创意工坊工程、自定义导入、网址与 Bing 每日一图。",
    sectionSystem: "系统",
    sectionSystemDesc: "布局密度、Antigravity 原生融合、省电策略、缓存与诊断。",
    exportPreset: "导出预设…",
    importPreset: "导入预设…",
    savePresetBtn: "保存当前为预设…",
    presetExported: "预设已导出。",
    presetImported: "已导入预设。",
    presetInvalid: "该文件不是有效的壁纸玻璃预设 JSON。",
    defaultValue: "默认",
    sectionTypography: "全局字体",
    sectionTypographyDesc: "字体集方案、本机字体、文字颜色角色与排版矩阵。",
    fontCustom: "字体自定义",
    fontFamily: "默认字体",
    fontFamilyPlaceholder: "跟随 Antigravity",
    scanFonts: "重新扫描",
    fontScanning: "扫描中…",
    caretColor: "光标颜色",
    sectionFx: "点击效果与拖尾效果",
    sectionFxDesc: "在壁纸之上叠加随光标响应的点击与拖尾效果，不会挡住界面控件。",
    fxEnabled: "启用点击与拖尾效果",
    fxClick: "点击效果",
    fxClickStyle: "点击样式",
    fxStyleRipple: "涟漪",
    fxStyleSpark: "星火",
    fxStyleBoth: "两者",
    fxClickSize: "半径",
    fxClickGlow: "点击光晕",
    fxTrail: "拖尾效果",
    fxTrailStyle: "拖尾样式",
    fxTrailComet: "彗尾",
    fxTrailSparkle: "星尘",
    fxTrailLength: "拖尾时长",
    fxTrailWidth: "拖尾粗细",
    fxTrailGlow: "拖尾光晕",
    fxOpacity: "不透明度",
    fxBlend: "混合模式",
    fxBlendScreen: "滤色",
    fxBlendNormal: "正常",
    fxBlendAdd: "变亮",
    fxBlendOverlay: "叠加",
    fxBlendMultiply: "正片叠底",
    fxColorMode: "效果配色",
    fxColorAccent: "跟随主题色",
    fxColorRainbow: "彩虹",
    fxColorCustom: "自定义",
    fxColor: "自定义颜色",
    sectionParallax: "3D 视差效果",
    sectionParallaxDesc: "光标移动时壁纸向对称方向、界面层与扩展槽位向同向轻挪。",
    parallaxEnabled: "启用 3D 效果",
    parallaxBgDepth: "背景缓动距离",
    parallaxUi: "界面元素跟随",
    parallaxUiChat: "会话文本区距离",
    parallaxUiComposer: "输入卡片距离",
    parallaxUiSidebar: "侧栏距离",
    parallaxUiBubble: "用户气泡距离",
    parallaxSmooth: "缓动平滑",
    rotationEnabled: "自动轮转",
    rotationInterval: "轮转间隔",
    rotationHint: "按列表顺序/随机自动切换壁纸。",
    enableWallpaper: "启用壁纸",
    enableWallpaperDesc: "在界面背后渲染 Scene / Web / 视频 / 图片壁纸",
    wallpaperType: "壁纸类型",
    wallpaperSource: "壁纸路径或 URL",
    wallpaperSourcePlaceholder: "https://... 或 D:/Wallpapers/...",
    wallpaperBlur: "壁纸模糊",
    wallpaperBlurDesc: "直接作用于壁纸层的平滑模糊 (0 - 60px)",
    maskOcclusion: "暗化",
    maskOcclusionDesc: "壁纸之上的明暗对比遮罩 (0 - 90%)",
    panelGlass: "玻璃透明度",
    panelGlassDesc: "数值越大越透，同时受可读性下限保护",
    weTitle: "Wallpaper Engine 壁纸库",
    weDescription: "通过签名本地回环源只读浏览本机 Steam 创意工坊，绝不改动原文件。",
    weChooseFolder: "+ 添加目录",
    weRefresh: "重新扫描",
    weScanning: "正在扫描…",
    weFound: (count) => `${count} 个可播放壁纸 · 点击卡片即应用`,
    weSearch: "搜索壁纸标题…",
    weEmpty: "当前过滤条件下没有可播放的壁纸。",
    weUse: "设为壁纸",
    weHide: "隐藏",
    weRestore: "恢复",
    weShowHidden: (count) => `已隐藏（${count}）`,
    weShowVisible: (count) => `正常列表（${count}）`,
    weSelected: "当前",
    weTypeVideo: "视频",
    weTypeScene: "场景",
    weTypeImage: "图片",
    weTypeWeb: "网页",
    weTypeOther: "其他",
    bubbleOpacity: "气泡不透明度",
    composerFrost: "输入卡磨砂强度",
    surfaceFrost: "雾化",
    wallpaperMode: "渲染方式",
    wallpaperModeLive: "实时播放",
    wallpaperModeFrame: "静态帧",
    wallpaperFit: "画面适配",
    wallpaperFitCover: "铺满 (Cover)",
    wallpaperFitContain: "完整显示 (Contain)",
    wallpaperFitFill: "拉伸填满 (Fill)",
    wallpaperFitCenter: "居中原尺寸 (Center)",
    wallpaperTransition: "过场动画",
    transitionCut: "无（直接切换）",
    transitionFade: "淡入淡出",
    transitionPush: "推移",
    transitionSlide: "推移",
    transitionWipe: "擦除",
    transitionZoom: "缩放",
    transitionIris: "光圈",
    transitionBars: "百叶窗",
    dirLeft: "向左",
    dirRight: "向右",
    dirUp: "向上",
    dirDown: "向下",
    speedFast: "快",
    speedNormal: "标准",
    speedSlow: "慢",
    wallpaperOpacity: "壁纸透明度",
    wallpaperOpacityDesc: "0% 为完全不透；调高向主题底色淡出以保持玻璃模糊不断裂",
    pauseOnHidden: "最小化/切页时暂停",
    pauseOnBlur: "窗口失焦时暂停",
    pauseOnBattery: "使用电池时暂停",
    startPaused: "启动时暂停",
    sceneLive: "场景/网页实时渲染",
    sceneLiveDesc: "通过 WebWallGL 实时渲染 .pkg 场景与网页壁纸",
    sceneLiveFps: "实时渲染帧率",
    sceneAutoQuality: "自动画质",
    sceneAutoQualityDesc: "帧率低于上限时自动降档后处理与抗锯齿",
    sceneRenderDpr: "渲染分辨率倍率",
    sceneRenderDprAuto: "自动",
    sceneVideoTexScale: "内嵌视频纹理缩放",
    sceneVideoTexScaleAuto: "自动",
    sceneVideoTexScaleHalf: "50%",
    sceneVideoTexScaleFull: "100%",
    glassSaturation: "玻璃色彩饱和度",
    glassBorder: "边框",
    glassHighlight: "顶部折射高光",
    wallpaperSound: "壁纸音轨",
    wallpaperVolume: "音量",
    wallpaperVolumeDesc: "视频与场景内置音轨音量",
    videoPlaybackRate: "视频播放倍速",
    tagsAll: "全部",
    browserHoleCutout: "分屏浏览器自动挖孔",
    browserHoleCutoutDesc: "自动为 Antigravity 内嵌分屏浏览器镂空，避免内容被着色或模糊",
    studioShortcut: "全局快捷键 (Alt+Shift+W)",
    studioShortcutDesc: "在主界面任意位置按 Alt+Shift+W 呼出独立液态玻璃工作台",
    cdpHealthTitle: "Antigravity CDP 注入状态",
    cdpStatusOk: "已连接 Antigravity 主界面",
    cdpStatusMissing: "未检测到 DevToolsActivePort（请带调试端口参数启动）",
    cdpFixShortcuts: "为 Windows 快捷方式一键添加调试参数",
    weNoPreview: "无预览",
    weSceneProperties: "壁纸属性",
    propSchemeColor: "主题色",
    ratingEveryone: "全年龄",
    ratingPg13: "13+",
    ratingMature: "成人向",
    ratingUnrated: "未分级",
    orientAll: "全部方向",
    orientLandscape: "横屏",
    orientPortrait: "竖屏",
    resetTab: "重置本页",
    resetTabConfirm: "将本页所有设置恢复为默认？",
    resetAll: "全部重置",
    resetAllConfirm: "将壁纸与液态玻璃的所有设置恢复出厂默认？（壁纸库目录与已导入文件保留）"
  }
};
function resolveLanguage(lang = "zh", systemLocale = "") {
  const explicit = String(lang || "").trim().toLowerCase();
  if (explicit === "zh" || explicit.startsWith("zh-")) return "zh";
  if (explicit === "en" || explicit.startsWith("en-")) return "en";
  let intlLocale = "";
  try {
    intlLocale = typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions()?.locale || "" : "";
  } catch {
  }
  const navLocale = typeof navigator !== "undefined" ? navigator.language || (Array.isArray(navigator.languages) ? navigator.languages[0] : "") || "" : "";
  const detected = String(
    systemLocale || globalThis.__AGY_SKINS_SYSTEM_LOCALE__ || navLocale || intlLocale || ""
  ).trim().toLowerCase();
  if (!detected) return "zh";
  return detected.startsWith("zh") ? "zh" : "en";
}
function createTranslator(lang = "zh", systemLocale = "") {
  const resolved = resolveLanguage(lang, systemLocale);
  const dict = resolved === "zh" ? I18N_DICTIONARY.zh : I18N_DICTIONARY.en;
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
      else if (k in node && k !== "list" && k !== "role") node[k] = v;
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
async function callBackend(action, body = {}, auth = null) {
  if (auth?.origin && auth?.studioToken) {
    const res2 = await fetch(`${auth.origin}/studio-api/${action}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-agy-studio-token": auth.studioToken
      },
      body: JSON.stringify(body)
    });
    if (!res2.ok) throw new Error(`HTTP ${res2.status}`);
    return await res2.json();
  }
  const mode = typeof window !== "undefined" && window.__AGY_SKINS_HOST_MODE__ || "studio";
  if (mode === "aux" && typeof window !== "undefined" && window.sidecar?.fetch) {
    const res2 = await window.sidecar.fetch(`/api/${action}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    return await res2.json();
  }
  const token = typeof window !== "undefined" && window.__AGY_SKINS_STUDIO_TOKEN__ || "";
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
function createPanelStore({ getAuth = null, embed = "" } = {}) {
  const auth = () => typeof getAuth === "function" ? getAuth() : null;
  const state = {
    embed,
    config: null,
    weItems: [],
    cdp: null,
    mediaOrigin: "",
    systemLocale: auth()?.systemLocale || globalThis.__AGY_SKINS_SYSTEM_LOCALE__ || "",
    tab: "library",
    toast: null,
    scanning: false,
    busyAction: "",
    diagnostics: null,
    systemFonts: [],
    fontsLoaded: false,
    fontsLoading: false,
    discoveredSlots: [],
    // UI view states matching dsh-wallpaper-engine
    pickerOpen: false,
    pickerDraft: false,
    modalView: "normal",
    batchMode: false,
    batchSelected: [],
    propsOpen: false,
    showGlassDetail: false,
    editingGroup: null,
    manualSourceOpen: false,
    presetSaveMode: "",
    // '' | 'save' | 'export'
    presetDraftName: "",
    presetExportId: "",
    fontSetDraftName: "",
    fontOnlyModified: false,
    fontAdvanced: false,
    armedConfirm: "",
    search: "",
    sectionsOpen: {
      glassPresets: true,
      glassUi: true,
      detail: true,
      corners: true,
      uiColor: false,
      font: false
    }
  };
  const listeners = /* @__PURE__ */ new Set();
  let deferFlushTimer = null;
  const notify = () => {
    for (const fn of listeners) fn(state);
  };
  const rpc = (action, body = {}) => callBackend(action, body, auth());
  const showToast = (message, kind = "info") => {
    state.toast = message ? { message, kind, at: Date.now() } : null;
    notify();
    if (message) {
      setTimeout(() => {
        if (state.toast?.message === message) {
          state.toast = null;
          notify();
        }
      }, 2800);
    }
  };
  const getLang = () => resolveLanguage(
    state.config?.uiLanguage || "zh",
    state.systemLocale || auth()?.systemLocale || globalThis.__AGY_SKINS_SYSTEM_LOCALE__ || ""
  );
  const getT = () => createTranslator(
    state.config?.uiLanguage || "zh",
    state.systemLocale || auth()?.systemLocale || globalThis.__AGY_SKINS_SYSTEM_LOCALE__ || ""
  );
  const isZh = () => getLang() === "zh";
  const loadInitial = async () => {
    const data = await rpc("get-state");
    if (data?.config) state.config = data.config;
    if (Array.isArray(data?.weItems)) state.weItems = data.weItems;
    if (data?.cdp) state.cdp = data.cdp;
    if (data?.mediaOrigin) state.mediaOrigin = data.mediaOrigin;
    if (data?.systemLocale) state.systemLocale = data.systemLocale;
    notify();
    if (!state.weItems.length || state.weItems.every((i) => !i.previewUrl && i.previewPath)) {
      void rescanLibrary();
    }
    void refreshSlots();
  };
  const refreshSlots = async () => {
    if (typeof document !== "undefined") {
      const localSlots = [];
      const seen = /* @__PURE__ */ new Set();
      for (const node of document.querySelectorAll("[data-slot]")) {
        const s = node.getAttribute("data-slot")?.trim();
        if (s && !seen.has(s)) {
          seen.add(s);
          localSlots.push(s);
        }
      }
      if (localSlots.length) {
        state.discoveredSlots = localSlots;
        return localSlots;
      }
    }
    try {
      const res = await rpc("discover-slots");
      if (Array.isArray(res?.slots)) state.discoveredSlots = res.slots;
    } catch {
    }
    return state.discoveredSlots;
  };
  const updateConfig = async (patch, { defer = false, rerender = true } = {}) => {
    if (!state.config) return null;
    state.config = { ...state.config, ...patch };
    if (rerender) notify();
    try {
      const res = await rpc("update-config", { patch, defer });
      if (res?.config) {
        if (rerender) {
          state.config = res.config;
          notify();
        } else {
          state.config = res.config;
        }
      }
      if (defer) {
        if (deferFlushTimer) clearTimeout(deferFlushTimer);
        deferFlushTimer = setTimeout(() => {
          deferFlushTimer = null;
          void rpc("flush-config").catch(() => {
          });
        }, 320);
      }
    } catch (err) {
      if (rerender) showToast(String(err?.message || err), "warn");
    }
    return state.config;
  };
  const rescanLibrary = async () => {
    state.scanning = true;
    notify();
    try {
      const res = await rpc("we-scan");
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
      await updateConfig({ wallpaperPaused: false }, { rerender: false });
      const res = await rpc("we-apply", { item });
      if (res?.config) state.config = res.config;
    } finally {
      state.busyAction = "";
      notify();
    }
  };
  const resetModule = (moduleKey) => {
    const keys = RESET_MODULES[moduleKey];
    if (!keys?.length) return;
    const patch = {};
    for (const k of keys) patch[k] = structuredClone(DEFAULT_CONFIG[k]);
    void updateConfig(patch);
    showToast(isZh() ? "已恢复该模块默认设置" : "Module reset to defaults");
  };
  const resetTab = (tabId) => {
    const keys = TAB_RESET_KEYS[tabId];
    if (!keys?.length) return;
    const patch = {};
    for (const k of keys) patch[k] = structuredClone(DEFAULT_CONFIG[k]);
    state.armedConfirm = "";
    void updateConfig(patch);
    showToast(isZh() ? "已恢复本页默认设置" : "Current tab reset to defaults");
  };
  const syncExternal = (payload) => {
    if (!payload) return;
    let changed = false;
    if (payload.cdp) {
      state.cdp = payload.cdp;
      changed = true;
    }
    if (payload.systemLocale) {
      state.systemLocale = payload.systemLocale;
      changed = true;
    }
    if (changed) notify();
  };
  return {
    state,
    rpc,
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    notify,
    showToast,
    getLang,
    getT,
    isZh,
    loadInitial,
    refreshSlots,
    updateConfig,
    rescanLibrary,
    applyWallpaperItem,
    resetModule,
    resetTab,
    syncExternal
  };
}
function ctlText(label, hint = "", tooltip = "") {
  return el(
    "div",
    { className: "we-picker__ctl-text", title: tooltip || void 0 },
    el("span", { className: "we-picker__ctl-label" }, label),
    hint ? el("span", { className: "we-picker__ctl-hint" }, hint) : null
  );
}
function moduleResetButton({ title = "", onClick }) {
  return el("button", {
    className: "we-mod-reset",
    type: "button",
    title: title || "恢复该模块默认参数",
    onClick: (e) => {
      e.stopPropagation();
      onClick?.();
    }
  }, "↺");
}
function sectionHead({ title, open = true, onToggle = null, resetBtn = null }) {
  const interactive = typeof onToggle === "function";
  return el(
    "div",
    {
      className: `we-picker__section-head ${interactive ? "we-picker__section-head--toggle" : ""}`,
      role: interactive ? "button" : void 0,
      tabIndex: interactive ? 0 : void 0,
      "aria-expanded": interactive ? String(Boolean(open)) : void 0,
      onClick: interactive ? onToggle : void 0,
      onKeyDown: interactive ? (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggle();
        }
      } : void 0
    },
    el("span", { className: "we-picker__section-label" }, title),
    interactive ? el("span", { className: `we-picker__section-caret ${open ? "is-open" : ""}`, "aria-hidden": "true" }, "▾") : null,
    resetBtn
  );
}
function switchRow({ label, hint = "", tooltip = "", checked = false, disabled = false, onChange }) {
  return el(
    "label",
    { className: `we-picker__ctl ${disabled ? "we-picker__ctl--disabled" : ""}` },
    ctlText(label, hint, tooltip),
    el(
      "span",
      { className: "we-picker__switch" },
      el("input", {
        type: "checkbox",
        checked: Boolean(checked),
        disabled: Boolean(disabled),
        onChange: (e) => onChange?.(Boolean(e.target.checked))
      }),
      el(
        "span",
        { className: "we-picker__switch-track" },
        el("span", { className: "we-picker__switch-thumb" })
      )
    )
  );
}
function syncSliderFill(input, min, max, value) {
  const span = max - min;
  const pct = span > 0 ? Math.min(100, Math.max(0, (Number(value) - min) / span * 100)) : 0;
  input.style.setProperty("--we-fill", `${pct.toFixed(1)}%`);
}
function SliderRow({ label, tooltip = "", min, max, step = 1, value, unit = "", defaultValue = null, numberEdit = false, onChange, onCommit }) {
  const valNum = Number.isFinite(Number(value)) ? Number(value) : min;
  const displaySpan = !numberEdit ? el("span", null, `${valNum}${unit}`) : null;
  const numInput = numberEdit ? el("input", {
    type: "number",
    className: "we-picker__value-input",
    min: String(min),
    max: String(max),
    step: String(step),
    value: String(valNum),
    onChange: (e) => {
      const clamped = Math.min(max, Math.max(min, Number(e.target.value) || min));
      slider.value = String(clamped);
      syncSliderFill(slider, min, max, clamped);
      onCommit?.(clamped);
    }
  }) : null;
  const slider = el("input", {
    type: "range",
    className: "we-picker__slider",
    min: String(min),
    max: String(max),
    step: String(step),
    value: String(valNum),
    onInput: (e) => {
      const v = Number(e.target.value);
      syncSliderFill(e.target, min, max, v);
      if (displaySpan) displaySpan.textContent = `${v}${unit}`;
      if (numInput) numInput.value = String(v);
      onChange?.(v);
    },
    onChange: (e) => {
      const v = Number(e.target.value);
      onCommit?.(v);
    }
  });
  syncSliderFill(slider, min, max, valNum);
  const labelEl = el("span", {
    className: "we-picker__label",
    title: tooltip || label,
    onDblClick: defaultValue !== null ? () => {
      slider.value = String(defaultValue);
      syncSliderFill(slider, min, max, defaultValue);
      if (displaySpan) displaySpan.textContent = `${defaultValue}${unit}`;
      if (numInput) numInput.value = String(defaultValue);
      onCommit?.(defaultValue);
    } : void 0
  }, label);
  return el(
    "div",
    { className: "we-picker__slider-row" },
    labelEl,
    slider,
    el(
      "span",
      { className: "we-picker__value" },
      displaySpan || [numInput, unit ? el("span", { className: "we-picker__value-unit" }, unit) : null]
    )
  );
}
function configSlider(store, cfgKey, label, opts = {}) {
  const r = PARAM_RANGES[cfgKey];
  const min = opts.min ?? r.min;
  const max = opts.max ?? r.max;
  const step = opts.step ?? (Number.isInteger(max) && max > 10 ? 1 : 0.1);
  return SliderRow({
    label,
    tooltip: opts.tooltip || "",
    min,
    max,
    step,
    unit: opts.unit ?? r.unit ?? "",
    value: store.state.config[cfgKey],
    defaultValue: opts.defaultValue ?? DEFAULT_CONFIG[cfgKey],
    numberEdit: Boolean(opts.numberEdit),
    onChange: (v) => void store.updateConfig({ [cfgKey]: v }, { defer: true, rerender: false }),
    onCommit: (v) => void store.updateConfig({ [cfgKey]: v }, { defer: false, rerender: opts.rerenderOnCommit === true })
  });
}
function segRow({ label, hint = "", tooltip = "", items, value, onPick, chips = false, equalCorners = false }) {
  const segClass = `we-picker__seg${chips ? " we-picker__seg--chips" : ""}${equalCorners ? " we-picker__seg--corners-eq" : ""}`;
  return el(
    "div",
    { className: "we-picker__ctl we-picker__ctl--wrap" },
    ctlText(label, hint, tooltip),
    el(
      "div",
      { className: segClass },
      items.map((item) => el("button", {
        type: "button",
        className: `we-picker__btn we-picker__rate ${item.active !== void 0 ? item.active ? "we-picker__rate--active" : "" : value === item.id ? "we-picker__rate--active" : ""}`,
        title: item.hint || "",
        onClick: () => onPick?.(item.id)
      }, item.label))
    )
  );
}
function selectRow({ label, hint = "", tooltip = "", value, options, disabled = false, onChange }) {
  return el(
    "div",
    { className: `we-picker__ctl ${disabled ? "we-picker__ctl--disabled" : ""}` },
    ctlText(label, hint, tooltip),
    el("select", {
      className: "we-picker__select",
      value: String(value ?? ""),
      disabled: Boolean(disabled),
      onChange: (e) => onChange?.(e.target.value)
    }, options.map((opt) => el("option", {
      value: String(opt.value),
      selected: String(opt.value) === String(value)
    }, opt.label)))
  );
}
function swatchRow({ label, hint = "", tooltip = "", presets, value, colorValue = "", onPick, autoBtn = null, disabled = false }) {
  const norm = String(value || "").toLowerCase();
  const hexVal = /^#[0-9a-f]{6}$/i.test(colorValue || value || "") ? colorValue || value : "#4f8cff";
  return el(
    "div",
    { className: `we-picker__ctl we-picker__ctl--wrap ${disabled ? "we-picker__ctl--disabled" : ""}` },
    ctlText(label, hint, tooltip),
    el(
      "div",
      { className: "we-picker__swatches" },
      autoBtn,
      presets.map((c) => el("button", {
        type: "button",
        className: `we-picker__swatch ${norm === c.toLowerCase() ? "we-picker__swatch--active" : ""}`,
        style: { backgroundColor: c },
        title: c,
        onClick: () => onPick?.(c, false)
      })),
      el(
        "label",
        { className: "we-picker__swatch-custom", title: "自定义颜色" },
        el("input", {
          type: "color",
          value: hexVal,
          onInput: (e) => onPick?.(e.target.value, true),
          onChange: (e) => onPick?.(e.target.value, false)
        })
      )
    )
  );
}
function renderConfirmRow({ armedToken, token, question, confirmLabel = "确认", cancelLabel = "取消", onConfirm, onCancel, danger = false }) {
  if (!token || armedToken !== token) return null;
  return el(
    "div",
    { className: "we-confirm-row" },
    el("span", { className: "we-picker__hint" }, question),
    el(
      "div",
      { className: "we-picker__ctl-side" },
      el("button", {
        type: "button",
        className: `we-picker__btn we-picker__btn--mini ${danger ? "we-picker__btn--danger" : "we-picker__btn--primary"}`,
        onClick: onConfirm
      }, confirmLabel),
      el("button", {
        type: "button",
        className: "we-picker__btn we-picker__btn--mini",
        onClick: onCancel
      }, cancelLabel)
    )
  );
}
function renderTabReset(store, tabId) {
  const t = store.getT();
  const token = `tab-reset:${tabId}`;
  const armed = store.state.armedConfirm === token;
  return el(
    "div",
    { className: "we-picker__section" },
    el(
      "div",
      { className: "we-picker__ctl" },
      el("span", { className: "we-picker__section-reset-label", style: { fontWeight: "600", fontSize: "0.88em" } }, t("resetTab")),
      el("button", {
        type: "button",
        className: "we-picker__btn",
        disabled: armed,
        onClick: () => {
          store.state.armedConfirm = token;
          store.notify();
        }
      }, t("resetTab"))
    ),
    renderConfirmRow({
      armedToken: store.state.armedConfirm,
      token,
      question: t("resetTabConfirm"),
      confirmLabel: t("confirmBtn"),
      cancelLabel: t("cancelBtn"),
      danger: true,
      onConfirm: () => store.resetTab(tabId),
      onCancel: () => {
        store.state.armedConfirm = "";
        store.notify();
      }
    })
  );
}

// src/ui/tabs/library-tab.js
function isUploadItem(item) {
  if (!item) return false;
  return item.source === "upload" || item.source === "uploads" || item.isUploaded === true || item.isUpload === true || String(item.id || "").startsWith("upload") || /[/\\]\.agy-skins[/\\]uploads[/\\]/i.test(String(item.mediaPath || item.filePath || ""));
}
function weColorToHex(val, fallback = "#000000") {
  const s = String(val ?? "").trim();
  if (/^#[0-9a-f]{6}$/i.test(s)) return s.toLowerCase();
  const parts = s.split(/[\s,]+/).filter(Boolean).map(Number);
  if (parts.length >= 3 && parts.slice(0, 3).every(Number.isFinite)) {
    const isByte = parts.slice(0, 3).some((n) => n > 1);
    const toByte = (n) => Math.min(255, Math.max(0, Math.round(isByte ? n : n * 255)));
    return `#${parts.slice(0, 3).map((n) => toByte(n).toString(16).padStart(2, "0")).join("")}`;
  }
  return fallback;
}
function hexToWeColor(hex) {
  const m = String(hex || "").trim().match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
  if (!m) return "0 0 0";
  return m.slice(1).map((h) => {
    const f = parseInt(h, 16) / 255;
    return f === 0 ? "0" : f === 1 ? "1" : f.toFixed(4).replace(/\.?0+$/, "");
  }).join(" ");
}
function formatWePropLabel(prop, t) {
  const raw = String(prop?.text || prop?.name || "").trim();
  const normalized = raw.toLowerCase().replace(/[\s-]+/g, "_");
  if (normalized === "ui_browse_properties_scheme_color" || normalized === "schemecolor" || normalized === "scheme_color") {
    return t("propSchemeColor");
  }
  return raw.replace(/^ui_browse_properties_/i, "").replace(/^ui_/i, "").replace(/_/g, " ").trim() || prop?.name || "";
}
function getKindBadge(kind, t) {
  return {
    video: t("weTypeVideo"),
    scene: t("weTypeScene"),
    image: t("weTypeImage"),
    web: t("weTypeWeb")
  }[kind] || String(kind || t("weTypeOther")).toUpperCase();
}
function getTypeSubtitle(config, t) {
  if (!config.wallpaperEnabled) return t("selectWallpaperFirst");
  const base = {
    video: t("typeVideoLabel"),
    web: t("typeWebLabel"),
    image: t("typeImageLabel"),
    scene: config.sceneLive !== false && config.wallpaperMode !== "frame" ? t("typeSceneLiveLabel") : t("typeSceneFrameLabel")
  }[config.wallpaperType] || t("typeImageLabel");
  return `${base}${config.wallpaperPaused ? t("statusPaused") : t("statusPlaying")}`;
}
function renderPropsEditor(store) {
  const { config } = store.state;
  const t = store.getT();
  const sel = config.weSelection;
  const props = Array.isArray(sel?.properties) ? sel.properties.filter((p) => !p.hidden) : [];
  if (!props.length) return null;
  return el(
    "div",
    { className: "we-picker__props" },
    props.map((prop) => {
      const curVal = config.userProps?.[sel.id]?.[prop.name] ?? prop.value;
      const label = formatWePropLabel(prop, t);
      const setProp = (val, { rerender = true } = {}) => {
        const next = structuredClone(config.userProps || {});
        next[sel.id] = { ...next[sel.id] || {}, [prop.name]: val };
        void store.updateConfig({ userProps: next }, { defer: !rerender, rerender });
      };
      if (prop.type === "bool") {
        return switchRow({ label, checked: Boolean(curVal), onChange: (v) => setProp(v) });
      }
      if (prop.type === "color" || /^\s*\d+(?:\.\d+)?(?:\s+|,)\d+(?:\.\d+)?(?:\s+|,)\d+(?:\.\d+)?\s*$/.test(String(curVal ?? ""))) {
        const hexVal = weColorToHex(curVal, "#000000");
        return el(
          "div",
          { className: "we-picker__ctl" },
          el("span", { className: "we-picker__ctl-label" }, label),
          el(
            "label",
            { className: "we-picker__swatch-custom" },
            el("input", {
              type: "color",
              value: hexVal,
              onInput: (e) => setProp(hexToWeColor(e.target.value), { rerender: false }),
              onChange: (e) => setProp(hexToWeColor(e.target.value), { rerender: true })
            })
          )
        );
      }
      if (prop.type === "combo" && Array.isArray(prop.options)) {
        return selectRow({
          label,
          value: String(curVal ?? ""),
          options: prop.options.map((o) => ({ value: String(o.value), label: o.label || String(o.value) })),
          onChange: (v) => setProp(v)
        });
      }
      if (prop.type === "slider") {
        const min = Number.isFinite(prop.min) ? prop.min : 0;
        const max = Number.isFinite(prop.max) ? prop.max : 100;
        const step = Number.isFinite(prop.step) && prop.step > 0 ? prop.step : 0.1;
        return SliderRow({
          label,
          min,
          max,
          step,
          value: Number.isFinite(Number(curVal)) ? Number(curVal) : min,
          defaultValue: prop.default ?? min,
          onChange: (v) => setProp(v, { rerender: false }),
          onCommit: (v) => setProp(v, { rerender: true })
        });
      }
      return el(
        "div",
        { className: "we-picker__ctl" },
        el("span", { className: "we-picker__ctl-label" }, label),
        el("input", {
          type: "text",
          className: "we-picker__text",
          style: { maxWidth: "180px" },
          value: String(curVal ?? ""),
          onChange: (e) => setProp(e.target.value)
        })
      );
    })
  );
}
function renderPickerModal(store) {
  const { config, weItems, scanning, busyAction } = store.state;
  const t = store.getT();
  const isZh = store.isZh();
  const isDraft = Boolean(store.state.pickerDraft && store.state.editingGroup);
  const hiddenSet = new Set(config.hiddenWallpaperIds || []);
  const typeSet = new Set(config.typeFilter || WALLPAPER_TYPES);
  const ratingSet = new Set(config.contentRatingFilter || ["everyone"]);
  const showHidden = store.state.modalView === "hidden";
  const draftSet = isDraft ? new Set(store.state.editingGroup.wallpaperIds || []) : null;
  const baseMatchesSearchAndList = (item) => {
    if (showHidden !== hiddenSet.has(item.id)) return false;
    if (config.folderFilter && config.folderFilter !== "all" && item.libraryRoot !== config.folderFilter) return false;
    if (config.orientationFilter === "landscape" && item.width > 0 && item.height > 0 && item.width < item.height) return false;
    if (config.orientationFilter === "portrait" && item.width > 0 && item.height > 0 && item.height <= item.width) return false;
    const q = String(store.state.search || "").trim().toLowerCase();
    if (q) {
      const titleHit = String(item.title || "").toLowerCase().includes(q);
      const idHit = String(item.workshopId || "").toLowerCase().includes(q);
      if (!titleHit && !idHit) return false;
    }
    return true;
  };
  const filterItems = () => weItems.filter((item) => baseMatchesSearchAndList(item) && typeSet.has(item.kind) && ratingSet.has(item.contentrating || "everyone")).sort((a, b) => config.sortOrder === "title" ? String(a.title || "").localeCompare(String(b.title || ""), void 0, { sensitivity: "base" }) : (Number(b.mtimeMs) || 0) - (Number(a.mtimeMs) || 0));
  const ratingCounts = {};
  const typeCounts = {};
  for (const item of weItems) {
    if (!baseMatchesSearchAndList(item)) continue;
    const r = item.contentrating || "everyone";
    ratingCounts[r] = (ratingCounts[r] || 0) + 1;
    typeCounts[item.kind] = (typeCounts[item.kind] || 0) + 1;
  }
  const visibleCount = weItems.filter((i) => !hiddenSet.has(i.id)).length;
  const hiddenCount = weItems.filter((i) => hiddenSet.has(i.id)).length;
  const folders = [...new Set(weItems.map((i) => i.libraryRoot).filter(Boolean))];
  const batchSet = new Set(store.state.batchSelected);
  const gridHost = el("div", { className: "we-picker__grid" });
  const toggleMultiFilter = (field, allowed, value) => {
    const next = new Set(config[field] || allowed);
    if (next.has(value)) {
      if (next.size > 1) next.delete(value);
    } else {
      next.add(value);
    }
    void store.updateConfig({ [field]: [...next] });
  };
  const renderGridCards = () => {
    gridHost.innerHTML = "";
    const filtered = filterItems();
    if (!isDraft && !showHidden) {
      const canResume = !config.wallpaperEnabled && Boolean(config.wallpaperSource || config.weSelection);
      const label = config.wallpaperPaused ? isZh ? "▶ 播放" : "▶ Play" : config.wallpaperEnabled ? t("closeCard") : canResume ? isZh ? "▶ 播放" : "▶ Play" : isZh ? "✕ 关闭" : "✕ Off";
      gridHost.appendChild(el("div", {
        className: "we-picker__card",
        role: "button",
        tabIndex: 0,
        title: isZh ? "开关或恢复当前壁纸" : "Toggle active wallpaper",
        onClick: () => {
          if (config.wallpaperPaused) void store.updateConfig({ wallpaperPaused: false });
          else if (config.wallpaperEnabled) void store.updateConfig({ wallpaperEnabled: false });
          else if (canResume) void store.updateConfig({ wallpaperEnabled: true, wallpaperPaused: false });
        }
      }, el("div", { className: "we-picker__card-close" }, label)));
    }
    if (!filtered.length) {
      gridHost.appendChild(el("div", { className: "we-picker__hint", style: { gridColumn: "1 / -1", padding: "18px 0", textAlign: "center" } }, t("weEmpty")));
      return;
    }
    for (const item of filtered.slice(0, 220)) {
      const selected = config.weSelection?.id === item.id || config.wallpaperSource && config.wallpaperSource === item.mediaPath;
      const checked = isDraft ? draftSet.has(item.id) : batchSet.has(item.id);
      const card = el("div", {
        className: `we-picker__card ${!isDraft && selected ? "we-picker__card--selected" : ""} ${checked ? "we-picker__card--checked" : ""}`,
        role: "button",
        tabIndex: 0,
        title: item.title,
        onClick: () => {
          if (isDraft) {
            const list = store.state.editingGroup.wallpaperIds || [];
            store.state.editingGroup.wallpaperIds = list.includes(item.id) ? list.filter((x) => x !== item.id) : [...list, item.id];
            store.notify();
            return;
          }
          if (store.state.batchMode) {
            store.state.batchSelected = batchSet.has(item.id) ? store.state.batchSelected.filter((id) => id !== item.id) : [...store.state.batchSelected, item.id];
            store.notify();
            return;
          }
          if (busyAction === item.id) return;
          void store.applyWallpaperItem(item);
        }
      });
      if (item.previewUrl) {
        const placeholder = el("div", { className: "we-picker__card-placeholder", style: { display: "none" } }, t("weNoPreview"));
        card.appendChild(el("img", {
          src: item.previewUrl,
          loading: "lazy",
          alt: item.title,
          onError: (e) => {
            e.target.style.display = "none";
            placeholder.style.display = "flex";
          }
        }));
        card.appendChild(placeholder);
      } else {
        card.appendChild(el("div", { className: "we-picker__card-placeholder" }, t("weNoPreview")));
      }
      if (isDraft || store.state.batchMode) {
        card.appendChild(el("span", { className: "we-picker__card-check" }, checked ? "✓" : ""));
      } else {
        card.appendChild(el("span", { className: "we-picker__card-type" }, getKindBadge(item.kind, t)));
      }
      if (selected && !isDraft) {
        card.appendChild(el("span", { className: "we-picker__card-badge" }, t("weSelected")));
      }
      if (!isDraft && !store.state.batchMode) {
        card.appendChild(el("button", {
          type: "button",
          className: "we-picker__card-hide",
          onClick: (e) => {
            e.stopPropagation();
            const next = new Set(hiddenSet);
            if (next.has(item.id)) next.delete(item.id);
            else next.add(item.id);
            void store.updateConfig({ hiddenWallpaperIds: [...next] });
          }
        }, showHidden ? t("weRestore") : t("weHide")));
      }
      card.appendChild(el("div", { className: "we-picker__card-title" }, item.title));
      gridHost.appendChild(card);
    }
  };
  renderGridCards();
  const ratingLabelMap = {
    everyone: t("ratingEveryone"),
    pg13: t("ratingPg13"),
    mature: t("ratingMature"),
    unrated: t("ratingUnrated")
  };
  return el(
    "div",
    {
      className: "we-picker__modal",
      dataset: { weCards: config.pickerLayout === "classic" ? "classic" : "fixed" }
    },
    el(
      "div",
      { className: "we-picker__modal-head" },
      el(
        "div",
        { className: "we-picker__modal-head-left" },
        el("button", {
          type: "button",
          className: "we-picker__btn",
          onClick: () => {
            store.state.pickerOpen = false;
            store.state.pickerDraft = false;
            store.state.batchMode = false;
            store.state.batchSelected = [];
            store.notify();
          }
        }, `← ${t("back")}`),
        el(
          "span",
          { className: "we-picker__modal-title" },
          isDraft ? isZh ? "为轮播列表勾选壁纸" : "Pick Playlist Wallpapers" : t("weTitle")
        )
      ),
      el(
        "div",
        { className: "we-picker__row" },
        !isDraft ? el("button", {
          type: "button",
          className: `we-picker__btn ${store.state.batchMode ? "is-on" : ""}`,
          onClick: () => {
            store.state.batchMode = !store.state.batchMode;
            if (!store.state.batchMode) store.state.batchSelected = [];
            store.notify();
          }
        }, store.state.batchMode ? t("exitBatch") : t("batchMode")) : null,
        el("button", {
          type: "button",
          className: "we-picker__btn",
          onClick: async () => {
            const res = await store.rpc("pick-folder", { title: t("weChooseFolder") });
            const picked = res?.paths?.[0];
            if (picked) {
              await store.updateConfig({ weRoots: [.../* @__PURE__ */ new Set([...config.weRoots || [], picked])] });
              await store.rescanLibrary();
            }
          }
        }, t("weChooseFolder")),
        el("button", {
          type: "button",
          className: "we-picker__btn",
          disabled: scanning,
          onClick: () => void store.rescanLibrary()
        }, scanning ? t("refreshing") : t("refresh"))
      )
    ),
    el(
      "div",
      { className: "we-picker__modal-tabs" },
      el("button", {
        type: "button",
        className: `we-picker__tab ${!showHidden ? "we-picker__tab--active" : ""}`,
        onClick: () => {
          store.state.modalView = "normal";
          store.state.batchSelected = [];
          store.notify();
        }
      }, t("normalListTab", visibleCount)),
      el("button", {
        type: "button",
        className: `we-picker__tab ${showHidden ? "we-picker__tab--active" : ""}`,
        onClick: () => {
          store.state.modalView = "hidden";
          store.state.batchSelected = [];
          store.notify();
        }
      }, t("hiddenListTab", hiddenCount))
    ),
    store.state.batchMode ? el(
      "div",
      { className: "we-picker__row" },
      el("span", { className: "we-picker__hint" }, t("batchSelectedCount", store.state.batchSelected.length)),
      el("button", {
        type: "button",
        className: "we-picker__btn we-picker__btn--mini",
        onClick: () => {
          store.state.batchSelected = filterItems().map((i) => i.id);
          store.notify();
        }
      }, isZh ? "全选当前" : "Select All"),
      el("button", {
        type: "button",
        className: "we-picker__btn we-picker__btn--mini we-picker__btn--primary",
        disabled: !store.state.batchSelected.length,
        onClick: () => {
          store.state.armedConfirm = "batch-hide";
          store.notify();
        }
      }, showHidden ? isZh ? "批量恢复" : "Restore Selected" : t("batchHide"))
    ) : null,
    renderConfirmRow({
      armedToken: store.state.armedConfirm,
      token: "batch-hide",
      question: showHidden ? isZh ? `恢复选中的 ${store.state.batchSelected.length} 张壁纸？` : `Restore ${store.state.batchSelected.length} wallpapers?` : isZh ? `隐藏选中的 ${store.state.batchSelected.length} 张壁纸？` : `Hide ${store.state.batchSelected.length} wallpapers?`,
      confirmLabel: t("confirmBtn"),
      cancelLabel: t("cancelBtn"),
      onConfirm: () => {
        const next = new Set(hiddenSet);
        for (const id of store.state.batchSelected) {
          if (showHidden) next.delete(id);
          else next.add(id);
        }
        store.state.batchMode = false;
        store.state.batchSelected = [];
        store.state.armedConfirm = "";
        void store.updateConfig({ hiddenWallpaperIds: [...next] });
      },
      onCancel: () => {
        store.state.armedConfirm = "";
        store.notify();
      }
    }),
    el(
      "div",
      { className: "we-picker__filter-row" },
      el("input", {
        type: "search",
        className: "we-picker__text we-picker__search",
        placeholder: t("weSearch"),
        value: store.state.search || "",
        onInput: (e) => {
          store.state.search = e.target.value;
          renderGridCards();
        }
      }),
      el(
        "select",
        {
          className: "we-picker__select",
          value: config.sortOrder || "newest",
          onChange: (e) => void store.updateConfig({ sortOrder: e.target.value })
        },
        el("option", { value: "newest", selected: config.sortOrder === "newest" }, isZh ? "最新排序" : "Newest"),
        el("option", { value: "title", selected: config.sortOrder === "title" }, isZh ? "名称排序" : "Title A-Z")
      ),
      el(
        "details",
        { className: "we-picker__rating-menu" },
        el(
          "summary",
          { className: "we-picker__rating-btn" },
          isZh ? `分级 · ${ratingSet.size}/4 ▾` : `Rating · ${ratingSet.size}/4 ▾`
        ),
        el(
          "div",
          { className: "we-picker__rating-list" },
          CONTENT_RATINGS.map((r) => el(
            "label",
            { className: "we-picker__rating-toggle" },
            el("input", {
              type: "checkbox",
              checked: ratingSet.has(r),
              onChange: () => toggleMultiFilter("contentRatingFilter", ["everyone"], r)
            }),
            el("span", { style: { flex: "1" } }, ratingLabelMap[r] || r),
            el("span", { className: "we-picker__hint" }, String(ratingCounts[r] || 0))
          ))
        )
      ),
      el(
        "details",
        { className: "we-picker__rating-menu" },
        el(
          "summary",
          { className: "we-picker__rating-btn" },
          isZh ? `类型 · ${typeSet.size}/4 ▾` : `Type · ${typeSet.size}/4 ▾`
        ),
        el(
          "div",
          { className: "we-picker__rating-list" },
          WALLPAPER_TYPES.map((kind) => el(
            "label",
            { className: "we-picker__rating-toggle" },
            el("input", {
              type: "checkbox",
              checked: typeSet.has(kind),
              onChange: () => toggleMultiFilter("typeFilter", WALLPAPER_TYPES, kind)
            }),
            el("span", { style: { flex: "1" } }, getKindBadge(kind, t)),
            el("span", { className: "we-picker__hint" }, String(typeCounts[kind] || 0))
          ))
        )
      ),
      folders.length > 1 ? el("select", {
        className: "we-picker__select",
        value: config.folderFilter || "all",
        onChange: (e) => void store.updateConfig({ folderFilter: e.target.value })
      }, [
        el("option", { value: "all", selected: config.folderFilter === "all" }, t("tagsAll")),
        ...folders.map((f) => el("option", { value: f, selected: config.folderFilter === f }, f))
      ]) : null,
      el(
        "div",
        { className: "we-picker__seg" },
        el("button", {
          type: "button",
          className: `we-picker__btn we-picker__rate ${config.pickerLayout !== "classic" ? "we-picker__rate--active" : ""}`,
          onClick: () => void store.updateConfig({ pickerLayout: "fixed" })
        }, isZh ? "常规网格" : "Grid"),
        el("button", {
          type: "button",
          className: `we-picker__btn we-picker__rate ${config.pickerLayout === "classic" ? "we-picker__rate--active" : ""}`,
          onClick: () => void store.updateConfig({ pickerLayout: "classic" })
        }, isZh ? "CD 架" : "CD Rack")
      )
    ),
    segRow({
      label: isZh ? "构图方向筛选" : "Orientation",
      value: config.orientationFilter || "all",
      items: ORIENTATION_FILTERS.map((o) => ({
        id: o,
        label: { all: t("orientAll"), landscape: t("orientLandscape"), portrait: t("orientPortrait") }[o]
      })),
      onPick: (id) => void store.updateConfig({ orientationFilter: id })
    }),
    showHidden && hiddenCount > 0 ? el(
      "div",
      { className: "we-picker__row" },
      el("button", {
        type: "button",
        className: "we-picker__btn we-picker__btn--mini",
        onClick: () => {
          store.state.armedConfirm = "restore-all";
          store.notify();
        }
      }, t("restoreAll")),
      renderConfirmRow({
        armedToken: store.state.armedConfirm,
        token: "restore-all",
        question: isZh ? `确认恢复全部 ${hiddenCount} 个隐藏壁纸？` : `Restore all ${hiddenCount} hidden wallpapers?`,
        confirmLabel: t("confirmBtn"),
        cancelLabel: t("cancelBtn"),
        onConfirm: () => {
          store.state.armedConfirm = "";
          void store.updateConfig({ hiddenWallpaperIds: [] });
        },
        onCancel: () => {
          store.state.armedConfirm = "";
          store.notify();
        }
      })
    ) : null,
    gridHost
  );
}
function renderRotationEditor(store) {
  const { config, weItems } = store.state;
  const t = store.getT();
  const isZh = store.isZh();
  const grp = store.state.editingGroup;
  if (!grp) return null;
  const byId = new Map(weItems.map((i) => [i.id, i]));
  return el(
    "div",
    { className: "we-picker__editor" },
    el(
      "div",
      { className: "we-picker__row" },
      el("input", {
        type: "text",
        className: "we-picker__text",
        placeholder: isZh ? "输入列表名称…" : "Playlist name…",
        value: grp.name || "",
        onInput: (e) => {
          grp.name = e.target.value;
        }
      }),
      el("button", {
        type: "button",
        className: "we-picker__btn",
        onClick: () => {
          store.state.pickerDraft = true;
          store.state.pickerOpen = true;
          store.notify();
        }
      }, isZh ? `从壁纸库勾选 (${(grp.wallpaperIds || []).length})` : `Pick Wallpapers (${(grp.wallpaperIds || []).length})`)
    ),
    segRow({
      label: isZh ? "切换顺序" : "Order",
      value: grp.order || "sequence",
      items: [
        { id: "sequence", label: isZh ? "顺序" : "Sequence" },
        { id: "random", label: isZh ? "随机" : "Random" }
      ],
      onPick: (id) => {
        grp.order = id;
        store.notify();
      }
    }),
    segRow({
      label: isZh ? "触发时机" : "Trigger",
      value: grp.trigger || "interval",
      items: [
        { id: "interval", label: isZh ? "按时间间隔" : "Interval" },
        { id: "videoEnd", label: isZh ? "视频播完后" : "Video End" }
      ],
      onPick: (id) => {
        grp.trigger = id;
        store.notify();
      }
    }),
    SliderRow({
      label: isZh ? "组内间隔" : "Group interval",
      min: ROTATION_INTERVAL_MIN,
      max: ROTATION_INTERVAL_MAX,
      step: 1,
      unit: "m",
      numberEdit: true,
      value: grp.interval ?? config.rotationMinutes,
      onChange: (v) => {
        grp.interval = v;
      },
      onCommit: (v) => {
        grp.interval = v;
      }
    }),
    (grp.wallpaperIds || []).length ? el(
      "div",
      { className: "we-picker__seg we-picker__seg--chips" },
      grp.wallpaperIds.map((id) => el("button", {
        type: "button",
        className: "we-picker__chip",
        title: isZh ? "点击移除" : "Click to remove",
        onClick: () => {
          grp.wallpaperIds = grp.wallpaperIds.filter((x) => x !== id);
          store.notify();
        }
      }, `${byId.get(id)?.title || id.split(/[\\/]/).at(-1)} ×`))
    ) : el("div", { className: "we-picker__hint" }, isZh ? "尚未勾选壁纸；点击右上“从壁纸库勾选”。" : "No wallpapers picked yet."),
    el(
      "div",
      { className: "we-picker__row", style: { justifyContent: "flex-end" } },
      el("button", {
        type: "button",
        className: "we-picker__btn we-picker__btn--primary",
        onClick: () => {
          const clean = {
            id: grp.id || `rg_${Date.now().toString(36)}`,
            name: String(grp.name || "").trim() || (isZh ? "新建列表" : "New Playlist"),
            interval: Math.max(ROTATION_INTERVAL_MIN, Math.min(ROTATION_INTERVAL_MAX, Number(grp.interval) || 30)),
            order: grp.order || "sequence",
            trigger: grp.trigger || "interval",
            wallpaperIds: [...grp.wallpaperIds || []]
          };
          const groups = [...config.rotationGroups || []];
          const idx = groups.findIndex((g) => g.id === clean.id);
          if (idx >= 0) groups[idx] = clean;
          else groups.push(clean);
          store.state.editingGroup = null;
          void store.updateConfig({ rotationGroups: groups, rotationGroupId: clean.id });
        }
      }, isZh ? "保存列表" : "Save"),
      el("button", {
        type: "button",
        className: "we-picker__btn",
        onClick: () => {
          store.state.editingGroup = null;
          store.notify();
        }
      }, t("cancelBtn"))
    )
  );
}
function renderLibraryTab(store) {
  if (store.state.pickerOpen) return renderPickerModal(store);
  const { config, weItems, scanning, busyAction } = store.state;
  const t = store.getT();
  const isZh = store.isZh();
  const sel = config.weSelection;
  const activeItem = sel?.id ? weItems.find((i) => i.id === sel.id) || sel : weItems.find((i) => config.wallpaperSource && i.mediaPath === config.wallpaperSource) || null;
  const previewSrc = activeItem?.previewUrl || "";
  const titleText = config.wallpaperEnabled ? activeItem?.title || (config.wallpaperSource ? config.wallpaperSource.split(/[\\/]/).at(-1) : t("noWallpaperSelected")) : t("noWallpaperSelected");
  const selProps = Array.isArray(sel?.properties) ? sel.properties.filter((p) => !p.hidden) : [];
  const isPlaying = Boolean(config.wallpaperEnabled && !config.wallpaperPaused);
  const directionalTransitions = /* @__PURE__ */ new Set(["push", "wipe", "bars"]);
  const uploads = weItems.filter(isUploadItem);
  const rotationGroups = config.rotationGroups || [];
  const activeGroup = rotationGroups.find((g) => g.id === config.rotationGroupId) || rotationGroups[0] || null;
  const urlInput = el("input", {
    type: "text",
    className: "we-picker__text",
    value: store.state.urlDraft || "",
    placeholder: isZh ? "粘贴 https:// 图片或视频直链下载到本地库" : "Paste https:// image/video URL to download",
    onInput: (e) => {
      store.state.urlDraft = e.target.value;
    }
  });
  const manualInput = el("input", {
    type: "text",
    className: "we-picker__text",
    value: config.wallpaperSource || "",
    placeholder: t("wallpaperSourcePlaceholder")
  });
  return el(
    "div",
    { className: "we-tabpanel" },
    /* 1. Current Wallpaper Hero Card */
    el(
      "div",
      { className: "we-picker__current" },
      el(
        "div",
        { className: `we-vinyl ${isPlaying ? "we-vinyl--playing" : ""}` },
        el(
          "div",
          { className: "we-vinyl__cover" },
          previewSrc ? el("img", { src: previewSrc, alt: titleText }) : el("div", { className: "we-vinyl__empty" }, "♪")
        ),
        el("div", { className: "we-vinyl__hole" })
      ),
      el(
        "div",
        { className: "we-picker__current-info" },
        el("div", { className: "we-picker__current-title", title: titleText }, titleText),
        el("span", { className: "we-picker__current-meta" }, getTypeSubtitle(config, t)),
        el(
          "div",
          { className: "we-picker__row", style: { marginTop: "8px" } },
          el("button", {
            type: "button",
            className: "we-picker__btn we-picker__btn--primary",
            onClick: () => {
              store.state.pickerDraft = false;
              store.state.pickerOpen = true;
              store.notify();
            }
          }, t("chooseWallpaper")),
          selProps.length > 0 ? el("button", {
            type: "button",
            className: `we-picker__btn ${store.state.propsOpen ? "is-on" : ""}`,
            onClick: () => {
              store.state.propsOpen = !store.state.propsOpen;
              store.notify();
            }
          }, t("wallpaperPropsBtn")) : null,
          el("button", {
            type: "button",
            className: "we-picker__btn",
            disabled: !config.wallpaperEnabled,
            onClick: () => void store.updateConfig({ wallpaperPaused: !config.wallpaperPaused })
          }, config.wallpaperPaused ? t("play") : t("pause")),
          el("button", {
            type: "button",
            className: `we-picker__btn ${config.wallpaperSound ? "is-on" : ""}`,
            onClick: () => {
              const nextSound = !config.wallpaperSound;
              const patch = { wallpaperSound: nextSound };
              if (nextSound && Number(config.wallpaperVolume) === 0) patch.wallpaperVolume = 50;
              void store.updateConfig(patch);
            }
          }, config.wallpaperSound ? t("audioOnBtn") : t("audioOffBtn")),
          el("button", {
            type: "button",
            className: "we-picker__btn",
            disabled: !weItems.length || busyAction === "next",
            onClick: async () => {
              store.state.busyAction = "next";
              store.notify();
              try {
                const res = await store.rpc("rotation-advance", {});
                if (res?.config) store.state.config = res.config;
              } finally {
                store.state.busyAction = "";
                store.notify();
              }
            }
          }, isZh ? "下一张" : "Next"),
          config.wallpaperEnabled || config.wallpaperSource ? el("button", {
            type: "button",
            className: "we-picker__btn we-picker__btn--danger",
            onClick: () => {
              store.state.armedConfirm = "clear-wallpaper";
              store.notify();
            }
          }, t("clear")) : null,
          el("button", {
            type: "button",
            className: "we-picker__btn",
            disabled: scanning,
            onClick: () => void store.rescanLibrary()
          }, scanning ? t("refreshing") : t("refresh"))
        )
      )
    ),
    renderConfirmRow({
      armedToken: store.state.armedConfirm,
      token: "clear-wallpaper",
      question: isZh ? "停止并清除当前壁纸？" : "Clear active wallpaper?",
      confirmLabel: t("confirmBtn"),
      cancelLabel: t("cancelBtn"),
      danger: true,
      onConfirm: () => {
        store.state.armedConfirm = "";
        store.state.propsOpen = false;
        void store.updateConfig({ wallpaperEnabled: false, wallpaperPaused: false, wallpaperSource: "", weSelection: null });
      },
      onCancel: () => {
        store.state.armedConfirm = "";
        store.notify();
      }
    }),
    store.state.propsOpen ? renderPropsEditor(store) : null,
    /* 2. Transition Section */
    el(
      "div",
      { className: "we-picker__section" },
      sectionHead({
        title: isZh ? "壁纸切换过场" : "Switch Transition",
        resetBtn: moduleResetButton({ onClick: () => store.resetModule("transition") })
      }),
      selectRow({
        label: t("wallpaperTransition"),
        value: config.wallpaperTransition || "cut",
        options: [
          { value: "cut", label: t("transitionCut") },
          { value: "fade", label: t("transitionFade") },
          { value: "push", label: t("transitionPush") },
          { value: "wipe", label: t("transitionWipe") },
          { value: "iris", label: t("transitionIris") },
          { value: "zoom", label: t("transitionZoom") },
          { value: "bars", label: t("transitionBars") }
        ],
        onChange: (v) => void store.updateConfig({ wallpaperTransition: v })
      }),
      directionalTransitions.has(config.wallpaperTransition) ? segRow({
        label: isZh ? "过场方向" : "Direction",
        value: config.wallpaperTransitionDir || "left",
        items: [
          { id: "left", label: t("dirLeft") },
          { id: "right", label: t("dirRight") },
          { id: "up", label: t("dirUp") },
          { id: "down", label: t("dirDown") }
        ],
        onPick: (id) => void store.updateConfig({ wallpaperTransitionDir: id })
      }) : null,
      config.wallpaperTransition && config.wallpaperTransition !== "cut" ? segRow({
        label: isZh ? "过场速度" : "Speed",
        value: config.wallpaperTransitionSpeed || "normal",
        items: [
          { id: "fast", label: t("speedFast") },
          { id: "normal", label: t("speedNormal") },
          { id: "slow", label: t("speedSlow") }
        ],
        onPick: (id) => void store.updateConfig({ wallpaperTransitionSpeed: id })
      }) : null
    ),
    /* 3. Auto Rotation Section */
    el(
      "div",
      { className: "we-picker__section" },
      sectionHead({
        title: isZh ? "自动轮播" : "Auto Rotation",
        resetBtn: moduleResetButton({ onClick: () => store.resetModule("rotation") })
      }),
      el(
        "div",
        { className: "we-picker__row" },
        el("select", {
          className: "we-picker__select",
          style: { flex: "1" },
          value: activeGroup?.id || "",
          onChange: (e) => void store.updateConfig({ rotationGroupId: e.target.value })
        }, [
          el("option", { value: "", selected: !activeGroup }, isZh ? "全部未隐藏壁纸" : "All visible wallpapers"),
          ...rotationGroups.map((g) => el("option", { value: g.id, selected: g.id === activeGroup?.id }, `${g.name} (${g.wallpaperIds.length})`))
        ]),
        el("button", {
          type: "button",
          className: "we-picker__btn",
          onClick: () => {
            store.state.editingGroup = {
              id: `rg_${Date.now().toString(36)}`,
              name: isZh ? `轮播列表 ${rotationGroups.length + 1}` : `Playlist ${rotationGroups.length + 1}`,
              interval: config.rotationMinutes || 30,
              order: "sequence",
              trigger: "interval",
              wallpaperIds: []
            };
            store.notify();
          }
        }, isZh ? "新建" : "New"),
        activeGroup ? el("button", {
          type: "button",
          className: "we-picker__btn",
          onClick: () => {
            store.state.editingGroup = structuredClone(activeGroup);
            store.notify();
          }
        }, isZh ? "编辑" : "Edit") : null,
        activeGroup ? el("button", {
          type: "button",
          className: "we-picker__btn we-picker__btn--danger",
          onClick: () => {
            store.state.armedConfirm = `del-rot:${activeGroup.id}`;
            store.notify();
          }
        }, isZh ? "删除" : "Delete") : null
      ),
      activeGroup ? renderConfirmRow({
        armedToken: store.state.armedConfirm,
        token: `del-rot:${activeGroup.id}`,
        question: isZh ? `删除轮播列表 “${activeGroup.name}”？` : `Delete playlist "${activeGroup.name}"?`,
        confirmLabel: t("confirmBtn"),
        cancelLabel: t("cancelBtn"),
        danger: true,
        onConfirm: () => {
          const next = rotationGroups.filter((g) => g.id !== activeGroup.id);
          store.state.armedConfirm = "";
          void store.updateConfig({ rotationGroups: next, rotationGroupId: next[0]?.id || "" });
        },
        onCancel: () => {
          store.state.armedConfirm = "";
          store.notify();
        }
      }) : null,
      renderRotationEditor(store),
      SliderRow({
        label: isZh ? "图片轮播间隔" : "Picture slide",
        min: 0,
        max: 300,
        step: 5,
        unit: "s",
        defaultValue: 0,
        numberEdit: true,
        value: Number(config.pictureSlideSeconds) || 0,
        onChange: (v) => void store.updateConfig({ pictureSlideSeconds: v }, { defer: true, rerender: false }),
        onCommit: (v) => void store.updateConfig({ pictureSlideSeconds: v })
      }),
      switchRow({
        label: t("rotationEnabled"),
        hint: t("rotationHint"),
        checked: config.rotationEnabled,
        onChange: (v) => void store.updateConfig({ rotationEnabled: v })
      }),
      config.rotationEnabled ? SliderRow({
        label: t("rotationInterval"),
        min: ROTATION_INTERVAL_MIN,
        max: ROTATION_INTERVAL_MAX,
        step: 1,
        unit: "m",
        defaultValue: 30,
        numberEdit: true,
        value: Number(config.rotationMinutes) || 30,
        onChange: (v) => void store.updateConfig({ rotationMinutes: v }, { defer: true, rerender: false }),
        onCommit: (v) => void store.updateConfig({ rotationMinutes: v })
      }) : null
    ),
    /* 4. Custom Wallpapers & Uploads */
    el(
      "div",
      { className: "we-picker__section" },
      sectionHead({ title: isZh ? "自定义壁纸与导入" : "Custom Wallpapers & Imports" }),
      el(
        "div",
        { className: "we-picker__row" },
        el("button", {
          type: "button",
          className: "we-picker__btn",
          onClick: async () => {
            const pick = await store.rpc("pick-files", { title: isZh ? "选择本地图片或视频" : "Import local image/video" });
            if (pick?.paths?.length) {
              const res = await store.rpc("uploads-import", { paths: pick.paths });
              if (res?.items?.length) {
                store.showToast(isZh ? `已导入 ${res.items.length} 个素材` : `Imported ${res.items.length} file(s)`);
                await store.rescanLibrary();
              }
            }
          }
        }, isZh ? "导入本地文件" : "Import Local Media"),
        el("button", {
          type: "button",
          className: "we-picker__btn",
          disabled: busyAction === "bing",
          onClick: async () => {
            store.state.busyAction = "bing";
            store.notify();
            try {
              const res = await store.rpc("uploads-bing", { index: 0 });
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
        }, isZh ? "Bing 每日一图" : "Bing Daily"),
        el("button", {
          type: "button",
          className: `we-picker__btn ${store.state.manualSourceOpen ? "is-on" : ""}`,
          onClick: () => {
            store.state.manualSourceOpen = !store.state.manualSourceOpen;
            store.notify();
          }
        }, isZh ? "手动路径/URL" : "Manual Source")
      ),
      el(
        "div",
        { className: "we-picker__row" },
        urlInput,
        el("button", {
          type: "button",
          className: "we-picker__btn",
          disabled: busyAction === "url",
          onClick: async () => {
            const url = urlInput.value.trim();
            if (!url) return;
            store.state.busyAction = "url";
            store.notify();
            try {
              const res = await store.rpc("uploads-url", { url });
              if (res?.ok && res?.item) {
                store.state.urlDraft = "";
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
        }, isZh ? "下载并应用" : "Fetch URL")
      ),
      store.state.manualSourceOpen ? el(
        "div",
        { className: "we-picker__editor" },
        el(
          "div",
          { className: "we-picker__row" },
          manualInput,
          el("button", {
            type: "button",
            className: "we-picker__btn we-picker__btn--primary",
            onClick: () => {
              const src = String(manualInput.value || "").trim();
              if (!src) {
                void store.updateConfig({ wallpaperEnabled: false, wallpaperSource: "", weSelection: null });
                return;
              }
              const inferredType = /\.(mp4|webm|mov|mkv|avi)(?:$|\?)/i.test(src) ? "video" : /\.html?(?:$|\?)/i.test(src) ? "web" : "image";
              void store.updateConfig({ wallpaperEnabled: true, wallpaperPaused: false, wallpaperType: inferredType, wallpaperSource: src, weSelection: null });
            }
          }, isZh ? "直接应用" : "Apply")
        ),
        (config.weRoots || []).length ? el(
          "div",
          { className: "we-picker__seg we-picker__seg--chips" },
          config.weRoots.map((root) => el("button", {
            type: "button",
            className: "we-picker__chip",
            title: isZh ? "点击移除该自定义目录" : "Remove custom root",
            onClick: async () => {
              await store.updateConfig({ weRoots: config.weRoots.filter((r) => r !== root) });
              await store.rescanLibrary();
            }
          }, `${root} ×`))
        ) : null
      ) : null,
      uploads.length ? el(
        "div",
        { className: "we-picker__uploads" },
        el("div", { className: "we-picker__hint" }, isZh ? `已导入素材（${uploads.length}）` : `Uploaded files (${uploads.length})`),
        el(
          "div",
          { className: "we-picker__uploads-list" },
          uploads.map((item) => {
            const rmToken = `rm-up:${item.id}`;
            return el(
              "div",
              { style: { display: "flex", flexDirection: "column", gap: "4px" } },
              el(
                "div",
                { className: "we-picker__uploads-item" },
                el("span", { className: "we-picker__uploads-name", title: item.title }, item.title),
                el("button", {
                  type: "button",
                  className: "we-picker__btn we-picker__btn--mini",
                  onClick: () => void store.applyWallpaperItem(item)
                }, t("weUse")),
                el("button", {
                  type: "button",
                  className: "we-picker__btn we-picker__btn--mini we-picker__btn--danger",
                  onClick: () => {
                    store.state.armedConfirm = rmToken;
                    store.notify();
                  }
                }, isZh ? "移除" : "Remove")
              ),
              renderConfirmRow({
                armedToken: store.state.armedConfirm,
                token: rmToken,
                question: isZh ? `彻底删除已导入文件 “${item.title}”？` : `Delete uploaded file "${item.title}"?`,
                confirmLabel: t("confirmBtn"),
                cancelLabel: t("cancelBtn"),
                danger: true,
                onConfirm: async () => {
                  store.state.armedConfirm = "";
                  await store.rpc("uploads-remove", {
                    path: item.mediaPath || item.filePath || "",
                    filePath: item.mediaPath || item.filePath || "",
                    id: item.id
                  });
                  await store.rescanLibrary();
                },
                onCancel: () => {
                  store.state.armedConfirm = "";
                  store.notify();
                }
              })
            );
          })
        )
      ) : null
    )
  );
}

// src/ui/tabs/appearance-tab.js
var COLOR_HEX_RE = /^#[0-9a-f]{6}$/i;
var TYPE_ROLE_LABELS = {
  "markdown-h1": ["一级标题 H1", "Heading H1"],
  "markdown-h2": ["二级标题 H2", "Heading H2"],
  "markdown-h3": ["三级标题 H3", "Heading H3"],
  "markdown-h4": ["四级标题 H4", "Heading H4"],
  "markdown-base": ["对话正文", "Markdown Base"],
  "markdown-small": ["小号文本", "Markdown Small"],
  "markdown-code": ["行内代码", "Inline Code"],
  "markdown-code-block": ["代码块", "Code Block"],
  "markdown-table": ["表格正文字体", "Table Body"],
  "markdown-table-head": ["表头字体", "Table Head"],
  "xs-13": ["常规 UI 13px", "UI XS 13px"],
  "xxs-12": ["辅助标签 12px", "UI XXS 12px"]
};
function toggleSection(store, key) {
  store.state.sectionsOpen[key] = !store.state.sectionsOpen[key];
  store.notify();
}
function pickFontSetValues(cfg) {
  const out = {};
  for (const k of FONT_SET_KEYS) out[k] = structuredClone(cfg[k]);
  return out;
}
function cornerButtons(store, prefix, label, equalCorners) {
  const cfg = store.state.config;
  const isZh = store.isZh();
  const items = [
    { key: `${prefix}SquareTL`, id: "TL", label: isZh ? "左上直角" : "Square TL" },
    { key: `${prefix}SquareTR`, id: "TR", label: isZh ? "右上直角" : "Square TR" },
    { key: `${prefix}SquareBR`, id: "BR", label: isZh ? "右下直角" : "Square BR" },
    { key: `${prefix}SquareBL`, id: "BL", label: isZh ? "左下直角" : "Square BL" }
  ];
  return segRow({
    label,
    chips: !equalCorners,
    equalCorners,
    items: items.map((it) => ({
      id: it.id,
      label: it.label,
      active: Boolean(cfg[it.key])
    })),
    onPick: (id) => {
      const target = items.find((it) => it.id === id);
      if (target) void store.updateConfig({ [target.key]: !cfg[target.key] });
    }
  });
}
function renderPresetsSection(store) {
  const { config } = store.state;
  const t = store.getT();
  const isZh = store.isZh();
  const open = store.state.sectionsOpen.glassPresets !== false;
  const userPresets = config.userPresets || [];
  const allPresets = [...FACTORY_GLASS_PRESETS, ...userPresets];
  const importInput = el("input", {
    type: "file",
    accept: ".json,application/json",
    style: { display: "none" },
    onChange: async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const parsed = JSON.parse(await file.text());
        const values = extractGlassPresetValues(parsed.values || parsed);
        if (!Object.keys(values).length) throw new Error("empty");
        if (parsed.name && userPresets.length < 8) {
          const nextItem = sanitizeUserPresets([{
            id: `usr_${Date.now().toString(36)}`,
            name: String(parsed.name).slice(0, 60),
            values
          }])[0];
          const nextList = nextItem ? [...userPresets, nextItem] : userPresets;
          await store.updateConfig({ ...values, userPresets: nextList, activePresetId: nextItem?.id || "" });
        } else {
          await store.updateConfig({ ...values, activePresetId: "" });
        }
        store.showToast(t("presetImported"));
      } catch {
        store.showToast(t("presetInvalid"), "warn");
      } finally {
        e.target.value = "";
      }
    }
  });
  return el(
    "div",
    { className: "we-picker__section" },
    sectionHead({
      title: isZh ? "主题预设" : "Theme Presets",
      open,
      onToggle: () => toggleSection(store, "glassPresets")
    }),
    open ? [
      el(
        "div",
        { className: "we-picker__preset-grid" },
        FACTORY_GLASS_PRESETS.map((preset) => el(
          "div",
          {
            className: `we-picker__preset-cell ${config.activePresetId === preset.id ? "we-picker__preset-cell--active" : ""}`
          },
          el("button", {
            type: "button",
            className: "we-picker__btn",
            title: isZh ? preset.nameZh : preset.nameEn,
            onClick: () => void store.updateConfig({ ...structuredClone(preset.values), activePresetId: preset.id })
          }, isZh ? preset.nameZh : preset.nameEn)
        )),
        userPresets.map((preset) => el(
          "div",
          {
            className: `we-picker__preset-cell ${config.activePresetId === preset.id ? "we-picker__preset-cell--active" : ""}`
          },
          el("button", {
            type: "button",
            className: "we-picker__btn",
            title: preset.name,
            onClick: () => void store.updateConfig({ ...structuredClone(preset.values), activePresetId: preset.id })
          }, preset.name),
          el("button", {
            type: "button",
            className: "we-picker__btn we-picker__preset-del",
            title: isZh ? "删除预设" : "Delete preset",
            onClick: () => {
              store.state.armedConfirm = `del-preset:${preset.id}`;
              store.notify();
            }
          }, "×")
        )),
        userPresets.length < 8 ? el(
          "div",
          { className: "we-picker__preset-cell we-picker__preset-cell--empty" },
          el("button", {
            type: "button",
            className: "we-picker__btn we-picker__btn--mini",
            style: { border: "0" },
            onClick: () => {
              store.state.presetSaveMode = "save";
              store.state.presetDraftName = isZh ? `我的预设 ${userPresets.length + 1}` : `Preset ${userPresets.length + 1}`;
              store.notify();
            }
          }, isZh ? `+ 槽位 (${userPresets.length}/8)` : `+ Slot (${userPresets.length}/8)`)
        ) : null
      ),
      ...userPresets.map((preset) => renderConfirmRow({
        armedToken: store.state.armedConfirm,
        token: `del-preset:${preset.id}`,
        question: isZh ? `删除用户预设 “${preset.name}”？` : `Delete preset "${preset.name}"?`,
        confirmLabel: t("confirmBtn"),
        cancelLabel: t("cancelBtn"),
        danger: true,
        onConfirm: () => {
          const next = userPresets.filter((p) => p.id !== preset.id);
          store.state.armedConfirm = "";
          void store.updateConfig({
            userPresets: next,
            activePresetId: config.activePresetId === preset.id ? "" : config.activePresetId
          });
        },
        onCancel: () => {
          store.state.armedConfirm = "";
          store.notify();
        }
      })),
      el(
        "div",
        { className: "we-picker__row" },
        importInput,
        el("button", {
          type: "button",
          className: "we-picker__btn",
          disabled: userPresets.length >= 8,
          onClick: () => {
            store.state.presetSaveMode = store.state.presetSaveMode === "save" ? "" : "save";
            store.state.presetDraftName = isZh ? `自定义方案 ${userPresets.length + 1}` : `Custom ${userPresets.length + 1}`;
            store.notify();
          }
        }, t("savePresetBtn")),
        el("button", {
          type: "button",
          className: "we-picker__btn",
          onClick: () => {
            store.state.presetSaveMode = store.state.presetSaveMode === "export" ? "" : "export";
            store.state.presetExportId = config.activePresetId || "current";
            store.notify();
          }
        }, t("exportPreset")),
        el("button", {
          type: "button",
          className: "we-picker__btn",
          onClick: () => importInput.click()
        }, t("importPreset"))
      ),
      store.state.presetSaveMode === "save" ? el(
        "div",
        { className: "we-picker__editor" },
        el(
          "div",
          { className: "we-picker__row" },
          el("input", {
            type: "text",
            className: "we-picker__text",
            value: store.state.presetDraftName || "",
            placeholder: isZh ? "输入预设名称…" : "Preset name…",
            onInput: (e) => {
              store.state.presetDraftName = e.target.value;
            }
          }),
          el("button", {
            type: "button",
            className: "we-picker__btn we-picker__btn--primary",
            onClick: () => {
              const id = `usr_${Date.now().toString(36)}`;
              const name = String(store.state.presetDraftName || "").trim() || (isZh ? `自定义 ${userPresets.length + 1}` : `Custom ${userPresets.length + 1}`);
              const next = sanitizeUserPresets([
                ...userPresets,
                { id, name, values: extractGlassPresetValues(config) }
              ]);
              store.state.presetSaveMode = "";
              void store.updateConfig({ userPresets: next, activePresetId: id });
            }
          }, t("confirmBtn")),
          el("button", {
            type: "button",
            className: "we-picker__btn",
            onClick: () => {
              store.state.presetSaveMode = "";
              store.notify();
            }
          }, t("cancelBtn"))
        )
      ) : null,
      store.state.presetSaveMode === "export" ? el(
        "div",
        { className: "we-picker__editor" },
        el(
          "div",
          { className: "we-picker__row" },
          el("select", {
            className: "we-picker__select",
            style: { flex: "1" },
            value: store.state.presetExportId || "current",
            onChange: (e) => {
              store.state.presetExportId = e.target.value;
              store.notify();
            }
          }, [
            el("option", { value: "current", selected: store.state.presetExportId === "current" }, isZh ? "当前画面全部参数" : "Current live glass config"),
            ...allPresets.map((p) => el("option", {
              value: p.id,
              selected: store.state.presetExportId === p.id
            }, p.name || (isZh ? p.nameZh : p.nameEn)))
          ]),
          el("button", {
            type: "button",
            className: "we-picker__btn we-picker__btn--primary",
            onClick: () => {
              const picked = allPresets.find((p) => p.id === store.state.presetExportId);
              const payload = {
                name: picked ? picked.name || picked.nameZh || picked.nameEn : "agy-skins-preset",
                values: picked ? picked.values : extractGlassPresetValues(config)
              };
              const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = el("a", { href: url, download: `${payload.name.replace(/[^\w\u4e00-\u9fa5-]+/g, "-")}.json` });
              a.click();
              setTimeout(() => URL.revokeObjectURL(url), 1e3);
              store.state.presetSaveMode = "";
              store.showToast(t("presetExported"));
            }
          }, isZh ? "下载 JSON" : "Download JSON"),
          el("button", {
            type: "button",
            className: "we-picker__btn",
            onClick: () => {
              store.state.presetSaveMode = "";
              store.notify();
            }
          }, t("cancelBtn"))
        )
      ) : null
    ] : null
  );
}
function renderGlassSection(store) {
  const { config } = store.state;
  const t = store.getT();
  const isZh = store.isZh();
  const open = store.state.sectionsOpen.glassUi !== false;
  const glassColor = config.glassColor || { light: "#ffffff", dark: "#0d1524" };
  const withSurfaceCustom = (surface, patch, opts) => {
    const nextMode = { ...config.glassMode || {}, [surface]: "custom" };
    void store.updateConfig({ ...patch, glassMode: nextMode, activePresetId: "" }, opts);
  };
  const surfaceSlider = (surface, cfgKey, label) => {
    const r = PARAM_RANGES[cfgKey];
    return SliderRow({
      label,
      min: r.min,
      max: r.max,
      step: 1,
      unit: r.unit || "",
      value: config[cfgKey],
      defaultValue: DEFAULT_CONFIG[cfgKey],
      onChange: (v) => withSurfaceCustom(surface, { [cfgKey]: v }, { defer: true, rerender: false }),
      onCommit: (v) => withSurfaceCustom(surface, { [cfgKey]: v }, { defer: false, rerender: true })
    });
  };
  const autoFollowBtn = (surface, cfgKey) => {
    const isInherited = !config[cfgKey] && (!surface || config.glassMode?.[surface] !== "custom");
    return el("button", {
      type: "button",
      className: `we-picker__swatch we-picker__swatch--auto ${isInherited ? "we-picker__swatch--active" : ""}`,
      onClick: () => {
        const nextMode = { ...config.glassMode || {} };
        if (surface) nextMode[surface] = "inherit";
        void store.updateConfig({ [cfgKey]: "", glassMode: nextMode, activePresetId: "" });
      }
    }, isZh ? "跟随" : "Auto");
  };
  return el(
    "div",
    { className: "we-picker__section" },
    sectionHead({
      title: t("sectionGlass"),
      open,
      onToggle: () => toggleSection(store, "glassUi"),
      resetBtn: moduleResetButton({ onClick: () => store.resetModule("glass") })
    }),
    open ? [
      switchRow({
        label: isZh ? "启用液态玻璃 UI" : "Enable Liquid Glass UI",
        hint: isZh ? "开启后对顶栏、侧栏、输入卡、对话区与设置弹窗应用统一两段可读性玻璃。" : "Unified two-stage readability glass across workbench & Settings.",
        checked: config.glassEnabled !== false,
        onChange: (v) => void store.updateConfig({ glassEnabled: v, activePresetId: "" })
      }),
      switchRow({
        label: isZh ? "深浅色分别配置玻璃底色" : "Separate light/dark glass tints",
        checked: config.glassDarkSeparate !== false,
        onChange: (v) => void store.updateConfig({ glassDarkSeparate: v, activePresetId: "" })
      }),
      config.glassDarkSeparate !== false ? [
        swatchRow({
          label: isZh ? "浅色模式玻璃底色" : "Light tint color",
          presets: GLASS_COLOR_PRESETS,
          value: glassColor.light,
          colorValue: glassColor.light,
          onPick: (c, defer) => void store.updateConfig({ glassColor: { ...glassColor, light: c }, activePresetId: "" }, { defer, rerender: !defer })
        }),
        swatchRow({
          label: isZh ? "深色模式玻璃底色" : "Dark tint color",
          presets: GLASS_COLOR_PRESETS,
          value: glassColor.dark,
          colorValue: glassColor.dark,
          onPick: (c, defer) => void store.updateConfig({ glassColor: { ...glassColor, dark: c }, activePresetId: "" }, { defer, rerender: !defer })
        })
      ] : swatchRow({
        label: isZh ? "玻璃底色" : "Glass tint color",
        presets: GLASS_COLOR_PRESETS,
        value: glassColor.light,
        colorValue: glassColor.light,
        onPick: (c, defer) => void store.updateConfig({ glassColor: { light: c, dark: c }, activePresetId: "" }, { defer, rerender: !defer })
      }),
      configSlider(store, "panelGlass", t("panelGlass")),
      configSlider(store, "surfaceFrost", t("surfaceFrost")),
      configSlider(store, "settingsMaskStrength", isZh ? "设置背板遮罩强度" : "Settings backdrop scrim"),
      configSlider(store, "glassSaturation", t("glassSaturation")),
      configSlider(store, "glassFidelity", isZh ? "玻璃色彩保真度" : "Surface color fidelity"),
      segRow({
        label: isZh ? "思考过程块外观" : "Thinking Block",
        hint: isZh ? "三档独立控制，避免长文思考卡片过透或生硬白框。" : "Three-mode glass/off/native style for reasoning blocks.",
        value: config.thinkingMode || "glass",
        items: [
          { id: "off", label: isZh ? "关" : "Off" },
          { id: "glass", label: isZh ? "液态玻璃" : "Liquid Glass" },
          { id: "native", label: isZh ? "原生" : "Native" }
        ],
        onPick: (id) => void store.updateConfig({ thinkingMode: id, activePresetId: "" })
      }),
      switchRow({
        label: isZh ? "左侧边栏液态玻璃" : "Left sidebar glass",
        checked: config.leftSidebarGlass !== false,
        onChange: (v) => void store.updateConfig({ leftSidebarGlass: v, activePresetId: "" })
      }),
      switchRow({
        label: isZh ? "顶部标题栏液态玻璃" : "Titlebar glass",
        checked: Boolean(config.titlebarGlass),
        onChange: (v) => void store.updateConfig({ titlebarGlass: v, activePresetId: "" })
      }),
      switchRow({
        label: isZh ? "辅助/右侧栏液态玻璃" : "Aux sidebar glass",
        checked: config.sidebarGlass !== false,
        onChange: (v) => void store.updateConfig({ sidebarGlass: v, activePresetId: "" })
      }),
      switchRow({
        label: isZh ? "全透侧栏模式" : "Full-clear sidebar",
        hint: isZh ? "移除侧栏毛玻璃雾化层，使左侧导航直通壁纸层。" : "Removes frost layer so sidebar sits straight over wallpaper.",
        checked: Boolean(config.sidebarFullClear),
        onChange: (v) => void store.updateConfig({ sidebarFullClear: v, activePresetId: "" })
      }),
      switchRow({
        label: isZh ? "浮层保留底层可读衬底" : "Floater readable base",
        checked: config.floaterSolidBase !== false,
        onChange: (v) => void store.updateConfig({ floaterSolidBase: v, activePresetId: "" })
      }),
      el(
        "div",
        { className: "we-picker__row" },
        el("button", {
          type: "button",
          className: `we-picker__btn ${store.state.showGlassDetail ? "is-on" : ""}`,
          onClick: () => {
            store.state.showGlassDetail = !store.state.showGlassDetail;
            store.notify();
          }
        }, store.state.showGlassDetail ? isZh ? "收起按面细节调节 ▴" : "Hide Per-Surface Details ▴" : isZh ? "展开详细按面调节 ▾" : "Per-Surface Glass Details ▾")
      ),
      store.state.showGlassDetail ? el(
        "div",
        { className: "we-picker__editor" },
        configSlider(store, "composerFrost", t("composerFrost")),
        configSlider(store, "bubbleOpacity", t("bubbleOpacity")),
        surfaceSlider("conversation", "chatGlassFidelity", isZh ? "对话区色彩保真度" : "Chat fidelity"),
        swatchRow({
          label: isZh ? "对话区独立底色" : "Conversation tint",
          presets: GLASS_COLOR_PRESETS,
          value: config.conversationColor,
          colorValue: config.conversationColor || glassColor.light,
          autoBtn: autoFollowBtn("conversation", "conversationColor"),
          onPick: (c, defer) => withSurfaceCustom("conversation", { conversationColor: c }, { defer, rerender: !defer })
        }),
        surfaceSlider("leftSidebar", "leftSidebarTransparency", isZh ? "左侧栏透明度" : "Left sidebar transparency"),
        surfaceSlider("leftSidebar", "leftSidebarBlur", isZh ? "左侧栏模糊" : "Left sidebar blur"),
        surfaceSlider("titlebar", "titlebarTransparency", isZh ? "标题栏透明度" : "Titlebar transparency"),
        surfaceSlider("titlebar", "titlebarBlur", isZh ? "标题栏模糊" : "Titlebar blur"),
        switchRow({
          label: isZh ? "辅助侧栏跟随全局参数" : "Aux sidebar follows global glass",
          checked: config.sidebarFollowGlobal !== false,
          onChange: (v) => void store.updateConfig({ sidebarFollowGlobal: v })
        }),
        configSlider(store, "sidebarAlpha", isZh ? "辅助侧栏透明度" : "Aux sidebar transparency"),
        configSlider(store, "sidebarBlur", isZh ? "辅助侧栏模糊" : "Aux sidebar blur"),
        configSlider(store, "sidebarContentAlpha", isZh ? "侧栏列表项底色浓度" : "Sidebar row density"),
        swatchRow({
          label: isZh ? "侧栏列表项底色" : "Sidebar row tint",
          presets: GLASS_COLOR_PRESETS,
          value: config.sidebarContentColor,
          colorValue: config.sidebarContentColor || glassColor.light,
          autoBtn: autoFollowBtn("sidebarContent", "sidebarContentColor"),
          onPick: (c, defer) => withSurfaceCustom("sidebarContent", { sidebarContentColor: c }, { defer, rerender: !defer })
        }),
        surfaceSlider("settingsWindow", "settingsWindowTransparency", isZh ? "设置弹窗透明度" : "Settings transparency"),
        surfaceSlider("settingsWindow", "settingsWindowBlur", isZh ? "设置弹窗模糊" : "Settings blur"),
        swatchRow({
          label: isZh ? "设置弹窗底色" : "Settings window tint",
          presets: GLASS_COLOR_PRESETS,
          value: config.settingsWindowColor,
          colorValue: config.settingsWindowColor || glassColor.light,
          autoBtn: autoFollowBtn("settingsWindow", "settingsWindowColor"),
          onPick: (c, defer) => withSurfaceCustom("settingsWindow", { settingsWindowColor: c }, { defer, rerender: !defer })
        })
      ) : null
    ] : null
  );
}
function renderFontSection(store) {
  const { config, systemFonts, fontsLoaded, fontsLoading } = store.state;
  const t = store.getT();
  const isZh = store.isZh();
  const open = store.state.sectionsOpen.font === true;
  if (open && !fontsLoaded && !fontsLoading) {
    store.state.fontsLoading = true;
    void store.rpc("fonts-list", { refresh: false }).then((res) => {
      if (Array.isArray(res?.fonts)) {
        store.state.systemFonts = res.fonts;
        store.state.fontsLoaded = true;
      }
      store.state.fontsLoading = false;
      store.notify();
    }).catch(() => {
      store.state.fontsLoading = false;
    });
  }
  const fontSets = config.fontSets || [];
  const activeSet = fontSets.find((s) => s.id === config.fontSetId) || null;
  const fontOpts = [
    { value: "", label: t("fontFamilyPlaceholder") },
    ...systemFonts.map((f) => ({ value: f, label: f }))
  ];
  if (config.globalFamily && !systemFonts.includes(config.globalFamily)) {
    fontOpts.splice(1, 0, { value: config.globalFamily, label: config.globalFamily });
  }
  const updateThemeRoleColor = (role, mode, hexVal) => {
    const next = structuredClone(config.themeColors || {});
    const cur = next[role] || {};
    next[role] = { light: cur.light || "#111827", dark: cur.dark || "#f8fafc", [mode]: hexVal };
    void store.updateConfig({ themeColors: next });
  };
  const updateRoleType = (field, role, val) => {
    const next = { ...config[field] || {} };
    if (val === "" || val === null || val === void 0) delete next[role];
    else next[role] = val;
    void store.updateConfig({ [field]: next });
  };
  const updateCompFont = (id, patch) => {
    const next = structuredClone(config.componentFonts || {});
    next[id] = { ...next[id] || {}, ...patch };
    void store.updateConfig({ componentFonts: next });
  };
  const rolesToRender = store.state.fontOnlyModified ? TYPE_ROLE_IDS.filter((r) => config.themeSize?.[r] || config.themeWeight?.[r] || config.themeFamily?.[r]) : TYPE_ROLE_IDS;
  return el(
    "div",
    { className: "we-picker__section" },
    sectionHead({
      title: t("sectionTypography"),
      open,
      onToggle: () => toggleSection(store, "font"),
      resetBtn: moduleResetButton({ onClick: () => store.resetModule("font") })
    }),
    open ? [
      switchRow({
        label: t("fontCustom"),
        checked: Boolean(config.fontCustom),
        onChange: (v) => void store.updateConfig({ fontCustom: v })
      }),
      el(
        "div",
        { className: "we-picker__row" },
        el("select", {
          className: "we-picker__select",
          style: { flex: "1" },
          value: config.fontSetId || "",
          onChange: (e) => {
            const found = fontSets.find((s) => s.id === e.target.value);
            if (!found) void store.updateConfig({ fontSetId: "" });
            else void store.updateConfig({ fontSetId: found.id, ...structuredClone(found.values) });
          }
        }, [
          el("option", { value: "", selected: !config.fontSetId }, isZh ? "未命名草稿字体集" : "Draft / Unsaved Set"),
          ...fontSets.map((s) => el("option", { value: s.id, selected: s.id === config.fontSetId }, s.name))
        ]),
        el("button", {
          type: "button",
          className: "we-picker__btn",
          onClick: () => {
            const id = `fs_${Date.now().toString(36)}`;
            const next = [...fontSets, { id, name: isZh ? `字体集 ${fontSets.length + 1}` : `Font Set ${fontSets.length + 1}`, values: pickFontSetValues(config) }];
            void store.updateConfig({ fontSets: next, fontSetId: id });
          }
        }, isZh ? "新建字体集" : "Save New"),
        activeSet ? el("button", {
          type: "button",
          className: "we-picker__btn",
          onClick: () => {
            const next = fontSets.map((s) => s.id === activeSet.id ? { ...s, values: pickFontSetValues(config) } : s);
            void store.updateConfig({ fontSets: next });
            store.showToast(isZh ? "已更新字体集" : "Font set updated");
          }
        }, isZh ? "覆盖保存" : "Overwrite") : null,
        activeSet ? el("button", {
          type: "button",
          className: "we-picker__btn we-picker__btn--danger",
          onClick: () => {
            const next = fontSets.filter((s) => s.id !== activeSet.id);
            void store.updateConfig({ fontSets: next, fontSetId: next[0]?.id || "" });
          }
        }, isZh ? "删除" : "Delete") : null
      ),
      el(
        "div",
        { className: "we-picker__ctl" },
        selectRow({
          label: t("fontFamily"),
          value: config.globalFamily || "",
          options: fontOpts,
          onChange: (v) => void store.updateConfig({ globalFamily: v })
        }),
        el("button", {
          type: "button",
          className: "we-picker__btn",
          disabled: fontsLoading,
          onClick: async () => {
            store.state.fontsLoading = true;
            store.notify();
            try {
              const res = await store.rpc("fonts-list", { refresh: true });
              if (Array.isArray(res?.fonts)) {
                store.state.systemFonts = res.fonts;
                store.state.fontsLoaded = true;
                store.showToast(isZh ? `已扫描 ${res.fonts.length} 个本机字体` : `Scanned ${res.fonts.length} system fonts`);
              }
            } finally {
              store.state.fontsLoading = false;
              store.notify();
            }
          }
        }, fontsLoading ? t("fontScanning") : t("scanFonts"))
      ),
      selectRow({
        label: isZh ? "终端代码块字体" : "Terminal font family",
        value: config.componentFonts?.terminal?.family || "",
        options: fontOpts.map((o) => o.value ? o : { value: "", label: isZh ? "继承全局字体" : "Inherit global" }),
        onChange: (v) => updateCompFont("terminal", { family: v })
      }),
      switchRow({
        label: isZh ? "深浅色分别设定文字颜色" : "Separate light/dark text role colors",
        checked: Boolean(config.themeDarkSeparate),
        onChange: (v) => void store.updateConfig({ themeDarkSeparate: v })
      }),
      ...THEME_COLOR_ROLE_IDS.map((role) => {
        const pair = config.themeColors?.[role] || {};
        return el(
          "div",
          { className: "we-picker__ctl" },
          el("span", { className: "we-picker__ctl-label" }, `text.${role}`),
          el(
            "div",
            { className: "we-picker__ctl-side" },
            el("span", { className: "we-picker__hint" }, "L"),
            el(
              "label",
              { className: "we-picker__swatch-custom" },
              el("input", {
                type: "color",
                value: pair.light || "#111827",
                onInput: (e) => updateThemeRoleColor(role, "light", e.target.value)
              })
            ),
            config.themeDarkSeparate ? [
              el("span", { className: "we-picker__hint" }, "D"),
              el(
                "label",
                { className: "we-picker__swatch-custom" },
                el("input", {
                  type: "color",
                  value: pair.dark || "#f8fafc",
                  onInput: (e) => updateThemeRoleColor(role, "dark", e.target.value)
                })
              )
            ] : null
          )
        );
      }),
      switchRow({
        label: isZh ? "仅显示已修改排版角色" : "Only show modified roles",
        checked: store.state.fontOnlyModified,
        onChange: (v) => {
          store.state.fontOnlyModified = v;
          store.notify();
        }
      }),
      el(
        "table",
        { className: "we-picker__font-table" },
        el(
          "thead",
          null,
          el(
            "tr",
            null,
            el("th", null, isZh ? "排版角色" : "Role"),
            el("th", null, isZh ? "字号(px)" : "Size"),
            el("th", null, isZh ? "字重" : "Weight"),
            el("th", null, isZh ? "字体覆盖" : "Family")
          )
        ),
        el(
          "tbody",
          null,
          rolesToRender.map((role) => {
            const labelPair = TYPE_ROLE_LABELS[role] || [role, role];
            return el(
              "tr",
              null,
              el("td", { style: { fontSize: "12px" } }, isZh ? labelPair[0] : labelPair[1]),
              el(
                "td",
                null,
                el("input", {
                  type: "number",
                  className: "we-picker__text",
                  style: { width: "58px", height: "26px", padding: "0 6px" },
                  min: "8",
                  max: "48",
                  placeholder: "auto",
                  value: config.themeSize?.[role] ? String(config.themeSize[role]) : "",
                  onChange: (e) => updateRoleType("themeSize", role, e.target.value ? Number(e.target.value) : "")
                })
              ),
              el(
                "td",
                null,
                el("input", {
                  type: "number",
                  className: "we-picker__text",
                  style: { width: "64px", height: "26px", padding: "0 6px" },
                  min: "100",
                  max: "900",
                  step: "100",
                  placeholder: "auto",
                  value: config.themeWeight?.[role] ? String(config.themeWeight[role]) : "",
                  onChange: (e) => updateRoleType("themeWeight", role, e.target.value ? Number(e.target.value) : "")
                })
              ),
              el(
                "td",
                null,
                el("select", {
                  className: "we-picker__select",
                  style: { height: "26px", maxWidth: "140px" },
                  value: config.themeFamily?.[role] || "",
                  onChange: (e) => updateRoleType("themeFamily", role, e.target.value)
                }, fontOpts.map((o) => el("option", {
                  value: o.value,
                  selected: o.value === (config.themeFamily?.[role] || "")
                }, o.label)))
              )
            );
          })
        )
      ),
      el("div", { className: "we-picker__hint", style: { marginTop: "4px" } }, isZh ? "组件级覆盖" : "Component Overrides"),
      el(
        "table",
        { className: "we-picker__font-table" },
        el(
          "thead",
          null,
          el(
            "tr",
            null,
            el("th", null, isZh ? "组件" : "Component"),
            el("th", null, isZh ? "字号" : "Size"),
            el("th", null, isZh ? "字重" : "Weight"),
            el("th", null, isZh ? "字体" : "Family")
          )
        ),
        el(
          "tbody",
          null,
          COMPONENT_FONT_TARGETS.map((target) => {
            const cur = config.componentFonts?.[target.id] || {};
            return el(
              "tr",
              null,
              el("td", { style: { fontSize: "12px" } }, isZh ? target.label : target.labelEn),
              el(
                "td",
                null,
                el("input", {
                  type: "number",
                  className: "we-picker__text",
                  style: { width: "58px", height: "26px", padding: "0 6px" },
                  min: "8",
                  max: "48",
                  placeholder: "auto",
                  value: cur.size ? String(cur.size) : "",
                  onChange: (e) => updateCompFont(target.id, { size: e.target.value ? Number(e.target.value) : "" })
                })
              ),
              el(
                "td",
                null,
                el("input", {
                  type: "number",
                  className: "we-picker__text",
                  style: { width: "64px", height: "26px", padding: "0 6px" },
                  min: "100",
                  max: "900",
                  step: "100",
                  placeholder: "auto",
                  value: cur.weight ? String(cur.weight) : "",
                  onChange: (e) => updateCompFont(target.id, { weight: e.target.value ? Number(e.target.value) : "" })
                })
              ),
              el(
                "td",
                null,
                el("select", {
                  className: "we-picker__select",
                  style: { height: "26px", maxWidth: "140px" },
                  value: cur.family || "",
                  onChange: (e) => updateCompFont(target.id, { family: e.target.value })
                }, fontOpts.map((o) => el("option", { value: o.value, selected: o.value === (cur.family || "") }, o.label)))
              )
            );
          })
        )
      )
    ] : null
  );
}
function renderAppearanceTab(store) {
  const { config, embed } = store.state;
  const t = store.getT();
  const isZh = store.isZh();
  const equalCorners = embed !== "aux";
  const radiusItems = [
    { id: "native", label: isZh ? "跟随原生" : "Native" },
    { id: "6", label: "6px" },
    { id: "12", label: "12px" },
    { id: "20", label: "20px" }
  ];
  const autoColorBtn = (cfgKey, autoText) => el("button", {
    type: "button",
    className: `we-picker__swatch we-picker__swatch--auto ${!config[cfgKey] ? "we-picker__swatch--active" : ""}`,
    onClick: () => void store.updateConfig({ [cfgKey]: "" })
  }, autoText);
  const uiElements = [
    { key: "uiColorSend", label: isZh ? "发送按钮与主 CTA" : "Send & CTA button" },
    { key: "uiColorLink", label: isZh ? "链接文字" : "Link text" },
    { key: "uiColorFileIcon", label: isZh ? "文件图标与引用芯片" : "File icons & chips" },
    { key: "uiColorTab", label: isZh ? "标签栏激活指示线" : "Active tab indicator" },
    { key: "uiColorDeepDiving", label: isZh ? "深度思考脉冲高亮" : "Thinking / Highlight accent" }
  ];
  return el(
    "div",
    { className: "we-tabpanel" },
    renderPresetsSection(store),
    /* Theme Follow */
    el(
      "div",
      { className: "we-picker__section" },
      sectionHead({
        title: isZh ? "主题跟随" : "Theme Follow",
        resetBtn: moduleResetButton({ onClick: () => store.resetModule("theme") })
      }),
      switchRow({
        label: isZh ? "从当前壁纸自动取色作为强调色" : "Extract accent color from wallpaper",
        checked: Boolean(config.themeFollow),
        onChange: (v) => void store.updateConfig({ themeFollow: v })
      })
    ),
    /* Detail */
    el(
      "div",
      { className: "we-picker__section" },
      sectionHead({
        title: isZh ? "细节" : "Details",
        open: store.state.sectionsOpen.detail !== false,
        onToggle: () => toggleSection(store, "detail"),
        resetBtn: moduleResetButton({ onClick: () => store.resetModule("detail") })
      }),
      store.state.sectionsOpen.detail !== false ? [
        configSlider(store, "glassBorder", t("glassBorder")),
        switchRow({
          label: t("glassHighlight"),
          checked: config.glassHighlight !== false,
          onChange: (v) => void store.updateConfig({ glassHighlight: v, activePresetId: "" })
        })
      ] : null
    ),
    renderGlassSection(store),
    /* Sidebar Corners */
    el(
      "div",
      { className: "we-picker__section" },
      sectionHead({
        title: isZh ? "侧边栏圆角" : "Sidebar Corners",
        open: store.state.sectionsOpen.corners !== false,
        onToggle: () => toggleSection(store, "corners"),
        resetBtn: moduleResetButton({ onClick: () => store.resetModule("corners") })
      }),
      store.state.sectionsOpen.corners !== false ? [
        segRow({
          label: isZh ? "左侧边栏统一圆角" : "Left sidebar radius",
          value: config.leftSidebarCornerRadius || "native",
          items: radiusItems,
          onPick: (id) => void store.updateConfig({ leftSidebarCornerRadius: id, activePresetId: "" })
        }),
        cornerButtons(store, "leftSidebar", isZh ? "左侧边栏单独改直角" : "Left sidebar square corners", equalCorners),
        segRow({
          label: isZh ? "右侧栏统一圆角" : "Right sidebar radius",
          value: config.rightSidebarCornerRadius || "native",
          items: radiusItems,
          onPick: (id) => void store.updateConfig({ rightSidebarCornerRadius: id, activePresetId: "" })
        }),
        cornerButtons(store, "rightSidebar", isZh ? "右侧栏单独改直角" : "Right sidebar square corners", equalCorners)
      ] : null
    ),
    /* Global UI Colors */
    el(
      "div",
      { className: "we-picker__section" },
      sectionHead({
        title: isZh ? "全局 UI 配色" : "Global UI Colors",
        open: store.state.sectionsOpen.uiColor === true,
        onToggle: () => toggleSection(store, "uiColor"),
        resetBtn: moduleResetButton({ onClick: () => store.resetModule("uiColor") })
      }),
      store.state.sectionsOpen.uiColor === true ? [
        swatchRow({
          label: isZh ? "全局强调色 (Accent)" : "Global accent color",
          disabled: Boolean(config.uiColorCustom),
          presets: ACCENT_PRESETS,
          value: config.accent || "#4f8cff",
          colorValue: COLOR_HEX_RE.test(config.accent || "") ? config.accent : "#4f8cff",
          onPick: (c, defer) => void store.updateConfig({ accent: c }, { defer, rerender: !defer })
        }),
        switchRow({
          label: isZh ? "分元素自定义界面配色" : "Customize per-element colors",
          checked: Boolean(config.uiColorCustom),
          onChange: (v) => void store.updateConfig({ uiColorCustom: v })
        }),
        ...uiElements.map((item) => swatchRow({
          label: item.label,
          disabled: !config.uiColorCustom,
          presets: ACCENT_PRESETS,
          value: config[item.key],
          colorValue: COLOR_HEX_RE.test(config[item.key] || "") ? config[item.key] : config.accent || "#4f8cff",
          autoBtn: autoColorBtn(item.key, isZh ? "跟随" : "Auto"),
          onPick: (c, defer) => void store.updateConfig({ [item.key]: c, uiColorCustom: true }, { defer, rerender: !defer })
        })),
        swatchRow({
          label: t("caretColor"),
          presets: CARET_COLOR_PRESETS,
          value: config.caretColor,
          colorValue: COLOR_HEX_RE.test(config.caretColor || "") ? config.caretColor : "#4f8cff",
          autoBtn: autoColorBtn("caretColor", isZh ? "自动" : "Auto"),
          onPick: (c, defer) => void store.updateConfig({ caretColor: c }, { defer, rerender: !defer })
        })
      ] : null
    ),
    renderFontSection(store)
  );
}

// src/ui/tabs/playback-tab.js
function renderPlaybackTab(store) {
  const { config } = store.state;
  const t = store.getT();
  const isZh = store.isZh();
  if (!config.wallpaperEnabled) {
    return el(
      "div",
      { className: "we-tabpanel" },
      el(
        "div",
        { className: "we-picker__empty" },
        el("div", { className: "we-picker__empty-title" }, t("selectWallpaperFirst")),
        el("div", { className: "we-picker__hint" }, isZh ? "启用壁纸后即可在这里微调画面适配、模糊、暗化遮罩与实时渲染帧率。" : "Select or enable a wallpaper to adjust framing, blur, dimming and live render quality."),
        el("button", {
          type: "button",
          className: "we-picker__btn we-picker__btn--primary",
          onClick: () => {
            store.state.tab = "library";
            store.state.pickerOpen = true;
            store.state.pickerDraft = false;
            store.notify();
          }
        }, t("chooseWallpaper"))
      )
    );
  }
  return el(
    "div",
    { className: "we-tabpanel" },
    el(
      "div",
      { className: "we-picker__section" },
      sectionHead({
        title: isZh ? "画面与构图" : "Picture & Framing",
        resetBtn: moduleResetButton({ onClick: () => store.resetModule("effectsPicture") })
      }),
      segRow({
        label: t("wallpaperFit"),
        value: config.wallpaperFit || "cover",
        items: [
          { id: "cover", label: isZh ? "铺满" : "Cover" },
          { id: "contain", label: isZh ? "适应" : "Contain" },
          { id: "fill", label: isZh ? "拉伸" : "Fill" },
          { id: "center", label: isZh ? "居中" : "Center" }
        ],
        onPick: (id) => void store.updateConfig({ wallpaperFit: id })
      }),
      configSlider(store, "wallpaperBlur", t("wallpaperBlur")),
      configSlider(store, "maskOcclusion", t("maskOcclusion")),
      configSlider(store, "wallpaperOpacity", t("wallpaperOpacity")),
      configSlider(store, "backgroundBrightness", isZh ? "亮度" : "Brightness"),
      configSlider(store, "backgroundContrast", isZh ? "对比度" : "Contrast"),
      configSlider(store, "backgroundSaturate", isZh ? "饱和度" : "Saturation"),
      switchRow({
        label: isZh ? "水平镜像翻转" : "Horizontal flip",
        checked: Boolean(config.wallpaperFlip),
        onChange: (v) => void store.updateConfig({ wallpaperFlip: v })
      }),
      configSlider(store, "layerPositionX", isZh ? "水平构图偏移" : "Horizontal position"),
      configSlider(store, "layerPositionY", isZh ? "垂直构图偏移" : "Vertical position"),
      configSlider(store, "layerScale", isZh ? "画面缩放" : "Layer scale")
    ),
    el(
      "div",
      { className: "we-picker__section" },
      sectionHead({
        title: t("sectionPlayback"),
        resetBtn: moduleResetButton({ onClick: () => store.resetModule("effectsLive") })
      }),
      segRow({
        label: t("wallpaperMode"),
        value: config.wallpaperMode || "live",
        items: [
          { id: "live", label: t("wallpaperModeLive") },
          { id: "frame", label: t("wallpaperModeFrame") }
        ],
        onPick: (id) => void store.updateConfig({ wallpaperMode: id })
      }),
      segRow({
        label: t("videoPlaybackRate"),
        value: String(config.videoPlaybackRate ?? 1),
        items: [
          { id: "0.5", label: "0.5×" },
          { id: "1", label: "1×" },
          { id: "1.5", label: "1.5×" },
          { id: "2", label: "2×" }
        ],
        onPick: (id) => void store.updateConfig({ videoPlaybackRate: Number(id) })
      }),
      switchRow({
        label: t("sceneLive"),
        hint: t("sceneLiveDesc"),
        checked: config.sceneLive !== false,
        onChange: (v) => void store.updateConfig({ sceneLive: v })
      }),
      segRow({
        label: t("sceneLiveFps"),
        value: String(config.sceneLiveFps ?? 30),
        items: [
          { id: "15", label: "15 FPS" },
          { id: "30", label: "30 FPS" },
          { id: "60", label: "60 FPS" }
        ],
        onPick: (id) => void store.updateConfig({ sceneLiveFps: Number(id) })
      }),
      switchRow({
        label: t("sceneAutoQuality"),
        hint: t("sceneAutoQualityDesc"),
        checked: config.sceneAutoQuality !== false,
        onChange: (v) => void store.updateConfig({ sceneAutoQuality: v })
      }),
      segRow({
        label: t("sceneRenderDpr"),
        value: String(config.sceneRenderDpr ?? 0),
        items: [
          { id: "0", label: t("sceneRenderDprAuto") },
          { id: "1", label: "1×" },
          { id: "1.5", label: "1.5×" },
          { id: "2", label: "2×" }
        ],
        onPick: (id) => void store.updateConfig({ sceneRenderDpr: Number(id) })
      }),
      segRow({
        label: t("sceneVideoTexScale"),
        value: String(config.sceneVideoTexScale ?? 0),
        items: [
          { id: "0", label: t("sceneVideoTexScaleAuto") },
          { id: "0.5", label: t("sceneVideoTexScaleHalf") },
          { id: "1", label: t("sceneVideoTexScaleFull") }
        ],
        onPick: (id) => void store.updateConfig({ sceneVideoTexScale: Number(id) })
      }),
      segRow({
        label: isZh ? "实时壁纸延迟激活" : "Live boot delay",
        value: String(config.liveBootDelay ?? 3),
        items: [
          { id: "0", label: "0s" },
          { id: "1", label: "1s" },
          { id: "3", label: "3s" },
          { id: "5", label: "5s" }
        ],
        onPick: (id) => void store.updateConfig({ liveBootDelay: Number(id) })
      })
    )
  );
}

// src/ui/tabs/audio-tab.js
function renderAudioTab(store) {
  const { config } = store.state;
  const t = store.getT();
  const isZh = store.isZh();
  return el(
    "div",
    { className: "we-tabpanel" },
    el(
      "div",
      { className: "we-picker__section" },
      sectionHead({
        title: isZh ? "壁纸声音控制" : "Wallpaper Audio",
        resetBtn: moduleResetButton({ onClick: () => store.resetModule("audio") })
      }),
      switchRow({
        label: t("wallpaperSound"),
        hint: isZh ? "视频、网页及内含音轨的 Scene 壁纸声音输出。" : "Play embedded audio tracks for Video, Web and Scene wallpapers.",
        checked: Boolean(config.wallpaperSound),
        onChange: (v) => {
          const patch = { wallpaperSound: v };
          if (v && Number(config.wallpaperVolume) === 0) patch.wallpaperVolume = 50;
          void store.updateConfig(patch);
        }
      }),
      configSlider(store, "wallpaperVolume", t("wallpaperVolume"))
    )
  );
}

// src/ui/tabs/system-tab.js
function renderSystemTab(store) {
  const { config, cdp, diagnostics, busyAction } = store.state;
  const t = store.getT();
  const isZh = store.isZh();
  return el(
    "div",
    { className: "we-tabpanel" },
    el(
      "div",
      { className: "we-picker__section" },
      sectionHead({
        title: t("sectionSystem"),
        resetBtn: moduleResetButton({ onClick: () => store.resetModule("system") })
      }),
      segRow({
        label: isZh ? "壁纸库卡片排布" : "Library card style",
        value: config.pickerLayout || "fixed",
        items: [
          { id: "fixed", label: isZh ? "常规网格" : "Fixed Grid" },
          { id: "classic", label: isZh ? "CD 架叠放" : "CD Rack" }
        ],
        onPick: (id) => void store.updateConfig({ pickerLayout: id })
      }),
      selectRow({
        label: isZh ? "插件内部界面语言" : "Inner UI language",
        hint: isZh ? '注：Antigravity Settings 左侧菜单条目始终保持英文 "Wallpaper Engine"。' : 'Note: Antigravity Settings left nav label always stays English "Wallpaper Engine".',
        value: config.uiLanguage || "zh",
        options: [
          { value: "zh", label: "简体中文（推荐）" },
          { value: "en", label: "English" },
          { value: "auto", label: isZh ? "跟随系统语言" : "Auto (System Locale)" }
        ],
        onChange: (v) => void store.updateConfig({ uiLanguage: v })
      })
    ),
    el(
      "div",
      { className: "we-picker__section" },
      sectionHead({ title: isZh ? "Antigravity 原生集成与连接诊断" : "Antigravity Integration & CDP Health" }),
      switchRow({
        label: t("browserHoleCutout"),
        hint: t("browserHoleCutoutDesc"),
        checked: config.browserHoleCutout !== false,
        onChange: (v) => void store.updateConfig({ browserHoleCutout: v })
      }),
      switchRow({
        label: t("studioShortcut"),
        hint: t("studioShortcutDesc"),
        checked: config.studioShortcut !== false,
        onChange: (v) => void store.updateConfig({ studioShortcut: v })
      }),
      el(
        "div",
        { className: "we-picker__ctl" },
        el(
          "div",
          { className: "we-picker__ctl-text" },
          el("span", { className: "we-picker__ctl-label" }, t("cdpHealthTitle")),
          el(
            "span",
            { className: "we-picker__ctl-hint" },
            cdp?.state === "connected" || Number(cdp?.targets) > 0 ? `${t("cdpStatusOk")} (CDP :${cdp.port || "?"})` : t("cdpStatusMissing")
          )
        ),
        el("button", {
          type: "button",
          className: "we-picker__btn",
          disabled: busyAction === "cdp-fix",
          onClick: async () => {
            store.state.busyAction = "cdp-fix";
            store.notify();
            try {
              const res = await store.rpc("fix-cdp-shortcut", {});
              if (res?.updated > 0) {
                store.showToast(isZh ? `已更新 ${res.updated} 个快捷方式，下次重启生效` : `Updated ${res.updated} shortcut(s)`);
              } else {
                store.showToast(isZh ? "桌面与开始菜单快捷方式均已包含调试参数" : "Shortcuts already configured");
              }
              const fresh = await store.rpc("get-state");
              if (fresh?.cdp) store.state.cdp = fresh.cdp;
            } finally {
              store.state.busyAction = "";
              store.notify();
            }
          }
        }, t("cdpFixShortcuts"))
      )
    ),
    el(
      "div",
      { className: "we-picker__section" },
      sectionHead({ title: isZh ? "电源与启停策略" : "Power & Startup Policy" }),
      switchRow({
        label: t("pauseOnHidden"),
        checked: config.pauseOnHidden !== false,
        onChange: (v) => void store.updateConfig({ pauseOnHidden: v })
      }),
      switchRow({
        label: t("pauseOnBlur"),
        checked: Boolean(config.pauseOnBlur),
        onChange: (v) => void store.updateConfig({ pauseOnBlur: v })
      }),
      switchRow({
        label: t("pauseOnBattery"),
        checked: Boolean(config.pauseOnBattery),
        onChange: (v) => void store.updateConfig({ pauseOnBattery: v })
      }),
      switchRow({
        label: t("startPaused"),
        hint: isZh ? "开启后每次冷启动时默认暂停动态渲染，按需再播放。" : "Start wallpaper paused after each cold launch.",
        checked: Boolean(config.startPaused),
        onChange: (v) => void store.updateConfig({ startPaused: v })
      })
    ),
    el(
      "div",
      { className: "we-picker__section" },
      sectionHead({ title: isZh ? "维护与恢复出厂" : "Maintenance & Reset" }),
      el(
        "div",
        { className: "we-picker__row" },
        el("button", {
          type: "button",
          className: "we-picker__btn",
          disabled: busyAction === "diag",
          onClick: async () => {
            store.state.busyAction = "diag";
            store.notify();
            try {
              store.state.diagnostics = await store.rpc("diagnostics", {});
            } finally {
              store.state.busyAction = "";
              store.notify();
            }
          }
        }, isZh ? "查看实时诊断" : "Run Diagnostics"),
        el("button", {
          type: "button",
          className: "we-picker__btn",
          disabled: busyAction === "cache",
          onClick: async () => {
            store.state.busyAction = "cache";
            store.notify();
            try {
              await store.rpc("cache-clear", {});
              store.showToast(isZh ? "已清理壁纸缓存并准备重新扫描" : "Cache cleared");
              await store.rescanLibrary();
            } finally {
              store.state.busyAction = "";
              store.notify();
            }
          }
        }, isZh ? "清理预览缓存" : "Clear Preview Cache"),
        el("button", {
          type: "button",
          className: "we-picker__btn we-picker__btn--danger",
          onClick: () => {
            store.state.armedConfirm = "reset-all";
            store.notify();
          }
        }, t("resetAll"))
      ),
      renderConfirmRow({
        armedToken: store.state.armedConfirm,
        token: "reset-all",
        question: t("resetAllConfirm"),
        confirmLabel: t("confirmBtn"),
        cancelLabel: t("cancelBtn"),
        danger: true,
        onConfirm: () => {
          const patch = structuredClone(DEFAULT_CONFIG);
          patch.weRoots = [...config.weRoots || []];
          store.state.armedConfirm = "";
          void store.updateConfig(patch);
          store.showToast(isZh ? "已恢复全部默认设置" : "All settings restored to defaults");
        },
        onCancel: () => {
          store.state.armedConfirm = "";
          store.notify();
        }
      }),
      diagnostics ? el("pre", { className: "we-log-pre" }, JSON.stringify(diagnostics, null, 2)) : null
    )
  );
}

// src/ui/tabs/extensions-tab.js
function renderExtensionsTab(store) {
  const { config, discoveredSlots } = store.state;
  const t = store.getT();
  const isZh = store.isZh();
  const clickLabel = { ripple: t("fxStyleRipple"), spark: t("fxStyleSpark"), both: t("fxStyleBoth") };
  const trailLabel = { comet: t("fxTrailComet"), dust: t("fxTrailSparkle") };
  const blendLabel = {
    screen: t("fxBlendScreen"),
    normal: t("fxBlendNormal"),
    overlay: t("fxBlendOverlay"),
    multiply: t("fxBlendMultiply"),
    lighten: t("fxBlendAdd")
  };
  const colorLabel = { accent: t("fxColorAccent"), rainbow: t("fxColorRainbow"), custom: t("fxColorCustom") };
  return el(
    "div",
    { className: "we-tabpanel we-ext" },
    /* Module 1: Click & Trail FX */
    el(
      "div",
      { className: "we-ext__module" },
      el(
        "div",
        { className: "we-ext__module-head" },
        el("span", { className: "we-ext__module-title" }, t("sectionFx")),
        moduleResetButton({ onClick: () => store.resetModule("fx") })
      ),
      el("div", { className: "we-picker__hint" }, t("sectionFxDesc")),
      switchRow({
        label: t("fxEnabled"),
        checked: Boolean(config.fxEnabled),
        onChange: (v) => void store.updateConfig({ fxEnabled: v })
      }),
      switchRow({
        label: t("fxClick"),
        checked: config.fxClick !== false,
        onChange: (v) => void store.updateConfig({ fxClick: v })
      }),
      segRow({
        label: t("fxClickStyle"),
        value: config.fxClickStyle || "ripple",
        items: FX_CLICK_STYLES.map((id) => ({ id, label: clickLabel[id] || id })),
        onPick: (id) => void store.updateConfig({ fxClickStyle: id })
      }),
      configSlider(store, "fxClickSize", t("fxClickSize")),
      configSlider(store, "fxClickGlow", t("fxClickGlow")),
      switchRow({
        label: t("fxTrail"),
        checked: config.fxTrail !== false,
        onChange: (v) => void store.updateConfig({ fxTrail: v })
      }),
      segRow({
        label: t("fxTrailStyle"),
        value: config.fxTrailStyle || "comet",
        items: FX_TRAIL_STYLES.map((id) => ({ id, label: trailLabel[id] || id })),
        onPick: (id) => void store.updateConfig({ fxTrailStyle: id })
      }),
      configSlider(store, "fxTrailLength", t("fxTrailLength")),
      configSlider(store, "fxTrailWidth", t("fxTrailWidth")),
      configSlider(store, "fxTrailGlow", t("fxTrailGlow")),
      configSlider(store, "fxOpacity", t("fxOpacity")),
      selectRow({
        label: t("fxBlend"),
        value: config.fxBlend || "screen",
        options: FX_BLEND_VALUES.map((v) => ({ value: v, label: blendLabel[v] || v })),
        onChange: (v) => void store.updateConfig({ fxBlend: v })
      }),
      segRow({
        label: t("fxColorMode"),
        value: config.fxColorMode || "accent",
        items: FX_COLOR_MODES.map((id) => ({ id, label: colorLabel[id] || id })),
        onPick: (id) => void store.updateConfig({ fxColorMode: id })
      }),
      config.fxColorMode === "custom" ? swatchRow({
        label: t("fxColor"),
        presets: ACCENT_PRESETS,
        value: config.fxColor || "#4f8cff",
        colorValue: config.fxColor || "#4f8cff",
        onPick: (c, defer) => void store.updateConfig({ fxColor: c }, { defer, rerender: !defer })
      }) : null
    ),
    /* Module 2: 3D Parallax */
    el(
      "div",
      { className: "we-ext__module" },
      el(
        "div",
        { className: "we-ext__module-head" },
        el("span", { className: "we-ext__module-title" }, t("sectionParallax")),
        moduleResetButton({ onClick: () => store.resetModule("parallax") })
      ),
      el("div", { className: "we-picker__hint" }, t("sectionParallaxDesc")),
      switchRow({
        label: t("parallaxEnabled"),
        checked: Boolean(config.parallaxEnabled),
        onChange: (v) => void store.updateConfig({ parallaxEnabled: v })
      }),
      configSlider(store, "parallaxBg", t("parallaxBgDepth"), { step: 0.1 }),
      configSlider(store, "parallaxSmooth", t("parallaxSmooth")),
      switchRow({
        label: t("parallaxUi"),
        checked: Boolean(config.parallaxUi),
        onChange: (v) => void store.updateConfig({ parallaxUi: v })
      }),
      configSlider(store, "parallaxUiChatDepth", t("parallaxUiChat"), { step: 0.1 }),
      configSlider(store, "parallaxUiComposerDepth", t("parallaxUiComposer"), { step: 0.1 }),
      configSlider(store, "parallaxUiSidebarDepth", t("parallaxUiSidebar"), { step: 0.1 }),
      configSlider(store, "parallaxUiBubbleDepth", t("parallaxUiBubble"), { step: 0.1 }),
      el(
        "div",
        { className: "we-picker__ctl" },
        switchRow({
          label: isZh ? "联动扩展槽位视差 ([data-slot])" : "Follow extension UI slots ([data-slot])",
          checked: Boolean(config.parallaxPlugin),
          onChange: (v) => void store.updateConfig({ parallaxPlugin: v })
        }),
        el("button", {
          type: "button",
          className: "we-picker__btn we-picker__btn--mini",
          onClick: async () => {
            const slots = await store.refreshSlots();
            store.notify();
            store.showToast(isZh ? `已扫描到 ${slots.length} 个扩展槽位` : `Detected ${slots.length} slot(s)`);
          }
        }, isZh ? "刷新槽位" : "Scan Slots")
      ),
      discoveredSlots.length ? discoveredSlots.map((slot) => SliderRow({
        label: slot,
        min: 0,
        max: 10,
        step: 0.1,
        unit: "%",
        defaultValue: 1,
        value: config.parallaxPluginDepths?.[slot] ?? 1,
        onChange: (v) => {
          const next = { ...config.parallaxPluginDepths || {}, [slot]: v };
          void store.updateConfig({ parallaxPluginDepths: next }, { defer: true, rerender: false });
        },
        onCommit: (v) => {
          const next = { ...config.parallaxPluginDepths || {}, [slot]: v };
          void store.updateConfig({ parallaxPluginDepths: next });
        }
      })) : el("div", { className: "we-picker__hint" }, isZh ? "当前工作台未发现额外 [data-slot] 扩展面板。" : "No extra [data-slot] panels detected right now.")
    )
  );
}

// src/ui/tabs/about-tab.js
var REPO_URL = "https://github.com/CaptainMusX/agy-skins";
function renderAboutTab(store) {
  const isZh = store.isZh();
  return el(
    "div",
    { className: "we-tabpanel we-about__lead" },
    el(
      "p",
      { className: "we-about__p" },
      isZh ? "Wallpaper Engine (agy-skins) v2.0.0 —— 专为 Google Antigravity 2.0 打造的纯净动态壁纸与统一 iOS 液态玻璃 UI 插件。" : "Wallpaper Engine (agy-skins) v2.0.0 — Wallpaper Engine & unified iOS Liquid Glass skin system for Google Antigravity 2.0."
    ),
    el(
      "p",
      { className: "we-about__p" },
      isZh ? "架构特点：WebWallGL 3.0.1 实时 Scene/Web 渲染、HMAC-SHA256 签名本地回环 HTTP 206 流媒体、零 BypassCSP、整窗两段式可读性玻璃色板，以及直挂宿主 DOM 的无缝设置面板（无 iframe 嵌套）。" : "Architecture: WebWallGL 3.0.1 live Scene/Web runtime, HMAC-signed loopback HTTP 206 streaming, zero BypassCSP, two-stage readability Liquid Glass, and native host-DOM mounted settings."
    ),
    el(
      "div",
      { className: "we-picker__section" },
      el("span", { className: "we-picker__ctl-label" }, isZh ? "项目仓库 (MIT License)" : "Repository (MIT License)"),
      el(
        "div",
        { className: "we-picker__row" },
        el("span", { className: "we-about__url", style: { flex: "1" } }, REPO_URL),
        el("button", {
          type: "button",
          className: "we-picker__btn",
          onClick: () => {
            void navigator.clipboard?.writeText(REPO_URL);
            store.showToast(isZh ? "已复制 GitHub 仓库地址" : "Repository URL copied");
          }
        }, isZh ? "复制链接" : "Copy")
      )
    ),
    el(
      "div",
      { className: "we-picker__section" },
      el("span", { className: "we-picker__ctl-label" }, isZh ? "开源致谢与设计灵感" : "Attributions & Design Credits"),
      el(
        "p",
        { className: "we-about__p" },
        isZh ? "• 界面交互范式与两段可读性液态玻璃色板深度借鉴自 elysia395/dsh-wallpaper-engine (MIT)。" : "• UI interaction model & two-stage readability glass system modeled on elysia395/dsh-wallpaper-engine (MIT)."
      ),
      el(
        "p",
        { className: "we-about__p" },
        isZh ? "• Wallpaper Engine .pkg 场景解析与 WebGL 2 渲染由 WebWallGL 3.0.1 驱动。" : "• Scene (.pkg) parsing & WebGL 2 runtime powered by WebWallGL 3.0.1."
      )
    )
  );
}

// src/ui/we-picker-app.js
var PICKER_STYLE_ID = "agy-skins-picker-css";
var TABS = [
  { id: "library", key: "tabLibrary", render: renderLibraryTab },
  { id: "appearance", key: "tabAppearance", render: renderAppearanceTab },
  { id: "effects", key: "tabEffects", render: renderPlaybackTab },
  { id: "audio", key: "tabAudio", render: renderAudioTab },
  { id: "advanced", key: "tabAdvanced", render: renderSystemTab },
  { id: "extensions", key: "tabExtensions", render: renderExtensionsTab },
  { id: "about", key: "tabAbout", render: renderAboutTab }
];
function ensureWePickerStyles(doc = document) {
  if (!doc?.head) return null;
  let styleEl = doc.getElementById(PICKER_STYLE_ID);
  if (!styleEl) {
    styleEl = doc.createElement("style");
    styleEl.id = PICKER_STYLE_ID;
    styleEl.textContent = WE_PICKER_CSS;
    doc.head.appendChild(styleEl);
  }
  return styleEl;
}
function captureFocusState(rootEl) {
  const active = rootEl?.ownerDocument?.activeElement;
  if (!active || !rootEl.contains(active)) return null;
  if (!(active instanceof HTMLInputElement || active instanceof HTMLSelectElement || active instanceof HTMLTextAreaElement)) {
    return null;
  }
  return {
    tag: active.tagName,
    type: active.type || "",
    placeholder: active.placeholder || "",
    selStart: typeof active.selectionStart === "number" ? active.selectionStart : null,
    selEnd: typeof active.selectionEnd === "number" ? active.selectionEnd : null
  };
}
function restoreFocusState(rootEl, snap) {
  if (!snap || !rootEl) return;
  const candidates = rootEl.querySelectorAll(snap.tag.toLowerCase());
  for (const node of candidates) {
    if ((node.type || "") !== snap.type) continue;
    if (snap.placeholder && node.placeholder !== snap.placeholder) continue;
    node.focus({ preventScroll: true });
    if (snap.selStart !== null && typeof node.setSelectionRange === "function") {
      try {
        node.setSelectionRange(snap.selStart, snap.selEnd ?? snap.selStart);
      } catch {
      }
    }
    break;
  }
}
function mountWePicker(rootEl, { embed = "settings", getAuth = null } = {}) {
  if (!rootEl) throw new Error("mountWePicker requires a target root element");
  const doc = rootEl.ownerDocument || document;
  ensureWePickerStyles(doc);
  const store = createPanelStore({ getAuth, embed });
  const hostWrap = el("div", { className: "we-picker", dataset: { weEmbed: embed } });
  rootEl.innerHTML = "";
  rootEl.appendChild(hostWrap);
  let resizeObserver = null;
  let lastTabsBar = null;
  const positionPill = (tabsBar, immediate = false) => {
    if (!tabsBar) return;
    const pill = tabsBar.querySelector(".we-tabs__pill");
    const activeTab = tabsBar.querySelector(".we-tabs__tab--active");
    if (!pill || !activeTab) return;
    const left = activeTab.offsetLeft - 3;
    const width = activeTab.offsetWidth;
    if (width <= 0) return;
    if (immediate) pill.style.transition = "none";
    pill.style.width = `${width}px`;
    pill.style.transform = `translateX(${left}px)`;
    if (immediate) {
      void pill.offsetWidth;
      pill.style.transition = "";
    }
  };
  const render = () => {
    const { config, weItems, tab, toast } = store.state;
    const focusSnap = captureFocusState(hostWrap);
    hostWrap.innerHTML = "";
    if (!config) {
      hostWrap.appendChild(el(
        "div",
        { className: "we-picker__empty" },
        el("div", { className: "we-picker__hint" }, "正在同步 Wallpaper Engine 状态…")
      ));
      return;
    }
    const accent = /^#[0-9a-f]{6}$/i.test(config.accent || "") ? config.accent : "#4f8cff";
    hostWrap.style.setProperty("--we-accent-src", accent);
    hostWrap.style.setProperty("--we-accent-ink", weAccentInk(accent));
    const t = store.getT();
    const hiddenSet = new Set(config.hiddenWallpaperIds || []);
    const playableCount = weItems.filter((i) => !hiddenSet.has(i.id)).length;
    const activeTabDef = TABS.find((item) => item.id === tab) || TABS[0];
    hostWrap.appendChild(el(
      "div",
      { className: "we-picker__card-shell" },
      el(
        "div",
        { className: "we-picker__card-head" },
        el("span", { className: "we-picker__card-name" }, t("wallpaperEngineTitle")),
        el("span", { className: "we-picker__card-badge" }, t("playableBadge", playableCount)),
        el("span", { className: "we-picker__card-desc" }, t("wallpaperEngineDesc"))
      )
    ));
    if (!store.state.pickerOpen) {
      const pill = el("span", { className: "we-tabs__pill", "aria-hidden": "true" });
      const tabsBar = el(
        "div",
        { className: "we-tabs", role: "tablist" },
        pill,
        TABS.map((item) => el("button", {
          type: "button",
          role: "tab",
          "aria-selected": item.id === activeTabDef.id ? "true" : "false",
          className: `we-tabs__tab ${item.id === activeTabDef.id ? "we-tabs__tab--active" : ""}`,
          onClick: () => {
            if (store.state.tab === item.id) return;
            store.state.tab = item.id;
            store.state.armedConfirm = "";
            store.notify();
          }
        }, t(item.key)))
      );
      hostWrap.appendChild(tabsBar);
      lastTabsBar = tabsBar;
      if (resizeObserver) resizeObserver.disconnect();
      if (typeof ResizeObserver === "function") {
        resizeObserver = new ResizeObserver(() => positionPill(lastTabsBar, true));
        resizeObserver.observe(tabsBar);
      }
      requestAnimationFrame(() => positionPill(tabsBar, false));
    }
    hostWrap.appendChild(activeTabDef.render(store));
    if (!store.state.pickerOpen && TAB_RESET_KEYS[activeTabDef.id]) {
      hostWrap.appendChild(renderTabReset(store, activeTabDef.id));
    }
    if (toast?.message) {
      hostWrap.appendChild(el("div", { className: "we-picker__toast", role: "status" }, toast.message));
    }
    restoreFocusState(hostWrap, focusSnap);
  };
  const onKeyDown = (e) => {
    if (e.key === "Escape" && store.state.pickerOpen && rootEl.isConnected && rootEl.style.display !== "none") {
      e.preventDefault();
      e.stopPropagation();
      store.state.pickerOpen = false;
      store.state.pickerDraft = false;
      store.state.batchMode = false;
      store.state.batchSelected = [];
      store.notify();
    }
  };
  doc.addEventListener("keydown", onKeyDown, true);
  const unsubscribe = store.subscribe(render);
  render();
  void store.loadInitial();
  return {
    store,
    reload: () => store.loadInitial(),
    syncExternal: (payload) => store.syncExternal(payload),
    destroy() {
      unsubscribe();
      doc.removeEventListener("keydown", onKeyDown, true);
      if (resizeObserver) resizeObserver.disconnect();
      hostWrap.remove();
    }
  };
}

// src/ui/panel.js
var mountNode = document.getElementById("app");
if (mountNode) {
  const mode = window.__AGY_SKINS_HOST_MODE__ || "studio";
  mountWePicker(mountNode, {
    embed: mode === "aux" ? "aux" : "studio"
  });
}
