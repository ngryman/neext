import { decode } from 'he'
import {
  INNERTUBE_API_KEY_REGEX,
  INNERTUBE_API_URL,
  INNERTUBE_CLIENT_VERSION_REGEX,
  VIDEO_ID_REGEX,
} from './constants'
import type { InnerTubeConfig, TranscriptSnippet, YouTubeApiResponse } from './types'

export async function getTranscript(): Promise<TranscriptSnippet[]> {
  const videoId = getVideoId()
  const config = await getInnerTubeConfig()
  const data = await fetchInnertubeData(videoId, config)
  return await fetchTranscript(data)
}

function getVideoId() {
  const match = window.location.search.match(VIDEO_ID_REGEX)
  if (!match) throw new Error('Video ID not found')
  return match[1]
}

async function getInnerTubeConfig() {
  const scripts = querySelectorAll('script[nonce]:not(:empty)', document.head)
  for (const script of scripts) {
    const apiKeyMatch = script.innerText.match(INNERTUBE_API_KEY_REGEX)
    if (apiKeyMatch) {
      const clientVersionMatch = script.innerText.match(INNERTUBE_CLIENT_VERSION_REGEX)
      return {
        apiKey: apiKeyMatch[1],
        clientName: 'WEB',
        clientVersion: clientVersionMatch?.[1] ?? '20.10.38',
      }
    }
  }
  throw new Error('INNERTUBE_API_KEY not found')
}

async function fetchInnertubeData(
  videoId: string,
  { apiKey, clientVersion }: InnerTubeConfig,
): Promise<YouTubeApiResponse> {
  const url = formatUrl(INNERTUBE_API_URL, { apiKey })

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      videoId,
      context: {
        client: {
          clientName: 'WEB',
          clientVersion: clientVersion,
        },
      },
    }),
  })

  return await res.json()
}

async function fetchTranscript(data: YouTubeApiResponse) {
  const url = data.captions?.playerCaptionsTracklistRenderer?.captionTracks?.at(0)?.baseUrl
  if (!url) throw new Error('Transcript URL not found')
  const res = await fetch(url)
  const rawTranscript = await res.text()
  return parseTranscript(rawTranscript)
}

function parseTranscript(data: string): TranscriptSnippet[] {
  const doc = new DOMParser().parseFromString(data, 'text/html')

  const texts = Array.from(doc.querySelectorAll('transcript > text'))
    .filter(t => Boolean(t.textContent))
    .map(t => ({
      text: decode(t.textContent ?? ''),
      start: Number.parseFloat(t.getAttribute('start') ?? '0'),
      duration: Number.parseFloat(t.getAttribute('dur') ?? '0'),
    }))

  return texts
}

function querySelectorAll(selector: string, parent: HTMLElement = document.body): HTMLElement[] {
  return Array.from(parent.querySelectorAll(selector))
}

/**
 * Utility function to replace placeholders in URL templates
 */
export function formatUrl(template: string, params: Record<string, string>): string {
  return Object.entries(params).reduce(
    (url, [key, value]) => url.replace(`{${key}}`, value),
    template,
  )
}
