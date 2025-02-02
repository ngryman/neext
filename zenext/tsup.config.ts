import { defineConfig } from 'tsup'

export default defineConfig({
  name: 'vite',
  format: ['esm'],
  clean: true,
  minify: true,
  dts: true,
  entry: {
    vite: 'src/vite/index.ts',
    framework: 'src/framework/index.ts',
  },
})
