import request from 'utils/request'
import qs from 'qs'
import Helper from 'utils/helper'
import API from 'common/api/messages'

export async function messages(payload) {
    return request(`${Helper.format(API.messages.url, {uin: payload.from_uin})}?${qs.stringify(payload)}`)
}

export async function wxTalkersDetail(payload = {}) {
    return request(`${Helper.format(API.wxTalkersDetail.url, {uin: payload.uin, username: payload.username})}`)
}

// 语音转换
export async function voiceConvert(payload) {
    return request(API.voiceConvert.url, {
        method: API.voiceConvert.type,
        body: payload.body,
    })
}

export async function unload(params) {
    return request(`${API.unload.url}?${qs.stringify(params)}`)
}

// 群成员列表
export async function groupMembers(payload) {
    return request(`${Helper.format(API.groupMembers.url, {uin: payload.fromUin, username: payload.toUsername})}`)
}
