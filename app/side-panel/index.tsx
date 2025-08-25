import { createSignal, onMount } from 'solid-js'
import { render } from 'solid-js/web'
import { sendMessage } from 'zenext/runtime'

render(() => {
  const [msg, setMsg] = createSignal('')

  const sayHello = async () => {
    setMsg(await sendMessage('sayHello', {}))
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
