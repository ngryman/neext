/// <reference types="vite/client" />
/// <reference types="chrome" />

interface Window {
  NEEXT_APP_TAB_ID: number
}

declare const config:
  | {
      anchor?: string
    }
  | undefined

declare const PortalComponent: Component

declare module 'virtual:neext/renderer' {
  export type Component = () => unknown
  export const render: (component: Component, element: HTMLElement) => void
}
