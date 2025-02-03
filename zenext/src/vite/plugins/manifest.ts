import { merge } from 'lodash-es'
import type { Plugin } from 'vite'
import type { ManifestPatch, PluginContext } from '../context'
import type { Manifest } from '../types'

export function manifest(context: PluginContext): Plugin {
  return {
    name: 'zen-ext:manifest',

    async buildStart() {
      const manifest: Manifest = patchManifest(
        {
          name: 'My App',
          version: '1.0.0',
          description: 'My awesome app',
          manifest_version: 3,
          content_security_policy: {
            extension_pages: "script-src 'self' http://localhost:5173; object-src 'self'",
          },
        },
        context.manifestPatches,
      )

      await context.emitFile('manifest.json', manifest)
    },
  }
}

function patchManifest(manifest: Manifest, patches: ManifestPatch[]): Manifest {
  return patches.reduce(merge, manifest)
}
