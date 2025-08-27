import type { AssetTransform } from '@/vite/lib/asset'
import { insertImport, renderComponent, wrapMessageHandler } from '@/vite/lib/transform'
import { template, transformAsync } from '@babel/core'
import type { Visitor } from '@babel/traverse'
import type { TransformResult } from 'vite'

const importSdk = template.ast`import { addMessageHandler } from 'neext/sdk'`
const importRuntime = template.ast`import { renderToAnchor } from 'neext/vite-runtime-portal'`
const importDevRuntime = template.ast`import 'neext/vite-dev-portal'`

export const transform: AssetTransform = async (code, id, mode) => {
  const result = await transformAsync(code, {
    filename: id,
    presets: ['@babel/preset-typescript'],
    plugins: [
      (): { visitor: Visitor } => ({
        visitor: {
          Program(path) {
            insertImport(path, importSdk)
            insertImport(path, importRuntime)
            if (mode === 'development') {
              insertImport(path, importDevRuntime)
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
