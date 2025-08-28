import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
// import raw from 'esbuild-plugin-raw'
import type { Plugin } from 'esbuild'
import { defineConfig } from 'tsup'

export default defineConfig({
  name: 'neext',
  format: ['esm'],
  clean: true,
  // minify: true,
  dts: true,
  esbuildPlugins: [rawPlugin()],
  entry: {
    sdk: 'src/sdk/index.ts',
    vite: 'src/vite/index.ts',
    'vite-dev-background': 'src/vite/assets/background/dev.ts',
    'vite-dev-content': 'src/vite/assets/content/dev.ts',
    'vite-dev-portal': 'src/vite/assets/portal/dev.ts',
    'vite-runtime-background': 'src/vite/assets/background/runtime.ts',
    'vite-runtime-content': 'src/vite/assets/content/runtime.ts',
    'vite-runtime-portal': 'src/vite/assets/portal/runtime.ts',
  },
})

// Waiting for https://github.com/hannoeru/esbuild-plugin-raw/pull/403 to be merged
function rawPlugin(): Plugin {
  return {
    name: 'raw',
    setup(build) {
      build.onResolve({ filter: /\?raw$/ }, args => {
        const resolvedPath = join(args.resolveDir, args.path)
        return {
          path: resolvedPath,
          namespace: 'raw-loader',
        }
      })
      build.onLoad({ filter: /\?raw$/, namespace: 'raw-loader' }, async args => {
        console.log('onLoad', args.path)
        return {
          contents: await readFile(args.path.replace(/\?raw$/, '')),
          loader: 'text',
        }
      })
    },
  }
}
