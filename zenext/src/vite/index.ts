import fg from 'fast-glob'
import { flatMap, map, reduce } from 'lodash-es'
import { type Plugin, type ResolvedConfig, createLogger } from 'vite'
import { type Asset, createAsset } from './asset'
import { addEntrypoint } from './config'
import { definitions } from './definitions'
import { emitFile } from './fs'
import { type ManifestPatch, patchManifest } from './manifest'

export function zenExt(): Plugin {
  // const api = new Api()
  // return [core(api), background(api), content(api), page(api), manifest(api)]
  const assets: Asset[] = []
  const logger = createLogger()
  let config: ResolvedConfig

  return {
    name: 'zen-ext',

    async config(config) {
      config.server = {
        ...config.server,
        cors: true,
      }

      for (const definition of definitions) {
        const files = await fg(definition.patterns, { cwd: config.root })
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
      logger.info(JSON.stringify(patches, null, 2))
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

    async transform(code, id) {
      const asset = assets.find(asset => id.endsWith(asset.sourceFile))
      return asset?.definition.transform?.(code, id, config.mode)
    },
  }
}

function getManifestPatches(assets: Asset[]): ManifestPatch[] {
  return map(assets, asset => asset.definition.manifestPatch(asset))
}
