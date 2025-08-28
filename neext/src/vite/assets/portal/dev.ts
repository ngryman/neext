declare global {
  const anchor: string | undefined
}

if (import.meta.hot) {
  import.meta.hot.accept(() => {
    const container = typeof anchor !== 'undefined' ? document.querySelector(anchor) : document.body
    if (container) {
      container.querySelector('#neext-portal-root')?.remove()
    }
  })
}
