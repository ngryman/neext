import { isNumber, isString } from 'lodash-es'
import { assert } from '../../utils'
import { createLogger } from '../logging'
import type { EventListener, Message, MessageHandler, Response, Target } from './types'
import { getCurrentTarget } from './utils'

export const { debug, error, info, warn } = createLogger('messaging')

export class Broker {
  private readonly currentTarget = getCurrentTarget()
  private readonly handlers: Map<string, MessageHandler> = new Map()
  private readonly listeners: Map<string, Set<EventListener>> = new Map()
  private readonly ports: Map<string, chrome.runtime.Port> = new Map()
  private sequenceNext = 1

  constructor() {
    debug('initialize broker', this.currentTarget)

    this.registerMessageHandlers()
    this.registerPortListener()

    // If the page is restored from a back-forward cache, reconnect the port.
    // This is only necessary for content scripts.
    // https://developer.chrome.com/blog/bfcache-extension-messaging-changes
    if (isNumber(this.currentTarget)) {
      this.handleBfCache()
    }
  }

  public async sendMessage<D, R>(type: string, data: D, target: Target): Promise<R> {
    const message: Message<D> = {
      id: this.sequenceNext++,
      type,
      data,
      target,
      sender: this.currentTarget,
      time: Date.now(),
    }

    debug(`send message ${message.type}`, message)
    const response: Response<R> = await (isString(target)
      ? chrome.runtime.sendMessage(message)
      : chrome.tabs.sendMessage(target, message))

    if (response.error) throw new Error(response.error)
    return response.data as R
  }

  public async sendEvent<D>(type: string, data: D, target: Target) {
    const port = this.getPort(target)

    const message: Message<D> = {
      id: this.sequenceNext++,
      type,
      data,
      target,
      sender: this.currentTarget,
      time: Date.now(),
    }

    debug(`send event ${message.type}`, message.data)
    port.postMessage(message)
  }

  public addMessageHandler<D, R>(type: string, handler: MessageHandler<D, R>) {
    this.handlers.set(type, handler as MessageHandler)
  }

  public addMessageListener<D>(type: string, listener: EventListener<D>) {
    const listeners = this.listeners.get(type) || new Set()
    listeners.add(listener as EventListener)
    this.listeners.set(type, listeners)
  }

  public removeMessageListener<D>(type: string, listener: EventListener<D>) {
    const listeners = this.listeners.get(type)
    if (!listeners) return
    listeners.delete(listener as EventListener)
  }

  public removeEventTarget(target: Target) {
    const name = target.toString()
    const port = this.ports.get(name)
    if (!port) return

    debug(`remove event target ${name}`)
    port.disconnect()
    this.ports.delete(name)
  }

  private getPort(target: Target): chrome.runtime.Port {
    const name = target.toString()

    let port = this.ports.get(name)
    if (port) return port

    debug(`connect port for ${name}`)
    port = isString(target)
      ? chrome.runtime.connect({ name })
      : chrome.tabs.connect(target, { name })
    assert(port, `Failed to connect port for ${target.toString()}`)

    port.onDisconnect.addListener(() => {
      debug(`port ${name} disconnected`)
      this.ports.delete(name)
    })

    this.ports.set(name, port)

    return port
  }

  private registerMessageHandlers() {
    const createHandler =
      (external: boolean) =>
      (message: Message, sender: chrome.runtime.MessageSender, sendResponse: () => void) => {
        if (message.target !== this.currentTarget) return true
        if (external && message.sender !== 'external') return true
        if (!external && message.sender === 'external') return true

        if (sender.tab) {
          message.sender = sender.tab.id as number
        }

        debug(`received message ${message.type}`, message.data || '')
        this.handleMessage(message).then(sendResponse)

        return true
      }

    // Listen for messages from anywhere.
    chrome.runtime.onMessage.addListener(createHandler(false))

    // Listen for messages from external extensions.
    // In content scripts, this is undefined.
    chrome.runtime.onMessageExternal?.addListener(createHandler(true))
  }

  private registerPortListener() {
    const name = this.currentTarget.toString()

    const handler = (port: chrome.runtime.Port) => {
      if (port.name !== name) return

      debug(`registered listener for port ${name}`)
      port.onMessage.addListener(async (message: Message) => {
        debug(`received event ${message.type}`, message)
        await this.handleEvent(message)
      })

      // Keep the port alive by sending a message every 25 seconds.
      // Timeout is 30 seconds.
      const intervalId = setInterval(() => port.postMessage({ type: 'keepalive' }), 25000)
      port.onDisconnect.addListener(() => clearInterval(intervalId))
    }

    chrome.runtime.onConnect.addListener(handler)
  }

  private handleBfCache() {
    window.addEventListener('pageshow', e => {
      if (e.persisted) {
        debug('page was restored from BFCache, reconnecting ports')
        for (const name of this.ports.keys()) {
          const port = chrome.runtime.connect({ name })
          this.ports.set(name, port)
        }
      }
    })

    window.addEventListener('pagehide', event => {
      if (event.persisted) {
        debug('page was cached to BFCache, disconnecting ports')
        for (const port of this.ports.values()) {
          port.disconnect()
        }
      }
    })
  }

  private async handleMessage(message: Message): Promise<Response> {
    const handler = this.handlers.get(message.type)
    if (!handler) return { id: message.id, error: `No handler for message ${message.type}` }

    try {
      const data = await handler(message)
      return { id: message.id, data }
    } catch (err) {
      return { id: message.id, error: (err as Error).message }
    }
  }

  private async handleEvent(message: Message) {
    const listeners = this.listeners.get(message.type) || []

    try {
      await Promise.all(Array.from(listeners).map(listener => listener(message)))
    } catch (err) {
      error((err as Error).message)
    }
  }
}
