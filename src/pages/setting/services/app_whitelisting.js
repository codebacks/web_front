import {stringify} from 'qs'
import request from 'setting/utils/request'
import {format} from 'utils'
import API from 'setting/common/api/app_whitelisting'

export async function list(params) {
    return request(`${API.list.url}?${stringify(params)}`)
}

export async function check() {
    return request(API.check.url)
}

export async function allow(payload) {
    return request(format(API.allow.url, {on: payload.on}), {
        method: API.allow.type
    })
}

export async function operate(payload) {
    return request(format(API.operate.url, {app_id: payload.appId, status: payload.status}), {
        method: API.operate.type,
    })
}


