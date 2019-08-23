import config from 'wx/config'

const {apiHost} = config

let API = {}

API.list = {
    url: `${apiHost}/cloud_control/media`,
    type: 'GET'
}

API.create = {
    url: `${apiHost}/cloud_control/media`,
    type: 'POST'
}

API.remove = {
    url: `${apiHost}/cloud_control/media/{id}`,
    type: 'DELETE'
}


API.detail = {
    url: `${apiHost}/cloud_control/media/{id}`,
    type: 'GET'
}

export default API
