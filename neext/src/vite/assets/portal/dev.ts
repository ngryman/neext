/// <reference path="./runtime.d.ts" />

if (import.meta.hot) {
  import.meta.hot.accept(() => {
    const anchor =
      typeof config?.anchor !== 'undefined' ? document.querySelector(config.anchor) : document.body

    if (anchor) {
      anchor.querySelector('#neext-portal-root')?.remove()
    }
  })
}
