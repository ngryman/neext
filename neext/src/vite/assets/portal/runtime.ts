/// <reference path="./runtime.d.ts" />

import { type Component, render } from 'virtual:neext/renderer'
import { sendMessage } from 'neext/sdk'

window.NEEXT_APP_TAB_ID = await sendMessage('neext:get-tab-id', {})

interface ResolvedConfig {
  anchor: string
}

const userConfig = typeof config !== 'undefined' ? config : {}

const resolvedConfig: ResolvedConfig = {
  anchor: userConfig.anchor ?? 'document.body',
}

export function renderToAnchor(component: Component) {
  const container = document.querySelector(resolvedConfig.anchor)
  if (container) {
    const root = document.createElement('div')
    root.id = 'neext-portal-root'
    root.style.display = 'contents'
    container.appendChild(root)
    render(component, root)
    return
  }

  const observer = new MutationObserver(() => {
    const container = document.querySelector(resolvedConfig.anchor)
    if (container) {
      const root = document.createElement('div')
      root.id = 'neext-portal-root'
      root.style.display = 'contents'
      container.appendChild(root)
      render(component, root)
      observer.disconnect()
    }
  })
  observer.observe(document.body, { childList: true, subtree: true })
}

renderToAnchor(PortalComponent)
