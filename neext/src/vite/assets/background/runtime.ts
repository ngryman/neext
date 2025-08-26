import { addMessageHandler } from '@/sdk'

addMessageHandler('neext:get-tab-id', ({ sender }) => sender)
