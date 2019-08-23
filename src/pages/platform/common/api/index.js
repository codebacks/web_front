/**
 **@Description:
 **@author: leo
 */

import config from 'platform/config'

export default {
    querySiderMenu: {
        url: `${config.apiHost}/querySiderMenu`,
        type: 'GET',
    },
    create: {
        url: `${config.apiHost}/create`,
        type: 'POST',
    },
    tableList: {
        url: `${config.apiHost}/api/shops`,
        type: 'get',
    },
}