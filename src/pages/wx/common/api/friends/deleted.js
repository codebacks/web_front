import config from 'wx/config'

const {apiHost} = config

let API = {}

API.list = {
    url: `${apiHost}/wechats/friends/delete_log`,
    type: 'GET'
}

export default API