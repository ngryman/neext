import { defineConfig } from 'tsup'

export default defineConfig({
  name: 'vite',
  format: ['esm'],
  clean: true,
  minify: true,
  dts: true,
  entry: {
    runtime: 'src/runtime/index.ts',
    vite: 'src/vite/index.ts',
  },
})
