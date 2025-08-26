import fg from 'fast-glob'
import { flatMap, map, reduce } from 'lodash-es'
import type { Plugin, ResolvedConfig } from 'vite'
import { type Asset, createAsset } from './asset'
import { definitions } from './assets'
import { addEntrypoint } from './config'
import { emitFile } from './fs'
import { type ManifestPatch, patchManifest } from './manifest'

export function zenExt(): Plugin {
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
      server.ws.on('zenext:reload', () => {
        server.ws.send({ type: 'custom', event: 'zenext:reload' })
      })
    },

    handleHotUpdate(ctx) {
      const asset = assets.find(asset => ctx.file.endsWith(asset.sourceFile))
      return asset?.definition.handleHotUpdate?.(ctx)
    },

    async transform(code, id) {
      const asset = assets.find(asset => id.endsWith(asset.sourceFile))
      return asset?.definition.transform?.(code, id, config.mode)
    },
  }
}

function getManifestPatches(assets: Asset[]): ManifestPatch[] {
  return map(assets, asset => asset.definition.manifestPatch(asset))
}
