import { type NodePath, template, transformSync } from '@babel/core'
import * as t from '@babel/types'

export function prependBody(path: NodePath<t.Program>, node: t.Statement | t.Statement[]) {
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

export function renderComponent(path: NodePath<t.ExportDefaultDeclaration>) {
  const declaration = path.node.declaration

  // If the declaration is an expression, create a variable declaration
  if (t.isExpression(declaration)) {
    const variableDeclaration = t.variableDeclaration('const', [
      t.variableDeclarator(t.identifier('PortalComponent'), declaration),
    ])
    const namedExport = t.exportNamedDeclaration(variableDeclaration)
    return path.replaceWith(namedExport)
  }

  // If it's already a declaration (like FunctionDeclaration or ClassDeclaration)
  if (t.isFunctionDeclaration(declaration) || t.isClassDeclaration(declaration)) {
    // Ensure it has a name
    if (!declaration.id) {
      declaration.id = t.identifier('PortalComponent')
    } else {
      declaration.id.name = 'PortalComponent'
    }
    const namedExport = t.exportNamedDeclaration(declaration)
    return path.replaceWith(namedExport)
  }

  // Fallback: just replace with the declaration as before
  return path.replaceWith(declaration)
}

export function transpile(code: string, filename: string): t.Statement | t.Statement[] {
  const result = transformSync(code, {
    filename,
    presets: ['@babel/preset-typescript'],
  })
  return template.ast(result?.code ?? '')
}
