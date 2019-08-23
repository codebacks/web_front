'use strict'

import config from 'config'

const {apiHost} = config

let API = {}

API.currentTree = {
    url: `${apiHost}/api/departments/tree/current`,
    type: 'GET'
}

API.tree = {
    url: `${apiHost}/api/departments/tree`,
    type: 'GET'
}

API.export = {
    url: `${apiHost}/api/departments/users/export`,
    type: 'GET'
}
export default API
