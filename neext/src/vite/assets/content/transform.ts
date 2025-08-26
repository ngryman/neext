import type { AssetTransform } from '@/vite/asset'
import { template, transformAsync } from '@babel/core'
import type { Visitor } from '@babel/traverse'
import type { TransformResult } from 'vite'

const importDevRuntime = template.ast`import 'neext/vite-dev-content'`

export const transform: AssetTransform = async (code, id, mode) => {
  const result = await transformAsync(code, {
    filename: id,
    presets: ['@babel/preset-typescript'],
    plugins: [
      (): { visitor: Visitor } => ({
        visitor: {
          Program(path) {
            if (mode === 'development') {
              path.unshiftContainer('body', importDevRuntime)
            }
          },
        },
      }),
    ],
  })

  return result as TransformResult
}
