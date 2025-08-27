/// <reference types="vite/client" />
/// <reference types="chrome" />

interface Window {
  NEEXT_APP_TAB_ID: number
}

declare module 'virtual:neext/renderer' {
  // biome-ignore lint/suspicious/noExplicitAny: let the types flow
  export type Component = () => any
  export const render: (component: Component, element: HTMLElement) => void
}
