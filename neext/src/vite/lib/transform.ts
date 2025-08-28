import { type NodePath, template, transformSync } from '@babel/core'
import * as t from '@babel/types'

export function insertBody(path: NodePath<t.Program>, node: t.Statement | t.Statement[]) {
  path.unshiftContainer('body', node)
}

export function appendBody(path: NodePath<t.Program>, node: t.Statement | t.Statement[]) {
  path.pushContainer('body', node)
}

export function wrapMessageHandler(path: NodePath<t.FunctionDeclaration>) {
  if (!path.parentPath.isExportNamedDeclaration()) return
  if (!path.node.id) return

  const name = t.stringLiteral(path.node.id.name)
  const fn = t.functionExpression(
    path.node.id,
    path.node.params,
    path.node.body,
    path.node.generator,
    path.node.async,
  )
  const handler = template.ast`
    addMessageHandler(${name}, ${fn})
  `
  path.parentPath.replaceWithMultiple(handler)
}

const renderToAnchor = template(`
  renderToAnchor(%%component%%, typeof anchor === 'string' ? anchor : document.body)
`)

export function renderComponent(path: NodePath<t.ExportDefaultDeclaration>) {
  const declaration = path.node.declaration

  if (t.isIdentifier(declaration)) {
    const statement = renderToAnchor({ component: declaration })
    path.replaceWithMultiple(statement)
  }
}

export function transpile(code: string, filename: string): t.Statement | t.Statement[] {
  const result = transformSync(code, {
    filename,
    presets: ['@babel/preset-typescript'],
  })
  return template.ast(result?.code ?? '')
}
