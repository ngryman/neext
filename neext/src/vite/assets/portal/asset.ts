import type { AssetDefinition } from '@/vite/lib/asset'
import { createFilePattern } from '@/vite/lib/fs'
import { visitor } from './visitor'

export const portal: AssetDefinition = {
  type: 'portal',
  pattern: createFilePattern('portal', { filePattern: '{,/*}' }),
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
  visitor,
}
