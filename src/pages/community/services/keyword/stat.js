import qs from 'qs'
import request from 'community/utils/request'
import API from 'community/common/api/keyword/stat'
import Helper from "community/utils/helper"

export async function list(params) {
    return request(`${API.list.url}?${qs.stringify(params)}`)
}

export async function create(payload) {
    return request(API.create.url, {
        method: API.create.type,
        body: payload.body
    })
}

export async function remove(body) {
    return request(Helper.format(API.remove.url, {id: body.id}), {
        method: API.remove.type,
    })
}

export async function summary(payload) {
    return request(`${API.summary.url}?${qs.stringify(payload.params)}`)
}