import { mkdir, writeFile } from 'node:fs/promises'
import { join, parse } from 'node:path'
import { assert } from '@/utils'
import { isArray, isObject, merge } from 'lodash-es'
import { type ResolvedConfig, type UserConfig, type ViteDevServer, createLogger } from 'vite'
import type { Asset } from './asset'

export class Api {
  public mode!: 'development' | 'production'
  public config!: ResolvedConfig
  public server!: ViteDevServer
  public baseUrl!: string
  public readonly logger = createLogger()
  public readonly assets: Asset[] = []

  // biome-ignore lint/suspicious/noExplicitAny: We need types flowing
  public async emitFile<T extends string | Record<string, any>>(
    file: string,
    content: T,
  ): Promise<void> {
    const { base, dir } = parse(file)
    const outDir = `${this.config.build.outDir}/${dir}`
    await mkdir(outDir, { recursive: true })
    await writeFile(
      join(outDir, base),
      isObject(content) ? JSON.stringify(content, null, 2) : content,
      'utf-8',
    )
  }

  public addEntrypoint(config: UserConfig, name: string, file: string): UserConfig {
    const prevInput = (config.build?.rollupOptions?.input ?? {}) as Record<string, string>
    assert(
      !isArray(prevInput),
      'Expected `build.rollupOptions.input` to be an object or undefined.',
    )

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
}
