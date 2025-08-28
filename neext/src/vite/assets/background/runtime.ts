import { addMessageHandler } from 'neext/sdk'

addMessageHandler('neext:get-tab-id', ({ sender }) => sender)
