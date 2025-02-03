import { chain, merge } from 'lodash-es'
import type { Plugin } from 'vite'
import type { PluginContext } from '../context'
import type { Manifest } from '../types'

export function manifest(context: PluginContext): Plugin {
  return {
    name: 'zen-ext:manifest',

    async buildStart() {
      const manifest: Manifest = createManifest(
        {
          name: 'My App',
          version: '1.0.0',
          description: 'My awesome app',
          manifest_version: 3,
          // content_security_policy: {
          //   extension_pages: "script-src 'self' http://localhost:5173; object-src 'self'",
          // },
        },
        context,
      )

      await context.emitFile('manifest.json', manifest)
    },
  }
}

function createManifest(manifest: Manifest, { pages }: PluginContext): Manifest {
  return chain(pages).map('manifestEntries').flatten().reduce(merge, manifest).value()
}
