import { map, reduce } from 'lodash-es'
import type { Plugin, ResolvedConfig } from 'vite'
import type { Asset } from '../lib/asset'
import { emitFile } from '../lib/fs'
import type { Manifest, ManifestPatch } from '../lib/manifest'
import type { State } from '../lib/state'
import { mergeConcat } from '../lib/utils'

export function manifest(state: State): Plugin {
  let resolvedConfig: ResolvedConfig

  return {
    name: 'neext:manifest',

    configResolved(config) {
      resolvedConfig = config
    },

    async buildStart() {
      const patches = getManifestPatches(state.assets)
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

      await emitFile(resolvedConfig.build.outDir, {
        file: 'manifest.json',
        content: JSON.stringify(manifest, null, 2),
      })
    },
  }
}

function getManifestPatches(assets: Asset[]): ManifestPatch[] {
  return map(assets, asset => asset.definition.manifestPatch(asset))
}

function patchManifest(manifest: Manifest, patches: ManifestPatch[]): Manifest {
  return reduce(patches, mergeConcat, manifest)
}
