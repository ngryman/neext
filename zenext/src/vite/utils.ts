import { concat, isArray, mergeWith } from 'lodash-es'

export function mergeConcat<Object, Source>(value: Object, srcValue: Source): Object & Source {
  return mergeWith(value, srcValue, (value, srcValue) =>
    isArray(value) ? concat(value, srcValue) : undefined,
  )
}
