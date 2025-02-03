import type { Plugin } from 'vite'
import type { PluginContext } from '../context'

export function core(context: PluginContext): Plugin {
  return {
    name: 'zen-ext:core',

    config(config) {
      config.server = {
        ...config.server,
        cors: true,
      }
    },

    async configResolved(config) {
      context.config = config
    },
  }
}
