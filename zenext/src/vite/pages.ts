import { chain, isArray, merge } from 'lodash-es'
import type { UserConfig } from 'vite'
import type { Manifest } from './types'
import { assert } from './utils'

export type PageName = (typeof PAGE_NAMES)[number]

export type PageContext = {
  name: PageName
  file: string
  manifestEntries: Partial<Manifest>[]
}

const PAGE_NAMES = ['background', 'side-panel'] as const

export class PagesProcessor {
  private readonly pages: PageContext[]

  constructor() {
    this.pages = PAGE_NAMES.map(createPageContext)
  }

  public updateConfig(config: UserConfig): UserConfig {
    return this.pages.reduce(addPageEntrypoint, config)
  }

  public getManifestPatch(): Partial<Manifest> {
    return chain(this.pages).map('manifestEntries').flatten().reduce(merge, {}).value()
  }
}

export function createPageContext(pageName: PageName): PageContext {
  return {
    name: pageName,
    file: `src/pages/${pageName}/index.ts`,
    manifestEntries: getManifestEntries(pageName),
  }
}

function addPageEntrypoint(config: UserConfig, { name, file: path }: PageContext): UserConfig {
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

function getManifestEntries(pageName: PageName): Partial<Manifest>[] {
  switch (pageName) {
    case 'background':
      return [
        {
          background: {
            type: 'module',
            service_worker: 'background.js',
          },
        },
      ]
    case 'side-panel':
      return [
        {
          permissions: ['sidePanel'],
          side_panel: {
            default_path: 'side-panel.html',
          },
        },
      ]
  }
}
