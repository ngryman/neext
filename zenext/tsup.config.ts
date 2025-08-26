import { defineConfig } from 'tsup'

export default defineConfig({
  name: 'zenext',
  format: ['esm'],
  clean: true,
  minify: true,
  dts: true,
  entry: {
    runtime: 'src/runtime/index.ts',
    vite: 'src/vite/index.ts',
    'vite-runtime-background': 'src/vite/runtime/background.ts',
    'vite-runtime-content': 'src/vite/runtime/content.ts',
  },
})
