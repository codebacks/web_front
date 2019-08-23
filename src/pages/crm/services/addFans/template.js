import qs from 'qs'
import request from 'crm/utils/request'
import Helper from 'crm/utils/helper'
import API from 'crm/common/api/addFans/template'

export async function create(payload) {
    return request(API.create.url, {
        method: API.create.type,
        body: payload.body,
    })
}

export async function detail(payload) {
    return request(Helper.format(API.detail.url, {id: payload.id}))
}

export async function update(payload) {
    return request(Helper.format(API.update.url, {id: payload.id}), {
        method: API.update.type,
        body: payload.body,
    })
}

export async function list(params) {
    return request(`${Helper.format(API.list.url)}?${qs.stringify(params)}`)
}





