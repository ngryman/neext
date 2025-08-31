import { assert } from '@/utils'
import { flatMap, isArray, map, merge, reduce } from 'lodash-es'
import type { Plugin, ResolvedConfig, UserConfig } from 'vite'
import { emitFile } from '../lib/fs'
import type { State } from '../lib/state'

export function build(state: State): Plugin {
  let resolvedConfig: ResolvedConfig

  return {
    name: 'neext:build',

    config(config) {
      return reduce(
        state.assets,
        (config, asset) => addEntrypoint(config, asset.name, asset.outputFile),
        config,
      )
    },

    configResolved(config) {
      resolvedConfig = config
    },

    async buildStart() {
      const baseUrl = `http://${resolvedConfig.server.host ?? 'localhost'}:${resolvedConfig.server.port}`
      await Promise.all(
        flatMap(state.assets, asset =>
          map(asset.definition.emittedFiles(asset, baseUrl), file =>
            emitFile(resolvedConfig.build.outDir, file),
          ),
        ),
      )
    },
  }
}

function addEntrypoint(config: UserConfig, name: string, file: string): UserConfig {
  const prevInput = (config.build?.rollupOptions?.input ?? {}) as Record<string, string>
  assert(!isArray(prevInput), 'Expected `build.rollupOptions.input` to be an object or undefined.')

  return merge(config, {
    build: {
      rollupOptions: {
        input: {
          ...prevInput,
          [name]: file,
        },
      },
    },
  })
}
