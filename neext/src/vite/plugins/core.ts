import fg from 'fast-glob'
import type { Plugin } from 'vite'
import { definitions } from '../assets'
import { type Asset, createAsset } from '../lib/asset'
import type { State } from '../lib/state'

export function core(state: State): Plugin {
  return {
    name: 'neext:core',

    async config(config) {
      config.server = {
        ...config.server,
        cors: true,
      }

      for (const definition of definitions) {
        const files = await fg(definition.pattern, { cwd: config.root })
        for (const file of files) {
          const asset: Asset = createAsset(definition, file)
          state.assets.push(asset)
        }
      }
    },
  }
}
