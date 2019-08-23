'use strict'

/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: 1625 [zhanghedong@gmail.com]
 * 创建日期 16/10/6
 *
 */
import config from 'crm/config'
import base from './base'

const {apiHost} = config

let API = base('wechats')

API.LOGIN = {
    url: apiHost + '/wechats/login',
    type: 'GET'
}

API.QRCODE = {
    url: apiHost + '/wechats/qrcode',
    type: 'GET'
}

API.RESULT = {
    url: apiHost + '/wechats/result',
    type: 'GET'
}

API.FRIENDS = {
    url: apiHost + '/wechats/friends',
    type: 'GET'
}

API.SESSIONS = {
    url: apiHost + '/wechats/sessions',
    type: 'GET'
}

API.MESSAGES_HISTORY = {
    url: apiHost + '/stats/messages',
    type: 'GET'
}

API.MESSAGES = {
    url: apiHost + '/wechats/{uin}/messages',
    type: 'GET'
}
API.STAT = {
    url: apiHost + '/wechats/stat',
    type: 'GET'
}
API.SWITCH_USER = {
    url: apiHost + '/wechats/switch_user',
    type: 'PUT'
}
API.WECHATS_BY_COMPANY = {
    url: apiHost + '/wechats/by_company',
    type: 'GET'
}
API.MESSAGES_BY_UIN = {
    url: apiHost + '/wechats/{uin}/messages',
    type: 'GET'
}
API.GROUP_LIST = {
    url: `${apiHost}/wechats/chat_rooms`,
    type: 'GET'
}
API.UPDATE_GROUP = {
    url: `${apiHost}/wechats/{uin}/chat_rooms/{username}`,
    type: 'PUT'
}
export default API
