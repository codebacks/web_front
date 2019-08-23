import qs from 'qs'
import request from 'crm/utils/request'
import Helper from 'crm/utils/helper'
import API from 'crm/common/api/addFans/initiative'

export async function list(params) {
    return request(`${Helper.format(API.list.url)}?${qs.stringify(params)}`)
}

export async function batchSet(payload) {
    return request(API.batchSet.url, {
        method: API.batchSet.type,
        body: payload.body,
    })
}


