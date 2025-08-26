import { template, transformAsync } from '@babel/core'
import type { Visitor } from '@babel/traverse'
import * as t from '@babel/types'
import type { AssetDefinition } from '../asset'
import { createFilePattern } from '../fs'

const hmrHandler = template(`
  import.meta.hot.accept(() => {
    chrome.runtime.reload()
  })

  import.meta.hot.send('zenext:reload')
`)

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
  transform: async (code, id, mode) => {
    const result = await transformAsync(code, {
      filename: id,
      presets: ['@babel/preset-typescript'],
      plugins: [
        (): { visitor: Visitor } => ({
          visitor: {
            Program(path) {
              const importDeclaration = t.importDeclaration(
                [
                  t.importSpecifier(
                    t.identifier('addMessageHandler'),
                    t.identifier('addMessageHandler'),
                  ),
                ],
                t.stringLiteral('zenext/runtime'),
              )
              path.unshiftContainer('body', importDeclaration)

              // HMR is disabled for service workers due to import() restrictions
              // Service workers will reload via full page reload instead
              // TODO: investigate to see if we still could use HMR
              if (mode === 'development') {
                path.pushContainer('body', hmrHandler())
              }
            },
            FunctionDeclaration(path) {
              if (!path.parentPath.isExportNamedDeclaration()) return
              if (!path.node.id) return

              const functionExpression = t.functionExpression(
                path.node.id,
                path.node.params,
                path.node.body,
                path.node.generator,
                path.node.async,
              )

              const wrappedFunction = t.expressionStatement(
                t.callExpression(t.identifier('addMessageHandler'), [
                  t.stringLiteral(path.node.id.name),
                  functionExpression,
                ]),
              )

              path.parentPath.replaceWith(wrappedFunction)
            },
          },
        }),
      ],
    })

    return {
      code: result?.code || '',
      map: result?.map || '',
    }
  },
}
