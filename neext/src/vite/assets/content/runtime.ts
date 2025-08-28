/// <reference path="./runtime.d.ts" />

import { sendMessage } from 'neext/sdk'

window.NEEXT_APP_TAB_ID = await sendMessage('neext:get-tab-id', {})
