import qs from 'qs'
import request from 'community/utils/request'
import Helper from 'community/utils/helper'
import API from 'community/common/api/groupMemberRepeat'
import {format} from "utils"

export async function query(params) {
    return request(`${API.query.url}?${qs.stringify(params)}`)
}

export async function queryDetail(payload) {
    return request(format(API.queryDetail.url, {chatroomname: payload.chatroomname}))
}

export async function clear(payload) {
    return request(format(API.clear.url, {chatroomname: payload.chatroomname}), {
        method: API.clear.type,
        body: payload.body,
    })
}
