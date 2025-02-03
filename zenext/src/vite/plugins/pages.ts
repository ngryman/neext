import fs from 'node:fs/promises'
import { isArray, map, merge } from 'lodash-es'
import type { Plugin, UserConfig } from 'vite'
import type { ManifestPatch, PluginContext } from '../context'
import { assert } from '../utils'

type PageName = 'side-panel'

type PageDefinition = {
  name: PageName
  manifestPatch: ManifestPatch[]
}

type PageState = PageDefinition & {
  file: string
}

const PAGE_DEFINITIONS: PageDefinition[] = [
  {
    name: 'side-panel',
    manifestPatch: [
      {
        permissions: ['sidePanel'],
        side_panel: {
          default_path: 'side-panel.html',
        },
      },
    ],
  },
] as const

const PAGE_REGEX = new RegExp(`pages/(${map(PAGE_DEFINITIONS, 'name').join('|')})/index.tsx?$`)

export function pages(context: PluginContext): Plugin {
  const activePages: PageState[] = []
  let baseUrl!: string

  return {
    name: 'zen-ext:pages',
    async config(config) {
      await Promise.all(
        PAGE_DEFINITIONS.map(async page => {
          const file = await detectPage(page)
          if (file) {
            activePages.push({ ...page, file })
            context.manifestPatches.push(...page.manifestPatch)
          }
        }),
      )

      return activePages.reduce(addPageEntrypoint, config)
    },

    configResolved(config) {
      baseUrl = `http://${config.server.host ?? 'localhost'}:${config.server.port}`
    },

    async buildStart() {
      await Promise.all(
        activePages.map(async page => {
          await Promise.all([
            context.emitFile(
              `${page.name}.html`,
              `<script src="${baseUrl}/${page.file}" type="module"></script>`,
            ),
            context.emitFile(`${page.name}.js`, `import '${page.file}'`),
          ])
        }),
      )
    },

    configureServer(server) {
      server.watcher.on('add', file => {
        if (isFilePage(file)) {
          server.restart()
        }
      })

      server.watcher.on('unlink', file => {
        if (isFilePage(file)) {
          server.restart()
        }
      })
    },
  }
}

async function detectPage({ name }: PageDefinition): Promise<string | undefined> {
  const files = [`pages/${name}/index.ts`, `pages/${name}/index.tsx`]
  for (const file of files) {
    try {
      await fs.access(file)
      return file
    } catch {}
  }
  return undefined
}

function addPageEntrypoint(config: UserConfig, { name, file }: PageState): UserConfig {
  const prevInput = (config.build?.rollupOptions?.input ?? {}) as Record<string, string>
  assert(!isArray(prevInput), 'Expected `build.rollupOptions.input` to be an object or undefined.')

  return merge(config, {
    build: {
      rollupOptions: {
        input: {
          ...prevInput,
          [name]: file,
        },
      },
    },
  })
}

function isFilePage(file: string): boolean {
  return PAGE_REGEX.test(file)
}
