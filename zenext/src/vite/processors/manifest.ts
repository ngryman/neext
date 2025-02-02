import fs from 'node:fs/promises'
import path from 'node:path'
import { chain, merge } from 'lodash-es'
import type { PluginState } from '../plugin'
import type { Manifest, Processor } from '../types'

export function createManifestProcessor(state: PluginState): Processor {
  let outDir: string

  return {
    configResolved(config) {
      outDir = config.build.outDir
    },

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
        state,
      )

      await fs.writeFile(
        path.join(outDir, 'manifest.json'),
        JSON.stringify(manifest, null, 2),
        'utf-8',
      )
    },
  }
}

function createManifest(manifest: Manifest, { pages }: PluginState): Manifest {
  return chain(pages).map('manifestEntries').flatten().reduce(merge, manifest).value()
}
