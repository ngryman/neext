import { wrapMessageHandler } from '@/vite/lib/transform'
import type { Visitor } from '@babel/core'

export const visitor: Visitor = {
  FunctionDeclaration(path) {
    wrapMessageHandler(path)
  },
}
