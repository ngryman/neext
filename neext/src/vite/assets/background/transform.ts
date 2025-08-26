import type { AssetTransform } from '@/vite/asset'
import { insertImport, wrapMessageHandler } from '@/vite/transform'
import { template, transformAsync } from '@babel/core'
import type { Visitor } from '@babel/traverse'
import type { TransformResult } from 'vite'

const importSdk = template.ast`import { addMessageHandler } from 'neext/sdk'`
const importRuntime = template.ast`import 'neext/vite-runtime-background'`
const importDevRuntime = template.ast`import 'neext/vite-dev-background'`

export const transform: AssetTransform = async (code, id, mode) => {
  return (await transformAsync(code, {
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
          FunctionDeclaration(path) {
            wrapMessageHandler(path)
          },
        },
      }),
    ],
  })) as TransformResult
}
