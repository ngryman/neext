import { mkdir, writeFile } from 'node:fs/promises'
import { join, parse } from 'node:path'
import { isObject } from 'lodash-es'

export interface EmittedFile {
  file: string
  content: string
}

const BASE_PATTERN = '{,src/}'
const EXT_PATTERN = '{ts,tsx}'

export interface FilePatternOptions {
  filePattern?: string
}

export function createFilePattern(
  name: string | string[],
  options: FilePatternOptions = {},
): string {
  const { filePattern = '{,/index}' } = options
  const namePattern = Array.isArray(name) ? `{${name.join(',')}}` : name
  return `${BASE_PATTERN}${namePattern}${filePattern}.${EXT_PATTERN}`
}

export async function emitFile(outDir: string, emittedFile: EmittedFile): Promise<void> {
  const { file, content } = emittedFile
  const { base, dir } = parse(file)
  const destDir = `${outDir}/${dir}`
  console.log(join(destDir, base))
  await mkdir(destDir, { recursive: true })
  await writeFile(
    join(destDir, base),
    isObject(content) ? JSON.stringify(content, null, 2) : content,
    'utf-8',
  )
}
