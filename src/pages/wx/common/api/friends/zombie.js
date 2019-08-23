import config from 'wx/config'

const {apiHost} = config

let API = {}

API.list = {
    url: `${apiHost}/wechats/friends/zombies`,
    type: 'GET'
}

API.batchRemove = {
    url: `${apiHost}/wechats/friends/{reason}`,
    type: 'DELETE'
}


export default API