/**
 **@Description:
 **@author: leo
 */

import config from 'demo/config'

export default {
    querySiderMenu: {
        url: `${config.apiHost}/querySiderMenu`,
        type: 'GET',
    },
    create: {
        url: `${config.apiHost}/create`,
        type: 'POST',
    },
}