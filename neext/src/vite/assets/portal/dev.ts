if (import.meta.hot) {
  import.meta.hot.on('neext:reload', () => {
    if (document.hidden) {
      const handler = () => {
        if (!document.hidden) {
          window.location.reload()
          document.removeEventListener('visibilitychange', handler)
        }
      }
      document.addEventListener('visibilitychange', handler)
    } else {
      window.location.reload()
    }
  })
}
