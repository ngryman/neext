import { createSignal, onMount } from 'solid-js'
import { render } from 'solid-js/web'
import { sendMessage } from 'zenext/runtime'

render(() => {
  const [msg, setMsg] = createSignal('')

  onMount(async () => {
    setMsg(await sendMessage('sayHello', {}))
  })

  return <div>Message from background: {msg()}</div>
}, document.body)
