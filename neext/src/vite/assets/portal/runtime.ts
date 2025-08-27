import { type Component, render } from 'virtual:neext/renderer'
import { sendMessage } from '@/sdk'

window.NEEXT_APP_TAB_ID = await sendMessage('neext:get-tab-id', {})

export function renderToAnchor(component: Component, anchor: string | HTMLElement) {
  const getContainer = () => (typeof anchor === 'string' ? document.querySelector(anchor) : anchor)

  const container = getContainer()
  if (container) {
    console.log(render)
    render(component, container as HTMLElement)
    return
  }

  const observer = new MutationObserver(() => {
    const container = getContainer()
    if (container) {
      render(component, container as HTMLElement)
      observer.disconnect()
    }
  })
  observer.observe(document.body, { childList: true, subtree: true })
}
