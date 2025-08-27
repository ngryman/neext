import type { AssetTransform } from '@/vite/lib/asset'
import { insertBody, wrapMessageHandler } from '@/vite/lib/transform'
import { template, transformAsync } from '@babel/core'
import type { Visitor } from '@babel/traverse'
import type { TransformResult } from 'vite'

const importSdk = template.ast`import { addMessageHandler } from 'neext/sdk'`
const importRuntime = template.ast`import 'neext/vite-runtime-content'`
const importDevRuntime = template.ast`import 'neext/vite-dev-content'`

export const transform: AssetTransform = async (code, id, mode) => {
  const result = await transformAsync(code, {
    filename: id,
    presets: ['@babel/preset-typescript'],
    plugins: [
      (): { visitor: Visitor } => ({
        visitor: {
          Program(path) {
            insertBody(path, importSdk)
            insertBody(path, importRuntime)
            if (mode === 'development') {
              insertBody(path, importDevRuntime)
            }
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
