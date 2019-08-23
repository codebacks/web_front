import config from 'crm/config'

const {apiHost} = config

let API = {}

API.list = {
    url: `${apiHost}/add_fans/histories`,
    type: 'GET',
}

export default API
