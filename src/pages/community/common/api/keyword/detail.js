import config from 'community/config'

const {apiHost} = config

let API = {}

API.list = {
    url: `${apiHost}/wechats/chat_rooms/keyword/{row_id}/detail`,
    type: 'GET'
}

export default API