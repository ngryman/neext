import type { Target } from './types'

export function getCurrentTarget(): Target {
  if (location.pathname.endsWith('background.js')) return 'background'
  if (location.pathname.endsWith('side-panel.html')) return 'side-panel'
  return Number(window.APP_TAB_ID)
}
