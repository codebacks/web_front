import request from 'community/utils/request'
import API from 'community/common/api/actionManage'
import {format} from 'utils'
import qs from 'qs'


export async function queryActionManage(params) {
    return request(`${API.queryActionManage.url}?${qs.stringify(params)}`)
}

export async function setActionManage(payload) {
    return request(API.setActionManage.url, {
        method: API.setActionManage.type,
        body: payload.body,
    })
}

export async function queryViolationRecord(params) {
    return request(`${format(API.queryViolationRecord.url)}?${qs.stringify(params)}`)
}

export async function joinWhiteList(payload) {
    return request(format(API.joinWhiteList.url, {id: payload.id}), {
        method: API.joinWhiteList.type,
        body: payload.body,
    })
}

export async function sendWarning(payload) {
    return request(format(API.sendWarning.url, {id: payload.id}), {
        method: API.sendWarning.type,
        body: payload.body,
    })
}

export async function kickoutGroup(payload) {
    return request(format(API.kickoutGroup.url, {id: payload.id}), {
        method: API.kickoutGroup.type,
        body: payload.body,
    })
}

export async function queryKickRecord(params) {
    return request(`${API.queryKickRecord.url}?${qs.stringify(params)}`)
}

export async function getKickReasonType() {
    return request(`${API.getKickReasonType.url}`)
}

export async function exportExcel(payload) {
    return request(`${API.exportExcel.url}?${qs.stringify(payload?.params)}`, {
        method: API.exportExcel.type,
    }, {
        returnResponse: true
    })
}