import type { AssetVisitor } from '@/vite/lib/asset'
import { insertBody, renderComponent, transpile, wrapMessageHandler } from '@/vite/lib/transform'
import { template } from '@babel/core'
import dev from './dev.ts?raw'

const prelude = template.ast`
  import { addMessageHandler } from 'neext/sdk'
  import { renderToAnchor } from 'neext/vite-runtime-portal'
`

export const visitor: AssetVisitor = mode => ({
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
})
