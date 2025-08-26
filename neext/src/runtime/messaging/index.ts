import { Broker } from './broker'
import type { EventListener, MessageHandler, Target } from './types'

export type * from './types'
export * from './utils'

let broker: Broker

export async function sendMessage<R = unknown, D = unknown>(
  type: string,
  data: D,
  target: Target = 'background',
): Promise<R> {
  return await getBroker().sendMessage<D, R>(type, data, target)
}

export async function sendEvent<D = unknown>(type: string, data: D, target: Target = 'background') {
  return await getBroker().sendEvent<D>(type, data, target)
}

export function addMessageHandler<R = unknown, D = unknown>(
  type: string,
  handler: MessageHandler<D, R>,
) {
  return getBroker().addMessageHandler(type, handler)
}

export function addEventListener<D = unknown>(type: string, listener: EventListener<D>) {
  return getBroker().addMessageListener(type, listener)
}

export function removeMessageListener<D = unknown>(type: string, listener: EventListener<D>) {
  return getBroker().removeMessageListener(type, listener)
}

export function removeEventTarget(target: Target) {
  return getBroker().removeEventTarget(target)
}

function getBroker() {
  broker ||= new Broker()
  return broker
}
