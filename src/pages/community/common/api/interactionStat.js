import config from 'community/config'

const {apiHost} = config

let API = {}

API.interactionStat = {
    url: `${apiHost}/stats/chatroom_message`,
    type: 'GET',
}

API.queryByGroupStat = {
    url: `${apiHost}/stats/chatroom_message/chatroom`,
    type: 'GET',
}

API.queryGroupMemberStat = {
    url: `${apiHost}/stats/chatroom_message/chatroom/{chatroomname}`,
    type: 'GET',
}

API.exportExcel = {
    url: `${apiHost}/stats/chatroom_message/chatroom/export`,
    type: 'GET',
}

export default API