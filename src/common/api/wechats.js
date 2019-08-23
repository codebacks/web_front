'use strict'

/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: 1625 [zhanghedong@gmail.com]
 * 创建日期 16/10/6
 *
 */
import config from 'config'
import base from './base'

let API = base('wechats')

const {apiHost} = config

API.all = {
    url: `${apiHost}/api/wechats/all`,
    type: 'GET'
}

API.summary = {
    url: `${apiHost}/api/wechats/summary`,
    type: 'GET'
}

API.part = {
    url: `${apiHost}/api/wechats/part`,
    type: 'GET'
}

API.group = {
    url: `${apiHost}/api/wechats/grouping`,
    type: 'GET'
}

API.friends = {
    url: apiHost + '/api/wechats/friends',
    type: 'GET'
}

// API.LOGIN = {
//     url: apiHost + '/api/wechats/login',
//     type: 'GET'
// }
//
// API.QRCODE = {
//     url: apiHost + '/api/wechats/qrcode',
//     type: 'GET'
// }
//
// API.RESULT = {
//     url: apiHost + '/api/wechats/result',
//     type: 'GET'
// }
//

//
// API.SESSIONS = {
//     url: apiHost + '/api/wechats/sessions',
//     type: 'GET'
// }

// API.MESSAGES_HISTORY = {
//     url: apiHost + '/api/stats/messages',
//     type: 'GET'
// }
//
// API.MESSAGES = {
//     url: apiHost + '/api/wechats/{uin}/messages',
//     type: 'GET'
// }
// API.STAT = {
//     url: apiHost + '/api/wechats/stat',
//     type: 'GET'
// }
// API.SWITCH_USER = {
//     url: apiHost + '/api/wechats/switch_user',
//     type: 'PUT'
// }
// API.WECHATS_BY_COMPANY = {
//     url: apiHost + '/api/wechats/by_company',
//     type: 'GET'
// }
// API.MESSAGES_BY_UIN = {
//     url: apiHost + '/api/wechats/{uin}/messages',
//     type: 'GET'
// }
// API.GROUP_LIST = {
//     url: `${apiHost}/api/wechats/chat_rooms`,
//     type: 'GET'
// }
// API.UPDATE_GROUP = {
//     url: `${apiHost}/api/wechats/{uin}/chat_rooms/{username}`,
//     type: 'PUT'
// }
export default API
