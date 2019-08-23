import request from 'wx/utils/request'
import qs from 'qs'
import Helper from 'wx/utils/helper'
import API from 'wx/common/api/friends/zombie'

export async function list(params) {
    return request(`${API.list.url}?${qs.stringify(params)}`)
}

export async function batchRemove(payload) {
    return request(`${Helper.format(API.batchRemove.url, {reason: payload.reason})}`,{
        method: API.batchRemove.type,
        body: payload.body
    })
}