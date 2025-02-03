import fs from 'node:fs/promises'
import { isArray, map, merge } from 'lodash-es'
import type { Plugin, UserConfig } from 'vite'
import type { PageConfig, PluginContext } from '../context'
import { assert } from '../utils'

const PAGE_CONFIGS: PageConfig[] = [
  {
    name: 'side-panel',
    file: 'pages/side-panel/index.ts',
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

const PAGE_REGEX = new RegExp(`pages/(${map(PAGE_CONFIGS, 'name').join('|')})/index.ts$`)

export function pages(context: PluginContext): Plugin {
  const activePages: PageConfig[] = []
  let baseUrl!: string

  return {
    name: 'zen-ext:pages',
    async config(config) {
      await Promise.all(
        PAGE_CONFIGS.map(async page => {
          if (await pageExists(page)) {
            activePages.push(page)
            context.manifestPatches.push(...page.manifestPatch)
          }
        }),
      )

      return activePages.reduce(addPageEntrypoint, config)
    },

    configResolved(config) {
      baseUrl = `http://${config.server.host ?? 'localhost'}:${config.server.port}/pages`
    },

    async buildStart() {
      await Promise.all(
        activePages.map(async page => {
          await Promise.all([
            context.emitFile(
              `${page.name}.html`,
              `<script src="${baseUrl}/${page.name}/index.ts" type="module"></script>`,
            ),
            context.emitFile(
              `${page.name}.js`,
              `
              import '${page.file}'

              document.__hot.accept(() => {
                document.__hot.invalidate()
              })
            `,
            ),
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

async function pageExists({ file }: PageConfig): Promise<boolean> {
  try {
    await fs.access(file)
    return true
  } catch {
    return false
  }
}

function addPageEntrypoint(config: UserConfig, { name, file }: PageConfig): UserConfig {
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
