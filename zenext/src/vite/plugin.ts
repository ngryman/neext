import { invokeMap } from 'lodash-es'
import type { Plugin } from 'vite'
import { createManifestProcessor, createPageProcessor } from './processors'
import type { Manifest, ManifestFn, Processor } from './types'

export type ZenExtOptions = {
  manifest: Manifest | ManifestFn
}

export async function zenExt(_: ZenExtOptions): Promise<Plugin> {
  // let root: string
  const pages = createPageProcessor()
  const manifest = createManifestProcessor(pages)

  const processors: Processor[] = [manifest, pages]

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

  // async function generateManifest(file: string) {
  //   try {
  //     const result = await build({
  //       root,
  //       mode: 'development',
  //       build: {
  //         lib: {
  //           entry: file,
  //           formats: ['cjs'],
  //         },
  //         rollupOptions: {
  //           output: {
  //             dir: dirname(file),
  //             entryFileNames: 'manifest.config.js',
  //           },
  //         },
  //         // write: false,
  //       },
  //     })

  //     const output = result.output[0].code
  //     console.log('output:', output)

  //     // const manifestModule = new Function(
  //     //   'exports',
  //     //   'require',
  //     //   'module',
  //     //   '__filename',
  //     //   '__dirname',
  //     //   output,
  //     // )
  //     // const exports = {}
  //     // manifestModule(exports, require, { exports }, file, dirname(file))

  //     // const manifest = await exports.default({ mode: process.env.NODE_ENV || 'development' })
  //     // const manifestJson = JSON.stringify(manifest, null, 2)

  //     // const manifestJsonPath = resolve(dirname(file), 'manifest.json')
  //     // await fs.writeFile(manifestJsonPath, manifestJson, 'utf-8')
  //     // console.log('Manifest generated:', manifestJsonPath)
  //   } catch (error) {
  //     console.error('Failed to generate manifest:', error)
  //   }
  // }

  // async function handleFileChange(file: string) {
  //   if (file.endsWith('manifest.config.ts')) {
  //     console.log('file changed:', file)
  //     await generateManifest(file)
  //   }
  // }
}
