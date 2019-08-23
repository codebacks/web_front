import request from '../utils/request'
import qs from 'qs'
import Helper from '../utils/helper'
import API from 'crm/common/api/wechats'


export async function query(payload) {
    return request(`${Helper.format(API.LIST.url)}?${qs.stringify(payload)}`)
}

export async function result(payload) {
    return request(`${Helper.format(API.RESULT.url)}?${qs.stringify(payload.params)}`)
}

export async function login(payload) {
    return request(`${Helper.format(API.LOGIN.url)}?${qs.stringify(payload.params)}`)
}

export async function friends(payload) {
    return request(`${Helper.format(API.FRIENDS.url)}?${qs.stringify(payload.params)}`)
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

export async function remove(params) {
    return request(Helper.format(API.DELETE.url, {id: params.id}), {
        method: API.DELETE.type,
        body: params,
    })
}

export async function update(payload) {
    return request(Helper.format(API.UPDATE.url, {id: payload.username}), {
        method: API.UPDATE.type,
        body: payload.body
    })
}