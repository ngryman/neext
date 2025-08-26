export type Target = 'background' | 'side-panel' | 'popup' | number

export type MessageHandler<D = unknown, R = unknown> = (message: Message<D>) => R | Promise<R>
export type EventListener<D = unknown> = (message: Message<D>) => void | Promise<void>

export type Message<D = unknown> = {
  id: number
  type: string
  target: Target
  sender: Target | 'external'
  data: D
  time: number
}

export type Response<D = unknown> = {
  id: number
  data?: D
  error?: string
}
