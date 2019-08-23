import config from 'community/config'

const {apiHost} = config

let API = {}

// edit by XuMengPeng
API.groupMessages = {
    url: `${apiHost}/wechats/{uin}/chat_rooms/{chatroom_name}/messages`,
    type: 'GET'
}
export default API
