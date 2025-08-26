import { sendMessage } from '@/sdk'

window.NEEXT_APP_TAB_ID = await sendMessage('neext:get-tab-id', {})
console.log('NEEXT_APP_TAB_ID', window.NEEXT_APP_TAB_ID)
