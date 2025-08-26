import { template, transformAsync } from '@babel/core'
import type { Visitor } from '@babel/traverse'
import type { AssetDefinition } from '../asset'
import { createFilePattern } from '../fs'

const importDevRuntime = template.ast`import 'zenext/vite-runtime-content'`

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
  transform: async (code, id, mode) => {
    const result = await transformAsync(code, {
      filename: id,
      presets: ['@babel/preset-typescript'],
      plugins: [
        (): { visitor: Visitor } => ({
          visitor: {
            Program(path) {
              if (mode === 'development') {
                path.unshiftContainer('body', importDevRuntime)
              }
            },
          },
        }),
      ],
    })

    return result?.code || code
  },
}
