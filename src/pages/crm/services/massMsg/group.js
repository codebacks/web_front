import request from 'crm/utils/request'
import Helper from 'crm/utils/helper'
import API from 'crm/common/api/massMsg/group'
import qs from 'qs'

export async function list(params) {
    return request(`${Helper.format(API.LIST.url)}?${qs.stringify(params)}`)
}

export async function filterFriends(params) {
    return request(`${Helper.format(API.filterFriends.url)}`, {
        method: API.filterFriends.type,
        body: params.body,
    })
}

export async function create(body) {
    return request(API.CREATE.url, {
        method: API.CREATE.type,
        body: body,
    })
}

export async function groupDetail(params) {
    return request(Helper.format(API.groupDetail.url, {id: params.id}))
}