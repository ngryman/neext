import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { generateText } from 'ai'
import { getTranscript } from './transcript'

const google = createGoogleGenerativeAI({
  apiKey: import.meta.env.VITE_GOOGLE_GENERATIVE_AI_API_KEY,
})

const channel = new BroadcastChannel('summary')

export function SummarizeButton() {
  const className = document.querySelector('#menu [title="Share"]')?.className

  const handleClick = async () => {
    const transcript = await getTranscript()
    const transcriptText = transcript.map(t => t.text).join('\n')

    const res = await generateText({
      model: google('gemini-2.5-flash-lite'),
      system: `
        Create a concise summary of the video transcript in the form of bullet points.

        <bullet points>
        - Should capture a key idea, fact, step, or takeaway.
        - Should be written in clear, succint language (no more than 15 words per bullet).
        - Should start with an emoji that illustrates the point.
        </bullet points>

        <regrouping>
        - Should be grouped into sections with titles.
        - Should focus on the most essential points, avoiding filler or repetitive details.
        </regrouping>

        <prioritization>
        - Should prioritize actionable content and distinct sections.
        </prioritization>

        <formatting>
        - Should use HTML formatting for bold, italic, and lists.
        - ALWAYS output the summary in HTML format.
        </formatting>
      `,
      prompt: transcriptText,
    })

    // sendEvent('summary', { summary: res.text }, window.NEEXT_APP_TAB_ID)
    channel.postMessage({ summary: res.text })
  }

  return (
    <button class={className} onClick={handleClick}>
      Summarize
    </button>
  )
}
