export function assert(condition: unknown, message: string): asserts condition {
  const passes = Boolean(condition)

  const isProd = import.meta.env?.PROD ?? process?.env.NODE_ENV === 'production'

  if (!isProd && !passes) {
    throw new Error(`Assert: ${message}`)
  } else {
    console.assert(Boolean(condition), 'Assert:', message, new Error().stack?.replace('Error', ''))
  }
}
