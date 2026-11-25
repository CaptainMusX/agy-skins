/**
 * Standalone entry for Antigravity Aux Sidecar Pane & /studio/<token>/ page.
 * Renders the unified `dsh-wallpaper-engine` `we-picker` root cleanly.
 */
import { mountWePicker } from './we-picker-app.js'

const mountNode = document.getElementById('app')
if (mountNode) {
  const mode = window.__AGY_SKINS_HOST_MODE__ || 'studio'
  mountWePicker(mountNode, {
    embed: mode === 'aux' ? 'aux' : 'studio'
  })
}
