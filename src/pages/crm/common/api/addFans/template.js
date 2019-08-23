import config from 'crm/config'

const {apiHost} = config

let API = {}


API.create = {
    url: `${config.apiHost}/add_fans/templates`,
    type: 'POST',
}
API.detail = {
    url: `${config.apiHost}/add_fans/templates/{id}`,
    type: 'GET',
}
API.update = {
    url: `${config.apiHost}/add_fans/templates/{id}`,
    type: 'PUT',
}

API.list = {
    url: `${apiHost}/add_fans/templates`,
    type: 'GET',
}

export default API
