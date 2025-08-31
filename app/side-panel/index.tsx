import { sendMessage } from 'neext/sdk'
import { createSignal, onMount } from 'solid-js'
import { render } from 'solid-js/web'

render(() => {
  const [msg, setMsg] = createSignal('')

  const sayHello = async () => {
    // TODO: generate types!!
    const tab = await chrome.tabs.query({ active: true, currentWindow: true })
    setMsg(await sendMessage('getTranscript', {}, tab[0].id))
  }

  onMount(async () => {
    sayHello()
  })

  return (
    <div>
      Message from background: {msg()}
      <button type="button" onClick={sayHello}>
        Say hello
      </button>
    </div>
  )
}, document.body)
