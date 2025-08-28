import type { AssetVisitor } from '@/vite/lib/asset'
import { insertBody, transpile, wrapMessageHandler } from '@/vite/lib/transform'
import { template } from '@babel/core'
import dev from './dev.ts?raw'

const prelude = template.ast`
  import { addMessageHandler } from 'neext/sdk'
  import 'neext/runtime/content'
`

export const visitor: AssetVisitor = mode => ({
  Program(path) {
    insertBody(path, prelude)
    if (mode === 'development') {
      insertBody(path, transpile(dev, './dev.ts'))
    }
  },
  FunctionDeclaration(path) {
    wrapMessageHandler(path)
  },
})
