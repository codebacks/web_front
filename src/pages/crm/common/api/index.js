/**
 **@Description:
 **@author: leo
 */

import config from 'crm/config'

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