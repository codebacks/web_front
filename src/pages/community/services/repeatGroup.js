import request from 'community/utils/request'
import API from 'community/common/api/repeatGroup'
import {format} from 'utils'
import qs from 'qs'

export async function query(params) {
    return request(`${format(API.query.url)}?${qs.stringify(params)}`)
}

export async function queryStatistics() {
    return request(`${API.queryStatistics.url}`)
}


export async function whitelistAdd(payload) {
    return request(`${API.whitelistAdd.url}`, {
        method: API.whitelistAdd.type,
        body: payload.body
    })
}

export async function queryRepeatGroup(payload) {
    return request(format(API.queryRepeatGroup.url, {wx_id: payload.wx_id}))
}

export async function clearRepeatGroup(payload) {
    return request(format(API.clearRepeatGroup.url, {wx_id: payload.wx_id}), {
        method: API.clearRepeatGroup.type,
        body: payload.body,
    })
}

export async function addBlackList(payload) {
    return request(`${format(API.addBlackList.url)}`, {
        method: API.addBlackList.type,
        body: payload.body,
    })
}

