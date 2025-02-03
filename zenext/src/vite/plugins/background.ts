import type { Plugin } from 'vite'

const config = {
  name: 'background',
  file: 'background/index.ts',
  manifestEntries: [
    {
      background: {
        type: 'module',
        service_worker: 'background.js',
      },
    },
  ],
}

export function background(): Plugin {
  return {
    name: 'zenext:background',
  }
}
