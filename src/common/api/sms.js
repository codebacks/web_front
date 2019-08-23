/**
 **@Description:
 **@author: leo
 */

import config from 'config'
// import base from "./base"

const api = {
    sentSms: {
        url: `${config.apiHost}/api/sms/code`,
        type: 'POST',
    },
    captcha: {
        url: `${config.apiHost}/api/captcha`,
        type: 'GET',
    },
}

export default api