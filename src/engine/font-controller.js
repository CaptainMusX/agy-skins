const FONT_STYLE_ID = 'agy-skins-font-css'
const SURFACES = ':is([data-main-content-body], [data-testid="conversation-view"], [data-testid="sidebar-split"] > :first-child, .surface-composer, [class*="@container/titlebar"])'
const COMPONENT_SELECTORS = {
  markdown: '[data-markdown-root]',
  codeBlock: '[data-markdown-root] :is(pre, code, kbd)',
  terminal: '.xterm',
  table: '[data-markdown-root] :is(table, th, td)'
}
const ROLE_SELECTORS = {
  'markdown-h1': '[data-markdown-root] h1',
  'markdown-h2': '[data-markdown-root] h2',
  'markdown-h3': '[data-markdown-root] h3',
  'markdown-h4': '[data-markdown-root] h4',
  'markdown-base': '[data-markdown-root]',
  'markdown-small': '[data-markdown-root] :is(small, .text-xs)',
  'markdown-code': '[data-markdown-root] :not(pre) > code',
  'markdown-code-block': '[data-markdown-root] :is(pre, pre code)',
  'markdown-table': '[data-markdown-root] :is(table, th, td)',
  'markdown-table-head': '[data-markdown-root] th',
  'xs-13': '[class*="@container/titlebar"], [data-main-content-header]',
  'xxs-12': '[data-markdown-root] :is(.text-xs, small)'
}
const TEXT_TOKEN_ROLES = {
  primary: '--foreground',
  secondary: '--secondary-foreground',
  tertiary: '--muted-foreground',
  caption: '--placeholder',
  dimmed: '--muted-foreground'
}

const safeFamily = value => typeof value === 'string'
  ? value.replace(/[;{}<>"'\\\u0000-\u001f\u007f]/g, '').trim().slice(0, 200)
  : ''

export function fontFamilyStack(value) {
  const family = safeFamily(value)
  if (!family || family === 'inherit') return 'inherit'
  if (family.includes(',')) return family
  return `"${family}", system-ui, sans-serif`
}

function roleCss(config) {
  const blocks = []
  for (const [role, selector] of Object.entries(ROLE_SELECTORS)) {
    const size = Number(config.themeSize?.[role]) || 0
    const weight = Number(config.themeWeight?.[role]) || 0
    const family = safeFamily(config.themeFamily?.[role])
    const decl = []
    if (size >= 8 && size <= 48) decl.push(`font-size:${size}px !important`)
    if (weight >= 100 && weight <= 900) decl.push(`font-weight:${weight} !important`)
    if (family) decl.push(`font-family:${fontFamilyStack(family)} !important`)
    if (decl.length) blocks.push(`body[data-agy-skins-font="true"] ${selector}{${decl.join(';')}}`)
  }
  return blocks.join('\n')
}

function componentCss(config) {
  const blocks = []
  for (const [id, selector] of Object.entries(COMPONENT_SELECTORS)) {
    const value = config.componentFonts?.[id]
    if (!value) continue
    const decl = []
    if (Number(value.size) >= 8) decl.push(`font-size:${Math.round(Number(value.size))}px !important`)
    if (Number(value.weight) >= 100) decl.push(`font-weight:${Math.round(Number(value.weight))}px !important`.replace('px', ''))
    const family = safeFamily(value.family)
    if (family) decl.push(`font-family:${fontFamilyStack(family)} !important`)
    if (decl.length) blocks.push(`body[data-agy-skins-font="true"] ${selector}{${decl.join(';')}}`)
  }
  return blocks.join('\n')
}

function colorCss(config) {
  const blocks = []
  for (const mode of ['light', 'dark']) {
    const decl = []
    for (const [role, token] of Object.entries(TEXT_TOKEN_ROLES)) {
      const pair = config.themeColors?.[role]
      const color = pair?.[config.themeDarkSeparate ? mode : 'light'] || pair?.dark || pair?.light
      if (/^#[0-9a-f]{6}$/i.test(color || '')) decl.push(`${token}:${color}`)
    }
    if (decl.length) {
      const modeSel = mode === 'light' ? 'body.theme-light' : 'body:not(.theme-light)'
      blocks.push(`${modeSel}[data-agy-skins-text-colors="true"]{${decl.join(';')}}`)
    }
  }
  return blocks.join('\n')
}

function uiColorCss(config) {
  if (!config.uiColorCustom) return ''
  const accent = /^#[0-9a-f]{6}$/i.test(config.accent || '') ? config.accent : '#4f8cff'
  const send = /^#[0-9a-f]{6}$/i.test(config.uiColorSend || '') ? config.uiColorSend : accent
  const link = /^#[0-9a-f]{6}$/i.test(config.uiColorLink || '') ? config.uiColorLink : accent
  const file = /^#[0-9a-f]{6}$/i.test(config.uiColorFileIcon || '') ? config.uiColorFileIcon : link
  const tab = /^#[0-9a-f]{6}$/i.test(config.uiColorTab || '') ? config.uiColorTab : accent
  const deep = /^#[0-9a-f]{6}$/i.test(config.uiColorDeepDiving || '') ? config.uiColorDeepDiving : accent
  return `
    body[data-agy-skins-ui-colors="true"] {
      --we-accent:${accent};
      --primary:${accent};
      --cta:${accent};
      --nux-focus-ring:color-mix(in srgb, ${accent} 55%, transparent);
    }
    body[data-agy-skins-ui-colors="true"] .surface-composer button[type="submit"],
    body[data-agy-skins-ui-colors="true"] .surface-composer [data-testid="input-send-button"] {
      background-color:${send} !important;
    }
    body[data-agy-skins-ui-colors="true"] [data-markdown-root] a,
    body[data-agy-skins-ui-colors="true"] [data-markdown-root] .text-primary {
      color:${link} !important;
    }
    body[data-agy-skins-ui-colors="true"] [data-testid="tool-group-collapsible"] svg {
      color:${file};
    }
    body[data-agy-skins-ui-colors="true"] [data-panel-header] [aria-selected="true"] {
      color:${tab} !important;
      border-color:${tab} !important;
    }
    body[data-agy-skins-ui-colors="true"] [data-testid="worked-for-collapsible"] {
      color:${deep};
    }
  `
}

export class FontController {
  constructor() {
    this.styleEl = null
    this.lastKey = null
  }

  update(config = {}) {
    if (typeof document === 'undefined' || !document.body) return
    const body = document.body
    const fontOn = config.fontCustom === true
    const colorsOn = fontOn && Object.keys(config.themeColors || {}).length > 0
    const uiColorsOn = config.uiColorCustom === true
    const caret = /^#[0-9a-f]{6}$/i.test(config.caretColor || '') ? config.caretColor : ''
    const globalFamily = safeFamily(config.globalFamily)

    const key = JSON.stringify({
      fontOn, colorsOn, uiColorsOn, caret, globalFamily,
      themeSize: config.themeSize, themeWeight: config.themeWeight,
      themeFamily: config.themeFamily, componentFonts: config.componentFonts,
      themeColors: config.themeColors, themeDarkSeparate: config.themeDarkSeparate,
      accent: config.accent, send: config.uiColorSend, link: config.uiColorLink,
      file: config.uiColorFileIcon, tab: config.uiColorTab, deep: config.uiColorDeepDiving
    })
    if (key === this.lastKey && (!this.styleEl || this.styleEl.isConnected)) return
    this.lastKey = key

    if (fontOn) body.setAttribute('data-agy-skins-font', 'true')
    else body.removeAttribute('data-agy-skins-font')
    if (colorsOn) body.setAttribute('data-agy-skins-text-colors', 'true')
    else body.removeAttribute('data-agy-skins-text-colors')
    if (uiColorsOn) body.setAttribute('data-agy-skins-ui-colors', 'true')
    else body.removeAttribute('data-agy-skins-ui-colors')

    if (fontOn && globalFamily) body.style.setProperty('--agy-skins-font-family', fontFamilyStack(globalFamily))
    else body.style.removeProperty('--agy-skins-font-family')

    const css = [
      fontOn ? `
        body[data-agy-skins-font="true"] ${SURFACES} {
          font-family:var(--agy-skins-font-family, inherit) !important;
        }
        ${roleCss(config)}
        ${componentCss(config)}
      ` : '',
      caret ? `
        body :is(input, textarea, [contenteditable="true"]) {
          caret-color:${caret} !important;
        }
      ` : '',
      colorCss(config),
      uiColorCss(config)
    ].filter(Boolean).join('\n')

    if (!css.trim()) {
      this.styleEl?.remove()
      this.styleEl = null
      return
    }
    if (!this.styleEl || !this.styleEl.isConnected) {
      this.styleEl = document.getElementById(FONT_STYLE_ID) || document.createElement('style')
      this.styleEl.id = FONT_STYLE_ID
      this.styleEl.dataset.plugin = 'agy-skins'
      if (!this.styleEl.isConnected) document.head.appendChild(this.styleEl)
    }
    this.styleEl.textContent = css
  }

  destroy() {
    this.update({ fontCustom: false, uiColorCustom: false, caretColor: '' })
  }
}
