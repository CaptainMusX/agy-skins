/**
 * Library tab + in-page drill-down wallpaper browser (.we-picker__modal),
 * inspired by elysia395/dsh-wallpaper-engine.
 */
import { WALLPAPER_TYPES, CONTENT_RATINGS, ORIENTATION_FILTERS, ROTATION_INTERVAL_MIN, ROTATION_INTERVAL_MAX } from '../../shared/config.js'
import {
  el, moduleResetButton, sectionHead, switchRow, configSlider, SliderRow, segRow, selectRow, renderConfirmRow
} from '../panel-api.js'

function isUploadItem(item) {
  if (!item) return false
  return (
    item.source === 'upload' ||
    item.source === 'uploads' ||
    item.isUploaded === true ||
    item.isUpload === true ||
    String(item.id || '').startsWith('upload') ||
    /[/\\]\.agy-skins[/\\]uploads[/\\]/i.test(String(item.mediaPath || item.filePath || ''))
  )
}

function weColorToHex(val, fallback = '#000000') {
  const s = String(val ?? '').trim()
  if (/^#[0-9a-f]{6}$/i.test(s)) return s.toLowerCase()
  const parts = s.split(/[\s,]+/).filter(Boolean).map(Number)
  if (parts.length >= 3 && parts.slice(0, 3).every(Number.isFinite)) {
    const isByte = parts.slice(0, 3).some(n => n > 1)
    const toByte = n => Math.min(255, Math.max(0, Math.round(isByte ? n : n * 255)))
    return `#${parts.slice(0, 3).map(n => toByte(n).toString(16).padStart(2, '0')).join('')}`
  }
  return fallback
}

function hexToWeColor(hex) {
  const m = String(hex || '').trim().match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i)
  if (!m) return '0 0 0'
  return m.slice(1).map(h => {
    const f = parseInt(h, 16) / 255
    return f === 0 ? '0' : f === 1 ? '1' : f.toFixed(4).replace(/\.?0+$/, '')
  }).join(' ')
}

function formatWePropLabel(prop, t) {
  const raw = String(prop?.text || prop?.name || '').trim()
  const normalized = raw.toLowerCase().replace(/[\s-]+/g, '_')
  if (normalized === 'ui_browse_properties_scheme_color' || normalized === 'schemecolor' || normalized === 'scheme_color') {
    return t('propSchemeColor')
  }
  return raw.replace(/^ui_browse_properties_/i, '').replace(/^ui_/i, '').replace(/_/g, ' ').trim() || prop?.name || ''
}

function getKindBadge(kind, t) {
  return {
    video: t('weTypeVideo'),
    scene: t('weTypeScene'),
    image: t('weTypeImage'),
    web: t('weTypeWeb')
  }[kind] || String(kind || t('weTypeOther')).toUpperCase()
}

function getTypeSubtitle(config, t) {
  if (!config.wallpaperEnabled) return t('selectWallpaperFirst')
  const base = {
    video: t('typeVideoLabel'),
    web: t('typeWebLabel'),
    image: t('typeImageLabel'),
    scene: config.sceneLive !== false && config.wallpaperMode !== 'frame' ? t('typeSceneLiveLabel') : t('typeSceneFrameLabel')
  }[config.wallpaperType] || t('typeImageLabel')
  return `${base}${config.wallpaperPaused ? t('statusPaused') : t('statusPlaying')}`
}

function renderPropsEditor(store) {
  const { config } = store.state
  const t = store.getT()
  const sel = config.weSelection
  const props = Array.isArray(sel?.properties) ? sel.properties.filter(p => !p.hidden) : []
  if (!props.length) return null

  return el('div', { className: 'we-picker__props' },
    props.map(prop => {
      const curVal = config.userProps?.[sel.id]?.[prop.name] ?? prop.value
      const label = formatWePropLabel(prop, t)
      const setProp = (val, { rerender = true } = {}) => {
        const next = structuredClone(config.userProps || {})
        next[sel.id] = { ...(next[sel.id] || {}), [prop.name]: val }
        void store.updateConfig({ userProps: next }, { defer: !rerender, rerender })
      }
      if (prop.type === 'bool') {
        return switchRow({ label, checked: Boolean(curVal), onChange: v => setProp(v) })
      }
      if (prop.type === 'color' || /^\s*\d+(?:\.\d+)?(?:\s+|,)\d+(?:\.\d+)?(?:\s+|,)\d+(?:\.\d+)?\s*$/.test(String(curVal ?? ''))) {
        const hexVal = weColorToHex(curVal, '#000000')
        return el('div', { className: 'we-picker__ctl' },
          el('span', { className: 'we-picker__ctl-label' }, label),
          el('label', { className: 'we-picker__swatch-custom' },
            el('input', {
              type: 'color',
              value: hexVal,
              onInput: e => setProp(hexToWeColor(e.target.value), { rerender: false }),
              onChange: e => setProp(hexToWeColor(e.target.value), { rerender: true })
            })
          )
        )
      }
      if (prop.type === 'combo' && Array.isArray(prop.options)) {
        return selectRow({
          label,
          value: String(curVal ?? ''),
          options: prop.options.map(o => ({ value: String(o.value), label: o.label || String(o.value) })),
          onChange: v => setProp(v)
        })
      }
      if (prop.type === 'slider') {
        const min = Number.isFinite(prop.min) ? prop.min : 0
        const max = Number.isFinite(prop.max) ? prop.max : 100
        const step = Number.isFinite(prop.step) && prop.step > 0 ? prop.step : 0.1
        return SliderRow({
          label,
          min,
          max,
          step,
          value: Number.isFinite(Number(curVal)) ? Number(curVal) : min,
          defaultValue: prop.default ?? min,
          onChange: v => setProp(v, { rerender: false }),
          onCommit: v => setProp(v, { rerender: true })
        })
      }
      return el('div', { className: 'we-picker__ctl' },
        el('span', { className: 'we-picker__ctl-label' }, label),
        el('input', {
          type: 'text',
          className: 'we-picker__text',
          style: { maxWidth: '180px' },
          value: String(curVal ?? ''),
          onChange: e => setProp(e.target.value)
        })
      )
    })
  )
}

function renderPickerModal(store) {
  const { config, weItems, scanning, busyAction } = store.state
  const t = store.getT()
  const isZh = store.isZh()
  const isDraft = Boolean(store.state.pickerDraft && store.state.editingGroup)
  const hiddenSet = new Set(config.hiddenWallpaperIds || [])
  const typeSet = new Set(config.typeFilter || WALLPAPER_TYPES)
  const ratingSet = new Set(config.contentRatingFilter || ['everyone'])
  const showHidden = store.state.modalView === 'hidden'
  const draftSet = isDraft ? new Set(store.state.editingGroup.wallpaperIds || []) : null

  const baseMatchesSearchAndList = item => {
    if (showHidden !== hiddenSet.has(item.id)) return false
    if (config.folderFilter && config.folderFilter !== 'all' && item.libraryRoot !== config.folderFilter) return false
    if (config.orientationFilter === 'landscape' && item.width > 0 && item.height > 0 && item.width < item.height) return false
    if (config.orientationFilter === 'portrait' && item.width > 0 && item.height > 0 && item.height <= item.width) return false
    const q = String(store.state.search || '').trim().toLowerCase()
    if (q) {
      const titleHit = String(item.title || '').toLowerCase().includes(q)
      const idHit = String(item.workshopId || '').toLowerCase().includes(q)
      if (!titleHit && !idHit) return false
    }
    return true
  }

  const filterItems = () => weItems
    .filter(item => baseMatchesSearchAndList(item) && typeSet.has(item.kind) && ratingSet.has(item.contentrating || 'everyone'))
    .sort((a, b) => config.sortOrder === 'title'
      ? String(a.title || '').localeCompare(String(b.title || ''), undefined, { sensitivity: 'base' })
      : (Number(b.mtimeMs) || 0) - (Number(a.mtimeMs) || 0))

  const ratingCounts = {}
  const typeCounts = {}
  for (const item of weItems) {
    if (!baseMatchesSearchAndList(item)) continue
    const r = item.contentrating || 'everyone'
    ratingCounts[r] = (ratingCounts[r] || 0) + 1
    typeCounts[item.kind] = (typeCounts[item.kind] || 0) + 1
  }

  const visibleCount = weItems.filter(i => !hiddenSet.has(i.id)).length
  const hiddenCount = weItems.filter(i => hiddenSet.has(i.id)).length
  const folders = [...new Set(weItems.map(i => i.libraryRoot).filter(Boolean))]
  const batchSet = new Set(store.state.batchSelected)
  const gridHost = el('div', { className: 'we-picker__grid' })

  const toggleMultiFilter = (field, allowed, value) => {
    const next = new Set(config[field] || allowed)
    if (next.has(value)) {
      if (next.size > 1) next.delete(value)
    } else {
      next.add(value)
    }
    void store.updateConfig({ [field]: [...next] })
  }

  const renderGridCards = () => {
    gridHost.innerHTML = ''
    const filtered = filterItems()
    if (!isDraft && !showHidden) {
      const canResume = !config.wallpaperEnabled && Boolean(config.wallpaperSource || config.weSelection)
      const label = config.wallpaperPaused
        ? (isZh ? '▶ 播放' : '▶ Play')
        : config.wallpaperEnabled
          ? t('closeCard')
          : canResume
            ? (isZh ? '▶ 播放' : '▶ Play')
            : (isZh ? '✕ 关闭' : '✕ Off')
      gridHost.appendChild(el('div', {
        className: 'we-picker__card',
        role: 'button',
        tabIndex: 0,
        title: isZh ? '开关或恢复当前壁纸' : 'Toggle active wallpaper',
        onClick: () => {
          if (config.wallpaperPaused) void store.updateConfig({ wallpaperPaused: false })
          else if (config.wallpaperEnabled) void store.updateConfig({ wallpaperEnabled: false })
          else if (canResume) void store.updateConfig({ wallpaperEnabled: true, wallpaperPaused: false })
        }
      }, el('div', { className: 'we-picker__card-close' }, label)))
    }

    if (!filtered.length) {
      gridHost.appendChild(el('div', { className: 'we-picker__hint', style: { gridColumn: '1 / -1', padding: '18px 0', textAlign: 'center' } }, t('weEmpty')))
      return
    }

    for (const item of filtered.slice(0, 220)) {
      const selected = config.weSelection?.id === item.id || (config.wallpaperSource && config.wallpaperSource === item.mediaPath)
      const checked = isDraft ? draftSet.has(item.id) : batchSet.has(item.id)
      const card = el('div', {
        className: `we-picker__card ${!isDraft && selected ? 'we-picker__card--selected' : ''} ${checked ? 'we-picker__card--checked' : ''}`,
        role: 'button',
        tabIndex: 0,
        title: item.title,
        onClick: () => {
          if (isDraft) {
            const list = store.state.editingGroup.wallpaperIds || []
            store.state.editingGroup.wallpaperIds = list.includes(item.id)
              ? list.filter(x => x !== item.id)
              : [...list, item.id]
            store.notify()
            return
          }
          if (store.state.batchMode) {
            store.state.batchSelected = batchSet.has(item.id)
              ? store.state.batchSelected.filter(id => id !== item.id)
              : [...store.state.batchSelected, item.id]
            store.notify()
            return
          }
          if (busyAction === item.id) return
          void store.applyWallpaperItem(item)
        }
      })

      if (item.previewUrl) {
        const placeholder = el('div', { className: 'we-picker__card-placeholder', style: { display: 'none' } }, t('weNoPreview'))
        card.appendChild(el('img', {
          src: item.previewUrl,
          loading: 'lazy',
          alt: item.title,
          onError: e => {
            e.target.style.display = 'none'
            placeholder.style.display = 'flex'
          }
        }))
        card.appendChild(placeholder)
      } else {
        card.appendChild(el('div', { className: 'we-picker__card-placeholder' }, t('weNoPreview')))
      }

      if (isDraft || store.state.batchMode) {
        card.appendChild(el('span', { className: 'we-picker__card-check' }, checked ? '✓' : ''))
      } else {
        card.appendChild(el('span', { className: 'we-picker__card-type' }, getKindBadge(item.kind, t)))
      }

      if (selected && !isDraft) {
        card.appendChild(el('span', { className: 'we-picker__card-badge' }, t('weSelected')))
      }

      if (!isDraft && !store.state.batchMode) {
        card.appendChild(el('button', {
          type: 'button',
          className: 'we-picker__card-hide',
          onClick: e => {
            e.stopPropagation()
            const next = new Set(hiddenSet)
            if (next.has(item.id)) next.delete(item.id)
            else next.add(item.id)
            void store.updateConfig({ hiddenWallpaperIds: [...next] })
          }
        }, showHidden ? t('weRestore') : t('weHide')))
      }

      card.appendChild(el('div', { className: 'we-picker__card-title' }, item.title))
      gridHost.appendChild(card)
    }
  }
  renderGridCards()

  const ratingLabelMap = {
    everyone: t('ratingEveryone'),
    pg13: t('ratingPg13'),
    mature: t('ratingMature'),
    unrated: t('ratingUnrated')
  }

  return el('div', {
    className: 'we-picker__modal',
    dataset: { weCards: config.pickerLayout === 'classic' ? 'classic' : 'fixed' }
  },
    el('div', { className: 'we-picker__modal-head' },
      el('div', { className: 'we-picker__modal-head-left' },
        el('button', {
          type: 'button',
          className: 'we-picker__btn',
          onClick: () => {
            store.state.pickerOpen = false
            store.state.pickerDraft = false
            store.state.batchMode = false
            store.state.batchSelected = []
            store.notify()
          }
        }, `← ${t('back')}`),
        el('span', { className: 'we-picker__modal-title' },
          isDraft ? (isZh ? '为轮播列表勾选壁纸' : 'Pick Playlist Wallpapers') : t('weTitle')
        )
      ),
      el('div', { className: 'we-picker__row' },
        !isDraft ? el('button', {
          type: 'button',
          className: `we-picker__btn ${store.state.batchMode ? 'is-on' : ''}`,
          onClick: () => {
            store.state.batchMode = !store.state.batchMode
            if (!store.state.batchMode) store.state.batchSelected = []
            store.notify()
          }
        }, store.state.batchMode ? t('exitBatch') : t('batchMode')) : null,
        el('button', {
          type: 'button',
          className: 'we-picker__btn',
          onClick: async () => {
            const res = await store.rpc('pick-folder', { title: t('weChooseFolder') })
            const picked = res?.paths?.[0]
            if (picked) {
              await store.updateConfig({ weRoots: [...new Set([...(config.weRoots || []), picked])] })
              await store.rescanLibrary()
            }
          }
        }, t('weChooseFolder')),
        el('button', {
          type: 'button',
          className: 'we-picker__btn',
          disabled: scanning,
          onClick: () => void store.rescanLibrary()
        }, scanning ? t('refreshing') : t('refresh'))
      )
    ),

    el('div', { className: 'we-picker__modal-tabs' },
      el('button', {
        type: 'button',
        className: `we-picker__tab ${!showHidden ? 'we-picker__tab--active' : ''}`,
        onClick: () => { store.state.modalView = 'normal'; store.state.batchSelected = []; store.notify() }
      }, t('normalListTab', visibleCount)),
      el('button', {
        type: 'button',
        className: `we-picker__tab ${showHidden ? 'we-picker__tab--active' : ''}`,
        onClick: () => { store.state.modalView = 'hidden'; store.state.batchSelected = []; store.notify() }
      }, t('hiddenListTab', hiddenCount))
    ),

    store.state.batchMode ? el('div', { className: 'we-picker__row' },
      el('span', { className: 'we-picker__hint' }, t('batchSelectedCount', store.state.batchSelected.length)),
      el('button', {
        type: 'button',
        className: 'we-picker__btn we-picker__btn--mini',
        onClick: () => {
          store.state.batchSelected = filterItems().map(i => i.id)
          store.notify()
        }
      }, isZh ? '全选当前' : 'Select All'),
      el('button', {
        type: 'button',
        className: 'we-picker__btn we-picker__btn--mini we-picker__btn--primary',
        disabled: !store.state.batchSelected.length,
        onClick: () => {
          store.state.armedConfirm = 'batch-hide'
          store.notify()
        }
      }, showHidden ? (isZh ? '批量恢复' : 'Restore Selected') : t('batchHide'))
    ) : null,

    renderConfirmRow({
      armedToken: store.state.armedConfirm,
      token: 'batch-hide',
      question: showHidden
        ? (isZh ? `恢复选中的 ${store.state.batchSelected.length} 张壁纸？` : `Restore ${store.state.batchSelected.length} wallpapers?`)
        : (isZh ? `隐藏选中的 ${store.state.batchSelected.length} 张壁纸？` : `Hide ${store.state.batchSelected.length} wallpapers?`),
      confirmLabel: t('confirmBtn'),
      cancelLabel: t('cancelBtn'),
      onConfirm: () => {
        const next = new Set(hiddenSet)
        for (const id of store.state.batchSelected) {
          if (showHidden) next.delete(id)
          else next.add(id)
        }
        store.state.batchMode = false
        store.state.batchSelected = []
        store.state.armedConfirm = ''
        void store.updateConfig({ hiddenWallpaperIds: [...next] })
      },
      onCancel: () => { store.state.armedConfirm = ''; store.notify() }
    }),

    el('div', { className: 'we-picker__filter-row' },
      el('input', {
        type: 'search',
        className: 'we-picker__text we-picker__search',
        placeholder: t('weSearch'),
        value: store.state.search || '',
        onInput: e => {
          store.state.search = e.target.value
          renderGridCards()
        }
      }),
      el('select', {
        className: 'we-picker__select',
        value: config.sortOrder || 'newest',
        onChange: e => void store.updateConfig({ sortOrder: e.target.value })
      },
        el('option', { value: 'newest', selected: config.sortOrder === 'newest' }, isZh ? '最新排序' : 'Newest'),
        el('option', { value: 'title', selected: config.sortOrder === 'title' }, isZh ? '名称排序' : 'Title A-Z')
      ),
      el('details', { className: 'we-picker__rating-menu' },
        el('summary', { className: 'we-picker__rating-btn' },
          isZh ? `分级 · ${ratingSet.size}/4 ▾` : `Rating · ${ratingSet.size}/4 ▾`
        ),
        el('div', { className: 'we-picker__rating-list' },
          CONTENT_RATINGS.map(r => el('label', { className: 'we-picker__rating-toggle' },
            el('input', {
              type: 'checkbox',
              checked: ratingSet.has(r),
              onChange: () => toggleMultiFilter('contentRatingFilter', ['everyone'], r)
            }),
            el('span', { style: { flex: '1' } }, ratingLabelMap[r] || r),
            el('span', { className: 'we-picker__hint' }, String(ratingCounts[r] || 0))
          ))
        )
      ),
      el('details', { className: 'we-picker__rating-menu' },
        el('summary', { className: 'we-picker__rating-btn' },
          isZh ? `类型 · ${typeSet.size}/4 ▾` : `Type · ${typeSet.size}/4 ▾`
        ),
        el('div', { className: 'we-picker__rating-list' },
          WALLPAPER_TYPES.map(kind => el('label', { className: 'we-picker__rating-toggle' },
            el('input', {
              type: 'checkbox',
              checked: typeSet.has(kind),
              onChange: () => toggleMultiFilter('typeFilter', WALLPAPER_TYPES, kind)
            }),
            el('span', { style: { flex: '1' } }, getKindBadge(kind, t)),
            el('span', { className: 'we-picker__hint' }, String(typeCounts[kind] || 0))
          ))
        )
      ),
      folders.length > 1 ? el('select', {
        className: 'we-picker__select',
        value: config.folderFilter || 'all',
        onChange: e => void store.updateConfig({ folderFilter: e.target.value })
      }, [
        el('option', { value: 'all', selected: config.folderFilter === 'all' }, t('tagsAll')),
        ...folders.map(f => el('option', { value: f, selected: config.folderFilter === f }, f))
      ]) : null,
      el('div', { className: 'we-picker__seg' },
        el('button', {
          type: 'button',
          className: `we-picker__btn we-picker__rate ${config.pickerLayout !== 'classic' ? 'we-picker__rate--active' : ''}`,
          onClick: () => void store.updateConfig({ pickerLayout: 'fixed' })
        }, isZh ? '常规网格' : 'Grid'),
        el('button', {
          type: 'button',
          className: `we-picker__btn we-picker__rate ${config.pickerLayout === 'classic' ? 'we-picker__rate--active' : ''}`,
          onClick: () => void store.updateConfig({ pickerLayout: 'classic' })
        }, isZh ? 'CD 架' : 'CD Rack')
      )
    ),

    segRow({
      label: isZh ? '构图方向筛选' : 'Orientation',
      value: config.orientationFilter || 'all',
      items: ORIENTATION_FILTERS.map(o => ({
        id: o,
        label: { all: t('orientAll'), landscape: t('orientLandscape'), portrait: t('orientPortrait') }[o]
      })),
      onPick: id => void store.updateConfig({ orientationFilter: id })
    }),

    showHidden && hiddenCount > 0 ? el('div', { className: 'we-picker__row' },
      el('button', {
        type: 'button',
        className: 'we-picker__btn we-picker__btn--mini',
        onClick: () => { store.state.armedConfirm = 'restore-all'; store.notify() }
      }, t('restoreAll')),
      renderConfirmRow({
        armedToken: store.state.armedConfirm,
        token: 'restore-all',
        question: isZh ? `确认恢复全部 ${hiddenCount} 个隐藏壁纸？` : `Restore all ${hiddenCount} hidden wallpapers?`,
        confirmLabel: t('confirmBtn'),
        cancelLabel: t('cancelBtn'),
        onConfirm: () => {
          store.state.armedConfirm = ''
          void store.updateConfig({ hiddenWallpaperIds: [] })
        },
        onCancel: () => { store.state.armedConfirm = ''; store.notify() }
      })
    ) : null,

    gridHost
  )
}

function renderRotationEditor(store) {
  const { config, weItems } = store.state
  const t = store.getT()
  const isZh = store.isZh()
  const grp = store.state.editingGroup
  if (!grp) return null
  const byId = new Map(weItems.map(i => [i.id, i]))

  return el('div', { className: 'we-picker__editor' },
    el('div', { className: 'we-picker__row' },
      el('input', {
        type: 'text',
        className: 'we-picker__text',
        placeholder: isZh ? '输入列表名称…' : 'Playlist name…',
        value: grp.name || '',
        onInput: e => { grp.name = e.target.value }
      }),
      el('button', {
        type: 'button',
        className: 'we-picker__btn',
        onClick: () => {
          store.state.pickerDraft = true
          store.state.pickerOpen = true
          store.notify()
        }
      }, isZh ? `从壁纸库勾选 (${(grp.wallpaperIds || []).length})` : `Pick Wallpapers (${(grp.wallpaperIds || []).length})`)
    ),
    segRow({
      label: isZh ? '切换顺序' : 'Order',
      value: grp.order || 'sequence',
      items: [
        { id: 'sequence', label: isZh ? '顺序' : 'Sequence' },
        { id: 'random', label: isZh ? '随机' : 'Random' }
      ],
      onPick: id => { grp.order = id; store.notify() }
    }),
    segRow({
      label: isZh ? '触发时机' : 'Trigger',
      value: grp.trigger || 'interval',
      items: [
        { id: 'interval', label: isZh ? '按时间间隔' : 'Interval' },
        { id: 'videoEnd', label: isZh ? '视频播完后' : 'Video End' }
      ],
      onPick: id => { grp.trigger = id; store.notify() }
    }),
    SliderRow({
      label: isZh ? '组内间隔' : 'Group interval',
      min: ROTATION_INTERVAL_MIN,
      max: ROTATION_INTERVAL_MAX,
      step: 1,
      unit: 'm',
      numberEdit: true,
      value: grp.interval ?? config.rotationMinutes,
      onChange: v => { grp.interval = v },
      onCommit: v => { grp.interval = v }
    }),
    (grp.wallpaperIds || []).length ? el('div', { className: 'we-picker__seg we-picker__seg--chips' },
      grp.wallpaperIds.map(id => el('button', {
        type: 'button',
        className: 'we-picker__chip',
        title: isZh ? '点击移除' : 'Click to remove',
        onClick: () => {
          grp.wallpaperIds = grp.wallpaperIds.filter(x => x !== id)
          store.notify()
        }
      }, `${byId.get(id)?.title || id.split(/[\\/]/).at(-1)} ×`))
    ) : el('div', { className: 'we-picker__hint' }, isZh ? '尚未勾选壁纸；点击右上“从壁纸库勾选”。' : 'No wallpapers picked yet.'),
    el('div', { className: 'we-picker__row', style: { justifyContent: 'flex-end' } },
      el('button', {
        type: 'button',
        className: 'we-picker__btn we-picker__btn--primary',
        onClick: () => {
          const clean = {
            id: grp.id || `rg_${Date.now().toString(36)}`,
            name: String(grp.name || '').trim() || (isZh ? '新建列表' : 'New Playlist'),
            interval: Math.max(ROTATION_INTERVAL_MIN, Math.min(ROTATION_INTERVAL_MAX, Number(grp.interval) || 30)),
            order: grp.order || 'sequence',
            trigger: grp.trigger || 'interval',
            wallpaperIds: [...(grp.wallpaperIds || [])]
          }
          const groups = [...(config.rotationGroups || [])]
          const idx = groups.findIndex(g => g.id === clean.id)
          if (idx >= 0) groups[idx] = clean
          else groups.push(clean)
          store.state.editingGroup = null
          void store.updateConfig({ rotationGroups: groups, rotationGroupId: clean.id })
        }
      }, isZh ? '保存列表' : 'Save'),
      el('button', {
        type: 'button',
        className: 'we-picker__btn',
        onClick: () => { store.state.editingGroup = null; store.notify() }
      }, t('cancelBtn'))
    )
  )
}

export function renderLibraryTab(store) {
  if (store.state.pickerOpen) return renderPickerModal(store)

  const { config, weItems, scanning, busyAction } = store.state
  const t = store.getT()
  const isZh = store.isZh()
  const sel = config.weSelection
  const activeItem = sel?.id
    ? weItems.find(i => i.id === sel.id) || sel
    : weItems.find(i => config.wallpaperSource && i.mediaPath === config.wallpaperSource) || null
  const previewSrc = activeItem?.previewUrl || ''
  const titleText = config.wallpaperEnabled
    ? (activeItem?.title || (config.wallpaperSource ? config.wallpaperSource.split(/[\\/]/).at(-1) : t('noWallpaperSelected')))
    : t('noWallpaperSelected')
  const selProps = Array.isArray(sel?.properties) ? sel.properties.filter(p => !p.hidden) : []
  const isPlaying = Boolean(config.wallpaperEnabled && !config.wallpaperPaused)
  const directionalTransitions = new Set(['push', 'wipe', 'bars'])
  const uploads = weItems.filter(isUploadItem)
  const rotationGroups = config.rotationGroups || []
  const activeGroup = rotationGroups.find(g => g.id === config.rotationGroupId) || rotationGroups[0] || null

  const urlInput = el('input', {
    type: 'text',
    className: 'we-picker__text',
    value: store.state.urlDraft || '',
    placeholder: isZh ? '粘贴 https:// 图片或视频直链下载到本地库' : 'Paste https:// image/video URL to download',
    onInput: e => { store.state.urlDraft = e.target.value }
  })
  const manualInput = el('input', {
    type: 'text',
    className: 'we-picker__text',
    value: config.wallpaperSource || '',
    placeholder: t('wallpaperSourcePlaceholder')
  })

  return el('div', { className: 'we-tabpanel' },
    /* 1. Current Wallpaper Hero Card */
    el('div', { className: 'we-picker__current' },
      el('div', { className: `we-vinyl ${isPlaying ? 'we-vinyl--playing' : ''}` },
        el('div', { className: 'we-vinyl__cover' },
          previewSrc
            ? el('img', { src: previewSrc, alt: titleText })
            : el('div', { className: 'we-vinyl__empty' }, '♪')
        ),
        el('div', { className: 'we-vinyl__hole' })
      ),
      el('div', { className: 'we-picker__current-info' },
        el('div', { className: 'we-picker__current-title', title: titleText }, titleText),
        el('span', { className: 'we-picker__current-meta' }, getTypeSubtitle(config, t)),
        el('div', { className: 'we-picker__row', style: { marginTop: '8px' } },
          el('button', {
            type: 'button',
            className: 'we-picker__btn we-picker__btn--primary',
            onClick: () => {
              store.state.pickerDraft = false
              store.state.pickerOpen = true
              store.notify()
            }
          }, t('chooseWallpaper')),
          selProps.length > 0 ? el('button', {
            type: 'button',
            className: `we-picker__btn ${store.state.propsOpen ? 'is-on' : ''}`,
            onClick: () => { store.state.propsOpen = !store.state.propsOpen; store.notify() }
          }, t('wallpaperPropsBtn')) : null,
          el('button', {
            type: 'button',
            className: 'we-picker__btn',
            disabled: !config.wallpaperEnabled,
            onClick: () => void store.updateConfig({ wallpaperPaused: !config.wallpaperPaused })
          }, config.wallpaperPaused ? t('play') : t('pause')),
          el('button', {
            type: 'button',
            className: `we-picker__btn ${config.wallpaperSound ? 'is-on' : ''}`,
            onClick: () => {
              const nextSound = !config.wallpaperSound
              const patch = { wallpaperSound: nextSound }
              if (nextSound && Number(config.wallpaperVolume) === 0) patch.wallpaperVolume = 50
              void store.updateConfig(patch)
            }
          }, config.wallpaperSound ? t('audioOnBtn') : t('audioOffBtn')),
          el('button', {
            type: 'button',
            className: 'we-picker__btn',
            disabled: !weItems.length || busyAction === 'next',
            onClick: async () => {
              store.state.busyAction = 'next'
              store.notify()
              try {
                const res = await store.rpc('rotation-advance', {})
                if (res?.config) store.state.config = res.config
              } finally {
                store.state.busyAction = ''
                store.notify()
              }
            }
          }, isZh ? '下一张' : 'Next'),
          config.wallpaperEnabled || config.wallpaperSource ? el('button', {
            type: 'button',
            className: 'we-picker__btn we-picker__btn--danger',
            onClick: () => { store.state.armedConfirm = 'clear-wallpaper'; store.notify() }
          }, t('clear')) : null,
          el('button', {
            type: 'button',
            className: 'we-picker__btn',
            disabled: scanning,
            onClick: () => void store.rescanLibrary()
          }, scanning ? t('refreshing') : t('refresh'))
        )
      )
    ),

    renderConfirmRow({
      armedToken: store.state.armedConfirm,
      token: 'clear-wallpaper',
      question: isZh ? '停止并清除当前壁纸？' : 'Clear active wallpaper?',
      confirmLabel: t('confirmBtn'),
      cancelLabel: t('cancelBtn'),
      danger: true,
      onConfirm: () => {
        store.state.armedConfirm = ''
        store.state.propsOpen = false
        void store.updateConfig({ wallpaperEnabled: false, wallpaperPaused: false, wallpaperSource: '', weSelection: null })
      },
      onCancel: () => { store.state.armedConfirm = ''; store.notify() }
    }),

    store.state.propsOpen ? renderPropsEditor(store) : null,

    /* 2. Transition Section */
    el('div', { className: 'we-picker__section' },
      sectionHead({
        title: isZh ? '壁纸切换过场' : 'Switch Transition',
        resetBtn: moduleResetButton({ onClick: () => store.resetModule('transition') })
      }),
      selectRow({
        label: t('wallpaperTransition'),
        value: config.wallpaperTransition || 'cut',
        options: [
          { value: 'cut', label: t('transitionCut') },
          { value: 'fade', label: t('transitionFade') },
          { value: 'push', label: t('transitionPush') },
          { value: 'wipe', label: t('transitionWipe') },
          { value: 'iris', label: t('transitionIris') },
          { value: 'zoom', label: t('transitionZoom') },
          { value: 'bars', label: t('transitionBars') }
        ],
        onChange: v => void store.updateConfig({ wallpaperTransition: v })
      }),
      directionalTransitions.has(config.wallpaperTransition) ? segRow({
        label: isZh ? '过场方向' : 'Direction',
        value: config.wallpaperTransitionDir || 'left',
        items: [
          { id: 'left', label: t('dirLeft') },
          { id: 'right', label: t('dirRight') },
          { id: 'up', label: t('dirUp') },
          { id: 'down', label: t('dirDown') }
        ],
        onPick: id => void store.updateConfig({ wallpaperTransitionDir: id })
      }) : null,
      config.wallpaperTransition && config.wallpaperTransition !== 'cut' ? segRow({
        label: isZh ? '过场速度' : 'Speed',
        value: config.wallpaperTransitionSpeed || 'normal',
        items: [
          { id: 'fast', label: t('speedFast') },
          { id: 'normal', label: t('speedNormal') },
          { id: 'slow', label: t('speedSlow') }
        ],
        onPick: id => void store.updateConfig({ wallpaperTransitionSpeed: id })
      }) : null
    ),

    /* 3. Auto Rotation Section */
    el('div', { className: 'we-picker__section' },
      sectionHead({
        title: isZh ? '自动轮播' : 'Auto Rotation',
        resetBtn: moduleResetButton({ onClick: () => store.resetModule('rotation') })
      }),
      el('div', { className: 'we-picker__row' },
        el('select', {
          className: 'we-picker__select',
          style: { flex: '1' },
          value: activeGroup?.id || '',
          onChange: e => void store.updateConfig({ rotationGroupId: e.target.value })
        }, [
          el('option', { value: '', selected: !activeGroup }, isZh ? '全部未隐藏壁纸' : 'All visible wallpapers'),
          ...rotationGroups.map(g => el('option', { value: g.id, selected: g.id === activeGroup?.id }, `${g.name} (${g.wallpaperIds.length})`))
        ]),
        el('button', {
          type: 'button',
          className: 'we-picker__btn',
          onClick: () => {
            store.state.editingGroup = {
              id: `rg_${Date.now().toString(36)}`,
              name: isZh ? `轮播列表 ${rotationGroups.length + 1}` : `Playlist ${rotationGroups.length + 1}`,
              interval: config.rotationMinutes || 30,
              order: 'sequence',
              trigger: 'interval',
              wallpaperIds: []
            }
            store.notify()
          }
        }, isZh ? '新建' : 'New'),
        activeGroup ? el('button', {
          type: 'button',
          className: 'we-picker__btn',
          onClick: () => { store.state.editingGroup = structuredClone(activeGroup); store.notify() }
        }, isZh ? '编辑' : 'Edit') : null,
        activeGroup ? el('button', {
          type: 'button',
          className: 'we-picker__btn we-picker__btn--danger',
          onClick: () => { store.state.armedConfirm = `del-rot:${activeGroup.id}`; store.notify() }
        }, isZh ? '删除' : 'Delete') : null
      ),
      activeGroup ? renderConfirmRow({
        armedToken: store.state.armedConfirm,
        token: `del-rot:${activeGroup.id}`,
        question: isZh ? `删除轮播列表 “${activeGroup.name}”？` : `Delete playlist "${activeGroup.name}"?`,
        confirmLabel: t('confirmBtn'),
        cancelLabel: t('cancelBtn'),
        danger: true,
        onConfirm: () => {
          const next = rotationGroups.filter(g => g.id !== activeGroup.id)
          store.state.armedConfirm = ''
          void store.updateConfig({ rotationGroups: next, rotationGroupId: next[0]?.id || '' })
        },
        onCancel: () => { store.state.armedConfirm = ''; store.notify() }
      }) : null,
      renderRotationEditor(store),
      SliderRow({
        label: isZh ? '图片轮播间隔' : 'Picture slide',
        min: 0,
        max: 300,
        step: 5,
        unit: 's',
        defaultValue: 0,
        numberEdit: true,
        value: Number(config.pictureSlideSeconds) || 0,
        onChange: v => void store.updateConfig({ pictureSlideSeconds: v }, { defer: true, rerender: false }),
        onCommit: v => void store.updateConfig({ pictureSlideSeconds: v })
      }),
      switchRow({
        label: t('rotationEnabled'),
        hint: t('rotationHint'),
        checked: config.rotationEnabled,
        onChange: v => void store.updateConfig({ rotationEnabled: v })
      }),
      config.rotationEnabled ? SliderRow({
        label: t('rotationInterval'),
        min: ROTATION_INTERVAL_MIN,
        max: ROTATION_INTERVAL_MAX,
        step: 1,
        unit: 'm',
        defaultValue: 30,
        numberEdit: true,
        value: Number(config.rotationMinutes) || 30,
        onChange: v => void store.updateConfig({ rotationMinutes: v }, { defer: true, rerender: false }),
        onCommit: v => void store.updateConfig({ rotationMinutes: v })
      }) : null
    ),

    /* 4. Custom Wallpapers & Uploads */
    el('div', { className: 'we-picker__section' },
      sectionHead({ title: isZh ? '自定义壁纸与导入' : 'Custom Wallpapers & Imports' }),
      el('div', { className: 'we-picker__row' },
        el('button', {
          type: 'button',
          className: 'we-picker__btn',
          onClick: async () => {
            const pick = await store.rpc('pick-files', { title: isZh ? '选择本地图片或视频' : 'Import local image/video' })
            if (pick?.paths?.length) {
              const res = await store.rpc('uploads-import', { paths: pick.paths })
              if (res?.items?.length) {
                store.showToast(isZh ? `已导入 ${res.items.length} 个素材` : `Imported ${res.items.length} file(s)`)
                await store.rescanLibrary()
              }
            }
          }
        }, isZh ? '导入本地文件' : 'Import Local Media'),
        el('button', {
          type: 'button',
          className: 'we-picker__btn',
          disabled: busyAction === 'bing',
          onClick: async () => {
            store.state.busyAction = 'bing'
            store.notify()
            try {
              const res = await store.rpc('uploads-bing', { index: 0 })
              if (res?.ok && res?.item) {
                await store.rescanLibrary()
                await store.applyWallpaperItem(res.item)
              } else {
                store.showToast(res?.error || 'Bing fetch failed', 'warn')
              }
            } finally {
              store.state.busyAction = ''
              store.notify()
            }
          }
        }, isZh ? 'Bing 每日一图' : 'Bing Daily'),
        el('button', {
          type: 'button',
          className: `we-picker__btn ${store.state.manualSourceOpen ? 'is-on' : ''}`,
          onClick: () => { store.state.manualSourceOpen = !store.state.manualSourceOpen; store.notify() }
        }, isZh ? '手动路径/URL' : 'Manual Source')
      ),
      el('div', { className: 'we-picker__row' },
        urlInput,
        el('button', {
          type: 'button',
          className: 'we-picker__btn',
          disabled: busyAction === 'url',
          onClick: async () => {
            const url = urlInput.value.trim()
            if (!url) return
            store.state.busyAction = 'url'
            store.notify()
            try {
              const res = await store.rpc('uploads-url', { url })
              if (res?.ok && res?.item) {
                store.state.urlDraft = ''
                await store.rescanLibrary()
                await store.applyWallpaperItem(res.item)
              } else {
                store.showToast(res?.error || 'Download failed', 'warn')
              }
            } finally {
              store.state.busyAction = ''
              store.notify()
            }
          }
        }, isZh ? '下载并应用' : 'Fetch URL')
      ),
      store.state.manualSourceOpen ? el('div', { className: 'we-picker__editor' },
        el('div', { className: 'we-picker__row' },
          manualInput,
          el('button', {
            type: 'button',
            className: 'we-picker__btn we-picker__btn--primary',
            onClick: () => {
              const src = String(manualInput.value || '').trim()
              if (!src) {
                void store.updateConfig({ wallpaperEnabled: false, wallpaperSource: '', weSelection: null })
                return
              }
              const inferredType = /\.(mp4|webm|mov|mkv|avi)(?:$|\?)/i.test(src)
                ? 'video'
                : (/\.html?(?:$|\?)/i.test(src) ? 'web' : 'image')
              void store.updateConfig({ wallpaperEnabled: true, wallpaperPaused: false, wallpaperType: inferredType, wallpaperSource: src, weSelection: null })
            }
          }, isZh ? '直接应用' : 'Apply')
        ),
        (config.weRoots || []).length ? el('div', { className: 'we-picker__seg we-picker__seg--chips' },
          config.weRoots.map(root => el('button', {
            type: 'button',
            className: 'we-picker__chip',
            title: isZh ? '点击移除该自定义目录' : 'Remove custom root',
            onClick: async () => {
              await store.updateConfig({ weRoots: config.weRoots.filter(r => r !== root) })
              await store.rescanLibrary()
            }
          }, `${root} ×`))
        ) : null
      ) : null,
      uploads.length ? el('div', { className: 'we-picker__uploads' },
        el('div', { className: 'we-picker__hint' }, isZh ? `已导入素材（${uploads.length}）` : `Uploaded files (${uploads.length})`),
        el('div', { className: 'we-picker__uploads-list' },
          uploads.map(item => {
            const rmToken = `rm-up:${item.id}`
            return el('div', { style: { display: 'flex', flexDirection: 'column', gap: '4px' } },
              el('div', { className: 'we-picker__uploads-item' },
                el('span', { className: 'we-picker__uploads-name', title: item.title }, item.title),
                el('button', {
                  type: 'button',
                  className: 'we-picker__btn we-picker__btn--mini',
                  onClick: () => void store.applyWallpaperItem(item)
                }, t('weUse')),
                el('button', {
                  type: 'button',
                  className: 'we-picker__btn we-picker__btn--mini we-picker__btn--danger',
                  onClick: () => { store.state.armedConfirm = rmToken; store.notify() }
                }, isZh ? '移除' : 'Remove')
              ),
              renderConfirmRow({
                armedToken: store.state.armedConfirm,
                token: rmToken,
                question: isZh ? `彻底删除已导入文件 “${item.title}”？` : `Delete uploaded file "${item.title}"?`,
                confirmLabel: t('confirmBtn'),
                cancelLabel: t('cancelBtn'),
                danger: true,
                onConfirm: async () => {
                  store.state.armedConfirm = ''
                  await store.rpc('uploads-remove', {
                    path: item.mediaPath || item.filePath || '',
                    filePath: item.mediaPath || item.filePath || '',
                    id: item.id
                  })
                  await store.rescanLibrary()
                },
                onCancel: () => { store.state.armedConfirm = ''; store.notify() }
              })
            )
          })
        )
      ) : null
    )
  )
}
