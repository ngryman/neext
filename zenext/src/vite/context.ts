import fs from 'node:fs/promises'
import path from 'node:path'
import { isObject } from 'lodash-es'
import type { ResolvedConfig } from 'vite'
import type { Manifest } from './types'

export type PageName = 'side-panel'

export type PageConfig = {
  name: PageName
  file: string
  manifestEntries: Partial<Manifest>[]
}

export class PluginContext {
  public pages: PageConfig[] = []
  public config!: ResolvedConfig

  // biome-ignore lint/suspicious/noExplicitAny: This accepts any type of object
  public async emitFile<T extends string | Record<string, any>>(
    file: string,
    content: T,
  ): Promise<void> {
    await fs.mkdir(this.config.build.outDir, { recursive: true })
    await fs.writeFile(
      path.join(this.config.build.outDir, file),
      isObject(content) ? JSON.stringify(content, null, 2) : content,
      'utf-8',
    )
  }
}

// export async function emitFile(file: string, content: string): void {
//   await fs.writeFile(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf-8')
// }
