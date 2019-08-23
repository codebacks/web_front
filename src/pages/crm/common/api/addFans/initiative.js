import config from 'crm/config'

const {apiHost} = config

let API = {}

API.list = {
    url: `${apiHost}/add_fans`,
    type: 'GET',
}

API.batchSet = {
    url: `${apiHost}/add_fans/batch_edit`,
    type: 'PUT'
}

export default API
