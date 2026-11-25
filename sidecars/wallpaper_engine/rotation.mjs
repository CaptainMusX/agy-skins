export function activeRotationGroup(config) {
  const groups = Array.isArray(config?.rotationGroups) ? config.rotationGroups : []
  return groups.find(group => group.id === config?.rotationGroupId) || null
}

export function groupWallpapers(items, group, hiddenIds = []) {
  const byId = new Map((Array.isArray(items) ? items : []).map(item => [item.id, item]))
  const hidden = new Set(hiddenIds)
  return (group?.wallpaperIds || [])
    .map(id => byId.get(id))
    .filter(item => item && item.id && item.dir && item.mediaPath && !hidden.has(item.id))
}

export function rotationCandidates(items, hiddenIds = [], group = null) {
  const hidden = new Set(hiddenIds)
  const pool = group ? groupWallpapers(items, group, hiddenIds) : (Array.isArray(items) ? items : [])
  return pool.filter(item =>
    item && typeof item.id === 'string' && item.dir && item.mediaPath && !hidden.has(item.id))
}

export class WallpaperRotation {
  constructor({ store, applyItem, intervalMs = 15_000 }) {
    this.store = store
    this.applyItem = applyItem
    this.intervalMs = intervalMs
    this.lastSwitch = Date.now()
    this.lastId = store.getConfig().weSelection?.id || null
    this.lastGroupId = store.getConfig().rotationGroupId || ''
    this.lastEnabled = false
    this.switching = false
    this.timer = setInterval(() => void this.tick(), this.intervalMs)
    this.timer.unref?.()
  }

  currentGroup(config) {
    return activeRotationGroup(config)
  }

  candidates(config = this.store.getConfig()) {
    return rotationCandidates(this.store.getWeItems(), config.hiddenWallpaperIds, this.currentGroup(config))
  }

  async advance(force = false, { manual = false } = {}) {
    const config = this.store.getConfig()
    if ((!config.rotationEnabled && !manual) || this.switching) return false
    const group = this.currentGroup(config)
    if (group?.trigger === 'videoEnd' && !force && !manual) return false
    const items = this.candidates(config)
    if (items.length < 2) return false
    const currentId = config.weSelection?.id || null
    let next = null
    if (group?.order === 'random') {
      const pool = items.filter(item => item.id !== currentId)
      next = pool[Math.floor(Math.random() * pool.length)] || null
    } else {
      const idx = items.findIndex(item => item.id === currentId)
      next = items[idx < 0 ? 0 : (idx + 1) % items.length]
    }
    if (!next) return false
    this.switching = true
    try {
      await this.applyItem(next)
      this.lastId = next.id
      this.lastSwitch = Date.now()
      return true
    } catch {
      this.lastSwitch = Date.now()
      return false
    } finally {
      this.switching = false
    }
  }

  async tick() {
    const config = this.store.getConfig()
    const currentId = config.weSelection?.id || null
    const groupId = config.rotationGroupId || ''
    if (currentId !== this.lastId || groupId !== this.lastGroupId) {
      this.lastId = currentId
      this.lastGroupId = groupId
      this.lastSwitch = Date.now()
    }
    if (config.rotationEnabled && !this.lastEnabled) this.lastSwitch = Date.now()
    this.lastEnabled = config.rotationEnabled
    if (!config.rotationEnabled) return
    const group = this.currentGroup(config)
    if (group?.trigger === 'videoEnd') return
    const items = this.candidates(config)
    if (items.length < 2) return
    const interval = Math.max(1, Number(group?.interval) || config.rotationMinutes || 30) * 60_000
    if (Date.now() - this.lastSwitch < interval) return
    await this.advance(false)
  }

  destroy() {
    if (this.timer !== null) clearInterval(this.timer)
    this.timer = null
  }
}
