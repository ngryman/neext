import { type ParsedPath, parse } from 'node:path'
import type { Visitor } from '@babel/traverse'
import type { HmrContext, ModuleNode } from 'vite'
import type { ManifestPatch } from './manifest'

export type AssetType = 'content' | 'background' | 'page' | 'portal'
export type AssetName = 'content' | 'background' | PageName
export type PageName = 'popup' | 'side-panel'

export interface AssetDefinition {
  type: AssetType
  pattern: string
  manifestPatch: (asset: Asset) => ManifestPatch
  emittedFiles: (asset: Asset, baseUrl: string) => EmittedFile[]
  handleHotUpdate?: (
    ctx: HmrContext,
  ) => Array<ModuleNode> | void | Promise<Array<ModuleNode>> | Promise<void>
  visitor?: AssetVisitor
}
export type AssetVisitor = (mode: string) => Visitor

export type Asset = BackgroundAsset | ContentAsset | PageAsset
export type BackgroundAsset = AssetBase<'background', 'background'>
export type ContentAsset = AssetBase<'content', string>
export type PageAsset = AssetBase<'page', PageName>
export type PortalAsset = AssetBase<'portal', string>

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
  const file = parse(sourceFile)
  const name = getAssetName(file)
  const outputFile = sourceFile.replace(/\.tsx?$/, '.js')

  return { type: definition.type, name, sourceFile, outputFile, definition } as Asset
}

function getAssetName(file: ParsedPath): AssetName {
  const { name, dir } = file
  return (name !== 'index' ? name : (dir.split('/').at(-1) ?? 'unknown')) as AssetName
}
