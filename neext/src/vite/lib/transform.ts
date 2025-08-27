import { type NodePath, template } from '@babel/core'
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

  const functionExpression = t.functionExpression(
    path.node.id,
    path.node.params,
    path.node.body,
    path.node.generator,
    path.node.async,
  )

  const wrappedFunction = t.expressionStatement(
    t.callExpression(t.identifier('addMessageHandler'), [
      t.stringLiteral(path.node.id.name),
      functionExpression,
    ]),
  )

  path.parentPath.replaceWith(wrappedFunction)
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
