import request from 'wx/utils/request'
import Helper from 'wx/utils/helper'
import API from 'wx/common/api/material/moments'
import qs from 'qs'

export async function list(params) {
    return request(`${API.list.url}?${qs.stringify(params)}`)
}

export async function create(payload) {
    return request(API.create.url, {
        method: API.create.type,
        body: payload.body
    })
}

export async function remove(payload) {
    return request(`${Helper.format(API.remove.url, {id: payload.id})}`, {
        method: API.remove.type,
    })
}

export async function detail(payload) {
    return request(`${Helper.format(API.detail.url, {id: payload.id})}`)
}








