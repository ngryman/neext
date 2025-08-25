import { reduce } from 'lodash-es'
import type { Plugin } from 'vite'
import type { Api } from '../api'

export function build(api: Api): Plugin {
  return {
    name: 'zen-ext:build',

    config(config) {
      reduce(
        api.assets,
        (config, asset) => api.addEntrypoint(config, asset.type, asset.outputFile),
        config,
      )
    },
  }
}
