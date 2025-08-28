import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { transformAsync } from '@babel/core'
import fg from 'fast-glob'
import { flatMap, map, reduce } from 'lodash-es'
import type { Plugin, ResolvedConfig, TransformResult } from 'vite'
import { definitions } from './assets'
import { type Asset, createAsset } from './lib/asset'
import { addEntrypoint } from './lib/config'
import { emitFile } from './lib/fs'
import { type ManifestPatch, patchManifest } from './lib/manifest'

export function neext(): Plugin {
  const assets: Asset[] = []
  let config: ResolvedConfig

  return {
    name: 'zen-ext',

    async config(config) {
      config.server = {
        ...config.server,
        cors: true,
      }

      for (const definition of definitions) {
        const files = await fg(definition.pattern, { cwd: config.root })
        for (const file of files) {
          const asset: Asset = createAsset(definition, file)
          assets.push(asset)
        }
      }

      return reduce(
        assets,
        (config, asset) => addEntrypoint(config, asset.name, asset.outputFile),
        config,
      )
    },

    configResolved(resolvedConfig) {
      config = resolvedConfig
    },

    async buildStart() {
      const patches = getManifestPatches(assets)
      const manifest = patchManifest(
        {
          name: 'My App',
          version: '1.0.0',
          description: 'My awesome app',
          manifest_version: 3,
          content_security_policy: {
            extension_pages: "script-src 'self' http://localhost:5173; object-src 'self'",
          },
        },
        patches,
      )

      const baseUrl = `http://${config.server.host ?? 'localhost'}:${config.server.port}`
      await Promise.all([
        emitFile(config.build.outDir, {
          file: 'manifest.json',
          content: JSON.stringify(manifest, null, 2),
        }),
        ...flatMap(assets, asset =>
          map(asset.definition.emittedFiles(asset, baseUrl), file =>
            emitFile(config.build.outDir, file),
          ),
        ),
      ])
    },

    configureServer(server) {
      server.ws.on('neext:reload', () => {
        server.ws.send({ type: 'custom', event: 'neext:reload' })
      })
    },

    handleHotUpdate(ctx) {
      const asset = assets.find(asset => ctx.file.endsWith(asset.sourceFile))
      return asset?.definition.handleHotUpdate?.(ctx)
    },

    async transform(code, id) {
      const asset = assets.find(asset => id.endsWith(asset.sourceFile))
      const visitor = asset?.definition.visitor?.(config.mode)
      if (visitor) {
        return (await transformAsync(code, {
          filename: id,
          presets: ['@babel/preset-typescript'],
          plugins: [() => ({ visitor })],
        })) as TransformResult
      }
    },

    resolveId(id) {
      if (id === 'virtual:neext/renderer') {
        // Prefix with \0 means it's a resolved virtual module
        return '\0virtual:neext/renderer'
      }
    },

    async load(id) {
      if (id === '\0virtual:neext/renderer') {
        const rendererPath = resolve(config.root, 'renderer.ts')
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
  }
}

function getManifestPatches(assets: Asset[]): ManifestPatch[] {
  return map(assets, asset => asset.definition.manifestPatch(asset))
}
