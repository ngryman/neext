import { parse } from 'node:path'
import type { AssetDefinition } from '@/vite/asset'
import type { PageName } from '@/vite/asset'
import { createFilePattern } from '@/vite/fs'
import type { PatchFn } from '@/vite/manifest'

const MANIFEST_PATCHES: Record<PageName, PatchFn> = {
  popup: asset => ({
    action: {
      default_popup: asset.outputFile.replace('.js', '.html'),
    },
  }),
  'side-panel': asset => ({
    permissions: ['sidePanel'],
    side_panel: {
      default_path: asset.outputFile.replace('.js', '.html'),
    },
  }),
}

export const page: AssetDefinition = {
  type: 'page',
  pattern: createFilePattern(['popup', 'side-panel']),
  manifestPatch: asset => MANIFEST_PATCHES[asset.name as PageName](asset),
  emittedFiles: (asset, baseUrl) => [
    {
      file: asset.outputFile,
      content: `import '${baseUrl}/${asset.sourceFile}'`,
    },
    {
      file: asset.outputFile.replace('.js', '.html'),
      content: `<script src="${parse(asset.outputFile).base}" type="module"></script>`,
    },
  ],
}
