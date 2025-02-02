import fs from 'node:fs/promises'
import path from 'node:path'
import { merge } from 'lodash-es'
import type { Manifest, Processor } from '../types'
import type { PagesProcessor } from './pages'

export function createManifestProcessor(pages: PagesProcessor): Processor {
  let outDir: string

  return {
    configResolved(config) {
      outDir = config.build.outDir
    },

    async buildStart() {
      const pagesManifestPatch = pages.getManifestPatch()

      const manifestJson: Manifest = merge(
        {
          name: 'My App',
          version: '1.0.0',
          description: 'My awesome app',
          manifest_version: 3,
          // content_security_policy: {
          //   extension_pages: "script-src 'self' http://localhost:5173; object-src 'self'",
          // },
        },
        pagesManifestPatch,
      )
      console.log(manifestJson)

      await fs.writeFile(
        path.join(outDir, 'manifest.json'),
        JSON.stringify(manifestJson, null, 2),
        'utf-8',
      )
    },
  }
}
