import type { Plugin } from 'vite'
import { State } from './lib/state'
import { build, core, dev, manifest, runtime } from './plugins'

export function neext(): Plugin[] {
  const state = new State()
  return [core(state), manifest(state), build(state), runtime(state), dev(state)]
}
