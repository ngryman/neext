import { sendMessage } from 'neext/sdk'
import { createSignal, onMount } from 'solid-js'
import { render } from 'solid-js/web'

render(() => {
  const [msg, setMsg] = createSignal('')

  const sayHello = async () => {
    const tab = await chrome.tabs.query({ active: true, currentWindow: true })
    setMsg(await sendMessage('sayHello', {}, tab[0].id))
  }

  onMount(async () => {
    sayHello()
  })

  return (
    <div>
      Message from content: {msg()}
      <button type="button" onClick={sayHello}>
        Say hello
      </button>
    </div>
  )
}, document.body)
