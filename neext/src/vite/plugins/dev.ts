import { type NodePath, transformAsync } from '@babel/core'
import type * as t from '@babel/types'
import type { Plugin } from 'vite'
import type { State } from '../lib/state'
import { prependBody, transpile } from '../lib/transform'

export function dev(state: State): Plugin {
  return {
    name: 'neext:dev',
    apply: 'serve',

    configureServer(server) {
      server.ws.on('neext:reload', () => {
        server.ws.send({ type: 'custom', event: 'neext:reload' })
      })
    },

    handleHotUpdate(ctx) {
      const asset = state.assets.find(asset => ctx.file.endsWith(asset.sourceFile))
      return asset?.definition.handleHotUpdate?.(ctx)
    },

    async transform(code, id) {
      const asset = state.assets.find(asset => id.endsWith(asset.sourceFile))
      const dev = asset?.definition.dev
      if (!dev) return

      const result = await transformAsync(code, {
        filename: id,
        presets: ['@babel/preset-typescript'],
        plugins: [
          () => ({
            visitor: {
              Program(path: NodePath<t.Program>) {
                prependBody(path, transpile(dev, './dev.ts'))
              },
            },
          }),
        ],
      })

      return result?.code ?? code
    },
  }
}
