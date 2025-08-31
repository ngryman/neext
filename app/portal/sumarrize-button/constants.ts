/**
 * Regular expressions for parsing YouTube data
 */
export const VIDEO_ID_REGEX = /\?v=([\w-]+)/
export const INNERTUBE_API_KEY_REGEX = /"INNERTUBE_API_KEY":"([\w-]+)"/
export const INNERTUBE_CLIENT_VERSION_REGEX = /"clientVersion":"([^"]+)"/

/**
 * YouTube InnerTube API URL
 */
export const INNERTUBE_API_URL = 'https://www.youtube.com/youtubei/v1/player?key={apiKey}'

/**
 * YouTube InnerTube API context configuration
 */
export const INNERTUBE_CONTEXT = {
  client: {
    clientName: 'ANDROID',
    clientVersion: '20.10.38',
  },
} as const
