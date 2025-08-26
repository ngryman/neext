import type { Target } from './types'

export function getCurrentTarget(): Target {
  if (location.pathname.endsWith('background.js')) return 'background'
  if (location.pathname.endsWith('side-panel.html')) return 'side-panel'
  if (location.pathname.endsWith('popup.html')) return 'popup'
  return Number(window.NEEXT_APP_TAB_ID)
}
