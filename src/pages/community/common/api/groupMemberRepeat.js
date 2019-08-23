import config from 'community/config'

const {apiHost} = config

let API = {}

API.query = {
    url: `${apiHost}/wechats/chatroom/repetition/staff`,
    type: 'GET',
}

API.queryDetail = {
    url: `${apiHost}/wechats/chatroom/repetition/staff/{chatroomname}`,
    type: 'GET',
}

API.clear = {
    url: `${apiHost}/wechats/chatroom/repetition/staff/{chatroomname}/clean`,
    type: 'PUT'
}

export default API
