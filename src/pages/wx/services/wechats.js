import request from 'wx/utils/request'
import qs from 'qs'
import Helper from 'wx/utils/helper'
import API from 'wx/common/api/wechats'

export async function query(payload) {
    return request(`${Helper.format(API.LIST.url)}?${qs.stringify(payload)}`)
}

export async function getAllUsers(payload) {
    return request(`${Helper.format(API.getAllUsers.url)}?${qs.stringify(payload)}`)
}

export async function settingAutoReplyTemplates(payload) {
    return request(`${Helper.format(API.settingAutoReplyTemplates.url)}?${qs.stringify(payload)}`)
}

export async function authNumber(payload) {
    return request(`${Helper.format(API.authNumber.url)}?${qs.stringify(payload)}`)
}

export async function result(payload) {
    return request(`${Helper.format(API.RESULT.url)}?${qs.stringify(payload.params)}`, null, {
        returnResponse: true
    })
}

export async function login(payload) {
    return request(`${Helper.format(API.LOGIN.url)}?${qs.stringify(payload.params)}`)
}

export async function sessions(payload) {
    return request(`${Helper.format(API.SESSIONS.url)}?${qs.stringify(payload)}`)
}

export async function stat(payload) {
    return request(`${Helper.format(API.STAT.url)}?${qs.stringify(payload)}`)
}

export async function messages(payload) {
    return request(`${Helper.format(API.MESSAGES.url, {uin: payload.from_uin})}?${qs.stringify(payload)}`)
}

// edit by XuMengPeng
export async function groupSessions(payload) {
    return request(`${Helper.format(API.GROUP_SESSIONS.url)}?${qs.stringify(payload)}`)
}

// edit by XuMengPeng
export async function groupMessages(payload) {
    const payloadTemp = {...payload}
    delete payloadTemp.uin
    delete payloadTemp.username
    return request(`${Helper.format(API.GOURP_MESSAGES.url, {
        uin: payload.uin,
        chatroom_name: payload.username,
    })}?${qs.stringify(payloadTemp)}`)
    // return request(`${Helper.format(API.GOURP_MESSAGES.url, {uin: '1101962069', chatroom_name: '4849676046@chatroom'})}?${qs.stringify(payloadTemp)}`)
}

export async function remove(payload) {
    return request(Helper.format(API.remove.url, {uin: payload.uin}), {
        method: API.remove.type,
        body: payload.body
    })
}

export async function switchUser(params) {
    return request(Helper.format(API.SWITCH_USER.url), {
        method: API.SWITCH_USER.type,
        body: params.body,
    })
}

export async function update(payload) {
    return request(Helper.format(API.UPDATE.url, {id: payload.username}), {
        method: API.UPDATE.type,
        body: payload.body,
    })
}

export async function queryHistory(params) {
    return request(`${Helper.format(API.MESSAGES_HISTORY.url)}?${qs.stringify(params)}`)
}

export async function notifications(payload) {
    return request(Helper.format(API.NOTIFICATIONS.url), {
        method: API.NOTIFICATIONS.type,
        body: payload.body,
    })
}

export async function exportTask(payload) {
    return request(`${API.exportTask.url}?${qs.stringify(payload.params)}`)
}

export async function exportExcel(payload) {
    return request(Helper.format(API.exportExcel.url, {task_id: payload.taskId}), null, {
        returnResponse: true,
    })
}

export async function batchSwitchUser(payload) {
    return request(Helper.format(API.batchSwitchUser.url), {
        method: API.batchSwitchUser.type,
        body: payload.body,
    })
}

export async function batchSetReplyConfig(payload) {
    return request(Helper.format(API.batchSetReplyConfig.url), {
        method: API.batchSetReplyConfig.type,
        body: payload.body,
    })
}

export async function getWechatDivideOptions(params) {
    return request(`${API.getWechatDivideOptions.url}?${qs.stringify(params)}`)
}

export async function setWechatDivide(payload) {
    return request(`${Helper.format(API.setWechatDivide.url, {group_id: payload.id})}`,{
        method: API.setWechatDivide.type,
        body: payload.body
    })
}
