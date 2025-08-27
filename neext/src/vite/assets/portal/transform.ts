import type { AssetTransform } from '@/vite/lib/asset'
import { appendBody, insertBody, renderComponent, wrapMessageHandler } from '@/vite/lib/transform'
import { template, transformAsync } from '@babel/core'
import type { Visitor } from '@babel/traverse'
import type { TransformResult } from 'vite'
import { devRuntime } from './dev'

const importSdk = template.ast`import { addMessageHandler } from 'neext/sdk'`
const importRuntime = template.ast`import { renderToAnchor } from 'neext/vite-runtime-portal'`

export const transform: AssetTransform = async (code, id, mode) => {
  const result = await transformAsync(code, {
    filename: id,
    presets: ['@babel/preset-typescript'],
    plugins: [
      (): { visitor: Visitor } => ({
        visitor: {
          async Program(path) {
            insertBody(path, importSdk)
            insertBody(path, importRuntime)
            if (mode === 'development') {
              insertBody(path, template.ast(devRuntime.toString()))
              appendBody(path, template.ast`devRuntime()`)
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
