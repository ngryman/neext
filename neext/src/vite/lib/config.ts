import { assert } from '@/utils'
import { isArray, merge } from 'lodash-es'
import type { UserConfig } from 'vite'

export function addEntrypoint(config: UserConfig, name: string, file: string): UserConfig {
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
