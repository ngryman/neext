import { createSignal } from 'solid-js'

export const config = {
  // anchor: '#secondary',
  anchor: '#single-column-container',
}

const channel = new BroadcastChannel('summary')

export default function SummaryBox() {
  const [summary, setSummary] = createSignal('')

  // addEventListener('summary', ({ data: e }: { data: { summary: string } }) => {
  //   setSummary(e.summary)
  // })
  channel.addEventListener('message', ({ data: e }: { data: { summary: string } }) => {
    setSummary(e.summary)
  })

  return <div style={{ color: 'white', 'font-size': '16px' }} innerHTML={summary()} />
}
