import { getCurrentTarget } from './messaging'

interface Logger {
  info: (message: string, ...args: unknown[]) => void
  warn: (message: string, ...args: unknown[]) => void
  error: (message: string, ...args: unknown[]) => void
  debug: (message: string, ...args: unknown[]) => void
}

export function createLogger(source: string): Logger {
  if (import.meta.env.TEST) {
    const noop = () => {}
    return { info: noop, warn: noop, error: noop, debug: noop }
  }

  const target = getCurrentTarget()

  const info = (message: string, ...args: unknown[]): void => {
    console.info(
      `\x1B[97;104;1m info \x1B[97;100;1m ${target} \x1B[30;0;1m ${source}\x1B[m ${message}`,
      ...args,
    )
  }

  const warn = (message: string, ...args: unknown[]): void => {
    console.warn(
      `\x1B[97;43;1m warn \x1B[97;100;1m ${target} \x1B[30;0;1m ${source}\x1B[m ${message}`,
      ...args,
    )
  }

  const error = (message: string, ...args: unknown[]): void => {
    console.error(
      `\x1B[97;101;1m error \x1B[97;100;1m ${target} \x1B[30;0;1m ${source}\x1B[m ${message}`,
      ...args,
    )
  }

  const debug = (message: string, ...args: unknown[]): void => {
    console.debug(
      `\x1B[97;47;1m debug \x1B[97;100;1m ${target} \x1B[30;0;1m ${source}\x1B[m ${message}`,
      ...args,
    )
  }

  return { info, warn, error, debug }
}
