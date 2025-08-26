import { template, transformAsync } from '@babel/core'
import type { Visitor } from '@babel/traverse'
import type { AssetDefinition } from '../asset'
import { createFilePattern } from '../fs'

const hmrHandler = template(`
  if (import.meta.hot) {
    import.meta.hot.accept(() => {
      window.location.reload()
    })

    import.meta.hot.on('zenext:reload', () => {
      window.location.reload()
    })
  }
`)

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
              // Add HMR handling for content scripts in development mode
              if (mode === 'development') {
                path.pushContainer('body', hmrHandler())
              }
            },
          },
        }),
      ],
    })

    return result?.code || code
  },
}
