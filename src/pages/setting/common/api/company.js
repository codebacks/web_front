/**
 **@Description:
 **@author: leo
 */

import config from 'setting/config'

const api = {
    update : {
        url: `${config.apiHost}/api/company`,
        type: 'PUT',
    },
    detail : {
        url: `${config.apiHost}/api/company`,
        type: 'GET',
    }
}

export default api