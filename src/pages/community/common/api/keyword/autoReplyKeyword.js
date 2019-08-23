import config from 'community/config'

const {apiHost} = config

let API = {}

API.query = {
    url: `${apiHost}/stats/chatroom/auto_reply`,
    type: 'GET'
}

export default API