if (import.meta.hot) {
  import.meta.hot.accept(() => {
    onVisible(() => {
      window.location.reload()
    })
  })

  import.meta.hot.on('zenext:reload', () => {
    onVisible(() => {
      window.location.reload()
    })
  })
}

function onVisible(callback: () => void) {
  if (document.hidden) {
    const handler = () => {
      if (!document.hidden) {
        callback()
        document.removeEventListener('visibilitychange', handler)
      }
    }
    document.addEventListener('visibilitychange', handler)
  } else {
    callback()
  }
}
