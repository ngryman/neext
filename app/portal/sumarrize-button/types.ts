/**
 * Represents a snippet of a transcript with timing information
 */
export interface TranscriptSnippet {
  /** The transcript text content */
  text: string
  /** The timestamp at which this snippet appears on screen in seconds */
  start: number
  /**
   * The duration of how long the snippet stays on screen in seconds.
   * Note: This is not the duration of the transcribed speech, but how long
   * the snippet stays on screen. Therefore, there can be overlaps between snippets.
   */
  duration: number
}

export interface InnerTubeConfig {
  apiKey: string
  clientVersion: string
}

/**
 * Internal YouTube API response types
 */
export interface YouTubeApiResponse {
  playabilityStatus?: PlayabilityStatus
  captions?: {
    playerCaptionsTracklistRenderer?: CaptionsTrackListRenderer
  }
}

export interface PlayabilityStatus {
  status?: string
  reason?: string
  errorScreen?: {
    playerErrorMessageRenderer?: {
      subreason?: {
        runs?: Array<{ text?: string }>
      }
    }
  }
}

export interface CaptionsTrackListRenderer {
  captionTracks?: CaptionTrack[]
  translationLanguages?: Array<{
    languageCode: string
    languageName: {
      runs: Array<{ text: string }>
    }
  }>
}

export interface CaptionTrack {
  baseUrl: string
  name: {
    runs: Array<{ text: string }>
  }
  languageCode: string
  kind?: string
  isTranslatable?: boolean
}
