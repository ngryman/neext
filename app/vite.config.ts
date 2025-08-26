import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'
import { zenExt } from 'zenext/vite'

export default defineConfig({
  plugins: [solid(), zenExt()],
  build: {
    target: 'esnext',
    emptyOutDir: true,
  },
  resolve: {
    mainFields: ['module'],
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    include: ['solid-js', 'solid-js/web'],
  },
})
