import { prependBody, wrapMessageHandler } from '@/vite/lib/transform'
import { type Visitor, template } from '@babel/core'

const prelude = template.ast`
  import { addMessageHandler } from 'neext/sdk'
`

export const visitor: Visitor = {
  Program(path) {
    prependBody(path, prelude)
  },
  FunctionDeclaration(path) {
    wrapMessageHandler(path)
  },
}
