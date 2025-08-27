/// <reference types="vite/client" />

declare module 'virtual:neext/renderer' {
  // biome-ignore lint/suspicious/noExplicitAny: let the types flow
  export type Component = () => any
  export const render: (component: Component, element: HTMLElement) => void
}

declare module 'vite/types/customEvent.d.ts' {
  interface CustomEventMap {
    'neext:reload': undefined
  }
}
