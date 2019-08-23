import request from '../utils/request'
import Helper from '../utils/helper'
import API from '../common/api/atuoSendMessage'
import {stringify} from 'qs'

export async function autoSendList(params) {
    return request(`${API.autoSendList.url}?${stringify(params)}`)
}
export async function getAutoSend(params) {
    return request(Helper.format(API.getAutoSend.url,{id:params.id}))
}

export async function postAutoSend(params) {
    return request(Helper.format(API.postAutoSend.url,{id:params.id}), {
        method: API.postAutoSend.type,
        body: params
    })
}

export async function postAutoSendRules(params) {
    return request(API.postAutoSendRules.url, {
        method: API.postAutoSendRules.type,
        body: params
    })
}

export async function deleteAutoSend(params) {
    return request(Helper.format(API.deleteAutoSend.url,{id:params.id}), {
        method: API.deleteAutoSend.type
    })
}

export async function getAutoSendRules() {
    return request(API.getAutoSendRules.url)
}

export async function putAutoSendRules(params) {
    return request(Helper.format(API.putAutoSendRules.url,{id:params.id}), {
        method: API.putAutoSendRules.type,
        body: params
    })
}

export async function putOpenAutoSend(params) {
    return request(Helper.format(API.putOpenAutoSend.url,{id:params.id}), {
        method: API.putOpenAutoSend.type,
        body: params
    })
}
