/**
 **@Description:
 **@author: leo
 */

import config from 'setting/config'
import base from "./base"

const api = base('api/departments')

api.tree = {
    url: `${config.apiHost}/api/departments/tree`,
    type: 'GET',
}

api.move = {
    url: `${config.apiHost}/api/departments/move`,
    type: 'POST',
}

export default api