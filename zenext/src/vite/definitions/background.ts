import { transformAsync } from '@babel/core'
import type { Visitor } from '@babel/traverse'
import * as t from '@babel/types'
import type { AssetDefinition } from '../asset'
import { createFilePattern } from '../fs'

export const background: AssetDefinition = {
  type: 'background',
  patterns: [createFilePattern('background')],
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
                const hotAcceptCall = t.expressionStatement(
                  t.callExpression(
                    t.memberExpression(
                      t.memberExpression(t.identifier('import.meta'), t.identifier('hot')),
                      t.identifier('accept'),
                    ),
                    [
                      t.arrowFunctionExpression(
                        [],
                        t.callExpression(
                          t.memberExpression(
                            t.identifier('chrome.runtime'),
                            t.identifier('reload'),
                          ),
                          [],
                        ),
                      ),
                    ],
                  ),
                )
                path.pushContainer('body', hotAcceptCall)
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
