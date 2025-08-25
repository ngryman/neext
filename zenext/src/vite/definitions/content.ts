import type { AssetDefinition } from '../asset'
import { createFilePattern } from '../fs'

export const content: AssetDefinition = {
  type: 'content',
  patterns: [createFilePattern('content')],
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
      content: `import '${baseUrl}/${asset.sourceFile}'`,
    },
  ],
}
