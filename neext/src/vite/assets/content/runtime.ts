import { sendMessage } from '@/sdk'

window.NEEXT_APP_TAB_ID = await sendMessage('neext:get-tab-id', {})
