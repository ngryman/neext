import type { AssetTransform } from '@/vite/asset'
import { template, transformAsync } from '@babel/core'
import type { Visitor } from '@babel/traverse'
import * as t from '@babel/types'
import type { TransformResult } from 'vite'

const importRuntime = template.ast`import { addMessageHandler } from 'zenext/runtime'`
const importDevRuntime = template.ast`import 'zenext/vite-dev-background'`

export const transform: AssetTransform = async (code, id, mode) => {
  return (await transformAsync(code, {
    filename: id,
    presets: ['@babel/preset-typescript'],
    plugins: [
      (): { visitor: Visitor } => ({
        visitor: {
          Program(path) {
            path.unshiftContainer('body', importRuntime)
            if (mode === 'development') {
              path.unshiftContainer('body', importDevRuntime)
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
  })) as TransformResult
}
