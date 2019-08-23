import config from 'community/config'

const {apiHost} = config

const api = {
    chatroomCommonsSettings: {
        url: `${apiHost}/wechats/chat_rooms/chatroom_commons_settings`,
        type: 'GET',
    },
    chatroomCommonsSetStatus: {
        url: `${apiHost}/wechats/chat_rooms/chatroom_commons_settings/status`,
        type: 'POST',
    },
}

export default api
