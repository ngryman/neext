import { access } from 'node:fs/promises'
import { transformAsync } from '@babel/core'
import type { Visitor } from '@babel/traverse'
import * as t from '@babel/types'
import type { Plugin } from 'vite'
import type { ManifestPatch, PluginContext } from '../context'
import { addPageEntrypoint } from '../utils'

const manifestPatch: ManifestPatch = {
  background: {
    type: 'module',
    service_worker: 'background.js',
  },
}

export function background(context: PluginContext): Plugin {
  let baseUrl!: string
  let backgroundEntry: string | undefined

  return {
    name: 'zenext:background',

    async config(config) {
      backgroundEntry = await detectBackground()
      if (backgroundEntry) {
        context.manifestPatches.push(manifestPatch)
        return addPageEntrypoint(config, 'background', backgroundEntry)
      }

      return config
    },

    configResolved(config) {
      baseUrl = `http://${config.server.host ?? 'localhost'}:${config.server.port}`
    },

    // configureServer(server) {
    //   server.watcher.on('change', file => {
    //     if (file.endsWith('background/index.ts')) {
    //       server.ws.send({
    //         type: 'full-reload',
    //       })
    //     }
    //   })
    // },

    async buildStart() {
      if (backgroundEntry) {
        await context.emitFile('background.js', `import '${baseUrl}/${backgroundEntry}'`)
      }
    },

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

async function detectBackground(): Promise<string | undefined> {
  const files = ['background.ts', 'background/index.ts']
  for (const file of files) {
    try {
      await access(file)
      return file
    } catch {}
  }
  return undefined
}
