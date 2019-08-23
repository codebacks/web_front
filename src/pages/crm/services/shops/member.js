import request from 'crm/utils/request'
import Helper from 'crm/utils/helper'
import API from 'crm/common/api/member'
import qs from 'qs'

export async function query(params) {
    return request(`${Helper.format(API.LIST.url)}?${qs.stringify(params)}`)
}

export async function modify(payload) {
    return request(Helper.format(API.UPDATE.url, {id: payload.id}), {
        method: API.UPDATE.type,
        body: payload.body
    })
}
