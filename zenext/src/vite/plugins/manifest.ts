import { map, reduce } from 'lodash-es'
import type { Plugin } from 'vite'
import type { Api } from '../api'
import type { Asset, AssetType, PageName } from '../asset'
import type { Manifest, ManifestPatch } from '../manifest'
import { mergeConcat } from '../utils'

type PatchFn = (asset: Asset) => ManifestPatch

const MANIFEST_PATCHES: Record<AssetType, PatchFn> = {
  content: asset => ({
    content_scripts: [{ matches: ['<all_urls>'], js: [asset.outputFile] }],
  }),
  background: asset => ({
    background: {
      service_worker: asset.outputFile,
      type: 'module',
    },
  }),
  page: asset => {
    return MANIFEST_PAGE_PATCHES[asset.name as PageName](asset)
  },
} as const

const MANIFEST_PAGE_PATCHES: Record<PageName, PatchFn> = {
  popup: asset => ({ action: { default_popup: asset.outputFile.replace('.js', '.html') } }),
  'side-panel': asset => ({
    permissions: ['sidePanel'],
    side_panel: {
      default_path: asset.outputFile.replace('.js', '.html'),
    },
  }),
}

export function manifest(api: Api): Plugin {
  return {
    name: 'zen-ext:manifest',

    async buildStart() {
      const patches = getManifestPatches(api)

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
        patches,
      )

      await api.emitFile('manifest.json', manifest)
    },

    // async buildStart() {
    //   const manifest: Manifest = patchManifest(
    //     {
    //       name: 'My App',
    //       version: '1.0.0',
    //       description: 'My awesome app',
    //       manifest_version: 3,
    //       content_security_policy: {
    //         extension_pages: "script-src 'self' http://localhost:5173; object-src 'self'",
    //       },
    //     },
    //     context.manifestPatches,
    //   )

    //   context.logger.info(`Manifest: ${JSON.stringify(manifest, null, 2)}`)
    //   await context.emitFile('manifest.json', manifest)
    // },
  }
}

function getManifestPatches(api: Api): ManifestPatch[] {
  return map(api.assets, asset => MANIFEST_PATCHES[asset.type](asset))
}

function patchManifest(manifest: Manifest, patches: ManifestPatch[]): Manifest {
  return reduce(patches, mergeConcat, manifest)
}
