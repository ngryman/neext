import type { AssetDefinition } from '@/vite/lib/asset'
import { createFilePattern } from '@/vite/lib/fs'
import dev from './dev.ts?raw'
import runtime from './runtime.ts?raw'
import { visitor } from './visitor'

export const background: AssetDefinition = {
  type: 'background',
  pattern: createFilePattern('background'),
  manifestPatch: asset => ({
    background: {
      service_worker: asset.outputFile,
      type: 'module',
    },
  }),
  emittedFiles: (asset, baseUrl) => [
    {
      file: asset.outputFile,
      content: `import '${baseUrl}/${asset.sourceFile}'`,
    },
  ],
  dev,
  runtime,
  visitor,
}
