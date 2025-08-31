import type { AssetDefinition } from '@/vite/lib/asset'
import { createFilePattern } from '@/vite/lib/fs'
import dev from './dev.ts?raw'
import runtime from './runtime.ts?raw'
import { visitor } from './visitor'

export const portal: AssetDefinition = {
  type: 'portal',
  pattern: createFilePattern('portal', { filePattern: '{,/*,/*/index}' }),
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
  dev,
  runtime,
  visitor,
}
