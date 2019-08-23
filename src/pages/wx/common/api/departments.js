/**
 **@Description:
 **@author: leo
 */

import config from 'wx/config'
import base from "./base"

const api = base('departments')

api.tree = {
    url: `${config.apiHost}/departments/tree`,
    type: 'GET',
}

api.move = {
    url: `${config.apiHost}/departments/move`,
    type: 'POST',
}

export default api