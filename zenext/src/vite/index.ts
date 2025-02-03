import type { Plugin } from 'vite'
import { PluginContext } from './context'
import { core, manifest, pages } from './plugins'

export type * from './types'

export function zenExt(): Plugin[] {
  const context = new PluginContext()

  return [core(context), manifest(context), pages(context)]

  // return {
  //   name: 'zen-ext',

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
  // }
}
