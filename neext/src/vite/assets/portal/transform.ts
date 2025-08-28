import type { AssetTransform } from '@/vite/lib/asset'
import { insertBody, renderComponent, transpile, wrapMessageHandler } from '@/vite/lib/transform'
import { template, transformAsync } from '@babel/core'
import type { Visitor } from '@babel/traverse'
import type { TransformResult } from 'vite'
import dev from './dev.ts?raw'

const prelude = template.ast`
  import { addMessageHandler } from 'neext/sdk'
  import { renderToAnchor } from 'neext/vite-runtime-portal'
`

export const transform: AssetTransform = async (code, id, mode) => {
  const result = await transformAsync(code, {
    filename: id,
    presets: ['@babel/preset-typescript'],
    plugins: [
      (): { visitor: Visitor } => ({
        visitor: {
          Program(path) {
            insertBody(path, prelude)
            if (mode === 'development') {
              insertBody(path, transpile(dev, './dev.ts'))
            }
          },
          ExportDefaultDeclaration(path) {
            renderComponent(path)
          },
          FunctionDeclaration(path) {
            wrapMessageHandler(path)
          },
        },
      }),
    ],
  })

  return result as TransformResult
}
