/**
 * Wallpaper Library & Direct Upload/URL/Bing Importer + Live Project User Properties.
 */
import { el, callBackend, switchControl } from '../panel-api.js'
import { WALLPAPER_TYPES, CONTENT_RATINGS, ORIENTATION_FILTERS } from '../../shared/config.js'

let searchQuery = ''
let showHidden = false
let manualSourceDraft = null
let urlImportDraft = ''

export function renderWallpaperEnginePanel(store) {
  const { config, weItems, scanning, busyAction } = store.state
  const t = store.getT()
  const isZh = t('weTypeVideo') === '视频'
  if (manualSourceDraft === null) manualSourceDraft = config.wallpaperSource || ''

  const hiddenSet = new Set(config.hiddenWallpaperIds || [])
  const typeSet = new Set(config.typeFilter || WALLPAPER_TYPES)
  const ratingSet = new Set(config.contentRatingFilter || ['everyone'])
  const folders = [...new Set(weItems.map(i => i.libraryRoot).filter(Boolean))]

  const filtered = weItems
    .filter(item => {
      const isHidden = hiddenSet.has(item.id)
      if (showHidden !== isHidden) return false
      if (!typeSet.has(item.kind)) return false
      if (!ratingSet.has(item.contentrating || 'everyone')) return false
      if (config.folderFilter && config.folderFilter !== 'all' && item.libraryRoot !== config.folderFilter) return false
      if (config.orientationFilter === 'landscape' && item.width > 0 && item.height > 0 && item.width < item.height) return false
      if (config.orientationFilter === 'portrait' && item.width > 0 && item.height > 0 && item.height <= item.width) return false
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        if (!String(item.title || '').toLowerCase().includes(q) && !String(item.workshopId || '').includes(q)) return false
      }
      return true
    })
    .sort((a, b) => config.sortOrder === 'title'
      ? String(a.title || '').localeCompare(String(b.title || ''), undefined, { sensitivity: 'base' })
      : (Number(b.mtimeMs) || 0) - (Number(a.mtimeMs) || 0))

  const toggleHide = item => {
    const next = new Set(hiddenSet)
    if (next.has(item.id)) next.delete(item.id)
    else next.add(item.id)
    void store.updateConfig({ hiddenWallpaperIds: [...next] })
  }

  const toggleFilterChip = (field, allowed, value) => {
    const cur = new Set(config[field] || allowed)
    if (cur.has(value)) {
      if (cur.size > 1) cur.delete(value)
    } else {
      cur.add(value)
    }
    void store.updateConfig({ [field]: [...cur] })
  }

  const applyManualSource = () => {
    const source = String(manualSourceDraft || '').trim()
    if (!source) {
      void store.updateConfig({ wallpaperEnabled: false, wallpaperSource: '' })
      return
    }
    const lower = source.toLowerCase()
    const inferredType = /\.(mp4|webm|mov|mkv|avi)(?:$|\?)/i.test(lower) ? 'video' : config.wallpaperType === 'video' ? 'video' : 'image'
    void store.updateConfig({
      wallpaperEnabled: true,
      wallpaperType: inferredType,
      wallpaperSource: source,
      weSelection: null
    })
  }

  const sel = config.weSelection
  const selProps = Array.isArray(sel?.properties) ? sel.properties.filter(p => !p.hidden) : []

  return el('div', { style: { display: 'flex', flexDirection: 'column', gap: '12px' } },
    el('div', { className: 'agy-card' },
      switchControl({
        label: t('enableWallpaper'),
        desc: t('enableWallpaperDesc'),
        checked: config.wallpaperEnabled,
        onChange: v => void store.updateConfig({ wallpaperEnabled: v })
      }),
      el('div', { className: 'agy-toolbar' },
        el('input', {
          type: 'text',
          className: 'agy-input',
          value: manualSourceDraft,
          placeholder: t('wallpaperSourcePlaceholder'),
          onInput: e => { manualSourceDraft = e.target.value },
          onKeydown: e => { if (e.key === 'Enter') applyManualSource() }
        }),
        el('button', { type: 'button', className: 'agy-btn agy-btn-primary', onClick: applyManualSource }, isZh ? '应用路径/URL' : 'Apply Source')
      )
    ),

    selProps.length > 0 ? el('div', { className: 'agy-card' },
      el('div', { className: 'agy-card-title' }, `${sel.title} — ${isZh ? '场景属性' : 'Scene Properties'}`),
      ...selProps.map(prop => {
        const curVal = config.userProps?.[sel.id]?.[prop.name] ?? prop.value
        const setProp = val => {
          const next = structuredClone(config.userProps || {})
          next[sel.id] = { ...(next[sel.id] || {}), [prop.name]: val }
          void store.updateConfig({ userProps: next })
        }
        if (prop.type === 'bool') {
          return switchControl({
            label: prop.text || prop.name,
            checked: Boolean(curVal),
            onChange: v => setProp(v)
          })
        }
        if (prop.type === 'combo' && Array.isArray(prop.options)) {
          return el('div', { className: 'agy-row' },
            el('div', { className: 'agy-label' }, prop.text || prop.name),
            el('select', {
              className: 'agy-select',
              value: String(curVal ?? ''),
              onChange: e => setProp(e.target.value)
            }, prop.options.map(o => el('option', {
              value: String(o.value),
              selected: String(o.value) === String(curVal)
            }, o.label || String(o.value))))
          )
        }
        if (prop.type === 'slider') {
          const min = Number.isFinite(prop.min) ? prop.min : 0
          const max = Number.isFinite(prop.max) ? prop.max : 100
          const step = Number.isFinite(prop.step) && prop.step > 0 ? prop.step : 0.1
          return el('div', { className: 'agy-row agy-row-col' },
            el('div', { className: 'agy-row-head' },
              el('div', { className: 'agy-label' }, prop.text || prop.name),
              el('span', { className: 'agy-val' }, String(curVal ?? min))
            ),
            el('input', {
              type: 'range',
              min: String(min),
              max: String(max),
              step: String(step),
              value: String(curVal ?? min),
              onInput: e => setProp(Number(e.target.value))
            })
          )
        }
        return el('div', { className: 'agy-row' },
          el('div', { className: 'agy-label' }, prop.text || prop.name),
          el('input', {
            type: 'text',
            className: 'agy-input',
            value: String(curVal ?? ''),
            onChange: e => setProp(e.target.value)
          })
        )
      })
    ) : null,

    el('div', { className: 'agy-card' },
      el('div', { className: 'agy-row-head' },
        el('div', null,
          el('div', { className: 'agy-card-title' }, t('weTitle')),
          el('div', { className: 'agy-card-desc' }, t('weDescription'))
        ),
        el('div', { className: 'agy-toolbar' },
          el('button', {
            type: 'button',
            className: 'agy-btn',
            onClick: async () => {
              const res = await callBackend('pick-folder', { title: t('weChooseFolder') })
              const picked = res?.paths?.[0]
              if (picked) {
                const nextRoots = [...new Set([...(config.weRoots || []), picked])]
                await store.updateConfig({ weRoots: nextRoots })
                await store.rescanLibrary()
              }
            }
          }, t('weChooseFolder')),
          el('button', {
            type: 'button',
            className: 'agy-btn',
            disabled: scanning,
            onClick: () => void store.rescanLibrary()
          }, scanning ? t('weScanning') : t('weRefresh'))
        )
      ),

      el('div', { className: 'agy-toolbar' },
        el('button', {
          type: 'button',
          className: 'agy-btn',
          onClick: async () => {
            const pick = await callBackend('pick-files', { title: isZh ? '选择本地图片或视频' : 'Import local image/video' })
            if (pick?.paths?.length) {
              const res = await callBackend('uploads-import', { paths: pick.paths })
              if (res?.items?.length) {
                store.showToast(isZh ? `已导入 ${res.items.length} 个素材` : `Imported ${res.items.length} file(s)`)
                await store.rescanLibrary()
              }
            }
          }
        }, isZh ? '导入本地图片/视频' : 'Import Local Media'),
        el('input', {
          type: 'text',
          className: 'agy-input',
          value: urlImportDraft,
          placeholder: isZh ? '粘贴 https:// 图片或视频直链下载到本地库' : 'Download from https:// URL into library',
          onInput: e => { urlImportDraft = e.target.value }
        }),
        el('button', {
          type: 'button',
          className: 'agy-btn',
          disabled: busyAction === 'url',
          onClick: async () => {
            if (!urlImportDraft.trim()) return
            store.state.busyAction = 'url'
            store.notify()
            try {
              const res = await callBackend('uploads-url', { url: urlImportDraft.trim() })
              if (res?.ok && res?.item) {
                urlImportDraft = ''
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
        }, isZh ? '下载并应用' : 'Fetch URL'),
        el('button', {
          type: 'button',
          className: 'agy-btn',
          disabled: busyAction === 'bing',
          onClick: async () => {
            store.state.busyAction = 'bing'
            store.notify()
            try {
              const res = await callBackend('uploads-bing', { index: 0 })
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
        }, isZh ? 'Bing 每日一图' : 'Bing Daily')
      ),

      el('div', { className: 'agy-toolbar' },
        el('input', {
          type: 'search',
          className: 'agy-input',
          value: searchQuery,
          placeholder: t('weSearch'),
          onInput: e => {
            searchQuery = e.target.value
            store.notify()
          }
        }),
        el('select', {
          className: 'agy-select',
          value: config.sortOrder || 'newest',
          onChange: e => void store.updateConfig({ sortOrder: e.target.value })
        }, [
          el('option', { value: 'newest', selected: config.sortOrder === 'newest' }, isZh ? '按最新排序' : 'Newest first'),
          el('option', { value: 'title', selected: config.sortOrder === 'title' }, isZh ? '按标题 A-Z' : 'Title A-Z')
        ]),
        el('button', {
          type: 'button',
          className: 'agy-btn',
          onClick: () => void store.updateConfig({ pickerLayout: config.pickerLayout === 'fixed' ? 'classic' : 'fixed' })
        }, config.pickerLayout === 'fixed' ? (isZh ? '卡片视图' : 'Fixed Cards') : (isZh ? '紧凑视图' : 'Compact')),
        el('button', {
          type: 'button',
          className: 'agy-btn',
          onClick: () => {
            showHidden = !showHidden
            store.notify()
          }
        }, showHidden ? t('weShowVisible', hiddenSet.size) : t('weShowHidden', hiddenSet.size))
      ),

      el('div', { className: 'agy-chips' },
        WALLPAPER_TYPES.map(kind => el('button', {
          type: 'button',
          className: `agy-chip ${typeSet.has(kind) ? 'active' : ''}`,
          onClick: () => toggleFilterChip('typeFilter', WALLPAPER_TYPES, kind)
        }, kind.toUpperCase())),
        CONTENT_RATINGS.map(r => el('button', {
          type: 'button',
          className: `agy-chip ${ratingSet.has(r) ? 'active' : ''}`,
          onClick: () => toggleFilterChip('contentRatingFilter', ['everyone'], r)
        }, r)),
        ORIENTATION_FILTERS.map(o => el('button', {
          type: 'button',
          className: `agy-chip ${config.orientationFilter === o ? 'active' : ''}`,
          onClick: () => void store.updateConfig({ orientationFilter: o })
        }, o)),
        folders.length > 1 ? el('select', {
          className: 'agy-select',
          value: config.folderFilter || 'all',
          onChange: e => void store.updateConfig({ folderFilter: e.target.value })
        }, [
          el('option', { value: 'all', selected: config.folderFilter === 'all' }, t('tagsAll')),
          ...folders.map(f => el('option', { value: f, selected: config.folderFilter === f }, f))
        ]) : null
      ),

      el('div', { className: 'agy-desc' }, t('weFound', filtered.length)),

      filtered.length === 0
        ? el('div', { className: 'agy-desc', style: { padding: '18px 0', textAlign: 'center' } }, t('weEmpty'))
        : el('div', { className: `agy-grid ${config.pickerLayout === 'classic' ? 'classic' : ''}` },
            filtered.slice(0, 180).map(item => {
              const selected = config.weSelection?.id === item.id || config.wallpaperSource === item.mediaPath
              const resLabel = item.width > 0 && item.height > 0 ? `${item.width}x${item.height}` : ''
              return el('div', { className: `agy-wp-card ${selected ? 'selected' : ''}` },
                el('div', {
                  className: 'agy-wp-thumb',
                  onClick: () => void store.applyWallpaperItem(item)
                },
                  item.previewUrl ? el('img', { src: item.previewUrl, loading: 'lazy', alt: item.title }) : null,
                  el('span', { className: 'agy-wp-badge' }, item.kind),
                  resLabel ? el('span', { className: 'agy-wp-res' }, resLabel) : null
                ),
                el('div', { className: 'agy-wp-info' },
                  el('div', { className: 'agy-wp-title', title: item.title }, item.title),
                  el('div', { className: 'agy-wp-actions' },
                    el('button', {
                      type: 'button',
                      className: `agy-btn ${selected ? 'agy-btn-primary' : ''}`,
                      disabled: busyAction === item.id,
                      onClick: () => void store.applyWallpaperItem(item)
                    }, selected ? t('weSelected') : t('weUse')),
                    el('button', {
                      type: 'button',
                      className: 'agy-btn',
                      onClick: () => toggleHide(item)
                    }, showHidden ? t('weRestore') : t('weHide'))
                  )
                )
              )
            })
          )
    )
  )
}
