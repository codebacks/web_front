import request from 'wx/utils/request'
import qs from 'qs'
import Helper from 'wx/utils/helper'
import API from 'wx/common/api/friends/friends'

export async function list(payload) {
    return request(API.list.url, {
        method: API.list.type,
        body: payload.body
    })
}

export async function detail(payload) {
    return request(`${Helper.format(API.detail.url, {
        uin: payload.uin,
        username: payload.username
    })}`)
}

export async function customerDetail(payload) {
    return request(`${Helper.format(API.customerDetail.url, {id: payload.id})}`)
}

export async function exportTask(payload) {
    return request(API.exportTask.url, {
        method: API.exportTask.type,
        body: payload.body
    })
}

export async function exportStatus(payload) {
    return request(Helper.format(API.exportStatus.url, {task_id: payload.taskId}), null, {
        returnResponse: true
    })
}

export async function getDivideOptions(params) {
    return request(`${API.getDivideOptions.url}?${qs.stringify(params)}`)
}

export async function setDivide(payload) {
    return request(`${Helper.format(API.setDivide.url, {group_id: payload.id})}`,{
        method: API.setDivide.type,
        body: payload.body
    })
}

// 检查是否有群发次数
export async function checkMass() {
    return request(API.checkMass.url)
}