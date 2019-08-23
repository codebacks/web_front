import request from 'data/utils/request'
import Helper from 'data/utils/helper'
import API from 'data/common/api/transfer'
import qs from 'qs'

export async function query(params) {
    return request(`${Helper.format(API.list.url)}?${qs.stringify(params)}`)
}
export async function queryStats(params) {
    return request(`${Helper.format(API.stats.url)}?${qs.stringify(params)}`)
}

export async function modify(payload) {
    return request(Helper.format(API.update.url, {id: payload.id}), {
        method: API.update.type,
        body: payload.body
    })
}
export async function bindOrder(payload) {
    return request(Helper.format(API.bind_order.url, {id: payload.id}), {
        method: API.bind_order.type,
        body: payload.body
    })
}
