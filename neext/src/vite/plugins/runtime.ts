import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { type NodePath, transformAsync } from '@babel/core'
import type * as t from '@babel/types'
import type { Plugin, ResolvedConfig } from 'vite'
import type { State } from '../lib/state'
import { appendBody, transpile } from '../lib/transform'

export function runtime(state: State): Plugin {
  let resolvedConfig: ResolvedConfig

  return {
    name: 'neext:runtime',

    configResolved(config) {
      resolvedConfig = config
    },

    resolveId(id) {
      if (id === 'virtual:neext/renderer') {
        // Prefix with \0 means it's a resolved virtual module
        return '\0virtual:neext/renderer'
      }
    },

    async load(id) {
      if (id === '\0virtual:neext/renderer') {
        const rendererPath = resolve(resolvedConfig.root, 'renderer.ts')
        try {
          return await readFile(rendererPath, 'utf8')
        } catch {
          return `
            export function render() {
              console.error('No renderer found. Please create a \`renderer.ts\` file in your app.')
            }
          `
        }
      }
    },

    async transform(code, id) {
      const asset = state.assets.find(asset => id.endsWith(asset.sourceFile))

      let transformedCode = code

      // First pass: Apply asset-specific transforms
      const visitor = asset?.definition.visitor
      if (visitor) {
        const result = await transformAsync(transformedCode, {
          filename: id,
          presets: ['@babel/preset-typescript'],
          plugins: [() => ({ visitor })],
        })
        transformedCode = result?.code ?? transformedCode
      }

      // Second pass: Inline runtime
      const runtime = asset?.definition.runtime
      if (runtime) {
        const result = await transformAsync(transformedCode, {
          filename: id,
          presets: ['@babel/preset-typescript'],
          plugins: [
            () => ({
              visitor: {
                Program(path: NodePath<t.Program>) {
                  appendBody(path, transpile(runtime, './runtime.ts'))
                },
              },
            }),
          ],
        })
        transformedCode = result?.code ?? transformedCode
      }

      // Return the final result if any transforms were applied
      if (transformedCode !== code) {
        return { code: transformedCode }
      }
    },
  }
}
