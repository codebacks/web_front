import request from 'crm/utils/request'
import Helper from 'crm/utils/helper'
import API from 'crm/common/api/store'
import qs from 'qs'

export async function query(params) {
    return request(`${Helper.format(API.LIST.url)}?${qs.stringify(params)}`)
}

export async function create(params) {
    return request(API.CREATE.url, {
        method: API.CREATE.type,
        body: params
    })
}

export async function modify(params) {
    return request(Helper.format(API.UPDATE.url, {id: params.id}), {
        method: API.UPDATE.type,
        body: params
    })
}

