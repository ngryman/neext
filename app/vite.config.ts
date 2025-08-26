import { resolve } from 'node:path'
import { neext } from 'neext/vite'
import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'

export default defineConfig({
  plugins: [solid(), neext()],
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
