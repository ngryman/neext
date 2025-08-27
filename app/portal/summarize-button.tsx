// export const anchor = '#top-level-buttons-computed'

export default function SummarizeButton() {
  const className = document.querySelector('#menu [title="Share"]')?.className

  return <button class={className}>Summarize</button>
}
