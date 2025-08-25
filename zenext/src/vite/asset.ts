import { parse } from 'node:path'

export type AssetType = 'content' | 'background' | 'page'
export type AssetName = 'content' | 'background' | PageName
export type PageName = 'popup' | 'side-panel'

export interface AssetDefinition {
  type: AssetType
  patterns: string[]
}

export type Asset =
  | AssetBase<'content', 'content'>
  | AssetBase<'background', 'background'>
  | AssetBase<'page', PageName>

type AssetBase<Type extends AssetType, Name extends string> = {
  type: Type
  name: Name
  sourceFile: string
  outputFile: string
}

const PREFIX = '{,src/}'
const EXTS = '{ts,tsx}'

export const ASSETS_DEFINITIONS: AssetDefinition[] = [
  {
    type: 'content',
    patterns: [`${PREFIX}content{,/index,/*}.${EXTS}`],
  },
  {
    type: 'background',
    patterns: [`${PREFIX}background{,/index}.${EXTS}`],
  },
  {
    type: 'page',
    patterns: [`${PREFIX}{popup,side-panel}{,/index}.${EXTS}`],
  },
] as const

export function createAsset(sourceFile: string): Asset {
  const { name: filename, dir } = parse(sourceFile)
  const type = getAssetType(filename, dir)
  const name = getAssetName(filename, dir)
  const outputFile = sourceFile.replace(/\.tsx?$/, '.js')

  return { type, name, sourceFile, outputFile } as Asset
}

function getAssetType(name: string, dir: string): AssetType {
  if (dir.endsWith('content') || name === 'content') return 'content'
  if (dir.endsWith('background') || name === 'background') return 'background'
  return 'page'
}

function getAssetName(name: string, dir: string): AssetName {
  return (name !== 'index' ? name : (dir.split('/').at(-1) ?? 'unknown')) as AssetName
}
