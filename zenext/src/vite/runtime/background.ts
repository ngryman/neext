if (import.meta.hot) {
  import.meta.hot.accept(() => {
    chrome.runtime.reload()
  })

  chrome.runtime.onInstalled.addListener(({ reason }) => {
    if (reason === 'update') {
      import.meta.hot?.send('zenext:reload')
    }
  })
}
