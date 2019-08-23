import config from 'community/config'

const {apiHost} = config

let API = {}

API.list = {
    url: `${apiHost}/wechats/chat_rooms/manage_keyword`,
    type: 'GET'
}

export default API