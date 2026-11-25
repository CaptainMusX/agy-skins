/**
 * Named wallpaper rotation groups manager: sequence/random, interval/videoEnd trigger,
 * wallpaper selection checklist, and manual advance.
 */
import { el, callBackend, switchControl, selectControl } from '../panel-api.js'
import { ROTATION_INTERVAL_MIN, ROTATION_INTERVAL_MAX } from '../../shared/config.js'

export function renderRotationGroupEditor(store) {
  const { config, weItems } = store.state
  const t = store.getT()
  const isZh = t('weTypeVideo') === '视频'
  const groups = config.rotationGroups || []
  const activeGroup = groups.find(g => g.id === config.rotationGroupId) || groups[0] || null

  const createGroup = () => {
    const id = `grp_${Date.now().toString(36)}`
    const next = [
      ...groups,
      {
        id,
        name: isZh ? `轮播列表 ${groups.length + 1}` : `Playlist ${groups.length + 1}`,
        interval: config.rotationMinutes || 30,
        order: 'sequence',
        trigger: 'interval',
        wallpaperIds: []
      }
    ]
    void store.updateConfig({ rotationGroups: next, rotationGroupId: id })
  }

  const updateGroup = patch => {
    if (!activeGroup) return
    const next = groups.map(g => (g.id === activeGroup.id ? { ...g, ...patch } : g))
    void store.updateConfig({ rotationGroups: next })
  }

  const deleteGroup = () => {
    if (!activeGroup) return
    const next = groups.filter(g => g.id !== activeGroup.id)
    void store.updateConfig({
      rotationGroups: next,
      rotationGroupId: next[0]?.id || '',
      rotationEnabled: next.length ? config.rotationEnabled : false
    })
  }

  return el('div', { className: 'agy-card' },
    el('div', { className: 'agy-row-head' },
      el('div', { className: 'agy-card-title' }, isZh ? '壁纸定时轮播与分组' : 'Rotation Playlists'),
      el('div', { className: 'agy-toolbar' },
        el('button', {
          type: 'button',
          className: 'agy-btn',
          onClick: createGroup
        }, isZh ? '+ 新建分组' : '+ New playlist'),
        el('button', {
          type: 'button',
          className: 'agy-btn',
          disabled: !weItems.length,
          onClick: async () => {
            const res = await callBackend('rotation-advance')
            if (res?.config) {
              store.state.config = res.config
              store.notify()
            } else {
              store.showToast(isZh ? '没有可切换的壁纸' : 'No eligible wallpapers to advance', 'warn')
            }
          }
        }, isZh ? '立即切换下一张' : 'Next wallpaper')
      )
    ),
    switchControl({
      label: t('rotationEnabled'),
      desc: t('rotationHint'),
      checked: config.rotationEnabled,
      onChange: v => void store.updateConfig({ rotationEnabled: v })
    }),
    groups.length > 0 ? el('div', { className: 'agy-toolbar' },
      el('select', {
        className: 'agy-select',
        style: { flex: '1' },
        value: activeGroup?.id || '',
        onChange: e => void store.updateConfig({ rotationGroupId: e.target.value })
      }, groups.map(g => el('option', {
        value: g.id,
        selected: g.id === activeGroup?.id
      }, `${g.name} (${g.wallpaperIds.length})`))),
      el('button', {
        type: 'button',
        className: 'agy-btn agy-btn-danger',
        onClick: deleteGroup
      }, isZh ? '删除分组' : 'Delete')
    ) : null,
    activeGroup ? el('div', { style: { display: 'flex', flexDirection: 'column', gap: '8px' } },
      el('div', { className: 'agy-row' },
        el('div', { className: 'agy-label' }, isZh ? '分组名称' : 'Playlist name'),
        el('input', {
          type: 'text',
          className: 'agy-input',
          value: activeGroup.name,
          onChange: e => updateGroup({ name: e.target.value.trim() || activeGroup.name })
        })
      ),
      selectControl({
        label: isZh ? '切换触发器' : 'Switch trigger',
        value: activeGroup.trigger,
        options: [
          { value: 'interval', label: isZh ? '固定间隔 (分钟)' : 'Fixed interval (minutes)' },
          { value: 'videoEnd', label: isZh ? '视频播完后切换' : 'On video end (or fallback interval)' }
        ],
        onChange: v => updateGroup({ trigger: v })
      }),
      selectControl({
        label: isZh ? '轮播顺序' : 'Order',
        value: activeGroup.order,
        options: [
          { value: 'sequence', label: isZh ? '顺序循环' : 'Sequential' },
          { value: 'random', label: isZh ? '随机不重复' : 'Random' }
        ],
        onChange: v => updateGroup({ order: v })
      }),
      el('div', { className: 'agy-row' },
        el('div', { className: 'agy-label' }, t('rotationInterval')),
        el('input', {
          type: 'number',
          className: 'agy-input',
          style: { width: '96px' },
          min: String(ROTATION_INTERVAL_MIN),
          max: String(ROTATION_INTERVAL_MAX),
          value: String(activeGroup.interval),
          onChange: e => {
            const n = Math.min(ROTATION_INTERVAL_MAX, Math.max(ROTATION_INTERVAL_MIN, Math.round(Number(e.target.value) || 30)))
            updateGroup({ interval: n })
          }
        })
      ),
      el('div', { className: 'agy-label' }, isZh ? '包含的壁纸（不勾选则按当前库自动轮播）' : 'Wallpapers in playlist (leave empty to use library)'),
      el('div', { className: 'agy-list-box' },
        weItems.length === 0
          ? el('div', { className: 'agy-desc' }, isZh ? '暂无已扫描壁纸' : 'No scanned wallpapers yet')
          : weItems.map(item => {
              const checked = activeGroup.wallpaperIds.includes(item.id)
              return el('label', { className: 'agy-check-item' },
                el('input', {
                  type: 'checkbox',
                  checked,
                  onChange: e => {
                    const set = new Set(activeGroup.wallpaperIds)
                    if (e.target.checked) set.add(item.id)
                    else set.delete(item.id)
                    updateGroup({ wallpaperIds: [...set] })
                  }
                }),
                el('span', { style: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } },
                  `[${item.kind}] ${item.title}`)
              )
            })
      )
    ) : el('div', { className: 'agy-desc' },
      isZh ? '未创建命名分组时，将使用全局“分钟间隔”轮播所有未隐藏壁纸。' : 'Without a named playlist, rotation cycles through visible library wallpapers using the interval below.'
    ),
    !activeGroup ? el('div', { className: 'agy-row' },
      el('div', { className: 'agy-label' }, `${t('rotationInterval')} (min)`),
      el('input', {
        type: 'number',
        className: 'agy-input',
        style: { width: '96px' },
        min: String(ROTATION_INTERVAL_MIN),
        max: String(ROTATION_INTERVAL_MAX),
        value: String(config.rotationMinutes || 30),
        onChange: e => {
          const n = Math.min(ROTATION_INTERVAL_MAX, Math.max(ROTATION_INTERVAL_MIN, Math.round(Number(e.target.value) || 30)))
          void store.updateConfig({ rotationMinutes: n })
        }
      })
    ) : null
  )
}
