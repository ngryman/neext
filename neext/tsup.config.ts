import { defineConfig } from 'tsup'

export default defineConfig({
  name: 'neext',
  format: ['esm'],
  clean: true,
  minify: true,
  dts: true,
  entry: {
    runtime: 'src/runtime/index.ts',
    vite: 'src/vite/index.ts',
    'vite-dev-background': 'src/vite/assets/background/dev.ts',
    'vite-dev-content': 'src/vite/assets/content/dev.ts',
  },
})
