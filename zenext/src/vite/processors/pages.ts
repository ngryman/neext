import fs from 'node:fs/promises'
import { chain, isArray, map, merge } from 'lodash-es'
import type { UserConfig } from 'vite'
import type { Manifest, Processor } from '../types'
import { assert } from '../utils'

export type PageName = 'background' | 'side-panel'

export type PageConfig = {
  name: PageName
  file: string
  manifestEntries: Partial<Manifest>[]
}

export type PagesProcessor = Processor & {
  getManifestPatch(): Partial<Manifest>
}

const PAGE_CONFIGS: PageConfig[] = [
  {
    name: 'background',
    file: 'src/pages/background/index.ts',
    manifestEntries: [
      {
        background: {
          type: 'module',
          service_worker: 'background.js',
        },
      },
    ],
  },
  {
    name: 'side-panel',
    file: 'src/pages/side-panel/index.ts',
    manifestEntries: [
      {
        permissions: ['sidePanel'],
        side_panel: {
          default_path: 'side-panel.html',
        },
      },
    ],
  },
] as const

const PAGE_REGEX = new RegExp(`src/pages/(${map(PAGE_CONFIGS, 'name').join('|')})/index.ts$`)

export function createPageProcessor(): PagesProcessor {
  let activePages: PageConfig[] = []

  return {
    async config(config) {
      activePages = await Promise.all(
        PAGE_CONFIGS.map(async page => ((await pageExists(page)) ? page : undefined)),
      ).then(pages => pages.filter(Boolean) as PageConfig[])
      return activePages.reduce(addPageEntrypoint, config)
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

    getManifestPatch(): Partial<Manifest> {
      return chain(activePages).map('manifestEntries').flatten().reduce(merge, {}).value()
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

function addPageEntrypoint(config: UserConfig, { name, file: path }: PageConfig): UserConfig {
  const prevInput = (config.build?.rollupOptions?.input ?? {}) as Record<string, string>
  assert(!isArray(prevInput), 'Expected `build.rollupOptions.input` to be an object or undefined.')

  return merge(config, {
    build: {
      rollupOptions: {
        input: {
          ...prevInput,
          [name]: `src/pages/${path}/index.ts`,
        },
      },
    },
  })
}

function isFilePage(file: string): boolean {
  return PAGE_REGEX.test(file)
}
