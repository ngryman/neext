import type { AssetDefinition } from '@/vite/lib/asset'
import { createFilePattern } from '@/vite/lib/fs'
import { transform } from './transform'

export const content: AssetDefinition = {
  type: 'content',
  pattern: createFilePattern('content', false),
  manifestPatch: asset => ({
    content_scripts: [
      {
        matches: ['<all_urls>'],
        js: [asset.outputFile],
      },
    ],
  }),
  emittedFiles: (asset, baseUrl) => [
    {
      file: asset.outputFile,
      content: `import('${baseUrl}/${asset.sourceFile}').catch(console.error)`,
    },
  ],
  handleHotUpdate: ctx => {
    ctx.server.ws.send({ type: 'custom', event: 'neext:reload' })
    return []
  },
  transform,
}
