import config from '../../config'

const {apiHost} = config

let API = {}

API.messages = {
    url: `${apiHost}/api/wechats/{uin}/messages`,
    type: 'GET'
}

// 好友原始消息
API.rawMessages = {
    url: `${apiHost}/api/wechats/{uin}/friends/{username}/raw_messages`,
    type: 'GET'
}

// 搜索好友消息
API.searchMessages = {
    url: `${apiHost}/api/wechats/{uin}/messages/search`,
    type: 'GET'
}

// 语音转换
API.voiceConvert = {
    url: `${apiHost}/api/im/files/convert`,
    type: 'POST'
}

// 文件load
API.unload = {
    url: `${apiHost}/api/im/files/unload`,
    type: 'GET'
}

// 群聊原始消息
API.groupRawMessages = {
    url: `${apiHost}/api/wechats/{uin}/chat_rooms/{username}/raw_messages`,
    type: 'GET'
}

// 搜索群聊消息
API.groupSearchMessages = {
    url: `${apiHost}/api/wechats/{uin}/chat_room_messages/search`,
    type: 'GET'
}

// 群成员列表
API.groupMembers = {
    url: `${apiHost}/api/wechats/{uin}/chat_rooms/{username}`,
    type: 'GET'
}

API.wxTalkersDetail = {
    url: `${apiHost}/api/wechats/{uin}/friends/{username}/talkers_detail`,
    type: 'GET'
}


export default API
