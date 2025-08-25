import { parse } from 'node:path'
import type { Rollup } from 'vite'
import type { ManifestPatch } from './manifest'

export type AssetType = 'content' | 'background' | 'page'
export type AssetName = 'content' | 'background' | PageName
export type PageName = 'popup' | 'side-panel'

export interface AssetDefinition {
  type: AssetType
  patterns: string[]
  manifestPatch: (asset: Asset) => ManifestPatch
  emittedFiles: (asset: Asset, baseUrl: string) => EmittedFile[]
  transform?: (
    code: string,
    id: string,
    mode: string,
  ) => Rollup.TransformResult | Promise<Rollup.TransformResult>
}

export type Asset = BackgroundAsset | ContentAsset | PageAsset
export type BackgroundAsset = AssetBase<'background', 'background'>
export type ContentAsset = AssetBase<'content', string>
export type PageAsset = AssetBase<'page', PageName>

type AssetBase<Type extends AssetType, Name extends string> = {
  type: Type
  name: Name
  sourceFile: string
  outputFile: string
  definition: AssetDefinition
}

export interface EmittedFile {
  file: string
  content: string
}

export function createAsset(definition: AssetDefinition, sourceFile: string): Asset {
  const { name: filename, dir } = parse(sourceFile)
  const type = getAssetType(filename, dir)
  const name = getAssetName(filename, dir)
  const outputFile = sourceFile.replace(/\.tsx?$/, '.js')

  return { type, name, sourceFile, outputFile, definition } as Asset
}

function getAssetType(name: string, dir: string): AssetType {
  if (dir.endsWith('content') || name === 'content') return 'content'
  if (dir.endsWith('background') || name === 'background') return 'background'
  return 'page'
}

function getAssetName(name: string, dir: string): AssetName {
  return (name !== 'index' ? name : (dir.split('/').at(-1) ?? 'unknown')) as AssetName
}
