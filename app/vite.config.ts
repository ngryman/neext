import { execSync } from 'node:child_process'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'
import { zenExt } from 'zenext/vite'
import { manifest } from './manifest.config'
import { version } from './package.json'

export default defineConfig({
  plugins: [solid(), zenExt({ manifest })],
  build: {
    target: 'esnext',
    emptyOutDir: true,
  },
  define: {
    APP_VERSION: JSON.stringify(version),
    APP_BUILD_NUMBER: JSON.stringify(execSync('git rev-parse --short HEAD').toString().trim()),
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
