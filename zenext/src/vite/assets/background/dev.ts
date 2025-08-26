if (import.meta.hot) {
  import.meta.hot.accept(() => {
    chrome.runtime.reload()
  })

  chrome.runtime.onInstalled.addListener(({ reason }) => {
    if (reason === chrome.runtime.OnInstalledReason.UPDATE) {
      import.meta.hot?.send('zenext:reload')
    }
  })
}
