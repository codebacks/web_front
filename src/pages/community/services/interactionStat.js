import qs from 'qs'
import request from 'community/utils/request'
import Helper from 'community/utils/helper'
import API from 'community/common/api/interactionStat'

export async function queryInteractionStat(params) {
    return request(`${API.interactionStat.url}?${qs.stringify(params)}`)
}

export async function queryByGroupStat(params) {
    return request(`${API.queryByGroupStat.url}?${qs.stringify(params)}`)
}

export async function queryGroupMemberStat(params, payload) {
    return request(`${Helper.format(API.queryGroupMemberStat.url, {chatroomname: payload.chatroomname})}?${qs.stringify(params)}`)
}

export async function exportExcel(payload) {
    return request(`${API.exportExcel.url}?${qs.stringify(payload?.params)}`, {
        method: API.exportExcel.type,
    }, {
        returnResponse: true
    })
}
