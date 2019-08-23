'use strict'

/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: 1625 [zhanghedong@gmail.com]
 * 创建日期 16/10/6
 *
 */
import config from 'wx/config'
import base from './base'

const {apiHost} = config

let API = base('wechats')

API.authNumber = {
    url: apiHost + '/wechats/auth_number',
    type: 'GET'
}

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

API.SESSIONS = {
    url: apiHost + '/wechats/sessions',
    type: 'GET'
}

// edit by XuMengPeng
API.GROUP_SESSIONS = {
    url: apiHost + '/wechats/chat_rooms/sessions',
    type: 'GET'
}

// edit by XuMengPeng
API.GOURP_MESSAGES = {
    url: apiHost + '/wechats/{uin}/chat_rooms/{chatroom_name}/messages',
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

API.MESSAGES_BY_UIN = {
    url: apiHost + '/wechats/{uin}/messages',
    type: 'GET'
}

API.NOTIFICATIONS = {
    url: `${apiHost}/im/notifications`,
    type: 'POST'
}

API.weChatExport = {
    url : `${apiHost}/wechats/wechat_excel_export`,
    type: 'GET'
}

API.remove = {
    url: `${apiHost}/wechats/{uin}`,
    type: 'DELETE'
}

API.exportTask = {
    url: `${apiHost}/wechats/friends/export`,
    type: 'GET'
}

API.exportExcel = {
    url: `${apiHost}/wechats/friends/export/status/{task_id}`,
    type: 'GET'
}

// edit by XuMengPeng
API.GET_WECHAT_AUTO_PULL = {
    url : `${apiHost}/setting_auto_group/uin/{uin}`,
    type: 'GET'
}

// edit by XuMengPeng
API.SET_WECHAT_AUTO_PULL = {
    url : `${apiHost}/setting_auto_group/uin/{uin}`,
    type: 'POST'
}

// edit by XuMengPeng
API.UPDATE_WECHAT_AUTO_PULL_ITEM = {
    url : `${apiHost}/setting_auto_group/uin/{uin}/chatroom/{chatroom_name}`,
    type: 'POST'
}

API.getWechatDivideOptions = {
    url: `${apiHost}/wechats/grouping`,
    type: 'GET'
}

API.setWechatDivide = {
    url: `${apiHost}/wechats/grouping/{group_id}`,
    type: 'POST'
}

API.batchSwitchUser = {
    url : `${apiHost}/wechats/batch/switch_user`,
    type: 'PUT'
}

API.batchSetReplyConfig = {
    url : `${apiHost}/setting_auto_reply_v2/batch_set_reply_config`,
    type: 'POST'
}

API.settingAutoReplyTemplates = {
    url : `${apiHost}/setting_auto_reply_v2/templates`,
    type: 'GET'
}

API.getAllUsers = {
    url : `${apiHost}/wechats/by_user`,
    type: 'GET'
}

export default API
