import request from 'data/utils/request'
import Helper from 'data/utils/helper'
import API from 'data/common/api/store'
import qs from 'qs'

export async function query(params) {
    return request(`${Helper.format(API.list.url)}?${qs.stringify(params)}`)
}

export async function create(params) {
    return request(API.create.url, {
        method: API.create.type,
        body: params
    })
}

export async function modify(params) {
    return request(Helper.format(API.update.url, {id: params.id}), {
        method: API.update.type,
        body: params
    })
}

