import qs from 'qs'
import request from 'community/utils/request'
import Helper from 'community/utils/helper'
import API from 'community/common/api/autoPull'

export async function getGroupDivideOptions() {
    return request(`${API.getGroupDivideOptions.url}`)
}
export async function queryAutoPull(params) {
    return request(`${API.queryAutoPull.url}?${qs.stringify(params)}`)
}
export async function setAutoPull(payload) {
    return request(Helper.format(API.setAutoPull.url, {
        uin: payload.uin,
    }), {
        method: API.setAutoPull.type,
        body: payload.body,
    })
}
export async function deteleAutoPull(payload) {
    return request(Helper.format(API.deteleAutoPull.url), {
        method: API.deteleAutoPull.type,
        body: payload.body,
    })
}
export async function addKeyword(payload) {
    return request(Helper.format(API.addKeyword.url, {uin: payload.uin,}), {
        method: API.addKeyword.type,
        body: payload.body,
    })
}
export async function removeKeyword(payload) {
    return request(Helper.format(API.removeKeyword.url, {uin: payload.uin,}), {
        method: API.removeKeyword.type,
        body: payload.body,
    })
}

export async function queryAutoPullModal(params, uin) {
    return request(`${Helper.format(API.queryAutoPullModal.url, {
        uin: uin,
    })}?${qs.stringify(params)}`)
}
export async function updateAutoPullModalItem(payload) {
    return request(Helper.format(API.updateAutoPullModalItem.url, {
        uin: payload.uin,
        chatroom_name: payload.chatroom_name,
    }), {
        method: API.updateAutoPullModalItem.type,
        body: payload.body,
    })
}

export async function queryAddWechatModal(params) {
    return request(`${Helper.format(API.queryAddWechatModal.url)}?${qs.stringify(params)}`)
}
export async function setAddWechatModal(payload) {
    return request(Helper.format(API.setAddWechatModal.url), {
        method: API.setAddWechatModal.type,
        body: payload.body,
    })
}

export async function queryAutoPullRecord(params) {
    return request(`${API.queryAutoPullRecord.url}?${qs.stringify(params)}`)
}
export async function autoPullRecordStatistics() {
    return request(API.autoPullRecordStatistics.url)
}