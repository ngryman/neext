import { parse } from 'node:path'
import { transformAsync } from '@babel/core'
import type { Visitor } from '@babel/traverse'
import * as t from '@babel/types'
import { flatMap } from 'lodash-es'
import type { Plugin } from 'vite'
import type { Api } from '../api'

export function serve(api: Api): Plugin {
  return {
    name: 'zen-ext:serve',
    // enforce: 'post',

    // Move to dedicated pages, background, or content plugins
    async buildStart() {
      await Promise.all(
        flatMap(api.assets, asset => [
          api.emitFile(asset.outputFile, `import '${api.baseUrl}/${asset.sourceFile}'`),
          asset.type === 'page'
            ? api.emitFile(
                asset.outputFile.replace('.js', '.html'),
                `<script src="${parse(asset.outputFile).base}" type="module"></script>`,
              )
            : Promise.resolve(),
        ]),
      )
    },

    // handleHotUpdate(ctx) {
    //   if (ctx.file.endsWith('background.ts') || ctx.file.endsWith('background/index.ts')) {
    //     api.logger.info(`Background file changed: ${ctx.file}`)
    //     api.server.ws.send({
    //       type: 'full-reload',
    //     })
    //     return []
    //   }
    // },

    // TODO: move to dedicated background plugin
    async transform(code, id) {
      if (id.endsWith('background.ts') || id.endsWith('background/index.ts')) {
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
                  if (api.mode === 'development') {
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
      }
    },
  }
}
