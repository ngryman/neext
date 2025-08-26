import type { AssetTransform } from '@/vite/lib/asset'
import { insertImport, renderComponent, wrapMessageHandler } from '@/vite/lib/transform'
import { template, transformAsync } from '@babel/core'
import type { Visitor } from '@babel/traverse'
import type { TransformResult } from 'vite'

const importSdk = template.ast`import { addMessageHandler } from 'neext/sdk'`
const importRuntime = template.ast`import 'neext/vite-runtime-content'`
const importDevRuntime = template.ast`import 'neext/vite-dev-content'`
const importRuntimeSolid = template.ast`import { render } from 'solid-js/web'`

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
            if (id.endsWith('.tsx')) {
              insertImport(path, importRuntimeSolid)
            }
            if (mode === 'development') {
              insertImport(path, importDevRuntime)
            }
          },
          ExportDefaultDeclaration(path) {
            if (id.endsWith('.tsx')) {
              renderComponent(path)
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
