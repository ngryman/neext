import { invokeMap } from 'lodash-es'
import type { Plugin } from 'vite'
import { type PageConfig, createManifestProcessor, createPageProcessor } from './processors'
import type { Manifest, ManifestFn, Processor } from './types'

export type ZenExtOptions = {
  manifest: Manifest | ManifestFn
}

export type PluginState = {
  pages: PageConfig[]
}

export async function zenExt(_: ZenExtOptions): Promise<Plugin> {
  const state: PluginState = {
    pages: [],
  }

  const processors: Processor[] = [createManifestProcessor(state), createPageProcessor(state)]

  return {
    name: 'zen-ext',

    async config(config) {
      await Promise.all(invokeMap(processors, 'config', config))
    },

    async configResolved(config) {
      await Promise.all(invokeMap(processors, 'configResolved', config))
    },

    async configureServer(server) {
      await Promise.all(invokeMap(processors, 'configureServer', server))
    },

    async buildStart(options) {
      await Promise.all(invokeMap(processors, 'buildStart', options))
    },

    // async configureServer() {
    //       const script = `
    // //import 'http://localhost:${config.server.port}/src/pages/background/index.ts'
    // const socket = new WebSocket('ws://localhost:${config.server.port}', 'vite-hmr');
    // socket.addEventListener('message', (event) => {
    //   const data = JSON.parse(event.data);
    //   if (data.type === 'update') {
    //     console.log('HMR update received:', data);
    //   }
    // });
    // socket.addEventListener('open', () => {
    //   console.log('Connected to Vite HMR server');
    // });
    // socket.addEventListener('close', () => {
    //   console.log('Disconnected from Vite HMR server');
    // });`
    //       await fs.mkdir(outDir, { recursive: true })
    //       await fs.writeFile(path.join(outDir, 'background.js'), script, 'utf-8')
    //       config.server.cors = true
    //       middlewares.use((req, _, next) => {
    //         if (req.url === '/pages/background/index.ts') {
    //           console.log('req.url:', req.url)
    //         }
    //         next()
    //       })
    // server.middlewares.use(async (req, res, next) => {
    //   if (req.url === '/manifest.json') {
    //     try {
    //       const manifestPath = path.join(outDir, 'manifest.json')
    //       const manifestContent = await fs.readFile(manifestPath, 'utf-8')
    //       res.setHeader('Content-Type', 'application/json')
    //       res.end(manifestContent)
    //     } catch (error) {
    //       res.statusCode = 404
    //       res.end('Manifest not found')
    //     }
    //   } else {
    //     next()
    //   }
    // })
    // },

    // async hotUpdate({ file }) {
    //   if (file.endsWith('/src/pages/background/index.ts')) {
    //     await fs.utimes(path.join(outDir, 'background.js'), new Date(), new Date())
    //     return []
    //   }
    // },
  }
}
