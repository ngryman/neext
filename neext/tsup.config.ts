import { defineConfig } from 'tsup'

export default defineConfig({
  name: 'neext',
  format: ['esm'],
  clean: true,
  // minify: true,
  dts: true,
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
