import fg from 'fast-glob'
import type { Plugin } from 'vite'
import type { Api } from '../api'
import { ASSETS_DEFINITIONS, type Asset, createAsset } from '../asset'

export function core(api: Api): Plugin {
  return {
    name: 'zen-ext:core',
    api,

    async config(config) {
      config.server = {
        ...config.server,
        cors: true,
      }

      for (const { patterns } of ASSETS_DEFINITIONS) {
        const files = await fg(patterns, { cwd: config.root })
        for (const file of files) {
          const asset: Asset = createAsset(file)
          api.assets.push(asset)
        }
      }

      return config
    },

    configResolved(config) {
      api.mode = config.mode as Api['mode']
      api.config = config
      api.baseUrl = `http://${config.server.host ?? 'localhost'}:${config.server.port}`
    },

    configureServer(server) {
      api.server = server
    },
  }
}
